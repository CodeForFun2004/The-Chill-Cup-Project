// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/rootReducer';
// import { formatCurrency } from '../../utils/formatCurrency';

// const OrderSummaryDetails = () => {
//   const order = useSelector((state: RootState) => state.order);
//   const itemsList = order.items || [];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Chi tiết đơn hàng</Text>

//       <Row label="Mã đơn hàng" value={order.orderNumber} />

//       {/* Danh sách món */}
//       <View style={styles.rowItems}>
//         <Text style={styles.label}>Món đã đặt</Text>
//         <View style={styles.itemsContainer}>
//           {itemsList.map((item, index) => (
//             <View key={index} style={styles.itemRow}>
//               <Text style={styles.itemName} numberOfLines={1}>
//                 {item.name}
//               </Text>
//               <Text style={styles.itemQty}>x{item.quantity}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       <Row label="Tổng tiền" value={formatCurrency(order.total)} highlight />
//       <Row label="Thời gian giao hàng" value={order.deliveryTime} />
//       <Row label="Địa chỉ giao hàng" value={order.deliveryAddress || order.address} />
//       <Row label="Hình thức thanh toán" value={order.paymentMethod} />
//     </View>
//   );
// };

// export default OrderSummaryDetails;

// const Row = ({
//   label,
//   value,
//   highlight = false,
// }: {
//   label: string;
//   value: string;
//   highlight?: boolean;
// }) => (
//   <View style={styles.row}>
//     <Text style={styles.label}>{label}</Text>
//     <Text style={[styles.value, highlight && styles.highlight]} numberOfLines={1}>
//       {value}
//     </Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 16,
//     elevation: 2,
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 12,
//     color: '#333',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     gap: 8,
//   },
//   rowItems: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 10,
//     alignItems: 'flex-start',
//   },
//   label: {
//     color: '#666',
//     fontSize: 14,
//     flex: 1,
//   },
//   value: {
//     color: '#333',
//     fontSize: 14,
//     flex: 1,
//     textAlign: 'right',
//   },
//   highlight: {
//     fontWeight: 'bold',
//     color: '#e53935',
//   },
//   itemsContainer: {
//     flex: 1,
//     gap: 4,
//     alignItems: 'flex-end',
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     gap: 8,
//   },
//   itemName: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//   },
//   itemQty: {
//     width: 40,
//     textAlign: 'right',
//     fontSize: 14,
//     color: '#333',
//   },
// });


// frontend/components/order-success/OrderSummaryDetails.tsx
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { Order } from '../../redux/slices/orderSlice'; // Import Order type
// import { formatCurrency } from '../../utils/formatCurrency'; // Đảm bảo đường dẫn đúng

// interface OrderSummaryDetailsProps {
//   order: Order; // ✅ Nhận đối tượng Order đầy đủ làm prop
// }

// const OrderSummaryDetails: React.FC<OrderSummaryDetailsProps> = ({ order }) => {
//   const itemsList = order.items || [];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Chi tiết đơn hàng</Text>

//       <Row label="Mã đơn hàng" value={order.orderNumber} />

//       {/* Danh sách món */}
//       <View style={styles.rowItems}>
//         <Text style={styles.label}>Món đã đặt</Text>
//         <View style={styles.itemsContainer}>
//           {itemsList.map((item, index) => (
//             <View key={item._id || index} style={styles.itemRow}>
//               <Text style={styles.itemName} numberOfLines={1}>
//                 {/* Sử dụng productId.name nếu có, hoặc fallback về item.name */}
//                 {item.productId?.name || item.name}
//                 {item.size ? ` (${item.size})` : ''}
//                 {item.toppings && item.toppings.length > 0 ? ` + ${item.toppings.map(t => t.name).join(', ')}` : ''}
//               </Text>
//               <Text style={styles.itemQty}>x{item.quantity}</Text>
//               <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       <Row label="Tạm tính" value={formatCurrency(order.subtotal)} />
//       {/* Hiển thị giảm giá nếu có và lớn hơn 0 */}
//       {order.discount !== undefined && order.discount > 0 && (
//         <Row label="Giảm giá" value={`-${formatCurrency(order.discount)}`} highlight />
//       )}
//       <Row label="Phí giao hàng" value={formatCurrency(order.deliveryFee)} />
//       {/* <Row label="Thuế" value={formatCurrency(order.tax)} />  */}
//       {/* Đã bỏ '10%' vì giá đã bao gồm thuế */}


