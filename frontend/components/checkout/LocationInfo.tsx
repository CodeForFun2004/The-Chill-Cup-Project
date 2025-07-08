// components/checkout/LocationInfo.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import InformationModal from './InformationModal';

type Props = {
  location: string;
  phone: string;
  setLocation: (val: string) => void;
  setPhone: (val: string) => void;
};

const LocationInfo: React.FC<Props> = ({ location, phone, setLocation, setPhone }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [field, setField] = useState<'location' | 'phone' | null>(null);

  const openModal = (target: 'location' | 'phone') => {
    setField(target);
    setModalVisible(true);
  };

  const handleSave = (newValue: string) => {
    if (field === 'location') setLocation(newValue);
    else if (field === 'phone') setPhone(newValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Địa chỉ</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{location}</Text>
        <TouchableOpacity onPress={() => openModal('location')}>
          <MaterialIcons name="edit" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: 16 }]}>Số điện thoại</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{phone}</Text>
        <TouchableOpacity onPress={() => openModal('phone')}>
          <MaterialIcons name="edit" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <InformationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        field={field}
        currentValue={field === 'location' ? location : phone}
      />
    </View>
  );
};

export default LocationInfo;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#444',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
