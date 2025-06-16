// // Types for Order History components
// export interface OrderItem {
//   name: string;
//   quantity: number;
//   price: number;
// }

// export interface Order {
//   id: string;
//   orderNumber: string;
//   date: string;
//   time: string;
//   status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing';
//   total: number;
//   items: OrderItem[];
// }

// export interface OrderHistoryScreenProps {
//   navigation: {
//     navigate: (screen: string, params?: any) => void;
//     goBack: () => void;
//   };
// }

// export interface OrderDetailScreenProps {
//   route: {
//     params: {
//       order: Order;
//     };
//   };
//   navigation: {
//     navigate: (screen: string, params?: any) => void;
//     goBack: () => void;
//   };
// }