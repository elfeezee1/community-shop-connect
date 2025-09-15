import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag, User, LogOut, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { getCartItemCount } = useCart();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold hover:text-secondary transition-colors">
              Ecomance
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/browse" className="hover:text-secondary transition-colors">
                Browse
              </Link>
              <Link to="/how-it-works" className="hover:text-secondary transition-colors">
                How It Works
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-secondary relative">
              <ShoppingBag className="w-5 h-5" />
              {user && getCartItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-secondary">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-secondary">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/vendor-dashboard" className="flex items-center">
                      <Store className="w-4 h-4 mr-2" />
                      Vendor Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild className="text-primary-foreground hover:text-secondary">
                <Link to="/auth">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};