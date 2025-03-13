
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Droplet className="h-24 w-24 text-aqua-500" />
            <div className="absolute inset-0 water-quality-gauge overflow-hidden rounded-full">
              <div className="ripple-animation" style={{ left: "50%", top: "50%", width: "40px", height: "40px" }}></div>
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! The water quality data you're looking for couldn't be found</p>
        <Button asChild>
          <a href="/" className="inline-flex items-center">
            Return to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
