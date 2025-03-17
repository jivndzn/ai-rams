
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBox from "@/components/ChatBox";
import { SensorData } from "@/lib/sensors";

interface ChatSectionProps {
  sensorData: SensorData;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ChatSection = ({ sensorData, apiKey, setApiKey }: ChatSectionProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-lg font-medium">AI Research Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <div className="h-full px-4 pb-4">
          <ChatBox 
            sensorData={sensorData} 
            apiKey={apiKey}
            setApiKey={(key) => setApiKey(key)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSection;
