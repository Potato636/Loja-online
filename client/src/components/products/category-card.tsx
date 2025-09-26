import { Link } from 'wouter';
import type { Category } from '@shared/schema';

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

export function CategoryCard({ category, productCount = 0 }: CategoryCardProps) {
  const getIcon = () => {
    switch (category.slug) {
      case 'faccoes':
        return '👥';
      case 'corporacoes': 
        return '🏢';
      case 'vip':
        return '👑';
      default:
        return '📦';
    }
  };

  const getFeatures = () => {
    switch (category.slug) {
      case 'faccoes':
        return ['🔫 Armas', '🚗 Veículos', '🏠 Bases'];
      case 'corporacoes':
        return ['💼 Negócios', '📈 Economia', '🤝 Parcerias'];
      case 'vip':
        return ['⭐ Exclusivo', '🚀 Privilégios', '🎁 Bônus'];
      default:
        return [];
    }
  };

  return (
    <Link href={`/products?category=${category.slug}`}>
      <div className="category-card rounded-xl p-8 text-center cursor-pointer glow-border" data-testid={`category-card-${category.slug}`}>
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-4xl text-white`}>
          <span data-testid={`category-icon-${category.slug}`}>{getIcon()}</span>
        </div>
        <h3 className="text-2xl font-gaming font-bold mb-4 text-primary" data-testid={`category-name-${category.slug}`}>
          {category.name.toUpperCase()}
        </h3>
        <p className="text-muted-foreground mb-6" data-testid={`category-description-${category.slug}`}>
          {category.description}
        </p>
        {productCount > 0 && (
          <p className="text-accent font-semibold mb-4" data-testid={`category-count-${category.slug}`}>
            {productCount} produtos disponíveis
          </p>
        )}
        <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
          {getFeatures().map((feature, index) => (
            <span key={index} data-testid={`category-feature-${category.slug}-${index}`}>
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
