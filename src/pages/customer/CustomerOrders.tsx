import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, MapPin } from "lucide-react";

const CustomerOrders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No orders yet
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sample order structure for future implementation */}
        <div className="hidden">
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #12345</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    March 15, 2024
                  </div>
                </div>
                <Badge variant="default">Delivered</Badge>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-subtle rounded-lg mr-4"></div>
                    <div>
                      <h4 className="font-medium">Product Name</h4>
                      <p className="text-sm text-muted-foreground">by Vendor Name</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        Lagos, Nigeria
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦15,000</p>
                    <p className="text-sm text-muted-foreground">Qty: 2</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CustomerOrders;