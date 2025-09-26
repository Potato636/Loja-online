import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { stripePromise } from '@/lib/stripe';
import { apiRequest } from '@/lib/queryClient';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';

interface CheckoutFormProps {
  clientSecret: string;
}

function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { cartItems, total, userId, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const completeOrderMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const res = await apiRequest('POST', '/api/complete-order', {
        paymentIntentId,
        userId,
      });
      return res.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Erro no Pagamento",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await completeOrderMutation.mutateAsync(paymentIntent.id);
        toast({
          title: "Pagamento Realizado!",
          description: "Sua compra foi processada com sucesso!",
        });
        navigate('/success');
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao processar pedido",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
      <div className="bg-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Dados de Pagamento
        </h3>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="btn-primary w-full py-4 text-lg"
        disabled={!stripe || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processando...
          </div>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pagar R$ {total.toFixed(2).replace('.', ',')}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { cartItems, total, userId } = useCart();
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Adicione alguns produtos antes de finalizar a compra",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: total,
      userId,
      cartItems: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Erro",
          description: "Falha ao inicializar pagamento",
          variant: "destructive",
        });
      });
  }, [cartItems, total, userId]);

  const handleGoBack = () => {
    navigate('/products');
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p data-testid="loading-payment">Preparando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card data-testid="order-summary">
            <CardHeader>
              <CardTitle className="font-gaming">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4" data-testid={`checkout-item-${item.product?.id}`}>
                  <img 
                    src={item.product?.imageUrl} 
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium" data-testid={`checkout-item-name-${item.product?.id}`}>
                      {item.product?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" data-testid={`checkout-item-price-${item.product?.id}`}>
                      R$ {(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-accent" data-testid="checkout-total">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card data-testid="payment-form">
            <CardHeader>
              <CardTitle className="font-gaming">Finalizar Compra</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pagamento seguro processado via Stripe
              </p>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
