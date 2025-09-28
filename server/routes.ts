import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import passport from 'passport';
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertOrderSchema, insertOrderItemSchema, insertCartItemSchema, insertUserSchema, updateUserSchema, type User } from "@shared/schema";

let stripe: any = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
} else {
  console.log('No STRIPE_SECRET_KEY found. Payment routes will return mock responses.');
  // Mock Stripe for development
  stripe = {
    paymentIntents: {
      create: async (data: any) => ({ client_secret: 'mock_client_secret' }),
      retrieve: async (id: string) => ({ status: 'succeeded' })
    }
  };
}

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes - Registration removed, now done via MTA mod

  // MTA mod registration - called when player joins without account
  app.post('/api/mta-register', async (req, res) => {
    try {
      const { serial, username } = req.body;
      if (!serial || !username) {
        return res.status(400).json({ message: 'Serial and username required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserBySerial(serial);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const defaultPassword = 'mudar123'; // Default password, player can change later
      const userData = {
        serial,
        username,
        password: defaultPassword,
        email: null,
        isAdmin: false,
      };

      const user = await storage.createUser(userData);

      // Send Discord webhook for new MTA registration
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1421793632721043526/wnBgLB2pVZ05vw3_e1pGp6dg6kHk8am0QRu41c2JWyYC_U8El-zYo_lmX6vjz5vnJLy9';
      if (webhookUrl && webhookUrl !== 'https://discord.com/api/webhooks/1421793632721043526/wnBgLB2pVZ05vw3_e1pGp6dg6kHk8am0QRu41c2JWyYC_U8El-zYo_lmX6vjz5vnJLy9') {
        const message = {
          content: `Novo usuário registrado via MTA!`,
          embeds: [{
            title: 'Registro MTA',
            fields: [
              { name: 'Serial', value: serial, inline: true },
              { name: 'Username', value: username, inline: true },
              { name: 'Senha Padrão', value: defaultPassword + ' (deve ser alterada)', inline: true },
            ],
            timestamp: new Date().toISOString(),
            color: 0x00ff00,
          }]
        };

        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        }).catch(err => console.error('Discord webhook error:', err));
      }

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ ...userWithoutPassword, defaultPassword });
    } catch (error: any) {
      res.status(400).json({ message: 'Error creating MTA user: ' + error.message });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', { session: true }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Login failed: Invalid username or password' });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        const { password, ...userWithoutPassword } = user;
        // Include MTA stats in login response
        res.json({
          ...userWithoutPassword,
          mtaInfo: {
            money: user.mtaMoney,
            weapon: user.mtaWeapon,
            health: user.mtaHealth,
            armor: user.mtaArmor,
          }
        });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req: any, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Session destroy error' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  app.get('/api/me', isAuthenticated, (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(400).json({ message: 'Error updating profile: ' + error.message });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.post("/api/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating category: " + error.message });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let products;
      
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  app.post("/api/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating product: " + error.message });
    }
  });

  app.put("/api/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating product: " + error.message });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  // Cart API - Authenticated user cart operations
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const cartItems = await storage.getCartItems(userId);
      
      // Enrich cart items with product information
      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.json(enrichedItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      const cartItemData = { ...req.body, userId };
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: "Error adding to cart: " + error.message });
    }
  });

  app.put("/api/cart/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      const userId = req.user.id;
      const cartItem = await storage.updateCartItemQuantity(
        userId,
        req.params.productId,
        quantity
      );
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating cart item: " + error.message });
    }
  });

  app.delete("/api/cart/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const success = await storage.removeFromCart(userId, req.params.productId);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error: any) {
      res.status(500).json({ message: "Error clearing cart: " + error.message });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const { userId } = req.query;
      let orders;

      if (userId) {
        // Users can view their own orders
        orders = await storage.getOrdersByUser(userId as string);
      } else {
        // Admin can view all orders
        if (!req.user || !req.user.isAdmin) {
          return res.status(403).json({ message: 'Forbidden' });
        }
        orders = await storage.getOrders();
      }

      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      const enrichedItems = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.json({ ...order, items: enrichedItems });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, userId, cartItems } = req.body;
      
      if (!stripe || !process.env.STRIPE_SECRET_KEY) {
        return res.json({ clientSecret: 'mock_client_secret' });
      }
      
      // Create the payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "brl",
        metadata: {
          userId,
          cartItems: JSON.stringify(cartItems),
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Handle successful payment and create order
  app.post("/api/complete-order", async (req, res) => {
    try {
      const { paymentIntentId, userId } = req.body;
      
      let paymentIntent;
      if (!stripe || !process.env.STRIPE_SECRET_KEY) {
        paymentIntent = { status: 'succeeded' };
      } else {
        // Verify payment with Stripe
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      }
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment not completed" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      const orderItems = [];
      
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) continue;
        
        const itemTotal = parseFloat(product.price) * cartItem.quantity;
        total += itemTotal;
        
        orderItems.push({
          orderId: "", // Will be set after order creation
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: product.price,
        });
      }
      
      // Create order
      const order = await storage.createOrder({
        userId,
        total: total.toString(),
        status: "completed",
        stripePaymentIntentId: paymentIntentId,
      });
      
      // Create order items
      for (const item of orderItems) {
        await storage.createOrderItem({
          ...item,
          orderId: order.id,
        });

        // Automatically create activation for purchased product
        await storage.createActivation({
          userId,
          productId: item.productId,
          expiresAt: undefined, // No expiration for one-time purchases; adjust based on product type
        });
      }
      
      // Clear cart
      await storage.clearCart(userId);
      
      res.json({ order, message: "Order completed successfully. Products activated in game." });
    } catch (error: any) {
      res.status(500).json({ message: "Error completing order: " + error.message });
    }
  });

  // Activations API - for MTA game integration
  app.get("/api/activations/:serial", async (req, res) => {
    try {
      const { serial } = req.params;
      const activations = await storage.getActivationsBySerial(serial);

      // Filter active activations (not expired)
      const activeActivations = activations.filter(activation =>
        !activation.expiresAt || new Date(activation.expiresAt) > new Date()
      );

      res.json(activeActivations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching activations: " + error.message });
    }
  });

  // Update MTA player stats - called by MTA mod
  app.post("/api/update-player-stats", async (req, res) => {
    try {
      const { serial, money, weapon, health, armor } = req.body;
      const user = await storage.getUserBySerial(serial);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUserMtaStats(user.id, money, weapon, health, armor);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update stats" });
      }
      res.json({ message: "Stats updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating player stats: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
