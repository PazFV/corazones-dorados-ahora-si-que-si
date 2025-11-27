import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { PirSensorData } from '../models/sensor-data.model';

// This allows TypeScript to compile even though `process` isn't a standard browser global.
declare const process: any;

/**
 * Safely retrieves the Gemini API key from environment variables.
 * This function is wrapped in a try-catch block to prevent runtime errors
 * in browser environments where `process` is not defined.
 * @returns The API key as a string, or undefined if not found or an error occurs.
 */
function getApiKey(): string | undefined {
  try {
    // This check prevents ReferenceError: process is not defined
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    return undefined;
  } catch (error) {
    console.warn('Could not access process.env.API_KEY. This is expected in a browser environment without a bundler polyfill.', error);
    return undefined;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI | undefined;

  constructor() {
    const apiKey = getApiKey();

    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey: apiKey });
    } else {
      console.warn("Gemini API key not found. Report generation will be unavailable.");
    }
  }

  async generateDailyReport(data: PirSensorData): Promise<string> {
    if (!this.genAI) {
      throw new Error("El servicio de Gemini no está inicializado. La clave API puede que no esté configurada.");
    }
    
    let movementHistoryArray: string[] = [];
    try {
      movementHistoryArray = JSON.parse(data.movementhistory);
    } catch (e) {
      console.error("Could not parse movement history", e);
      movementHistoryArray = ['Dato no disponible'];
    }

    const prompt = `
      Actúa como un asistente de cuidado de ancianos cariñoso y profesional.
      Basado en los siguientes datos de sensores para el paciente "${data.patientid}", genera un breve informe (2-3 frases) que sea amigable, positivo y tranquilizador para su familia.
      No uses un tono alarmista a menos que se haya detectado una caída.
      El informe debe estar en español.

      Datos del día:
      - Pasos diarios: ${data.dailystepcount}
      - Niveles de actividad registrados: ${movementHistoryArray.join(', ')}
      - ¿Se detectó una caída?: ${data.falldetected ? 'Sí' : 'No'}
      - Última ubicación registrada: ${data.currentroom}

      Ejemplo de respuesta deseada:
      "¡Hola! Solo para informarles que ${data.patientid} ha tenido un día bastante activo hoy. Se ha movido bien por la casa y ha acumulado un buen número de pasos. Todo parece estar en orden y con normalidad. ¡Que tengan una excelente tarde!"
    `;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Fallo al generar el informe desde la API de Gemini.');
    }
  }
}
