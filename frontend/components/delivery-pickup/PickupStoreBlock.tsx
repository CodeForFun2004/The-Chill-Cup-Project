import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, RouteProp, NavigationProp, useRoute } from "@react-navigation/native";
import { useOrder } from "../../contexts/OrderContext";
import { STORES } from "../../data/stores";
import { CustomerHomeStackParamList } from "../../navigation/customer/CustomerHomeStack";

type StoreRouteProp = RouteProp<CustomerHomeStackParamList, 'StoreScreen'>;
type StoreNavigationProp = NavigationProp<CustomerHomeStackParamList, 'StoreScreen'>;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function PickupStoreBlock() {
    const { store, setStore } = useOrder();
    const route = useRoute<StoreRouteProp>();
    const navigation = useNavigation<StoreNavigationProp>();

    useEffect(() => {
        (async () => {
            if (!store) {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") return;
                let loc = await Location.getCurrentPositionAsync({});
                const sorted = STORES.map((s) => ({
                    ...s,
                    distance: getDistance(
                        loc.coords.latitude,
                        loc.coords.longitude,
                        s.latitude,
                        s.longitude
                    ),
                })).sort((a, b) => a.distance - b.distance);
                setStore(sorted[0]);
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Ionicons name="storefront" size={22} color="#6366f1" style={styles.icon} />
                <View style={styles.info}>
                    <Text style={styles.label}>Cửa hàng bạn sẽ đến</Text>
                    <Text style={styles.storeName}>{store?.name || "Đang tìm cửa hàng gần nhất..."}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("StoreScreen")}>
                    <Text style={styles.changeText}>Đổi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: "#64748b",
        marginBottom: 2,
    },
    storeName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    changeText: {
        fontSize: 13,
        color: "#6366f1",
        fontWeight: "600",
    },
});
