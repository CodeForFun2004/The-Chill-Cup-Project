// import React, { useEffect } from 'react';
// import { View, ScrollView, StyleSheet, Text } from 'react-native';
// import { useAppDispatch, useAppSelector } from '../../redux/hooks';

// import { RootState } from '../../redux/rootReducer';
// import {
//   loadCartFromAPI,
//   // Bỏ increaseQuantity và decreaseQuantity ở đây
//   clearCart,
//   applyDiscount,
//   removeAppliedPromotionCode,
//   updateCartItemQuantity, // THÊM THUNK MỚI NÀY
// } from '../../redux/slices/cartSlice';

// import { CartItem } from '../../components/cart/CartItem';
// import { PromoCodeInput } from '../../components/cart/PromoCodeInput';
// import { CartSummary } from '../../components/cart/CartSummary';
// import { CartFooter } from '../../components/cart/CartFooter';
// import CartHeader from '../../components/cart/CardHeader';

// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

// const CartScreen = () => {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

//   const dispatch = useAppDispatch();
//   const {
//     items,
//     delivery,
//     loading,
//     error,
//     subtotal,
//      discountAmount,
//     total,
//     appliedPromotionCode,
//   } = useAppSelector((state: RootState) => state.cart);



//   useEffect(() => {
//     dispatch(loadCartFromAPI());
//   }, [dispatch]);

//   const handleCheckout = () => {
//     navigation.navigate('Checkout');
//   };

//   const handleApplyPromoCode = (code: string) => {
//     dispatch(applyDiscount({ promotionCode: code }));
//   };

//   const handleRemovePromoCode = () => {
//     dispatch(removeAppliedPromotionCode()); 
//     // Ghi chú: Nếu có API hủy mã giảm giá, bạn sẽ gọi một thunk ở đây
//     // ví dụ: dispatch(unapplyDiscountFromAPI());
//   };

//   // HÀM MỚI ĐỂ XỬ LÝ TĂNG/GIẢM SỐ LƯỢNG
//   const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
//     dispatch(updateCartItemQuantity({ itemId, quantity: currentQuantity + 1 }));
//   };

//   const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
//     if (currentQuantity > 1) { // Đảm bảo số lượng không nhỏ hơn 1
//       dispatch(updateCartItemQuantity({ itemId, quantity: currentQuantity - 1 }));
//     } else {
//         // Optional: Hiển thị thông báo hoặc hỏi người dùng có muốn xóa sản phẩm không
//         console.log("Số lượng không thể nhỏ hơn 1. Cân nhắc xóa sản phẩm.");
//     }
//   };


//   if (loading && items.length === 0 && !error) {
//     return (
//       <View style={styles.centered}>
//         <Text>Đang tải giỏ hàng...</Text>
//       </View>
//     );
//   }

//   if (error && items.length === 0) {
//     return (
//       <View style={styles.centered}>
//         <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.wrapper}>
//       <CartHeader onClearCart={() => dispatch(clearCart())} />

//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       >
//         {items.length === 0 ? (
//           <View style={styles.centered}>
//             <Text>🛒 Giỏ hàng của bạn đang trống</Text>
//             {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
//           </View>
//         ) : (
//           <>
//             {items.map((item) => (
//               <CartItem
//                 key={item.id.toString()}
//                 name={item.name}
//                 category={item.category}
//                 price={item.price}
//                 quantity={item.quantity}
//                 image={item.image}
//                 onIncrease={() => handleIncreaseQuantity(item.id.toString(), item.quantity)} // GỌI HÀM MỚI
//                 onDecrease={() => handleDecreaseQuantity(item.id.toString(), item.quantity)} // GỌI HÀM MỚI
//               />
//             ))}

//             <PromoCodeInput
//               onApply={handleApplyPromoCode}
//               onRemove={handleRemovePromoCode}
//               appliedCode={appliedPromotionCode}
//             />
//             <CartSummary
//               subtotal={subtotal}
//               delivery={delivery}
//              discountAmount={discountAmount}
//               total={total} // TRUYỀN `total` TỪ REDUX STATE VÀO ĐÂY
//             />
//             <CartFooter total={total} onCheckout={handleCheckout} />
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: '#F4F4F4',
//   },
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#F4F4F4',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default CartScreen;


import React, { useEffect, useState } from 'react'; // Import useState
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

import { RootState } from '../../redux/rootReducer';
import {
  loadCartFromAPI,
  clearCart, // Giữ lại clearCart
  applyDiscount,
  removeAppliedPromotionCode,
  updateCartItemQuantity,
} from '../../redux/slices/cartSlice';

import { CartItem } from '../../components/cart/CartItem';
import { PromoCodeInput } from '../../components/cart/PromoCodeInput';
import { CartSummary } from '../../components/cart/CartSummary';
import { CartFooter } from '../../components/cart/CartFooter';
import CartHeader from '../../components/cart/CardHeader';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';

