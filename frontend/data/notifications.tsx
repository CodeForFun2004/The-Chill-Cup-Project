export interface Notification {
  id: string
  type: "order" | "promotion"
  title: string
  message: string
  timestamp: string
  timeAgo: string
  isRead: boolean
  orderNumber?: string
  image?: any
  actionType?: "track_order" | "view_promotion" | "none"
  promotionCode?: string
  discount?: string
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Đơn hàng sẵn sàng lấy! ☕",
    message: "Đơn hàng #ORD-001 của bạn đã sẵn sàng. Vui lòng đến lấy trong vòng 15 phút.",
    timestamp: "2024-01-15 10:45 AM",
    timeAgo: "2 phút trước",
    isRead: false,
    orderNumber: "#ORD-001",
    actionType: "track_order",
  },
  {
    id: "2",
    type: "promotion",
    title: "Flash Sale: Giảm 30% tất cả đồ uống! 🎉",
    message: "Ưu đãi có thời hạn! Giảm 30% cho tất cả đồ uống chỉ hôm nay. Sử dụng mã FLASH30.",
    timestamp: "2024-01-15 09:00 AM",
    timeAgo: "1 giờ trước",
    isRead: false,
    actionType: "view_promotion",
    promotionCode: "FLASH30",
    discount: "30%",
    image: "/placeholder.svg?height=120&width=300",
  },
  {
    id: "3",
    type: "order",
    title: "Đang pha chế đơn hàng 👨‍🍳",
    message: "Đơn hàng #ORD-002 của bạn đang được pha chế bởi các barista chuyên nghiệp.",
    timestamp: "2024-01-15 08:30 AM",
    timeAgo: "2 giờ trước",
    isRead: false,
    orderNumber: "#ORD-002",
    actionType: "track_order",
  },
  {
    id: "4",
    type: "promotion",
    title: "Menu mới: Emerald Latte ✨",
    message: "Thử Emerald Latte đặc trưng với matcha và vanilla. Có sẵn ngay bây giờ!",
    timestamp: "2024-01-14 06:00 PM",
    timeAgo: "18 giờ trước",
    isRead: true,
    actionType: "view_promotion",
    image: "/placeholder.svg?height=120&width=300",
  },
  {
    id: "5",
    type: "order",
    title: "Đơn hàng đã xác nhận ✅",
    message: "Đơn hàng #ORD-003 đã được xác nhận. Thời gian pha chế dự kiến: 15 phút.",
    timestamp: "2024-01-14 02:15 PM",
    timeAgo: "1 ngày trước",
    isRead: true,
    orderNumber: "#ORD-003",
    actionType: "track_order",
  },
  {
    id: "6",
    type: "promotion",
    title: "Ưu đãi cuối tuần: Mua 2 tặng 1! 🎁",
    message: "Chỉ cuối tuần này! Mua 2 đồ uống bất kỳ và nhận miễn phí ly thứ 3.",
    timestamp: "2024-01-13 10:00 AM",
    timeAgo: "2 ngày trước",
    isRead: true,
    actionType: "view_promotion",
    image: "/placeholder.svg?height=120&width=300",
  },
  {
    id: "7",
    type: "order",
    title: "Giao hàng thành công! 🏠",
    message: "Đơn hàng #ORD-004 đã được giao. Cảm ơn bạn đã chọn chúng tôi!",
    timestamp: "2024-01-12 04:30 PM",
    timeAgo: "3 ngày trước",
    isRead: true,
    orderNumber: "#ORD-004",
    actionType: "none",
  },
  {
    id: "8",
    type: "promotion",
    title: "Thành viên VIP: Giảm 25% 👑",
    message: "Chúc mừng! Bạn đã trở thành thành viên VIP. Nhận ngay 25% giảm giá.",
    timestamp: "2024-01-11 03:00 PM",
    timeAgo: "4 ngày trước",
    isRead: true,
    actionType: "view_promotion",
    promotionCode: "VIP25",
    discount: "25%",
  },
]
