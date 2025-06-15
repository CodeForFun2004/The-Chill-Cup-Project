import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './screens/Guest/GuestHomeScreen';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppNavigator from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 👈 Thêm dòng này
import OrderDetailScreen from './screens/Customer/OrderDetailScreen';
import OrderHistoryScreen from './screens/Customer/OrderHistoryScreen';
import OrderTrackingScreen from './screens/Customer/OrderTrackingScreen';
import TestOrderNavigator from './navigation/TestOrderNavigator';
import { NavigationContainer } from '@react-navigation/native';

const mockOrder = {
  id: '1',
  orderNumber: '#ORD-001',
  date: '2024-01-15',
  time: '10:30 AM',
  status: 'Delivering' as const, 
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
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <NavigationContainer>
              <TestOrderNavigator />
            </NavigationContainer>
          </SafeAreaView>
        </SafeAreaProvider>
      </Provider> 
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