//       <Row label="Tổng tiền" value={formatCurrency(order.total)} highlight />
//       <Row label="Thời gian giao hàng" value={order.deliveryTime} />
//       <Row label="Địa chỉ giao hàng" value={order.deliveryAddress} />
//       <Row label="Số điện thoại" value={order.phone} />
//       <Row label="Hình thức thanh toán" value={order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPAY'} />
//       <Row label="Trạng thái" value={order.status} />
//       <Row label="Thời gian đặt" value={new Date(order.createdAt).toLocaleString('vi-VN')} />
//     </View>
//   );
// };

// export default OrderSummaryDetails;

// // Row sub-component
// const Row = ({
//   label,
//   value,
//   highlight = false,
// }: {
//   label: string;
//   value: string;
//   highlight?: boolean;
// }) => (
//   <View style={styles.row}>
//     <Text style={styles.label}>{label}</Text>
//     <Text style={[styles.value, highlight && styles.highlight]} numberOfLines={1}>
//       {value}
//     </Text>
//   </View>
// );


// frontend/components/order-success/OrderSummaryDetails.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '../../redux/slices/orderSlice';
import { formatCurrency } from '../../utils/formatCurrency';

type OrderSummaryDetailsProps = {
  order: Order;
};

const OrderSummaryDetails: React.FC<OrderSummaryDetailsProps> = ({ order }) => {
  console.log('OrderSummaryDetails: Received order prop:', order);

  if (!order) {
    console.error('OrderSummaryDetails: order prop is null or undefined!');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng.</Text>
      </View>
    );
  }

  const itemsList = order.items || [];
  console.log('OrderSummaryDetails: itemsList:', itemsList);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn hàng</Text>

      <Row label="Mã đơn hàng" value={order.orderNumber || order._id || 'N/A'} />

      {/* Danh sách món */}
      <View style={styles.rowItems}>
        <Text style={styles.label}>Món đã đặt</Text>
        <View style={styles.itemsContainer}>
          {itemsList.map((item, index) => {
            console.log(`OrderSummaryDetails: Item ${index}:`, item);
            // ✅ SỬA ĐỔI DÒNG NÀY: Lấy giá từ item.productId.basePrice
            const itemPrice = item.productId?.basePrice !== undefined ? item.productId.basePrice * item.quantity : 0;
            // Hoặc nếu backend đã tính tổng giá item: const itemPrice = item.pricePerUnit * item.quantity;
            // Dựa trên log của bạn, item.price không tồn tại, nhưng item.productId.basePrice tồn tại.

            return (
              <View key={item._id || index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.productId?.name || item.name || 'Sản phẩm không rõ tên'}
                  {item.size ? ` (${item.size})` : ''}
                  {item.toppings && item.toppings.length > 0 ? ` + ${item.toppings.map(t => t.name).join(', ')}` : ''}
                </Text>
                <Text style={styles.itemQty}>x{item.quantity || 0}</Text>
                {/* ✅ Sử dụng itemPrice đã tính toán */}
                <Text style={styles.itemPrice}>{formatCurrency(itemPrice)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Các dòng Row khác đã đúng vì bạn đã kiểm tra và các giá trị này có vẻ đã có sẵn trong order object */}
      <Row label="Tạm tính" value={formatCurrency(order.subtotal)} />
      {order.discount !== undefined && order.discount !== null && order.discount > 0 && (
        <Row label="Giảm giá" value={`-${formatCurrency(order.discount)}`} highlight />
      )}
      <Row label="Phí giao hàng" value={formatCurrency(order.deliveryFee)} />
      <Row label="Thuế" value={formatCurrency(order.tax)} />

      <Row label="Tổng tiền" value={formatCurrency(order.total)} highlight />
      <Row label="Thời gian giao hàng" value={order.deliveryTime || 'N/A'} />
      <Row label="Địa chỉ giao hàng" value={order.deliveryAddress || 'N/A'} />
      <Row label="Số điện thoại" value={order.phone || 'N/A'} />
      <Row label="Hình thức thanh toán" value={order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPAY'} />
      <Row label="Trạng thái" value={order.status || 'N/A'} />
      <Row label="Thời gian đặt" value={order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'} />
    </View>
  );
};

export default OrderSummaryDetails;

// Row sub-component và styles vẫn giữ nguyên
const Row = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, highlight && styles.highlight]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1.5,
  },
  highlight: {
    color: '#e53935',
    fontWeight: 'bold',
  },
  rowItems: {
    marginTop: 10,
    marginBottom: 10,
  },
  itemsContainer: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 2,
  },
  itemQty: {
    fontSize: 14,
    color: '#666',
    flex: 0.5,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e53935',
    flex: 1,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});