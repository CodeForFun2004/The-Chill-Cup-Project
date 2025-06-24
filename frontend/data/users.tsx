// data/users.tsx

export type User = {
  username: string;
  password: string;
  role: "guest" | "customer" | "admin" | "staff" | "shipper";
  id: string;
  name: string;
};

export const users: User[] = [
  {
    username: "user1",
    password: "123",
    role: "customer",
    id: "M162445270",
    name: "Khách hàng A",
  },
  {
    username: "user2",
    password: "123",
    role: "customer",
    id: "M162445270",
    name: "Khách hàng B",
  },
  {
    username: "admin1",
    password: "admin123",
    role: "admin",
    id: "A001",
    name: "Quản trị viên",
  },
  {
    username: "staff1",
    password: "staff123",
    role: "staff",
    id: "S001",
    name: "Nhân viên pha chế",
  },
  {
    username: "shipper1",
    password: "ship123",
    role: "shipper",
    id: "D001",
    name: "Shipper B",
  },
];
