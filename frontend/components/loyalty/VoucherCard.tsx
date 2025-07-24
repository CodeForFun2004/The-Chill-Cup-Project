import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { VoucherItem } from "../../redux/slices/loyaltySlice";
import voucherImg from "../../assets/images/voucher/discount-20.png";

interface VoucherCardProps {
  voucher: VoucherItem;
  userPoints: number;
  onRedeem: (discountId: string) => void;
  isRedeeming: boolean;
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  userPoints,
  onRedeem,
  isRedeeming,
}) => {
  const isRedeemable = userPoints >= voucher.requiredPoints;
  const isExpired = new Date(voucher.expiryDate) < new Date();

  const handleRedeem = () => {
    if (!isRedeemable) {
      Alert.alert(
        "Không đủ điểm",
        `Bạn cần ${voucher.requiredPoints} điểm để đổi voucher này. Hiện tại bạn có ${userPoints} điểm.`
      );
      return;
    }

    Alert.alert(
      "Xác nhận đổi voucher",
      `Bạn có chắc chắn muốn đổi voucher "${voucher.title}" với giá ${voucher.requiredPoints} điểm?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đổi",
          onPress: () => onRedeem(voucher._id),
          style: "default",
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.voucherCard,
        (isExpired || !isRedeemable) && styles.expired,
      ]}
    >
      <View style={styles.voucherContent}>
        <View style={styles.voucherLeft}>
          <Image
            source={voucher.image ? { uri: voucher.image } : voucherImg}
            style={styles.voucherImage}
          />
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherTitle}>{voucher.title}</Text>
            <Text style={styles.voucherDescription}>{voucher.description}</Text>
            <View style={styles.voucherDetails}>
              <View style={styles.detailItem}>
                
                <MaterialIcons name="local-offer" size={16} color="#666" />
                <Text style={[styles.detailText, styles.promotionCodeText]}>
                   {voucher.promotionCode}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="stars" size={14} color="#666" />
                <Text style={styles.detailText}>
                  Điểm cần: {voucher.requiredPoints}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={14} color="#666" />
                <Text style={styles.detailText}>
                  HSD: {new Date(voucher.expiryDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.voucherRight}>
          <Text style={styles.discountText}>{voucher.discountPercent}%</Text>
        </View>
      </View>
      <View style={styles.redeemContainer}>
        <TouchableOpacity
          style={[
            styles.redeemButton,
            !isRedeemable && styles.redeemButtonDisabled,
          ]}
          onPress={handleRedeem}
          disabled={!isRedeemable || isRedeeming || isExpired}
        >
          <Text style={styles.redeemButtonText}>
            {isRedeeming
              ? "Đang đổi..."
              : isExpired
              ? "Đã hết hạn"
              : "Đổi ngay"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  voucherCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  expired: {
    opacity: 0.6,
  },
  voucherContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  voucherLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  voucherImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  voucherDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  voucherDetails: {
    gap: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
  },
  voucherRight: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  discountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4AA366",
  },
  redeemContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    alignItems: "flex-end",
  },
  redeemButton: {
    backgroundColor: "#3E6EF3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: "#ccc",
  },
  redeemButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  promotionCodeText: {
    color: "#e53935", // Màu đỏ nổi bật
    fontWeight: "bold", // In đậm
    fontSize: 14, // Kích thước chữ lớn hơn một chút
  },
});

export default VoucherCard;
