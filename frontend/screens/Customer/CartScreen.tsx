import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

import { RootState } from '../../redux/rootReducer';
import {
  loadCartFromAPI,
  // Bỏ increaseQuantity và decreaseQuantity ở đây
  clearCart,
  applyDiscount,
  removeAppliedPromotionCode,
  updateCartItemQuantity, // THÊM THUNK MỚI NÀY
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
  const navigation =
    useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  const dispatch = useAppDispatch();
  const {
    items,
    delivery,
    loading,
    error,
    subtotal,
     discountAmount,
    total,
    appliedPromotionCode,
  } = useAppSelector((state: RootState) => state.cart);



  useEffect(() => {
    dispatch(loadCartFromAPI());
  }, [dispatch]);

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  const handleApplyPromoCode = (code: string) => {
    dispatch(applyDiscount({ promotionCode: code }));
  };

  const handleRemovePromoCode = () => {
    dispatch(removeAppliedPromotionCode()); 
    // Ghi chú: Nếu có API hủy mã giảm giá, bạn sẽ gọi một thunk ở đây
    // ví dụ: dispatch(unapplyDiscountFromAPI());
  };

  // HÀM MỚI ĐỂ XỬ LÝ TĂNG/GIẢM SỐ LƯỢNG
  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    dispatch(updateCartItemQuantity({ itemId, quantity: currentQuantity + 1 }));
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) { // Đảm bảo số lượng không nhỏ hơn 1
      dispatch(updateCartItemQuantity({ itemId, quantity: currentQuantity - 1 }));
    } else {
        // Optional: Hiển thị thông báo hoặc hỏi người dùng có muốn xóa sản phẩm không
        console.log("Số lượng không thể nhỏ hơn 1. Cân nhắc xóa sản phẩm.");
    }
  };


  if (loading && items.length === 0 && !error) {
    return (
      <View style={styles.centered}>
        <Text>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CartHeader onClearCart={() => dispatch(clearCart())} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {items.length === 0 ? (
          <View style={styles.centered}>
            <Text>🛒 Giỏ hàng của bạn đang trống</Text>
            {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
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
                onIncrease={() => handleIncreaseQuantity(item.id.toString(), item.quantity)} // GỌI HÀM MỚI
                onDecrease={() => handleDecreaseQuantity(item.id.toString(), item.quantity)} // GỌI HÀM MỚI
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
              total={total} // TRUYỀN `total` TỪ REDUX STATE VÀO ĐÂY
            />
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
});

export default CartScreen;