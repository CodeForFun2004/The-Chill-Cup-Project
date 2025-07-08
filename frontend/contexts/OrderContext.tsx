import React, { createContext, useContext, useState } from "react";

export type OrderMethod = "delivery" | "pickup";

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryAddress {
  text: string;
  latitude: number;
  longitude: number;
}

interface OrderContextProps {
  method: OrderMethod;
  setMethod: (m: OrderMethod) => void;
  store: Store | null;
  setStore: (s: Store | null) => void;
  deliveryAddress: DeliveryAddress | null;
  setDeliveryAddress: (a: DeliveryAddress | null) => void;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [method, setMethod] = useState<OrderMethod>("pickup");
  const [store, setStore] = useState<Store | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);

  return (
    <OrderContext.Provider
      value={{ method, setMethod, store, setStore, deliveryAddress, setDeliveryAddress }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used inside OrderProvider");
  return context;
};
