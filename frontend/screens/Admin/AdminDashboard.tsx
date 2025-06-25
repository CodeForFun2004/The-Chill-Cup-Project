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
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Main Component
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isActionsExpanded, setIsActionsExpanded] = useState(true);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ' },
      {
        text: 'Đăng xuất',
        onPress: () => {
          dispatch(logout());
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#e84118" />
        </TouchableOpacity>
      </View>

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
    { value: '3.5M', label: 'Doanh thu', icon: 'cash-outline', color: '#1abc9c' },
    { value: '235', label: 'Đơn hàng', icon: 'receipt-outline', color: '#3498db' },
    { value: '12', label: 'Sản phẩm mới', icon: 'cube-outline', color: '#9b59b6' },
    { value: '85%', label: 'Tăng trưởng', icon: 'trending-up-outline', color: '#e67e22' },
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
  const lineChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [{ data: [2.1, 3.5, 2.8, 4.2, 3.9, 5.1, 4.5] }],
  };

  const barChartData = {
    labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
  };

  return (
    <>
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Doanh thu tuần (triệu)</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - 60}
          height={220}
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
          height={220}
          chartConfig={chartConfig}
          style={styles.chartStyle}
          yAxisLabel=""
          yAxisSuffix="tr"
          fromZero
        />
      </View>
    </>
  );
};

const ActionsGrid = ({ onTaskPress }: { onTaskPress: (task: any) => void }) => {
  const adminTasks = [
    { name: 'Sản phẩm', icon: 'cube-outline', screen: 'Products', color: '#3b82f6' },
    { name: 'Đơn hàng', icon: 'receipt-outline', screen: 'Orders', color: '#10b981' },
    { name: 'Cửa hàng', icon: 'storefront-outline', screen: 'Stores', iconType: 'MaterialCommunityIcons', color: '#f97316' },
    { name: 'Khuyến mãi', icon: 'pricetags-outline', screen: 'Promotions', color: '#ef4444' },
    { name: 'Giao hàng', icon: 'truck-delivery-outline', screen: 'Delivery', iconType: 'MaterialCommunityIcons', color: '#8b5cf6' },
    { name: 'Người dùng', icon: 'people-outline', screen: 'ManageUsers', color: '#636e72' }, // Assuming a ManageUsers screen exists
  ];

  return (
    <View style={styles.actionsGridContainer}>
      {adminTasks.map(task => (
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
};

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
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  statCardText: {
    marginLeft: 12,
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
});

export default AdminDashboard;
