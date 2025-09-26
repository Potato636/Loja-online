import { ShoppingCart, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import type { Product, Category } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  category?: Category;
}

export function ProductCard({ product, category }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast({
        title: "Sucesso!",
        description: `${product.name} foi adicionado ao carrinho`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto ao carrinho",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadge = () => {
    if (!category) return null;
    
    let badgeClass = "bg-red-500 text-white";
    if (category.slug === "corporacoes") badgeClass = "bg-blue-500 text-white";
    if (category.slug === "vip") badgeClass = "bg-yellow-500 text-white";
    
    return (
      <span className={`${badgeClass} px-2 py-1 rounded text-xs font-bold`} data-testid={`badge-${product.id}`}>
        {category.name.toUpperCase()}
      </span>
    );
  };

  const formatPrice = () => {
    const price = parseFloat(product.price);
    if (product.isSubscription) {
      return `R$ ${price.toFixed(2).replace('.', ',')}/mês`;
    }
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="product-card rounded-xl overflow-hidden cursor-pointer" data-testid={`product-card-${product.id}`}>
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-48 object-cover"
          data-testid={`product-image-${product.id}`}
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            {getCategoryBadge()}
            <span className="text-accent font-bold" data-testid={`product-price-${product.id}`}>
              {formatPrice()}
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4" data-testid={`product-description-${product.id}`}>
            {product.description}
          </p>
          
          {product.stock !== -1 && product.stock !== null && product.stock < 10 && (
            <p className="text-destructive text-sm mb-2" data-testid={`product-stock-${product.id}`}>
              Apenas {product.stock} restante{product.stock !== 1 ? 's' : ''}!
            </p>
          )}
          
          <Button 
            className={product.isSubscription ? "btn-secondary w-full py-2" : "btn-primary w-full py-2"}
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {product.isSubscription ? (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Assinar VIP
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
