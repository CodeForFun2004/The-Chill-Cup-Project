export const ORDER_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    GOING_TO_PICKUP: "going_to_pickup",
    ARRIVED_PICKUP: "arrived_pickup",
    PICKED_UP: "picked_up",
    GOING_TO_DELIVERY: "going_to_delivery",
    ARRIVED_DELIVERY: "arrived_delivery",
    COMPLETED: "completed",
} as const

export const STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: "Chờ nhận đơn",
    [ORDER_STATUS.ACCEPTED]: "Đã nhận đơn",
    [ORDER_STATUS.GOING_TO_PICKUP]: "Đang đi lấy hàng",
    [ORDER_STATUS.ARRIVED_PICKUP]: "Đã đến cửa hàng",
    [ORDER_STATUS.PICKED_UP]: "Đã lấy hàng",
    [ORDER_STATUS.GOING_TO_DELIVERY]: "Đang giao hàng",
    [ORDER_STATUS.ARRIVED_DELIVERY]: "Đã đến nơi giao",
    [ORDER_STATUS.COMPLETED]: "Đã giao hàng",
} as const
