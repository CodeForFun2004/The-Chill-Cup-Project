// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { formatCurrency } from '../../utils/formatCurrency';

// type CartSummaryProps = {
//   subtotal: number;
//   delivery: number;
//   discountAmount: number; // Thêm prop cho số tiền giảm giá
// };

// export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, delivery, discountAmount }) => {
//   const totalAfterDiscountAndDelivery = subtotal + delivery - discountAmount;

//   return (
//     <View style={styles.summaryContainer}>
//       <View style={styles.summaryRow}>
//         <Text>Tạm tính</Text>
//         <Text>{formatCurrency(subtotal)}</Text>
//       </View>
//       <View style={styles.summaryRow}>
//         <Text>Phí giao hàng</Text>
//         <Text>{formatCurrency(delivery)}</Text>
//       </View>
//       {discountAmount > 0 && ( // Chỉ hiển thị dòng giảm giá nếu có giảm giá
//         <View style={styles.summaryRow}>
//           <Text style={styles.discountLabel}>Giảm giá</Text>
//           <Text style={styles.discountValue}>- {formatCurrency(discountAmount)}</Text>
//         </View>
//       )}
//       <View style={[styles.summaryRow, styles.totalRow]}>
//         <Text style={styles.totalLabel}>Tổng cộng</Text>
//         <Text style={styles.totalValue}>{formatCurrency(totalAfterDiscountAndDelivery)}</Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   summaryContainer: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 16,
//     elevation: 2,
//     marginBottom: 16,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   discountLabel: {
//     color: '#E74C3C', // Màu đỏ cho giảm giá
//   },
//   discountValue: {
//     color: '#E74C3C',
//     fontWeight: 'bold',
//   },
//   totalRow: {
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 8,
//     marginTop: 4,
//   },
//   totalLabel: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   totalValue: {
//     fontWeight: 'bold',
//     color: '#4AA366',
//     fontSize: 16,
//   },
// });

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';

type CartSummaryProps = {
  subtotal: number;
  delivery: number;
  discountAmount: number; // Prop cho số tiền giảm giá
  total: number; // THÊM PROP NÀY - Sẽ nhận từ Redux state
};

export const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, delivery, discountAmount, total }) => {
  // BỎ DÒNG NÀY: const totalAfterDiscountAndDelivery = subtotal + delivery - discountAmount;
  // Thay vào đó, chúng ta sẽ sử dụng prop `total` đã nhận được từ Redux state

  console.log('Discount amount: ',discountAmount);
  console.log('Total', total);
  
  

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text>Tạm tính</Text>
        <Text>{formatCurrency(subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text>Phí giao hàng</Text>
        <Text>{formatCurrency(delivery)}</Text>
      </View>
      {discountAmount > 0 && ( // Chỉ hiển thị dòng giảm giá nếu có giảm giá
        <View style={styles.summaryRow}>
          <Text style={styles.discountLabel}>Giảm giá</Text>
          <Text style={styles.discountValue}>- {formatCurrency(discountAmount)}</Text>
        </View>
      )}
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Tổng cộng</Text>
        {/* SỬ DỤNG PROP `total` NHẬN TỪ REDUX STATE */}
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountLabel: {
    color: '#E74C3C', // Màu đỏ cho giảm giá
  },
  discountValue: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#4AA366',
    fontSize: 16,
  },
});