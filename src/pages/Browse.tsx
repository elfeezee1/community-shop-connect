import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, ShoppingCart, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity_in_stock: number;
  images: string[];
  vendor: {
    business_name: string;
    city: string;
    state: string;
  };
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const Browse = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors (
            business_name,
            city,
            state
          ),
          category:categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    await addToCart(productId, 1);
    toast({
      title: "Added to cart",
      description: "Product added to your cart successfully!"
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category?.name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Shop Local Products
          </h1>
          <p className="text-muted-foreground mb-6">
            Discover amazing products from businesses in your community
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search for products, vendors, or categories..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="hero">
              <MapPin className="w-4 h-4 mr-2" />
              Filter by Location
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === "All" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge 
                key={category.id} 
                variant={selectedCategory === category.name ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">No products found</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
              const imageUrl = mainImage ? getImageUrl(mainImage) : null;
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-card transition-all duration-300 group">
                  <div className="aspect-square bg-gradient-subtle relative overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground/40" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-primary">
                      {product.quantity_in_stock} in stock
                    </Badge>
                    {product.images && product.images.length > 1 && (
                      <Badge className="absolute top-3 right-3 bg-white/90 text-foreground">
                        +{product.images.length - 1}
                      </Badge>
                    )}
                  </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {product.category && (
                      <Badge variant="outline" className="text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg text-foreground">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ₦{product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      by <span className="font-medium text-foreground">{product.vendor.business_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.vendor.city}, {product.vendor.state}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.quantity_in_stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.quantity_in_stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Browse;