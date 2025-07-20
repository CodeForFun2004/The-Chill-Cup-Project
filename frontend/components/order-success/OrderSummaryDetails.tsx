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


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { formatCurrency } from '../../utils/formatCurrency'; // Đảm bảo đường dẫn đúng

const OrderSummaryDetails = () => {
  // ✅ Lấy currentOrder từ order state
  const order = useSelector((state: RootState) => state.order.currentOrder);
  // Đảm bảo order có dữ liệu trước khi truy cập các thuộc tính
  const itemsList = order?.items || [];

  if (!order) {
    // Xử lý trường hợp order chưa có hoặc đang tải
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đang tải chi tiết đơn hàng...</Text>
        {/* Hoặc hiển thị một spinner */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn hàng</Text>

      <Row label="Mã đơn hàng" value={order.orderNumber} />

      {/* Danh sách món */}
      <View style={styles.rowItems}>
        <Text style={styles.label}>Món đã đặt</Text>
        <View style={styles.itemsContainer}>
          {itemsList.map((item, index) => (
            <View key={item._id || index} style={styles.itemRow}> {/* Dùng item._id làm key nếu có */}
              <Text style={styles.itemName} numberOfLines={1}>
                {item.productId?.name || item.name} {/* Ưu tiên productId.name nếu có */}
              </Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text> {/* Thêm giá của từng item */}
            </View>
          ))}
        </View>
      </View>

      {/* Thêm các hàng chi tiết khác nếu có trong API response và bạn muốn hiển thị */}
      <Row label="Tạm tính" value={formatCurrency(order.subtotal)} />
      {order.discount && order.discount > 0 ? <Row label="Giảm giá" value={`-${formatCurrency(order.discount)}`} highlight /> : null}
      <Row label="Phí giao hàng" value={formatCurrency(order.deliveryFee)} />
      <Row label="Thuế (10%)" value={formatCurrency(order.tax)} />


      <Row label="Tổng tiền" value={formatCurrency(order.total)} highlight />
      <Row label="Thời gian giao hàng" value={order.deliveryTime} />
      <Row label="Địa chỉ giao hàng" value={order.deliveryAddress} /> {/* API trả về deliveryAddress */}
      <Row label="Số điện thoại" value={order.phone} /> {/* Thêm số điện thoại */}
      <Row label="Hình thức thanh toán" value={order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPAY'} />
      <Row label="Trạng thái" value={order.status} /> {/* Thêm trạng thái đơn hàng */}
    </View>
  );
};

export default OrderSummaryDetails;

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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  rowItems: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  label: {
    color: '#666',
    fontSize: 14,
    flex: 1, // Để label chiếm không gian và push value sang phải
  },
  value: {
    color: '#333',
    fontSize: 14,
    flex: 1, // Để value chiếm không gian còn lại
    textAlign: 'right',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#e53935',
  },
  itemsContainer: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end', // Căn phải cho danh sách items
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQty: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
  },
  itemPrice: { // Thêm style cho giá item
    width: 80, // Tùy chỉnh độ rộng
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
  },
});