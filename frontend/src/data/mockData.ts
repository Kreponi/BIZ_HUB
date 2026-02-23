// Mock database structure simulating Supabase tables

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  seller_phone: string;
  seller_name: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type:
    | "page_visit"
    | "product_click"
    | "category_click"
    | "search"
    | "whatsapp_contact";
  product_id?: string;
  category_id?: string;
  search_term?: string;
  timestamp: string;
  session_id: string;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
}

// Mock Categories - now mutable for CRUD operations
export let categories: Category[] = [
  {
    id: "1",
    name: "Men's Shoes",
    description:
      "Stylish and comfortable shoes for men - sneakers, formal, sports & more",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Women's Shoes",
    description:
      "Elegant and trendy footwear for women - heels, flats, sneakers & more",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Men's Clothing",
    description:
      "Premium clothing for men - shirts, pants, jackets & accessories",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Women's Clothing",
    description:
      "Fashionable clothing for women - dresses, tops, jeans & accessories",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Tech",
    description:
      "Latest gadgets and electronics - smartphones, laptops, accessories & more",
    created_at: "2024-01-01T00:00:00Z",
  },
];

// Mock Products - now mutable for CRUD operations
export let products: Product[] = [
  // Men's Shoes
  {
    id: "p1",
    name: "Nike Air Max 270",
    description:
      "Men's running shoes with large Air unit for exceptional cushioning. Breathable mesh upper with modern styling.",
    price: 149.99,
    category_id: "1",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    seller_phone: "+1234567890",
    seller_name: "Nike Official Store",
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "p2",
    name: "Adidas Ultraboost 23",
    description:
      "Men's premium running shoes with responsive BOOST cushioning for maximum energy return.",
    price: 189.99,
    category_id: "1",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ],
    seller_phone: "+1234567891",
    seller_name: "Adidas Sports Hub",
    created_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "p3",
    name: "Men's Formal Oxford Shoes",
    description:
      "Classic leather oxford shoes perfect for business meetings and formal occasions.",
    price: 129.99,
    category_id: "1",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    ],
    seller_phone: "+1234567892",
    seller_name: "Formal Footwear Co.",
    created_at: "2024-01-17T00:00:00Z",
  },
  {
    id: "p4",
    name: "Converse Chuck Taylor - Men",
    description:
      "Classic men's canvas sneakers with timeless style. Features iconic rubber toe cap.",
    price: 65.0,
    category_id: "1",
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80",
    ],
    seller_phone: "+1234567893",
    seller_name: "Converse Classics",
    created_at: "2024-01-18T00:00:00Z",
  },
  {
    id: "p5",
    name: "Timberland Boots - Men",
    description:
      "Rugged waterproof boots for men. Premium nubuck leather construction for durability.",
    price: 198.0,
    category_id: "1",
    images: [
      "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&q=80",
    ],
    seller_phone: "+1234567894",
    seller_name: "Timberland Outdoor",
    created_at: "2024-01-19T00:00:00Z",
  },

  // Women's Shoes
  {
    id: "p6",
    name: "Women's Nike Air Force 1",
    description:
      "Classic women's sneakers with iconic design. Comfortable leather upper and Air-Sole unit.",
    price: 120.0,
    category_id: "2",
    images: [
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80",
    ],
    seller_phone: "+1234567895",
    seller_name: "Nike Women",
    created_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "p7",
    name: "Elegant High Heels",
    description:
      "Sophisticated high heels perfect for formal events and special occasions.",
    price: 89.99,
    category_id: "2",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    ],
    seller_phone: "+1234567896",
    seller_name: "Elegant Steps",
    created_at: "2024-01-21T00:00:00Z",
  },
  {
    id: "p8",
    name: "Women's Ballet Flats",
    description:
      "Comfortable ballet flats for everyday wear. Soft leather construction with cushioned insole.",
    price: 54.99,
    category_id: "2",
    images: [
      "https://images.unsplash.com/photo-1603808033587-e6ea308e3e61?w=800&q=80",
    ],
    seller_phone: "+1234567897",
    seller_name: "Comfort Shoes",
    created_at: "2024-01-22T00:00:00Z",
  },
  {
    id: "p9",
    name: "Women's Running Shoes",
    description:
      "Lightweight running shoes designed specifically for women. Excellent cushioning and support.",
    price: 135.0,
    category_id: "2",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
    ],
    seller_phone: "+1234567898",
    seller_name: "Athletic Women",
    created_at: "2024-01-23T00:00:00Z",
  },
  {
    id: "p10",
    name: "Women's Ankle Boots",
    description:
      "Stylish ankle boots perfect for fall and winter. Features block heel and side zipper.",
    price: 145.0,
    category_id: "2",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
    ],
    seller_phone: "+1234567899",
    seller_name: "Fashion Boots",
    created_at: "2024-01-24T00:00:00Z",
  },

  // Men's Clothing
  {
    id: "p11",
    name: "Men's Casual Button-Down Shirt",
    description:
      "Premium cotton button-down shirt. Perfect for casual and smart-casual occasions.",
    price: 49.99,
    category_id: "3",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    ],
    seller_phone: "+1234567800",
    seller_name: "Style Hub",
    created_at: "2024-01-25T00:00:00Z",
  },
  {
    id: "p12",
    name: "Men's Slim Fit Jeans",
    description:
      "Modern slim-fit jeans with stretch denim. Comfortable and stylish for everyday wear.",
    price: 79.99,
    category_id: "3",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    ],
    seller_phone: "+1234567801",
    seller_name: "Denim Co.",
    created_at: "2024-01-26T00:00:00Z",
  },
  {
    id: "p13",
    name: "Men's Leather Jacket",
    description:
      "Premium genuine leather jacket. Classic design with modern fit and comfort.",
    price: 299.99,
    category_id: "3",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    ],
    seller_phone: "+1234567802",
    seller_name: "Leather Works",
    created_at: "2024-01-27T00:00:00Z",
  },
  {
    id: "p14",
    name: "Men's Polo Shirt",
    description:
      "Classic polo shirt in premium pique cotton. Available in multiple colors.",
    price: 39.99,
    category_id: "3",
    images: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
    ],
    seller_phone: "+1234567803",
    seller_name: "Casual Wear",
    created_at: "2024-01-28T00:00:00Z",
  },
  {
    id: "p15",
    name: "Men's Formal Suit",
    description:
      "Tailored two-piece suit perfect for business and formal occasions. Modern slim fit.",
    price: 399.99,
    category_id: "3",
    images: [
      "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800&q=80",
    ],
    seller_phone: "+1234567804",
    seller_name: "Formal Attire",
    created_at: "2024-01-29T00:00:00Z",
  },

  // Women's Clothing
  {
    id: "p16",
    name: "Women's Summer Dress",
    description:
      "Lightweight floral summer dress. Perfect for warm weather and casual outings.",
    price: 64.99,
    category_id: "4",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
    seller_phone: "+1234567805",
    seller_name: "Summer Fashion",
    created_at: "2024-01-30T00:00:00Z",
  },
  {
    id: "p17",
    name: "Women's Skinny Jeans",
    description:
      "High-waisted skinny jeans with stretch fabric. Comfortable fit with modern styling.",
    price: 69.99,
    category_id: "4",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
    ],
    seller_phone: "+1234567806",
    seller_name: "Denim Fashion",
    created_at: "2024-01-31T00:00:00Z",
  },
  {
    id: "p18",
    name: "Women's Blazer",
    description:
      "Professional blazer perfect for office wear. Tailored fit with premium fabric.",
    price: 129.99,
    category_id: "4",
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
    ],
    seller_phone: "+1234567807",
    seller_name: "Professional Wear",
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "p19",
    name: "Women's Casual Top",
    description:
      "Comfortable casual top in soft cotton blend. Perfect for everyday wear.",
    price: 34.99,
    category_id: "4",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
    ],
    seller_phone: "+1234567808",
    seller_name: "Casual Collection",
    created_at: "2024-02-02T00:00:00Z",
  },
  {
    id: "p20",
    name: "Women's Evening Gown",
    description:
      "Elegant evening gown perfect for special occasions and formal events.",
    price: 249.99,
    category_id: "4",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    ],
    seller_phone: "+1234567809",
    seller_name: "Evening Elegance",
    created_at: "2024-02-03T00:00:00Z",
  },

  // Tech
  {
    id: "p21",
    name: "iPhone 15 Pro Max",
    description:
      "Latest iPhone with A17 Pro chip, advanced camera system, and titanium design.",
    price: 1199.0,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1592286927505-4bdfb50c1451?w=800&q=80",
    ],
    seller_phone: "+1234567810",
    seller_name: "Tech Hub",
    created_at: "2024-02-04T00:00:00Z",
  },
  {
    id: "p22",
    name: 'MacBook Pro 16"',
    description:
      "Powerful laptop with M3 Pro chip, stunning Liquid Retina XDR display.",
    price: 2499.0,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    ],
    seller_phone: "+1234567811",
    seller_name: "Apple Store",
    created_at: "2024-02-05T00:00:00Z",
  },
  {
    id: "p23",
    name: "Sony WH-1000XM5 Headphones",
    description:
      "Premium noise-cancelling headphones with exceptional sound quality and comfort.",
    price: 399.99,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    ],
    seller_phone: "+1234567812",
    seller_name: "Audio Pro",
    created_at: "2024-02-06T00:00:00Z",
  },
  {
    id: "p24",
    name: 'Samsung 4K Smart TV 55"',
    description:
      "55-inch 4K QLED Smart TV with quantum dot technology and smart features.",
    price: 899.99,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
    ],
    seller_phone: "+1234567813",
    seller_name: "Electronics Plus",
    created_at: "2024-02-07T00:00:00Z",
  },
  {
    id: "p25",
    name: "iPad Air 5th Gen",
    description:
      "Versatile tablet with M1 chip, 10.9-inch Liquid Retina display, and Apple Pencil support.",
    price: 599.0,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    ],
    seller_phone: "+1234567814",
    seller_name: "Tech Hub",
    created_at: "2024-02-08T00:00:00Z",
  },
  {
    id: "p26",
    name: "Canon EOS R6 Camera",
    description:
      "Professional mirrorless camera with 20MP full-frame sensor and 4K video.",
    price: 2499.0,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    ],
    seller_phone: "+1234567815",
    seller_name: "Camera World",
    created_at: "2024-02-09T00:00:00Z",
  },
  {
    id: "p27",
    name: "Apple Watch Series 9",
    description:
      "Advanced smartwatch with health monitoring, fitness tracking, and always-on display.",
    price: 429.0,
    category_id: "5",
    images: [
      "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=800&q=80",
    ],
    seller_phone: "+1234567816",
    seller_name: "Wearable Tech",
    created_at: "2024-02-10T00:00:00Z",
  },
];

