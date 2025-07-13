export interface Category {
    _id: string;
    category: string;
    icon: string;
  }
  
  export interface SizeOption {
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
    status: 'new' | 'old';
    rating: number;
    categoryId: Category[];
    storeId: {
      _id: string;
      name: string;
      address: string;
      contact: string;
      openHours: string;
      isActive: boolean;
      mapUrl: string;
      image: string;
    };
    sizeOptions: SizeOption[];        // 💥 thêm đúng model Size
    toppingOptions: ToppingOption[];  // 💥 thêm đúng model Topping
    isBanned: boolean;                // 💥 thêm vì backend có
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