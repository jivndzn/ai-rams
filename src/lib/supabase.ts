
import { createClient } from '@supabase/supabase-js';
import { SensorData } from './sensors';
import { toast } from 'sonner';

// Types for our database tables
export type SensorReading = {
  id?: number;
  created_at?: string;
  ph: number;
  temperature: number;
  quality: number;
  data_source: string;
};

// Create a Supabase client with hardcoded credentials
const supabaseUrl = 'https://exkuzazecthqeoogpsfn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a3V6YXplY3RocWVvb2dwc2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyOTIzOTUsImV4cCI6MjA1Nzg2ODM5NX0.f8-TBMIsFDv773uNzRNxycJyVgZY4vIRANLxsol0y5Y';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Saves sensor data to Supabase
 * @param data Sensor data to save
 * @param source Source of the data (e.g., "arduino" or "simulated")
 * @returns Promise with the result of the operation
 */
export async function saveSensorReading(
  data: SensorData,
  source: "arduino" | "simulated"
): Promise<boolean> {
  try {
    // Only save real data from Arduino
    if (source !== "arduino") {
      console.log("Skipping saving simulated data to Supabase");
      return false;
    }

    const { error } = await supabase
      .from('sensor_readings')
      .insert({
        ph: data.ph,
        temperature: data.temperature,
        quality: data.quality,
        data_source: source
      });

    if (error) {
      console.error("Error saving sensor data to Supabase:", error);
      toast.error("Failed to save sensor data", {
        description: error.message
      });
      return false;
    }

    console.log("Sensor data saved to Supabase successfully");
    return true;
  } catch (err) {
    console.error("Exception saving sensor data to Supabase:", err);
    toast.error("Failed to save sensor data", {
      description: err instanceof Error ? err.message : "Unknown error"
    });
    return false;
  }
}

/**
 * Fetches the latest sensor readings from Supabase
 * @param limit Number of readings to fetch (default: 24)
 * @returns Promise with array of sensor readings
 */
export async function getLatestSensorReadings(
  limit: number = 24
): Promise<SensorReading[]> {
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching sensor data from Supabase:", error);
      toast.error("Failed to fetch sensor data", {
        description: error.message
      });
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception fetching sensor data from Supabase:", err);
    toast.error("Failed to fetch sensor data", {
      description: err instanceof Error ? err.message : "Unknown error"
    });
    return [];
  }
}
