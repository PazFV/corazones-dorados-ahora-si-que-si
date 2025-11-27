
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { PirSensorData } from '../models/sensor-data.model';

// This allows TypeScript to compile even though `process` isn't a standard browser global.
// It's expected to be injected by the runtime environment.
declare const process: any;

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI | undefined;

  constructor() {
    try {
      // Safely access the API key to prevent "process is not defined" errors in the browser.
      const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : undefined;

      if (apiKey) {
        this.genAI = new GoogleGenAI({ apiKey: apiKey });
      } else {
        console.warn("Gemini API key not found. Report generation will be unavailable.");
      }
    } catch (e) {
      console.error("Error initializing Gemini Service:", e);
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
