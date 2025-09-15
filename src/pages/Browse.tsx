import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, ShoppingCart } from "lucide-react";

const sampleProducts = [
  {
    id: 1,
    name: "Fresh Organic Bread",
    price: 850,
    vendor: "Maya's Bakery",
    location: "Ikeja, Lagos",
    image: "/placeholder.svg",
    rating: 4.8,
    stock: 12,
    category: "Food & Beverages"
  },
  {
    id: 2,
    name: "Handcrafted Leather Bag",
    price: 15000,
    vendor: "Artisan Crafts",
    location: "Victoria Island, Lagos",
    image: "/placeholder.svg",
    rating: 4.9,
    stock: 5,
    category: "Fashion & Accessories"
  },
  {
    id: 3,
    name: "Fresh Pepper Soup Spices",
    price: 1200,
    vendor: "Mama Kemi's Kitchen",
    location: "Surulere, Lagos",
    image: "/placeholder.svg",
    rating: 4.7,
    stock: 25,
    category: "Food & Beverages"
  }
];

const Browse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Browse Local Products
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
              />
            </div>
            <Button variant="hero">
              <MapPin className="w-4 h-4 mr-2" />
              Filter by Location
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {["All", "Food & Beverages", "Fashion", "Electronics", "Beauty", "Home & Garden"].map((category) => (
              <Badge 
                key={category} 
                variant={category === "All" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-card transition-all duration-300 group">
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-primary">
                  {product.stock} in stock
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg text-foreground">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by <span className="font-medium text-foreground">{product.vendor}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.location}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="hero" className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
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