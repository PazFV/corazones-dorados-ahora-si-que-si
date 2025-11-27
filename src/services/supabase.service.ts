
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PirSensorData } from '../models/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://nkfhburtmexhnltxhkyu.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZmhidXJ0bWV4aG5sdHhoa3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTMyMDIsImV4cCI6MjA3OTU2OTIwMn0.kHSkKtfeBzyOgRAgumTXhPsVZAXv7hM4eLWeK0aWbCg';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async fetchSensorData(): Promise<PirSensorData[]> {
    const { data, error } = await this.supabase
      .from('pir_sensor_data')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data as PirSensorData[];
  }
}
