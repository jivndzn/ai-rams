
// Types for our sensor data
export interface SensorData {
  ph: number;
  temperature: number;
  quality: number;
  timestamp: number;
  data_source?: string;
}

// Function to determine water use recommendation based on pH
export function getWaterUseRecommendation(ph: number): string {
  if (ph >= 6.5 && ph <= 8.5) {
    return "Domestic Household Use";
  } else if ((ph >= 5.5 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) {
    return "Plant Irrigation";
  } else {
    return "Non-potable Applications";
  }
}

// Function to get water quality description
export function getQualityDescription(quality: number): string {
  if (quality >= 80) {
    return "Excellent";
  } else if (quality >= 60) {
    return "Good";
  } else if (quality >= 40) {
    return "Fair";
  } else {
    return "Poor";
  }
}

// Function to get water quality color
export function getQualityColor(quality: number): string {
  if (quality >= 80) {
    return "bg-teal-500";
  } else if (quality >= 60) {
    return "bg-teal-400";
  } else if (quality >= 40) {
    return "bg-yellow-400";
  } else {
    return "bg-red-500";
  }
}

// Function to get pH status color
export function getPhColor(ph: number): string {
  if (ph >= 6.5 && ph <= 8.5) {
    return "bg-teal-500";
  } else if ((ph >= 5.5 && ph < 6.5) || (ph > 8.5 && ph <= 9.5)) {
    return "bg-yellow-400";
  } else {
    return "bg-red-500";
  }
}

// Function to simulate sensor readings (for research demonstration)
export function simulateSensorReading(): SensorData {
  // Random pH between 5.0 and 9.0
  const ph = 5.0 + Math.random() * 4.0;
  
  // Random temperature between 15°C and 30°C
  const temperature = 15 + Math.random() * 15;
  
  // Random quality between 30 and 95
  const quality = 30 + Math.random() * 65;
  
  return {
    ph,
    temperature,
    quality,
    timestamp: Date.now(),
  };
}

// Function to get historical data (simulated for research purposes)
export function getHistoricalData(hours: number = 24): SensorData[] {
  const data: SensorData[] = [];
  const now = Date.now();
  const hourInMs = 3600 * 1000;
  
  for (let i = 0; i < hours; i++) {
    data.push({
      ph: 6.0 + Math.random() * 2.5,
      temperature: 18 + Math.random() * 10,
      quality: 40 + Math.random() * 50,
      timestamp: now - (hours - i) * hourInMs,
    });
  }
  
  return data;
}
