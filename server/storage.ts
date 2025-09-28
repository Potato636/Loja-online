import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  users, categories, products, orders, orderItems, cartItems, activations,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type CartItem, type InsertCartItem,
  type Activation, type InsertActivation
} from "@shared/schema";
import * as bcrypt from 'bcryptjs';

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserBySerial(serial: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  updateUserMtaStats(userId: string, mtaMoney: number, mtaWeapon: number, mtaHealth: number, mtaArmor: number): Promise<User | undefined>;
  
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

  // Activation operations
  getActivationsByUser(userId: string): Promise<Activation[]>;
  getActivationsBySerial(serial: string): Promise<Activation[]>;
  createActivation(activation: InsertActivation): Promise<Activation>;
}

export class MockStorage implements IStorage {
  private categories: Category[] = [
    { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic devices', icon: 'cpu', color: '#3b82f6' },
    { id: '2', name: 'Clothing', slug: 'clothing', description: 'Clothing items', icon: 'shirt', color: '#10b981' },
  ];

  private products: Product[] = [
    { id: '1', name: 'Laptop', description: 'High-end laptop', price: '999.99', imageUrl: '/placeholder-laptop.jpg', categoryId: '1', isActive: true, isSubscription: false, stripePriceId: null, stock: -1, createdAt: new Date() },
    { id: '2', name: 'Smartphone', description: 'Latest smartphone', price: '699.99', imageUrl: '/placeholder-phone.jpg', categoryId: '1', isActive: true, isSubscription: false, stripePriceId: null, stock: -1, createdAt: new Date() },
    { id: '3', name: 'T-Shirt', description: 'Cotton t-shirt', price: '19.99', imageUrl: '/placeholder-tshirt.jpg', categoryId: '2', isActive: true, isSubscription: false, stripePriceId: null, stock: -1, createdAt: new Date() },
    { id: '4', name: 'Jeans', description: 'Denim jeans', price: '49.99', imageUrl: '/placeholder-jeans.jpg', categoryId: '2', isActive: true, isSubscription: false, stripePriceId: null, stock: -1, createdAt: new Date() },
  ];

  private cartItems: Map<string, CartItem[]> = new Map(); // key: userId
  private orders: Map<string, Order[]> = new Map(); // key: userId
  private orderItems: Map<string, OrderItem[]> = new Map(); // key: orderId
  private activations: Map<string, Activation[]> = new Map(); // key: userId

  private users: Map<string, User> = new Map(); // key: id

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserBySerial(serial: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.serial === serial) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = 'mock-user-' + Date.now();
    const user: User = {
      id,
      serial: insertUser.serial,
      username: insertUser.username,
      password: hashedPassword,
      email: insertUser.email ?? null,
      isAdmin: insertUser.isAdmin ?? false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      originalIp: null,
      originalUserAgent: null,
      mtaMoney: 0,
      mtaWeapon: 0,
      mtaHealth: 100,
      mtaArmor: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser: User = { ...user };
    if (updates.email !== undefined) updatedUser.email = updates.email;
    if (updates.password) updatedUser.password = await bcrypt.hash(updates.password, 10);
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser: User = { ...user, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserMtaStats(userId: string, mtaMoney: number, mtaWeapon: number, mtaHealth: number, mtaArmor: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updatedUser: User = { ...user, mtaMoney, mtaWeapon, mtaHealth, mtaArmor };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.find(c => c.id === id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return this.categories.find(c => c.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = { 
      id: 'mock-cat-' + Date.now(), 
      name: insertCategory.name, 
      slug: insertCategory.slug, 
      description: insertCategory.description ?? null, 
      icon: 'default-icon', 
      color: '#000000' 
    };
    this.categories.push(category);
    return category;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return this.products.filter(p => p.isActive === true);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.products.filter(p => p.categoryId === categoryId && p.isActive === true);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = { 
      id: 'mock-prod-' + Date.now(), 
      name: insertProduct.name, 
      description: insertProduct.description, 
      price: insertProduct.price, 
      categoryId: insertProduct.categoryId, 
      imageUrl: insertProduct.imageUrl, 
      isActive: insertProduct.isActive ?? true, 
      isSubscription: false, 
      stripePriceId: null, 
      stock: -1, 
      createdAt: new Date() 
    };
    this.products.push(product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    const allOrders: Order[] = [];
    Array.from(this.orders.values()).forEach(orders => allOrders.push(...orders));
    return allOrders;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orders.get(userId) || [];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    for (const [_, userOrders] of Array.from(this.orders.entries())) {
      const order = userOrders.find(o => o.id === id);
      if (order) return order;
    }
    return undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = { 
      id: 'mock-order-' + Date.now(), 
      userId: insertOrder.userId, 
      total: insertOrder.total, 
      status: 'pending', 
      stripePaymentIntentId: null, 
      createdAt: new Date() 
    };
    if (!this.orders.has(order.userId)) {
      this.orders.set(order.userId, []);
    }
    this.orders.get(order.userId)!.push(order);
    this.orderItems.set(order.id, []);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    for (const [userId, userOrders] of Array.from(this.orders.entries())) {
      const index = userOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        userOrders[index].status = status;
        return userOrders[index];
      }
    }
    return undefined;
  }

  // Order item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.orderItems.get(orderId) || [];
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const orderItem: OrderItem = { 
      id: 'mock-oi-' + Date.now(), 
      orderId: insertOrderItem.orderId, 
      productId: insertOrderItem.productId, 
      quantity: insertOrderItem.quantity, 
      price: insertOrderItem.price 
    };
    if (!this.orderItems.has(orderItem.orderId)) {
      this.orderItems.set(orderItem.orderId, []);
    }
    this.orderItems.get(orderItem.orderId)!.push(orderItem);
    return orderItem;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return this.cartItems.get(userId) || [];
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    let cart = this.cartItems.get(insertCartItem.userId) || [];
    const existingIndex = cart.findIndex(item => item.productId === insertCartItem.productId);
    let updatedItem: CartItem;
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += insertCartItem.quantity;
      updatedItem = cart[existingIndex];
    } else {
      updatedItem = { 
        id: 'mock-ci-' + Date.now(), 
        userId: insertCartItem.userId, 
        productId: insertCartItem.productId, 
        quantity: insertCartItem.quantity, 
        createdAt: new Date() 
      };
      cart.push(updatedItem);
    }
    this.cartItems.set(insertCartItem.userId, cart);
    return updatedItem;
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | undefined> {
    const cart = this.cartItems.get(userId) || [];
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) return undefined;
    cart[index].quantity = quantity;
    let updatedItem: CartItem | undefined = cart[index];
    if (quantity === 0) {
      cart.splice(index, 1);
      updatedItem = undefined;
    }
    this.cartItems.set(userId, cart);
    return updatedItem;
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    const cart = this.cartItems.get(userId) || [];
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) return false;
    cart.splice(index, 1);
    this.cartItems.set(userId, cart);
    return true;
  }

  async clearCart(userId: string): Promise<boolean> {
    this.cartItems.set(userId, []);
    return true;
  }

  // Activation operations
  async getActivationsByUser(userId: string): Promise<Activation[]> {
    return this.activations.get(userId) || [];
  }

  async getActivationsBySerial(serial: string): Promise<Activation[]> {
    const user = await this.getUserBySerial(serial);
    if (!user) return [];
    return this.getActivationsByUser(user.id);
  }

  async createActivation(insertActivation: InsertActivation): Promise<Activation> {
    const activation: Activation = {
      id: 'mock-act-' + Date.now(),
      userId: insertActivation.userId,
      productId: insertActivation.productId,
      activatedAt: new Date(),
      expiresAt: insertActivation.expiresAt ?? null,
    };
    if (!this.activations.has(activation.userId)) {
      this.activations.set(activation.userId, []);
    }
    this.activations.get(activation.userId)!.push(activation);
    return activation;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserBySerial(serial: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.serial, serial));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const updateData: any = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.password) updateData.password = await bcrypt.hash(updates.password, 10);
    if (Object.keys(updateData).length === 0) return await this.getUser(id);
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUserMtaStats(userId: string, mtaMoney: number, mtaWeapon: number, mtaHealth: number, mtaArmor: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ mtaMoney, mtaWeapon, mtaHealth, mtaArmor })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount! > 0;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Order item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, insertCartItem.userId),
          eq(cartItems.productId, insertCartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity instead of creating new item
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + insertCartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [cartItem] = await db.insert(cartItems).values(insertCartItem).returning();
    return cartItem;
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      )
      .returning();
    return cartItem;
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    return result.rowCount! > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount! >= 0; // Even 0 deleted items is success (empty cart)
  }

  // Activation operations
  async getActivationsByUser(userId: string): Promise<Activation[]> {
    return await db.select().from(activations).where(eq(activations.userId, userId));
  }

  async getActivationsBySerial(serial: string): Promise<Activation[]> {
    const user = await this.getUserBySerial(serial);
    if (!user) return [];
    return this.getActivationsByUser(user.id);
  }

  async createActivation(insertActivation: InsertActivation): Promise<Activation> {
    const [activation] = await db.insert(activations).values(insertActivation).returning();
    return activation;
  }
}

let storage: IStorage;

if (process.env.DATABASE_URL) {
  storage = new DatabaseStorage();
} else {
  console.log('No DATABASE_URL found. Using mock storage.');
  storage = new MockStorage();
}

export { storage };
