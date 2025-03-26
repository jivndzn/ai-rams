AI-RAMS: Resourceful AI-Integrated Management System
Overview
AI-RAMS (Resourceful AI-Integrated Management System) is an intelligent rainwater monitoring and analysis system designed to optimize water usage by combining rainwater harvesting with real-time pH monitoring. The system ensures water quality and efficiency for domestic, agricultural, and industrial applications using AI-driven insights.

Key Features
Real-time Monitoring: Tracks pH levels, temperature, and water quality via Arduino sensors.

AI-Powered Recommendations: Provides actionable insights for optimal water usage (e.g., domestic, irrigation, non-potable).

Data Visualization: Interactive dashboard with historical trends and live sensor data.

User-Friendly Interface: Web application built with ReactJS, TypeScript, and Vite.

Cloud Integration: Stores and retrieves data using Supabase for scalability.

Technologies Used
Hardware: Arduino Uno, pH sensors, temperature sensors.

Software:

Backend: Python (data processing), Supabase (database).

Frontend: ReactJS, TypeScript, Vite.

AI: Gemini API for natural language processing and recommendations.

Standards Compliance: Adheres to ISO/IEC 22989 (AI), ISO 14001 (environmental management), and ISO 5667-1 (water sampling).

Installation
Prerequisites
Node.js (v16+)

Python (v3.8+)

Arduino IDE (for hardware setup)

Supabase account (for database)

Steps
Clone the Repository:

bash
Copy
git clone https://github.com/your-repo/AI-RAMS.git
cd AI-RAMS
Backend Setup:

Install Python dependencies:

bash
Copy
pip install requests pytz pyserial
Configure sensors_readings.py with your Supabase URL and API key.

Frontend Setup:

Install dependencies:

bash
Copy
cd frontend
npm install
Configure environment variables (e.g., Gemini API key) in .env.

Hardware Setup:

Connect Arduino Uno with pH and temperature sensors.

Upload the provided Arduino script (contact authors for full code).

Run the System:

Start the Python script for sensor data collection:

bash
Copy
python sensors_readings.py
Launch the frontend:

bash
Copy
npm run dev
Usage
Dashboard: View real-time pH, temperature, and water quality metrics.

AI Assistant: Chat with the AI for usage recommendations (e.g., "Is this water safe for plants?").

History: Analyze historical data with filters and export options.

Hardware: Ensure sensors are calibrated and connected for accurate readings.

Project Structure
Copy
AI-RAMS/
├── backend/            # Python scripts for sensor data processing
├── frontend/           # ReactJS web application
│   ├── src/            # Source code for UI components
│   ├── public/         # Static assets
│   └── ...             
├── hardware/           # Arduino schematics and code (contact authors)
├── docs/               # Project documentation (e.g., thesis, manuals)
└── README.md           # This file
Contributors
John Ivan D. Dizon (GitHub)

Barlo R. Ordiales (GitHub)

Mark Lorenz Y. Manalese (GitHub)

License
This project is proprietary. For inquiries, contact jivandizon@gmail.com.

Acknowledgments
Special thanks to Holy Angel University and our adviser, Engr. Eugene Erwin Baltazar, for their guidance.
Supported by ISO standards for AI, environmental management, and water quality.
