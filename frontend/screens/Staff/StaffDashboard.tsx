"use client"

import type React from "react"
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector, useDispatch } from "react-redux"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { syncOrdersFromData } from "../../redux/slices/staffSlice"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useState } from "react"
import type { RootState } from "../../redux/store"
import { PieChart } from "react-native-chart-kit"
import type { StaffStackParamList } from "../../navigation/staff/StaffNavigator"



type StaffDashboardNavigationProp = NativeStackNavigationProp<StaffStackParamList, "StaffDashboard">

interface StaffDashboardScreenProps {
  navigation: StaffDashboardNavigationProp
}

const { width } = Dimensions.get("window")
const cardWidth = (width - 48) / 2 // 2 cards per row with margins

const StaffDashboard: React.FC<StaffDashboardScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch()

  const [timeFilter, setTimeFilter] = useState<"week" | "month">("week")
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Safe selector with fallback values
  const staffState = useSelector((state: RootState) => state.staff)

  // Provide default values if staff state is undefined
  const orderStats = staffState?.orderStats || {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    deliveringOrders: 0,
  }

  const revenueStats = staffState?.revenueStats || {
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
  }

  // Sync data khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      dispatch(syncOrdersFromData())
    }, [dispatch]),
  )

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Order Status Chart Data
  const orderChartData = [
    {
      name: "Chờ xử lý",
      population: orderStats.pendingOrders,
      color: "#F59E0B",
      legendFontColor: "#6B7280",
      legendFontSize: 12,
    },
    {
      name: "Đang pha chế",
      population: orderStats.preparingOrders,
      color: "#8B5CF6",
      legendFontColor: "#6B7280",
      legendFontSize: 12,
    },
    {
      name: "Sẵn sàng",
      population: orderStats.readyOrders,
      color: "#06B6D4",
      legendFontColor: "#6B7280",
      legendFontSize: 12,
    },
    {
      name: "Hoàn thành",
      population: orderStats.completedOrders,
      color: "#10B981",
      legendFontColor: "#6B7280",
      legendFontSize: 12,
    },
  ].filter((item) => item.population > 0)

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
    {
      title: "Đang pha chế",
      subtitle: `${orderStats.preparingOrders} đơn đang làm`,
      icon: "restaurant-outline",
      color: "#8B5CF6",
      onPress: () => navigation.navigate("OrderManagement"),
    },
  ]

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

  // Show loading state if staff data is not available
  if (!staffState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header với logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Chào mừng trở lại!</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              // Navigate to Auth
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              })
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Thống kê theo thời gian</Text>
          <View style={styles.timeFilterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === "week" && styles.activeFilterButton]}
              onPress={() => setTimeFilter("week")}
            >
              <Text style={[styles.filterButtonText, timeFilter === "week" && styles.activeFilterButtonText]}>
                Tuần này
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === "month" && styles.activeFilterButton]}
              onPress={() => setTimeFilter("month")}
            >
              <Text style={[styles.filterButtonText, timeFilter === "month" && styles.activeFilterButtonText]}>
                Tháng này
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Status Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.chartContainer}>
            {orderChartData.length > 0 ? (
              <PieChart
                data={orderChartData}
                width={width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Không có dữ liệu</Text>
              </View>
            )}
          </View>
        </View>

        {/* Revenue Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan doanh thu</Text>
          <View style={styles.revenueOverview}>
            <View style={styles.revenueCard}>
              <View style={styles.revenueIconContainer}>
                <Ionicons name="trending-up" size={24} color="#10B981" />
              </View>
              <View style={styles.revenueInfo}>
                <Text style={styles.revenueLabel}>{timeFilter === "week" ? "Tuần này" : "Tháng này"}</Text>
                <Text style={styles.revenueValue} >
                  {formatCurrency(timeFilter === "week" ? revenueStats.weeklyRevenue : revenueStats.monthlyRevenue)}
                  
                </Text>
                
                <Text style={styles.revenueSubtext}>TB/đơn: {formatCurrency(revenueStats.averageOrderValue)}</Text>
              </View>
            </View>
          </View>
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
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đang chờ xử lý:</Text>
              <Text style={[styles.summaryValue, { color: orderStats.pendingOrders > 0 ? "#F59E0B" : "#10B981" }]}>
                {orderStats.pendingOrders}
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
    marginTop: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#10B981",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  revenueOverview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  revenueCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  revenueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  revenueSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
})

export default StaffDashboard
