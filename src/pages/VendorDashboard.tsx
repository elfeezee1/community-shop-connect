import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Package, TrendingUp, ShoppingBag, Eye, DollarSign, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity_in_stock: number;
  category?: { name: string } | null;
  category_id?: string;
  is_active: boolean;
  images: string[];
}

interface Category {
  id: string;
  name: string;
}

const VendorDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalStock: 0,
    lowStock: 0
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVendorData();
    fetchCategories();
  }, [user, navigate]);

  const fetchVendorData = async () => {
    if (!user) return;

    try {
      // Check if user is a vendor
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

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (
            name
          )
        `)
        .eq('vendor_id', vendorData.id);

      if (productsError) throw productsError;
      
      const products = productsData || [];
      setProducts(products);
      
      // Calculate analytics
      setAnalytics({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalStock: products.reduce((sum, p) => sum + p.quantity_in_stock, 0),
        lowStock: products.filter(p => p.quantity_in_stock <= 5).length
      });
    } catch (error: any) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor data",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchVendorData();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!"
      });

      fetchVendorData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Vendor Dashboard
              </h1>
              {vendor && (
                <p className="text-muted-foreground">
                  Welcome back, {vendor.business_name}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-sm">
              {vendor?.is_verified ? 'Verified Vendor' : 'Pending Verification'}
            </Badge>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-card transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{analytics.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-card transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{analytics.activeProducts}</p>
                  <p className="text-xs text-muted-foreground">Active Products</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{analytics.totalStock}</p>
                  <p className="text-xs text-muted-foreground">Total Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{analytics.lowStock}</p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Management Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Your Products</h2>
              <p className="text-sm text-muted-foreground">Manage your product inventory and listings</p>
            </div>
            <Button 
              onClick={() => setShowProductForm(true)} 
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </div>
        </div>

        {/* Product Form */}
        {showProductForm && (
          <div className="mb-6">
            <ProductForm
              product={editingProduct}
              vendor={vendor}
              categories={categories}
              onSuccess={handleProductFormSuccess}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Start Building Your Store</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Add your first product with images and details to start selling. Make your products stand out with high-quality photos!
              </p>
              <Button onClick={() => setShowProductForm(true)} size="lg" className="px-8">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;