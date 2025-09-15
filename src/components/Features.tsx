import { Card, CardContent } from "@/components/ui/card";
import { Store, CreditCard, BarChart3, Shield, Users, MapPin } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Easy Storefront Setup",
    description: "Create your professional online store in minutes with our intuitive dashboard and customizable templates."
  },
  {
    icon: CreditCard,
    title: "Hybrid Payment Options", 
    description: "Accept online payments and cash-on-delivery to build customer trust and accommodate local preferences."
  },
  {
    icon: BarChart3,
    title: "Smart Inventory Management",
    description: "Track quantities automatically, prevent overselling, and get alerts when stock runs low."
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Built-in verification, secure transactions, and community ratings ensure safe commerce for everyone."
  },
  {
    icon: Users,
    title: "Community Focus",
    description: "Connect with local customers who value supporting neighborhood businesses and shopping locally."
  },
  {
    icon: MapPin,
    title: "Local Discovery",
    description: "Customers can easily find and browse products from businesses in their area and surrounding communities."
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Succeed Locally
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed specifically for small businesses to thrive in their communities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-soft hover:shadow-card transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};