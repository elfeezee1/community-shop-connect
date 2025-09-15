import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity_in_stock: number;
    category?: { name: string } | null;
    is_active: boolean;
    images: string[];
  };
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const imageUrl = mainImage ? getImageUrl(mainImage) : null;

  return (
    <Card className="group hover:shadow-card transition-all duration-300 overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-muted">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
            <Package className="w-16 h-16 text-muted-foreground/40" />
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <Badge variant={product.is_active ? "default" : "secondary"}>
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="text-xs bg-white/90">
              +{product.images.length - 1} more
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-bold text-primary">₦{product.price.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Stock: {product.quantity_in_stock}</div>
          </div>
          
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDelete(product.id)}
            className="flex-1 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}