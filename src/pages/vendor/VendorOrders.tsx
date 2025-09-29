import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, User, Clock, DollarSign, MapPin, CheckCircle, XCircle, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  delivery_address: string;
  delivery_phone: string;
  notes: string;
  payment_method: string;
  profiles: {
    username: string;
    phone_number: string;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      id: string;
      name: string;
      images: string[];
    } | null;
  }>;
}

const VendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/vendor/signin');
      return;
    }
    fetchVendorOrders();
  }, [user, navigate]);

  const fetchVendorOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, get vendor data
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        throw vendorError;
      }

      if (!vendorData) {
        navigate('/vendor-signup');
        return;
      }

      setVendor(vendorData);

      // Fetch orders for this vendor
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_customer_id_fkey (
            username,
            phone_number
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              id,
              name,
              images
            )
          )
        `)
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders((ordersData as any) || []);
    } catch (error: any) {
      console.error('Error fetching vendor orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully!"
      });

      fetchVendorOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variant = status === 'paid' ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Management
          </h1>
          {vendor && (
            <p className="text-muted-foreground">
              Manage orders for {vendor.business_name}
            </p>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  When customers place orders for your products, they will appear here for you to manage.
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="hover:shadow-card transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(order.order_status)}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </Badge>
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Customer:</span>
                        <span className="ml-1">{order.profiles?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Address:</span>
                        <span className="ml-1">{order.delivery_address}</span>
                      </div>
                      {order.delivery_phone && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Phone:</span>
                          <span className="ml-1">{order.delivery_phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Ordered:</span>
                        <span className="ml-1">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Total:</span>
                        <span className="ml-1 font-semibold">₦{order.total_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Payment:</span>
                        <span className="ml-1">{order.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items Ordered:</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.products?.images?.[0] && (
                              <img 
                                src={item.products.images[0]} 
                                alt={item.products.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.products?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ₦{item.unit_price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">₦{item.total_price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Customer Notes:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      {order.order_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept Order
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel Order
                          </Button>
                        </>
                      )}
                      {order.order_status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="flex items-center"
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Mark as Shipped
                        </Button>
                      )}
                      {order.order_status === 'shipped' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorOrders;