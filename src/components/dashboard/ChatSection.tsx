
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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">AquaBot Assistant</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <ChatBox 
          sensorData={sensorData} 
          apiKey={apiKey}
          setApiKey={(key) => setApiKey(key)}
        />
      </CardContent>
    </Card>
  );
};

export default ChatSection;
