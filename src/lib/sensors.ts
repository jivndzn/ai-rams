
// Types for our sensor data
export interface SensorData {
  ph: number;
  temperature: number;
  quality: number;
  timestamp: number;
  data_source: string;
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

// Function to get water quality description based on the Arduino's turbidity scale
// In Arduino code: 0% = clear water, 100% = dirty water
export function getQualityDescription(quality: number): string {
  // Align quality description with turbidity levels for consistency
  if (quality >= 90) {
    return "Poor";
  } else if (quality >= 70) {
    return "Fair";
  } else if (quality >= 40) {
    return "Good";
  } else if (quality >= 10) {
    return "Excellent";
  } else {
    return "Pristine";
  }
}

// Function to get turbidity description based on Arduino's quality value
// In Arduino code: 0% = clear water, 100% = dirty water
export function getTurbidityDescription(quality: number): string {
  if (quality >= 90) {
    return "Very Dirty";
  } else if (quality >= 80) {
    return "Dirty";
  } else if (quality >= 70) {
    return "Slightly Dirty";
  } else if (quality >= 60) {
    return "Very Cloudy";
  } else if (quality >= 50) {
    return "Cloudy";
  } else if (quality >= 40) {
    return "Slightly Cloudy";
  } else if (quality >= 10) {
    return "Clear";
  } else {
    return "Crystal Clear";
  }
}

// Function to get water quality color based on Arduino's turbidity scale
// In Arduino code: 0% = clear water, 100% = dirty water
export function getQualityColor(quality: number): string {
  if (quality >= 90) {
    return "bg-gradient-to-r from-red-600 to-red-500";
  } else if (quality >= 80) {
    return "bg-gradient-to-r from-red-500 to-orange-500";
  } else if (quality >= 70) {
    return "bg-gradient-to-r from-orange-500 to-amber-500";
  } else if (quality >= 60) {
    return "bg-gradient-to-r from-amber-500 to-yellow-400";
  } else if (quality >= 50) {
    return "bg-gradient-to-r from-yellow-400 to-teal-400";
  } else if (quality >= 40) {
    return "bg-gradient-to-r from-teal-400 to-teal-500";
  } else {
    return "bg-gradient-to-r from-teal-500 to-cyan-500";
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

// Function to get recommendation based on Arduino's turbidity
// In Arduino code: 0% = clear water, 100% = dirty water
export function getTurbidityRecommendation(quality: number): string {
  // Ensure the recommendation matches the quality level
  if (quality >= 90) { // Very Dirty
    return "Not suitable for any domestic or agricultural use";
  } else if (quality >= 80) { // Dirty
    return "Not recommended for household use, limited agricultural applications";
  } else if (quality >= 70) { // Slightly Dirty
    return "Requires significant treatment before any use";
  } else if (quality >= 60) { // Very Cloudy
    return "Suitable for watering non-edible plants, not for consumption";
  } else if (quality >= 50) { // Cloudy
    return "Suitable for irrigation and non-contact use";
  } else if (quality >= 40) { // Slightly Cloudy
    return "Safe for bathing and laundry, requires filtration for drinking";
  } else if (quality >= 10) { // Clear
    return "Safe for drinking after basic treatment";
  } else { // Crystal Clear
    return "Safe for all domestic uses with minimal treatment";
  }
}

// Function to simulate sensor readings (for research demonstration)
export function simulateSensorReading(): SensorData {
  // Random pH between 5.0 and 9.0
  const ph = 5.0 + Math.random() * 4.0;
  
  // Random temperature between 15°C and 30°C
  const temperature = 15 + Math.random() * 15;
  
  // Random quality between 30 and 95 - higher values represent dirtier water in Arduino
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
      quality: 40 + Math.random() * 50, // Higher values represent dirtier water in Arduino
      timestamp: now - (hours - i) * hourInMs,
      data_source: "simulated"
    });
  }
  
  return data;
}
