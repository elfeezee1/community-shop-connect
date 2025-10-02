import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, MapPin, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  order_status: string;
  delivery_address: string;
  delivery_phone: string;
  notes: string | null;
  created_at: string;
  vendor: {
    business_name: string;
    city: string;
    state: string;
  };
  order_items: OrderItem[];
}

const CustomerOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(business_name, city, state),
          order_items(
            *,
            product:products(name, images)
          )
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'paid' ? 'bg-green-500' : 'bg-yellow-500';
  };

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

        {loading ? (
          <Card>
            <CardContent className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        Order #{order.id.substring(0, 8)}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {order.vendor.business_name}
                        </div>
                        {order.delivery_phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {order.delivery_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(order.order_status)}>
                        {order.order_status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-subtle rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img 
                                src={`https://vhcmvtdjiwedznjyuxcs.supabase.co/storage/v1/object/public/product-images/${item.product.images[0]}`}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₦{item.unit_price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{item.total_price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Delivery Address:</p>
                        <p className="font-medium">{order.delivery_address}</p>
                        {order.notes && (
                          <>
                            <p className="text-muted-foreground mt-2 mb-1">Notes:</p>
                            <p className="text-sm">{order.notes}</p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-sm mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          ₦{order.total_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          via {order.payment_method}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;