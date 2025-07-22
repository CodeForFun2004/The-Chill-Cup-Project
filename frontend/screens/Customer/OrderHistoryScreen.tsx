import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ListRenderItem,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../../navigation/customer/CustomerStackNavigator";
import axios from "axios";
import { formatCurrency } from "../../utils/formatCurrency";


const { width: screenWidth } = Dimensions.get("window");
const TAB_WIDTH = (screenWidth - 32) / 4;


import { Order } from "../../redux/slices/orderSlice"; // <--- ADD THIS LINE

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  "OrderHistory"
>;

interface OrderHistoryScreenProps {
  navigation: OrderHistoryScreenNavigationProp;
}


type TabType = 'Preparing' | 'Delivering' | 'Completed' | 'Cancelled' | 'Refunded';


// interface Order {
//   id: string;
//   orderNumber: string;
//   date: string;
//   time: string;
//   status: 'completed' | 'cancelled' | 'pending' | 'processing' | 'preparing' | 'ready' | 'delivering';
//   total: number;
//   items: { name: string; quantity: number; price: number }[];
//   estimatedDelivery?: string;
//   deliveryAddress?: string;
//   phoneNumber?: string;
// }


const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("Preparing");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  const tabs: {
    key: TabType;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "Preparing", title: "Đang chuẩn bị", icon: "restaurant-outline" },
    { key: "Delivering", title: "Đang giao", icon: "bicycle-outline" },
    { key: "Completed", title: "Hoàn tất", icon: "checkmark-circle-outline" },
    { key: "Cancelled", title: "Đã hủy", icon: "close-circle-outline" },
    { key: 'Refunded', title: 'Refunded', icon: 'cash-outline' }, // Tab Refund!
  ];

  // Hardcoded Bearer token (expired; replace with a new valid token)
  const HARDCODED_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzBjM2FlY2ZiMmJjNWE0MDEzMzZiYyIsImlhdCI6MTc1MjM2MDU5NiwiZXhwIjoxNzUyMzYxNDk2fQ.qs7UtXpAL3NboQO5qizDROBqufvZP6KFTqPurDnMvAk";

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders with token:", HARDCODED_TOKEN);
      let attempts = 3;
      let response: { data: any } | undefined;

      while (attempts > 0) {
        try {
          response = await axios.get(
            "http://192.168.1.122:8080/api/orders/user",
            {
              headers: {
                Authorization: `Bearer ${HARDCODED_TOKEN}`,
              },
              timeout: 15000,
            }
          );
          // console.log('API Response:', response.data);
          break;
        } catch (err) {
          attempts--;
          if (attempts === 0) {
            throw err;
          }
          console.log(`Retrying... ${attempts} attempts left`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!response || !response.data) {
        setError("No data received from the server.");
        setOrders([]);
        return;
      }

      // Map backend response to frontend Order interface
      const mappedOrders: Order[] = response.data.map((order: any) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString("en-GB"),
        time: new Date(order.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: order.status, // Use lowercase status directly
        total: order.total,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        estimatedDelivery: order.deliveryTime,
        deliveryAddress: order.deliveryAddress,
        phoneNumber: order.phone,
      }));

      setOrders(mappedOrders);
      console.log("Mapped Orders:", mappedOrders);
      setError(null);
    } catch (err) {
      console.error("[Fetch Orders Error]", err);
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          setError("Request timed out. Please check the server connection.");
        } else if (err.response) {
          setError(
            `Error: ${err.response.status} - ${
              err.response.data.error || "Failed to load orders"
            }`
          );
        } else {
          setError(
            "Network error. Please check your connection or server status."
          );
        }
      } else {
        setError("An unexpected error occurred.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // Run only once on mount

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getFilteredOrders = (): Order[] => {
    const filtered = orders.filter((order) => {
      switch (activeTab) {
        case "Preparing":
          return ["processing", "preparing", "ready", "pending"].includes(
            order.status
          );
        case "Delivering":
          return order.status === "delivering";
        case "Completed":
          return order.status === "completed";
        case "Cancelled":
          return order.status === "cancelled";
           case 'Refunded':
        // Lấy tất cả đơn có ít nhất 1 refundRequests (dù trạng thái nào)
        return orders.filter(order => order.refundRequests && order.refundRequests.length > 0);
        default:
          return true;
      }
    });
    // console.log(`Filtered Orders for ${activeTab}:`, filtered);
    return filtered;
  };

  const getTabCount = (tabKey: TabType): number => {
    let count: number;
    switch (tabKey) {
      case "Preparing":
        count = orders.filter((order) =>
          ["processing", "preparing", "ready", "pending"].includes(order.status)
        ).length;
        break;
      case "Delivering":
        count = orders.filter((order) => order.status === "delivering").length;
        break;
      case "Completed":
        count = orders.filter((order) => order.status === "completed").length;
        break;
      case "Cancelled":
        count = orders.filter((order) => order.status === "cancelled").length;
        break;
        case 'Refunded':
        return orders.filter(order => order.refundRequests && order.refundRequests.length > 0).length;
      default:
        count = 0;

    }
    // console.log(`Tab Count for ${tabKey}:`, count);
    return count;
  };

  const getStatusColor = (status: Order["status"]): string => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      case "pending":
        return "#FF9800";
      case "processing":
        return "#2196F3";
      case "preparing":
        return "#9C27B0";
      case "ready":
        return "#00BCD4";
      case "delivering":
        return "#FF5722";
      default:
        return "#757575";
    }
  };

  const getTabColor = (tabKey: TabType): string => {
    switch (tabKey) {

      case 'Preparing':
        return '#9C27B0';
      case 'Delivering':
        return '#FF5722';
      case 'Completed':
        return '#4CAF50';
      case 'Cancelled':
        return '#F44336';
      case 'Refunded':
        return '#009688';

      default:
        return "#007AFF";
    }
  };

  const canTrackOrder = (status: Order["status"]): boolean => {
    const trackableStatuses = [
      "processing",
      "preparing",
      "ready",
      "delivering",
    ];
    return trackableStatuses.includes(status);
  };

  const renderTabItem = (tab: {
    key: TabType;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const isActive = activeTab === tab.key;
    const count = getTabCount(tab.key);
    const tabColor = getTabColor(tab.key);

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tabItem,
          { width: TAB_WIDTH },
          isActive && {
            backgroundColor: tabColor + "15",
            borderBottomColor: tabColor,
            borderBottomWidth: 3,
          },
        ]}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <View style={styles.tabIconContainer}>
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? tabColor : "#8E8E93"}
            />
            {count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: tabColor }]}>
                <Text style={styles.tabBadgeText}>{count}</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.tabText, { color: isActive ? tabColor : "#8E8E93" }]}
          >
            {tab.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Hiển thị nhãn refund theo status mới nhất (nếu có)
  const renderOrderItem: ListRenderItem<Order> = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderTracking", { order: item })}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()} •{" "}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.orderBody}>
        <Text style={styles.itemsText}>
          {item.items.length} item{item.items.length > 1 ? "s" : ""}
        </Text>
        <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
      </View>

      {item.deliveryTime && canTrackOrder(item.status) && (
        <View style={styles.estimatedDeliveryContainer}>
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={styles.estimatedDeliveryText}>
            Est. delivery: {item.deliveryTime}
          </Text>
        </View>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.viewDetailsText}>
          {canTrackOrder(item.status)
            ? "Tap to track order"
            : "Chi tiết đơn hàng"}
        </Text>
        <Ionicons
          name={
            canTrackOrder(item.status) ? "location-outline" : "chevron-forward"
          }
          size={16}
          color="#8E8E93"
        />
      </View>
      {/* Đánh dấu nếu là đơn hoàn tiền */}
      {item.refundRequests && item.refundRequests.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Ionicons name="cash-outline" size={16} color="#009688" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 12, color: '#009688', fontWeight: '500' }}>
            {item.refundRequests[0].status === 'Pending' && 'Đang yêu cầu hoàn tiền'}
            {item.refundRequests[0].status === 'Approved' && 'Đã hoàn tiền'}
            {item.refundRequests[0].status === 'Rejected' && 'Đã từ chối hoàn tiền'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>{tabs.map(renderTabItem)}</View>
      </View>


      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === "Preparing"
                    ? "restaurant-outline"
                    : activeTab === "Delivering"
                    ? "bicycle-outline"
                    : activeTab === "Completed"
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={64}
                color="#C7C7CC"
              />
               {/* <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>  */}
                <Text style={styles.emptyTitle}>
              {activeTab === 'Refunded'
                ? 'Chưa có đơn hoàn tiền nào'
                : `Chưa có ${activeTab} đơn hàng nào`}
            </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === "Preparing" &&
                  "Hiện không có đơn hàng nào đang được chuẩn bị."}
                {activeTab === "Delivering" &&
                  "Hiện không có đơn hàng nào đang được giao."}
                {activeTab === "Completed" &&
                  "Không tìm thấy đơn hàng đã hoàn tất."}
                {activeTab === "Cancelled" && "Không có đơn hàng bị hủy."}
                {activeTab === 'Refunded' && 'Hiện bạn chưa có đơn hàng nào đã gửi yêu cầu hoàn tiền.'}
              </Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
};

// Styles (unchanged, includes previous typo fix for tabsContainer)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabItem: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  tabBadge: {
    position: "absolute",
    top: -10,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  orderBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemsText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  estimatedDeliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  estimatedDeliveryText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 4,
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
});

export default OrderHistoryScreen;
