import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppNavigator from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OrderProvider } from './contexts/OrderContext';

// 🆕 Component nhỏ để load user sau khi Provider đã được bọc
import { useEffect } from 'react';
import { useAppDispatch } from './redux/hooks';
import { loadUserFromStorage } from './redux/slices/authSlice';

function AuthLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return null;
}

export default function App() {
  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <OrderProvider>
              {/* 🆕 Chạy loadUser bên trong Provider */}
              <AuthLoader />
              <AppNavigator />
            </OrderProvider>
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
