export type Category = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  product_count?: number;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  images: string[];
  seller_phone: string;
  seller_name: string;
  created_at: string;
};
