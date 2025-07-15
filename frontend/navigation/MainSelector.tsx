// import React, { Suspense, lazy } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/rootReducer';
// import LoadingScreen from '../components/LoadingScreen';

// // ⚠️ Dùng lazy import để tránh load sớm
// const GuestNavigator = lazy(() => import('./GuestNavigator'));
// const CustomerNavigator = lazy(() => import('./customer/CustomerNavigator'));
// const AdminNavigator = lazy(() => import('./admin/AdminNavigator'));
// const StaffNavigator = lazy(() => import('./staff/StaffNavigator'));
// const ShipperNavigator = lazy(() => import('./shipper/ShipperNavigator'));

// const MainSelector = () => {
//   const role = useSelector((state: RootState) => state.auth.role);
//   console.log('[MainSelector] mounted, role:', role);

//   return (
//     <Suspense fallback={<LoadingScreen />}>
//       {role === 'customer' && <CustomerNavigator />}
//       {role === 'admin' && <AdminNavigator />}
//       {role === 'staff' && <StaffNavigator />}
//       {role === 'shipper' && <ShipperNavigator />}
//       {!role && <LoadingScreen />}
//       {!['customer', 'admin', 'staff', 'shipper'].includes(role || '') && <GuestNavigator />}
//     </Suspense>
//   );
// };

// export default MainSelector;


import React, { Suspense, lazy, useEffect } from 'react'; // Import useEffect
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../redux/hooks'; // Đảm bảo bạn đã tạo file này và export useAppDispatch
import { RootState } from '../redux/rootReducer';
import { fetchUserProfile } from '../redux/slices/userSlice'; // Import fetchUserProfile
import LoadingScreen from '../components/LoadingScreen';

// ⚠️ Dùng lazy import để tránh load sớm
const GuestNavigator = lazy(() => import('./GuestNavigator'));
const CustomerNavigator = lazy(() => import('./customer/CustomerNavigator'));
const AdminNavigator = lazy(() => import('./admin/AdminNavigator'));
const StaffNavigator = lazy(() => import('./staff/StaffNavigator'));
const ShipperNavigator = lazy(() => import('./shipper/ShipperNavigator'));

const MainSelector = () => {
  const dispatch = useAppDispatch(); // Sử dụng useAppDispatch đã được typed
  const role = useSelector((state: RootState) => state.auth.role);
  const userProfile = useSelector((state: RootState) => state.user.profile); // Lấy userProfile từ state
  const userLoading = useSelector((state: RootState) => state.user.loading); // Lấy trạng thái loading của userSlice
  const userError = useSelector((state: RootState) => state.user.error); // Lấy trạng thái error của userSlice

  console.log('[MainSelector] mounted, role:', role);
  console.log('[MainSelector] userProfile:', userProfile); // Kiểm tra userProfile
  console.log('[MainSelector] userLoading:', userLoading); // Kiểm tra userLoading
  console.log('[MainSelector] userError:', userError); // Kiểm tra userError

  // Sử dụng useEffect để fetch user profile một cách có điều kiện
  useEffect(() => {
    // Chỉ fetch nếu role tồn tại (người dùng đã đăng nhập)
    // VÀ profile chưa được load VÀ không đang trong quá trình load VÀ không có lỗi
    if (role && !userProfile && !userLoading && !userError) {
      console.log('[MainSelector] Dispatching fetchUserProfile based on role:', role);
      dispatch(fetchUserProfile());
    }
  }, [role, userProfile, userLoading, userError, dispatch]); // Thêm dispatch vào dependency array

  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Giữ nguyên logic hiển thị Navigator của bạn */}
      {role === 'customer' && <CustomerNavigator />}
      {role === 'admin' && <AdminNavigator />}
      {role === 'staff' && <StaffNavigator />}
      {role === 'shipper' && <ShipperNavigator />}
      {!role && <LoadingScreen />}
       {/* Hiển thị loading nếu chưa có role */}
      {/* Fallback cho trường hợp role không xác định hoặc null sau khi load */}
      {!['customer', 'admin', 'staff', 'shipper'].includes(role || '') && <GuestNavigator />}
    </Suspense>
  );
};

export default MainSelector;