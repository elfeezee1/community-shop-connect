import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVendorRoute = location.pathname.startsWith('/vendor');

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getRedirectPath = () => {
    if (isAdminRoute) return '/admin';
    if (isVendorRoute) return '/vendor-dashboard';
    return '/';
  };

  const getRedirectText = () => {
    if (isAdminRoute) return 'Return to Admin Dashboard';
    if (isVendorRoute) return 'Return to Vendor Dashboard';
    return 'Return to Home';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to={getRedirectPath()} className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              {getRedirectText()}
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <button className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