// Mock Analytics Data (will be updated in-memory)
export let analyticsEvents: AnalyticsEvent[] = [];

// Helper function to generate session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

// Mock Admin
export const admins: Admin[] = [
  {
    id: "admin1",
    email: "admin@bizhub.com",
    role: "super_admin",
  },
];

// CRUD Functions for Categories
export const addCategory = (
  name: string,
  description: string,
  image?: string,
): Category => {
  const newCategory: Category = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    image,
    created_at: new Date().toISOString(),
  };
  categories.push(newCategory);
  return newCategory;
};

export const updateCategory = (
  id: string,
  name: string,
  description: string,
  image?: string,
): boolean => {
  const categoryIndex = categories.findIndex((cat) => cat.id === id);
  if (categoryIndex === -1) return false;

  categories[categoryIndex] = {
    ...categories[categoryIndex],
    name,
    description,
    ...(image && { image }),
  };
  return true;
};

export const deleteCategory = (id: string): boolean => {
  const categoryIndex = categories.findIndex((cat) => cat.id === id);
  if (categoryIndex === -1) return false;

  // Check if category has products
  const hasProducts = products.some((product) => product.category_id === id);
  if (hasProducts) return false;

  categories.splice(categoryIndex, 1);
  return true;
};

// CRUD Functions for Products
export const addProduct = (
  name: string,
  description: string,
  price: number,
  category_id: string,
  seller_name: string,
  seller_phone: string,
  image_url?: string,
): Product => {
  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    price,
    category_id,
    images: image_url
      ? [image_url]
      : [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        ],
    seller_name,
    seller_phone,
    created_at: new Date().toISOString(),
  };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (
  id: string,
  name: string,
  description: string,
  price: number,
  category_id: string,
  seller_name: string,
  seller_phone: string,
  image_url?: string,
): boolean => {
  const productIndex = products.findIndex((prod) => prod.id === id);
  if (productIndex === -1) return false;

  products[productIndex] = {
    ...products[productIndex],
    name,
    description,
    price,
    category_id,
    seller_name,
    seller_phone,
    images: image_url ? [image_url] : products[productIndex].images,
  };
  return true;
};

export const deleteProduct = (id: string): boolean => {
  const productIndex = products.findIndex((prod) => prod.id === id);
  if (productIndex === -1) return false;

  products.splice(productIndex, 1);
  return true;
};
