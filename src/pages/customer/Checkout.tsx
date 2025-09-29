import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Truck, Package } from "lucide-react";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be less than 15 digits"),
  address: z.string().trim().min(10, "Address must be at least 10 characters").max(500, "Address must be less than 500 characters"),
  city: z.string().trim().min(1, "City is required").max(100, "City must be less than 100 characters"),
  state: z.string().trim().min(1, "State is required").max(100, "State must be less than 100 characters"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  useEffect(() => {
    if (!user) {
      navigate("/customer/auth");
      return;
    }
    
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [user, items, navigate]);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    try {
      checkoutSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<typeof formData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof formData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handlePaystackPayment = async (orderData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount: getCartTotal() * 100, // Convert to kobo
          email: formData.email,
          reference: `order_${Date.now()}`,
          orderData
        }
      });

      if (error) throw error;

      // Open Paystack payment page
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCashOnDelivery = async (orderData: any) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      // Clear cart items
      for (const item of items) {
        await supabase
          .from('shopping_cart')
          .delete()
          .eq('user_id', user!.id)
          .eq('product_id', item.product_id);
      }

      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed. We'll contact you to confirm delivery details.",
      });
      navigate("/customer/orders");
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Order Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please fix the errors in the form before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For now, create a single order with all items
      // TODO: Group by vendor when vendor ID is available in cart context
      const orderData = {
        customer_id: user!.id,
        vendor_id: '00000000-0000-0000-0000-000000000000', // Default vendor for now
        total_amount: getCartTotal(),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'paystack' ? 'pending' : 'pending',
        order_status: 'pending',
        delivery_address: `${formData.address}, ${formData.city}, ${formData.state}`,
        delivery_phone: formData.phone,
        notes: formData.notes || null,
      };

      if (paymentMethod === 'paystack') {
        await handlePaystackPayment(orderData);
      } else {
        await handleCashOnDelivery(orderData);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange("phone")}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange("address")}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange("city")}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state"
                      value={formData.state}
                      onChange={handleInputChange("state")}
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea 
                      id="notes"
                      value={formData.notes}
                      onChange={handleInputChange("notes")}
                      placeholder="Any special instructions for your order..."
                      className={errors.notes ? "border-destructive" : ""}
                    />
                    {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">Pay Online with Paystack</div>
                          <div className="text-sm text-muted-foreground">
                            Pay securely with your card, bank transfer, or USSD
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">
                            Pay with cash when your order is delivered
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-muted-foreground">
                            Qty: {item.quantity} × ₦{item.product.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="font-medium">
                          ₦{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
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
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₦{getCartTotal().toLocaleString()}</span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={loading}
                  >
                    {loading ? "Processing..." : paymentMethod === 'paystack' ? "Pay Now" : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;