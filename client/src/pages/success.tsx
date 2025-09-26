import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import type { Order } from '@shared/schema';

export default function Success() {
  const [location, navigate] = useLocation();
  const { userId } = useCart();

  // Get the most recent completed order for this user
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders', userId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?userId=${userId}`);
      return res.json();
    },
  });

  const completedOrders = orders.filter(order => order.status === 'completed');
  const latestOrder = completedOrders.sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  )[0];

  // Get order details with items
  const { data: orderDetails } = useQuery({
    queryKey: ['/api/orders', latestOrder?.id],
    enabled: !!latestOrder?.id,
    queryFn: async () => {
      const res = await fetch(`/api/orders/${latestOrder!.id}`);
      return res.json();
    },
  });

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewProducts = () => {
    navigate('/products');
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8" data-testid="success-header">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-gaming font-bold mb-4 text-primary">
            PAGAMENTO REALIZADO!
          </h1>
          <p className="text-xl text-muted-foreground">
            Sua compra foi processada com sucesso
          </p>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <Card className="mb-8" data-testid="order-details">
            <CardHeader>
              <CardTitle className="font-gaming flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Detalhes do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Número do Pedido:</span>
                <span className="font-mono" data-testid="order-number">
                  #{orderDetails.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Data da Compra:</span>
                <span data-testid="order-date">
                  {new Date(orderDetails.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-accent text-white" data-testid="order-status">
                  Concluído
                </Badge>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-semibold">Itens Comprados:</h4>
                {orderDetails.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4" data-testid={`success-item-${item.product?.id}`}>
                    <img 
                      src={item.product?.imageUrl} 
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium" data-testid={`success-item-name-${item.product?.id}`}>
                        {item.product?.name}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" data-testid={`success-item-price-${item.product?.id}`}>
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Pago:</span>
                <span className="text-accent" data-testid="success-total">
                  {formatCurrency(orderDetails.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8" data-testid="next-steps">
          <CardHeader>
            <CardTitle className="font-gaming flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h5 className="font-semibold">Acesse o Servidor</h5>
                <p className="text-sm text-muted-foreground">
                  Conecte-se ao servidor Nova Era para receber seus itens
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h5 className="font-semibold">Entrega Automática</h5>
                <p className="text-sm text-muted-foreground">
                  Seus itens serão entregues automaticamente no jogo
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h5 className="font-semibold">Suporte</h5>
                <p className="text-sm text-muted-foreground">
                  Em caso de problemas, entre em contato conosco no Discord
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="btn-primary flex-1"
            onClick={handleBackToHome}
            data-testid="button-back-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
          <Button 
            className="btn-secondary flex-1"
            onClick={handleViewProducts}
            data-testid="button-view-products"
          >
            <Package className="w-4 h-4 mr-2" />
            Ver Mais Produtos
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 p-6 bg-card rounded-lg">
          <h4 className="font-semibold mb-2">Precisa de Ajuda?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Entre em contato conosco através do Discord oficial do servidor Nova Era
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-primary">✓ Suporte 24/7</span>
            <span className="text-primary">✓ Entrega Garantida</span>
            <span className="text-primary">✓ Transação Segura</span>
          </div>
        </div>
      </div>
    </div>
  );
}
