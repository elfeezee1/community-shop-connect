import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Store, MapPin, Phone, Mail, CheckCircle, XCircle, Eye } from "lucide-react";

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  profiles?: {
    username: string;
  } | null;
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    let filtered = vendors;

    if (searchQuery) {
      filtered = filtered.filter(vendor =>
        vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "verified") {
        filtered = filtered.filter(vendor => vendor.is_verified);
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(vendor => !vendor.is_verified);
      } else if (statusFilter === "active") {
        filtered = filtered.filter(vendor => vendor.is_active);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(vendor => !vendor.is_active);
      }
    }

    setFilteredVendors(filtered);
  }, [vendors, searchQuery, statusFilter]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles!vendors_user_id_fkey (username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data as unknown as Vendor[] || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, field: 'is_verified' | 'is_active', value: boolean) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ [field]: value })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(vendors.map(vendor => 
        vendor.id === vendorId ? { ...vendor, [field]: value } : vendor
      ));

      const actionText = field === 'is_verified' 
        ? (value ? 'verified' : 'unverified') 
        : (value ? 'activated' : 'deactivated');

      toast({
        title: "Success",
        description: `Vendor ${actionText} successfully`,
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (vendor: Vendor) => {
    if (!vendor.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (vendor.is_verified) {
      return <Badge variant="default">Verified</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading vendors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Store className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
            <p className="text-muted-foreground">Approve and manage vendor applications</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {vendors.length} Total Vendors
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vendors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <div className="grid gap-6">
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Vendors Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "No vendor applications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-card transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{vendor.business_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Owner: {vendor.profiles?.username || 'Unknown'}
                        </p>
                      </div>
                      {getStatusBadge(vendor)}
                    </div>
                    
                    {vendor.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">{vendor.description}</p>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      {vendor.contact_email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          {vendor.contact_email}
                        </div>
                      )}
                      {vendor.contact_phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          {vendor.contact_phone}
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {vendor.city}, {vendor.state}
                      </div>
                      <div className="text-muted-foreground">
                        Applied: {new Date(vendor.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                    {!vendor.is_verified && (
                      <Button
                        size="sm"
                        onClick={() => updateVendorStatus(vendor.id, 'is_verified', true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    
                    {vendor.is_verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateVendorStatus(vendor.id, 'is_verified', false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant={vendor.is_active ? "destructive" : "default"}
                      onClick={() => updateVendorStatus(vendor.id, 'is_active', !vendor.is_active)}
                    >
                      {vendor.is_active ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}