import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Processing</h1>
        <p className="mb-4 text-xl text-muted-foreground">Heading back to Login..</p>
        <button 
          onClick={() => logout()} 
          className="text-primary underline hover:text-primary/90 bg-transparent border-0 cursor-pointer text-lg font-medium"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
