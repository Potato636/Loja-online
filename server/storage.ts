import { type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type CartItem, type InsertCartItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: string, productId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default categories
    const factionCategory: Category = {
      id: randomUUID(),
      name: "Facções",
      slug: "faccoes",
      description: "Kits exclusivos, armas personalizadas e veículos para sua facção dominar as ruas",
      icon: "fas fa-users",
      color: "from-red-500 to-orange-500"
    };
    
    const corporationCategory: Category = {
      id: randomUUID(),
      name: "Corporações", 
      slug: "corporacoes",
      description: "Uniformes executivos, escritórios premium e ferramentas corporativas para o sucesso",
      icon: "fas fa-building",
      color: "from-blue-500 to-cyan-500"
    };
    
    const vipCategory: Category = {
      id: randomUUID(),
      name: "Benefícios VIP",
      slug: "vip",
      description: "Acesso exclusivo, privilégios especiais e vantagens que só os VIPs possuem",
      icon: "fas fa-crown",
      color: "from-yellow-500 to-amber-500"
    };
    
    this.categories.set(factionCategory.id, factionCategory);
    this.categories.set(corporationCategory.id, corporationCategory);
    this.categories.set(vipCategory.id, vipCategory);
    
    // Create default products
    const products: Product[] = [
      {
        id: randomUUID(),
        name: "AK-47 Premium",
        description: "Arma exclusiva com skin personalizada e dano aumentado",
        price: "49.90",
        categoryId: factionCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isSubscription: false,
        stripePriceId: null,
        stock: 100,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Lamborghini Facção",
        description: "Supercar exclusivo com pintura personalizada da sua facção",
        price: "199.90",
        categoryId: factionCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isSubscription: false,
        stripePriceId: null,
        stock: 50,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: "Escritório CEO",
        description: "Escritório premium no topo de arranha-céu com vista panorâmica",
        price: "299.90",
        categoryId: corporationCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isSubscription: false,
        stripePriceId: null,
        stock: 20,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        name: "VIP Ultimate",
        description: "Todos os privilégios VIP + bônus exclusivos mensais",
        price: "99.90",
        categoryId: vipCategory.id,
        imageUrl: "https://pixabay.com/get/g8a5c230e98b128228852a6d0642e696768de6b55872b2c69d615a7c3732f782860b943b0ad79f6c0bfa90b9c7df9cda9930d12ffe94fab4f7b7767d6cb6ce3be_1280.jpg",
        isActive: true,
        isSubscription: true,
        stripePriceId: null,
        stock: -1,
        createdAt: new Date()
      }
    ];
    
    products.forEach(product => this.products.set(product.id, product));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, isAdmin: false, email: null, stripeCustomerId: null, stripeSubscriptionId: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id, description: insertCategory.description ?? null };
    this.categories.set(id, category);
    return category;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.categoryId === categoryId && p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date(),
      isActive: insertProduct.isActive ?? true,
      isSubscription: insertProduct.isSubscription ?? false,
      stock: insertProduct.stock ?? -1,
      stripePriceId: insertProduct.stripePriceId ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(),
      status: insertOrder.status ?? "pending",
      stripePaymentIntentId: insertOrder.stripePaymentIntentId ?? null
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead of creating new item
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + insertCartItem.quantity };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    const id = randomUUID();
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id, 
      createdAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
    
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(cartItem.id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    const cartItem = Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
    
    if (!cartItem) return false;
    return this.cartItems.delete(cartItem.id);
  }

  async clearCart(userId: string): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    userCartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }
}

export const storage = new MemStorage();
