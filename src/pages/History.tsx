
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/dashboard/Header";
import DashboardFooter from "@/components/dashboard/Footer";
import TableView from "@/components/history/TableView";
import CardView from "@/components/history/CardView";
import ExportToCsv from "@/components/history/ExportToCsv";
import { useSensorReadings } from "@/hooks/useSensorReadings";

const History = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  
  const { readings, isLoading, loadHistoricalData } = useSensorReadings(100);
  
  const handleNavigateBack = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-full mx-auto p-4 md:p-6">
        <DashboardHeader />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleNavigateBack} className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Sensor Reading History</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadHistoricalData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ExportToCsv readings={readings} />
          </div>
        </div>
        
        <Tabs defaultValue="table" className="w-full mb-6">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
            <TableView 
              readings={readings}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          </TabsContent>
          
          <TabsContent value="cards" className="mt-4">
            <CardView 
              readings={readings}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />
          </TabsContent>
        </Tabs>
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default History;
