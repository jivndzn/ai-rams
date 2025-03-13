
const DashboardFooter = () => {
  return (
    <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
      <p>AI-RAMS: AI-Integrated Rainwater Management System</p>
      <p className="mt-1">A Research Project on Sustainable Water Management</p>
      <p className="mt-4 text-xs">
        © {new Date().getFullYear()} — All research data and methodologies are the 
        intellectual property of the researchers. Prototype demonstration for academic purposes.
      </p>
    </footer>
  );
};

export default DashboardFooter;
