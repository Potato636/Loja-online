import { Link } from 'wouter';
import { Zap } from 'lucide-react';
import { SiDiscord, SiInstagram, SiYoutube } from 'react-icons/si';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-gaming font-bold text-primary mb-4">
              <Zap className="inline w-6 h-6 mr-2" />
              NOVA ERA
            </div>
            <p className="text-muted-foreground mb-4">
              A loja oficial do servidor Nova Era. Compre com segurança e domine o jogo.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-discord"
              >
                <SiDiscord className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-instagram"
              >
                <SiInstagram className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-youtube"
              >
                <SiYoutube className="text-xl" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/products?category=faccoes"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-factions"
                >
                  Facções
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=corporacoes"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-corporations"
                >
                  Corporações
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=vip"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-vip"
                >
                  Benefícios VIP
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-help">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-refund">
                  Política de Reembolso
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
                  Privacidade
                </a>
              </li>
            </ul>
          </div>
          
          {/* Payment Methods */}
          <div>
            <h4 className="font-bold mb-4">Formas de Pagamento</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="bg-muted px-3 py-2 rounded text-sm" data-testid="payment-pix">PIX</div>
              <div className="bg-muted px-3 py-2 rounded text-sm" data-testid="payment-card">Cartão</div>
              <div className="bg-muted px-3 py-2 rounded text-sm" data-testid="payment-boleto">Boleto</div>
            </div>
            <p className="text-muted-foreground text-sm">
              Pagamentos processados de forma segura via Stripe
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="copyright">&copy; 2024 Nova Era Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
