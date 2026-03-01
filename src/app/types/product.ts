export interface Product {
  id: string;
  backendId: string;
  name: string;
  currency: string;
  category: "hair" | "skincare";
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  size: string;
  featured?: boolean;
}
