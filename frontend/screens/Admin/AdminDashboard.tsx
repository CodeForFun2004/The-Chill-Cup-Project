import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice'; 
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../../navigation/admin/AdminNavigator';


const screenWidth = Dimensions.get('window').width;

// Main Component
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const [isActionsExpanded, setIsActionsExpanded] = useState(true);
  // Thêm state cho popup cảnh báo hết hàng
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: async () => { // <--- Thêm async vào đây
          await dispatch(logoutUser() as any); // <-- Dispatch thunk logoutUser
          // Sau khi logout thành công (cả Redux và AsyncStorage đã được clear)
          // Điều hướng người dùng về màn hình khách hoặc màn hình bắt đầu
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }], // <-- Đảm bảo đây là Guest Navigator hoặc màn hình khởi đầu cho khách
            })
          );
        },
        style: 'destructive',
      },
    ]);
  };

  const handleTaskPress = (task: any) => {
    (navigation as any).navigate(task.screen);
  };

  // Đếm số lượng cảnh báo hết hàng
  const lowStockCount = mockLowStock.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Icon chuông cảnh báo */}
          <TouchableOpacity onPress={() => setShowLowStockModal(true)} style={{ marginRight: 18 }}>
            <View>
              <Ionicons name="notifications-outline" size={26} color={lowStockCount > 0 ? '#e67e22' : '#636e72'} />
              {lowStockCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: '#e74c3c',
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 3,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{lowStockCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#e84118" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal cảnh báo hết hàng */}
      <Modal
        visible={showLowStockModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLowStockModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 22, width: '85%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#d35400', marginBottom: 12 }}>Cảnh báo sắp hết hàng</Text>
            {mockLowStock.length === 0 ? (
              <Text style={{ color: '#636e72' }}>Tất cả nguyên liệu đều đủ tồn kho.</Text>
            ) : (
              mockLowStock.map(item => (
                <View key={item.name} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#e17055', fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ color: '#e74c3c' }}>Còn lại: {item.stock}</Text>
                </View>
              ))
            )}
            <TouchableOpacity onPress={() => setShowLowStockModal(false)} style={{ marginTop: 18, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 15 }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <StatsGrid />
        <ChartsSection />

        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setIsActionsExpanded(!isActionsExpanded)}
        >
          <Text style={styles.sectionTitle}>Tác vụ nhanh</Text>
          <Ionicons
            name={isActionsExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={22}
            color="#333"
          />
        </TouchableOpacity>

        {isActionsExpanded && <ActionsGrid onTaskPress={handleTaskPress} />}
      </ScrollView>
    </SafeAreaView>
  );
};

