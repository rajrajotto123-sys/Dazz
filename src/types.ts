export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerSize?: string;
  customerColor?: string;
  products: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  invoiceId: string;
  createdAt: any;
}

export interface Settings {
  phone: string;
  email: string;
  address: string;
  bannerEnabled: boolean;
  adminPass?: string;
}

export interface BannerImage {
  id: string;
  url: string;
  order: number;
  text?: string;
}
