export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  volume: string;
  image_url: string;
  position: number;
  visible: boolean;
  badge: string | null;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  sizes: { size: string; stock: number }[];
  additional_images?: string[];
  created_at?: string;
  hook?: string;
  specs?: {
    longevity?: string;
    projection?: string;
    season?: string;
    occasion?: string;
    gender?: string;
    made_in?: string;
  };
  key_features?: Record<string, string>;
  fragrance_journey?: {
    opening: string;
    heart: string;
    dry_down: string;
  };
  perfect_for?: string[];
  faqs?: { question: string; answer: string }[];
  cross_sells?: string[];
  upsell?: string;
  amazon_bullets?: string[];
  emotional_points?: string[];
  objection_handling?: { question: string; answer: string }[];
  seo_title?: string;
  seo_description?: string;
  shopify_keywords?: string[];
  image_alt?: string[];
  product_tags?: string[];
}

export interface OrderItem {
  id?: number;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    spent?: number;
    orders?: number;
    lastActive?: string;
  };
  total: number;
  status: string;
  shipping_address: {
    street: string;
    city: string;
    zip: string;
    country: string;
    state?: string;
  };
  discount_code: string | null;
  items: OrderItem[];
  payment_status?: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  shipping_carrier?: string | null;
  shipping_tracking_id?: string | null;
  tracking_id?: string | null;
  carrier?: string | null;
  shipping_label_url?: string | null;
  shipping_cost?: number | null;
  created_at?: string;
  date?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  status: string;
  created_at?: string;
  date?: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  location: string;
  message?: string;
  status: string;
  created_at?: string;
  date?: string;
}

export interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  usage_count: number;
  active: boolean;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id?: string | null;
  product_name: string;
  customer: string;
  rating: number;
  comment: string;
  status: string;
  created_at?: string;
  date?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  created_at?: string;
}

export interface PhilosophyConfig {
  eyebrow: string;
  headlinePart1: string;
  headlinePart2: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

export const DEFAULT_PHILOSOPHY: PhilosophyConfig = {
  eyebrow: 'Our Philosophy',
  headlinePart1: 'Silence',
  headlinePart2: 'Is Luxury.',
  description: 'We reject the noise of conventional fragrance. ETERNYX engineers scents that speak without words — complex, enduring, and impossibly refined. A sanctuary for those who know.',
  buttonText: 'About Us',
  buttonUrl: '/story',
  imageUrl: '/images/brand-statement.png'
};

export const DEFAULT_CATEGORIES: string[] = [
  'MENS',
  'UNISEX',
  'WOMEN',
  'BESTSELLER',
  'EAU DE PARFUM',
  'LUXURY BLEND',
  'LIMITED EDITION',
  'SIGNATURE SCENT'
];


