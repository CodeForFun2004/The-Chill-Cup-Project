export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
}

export interface RevenueStats {
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
}

export interface StaffOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: "Pending" | "Confirmed" | "Preparing" | "Ready" | "Delivering" | "Completed" | "Cancelled"
  orderTime: string
  estimatedTime?: string
  notes?: string
  paymentMethod: string
  orderType: "Dine-in" | "Takeaway" | "Delivery"
}

// Mock data
export const mockOrderStats: OrderStats = {
  totalOrders: 156,
  pendingOrders: 8,
  completedOrders: 142,
  cancelledOrders: 6,
}

export const mockRevenueStats: RevenueStats = {
  dailyRevenue: 2450000,
  weeklyRevenue: 15680000,
  monthlyRevenue: 67200000,
  averageOrderValue: 157000,
}

export const mockStaffOrders: StaffOrder[] = [
  {
    id: "1",
    orderNumber: "#ORD-001",
    customerName: "Nguyễn Văn An",
    customerPhone: "0901234567",
    items: [
      { name: "Cappuccino", quantity: 2, price: 45000 },
      { name: "Bánh croissant", quantity: 1, price: 35000 },
    ],
    total: 125000,
    status: "Pending",
    orderTime: "08:30",
    estimatedTime: "15 phút",
    paymentMethod: "Tiền mặt",
    orderType: "Dine-in",
    notes: "Ít đường, không kem",
  },
  {
    id: "2",
    orderNumber: "#ORD-002",
    customerName: "Trần Thị Bình",
    customerPhone: "0912345678",
    items: [
      { name: "Latte", quantity: 1, price: 50000 },
      { name: "Bánh mì sandwich", quantity: 1, price: 65000 },
    ],
    total: 115000,
    status: "Preparing",
    orderTime: "08:45",
    estimatedTime: "10 phút",
    paymentMethod: "Chuyển khoản",
    orderType: "Takeaway",
  },
  {
    id: "3",
    orderNumber: "#ORD-003",
    customerName: "Lê Minh Cường",
    customerPhone: "0923456789",
    items: [
      { name: "Americano", quantity: 1, price: 40000 },
      { name: "Bánh tiramisu", quantity: 1, price: 75000 },
    ],
    total: 115000,
    status: "Ready",
    orderTime: "09:00",
    paymentMethod: "Thẻ tín dụng",
    orderType: "Dine-in",
  },
  {
    id: "4",
    orderNumber: "#ORD-004",
    customerName: "Phạm Thị Dung",
    customerPhone: "0934567890",
    items: [
      { name: "Mocha", quantity: 2, price: 55000 },
      { name: "Bánh cheesecake", quantity: 1, price: 80000 },
    ],
    total: 190000,
    status: "Delivering",
    orderTime: "09:15",
    paymentMethod: "Ví điện tử",
    orderType: "Delivery",
    notes: "Giao tận nơi, tầng 3",
  },
  {
    id: "5",
    orderNumber: "#ORD-005",
    customerName: "Hoàng Văn Em",
    customerPhone: "0945678901",
    items: [{ name: "Espresso", quantity: 3, price: 35000 }],
    total: 105000,
    status: "Completed",
    orderTime: "07:30",
    paymentMethod: "Tiền mặt",
    orderType: "Takeaway",
  },
]
