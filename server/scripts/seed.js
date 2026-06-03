import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('❌  MONGO_URI missing in server/.env'); process.exit(1); }

/* ── inline schemas (avoid circular imports) ── */
const productSchema = new mongoose.Schema({
  name: String, slug: String, brand: String, price: Number,
  description: String, images: [String], sizes: [Number],
  stock: Number, category: { type: String, default: 'sneakers' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  password: String, isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const User    = mongoose.model('User',    userSchema);

const products = [
  // ── Nike (8) ──────────────────────────────────────
  {
    name: 'Nike Air Max 90', slug: 'nike-air-max-90', brand: 'Nike', price: 130, stock: 15,
    sizes: [8, 9, 10, 11, 12], featured: true,
    description: 'Nothing as fly, nothing as comfortable, nothing as proven. The Nike Air Max 90 stays true to its OG running roots.',
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    ]
  },
  {
    name: 'Nike Air Force 1', slug: 'nike-air-force-1', brand: 'Nike', price: 110, stock: 25,
    sizes: [8, 9, 9.5, 10, 11, 12], featured: true,
    description: 'The radiance lives on in the Nike Air Force 1, the b-ball icon that puts a fresh spin on what you know best.',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    ]
  },
  {
    name: 'Nike Dunk Low Retro', slug: 'nike-dunk-low-retro', brand: 'Nike', price: 115, stock: 10,
    sizes: [9, 10, 11], featured: true,
    description: 'Created for the hardwood but taken to the streets, the 80s b-ball icon returns with perfectly shined overlays.',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80',
    ]
  },
  {
    name: 'Nike Blazer Mid 77', slug: 'nike-blazer-mid-77', brand: 'Nike', price: 105, stock: 8,
    sizes: [8, 10, 12], featured: false,
    description: 'In the 70s, shoes were simple. The Blazer Mid 77 Vintage channels the old-school look of Nike b-ball.',
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ]
  },
  {
    name: 'Nike Air VaporMax', slug: 'nike-air-vapormax', brand: 'Nike', price: 210, stock: 5,
    sizes: [9, 10, 11, 12], featured: false,
    description: 'The Nike Air VaporMax represents a new era in Nike innovation, designed to make you feel like you are walking on air.',
    images: [
      'https://images.unsplash.com/photo-1605340537586-0f588c2b7bd5?w=800&q=80',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    ]
  },
  {
    name: 'Nike React Element', slug: 'nike-react-element', brand: 'Nike', price: 160, stock: 14,
    sizes: [8, 9, 10, 11], featured: false,
    description: 'Nike React Element 55 borrows design lines from heritage runners and adds reflective details for an upgraded look.',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    ]
  },
  {
    name: 'Nike ZoomX Vaporfly', slug: 'nike-zoomx-vaporfly', brand: 'Nike', price: 250, stock: 4,
    sizes: [9, 10], featured: false,
    description: 'Continue the next evolution of speed with a racing shoe made to help you chase new goals and records.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1605340537586-0f588c2b7bd5?w=800&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
    ]
  },
  {
    name: 'Nike Pegasus 39', slug: 'nike-pegasus-39', brand: 'Nike', price: 130, stock: 20,
    sizes: [8, 9, 10, 11, 12], featured: false,
    description: 'Let the Nike Pegasus 39 help you ascend to new heights with its comfortable and intuitive design.',
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    ]
  },

  // ── Adidas (8) ────────────────────────────────────
  {
    name: 'Adidas Yeezy Boost 350', slug: 'adidas-yeezy-boost-350', brand: 'Adidas', price: 230, stock: 3,
    sizes: [9, 10], featured: true,
    description: 'The YEEZY BOOST 350 V2 features an upper composed of re-engineered Primeknit with a post-dyed monofilament side stripe.',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
      'https://images.unsplash.com/photo-1605340537586-0f588c2b7bd5?w=800&q=80',
    ]
  },
  {
    name: 'Adidas Ultraboost 1.0', slug: 'adidas-ultraboost-1-0', brand: 'Adidas', price: 190, stock: 12,
    sizes: [8, 9, 10, 11], featured: true,
    description: 'From a walk in the park to a weekend run with friends, these Ultraboost shoes are designed to keep you comfortable.',
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    ]
  },
  {
    name: 'Adidas NMD R1', slug: 'adidas-nmd-r1', brand: 'Adidas', price: 150, stock: 18,
    sizes: [8, 9, 10, 11, 12], featured: false,
    description: 'Pack your bag, lace up and get going. City adventures beckon in these NMD_R1 shoes.',
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
    ]
  },
  {
    name: 'Adidas Superstar', slug: 'adidas-superstar', brand: 'Adidas', price: 100, stock: 30,
    sizes: [8, 9, 10, 11, 12, 13], featured: true,
    description: 'Originally made for basketball courts in the 70s, the Superstar is now a lifestyle staple.',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&q=80',
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
    ]
  },
  {
    name: 'Adidas Stan Smith', slug: 'adidas-stan-smith', brand: 'Adidas', price: 100, stock: 22,
    sizes: [8, 9, 10, 11], featured: false,
    description: 'The Stan Smith has been defining sneaker style for decades with its clean, classic design.',
    images: [
      'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&q=80',
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80',
    ]
  },
  {
    name: 'Adidas Forum Low', slug: 'adidas-forum-low', brand: 'Adidas', price: 110, stock: 15,
    sizes: [9, 10, 11, 12], featured: false,
    description: 'More than just a shoe, it is a statement. The Forum hit the scene in 84 and gained major love on and off the court.',
    images: [
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80',
    ]
  },
  {
    name: 'Adidas ZX 2K Boost', slug: 'adidas-zx-2k-boost', brand: 'Adidas', price: 150, stock: 9,
    sizes: [8, 10, 11], featured: false,
    description: 'Step into the future of comfort. The ZX 2K Boost merges heritage design with modern technology.',
    images: [
      'https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80',
    ]
  },
  {
    name: 'Adidas Gazelle', slug: 'adidas-gazelle', brand: 'Adidas', price: 100, stock: 14,
    sizes: [8, 9, 10, 12], featured: false,
    description: 'A faithful reissue of the 1991 Gazelle, featuring the same materials, colors, textures and proportions.',
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80',
      'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&q=80',
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
    ]
  },

  // ── Jordan (6) ────────────────────────────────────
  {
    name: 'Air Jordan 1 Retro High', slug: 'air-jordan-1-retro-high', brand: 'Jordan', price: 180, stock: 6,
    sizes: [9, 10, 11], featured: true,
    description: 'Familiar but always fresh, the iconic Air Jordan 1 is remastered for today\'s sneakerhead culture.',
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80',
      'https://images.unsplash.com/photo-1574561083236-0c6a8f11ecf3?w=800&q=80',
      'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=800&q=80',
    ]
  },
  {
    name: 'Air Jordan 4 Retro', slug: 'air-jordan-4-retro', brand: 'Jordan', price: 210, stock: 4,
    sizes: [10, 11, 12], featured: true,
    description: 'The Air Jordan 4 Retro brings back the classic profile and timeless style of the 1989 original.',
    images: [
      'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=800&q=80',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80',
      'https://images.unsplash.com/photo-1584735174965-48c48d4daf27?w=800&q=80',
    ]
  },
  {
    name: 'Air Jordan 11 Retro', slug: 'air-jordan-11-retro', brand: 'Jordan', price: 225, stock: 2,
    sizes: [10, 11], featured: false,
    description: 'The Air Jordan 11 Retro is considered by many to be the greatest sneaker of all time.',
    images: [
      'https://images.unsplash.com/photo-1584735174965-48c48d4daf27?w=800&q=80',
      'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80',
      'https://images.unsplash.com/photo-1574561083236-0c6a8f11ecf3?w=800&q=80',
    ]
  },
  {
    name: 'Air Jordan 3 Retro', slug: 'air-jordan-3-retro', brand: 'Jordan', price: 200, stock: 7,
    sizes: [8, 9, 10, 11], featured: false,
    description: 'The Air Jordan 3 Retro returns with the iconic elephant print details and visible Air cushioning.',
    images: [
      'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80',
      'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=800&q=80',
    ]
  },
  {
    name: 'Air Jordan 1 Mid', slug: 'air-jordan-1-mid', brand: 'Jordan', price: 125, stock: 15,
    sizes: [8, 9, 10, 11, 12], featured: true,
    description: 'The Air Jordan 1 Mid brings full-court style and premium comfort to an iconic look.',
    images: [
      'https://images.unsplash.com/photo-1574561083236-0c6a8f11ecf3?w=800&q=80',
      'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=800&q=80',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80',
    ]
  },
  {
    name: 'Air Jordan 5 Retro', slug: 'air-jordan-5-retro', brand: 'Jordan', price: 200, stock: 5,
    sizes: [9, 10, 11], featured: false,
    description: 'The Air Jordan 5 Retro brings back the original WWII Mustang fighter plane inspiration.',
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
      'https://images.unsplash.com/photo-1584735174965-48c48d4daf27?w=800&q=80',
      'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&q=80',
    ]
  },

  // ── New Balance (5) ───────────────────────────────
  {
    name: 'New Balance 550', slug: 'new-balance-550', brand: 'New Balance', price: 110, stock: 12,
    sizes: [8, 9, 10, 11], featured: true,
    description: 'The original 550 debuted in 1989 and made its mark on basketball courts from coast to coast.',
    images: [
      'https://images.unsplash.com/photo-1620808608889-ebba75b8e964?w=800&q=80',
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    ]
  },
  {
    name: 'New Balance 990v5', slug: 'new-balance-990v5', brand: 'New Balance', price: 185, stock: 10,
    sizes: [9, 10, 11, 12], featured: false,
    description: 'Worn by supermodels in London and dads in Ohio, the 990 is the ultimate classic sneaker.',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1620808608889-ebba75b8e964?w=800&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80',
    ]
  },
  {
    name: 'New Balance 2002R', slug: 'new-balance-2002r', brand: 'New Balance', price: 140, stock: 8,
    sizes: [8, 9, 10], featured: true,
    description: 'The 2002R offers a nod to running shoes of the 2000s, blending retro design with modern cushioning.',
    images: [
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1620808608889-ebba75b8e964?w=800&q=80',
    ]
  },
  {
    name: 'New Balance 327', slug: 'new-balance-327', brand: 'New Balance', price: 100, stock: 20,
    sizes: [8, 9, 10, 11, 12], featured: false,
    description: 'The 327 sheds new light on the 70s as a time of innovation by boldly reshaping classic design elements.',
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80',
      'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
    ]
  },
  {
    name: 'New Balance 9060', slug: 'new-balance-9060', brand: 'New Balance', price: 150, stock: 6,
    sizes: [9, 10, 11], featured: false,
    description: 'The 9060 is a new expression of the refined style and innovation-led design of the classic 99X series.',
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    ]
  },

  // ── Puma (3) ─────────────────────────────────────
  {
    name: 'Puma RS-X', slug: 'puma-rs-x', brand: 'Puma', price: 110, stock: 15,
    sizes: [8, 9, 10, 11, 12], featured: true,
    description: 'The RS-X is back. The future-retro silhouette of this sneaker returns with progressive aesthetic.',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    ]
  },
  {
    name: 'Puma Suede Classic', slug: 'puma-suede-classic', brand: 'Puma', price: 75, stock: 25,
    sizes: [8, 9, 10, 11], featured: false,
    description: 'The Suede hit the scene in 1968 and has been changing the game ever since.',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    ]
  },
  {
    name: 'Puma MB.02', slug: 'puma-mb-02', brand: 'Puma', price: 130, stock: 7,
    sizes: [9, 10, 11, 12], featured: false,
    description: 'The MB.02, LaMelo Ball\'s signature shoe, is engineered for out-of-this-world performance.',
    images: [
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80',
    ]
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  /* clear existing */
  await Product.deleteMany({});
  console.log('🗑   Cleared products');

  /* insert products */
  const inserted = await Product.insertMany(products);
  console.log(`📦  Seeded ${inserted.length} products`);

  /* upsert admin user */
  const adminEmail = 'admin@sneakervault.com';
  const hashed = await bcrypt.hash('Admin@1234', 10);
  await User.findOneAndUpdate(
    { email: adminEmail },
    { name: 'Admin', email: adminEmail, password: hashed, isAdmin: true },
    { upsert: true, new: true }
  );
  console.log(`👤  Admin user ready  →  ${adminEmail}  /  Admin@1234`);

  await mongoose.disconnect();
  console.log('🏁  Done!');
}

seed().catch(e => { console.error(e); process.exit(1); });
