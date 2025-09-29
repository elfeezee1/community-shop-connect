import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AdminLayout } from "@/layouts/AdminLayout";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import CustomerAuth from "./pages/customer/CustomerAuth";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerOrders from "./pages/customer/CustomerOrders";
import ContactUs from "./pages/customer/ContactUs";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import PaymentCallback from "./pages/customer/PaymentCallback";
import VendorDashboard from "./pages/VendorDashboard";
import VendorCustomers from "./pages/vendor/VendorCustomers";
import VendorSupport from "./pages/vendor/VendorSupport";
import VendorProfile from "./pages/vendor/VendorProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import VendorSignin from "./pages/vendor/VendorSignin";
import VendorSignup from "./pages/vendor/VendorSignup";
import VendorOrders from "./pages/vendor/VendorOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/customer/auth" element={<CustomerAuth />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/customers" element={<VendorCustomers />} />
              
              {/* Vendor Routes */}
              <Route path="/vendor/signin" element={<VendorSignin />} />
              <Route path="/vendor/signup" element={<VendorSignup />} />
              <Route path="/vendor/support" element={<VendorSupport />} />
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/orders" element={<VendorOrders />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
