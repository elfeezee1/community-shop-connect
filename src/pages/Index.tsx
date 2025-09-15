import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Star, Users } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Adebayo",
    business: "Sarah's Fashion House",
    content: "Ecomance helped me reach customers I never could before. The flexible payment options especially helped build trust with new customers.",
    rating: 5
  },
  {
    name: "Michael Okafor", 
    business: "Mike's Electronics",
    content: "The inventory management is fantastic. I never oversell anymore and my customers love the reliable stock information.",
    rating: 5
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      
      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How Ecomance Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start selling locally and building community connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Store",
                description: "Sign up and set up your personalized storefront with products, pricing, and inventory tracking in minutes."
              },
              {
                step: "02", 
                title: "Choose Payment Options",
                description: "Enable online payments, cash-on-delivery, or both to accommodate all customer preferences and build trust."
              },
              {
                step: "03",
                title: "Start Selling Locally",
                description: "Customers discover your products, place orders, and you fulfill them with flexible payment and delivery options."
              }
            ].map((item) => (
              <Card key={item.step} className="text-center border-0 shadow-soft">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-primary mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Trusted by Local Businesses
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from business owners who transformed their local presence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Grow Your Local Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful local businesses already using Ecomance to reach more customers and increase sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="community" asChild>
              <Link to="/vendor-signup">Start Your Free Store Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/browse">Explore Local Products</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 mt-8 text-white/80">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Free to start
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No setup fees  
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Community focused
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Ecomance</div>
            <p className="text-primary-foreground/80 mb-6">
              Empowering local businesses, strengthening communities
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
              <Link to="/browse" className="hover:text-secondary transition-colors">Browse</Link>
              <Link to="/how-it-works" className="hover:text-secondary transition-colors">How It Works</Link>
              <Link to="/support" className="hover:text-secondary transition-colors">Support</Link>
            </div>
            <div className="mt-6 pt-6 border-t border-primary-foreground/20 text-primary-foreground/60 text-sm">
              © 2024 Ecomance. Building stronger local communities through commerce.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
