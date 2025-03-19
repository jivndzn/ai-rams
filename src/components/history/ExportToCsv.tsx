
import { SensorReading } from "@/lib/supabase";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportToCsvProps {
  readings: SensorReading[];
}

const ExportToCsv = ({ readings }: ExportToCsvProps) => {
  const exportToCsv = () => {
    if (!readings || !readings.length) {
      toast.error("No data to export");
      return;
    }
    
    try {
      const headers = ["ID", "Timestamp", "pH", "Temperature", "Quality", "Data Source"];
      const csvContent = [
        headers.join(","),
        ...readings.map(reading => [
          reading.id || "N/A",
          reading.created_at || "N/A",
          reading.ph !== undefined ? reading.ph : "N/A",
          reading.temperature !== undefined ? reading.temperature : "N/A",
          reading.quality !== undefined ? reading.quality : "N/A",
          reading.data_source || "N/A"
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `water-quality-data-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={exportToCsv} 
      disabled={!readings || readings.length === 0}
      title={readings && readings.length > 0 ? `Export ${readings.length} records` : "No data to export"}
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
};

export default ExportToCsv;
