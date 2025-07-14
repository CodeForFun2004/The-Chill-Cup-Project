import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useAppSelector } from '../../redux/hooks'; // Để truy cập trạng thái loading và error

interface PromoCodeInputProps {
  onApply: (code: string) => void;
  onRemove: () => void; // Hàm để xóa mã khuyến mãi
  appliedCode: string | null; // Mã khuyến mãi hiện tại đã được áp dụng
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ onApply, onRemove, appliedCode }) => {
  const [promoCode, setPromoCode] = useState(appliedCode || '');
  const { loading, error } = useAppSelector(state => state.cart);

  useEffect(() => {
    // Đồng bộ giá trị input với mã khuyến mãi đã áp dụng từ Redux
    // Điều này quan trọng khi giỏ hàng được tải lại hoặc mã khuyến mãi bị xóa từ bên ngoài
    if (appliedCode && appliedCode !== promoCode) {
      setPromoCode(appliedCode);
    } else if (!appliedCode && promoCode) {
      setPromoCode(''); // Xóa input nếu mã đã bị hủy
    }
  }, [appliedCode]);


  const handleApply = () => {
    if (promoCode.trim() && !loading) {
      onApply(promoCode.trim());
    }
  };

  const handleRemove = () => {
    if (!loading) {
      onRemove();
    }
  };

  return (
    <View style={styles.promoContainer}>
      <TextInput
        placeholder="Mã giảm giá"
        style={styles.promoInput}
        value={promoCode}
        onChangeText={setPromoCode}
        autoCapitalize="none"
        editable={!loading && !appliedCode} // Không cho chỉnh sửa khi đang loading hoặc đã áp dụng
      />
      {loading ? (
        <View style={styles.promoButton}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : (
        <>
          {appliedCode ? (
            <TouchableOpacity style={styles.promoButton} onPress={handleRemove}>
              <Text style={styles.promoButtonText}>Hủy</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.promoButton} onPress={handleApply}>
              <Text style={styles.promoButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // Sử dụng lại các styles đã có của bạn
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    position: 'relative', // Để position absolute của errorText hoạt động
  },
  promoInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
  },
  promoButton: {
    backgroundColor: '#4AA366',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80, // Đảm bảo nút có kích thước ổn định
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    position: 'absolute',
    bottom: -15, // Đặt lỗi ở dưới input
    left: 12,
    right: 12,
  },
});