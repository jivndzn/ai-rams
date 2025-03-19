
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SensorReading } from "@/lib/supabase";
import TableView from "./TableView";
import CardView from "./CardView";

interface HistoryTabsProps {
  filteredReadings: SensorReading[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const HistoryTabs = ({ 
  filteredReadings, 
  isLoading, 
  currentPage, 
  setCurrentPage, 
  itemsPerPage 
}: HistoryTabsProps) => {
  return (
    <Tabs defaultValue="table" className="w-full mb-6">
      <TabsList className="w-full sm:w-auto mb-2 sm:mb-0">
        <TabsTrigger value="table" className="flex-1 sm:flex-initial">Table View</TabsTrigger>
        <TabsTrigger value="cards" className="flex-1 sm:flex-initial">Card View</TabsTrigger>
      </TabsList>
      
      <TabsContent value="table" className="mt-4">
        <TableView 
          readings={filteredReadings}
          isLoading={isLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </TabsContent>
      
      <TabsContent value="cards" className="mt-4">
        <CardView 
          readings={filteredReadings}
          isLoading={isLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </TabsContent>
    </Tabs>
  );
};

export default HistoryTabs;
