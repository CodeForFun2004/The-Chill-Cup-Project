import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrinkCategoryScreen from '../screens/Customer/DrinkCategoryScreen';
import CustomerStackNavigator from './customer/CustomerStackNavigator';
import CustomerNavigator from './customer/CustomerNavigator';
import CustomerDrinkStackNavigator from './CustomerDrinkStackNavigator';

const Stack = createNativeStackNavigator();

export default function MainSelector() {
  console.log('[MainSelector] mounted');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrinkCategory" component={DrinkCategoryScreen} />
    </Stack.Navigator>
  );
}
