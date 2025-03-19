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

// Function to get turbidity description based on quality value
export function getTurbidityDescription(quality: number): string {
  if (quality >= 90) {
    return "Clear";
  } else if (quality >= 80) {
    return "Slightly Cloudy";
  } else if (quality >= 70) {
    return "Cloudy";
  } else if (quality >= 60) {
    return "Very Cloudy";
  } else if (quality >= 50) {
    return "Slightly Dirty";
  } else if (quality >= 40) {
    return "Dirty";
  } else {
    return "Very Dirty";
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

// Function to get recommendation based on turbidity
export function getTurbidityRecommendation(quality: number): string {
  if (quality >= 90) { // Clear
    return "Safe for drinking after basic treatment";
  } else if (quality >= 80) { // Slightly Cloudy
    return "Safe for bathing and laundry, requires filtration for drinking";
  } else if (quality >= 70) { // Cloudy
    return "Suitable for irrigation and non-contact use";
  } else if (quality >= 60) { // Very Cloudy
    return "Suitable for watering non-edible plants, not for consumption";
  } else if (quality >= 50) { // Slightly Dirty
    return "Requires significant treatment before any use";
  } else if (quality >= 40) { // Dirty
    return "Not recommended for household use, limited agricultural applications";
  } else { // Very Dirty
    return "Not suitable for any domestic or agricultural use";
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
    data_source: "simulated"
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
