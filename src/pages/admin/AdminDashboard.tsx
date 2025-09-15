import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface Analytics {
  total_users: number;
  active_vendors: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_vendors: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase.rpc(
        'get_admin_analytics'
      );
      
      if (analyticsError) throw analyticsError;
      
      if (analyticsData && analyticsData.length > 0) {
        setAnalytics(analyticsData[0]);
      }

      // Fetch recent orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_customer_id_fkey (username),
          vendors (business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;
      setRecentOrders(ordersData || []);

      // Fetch pending vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (vendorsError) throw vendorsError;
      setPendingVendors(vendorsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: analytics?.total_users || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Vendors",
      value: analytics?.active_vendors || 0,
      icon: Store,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Products",
      value: analytics?.total_products || 0,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Orders",
      value: analytics?.total_orders || 0,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Revenue",
      value: `₦${(analytics?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Pending Vendors",
      value: analytics?.pending_vendors || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-card transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent orders</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        by {order.profiles?.username || 'Unknown'} • {order.vendors?.business_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{order.total_amount.toLocaleString()}</p>
                      <Badge variant={order.order_status === 'pending' ? 'secondary' : 'default'}>
                        {order.order_status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Pending Vendor Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingVendors.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending approvals</p>
              ) : (
                pendingVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{vendor.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.city}, {vendor.state}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      Pending Review
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}