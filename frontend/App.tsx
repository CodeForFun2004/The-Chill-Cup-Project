import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppNavigator from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 👈 Thêm dòng này

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <AppNavigator />
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
