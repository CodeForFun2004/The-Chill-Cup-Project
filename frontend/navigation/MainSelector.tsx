// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import CustomerStackNavigator from './customer/CustomerStackNavigator';
// // import CustomerNavigator from './customer/CustomerNavigator';
// // import DrinkCategoryScreen from '../screens/Customer/DrinkCategoryScreen';

// const Stack = createNativeStackNavigator();

// export default function MainSelector() {
//   console.log('[MainSelector] mounted');
  
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="CartStack" component={CustomerStackNavigator} />
//     </Stack.Navigator>
//   );
// }

// import React from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/rootReducer';
// import GuestNavigator from './GuestNavigator';
// import CustomerNavigator from './customer/CustomerNavigator';
// import AdminNavigator from './admin/AdminNavigator';
// import StaffNavigator from './staff/StaffNavigator';
// import ShipperNavigator from './shipper/ShipperNavigator';

// const MainSelector = () => {
 
//     console.log('[MainSelector] mounted');

     
//   const role = useSelector((state: RootState) => state.auth.role);

//   if (role === 'customer') return <CustomerNavigator />;
//   if (role === 'admin') return <AdminNavigator />;
//   if (role === 'staff') return <StaffNavigator />;
//   if (role === 'shipper') return <ShipperNavigator />;

//   // Default fallback (guest view)
//   return <GuestNavigator />;
// };

// export default MainSelector;


// import React from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/rootReducer';
// import GuestNavigator from './GuestNavigator';
// import CustomerNavigator from './customer/CustomerNavigator';
// import AdminNavigator from './admin/AdminNavigator';
// import StaffNavigator from './staff/StaffNavigator';
// import ShipperNavigator from './shipper/ShipperNavigator';
// import LoadingScreen from '../components/LoadingScreen'; // 🌟 bạn tạo file này đơn giản chỉ hiển thị ActivityIndicator

// const MainSelector = () => {
//   const role = useSelector((state: RootState) => state.auth.role);

//   console.log('[MainSelector] mounted, role:', role);

//   if (!role) {
//     return <LoadingScreen />;
//   }

//   if (role === 'customer') return <CustomerNavigator />;
//   if (role === 'admin') return <AdminNavigator />;
//   if (role === 'staff') return <StaffNavigator />;
//   if (role === 'shipper') return <ShipperNavigator />;

//   return <GuestNavigator />;
// };

// export default MainSelector;


import React, { Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';
import LoadingScreen from '../components/LoadingScreen';

// ⚠️ Dùng lazy import để tránh load sớm
const GuestNavigator = lazy(() => import('./GuestNavigator'));
const CustomerNavigator = lazy(() => import('./customer/CustomerNavigator'));
const AdminNavigator = lazy(() => import('./admin/AdminNavigator'));
const StaffNavigator = lazy(() => import('./staff/StaffNavigator'));
const ShipperNavigator = lazy(() => import('./shipper/ShipperNavigator'));

const MainSelector = () => {
  const role = useSelector((state: RootState) => state.auth.role);
  console.log('[MainSelector] mounted, role:', role);

  return (
    <Suspense fallback={<LoadingScreen />}>
      {role === 'customer' && <CustomerNavigator />}
      {role === 'admin' && <AdminNavigator />}
      {role === 'staff' && <StaffNavigator />}
      {role === 'shipper' && <ShipperNavigator />}
      {!role && <LoadingScreen />}
      {!['customer', 'admin', 'staff', 'shipper'].includes(role || '') && <GuestNavigator />}
    </Suspense>
  );
};

export default MainSelector;


