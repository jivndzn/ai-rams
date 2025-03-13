
const DashboardFooter = () => {
  return (
    <footer className="mt-8 text-center text-sm text-muted-foreground">
      <p>AquaBot Rainwater Analysis System • Data updates every 30 seconds</p>
      <p className="mt-1">Powered by Gemini AI • {new Date().getFullYear()}</p>
    </footer>
  );
};

export default DashboardFooter;
