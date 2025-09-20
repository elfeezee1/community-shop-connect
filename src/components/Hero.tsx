import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Store, Users, Truck } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-hero text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Empower Your
                <span className="block text-secondary"> Local Business</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Join Ecomance - the marketplace that connects local businesses with their community. 
                Flexible payments, inventory management, and trust-building tools all in one platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="community" asChild>
                <Link to="/vendor/signup">
                  <Store className="w-5 h-5 mr-2" />
                  Start Your Store
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/browse">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Local
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-white/80">Local Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">12K+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-white/80">Trust Rating</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Local business marketplace community"
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-card">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Flexible Delivery</div>
                  <div className="text-sm text-muted-foreground">Online & Physical Payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};