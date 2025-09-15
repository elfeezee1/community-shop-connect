import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Package, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity_in_stock: number;
  category: { name: string };
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
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity_in_stock: '',
    category_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      setProducts(productsData || []);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} must be less than 5MB`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit to 5 images total
    const totalImages = uploadedImages.length + validFiles.length;
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images per product",
        variant: "destructive"
      });
      return;
    }

    setUploadedImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setImagePreviewUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (productId: string) => {
    const imageUrls: string[] = [];
    
    for (let i = 0; i < uploadedImages.length; i++) {
      const file = uploadedImages[i];
      const fileName = `${productId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`${vendor.id}/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      imageUrls.push(urlData.publicUrl);
    }
    
    return imageUrls;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setLoading(true);
    try {
      // First create the product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          vendor_id: vendor.id,
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          quantity_in_stock: parseInt(productForm.quantity_in_stock),
          category_id: productForm.category_id || null
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images if any
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        imageUrls = await uploadImages(productData.id);
      }

      // Update product with image URLs
      if (imageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: imageUrls })
          .eq('id', productData.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: "Product added successfully!"
      });

      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: '',
        quantity_in_stock: '',
        category_id: ''
      });
      setUploadedImages([]);
      setImagePreviewUrls([]);
      setShowAddProduct(false);
      fetchVendorData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Vendor Dashboard
          </h1>
          {vendor && (
            <p className="text-muted-foreground">
              Welcome back, {vendor.business_name}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-primary mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-secondary mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {products.filter(p => p.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-foreground">Your Products</h2>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {showAddProduct && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category</Label>
                    <Select value={productForm.category_id} onValueChange={(value) => setProductForm({...productForm, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price (₦)</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-quantity">Quantity in Stock</Label>
                    <Input
                      id="product-quantity"
                      type="number"
                      value={productForm.quantity_in_stock}
                      onChange={(e) => setProductForm({...productForm, quantity_in_stock: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Product Images (Optional)</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadedImages.length >= 5}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Images
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {uploadedImages.length}/5 images • Max 5MB each
                      </span>
                    </div>

                    {imagePreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="shadow-card hover:shadow-lg transition-shadow overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-muted">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className="text-xs bg-white/90">
                      +{product.images.length - 1} more
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">₦{product.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">Stock: {product.quantity_in_stock}</span>
                  </div>
                  
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first product to your store</p>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;