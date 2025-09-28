import { storage } from "./storage";
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log("Starting database seed...");

    // Create default categories
    const factionCategory = await storage.createCategory({
      name: "Facções",
      slug: "faccoes",
      description: "Kits exclusivos, armas personalizadas e veículos para sua facção dominar as ruas",
      icon: "fas fa-users",
      color: "from-red-500 to-orange-500"
    });

    const corporationCategory = await storage.createCategory({
      name: "Corporações",
      slug: "corporacoes",
      description: "Uniformes executivos, escritórios premium e ferramentas corporativas para o sucesso",
      icon: "fas fa-building",
      color: "from-blue-500 to-cyan-500"
    });

    const vipCategory = await storage.createCategory({
      name: "Benefícios VIP",
      slug: "vip",
      description: "Acesso exclusivo, privilégios especiais e vantagens que só os VIPs possuem",
      icon: "fas fa-crown",
      color: "from-yellow-500 to-amber-500"
    });

    // Create admin user
    await storage.createUser({
      serial: "988CBCDD5B9CE9C19EBBE1268A151294",
      username: "admin",
      password: "85682093",
      email: "admin@novaerashop.com",
      isAdmin: true,
    });

    // Create default products
    await storage.createProduct({
      name: "AK-47 Premium",
      description: "Arma exclusiva com skin personalizada e dano aumentado",
      price: "49.90",
      categoryId: factionCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      isActive: true,
      isSubscription: false,
      stripePriceId: null,
      stock: 100
    });

    await storage.createProduct({
      name: "Lamborghini Facção",
      description: "Supercar exclusivo com pintura personalizada da sua facção",
      price: "199.90",
      categoryId: factionCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      isActive: true,
      isSubscription: false,
      stripePriceId: null,
      stock: 50
    });

    await storage.createProduct({
      name: "Escritório CEO",
      description: "Escritório premium no topo de arranha-céu com vista panorâmica",
      price: "299.90",
      categoryId: corporationCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      isActive: true,
      isSubscription: false,
      stripePriceId: null,
      stock: 20
    });

    await storage.createProduct({
      name: "VIP Ultimate",
      description: "Todos os privilégios VIP + bônus exclusivos mensais",
      price: "99.90",
      categoryId: vipCategory.id,
      imageUrl: "https://pixabay.com/get/g8a5c230e98b128228852a6d0642e696768de6b55872b2c69d615a7c3732f782860b943b0ad79f6c0bfa90b9c7df9cda9930d12ffe94fab4f7b7767d6cb6ce3be_1280.jpg",
      isActive: true,
      isSubscription: true,
      stripePriceId: null,
      stock: -1
    });

    await storage.createProduct({
      name: "Skin Personalizada",
      description: "Skin exclusiva com aparência única para seu personagem",
      price: "29.90",
      categoryId: factionCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      isActive: true,
      isSubscription: false,
      stripePriceId: null,
      stock: 50
    });

    await storage.createProduct({
      name: "Casa Premium",
      description: "Casa luxuosa com interior personalizado e localização premium",
      price: "149.90",
      categoryId: corporationCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      isActive: true,
      isSubscription: false,
      stripePriceId: null,
      stock: 25
    });

    await storage.createProduct({
      name: "M4A1 Carbine",
      description: "Rifle de assalto M4A1 com silenciador e mira holográfica",
      price: "79.90",
      categoryId: factionCategory.id,
      imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      isActive: true,
      isSubscription: false,
      stripePriceId: null,
      stock: 30
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed().then(() => {
  process.exit(0);
});