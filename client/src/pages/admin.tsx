import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Package, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/admin/product-form';
import { apiRequest } from '@/lib/queryClient';
import type { Product, Category, Order } from '@shared/schema';

export default function Admin() {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest('DELETE', `/api/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir produto",
        variant: "destructive",
      });
    },
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProductMutation.mutateAsync(productId);
    }
  };

  const handleProductFormSuccess = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(undefined);
  };

  const handleProductFormCancel = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(undefined);
  };

  // Calculate stats
  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + parseFloat(order.total), 0);

  const activeProducts = products.filter(p => p.isActive).length;
  const totalOrders = orders.length;

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-gaming font-bold mb-4 text-primary">
            PAINEL ADMINISTRATIVO
          </h1>
          <p className="text-xl text-muted-foreground">
            Gerencie produtos, categorias e pedidos da Nova Era Store
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-products">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {activeProducts}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {totalOrders}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-categories">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {categories.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full lg:w-[400px] grid-cols-3">
            <TabsTrigger value="products" data-testid="tab-products">Produtos</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Pedidos</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Categorias</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-gaming font-bold">Produtos</h2>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" data-testid="button-add-product">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-gaming">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    product={editingProduct}
                    onSuccess={handleProductFormSuccess}
                    onCancel={handleProductFormCancel}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="product-card" data-testid={`admin-product-${product.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        data-testid={`admin-product-image-${product.id}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-lg" data-testid={`admin-product-name-${product.id}`}>
                            {product.name}
                          </h3>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {product.isSubscription && (
                            <Badge className="bg-yellow-500 text-white">VIP</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {getCategoryName(product.categoryId)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {product.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent mb-2">
                          {formatCurrency(parseFloat(product.price))}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Estoque: {product.stock === -1 ? 'Ilimitado' : product.stock}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {products.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground" data-testid="no-products">
                      Nenhum produto cadastrado
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-gaming font-bold">Pedidos</h2>
            
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="product-card" data-testid={`admin-order-${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-2" data-testid={`admin-order-id-${order.id}`}>
                          Pedido #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt!).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent mb-2">
                          {formatCurrency(parseFloat(order.total))}
                        </p>
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 
                                  order.status === 'pending' ? 'secondary' : 'destructive'}
                          data-testid={`admin-order-status-${order.id}`}
                        >
                          {order.status === 'completed' ? 'Concluído' :
                           order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground" data-testid="no-orders">
                      Nenhum pedido encontrado
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <h2 className="text-2xl font-gaming font-bold">Categorias</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="category-card" data-testid={`admin-category-${category.id}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl text-white`}>
                      <span>{category.slug === 'faccoes' ? '👥' : category.slug === 'corporacoes' ? '🏢' : '👑'}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2" data-testid={`admin-category-name-${category.id}`}>
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    <Badge variant="outline">
                      {products.filter(p => p.categoryId === category.id).length} produtos
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
