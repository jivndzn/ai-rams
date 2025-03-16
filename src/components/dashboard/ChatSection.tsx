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
    <Card className="h-full max-w-screen-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">AI Research Assistant</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about water quality analysis and sustainable usage
        </p>
      </CardHeader>
      <CardContent className="h-[calc(100%-5.5rem)]">
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
