import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/products/product-card';
import { CategoryCard } from '@/components/products/category-card';
import type { Product, Category } from '@shared/schema';

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get category from URL query params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryFilter = urlParams.get('category');

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch products
  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      // Category filter
      if (categoryFilter) {
        const category = categories.find(c => c.slug === categoryFilter);
        if (category && product.categoryId !== category.id) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery) {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               product.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const selectedCategory = categories.find(c => c.slug === categoryFilter);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-gaming font-bold mb-4 text-primary">
            {selectedCategory ? selectedCategory.name.toUpperCase() : 'TODOS OS PRODUTOS'}
          </h1>
          {selectedCategory && (
            <p className="text-xl text-muted-foreground mb-6">
              {selectedCategory.description}
            </p>
          )}
        </div>

        {/* Categories Grid - Show only if not filtering by category */}
        {!categoryFilter && (
          <div className="mb-12">
            <h2 className="text-2xl font-gaming font-bold mb-6 text-secondary">Categorias</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category}
                  productCount={allProducts.filter(p => p.categoryId === category.id).length}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-sort">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="price-low">Menor Preço</SelectItem>
              <SelectItem value="price-high">Maior Preço</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground" data-testid="no-products-message">
              {searchQuery ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto disponível.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground" data-testid="products-count">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className={viewMode === 'grid' 
              ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredProducts.map((product) => {
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
          </>
        )}
      </div>
    </div>
  );
}
