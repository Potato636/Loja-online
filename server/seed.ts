import { db } from "./db";
import { categories, products } from "@shared/schema";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Create default categories
    const factionCategory = await db.insert(categories).values({
      name: "Facções",
      slug: "faccoes",
      description: "Kits exclusivos, armas personalizadas e veículos para sua facção dominar as ruas",
      icon: "fas fa-users",
      color: "from-red-500 to-orange-500"
    }).returning().then(res => res[0]);
    
    const corporationCategory = await db.insert(categories).values({
      name: "Corporações", 
      slug: "corporacoes",
      description: "Uniformes executivos, escritórios premium e ferramentas corporativas para o sucesso",
      icon: "fas fa-building",
      color: "from-blue-500 to-cyan-500"
    }).returning().then(res => res[0]);
    
    const vipCategory = await db.insert(categories).values({
      name: "Benefícios VIP",
      slug: "vip",
      description: "Acesso exclusivo, privilégios especiais e vantagens que só os VIPs possuem",
      icon: "fas fa-crown",
      color: "from-yellow-500 to-amber-500"
    }).returning().then(res => res[0]);

    // Create default products
    await db.insert(products).values([
      {
        name: "AK-47 Premium",
        description: "Arma exclusiva com skin personalizada e dano aumentado",
        price: "49.90",
        categoryId: factionCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isSubscription: false,
        stripePriceId: null,
        stock: 100
      },
      {
        name: "Lamborghini Facção",
        description: "Supercar exclusivo com pintura personalizada da sua facção",
        price: "199.90",
        categoryId: factionCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isSubscription: false,
        stripePriceId: null,
        stock: 50
      },
      {
        name: "Escritório CEO",
        description: "Escritório premium no topo de arranha-céu com vista panorâmica",
        price: "299.90",
        categoryId: corporationCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isSubscription: false,
        stripePriceId: null,
        stock: 20
      },
      {
        name: "VIP Ultimate",
        description: "Todos os privilégios VIP + bônus exclusivos mensais",
        price: "99.90",
        categoryId: vipCategory.id,
        imageUrl: "https://pixabay.com/get/g8a5c230e98b128228852a6d0642e696768de6b55872b2c69d615a7c3732f782860b943b0ad79f6c0bfa90b9c7df9cda9930d12ffe94fab4f7b7767d6cb6ce3be_1280.jpg",
        isActive: true,
        isSubscription: true,
        stripePriceId: null,
        stock: -1
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed().then(() => {
  process.exit(0);
});