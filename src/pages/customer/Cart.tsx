import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Minus, Plus, X, ShoppingBag, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { user } = useAuth();

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Sign in to view your cart
            </h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to see your cart items and make purchases
            </p>
            <Button asChild>
              <Link to="/customer/auth">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading your cart...</div>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to add items to your cart
            </p>
            <Button asChild>
              <Link to="/browse">Continue Shopping</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const mainImage = item.product.images && item.product.images.length > 0 
                  ? item.product.images[0] : null;
                const imageUrl = mainImage ? getImageUrl(mainImage) : null;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gradient-subtle rounded-lg overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <img 
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {item.product.vendor.business_name}
                          </p>
                          <p className="text-lg font-bold text-primary mt-2">
                            ₦{item.product.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                            min="0"
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₦0</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/browse">Continue Shopping</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;