import { X, Plus, Minus, CreditCard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface ShoppingCartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingCartOverlay({ isOpen, onClose }: ShoppingCartOverlayProps) {
  const { cartItems, total, updateQuantity, removeFromCart, clearCart, isUpdating, isRemoving } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateQuantity({ productId, quantity: newQuantity });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar quantidade",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: "Sucesso",
        description: "Item removido do carrinho",
      });
    } catch (error) {
      toast({
        title: "Erro", 
        description: "Falha ao remover item",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Sucesso",
        description: "Carrinho limpo",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao limpar carrinho",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione alguns produtos antes de finalizar a compra",
        variant: "destructive",
      });
      return;
    }
    
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} data-testid="cart-overlay">
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
        data-testid="cart-panel"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-gaming font-bold" data-testid="cart-title">SEU CARRINHO</h3>
            <button 
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
              data-testid="button-close-cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="empty-cart-message">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-4 py-4 border-b border-border"
                  data-testid={`cart-item-${item.product?.id}`}
                >
                  <img 
                    src={item.product?.imageUrl} 
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                    data-testid={`cart-item-image-${item.product?.id}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium" data-testid={`cart-item-name-${item.product?.id}`}>
                      {item.product?.name}
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid={`cart-item-price-${item.product?.id}`}>
                      R$ {item.product?.price}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating}
                      data-testid={`button-decrease-${item.product?.id}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center" data-testid={`quantity-${item.product?.id}`}>
                      {item.quantity}
                    </span>
                    <button 
                      className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={isUpdating}
                      data-testid={`button-increase-${item.product?.id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={isRemoving}
                      data-testid={`button-remove-${item.product?.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-xl text-accent" data-testid="cart-total">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <Button 
              className="btn-primary w-full py-3 mb-2"
              onClick={handleCheckout}
              data-testid="button-checkout"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Finalizar Compra
            </Button>
            <Button 
              variant="ghost"
              className="w-full py-2 text-muted-foreground hover:text-foreground"
              onClick={handleClearCart}
              data-testid="button-clear-cart"
            >
              Limpar Carrinho
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
