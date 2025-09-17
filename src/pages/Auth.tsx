import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Store, Shield } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Ecomance
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose how you'd like to join our marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {/* Customer Option */}
          <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/customer/auth')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Customer
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Shop from amazing local vendors
              </p>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/customer/auth')}>
                Continue as Customer
              </Button>
            </CardContent>
          </Card>

          {/* Vendor Option */}
          <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendor/signup')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Vendor
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Sell your products to customers
              </p>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/vendor/signup')}>
                Continue as Vendor
              </Button>
            </CardContent>
          </Card>

          {/* Admin Option */}
          <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/login')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Admin
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Manage the platform
              </p>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/admin/login')}>
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;