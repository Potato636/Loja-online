import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { ShoppingCart, Crown, ArrowLeft, Star, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@shared/schema';

export default function ProductDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { addToCart, isAddingToCart } = useCart();
  const { toast } = useToast();
  
  const productId = params.id;

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  // Fetch categories to get product category info
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const category = categories.find(c => c.id === product?.categoryId);

  const handleAddToCart = async () => {
    if (!product) return;
    
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

  const handleGoBack = () => {
    navigate('/products');
  };

  const formatPrice = () => {
    if (!product) return '';
    const price = parseFloat(product.price);
    if (product.isSubscription) {
      return `R$ ${price.toFixed(2).replace('.', ',')}/mês`;
    }
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getCategoryBadge = () => {
    if (!category) return null;
    
    let badgeClass = "bg-red-500 text-white";
    if (category.slug === "corporacoes") badgeClass = "bg-blue-500 text-white";
    if (category.slug === "vip") badgeClass = "bg-yellow-500 text-white";
    
    return (
      <Badge className={badgeClass} data-testid="product-category-badge">
        {category.name.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" data-testid="product-not-found">Produto não encontrado</h1>
          <Button onClick={handleGoBack} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={handleGoBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-card">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-detail-image"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                {getCategoryBadge()}
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm text-muted-foreground">(4.9)</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-gaming font-bold mb-4" data-testid="product-detail-name">
                {product.name}
              </h1>
              
              <p className="text-3xl font-bold text-accent mb-6" data-testid="product-detail-price">
                {formatPrice()}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-3">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="product-detail-description">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Stock Info */}
            {product.stock !== -1 && product.stock !== null && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Estoque:</span>
                <Badge variant={(product.stock || 0) > 10 ? "default" : "destructive"} data-testid="product-stock-badge">
                  {product.stock > 0 ? `${product.stock} disponíveis` : 'Esgotado'}
                </Badge>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Seguro</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Entrega Imediata</p>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Premium</p>
              </div>
            </div>

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button 
                className={product.isSubscription ? "btn-secondary w-full py-4 text-lg" : "btn-primary w-full py-4 text-lg"}
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                data-testid="button-add-to-cart-detail"
              >
                {product.isSubscription ? (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Assinar VIP
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adicionar ao Carrinho
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground text-center">
                <p>✓ Transação 100% segura</p>
                <p>✓ Suporte 24/7</p>
                <p>✓ Entrega instantânea no servidor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