const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const dispatch = useAppDispatch();

  const {
    items,
    delivery,
    loading: cartLoading, // Đổi tên để tránh nhầm lẫn với loading chung
    error: cartError,     // Đổi tên để tránh nhầm lẫn với error chung
    subtotal,
    discountAmount,
    total,
    appliedPromotionCode,
  } = useAppSelector((state: RootState) => state.cart);

  const userLoading = useAppSelector((state: RootState) => state.user.loading);
  const authLoading = useAppSelector((state: RootState) => state.auth.loading);

  // ✅ State cục bộ để theo dõi lần tải đầu tiên
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    // Chỉ dispatch loadCartFromAPI khi user/auth đã tải xong VÀ CHƯA TỪNG TẢI TRƯỚC ĐÓ.
    // Hoặc khi có lỗi từ lần tải trước và người dùng muốn thử lại (không phải trường hợp này)
    if (!userLoading && !authLoading && !hasLoadedInitially) {
        console.log("CartScreen: Performing initial loadCartFromAPI check.");
        dispatch(loadCartFromAPI());
        setHasLoadedInitially(true); // Đánh dấu là đã dispatch lần đầu
    }
    // Debugging logs for dependencies
    console.log(`[CartScreen useEffect] userLoading: ${userLoading}, authLoading: ${authLoading},  hasLoadedInitially: ${hasLoadedInitially}`);

  }, [dispatch, userLoading, authLoading, hasLoadedInitially]); // Bỏ cartLoading, items.length, cartError khỏi dependency

  // Nếu muốn tải lại giỏ hàng sau khi xóa, bạn sẽ cần một cách kích hoạt khác
  // Ví dụ: khi clearCart() hoàn tất, dispatch lại loadCartFromAPI()
  const handleClearCart = () => {
    dispatch(clearCart());
    // ✅ Sau khi clear cart, có thể bạn muốn tải lại từ API
    // Hoặc để người dùng tự động thấy giỏ hàng trống.
    // Nếu bạn muốn tự động tải lại, hãy dispatch loadCartFromAPI() ở đây.
    // Tuy nhiên, việc này có thể gây ra vòng lặp nếu API trả về giỏ hàng trống.
    // Cách tốt nhất là để UI hiển thị giỏ hàng trống ngay lập tức.
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleApplyPromoCode = (code: string) => {
    dispatch(applyDiscount({ promotionCode: code }));
  };

  const handleRemovePromoCode = () => {
    dispatch(removeAppliedPromotionCode());
  };

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    dispatch(updateCartItemQuantity({ itemId, quantity: currentQuantity + 1 }));
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      dispatch(updateCartItemQuantity({ itemId, quantity: currentQuantity - 1 }));
    } else {
      alert("Số lượng không thể nhỏ hơn 1. Vui lòng xóa sản phẩm khỏi giỏ hàng nếu bạn không muốn mua nữa.");
    }
  };

  // ✅ Cải thiện điều kiện render cho trạng thái tải
  // Hiển thị loading chỉ khi:
  // 1. Đang trong quá trình tải ban đầu (user/auth/cart) VÀ chưa có items nào được tải
  // 2. Không có lỗi (cartError)
  if ((userLoading || authLoading || cartLoading) && items.length === 0 && !cartError) {
    console.log("CartScreen: Rendering initial loading screen.");
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  // ✅ Xử lý trường hợp lỗi (nếu có lỗi VÀ giỏ hàng vẫn trống)
  if (cartError && items.length === 0) {
    console.log("CartScreen: Rendering error screen.");
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lỗi: {cartError}</Text>
        <Text style={styles.retryText} onPress={() => {
            setHasLoadedInitially(false); 
            // Đặt lại để cho phép tải lại
            dispatch(loadCartFromAPI());
        }}>
          Thử lại
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CartHeader onClearCart={handleClearCart} /> 

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ✅ Hiển thị thông báo giỏ hàng trống nếu items rỗng (SAU KHI TẢI XONG và KHÔNG CÓ LỖI) */}
        {items.length === 0 ? (
          <View style={styles.emptyCartCentered}>
            <Text style={styles.emptyCartText}>🛒 Giỏ hàng của bạn đang trống</Text>
            {/* Nếu có lỗi nhưng vẫn hiển thị giỏ hàng trống (ít xảy ra với logic mới) */}
            {cartError && <Text style={{ color: 'red', marginTop: 10 }}>{cartError}</Text>}
          </View>
        ) : (
          <>
            {items.map((item) => (
              <CartItem
                key={item.id.toString()}
                name={item.name}
                category={item.category}
                price={item.price}
                quantity={item.quantity}
                image={item.image}
                onIncrease={() => handleIncreaseQuantity(item.id.toString(), item.quantity)}
                onDecrease={() => handleDecreaseQuantity(item.id.toString(), item.quantity)}
              />
            ))}

            <PromoCodeInput
              onApply={handleApplyPromoCode}
              onRemove={handleRemovePromoCode}
              appliedCode={appliedPromotionCode}
            />
            <CartSummary
              subtotal={subtotal}
              delivery={delivery}
              discountAmount={discountAmount}
              total={total}
            />
            {/* Đưa CartFooter vào lại trong ScrollView */}
            <CartFooter total={total} onCheckout={handleCheckout} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 5,
    fontSize: 14,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  emptyCartCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
});

export default CartScreen;