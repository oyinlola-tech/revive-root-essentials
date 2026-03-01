export interface Product {
  id: string;
  name: string;
  category: 'hair' | 'skincare';
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  size: string;
  featured?: boolean;
}

export const products: Product[] = [
  // Hair Care Products
  {
    id: 'hair-1',
    name: 'Revitalizing Hair Oil',
    category: 'hair',
    price: 32,
    image: 'https://images.unsplash.com/photo-1667242003572-96caaf8ac5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwb2lsJTIwYm90dGxlfGVufDF8fHx8MTc3MjM2NTI2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Our signature hair oil is formulated with natural ingredients to nourish, strengthen, and revitalize your hair from root to tip.',
    ingredients: ['Argan Oil', 'Coconut Oil', 'Vitamin E', 'Rosemary Extract', 'Jojoba Oil'],
    benefits: [
      'Promotes hair growth',
      'Reduces hair fall',
      'Adds natural shine',
      'Strengthens hair roots',
      'Prevents split ends'
    ],
    howToUse: 'Apply a small amount to scalp and hair. Massage gently. Leave for 30 minutes or overnight for best results. Wash with a mild shampoo.',
    size: '100ml',
    featured: true
  },
  {
    id: 'hair-2',
    name: 'Gentle pH Gel Cleanser',
    category: 'hair',
    price: 28,
    image: 'https://images.unsplash.com/photo-1760038548850-bfc356d88b12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY2FyZSUyMHByb2R1Y3RzJTIwYm90dGxlfGVufDF8fHx8MTc3MjM2NTI2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A gentle, pH-balanced cleanser that removes impurities while maintaining your hair\'s natural moisture balance.',
    ingredients: ['Aloe Vera', 'Green Tea Extract', 'Chamomile', 'Biotin', 'Keratin'],
    benefits: [
      'Cleanses without stripping',
      'Balances scalp pH',
      'Reduces frizz',
      'Adds volume',
      'Safe for all hair types'
    ],
    howToUse: 'Apply to wet hair, massage into scalp, and rinse thoroughly. Follow with conditioner for best results.',
    size: '250ml',
    featured: true
  },
  {
    id: 'hair-3',
    name: 'Deep Conditioning Treatment',
    category: 'hair',
    price: 35,
    image: 'https://images.unsplash.com/photo-1751908918403-ba1333a89f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY29uZGl0aW9uZXIlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NzIzNjUyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Intensive treatment that deeply nourishes and repairs damaged hair, leaving it soft, smooth, and manageable.',
    ingredients: ['Shea Butter', 'Avocado Oil', 'Silk Protein', 'Panthenol', 'Vitamin B5'],
    benefits: [
      'Repairs damaged hair',
      'Deep hydration',
      'Improves elasticity',
      'Reduces breakage',
      'Enhances manageability'
    ],
    howToUse: 'Apply to clean, damp hair. Leave for 10-15 minutes. Rinse thoroughly. Use 1-2 times per week.',
    size: '200ml'
  },
  {
    id: 'hair-4',
    name: 'Natural Hair Treatment Mask',
    category: 'hair',
    price: 38,
    image: 'https://images.unsplash.com/photo-1762827990160-9f2d35fb0fd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwaGFpciUyMHRyZWF0bWVudHxlbnwxfHx8fDE3NzIzNjUyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'All-natural treatment mask enriched with botanical extracts to restore vitality and radiance to your hair.',
    ingredients: ['Honey', 'Olive Oil', 'Almond Oil', 'Hibiscus Extract', 'Fenugreek'],
    benefits: [
      'Natural nourishment',
      'Restores shine',
      'Strengthens hair',
      'Soothes scalp',
      'Chemical-free formula'
    ],
    howToUse: 'Apply generously to hair and scalp. Cover with a warm towel. Leave for 20-30 minutes. Rinse and shampoo.',
    size: '150ml'
  },
  {
    id: 'hair-5',
    name: 'Volumizing Hair Spray',
    category: 'hair',
    price: 24,
    image: 'https://images.unsplash.com/photo-1760038548850-bfc356d88b12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY2FyZSUyMHByb2R1Y3RzJTIwYm90dGxlfGVufDF8fHx8MTc3MjM2NTI2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Lightweight spray that adds instant volume and texture without weighing hair down.',
    ingredients: ['Rice Protein', 'Sea Salt', 'Bamboo Extract', 'Wheat Protein', 'Vitamin B12'],
    benefits: [
      'Adds volume',
      'Long-lasting hold',
      'Lightweight formula',
      'No sticky residue',
      'UV protection'
    ],
    howToUse: 'Shake well. Spray onto dry hair from roots to ends. Style as desired.',
    size: '150ml'
  },
  {
    id: 'hair-6',
    name: 'Repair & Restore Serum',
    category: 'hair',
    price: 42,
    image: 'https://images.unsplash.com/photo-1667242003572-96caaf8ac5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwb2lsJTIwYm90dGxlfGVufDF8fHx8MTc3MjM2NTI2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Advanced serum that repairs and protects hair from environmental damage and heat styling.',
    ingredients: ['Argan Oil', 'Marula Oil', 'Ceramides', 'Hyaluronic Acid', 'Vitamin C'],
    benefits: [
      'Heat protection',
      'Repairs damage',
      'Adds shine',
      'Smooths frizz',
      'Environmental protection'
    ],
    howToUse: 'Apply 2-3 drops to damp or dry hair. Focus on ends. Style as usual.',
    size: '50ml',
    featured: true
  },

  // Skincare Products
  {
    id: 'skin-1',
    name: 'Hydrating Face Serum',
    category: 'skincare',
    price: 45,
    image: 'https://images.unsplash.com/photo-1768235146463-328c98e7234d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwY3JlYW18ZW58MXx8fHwxNzcyMzY1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Lightweight serum packed with hydrating ingredients to plump and revitalize your skin.',
    ingredients: ['Hyaluronic Acid', 'Vitamin C', 'Niacinamide', 'Peptides', 'Glycerin'],
    benefits: [
      'Deep hydration',
      'Reduces fine lines',
      'Brightens complexion',
      'Improves skin texture',
      'Boosts collagen production'
    ],
    howToUse: 'Apply 2-3 drops to clean face and neck morning and evening. Follow with moisturizer.',
    size: '30ml',
    featured: true
  },
  {
    id: 'skin-2',
    name: 'Luxury Face Cream',
    category: 'skincare',
    price: 52,
    image: 'https://images.unsplash.com/photo-1591375462077-800a22f5fba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBsdXh1cnl8ZW58MXx8fHwxNzcyMzY1MjY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Rich, luxurious cream that nourishes and protects your skin throughout the day and night.',
    ingredients: ['Shea Butter', 'Ceramides', 'Squalane', 'Vitamin E', 'Rosehip Oil'],
    benefits: [
      'Intense moisturization',
      'Strengthens skin barrier',
      'Anti-aging properties',
      'Smooths skin texture',
      'Long-lasting hydration'
    ],
    howToUse: 'Apply to face and neck after cleansing and serum application. Use morning and night.',
    size: '50ml',
    featured: true
  },
  {
    id: 'skin-3',
    name: 'Organic Moisturizer',
    category: 'skincare',
    price: 38,
    image: 'https://images.unsplash.com/photo-1764599955087-7095c3540510?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBqYXJ8ZW58MXx8fHwxNzcyMzY1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Certified organic moisturizer made with plant-based ingredients for healthy, glowing skin.',
    ingredients: ['Aloe Vera', 'Jojoba Oil', 'Green Tea Extract', 'Chamomile', 'Vitamin B3'],
    benefits: [
      'All-natural formula',
      'Gentle on sensitive skin',
      'Provides balanced hydration',
      'Calms irritation',
      'Eco-friendly ingredients'
    ],
    howToUse: 'Massage into clean skin morning and evening. Suitable for all skin types.',
    size: '60ml'
  },
  {
    id: 'skin-4',
    name: 'Intensive Night Cream',
    category: 'skincare',
    price: 48,
    image: 'https://images.unsplash.com/photo-1609097164673-7cfafb51b926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2lzdHVyaXplciUyMGNyZWFtJTIwc2tpbmNhcmV8ZW58MXx8fHwxNzcyMzY1MjY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Overnight treatment cream that works while you sleep to repair and rejuvenate your skin.',
    ingredients: ['Retinol', 'Peptides', 'Bakuchiol', 'Collagen', 'Coenzyme Q10'],
    benefits: [
      'Overnight repair',
      'Reduces wrinkles',
      'Firms skin',
      'Evens skin tone',
      'Boosts cell renewal'
    ],
    howToUse: 'Apply to clean face before bed. Allow to absorb fully. Use 3-4 times per week.',
    size: '50ml'
  },
  {
    id: 'skin-5',
    name: 'Gentle Exfoliating Scrub',
    category: 'skincare',
    price: 32,
    image: 'https://images.unsplash.com/photo-1764599955087-7095c3540510?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBqYXJ8ZW58MXx8fHwxNzcyMzY1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Gentle physical exfoliant that removes dead skin cells and reveals smoother, brighter skin.',
    ingredients: ['Bamboo Extract', 'Walnut Shell Powder', 'Aloe Vera', 'Vitamin E', 'Honey'],
    benefits: [
      'Removes dead skin',
      'Unclogs pores',
      'Improves circulation',
      'Smooths texture',
      'Prepares skin for treatments'
    ],
    howToUse: 'Apply to damp skin in circular motions. Rinse thoroughly. Use 2-3 times per week.',
    size: '100ml'
  },
  {
    id: 'skin-6',
    name: 'Brightening Eye Cream',
    category: 'skincare',
    price: 44,
    image: 'https://images.unsplash.com/photo-1768235146463-328c98e7234d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwY3JlYW18ZW58MXx8fHwxNzcyMzY1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Targeted treatment for the delicate eye area to reduce dark circles and puffiness.',
    ingredients: ['Caffeine', 'Vitamin K', 'Peptides', 'Hyaluronic Acid', 'Cucumber Extract'],
    benefits: [
      'Reduces dark circles',
      'Diminishes puffiness',
      'Hydrates eye area',
      'Reduces fine lines',
      'Brightens skin'
    ],
    howToUse: 'Gently pat around eye area using ring finger. Use morning and evening.',
    size: '15ml',
    featured: true
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: 'hair' | 'skincare'): Product[] => {
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.featured);
};
