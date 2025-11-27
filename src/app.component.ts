
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';
import { GeminiService } from './services/gemini.service';
import { PirSensorData } from './models/sensor-data.model';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MapComponent]
})
export class AppComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private geminiService = inject(GeminiService);

  title = 'Corazones Dorados';
  sensorData = signal<PirSensorData[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  reports = signal<{[patientId: string]: { report: string; isLoading: boolean } }>({});

  async ngOnInit() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await this.supabaseService.fetchSensorData();
      this.sensorData.set(data);
    } catch (e) {
      console.error(e);
      this.error.set('No se pudo cargar la información. Por favor, intente de nuevo más tarde.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async generateReport(patient: PirSensorData) {
    if (!patient) return;
    
    this.reports.update(currentReports => ({
        ...currentReports,
        [patient.patientid]: { report: '', isLoading: true }
    }));

    try {
      const generatedReport = await this.geminiService.generateDailyReport(patient);
      this.reports.update(currentReports => ({
        ...currentReports,
        [patient.patientid]: { report: generatedReport, isLoading: false }
      }));
    } catch (e) {
      console.error('Error generating report:', e);
      const errorMessage = 'Hubo un error al generar el informe. Inténtelo de nuevo.';
      this.reports.update(currentReports => ({
        ...currentReports,
        [patient.patientid]: { report: errorMessage, isLoading: false }
      }));
    }
  }

  getPatientReport(patientId: string): string {
    return this.reports()[patientId]?.report || '';
  }

  isReportLoading(patientId: string): boolean {
    return this.reports()[patientId]?.isLoading || false;
  }
}
