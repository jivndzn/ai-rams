
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
    
    const headers = ["ID", "Timestamp", "pH", "Temperature", "Quality", "Data Source"];
    const csvContent = [
      headers.join(","),
      ...readings.map(reading => [
        reading.id,
        reading.created_at,
        reading.ph,
        reading.temperature,
        reading.quality,
        reading.data_source
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
  };

  return (
    <Button variant="outline" onClick={exportToCsv} disabled={!readings || readings.length === 0}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
};

export default ExportToCsv;
