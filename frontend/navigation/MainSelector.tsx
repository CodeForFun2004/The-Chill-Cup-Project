import React, { Suspense, lazy, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../redux/hooks';
import { RootState } from '../redux/rootReducer';
import { fetchUserProfile } from '../redux/slices/userSlice';
import LoadingScreen from '../components/LoadingScreen';
import { Text, View } from 'react-native'; // Import Text và View cho phần hiển thị lỗi

// ⚠️ Dùng lazy import để tránh load sớm
const GuestNavigator = lazy(() => import('./GuestNavigator'));
const CustomerNavigator = lazy(() => import('./customer/CustomerNavigator'));
const AdminNavigator = lazy(() => import('./admin/AdminNavigator'));
const StaffNavigator = lazy(() => import('./staff/StaffNavigator'));
const ShipperNavigator = lazy(() => import('./shipper/ShipperNavigator'));

const MainSelector = () => {
  const dispatch = useAppDispatch();
  const authRole = useSelector((state: RootState) => state.auth.role); // Role từ auth slice
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const userLoading = useSelector((state: RootState) => state.user.loading);
  const userError = useSelector((state: RootState) => state.user.error);

  console.log('[MainSelector] mounted, authRole:', authRole);
  console.log('[MainSelector] userProfile:', userProfile);
  console.log('[MainSelector] userLoading:', userLoading);
  console.log('[MainSelector] userError:', userError);

  useEffect(() => {
    // Chúng ta chỉ muốn fetch user profile nếu CÓ MỘT VAI TRÒ ĐƯỢC XÁC ĐỊNH KHÔNG PHẢI GUEST
    // VÀ profile chưa được load, VÀ không đang load, VÀ không có lỗi từ lần fetch TRƯỚC ĐÓ.
    // Nếu có lỗi, chúng ta sẽ thử fetch lại nếu role đã thay đổi (ví dụ: từ guest sang customer).
    if (authRole && authRole !== 'guest') { // Chỉ fetch nếu role không phải 'guest'
      // Nếu có lỗi từ lần fetch trước, hoặc profile chưa có, và không đang load
      if (!userProfile && !userLoading) {
        // Dispatch fetchUserProfile
        console.log('[MainSelector] Dispatching fetchUserProfile for role:', authRole);
        dispatch(fetchUserProfile());
      }
    }
  }, [authRole, userProfile, userLoading, dispatch]); // userError không cần ở đây nữa vì logic đã thay đổi

  // Xử lý trạng thái tải (loading)
  // Hiển thị LoadingScreen nếu đang fetch user profile hoặc authRole chưa có
  if (userLoading || !authRole) {
    return <LoadingScreen />;
  }

  // Xử lý lỗi: Nếu có lỗi khi fetch user profile VÀ role đã được xác định (không phải null)
  // Và profile vẫn là null (nghĩa là fetch thất bại và không có dữ liệu cũ)
  if (userError && !userProfile) {
    console.warn('[MainSelector] User profile load error or missing after attempt:', userError);
    // Tùy chọn: Có thể hiển thị một thông báo lỗi cụ thể
    // hoặc chuyển hướng về màn hình đăng nhập nếu lỗi là do xác thực
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>
          Lỗi tải thông tin người dùng: {userError}.
        </Text>
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          Vui lòng kiểm tra kết nối mạng hoặc đăng nhập lại.
        </Text>
        {/* Bạn có thể thêm nút để người dùng thử lại hoặc chuyển đến màn hình đăng nhập */}
        {/* <Button title="Đăng nhập lại" onPress={() => navigation.navigate('Login')} /> */}
      </View>
    );
  }

  // Chọn Navigator dựa trên role sau khi profile đã load thành công
  // Hoặc nếu là guest (không cần profile)
  switch (authRole) {
    case 'customer':
      // Nếu là customer nhưng profile vẫn null (sau khi loading và không có lỗi từ Redux),
      // điều này có nghĩa là có thể đã có lỗi trước đó hoặc dữ liệu không tồn tại.
      // Chúng ta có thể buộc quay về GuestNavigator hoặc hiển thị thông báo.
      // Để đơn giản, nếu userProfile là null và role là customer, có thể là do lỗi
      // hoặc chưa load xong (mặc dù userLoading đã false).
      // Logic đã kiểm tra userError và userLoading ở trên, nên nếu đến đây
      // mà userProfile vẫn null, có thể là một trạng thái không mong muốn.
      // Tuy nhiên, việc này sẽ được xử lý trong CheckoutScreen bằng cách check userProfile.
      return <CustomerNavigator />;
    case 'admin':
      return <AdminNavigator />;
    case 'staff':
      return <StaffNavigator />;
    case 'shipper':
      return <ShipperNavigator />;
    case 'guest': // Rõ ràng xử lý case 'guest'
      return <GuestNavigator />;
    default:
      // Trường hợp role là null ban đầu (trước khi authSlice xác định)
      // hoặc một role không xác định.
      // !authRole đã được xử lý ở trên để hiển thị LoadingScreen.
      // Nếu đến đây mà authRole vẫn không khớp, thì mặc định về GuestNavigator.
      return <GuestNavigator />;
  }
};

export default MainSelector;