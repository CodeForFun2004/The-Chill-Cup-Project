export interface Category {
    _id: string;
    category: string;
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