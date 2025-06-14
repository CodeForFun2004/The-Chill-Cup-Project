import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './screens/Guest/HomeScreen';
import OrderDetailScreen from './screens/Customer/OrderDetailScreen';
import OrderHistoryScreen from './screens/Customer/OrderHistoryScreen';

const mockOrder = {
  id: '1',
  orderNumber: '#ORD-001',
  date: '2024-01-15',
  time: '10:30 AM',
  status: 'Cancelled' as const, 
  total: 15.50,
  items: [
    { name: 'Cappuccino', quantity: 2, price: 4.50, image: require('./assets/images/coffee/capuchino.png') },
    { name: 'Trà tắc', quantity: 1, price: 6.50, image: require('./assets/images/fruit-tea/tra-tac.png') },
  ],
};

const mockNavigation = {
  navigate: (screen: string, params?: any) => console.log(`Navigate to ${screen}`, params),
  goBack: () => console.log('Go back'),
};

const mockRoute = {
  params: { order: mockOrder },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <OrderDetailScreen
        route={mockRoute} navigation={mockNavigation}></OrderDetailScreen>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
