import type React from "react"
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { StaffStackParamList } from "../../navigation/staff/StaffNavigator"
// Types


type StaffDashboardNavigationProp = NativeStackNavigationProp<StaffStackParamList, "StaffDashboard">

interface StaffDashboardScreenProps {
  navigation: StaffDashboardNavigationProp
}

interface RootState {
  staff: {
    orderStats: {
      totalOrders: number
      pendingOrders: number
      completedOrders: number
      cancelledOrders: number
    }
    revenueStats: {
      dailyRevenue: number
      weeklyRevenue: number
      monthlyRevenue: number
      averageOrderValue: number
    }
  }
}

const { width } = Dimensions.get("window")
const cardWidth = (width - 48) / 2 // 2 cards per row with margins

const StaffDashboardScreen: React.FC<StaffDashboardScreenProps> = ({ navigation }) => {
  const { orderStats, revenueStats } = useSelector((state: RootState) => state.staff)

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Stats cards data
  const orderStatsCards = [
    {
      title: "Tổng đơn hàng",
      value: orderStats.totalOrders.toString(),
      icon: "receipt-outline",
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      title: "Đang chờ",
      value: orderStats.pendingOrders.toString(),
      icon: "time-outline",
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    {
      title: "Hoàn thành",
      value: orderStats.completedOrders.toString(),
      icon: "checkmark-circle-outline",
      color: "#059669",
      bgColor: "#F0FDF4",
    },
    {
      title: "Đã hủy",
      value: orderStats.cancelledOrders.toString(),
      icon: "close-circle-outline",
      color: "#DC2626",
      bgColor: "#FEF2F2",
    },
  ]

  const revenueStatsCards = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(revenueStats.dailyRevenue),
      icon: "today-outline",
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
    {
      title: "Doanh thu tuần",
      value: formatCurrency(revenueStats.weeklyRevenue),
      icon: "calendar-outline",
      color: "#06B6D4",
      bgColor: "#F0F9FF",
    },
    {
      title: "Doanh thu tháng",
      value: formatCurrency(revenueStats.monthlyRevenue),
      icon: "stats-chart-outline",
      color: "#EC4899",
      bgColor: "#FDF2F8",
    },
    {
      title: "Giá trị TB/đơn",
      value: formatCurrency(revenueStats.averageOrderValue),
      icon: "trending-up-outline",
      color: "#F97316",
      bgColor: "#FFF7ED",
    },
  ]

  const quickActions = [
    {
      title: "Quản lý đơn hàng",
      subtitle: "Xem và cập nhật đơn hàng",
      icon: "list-outline",
      color: "#10B981",
      onPress: () => navigation.navigate("OrderManagement"),
    },
    {
      title: "Đơn hàng chờ",
      subtitle: `${orderStats.pendingOrders} đơn cần xử lý`,
      icon: "notifications-outline",
      color: "#F59E0B",
      onPress: () => navigation.navigate("OrderManagement"),
    },
  ]

  const renderStatsCard = (item: any, index: number) => (
    <View key={index} style={[styles.statsCard, { backgroundColor: item.bgColor }]}>
      <View style={styles.statsCardHeader}>
        <Ionicons name={item.icon} size={24} color={item.color} />
        <Text style={[styles.statsValue, { color: item.color }]}>{item.value}</Text>
      </View>
      <Text style={styles.statsTitle}>{item.title}</Text>
    </View>
  )

  const renderQuickAction = (item: any, index: number) => (
    <TouchableOpacity key={index} style={styles.quickActionCard} onPress={item.onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + "15" }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{item.title}</Text>
        <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Chào mừng trở lại!</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê đơn hàng</Text>
          <View style={styles.statsGrid}>{orderStatsCards.map(renderStatsCard)}</View>
        </View>

        {/* Revenue Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê doanh thu</Text>
          <View style={styles.statsGrid}>{revenueStatsCards.map(renderStatsCard)}</View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsContainer}>{quickActions.map(renderQuickAction)}</View>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt hôm nay</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đơn hàng hoàn thành:</Text>
              <Text style={styles.summaryValue}>{orderStats.completedOrders}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Doanh thu:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(revenueStats.dailyRevenue)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đơn hàng trung bình:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(revenueStats.averageOrderValue)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statsCard: {
    width: cardWidth,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  statsCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statsTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
})

export default StaffDashboardScreen
