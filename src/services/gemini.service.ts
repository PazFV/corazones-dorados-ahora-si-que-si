
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { PirSensorData } from '../models/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    // The API key is managed by the environment as per requirements.
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateDailyReport(data: PirSensorData): Promise<string> {
    if (!process.env.API_KEY) {
      return Promise.reject("API key for Gemini is not configured.");
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
      throw new Error('Failed to generate report from Gemini API.');
    }
  }
}
