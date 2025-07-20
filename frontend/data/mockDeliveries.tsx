export interface Delivery {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    status: string;
    amount: number; // tiền thu hộ
}

export const mockDeliveries: Delivery[] = [
    {
        id: '001',
        customerName: 'Nguyễn Văn A',
        phone: '0909123456',
        address: '12 Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội',
        status: 'New',
        amount: 120000,
    },
    {
        id: '002',
        customerName: 'Trần Thị B',
        phone: '0912345678',
        address: '34 Hai Bà Trưng, Q. Hoàn Kiếm, Hà Nội',
        status: 'Delivering',
        amount: 85000,
    },
    {
        id: '003',
        customerName: 'Phạm Văn C',
        phone: '0987654321',
        address: '56 Nguyễn Du, Q. Hai Bà Trưng, Hà Nội',
        status: 'Completed',
        amount: 150000,
    },
];

export function getDeliveries() {
    return mockDeliveries;
}

export function updateDeliveryStatus(id: string, newStatus: string) {
    const delivery = mockDeliveries.find((d) => d.id === id);
    if (delivery) {
        delivery.status = newStatus;
    }
}