// Sub-components for better structure
const StatsGrid = () => {
  const statsData = [
    { value: mockStats.totalSales, label: 'Doanh thu', icon: 'cash-outline', color: '#1abc9c' },
    { value: mockStats.totalOrders, label: 'Đơn hàng', icon: 'receipt-outline', color: '#3498db' },
    { value: mockStats.activeUsers, label: 'Active users/ngày', icon: 'people-outline', color: '#e17055' },
    { value: mockStats.growth, label: 'Tăng trưởng', icon: 'trending-up-outline', color: '#e67e22' },
  ];
  return (
    <View style={styles.statsGridContainer}>
      {statsData.map(item => (
        <View key={item.label} style={[styles.statCard, { borderLeftColor: item.color }]}> 
          <Ionicons name={item.icon as any} size={28} color={item.color} />
          <View style={styles.statCardText}>
            <Text style={styles.statCardValue}>{item.value}</Text>
            <Text style={styles.statCardLabel}>{item.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const ChartsSection = () => {
  const lineChartData = mockDailyRevenue;
  const barChartData = {
    labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
  };
  return (
    <>
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Doanh thu từng ngày (triệu)</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - 60}
          height={180}
          chartConfig={chartConfig}
          style={styles.chartStyle}
          yAxisLabel=""
          yAxisSuffix="tr"
          bezier
        />
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Lợi nhuận tháng (triệu)</Text>
        <BarChart
          data={barChartData}
          width={screenWidth - 60}
          height={180}
          chartConfig={chartConfig}
          style={styles.chartStyle}
          yAxisLabel=""
          yAxisSuffix="tr"
          fromZero
        />
      </View>
      <BestSellingDrinks />
      {/* Đã bỏ LowStockAlerts khỏi đây */}
    </>
  );
};

const ActionsGrid = ({ onTaskPress }: { onTaskPress: (task: any) => void }) => {
  const adminTasks = [
    { name: 'Sản phẩm', icon: 'cube-outline', screen: 'ProductTopping', color: '#3b82f6' },
    { name: 'Cửa hàng', icon: 'storefront-outline', screen: 'Stores', iconType: 'MaterialCommunityIcons', color: '#f97316' },
    { name: 'Khuyến mãi', icon: 'pricetags-outline', screen: 'Promotions', color: '#ef4444' },
    { name: 'Đơn & Giao hàng', icon: 'truck-delivery-outline', screen: 'OrderDelivery', iconType: 'MaterialCommunityIcons', color: '#8b5cf6' },
    { name: 'Người dùng', icon: 'people-outline', screen: 'Users', color: '#636e72' },
  ];

  const row1 = adminTasks.slice(0, 3);
  const row2 = adminTasks.slice(3);

  const renderRow = (rowItems: typeof adminTasks) => (
    <View style={styles.actionRow}>
      {rowItems.map(task => (
        <TouchableOpacity key={task.name} style={styles.actionButton} onPress={() => onTaskPress(task)}>
          <View style={[styles.actionIconContainer, { backgroundColor: task.color }]}>
            {task.iconType === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons name={task.icon as any} size={30} color="#fff" />
            ) : (
              <Ionicons name={task.icon as any} size={30} color="#fff" />
            )}
          </View>
          <Text style={styles.actionButtonLabel}>{task.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View>
      {renderRow(row1)}
      {renderRow(row2)}
    </View>
  );
};

// Hiển thị top đồ uống bán chạy nhất
const BestSellingDrinks = () => (
  <View style={styles.chartContainer}>
    <Text style={styles.sectionTitle}>Top đồ uống bán chạy</Text>
    {mockBestSellingDrinks.map((item, idx) => (
      <View key={item.name} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontWeight: 'bold' }}>{idx + 1}. {item.name}</Text>
        <Text style={{ color: '#636e72' }}>{item.sold} ly</Text>
      </View>
    ))}
  </View>
);
// Hiển thị cảnh báo hết hàng
const LowStockAlerts = () => (
  <View style={styles.chartContainer}>
    <Text style={[styles.sectionTitle, { color: '#d35400' }]}>Cảnh báo sắp hết hàng</Text>
    {mockLowStock.length === 0 ? (
      <Text style={{ color: '#636e72' }}>Tất cả nguyên liệu đều đủ tồn kho.</Text>
    ) : (
      mockLowStock.map(item => (
        <View key={item.name} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#e17055', fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ color: '#e74c3c' }}>Còn lại: {item.stock}</Text>
        </View>
      ))
    )}
  </View>
);


// Chart Configuration
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(74, 163, 102, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowsForBars: false,
  decimalPlaces: 0,
  propsForDots: { r: '5', strokeWidth: '2', stroke: '#2ecc71' },
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  // Stats Grid
  statsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
  backgroundColor: '#fff',
  width: '48.5%',
  borderRadius: 8,
  padding: 15,
  marginBottom: 15,
  alignItems: 'center',          // Căn giữa theo chiều ngang
  justifyContent: 'center',      // Căn giữa theo chiều dọc
  borderLeftWidth: 4,
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 5,
},
statCardText: {
  marginTop: 10,                 // Thay vì marginLeft
  alignItems: 'center',
},
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  statCardLabel: {
    fontSize: 13,
    color: '#57606f',
    marginTop: 2,
  },
  // Charts
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
  // Actions
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  actionsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    width: '31.5%',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57606f',
    textAlign: 'center',
  },
  actionContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20 },
  actionBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, marginHorizontal: 10 },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  actionRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: 10,
  gap: 10, // hoặc dùng marginHorizontal ở button nếu bạn chưa có gap support
},
/* Removed duplicate actionButton style */

});

// ===== MOCK DATA (có thể thay bằng API sau này) =====
const mockStats = {
  totalSales: '3.5M',
  totalOrders: 235,
  activeUsers: 120, // Số người dùng hoạt động/ngày
  growth: '85%',
  newProducts: 12,
};
const mockDailyRevenue = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [{ data: [1.2, 2.5, 1.8, 3.2, 2.9, 4.1, 3.5] }],
};
const mockBestSellingDrinks = [
  { name: 'Trà sữa truyền thống', sold: 120 },
  { name: 'Cà phê muối', sold: 98 },
  { name: 'Matcha Latte', sold: 87 },
];
const mockLowStock = [
  { name: 'Trân châu đen', stock: 8 },
  { name: 'Sữa tươi', stock: 5 },
];

export default AdminDashboard;
