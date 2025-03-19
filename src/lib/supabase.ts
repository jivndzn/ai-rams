
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Types for our sensor data
export type SensorData = {
  temperature: number;
  ph: number;
  quality: number;
};

// Types for our database table
export type SensorReading = {
  id?: number;
  created_at?: string;
  ph?: number;    // For lowercase column name
  pH?: number;    // For uppercase column name (from Python script)
  temperature: number;
  quality: number;
  data_source: string;
};

// Create a Supabase client with credentials
const supabaseUrl = 'https://exkuzazecthqeoogpsfn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a3V6YXplY3RocWVvb2dwc2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyOTIzOTUsImV4cCI6MjA1Nzg2ODM5NX0.f8-TBMIsFDv773uNzRNxycJyVgZY4vIRANLxsol0y5Y';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Saves sensor data to Supabase
 * @param data Sensor data to save
 * @param source Source of the data (e.g., "arduino_uno" or "simulated")
 * @returns Promise with the result of the operation
 */
export async function saveSensorReading(
  data: SensorData,
  source: string = "web_app"
): Promise<boolean> {
  try {
    // Log the data we're about to save
    console.log("Saving sensor data:", { ...data, source });

    const { error } = await supabase
      .from('sensor_readings')
      .insert({
        ph: data.ph,  // This will use lowercase 'ph'
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
    toast.success("Sensor data saved");
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
    console.log("Fetching sensor readings with limit:", limit);
    
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

    console.log("Received data from Supabase:", data);
    
    // Process data to ensure ph values are accessible
    const processedData = data?.map(reading => {
      // Handle both lowercase 'ph' and uppercase 'pH' cases
      if (reading.pH !== undefined && reading.ph === undefined) {
        return { ...reading, ph: reading.pH };
      }
      return reading;
    }) || [];

    return processedData;
  } catch (err) {
    console.error("Exception fetching sensor data from Supabase:", err);
    toast.error("Failed to fetch sensor data", {
      description: err instanceof Error ? err.message : "Unknown error"
    });
    return [];
  }
}

/**
 * Gets the average values from the latest readings
 * @param limit Number of readings to use for average (default: 10)
 * @returns Promise with average values
 */
export async function getAverageSensorReadings(
  limit: number = 10
): Promise<{ avgTemp: number; avgPh: number; avgQuality: number }> {
  try {
    const readings = await getLatestSensorReadings(limit);
    
    if (readings.length === 0) {
      return { avgTemp: 0, avgPh: 0, avgQuality: 0 };
    }
    
    const avgTemp = readings.reduce((sum, reading) => sum + reading.temperature, 0) / readings.length;
    
    // Handle both ph and pH
    const avgPh = readings.reduce((sum, reading) => {
      const phValue = reading.ph !== undefined ? reading.ph : (reading.pH !== undefined ? reading.pH : 0);
      return sum + phValue;
    }, 0) / readings.length;
    
    const avgQuality = readings.reduce((sum, reading) => sum + reading.quality, 0) / readings.length;
    
    return {
      avgTemp: parseFloat(avgTemp.toFixed(2)),
      avgPh: parseFloat(avgPh.toFixed(2)),
      avgQuality: parseFloat(avgQuality.toFixed(2))
    };
  } catch (err) {
    console.error("Exception calculating average sensor data:", err);
    return { avgTemp: 0, avgPh: 0, avgQuality: 0 };
  }
}
