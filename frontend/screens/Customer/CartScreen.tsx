import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/rootReducer';
import {
  loadCartFromAPI,
  clearCart,
  applyDiscount,
  removeAppliedPromotionCode,
  updateCartItemQuantity,
} from '../../redux/slices/cartSlice';

import { CartItem } from '../../components/cart/CartItem';
import { PromoCodeInput } from '../../components/cart/PromoCodeInput';
import { CartSummary } from '../../components/cart/CartSummary';
import { CartFooter } from '../../components/cart/CartFooter';
import CartHeader from '../../components/cart/CardHeader';

import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/customer/CustomerStackNavigator';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const {
    items,
    delivery,
    loading: cartLoading,
    error: cartError,
    subtotal,
    discountAmount,
    total,
    appliedPromotionCode,
  } = useAppSelector((state: RootState) => state.cart);

  const userLoading = useAppSelector((state: RootState) => state.user.loading);
  const authLoading = useAppSelector((state: RootState) => state.auth.loading);

  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    let isActive = true;
    if (!userLoading && !authLoading && !hasLoadedInitially) {
      console.log("CartScreen: Performing initial loadCartFromAPI check.");
      dispatch(loadCartFromAPI()).finally(() => {
        if (isActive) setHasLoadedInitially(true);
      });
    }
    return () => {
      isActive = false;
      console.log('CartScreen unmounted');
    };
  }, [dispatch, userLoading, authLoading, hasLoadedInitially]);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.',
      });
      return;
    }
    if (isFocused) {
      navigation.navigate('Checkout');
    }
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
      Toast.show({
        type: 'info',
        text1: 'Số lượng không thể nhỏ hơn 1. Vui lòng xóa sản phẩm khỏi giỏ hàng nếu bạn không muốn mua nữa.',
      });
    }
  };

  const isLoading = (userLoading || authLoading || cartLoading) && items.length === 0 && !cartError;

  return (
    <View style={styles.wrapper}>
      <CartHeader onClearCart={handleClearCart} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e53935" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      ) : cartError && items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Lỗi: {cartError}</Text>
          <Text
            style={styles.retryText}
            onPress={() => {
              setHasLoadedInitially(false);
              dispatch(loadCartFromAPI());
            }}
          >
            Thử lại
          </Text>
        </View>
      ) : (
        <ScrollView key={`scrollview-${items.length}`} style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
          {items.length === 0 ? (
            <View style={styles.emptyCartCentered}>
              <Text style={styles.emptyCartText}>🛒 Giỏ hàng của bạn đang trống</Text>
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

              <PromoCodeInput onApply={handleApplyPromoCode} onRemove={handleRemovePromoCode} appliedCode={appliedPromotionCode} />
              <CartSummary subtotal={subtotal} delivery={delivery} discountAmount={discountAmount} total={total} />
              <CartFooter total={total} onCheckout={handleCheckout} />
            </>
          )}
        </ScrollView>
      )}
      <Toast />
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



