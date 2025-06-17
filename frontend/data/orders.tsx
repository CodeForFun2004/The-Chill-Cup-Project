// data/orders.tsx
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled' | 'Pending' | 'Processing' | 'Preparing' | 'Ready' | 'Delivering';
  total: number;
  items: OrderItem[];
  estimatedDelivery?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}
// Dữ liệu mẫu ban đầu
const mockOrderHistory: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-001',
    date: '2024-01-15',
    time: '10:30 AM',
    status: 'Delivering',
    total: 155000,
    items: [
      { name: 'Cappuccino', quantity: 2, price: 45000 },
      { name: 'Croissant', quantity: 1, price: 65000 },
    ],
    estimatedDelivery: '11:00 AM',
    deliveryAddress: '123 Coffee Street, Brew City',
  },
  {
    id: '2',
    orderNumber: '#ORD-002',
    date: '2024-01-14',
    time: '2:15 PM',
    status: 'Preparing',
    total: 87500,
    items: [
      { name: 'Latte', quantity: 1, price: 52500 },
      { name: 'Blueberry Muffin', quantity: 1, price: 35000 },
    ],
    estimatedDelivery: '2:45 PM',
  },
  {
    id: '3',
    orderNumber: '#ORD-003',
    date: '2024-01-13',
    time: '8:45 AM',
    status: 'Completed',
    total: 122500,
    items: [
      { name: 'Americano', quantity: 1, price: 37500 },
      { name: 'Sandwich', quantity: 1, price: 85000 },
    ],
  },
  {
    id: '4',
    orderNumber: '#ORD-004',
    date: '2024-01-12',
    time: '3:20 PM',
    status: 'Ready',
    total: 75000,
    items: [
      { name: 'Espresso', quantity: 2, price: 37500 },
    ],
  },
  {
    id: '5',
    orderNumber: '#ORD-005',
    date: '2024-01-11',
    time: '10:15 AM',
    status: 'Cancelled',
    total: 180000,
    items: [
      { name: 'Frappuccino', quantity: 1, price: 65000 },
      { name: 'Cake', quantity: 1, price: 115000 },
    ],
  },
  {
    id: '6',
    orderNumber: '#ORD-006',
    date: '2024-01-10',
    time: '9:30 AM',
    status: 'Processing',
    total: 92500,
    items: [
      { name: 'Mocha', quantity: 1, price: 57500 },
      { name: 'Cookie', quantity: 1, price: 35000 },
    ],
  },
  {
    id: '7',
    orderNumber: '#ORD-007',
    date: '2024-01-09',
    time: '4:45 PM',
    status: 'Pending',
    total: 65000,
    items: [
      { name: 'Green Tea', quantity: 1, price: 32500 },
      { name: 'Donut', quantity: 1, price: 32500 },
    ],
  },
  {
    id: '8',
    orderNumber: '#ORD-008',
    date: '2024-01-08',
    time: '11:20 AM',
    status: 'Completed',
    total: 147500,
    items: [
      { name: 'Caramel Latte', quantity: 1, price: 62500 },
      { name: 'Bagel', quantity: 1, price: 85000 },
    ],
  },
];

// ✅ Mảng này có thể thay đổi trong runtime (dùng khi thêm order mới)
export let orders: Order[] = [...mockOrderHistory];

// ✅ Hàm thêm order mới (để gọi sau khi đặt hàng thành công)
export const addOrder = (newOrder: Order) => {
  orders.unshift(newOrder); // thêm lên đầu
};