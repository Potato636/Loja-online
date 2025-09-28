import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Menu, Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';
import { ShoppingCartOverlay } from '@/components/cart/shopping-cart';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 navbar-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-2xl font-gaming font-bold text-primary">
                  <Zap className="inline w-6 h-6 mr-2" />
                  NOVA ERA
                </div>
                <span className="hidden md:block text-muted-foreground">Store</span>
              </Link>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/"
                className={`text-foreground hover:text-primary transition-colors font-medium ${location === '/' ? 'text-primary' : ''}`} 
                data-testid="nav-home"
              >
                Início
              </Link>
              <Link 
                href="/products"
                className={`text-foreground hover:text-primary transition-colors font-medium ${location === '/products' ? 'text-primary' : ''}`}
                data-testid="nav-products"
              >
                Produtos
              </Link>
              <Link 
                href="/admin"
                className={`text-foreground hover:text-primary transition-colors font-medium ${location === '/admin' ? 'text-primary' : ''}`}
                data-testid="nav-admin"
              >
                Admin
              </Link>
            </nav>
            
            {/* Cart and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button 
                className="relative p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 cart-badge text-xs rounded-full w-5 h-5 flex items-center justify-center text-white font-bold" data-testid="cart-count">
                    {itemCount}
                  </span>
                )}
              </button>
              
              {/* User Account */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Hi, {user.serial.slice(0, 8)}...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    data-testid="button-profile"
                  >
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    data-testid="button-login"
                  >
                    <Link href="/login">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild 
                    data-testid="button-register"
                  >
                    <Link href="/register">
                      Register
                    </Link>
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  data-testid="nav-mobile-home"
                >
                  Início
                </Link>
                <Link 
                  href="/products"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  data-testid="nav-mobile-products"
                >
                  Produtos
                </Link>
                <Link 
                  href="/admin"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  data-testid="nav-mobile-admin"
                >
                  Admin
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <ShoppingCartOverlay isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
