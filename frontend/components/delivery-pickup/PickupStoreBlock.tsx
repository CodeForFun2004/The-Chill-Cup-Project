import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useOrder } from "../../contexts/OrderContext";
import { STORES } from "../../data/stores";
import StoreMapSelector from "./StoreMapSelector";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
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
    const [showMap, setShowMap] = useState(false);

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
            <Text style={styles.label}>Cửa hàng bạn sẽ đến:</Text>
            <Text style={styles.storeName}>{store?.name}</Text>
            <TouchableOpacity onPress={() => setShowMap(true)}>
                <Text style={styles.changeText}>Đổi cửa hàng</Text>
            </TouchableOpacity>

            <StoreMapSelector visible={showMap} onClose={() => setShowMap(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    storeName: { fontSize: 16, fontWeight: "700" },
    changeText: { fontSize: 13, color: "#6366f1", marginTop: 4 },
});
