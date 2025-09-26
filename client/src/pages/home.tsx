import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Crown, Zap, Coins, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/product-card';
import { CategoryCard } from '@/components/products/category-card';
import { useLocation } from 'wouter';
import type { Product, Category } from '@shared/schema';

export default function Home() {
  const [, navigate] = useLocation();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch featured products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const featuredProducts = products.slice(0, 4);

  const handleExploreProducts = () => {
    navigate('/products');
  };

  const handleVipBenefits = () => {
    navigate('/products?category=vip');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" data-testid="hero-section">
        <div 
          className="absolute inset-0 hero-bg" 
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-gaming font-black mb-6 text-white">
              <span className="text-primary">NOVA ERA</span>
              <br />
              <span className="text-secondary">STORE</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Sua loja oficial para itens de facções, corporações e benefícios VIP do servidor Nova Era
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn-primary px-8 py-4 text-lg"
                onClick={handleExploreProducts}
                data-testid="button-explore-products"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Explorar Produtos
              </Button>
              <Button 
                className="btn-secondary px-8 py-4 text-lg"
                onClick={handleVipBenefits}
                data-testid="button-vip-benefits"
              >
                <Crown className="w-5 h-5 mr-3" />
                Benefícios VIP
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-primary text-6xl opacity-20 animate-float">
          <Coins className="w-16 h-16" />
        </div>
        <div className="absolute bottom-20 right-10 text-secondary text-4xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>
          <Gem className="w-12 h-12" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-card" data-testid="categories-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-gaming font-bold mb-4">
              <span className="text-primary">CATEGORIAS</span>
            </h2>
            <p className="text-xl text-muted-foreground">Escolha sua categoria e domine o servidor</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category}
                productCount={products.filter(p => p.categoryId === category.id).length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-background" data-testid="featured-products-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-gaming font-bold mb-4">
              <span className="text-secondary">PRODUTOS</span> <span className="text-primary">EM DESTAQUE</span>
            </h2>
            <p className="text-xl text-muted-foreground">Os itens mais populares do servidor</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const category = categories.find(c => c.id === product.categoryId);
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  category={category}
                />
              );
            })}
          </div>
          
          {/* View All Products Button */}
          <div className="text-center mt-12">
            <Button 
              className="btn-primary px-8 py-4 text-lg"
              onClick={handleExploreProducts}
              data-testid="button-view-all"
            >
              <Zap className="w-5 h-5 mr-3" />
              Ver Todos os Produtos
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted" data-testid="stats-section">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-gaming font-bold text-primary mb-2" data-testid="stat-active-users">
                15,280
              </div>
              <p className="text-muted-foreground">Jogadores Ativos</p>
            </div>
            <div>
              <div className="text-4xl font-gaming font-bold text-secondary mb-2" data-testid="stat-total-sales">
                50,000+
              </div>
              <p className="text-muted-foreground">Produtos Vendidos</p>
            </div>
            <div>
              <div className="text-4xl font-gaming font-bold text-accent mb-2" data-testid="stat-factions">
                200+
              </div>
              <p className="text-muted-foreground">Facções Ativas</p>
            </div>
            <div>
              <div className="text-4xl font-gaming font-bold text-primary mb-2" data-testid="stat-corporations">
                150+
              </div>
              <p className="text-muted-foreground">Corporações</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
