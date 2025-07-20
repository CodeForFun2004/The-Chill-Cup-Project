export interface Category {
    _id: string;
    category: string;
    icon: string;
  }

  export interface Store {
    _id: string;
    name: string;
    address: string;
    contact?: string;
    openHours?: string;
    isActive: boolean;
    mapUrl?: string;
    image?: string;
    staff: {
      _id: string;
      username: string;
      fullname: string;
      email?: string;
      // 👉 thêm các field khác từ User nếu cần
    };
    createdAt: string;
    updatedAt: string;
  }
  
  
  export interface SizeOption {
    _id: string;
    size: 'S' | 'M' | 'L';
    name: string;
    multiplier: number;
    volume: string;
  }
  
  export interface ToppingOption {
    _id: string;
    name: string;
    price: number;
    icon: string;
  }
  
  export interface Product {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    image: string;
    status: string;
    rating: number;
    categoryId: Category[];
    storeId: Store;
    sizeOptions: SizeOption[];   // 💥 đã fix đúng
    toppingOptions: ToppingOption[];
  }
  

  
  
  export interface GroupedProduct {
    _id: string;
    category: string;
    drinks: Product[];
  }
  
  export interface ProductState {
    products: Product[];
    groupedProducts: GroupedProduct[];
    loading: boolean;
    error: string | null;
  }