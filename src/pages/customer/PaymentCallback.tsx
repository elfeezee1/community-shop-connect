import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderReference, setOrderReference] = useState<string>("");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        toast({
          title: "Payment Error",
          description: "No payment reference found",
          variant: "destructive",
        });
        return;
      }

      setOrderReference(reference);

      try {
        // Call edge function to verify payment with Paystack
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { reference }
        });

        if (error) throw error;

        if (data.status === 'success') {
          // Payment verified successfully
          setStatus('success');
          
          // Clear the cart
          clearCart();
          
          toast({
            title: "Payment Successful!",
            description: "Your order has been placed successfully.",
          });
          
          // Redirect to cart with success info after 3 seconds
          setTimeout(() => {
            navigate(`/cart?success=true&orderId=${data.orderId}`);
          }, 3000);
        } else {
          setStatus('failed');
          toast({
            title: "Payment Failed",
            description: data.message || "Payment verification failed",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        toast({
          title: "Verification Error",
          description: "Failed to verify payment. Please contact support.",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, toast, clearCart, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === 'failed' && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && "Verifying Payment..."}
              {status === 'success' && "Payment Successful!"}
              {status === 'failed' && "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <p className="text-muted-foreground">
                Please wait while we verify your payment...
              </p>
            )}
            
            {status === 'success' && (
              <>
                <p className="text-muted-foreground">
                  Your payment has been processed successfully. You will be redirected to your orders page shortly.
                </p>
                {orderReference && (
                  <p className="text-sm text-muted-foreground">
                    Reference: {orderReference}
                  </p>
                )}
                <Button onClick={() => navigate('/cart')}>
                  Back to Cart
                </Button>
              </>
            )}
            
            {status === 'failed' && (
              <>
                <p className="text-muted-foreground">
                  Your payment could not be processed. Please try again or contact support.
                </p>
                {orderReference && (
                  <p className="text-sm text-muted-foreground">
                    Reference: {orderReference}
                  </p>
                )}
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate('/cart')}>
                    Back to Cart
                  </Button>
                  <Button onClick={() => navigate('/customer/orders')}>
                    View Orders
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentCallback;