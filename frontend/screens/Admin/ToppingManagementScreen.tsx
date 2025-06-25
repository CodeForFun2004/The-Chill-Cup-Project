import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const initialToppings: { id: string; name: string; price: number; image: string | null; description: string }[] = [
  {
    id: '1',
    name: 'Trân châu đen',
    price: 7000,
    image: null,
    description: 'Trân châu dẻo thơm',
  },
];

export default function ToppingManagementScreen() {
  const [toppings, setToppings] = useState(initialToppings);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addTopping = () => {
    if (!name || !price) return;
    setToppings([
      ...toppings,
      {
        id: Date.now().toString(),
        name,
        price: parseInt(price),
        image,
        description,
      },
    ]);
    setName('');
    setPrice('');
    setDescription('');
    setImage(null);
  };

  const removeTopping = (id: string) => {
    setToppings(toppings.filter((t) => t.id !== id));
  };

  const startEditTopping = (topping: any) => {
    setEditId(topping.id);
    setName(topping.name);
    setPrice(topping.price.toString());
    setDescription(topping.description);
    setImage(topping.image);
  };

  const updateTopping = () => {
    if (!editId) return;
    setToppings(toppings.map((t) => t.id === editId ? {
      ...t,
      name,
      price: parseInt(price),
      description,
      image,
    } : t));
    setEditId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImage(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quản lý Topping</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Tên topping" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Giá" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Mô tả" value={description} onChangeText={setDescription} />
        <TouchableOpacity
          style={[styles.imagePickerBtn, { backgroundColor: image ? '#4AA366' : '#ffb3b3' }]}
          onPress={pickImage}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{image ? 'Đã chọn ảnh' : 'Chọn hình ảnh'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={editId ? updateTopping : addTopping}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{editId ? 'Cập nhật' : 'Thêm topping'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Danh sách topping</Text>
      {toppings.map((topping) => (
        <View key={topping.id} style={styles.card}>
          {topping.image && (
            <Image source={{ uri: topping.image }} style={styles.image} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{topping.name}</Text>
            <Text style={styles.cardText}>Giá: {topping.price.toLocaleString()}đ</Text>
            <Text style={styles.cardText}>{topping.description}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity onPress={() => startEditTopping(topping)} style={{ backgroundColor: '#e3f0ff', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, marginRight: 8 }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeTopping(topping.id)} style={{ backgroundColor: '#ffeaea', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: '#ff3b30', fontWeight: 'bold' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 16, alignSelf: 'center' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8, color: '#333' },
  form: { marginBottom: 16, backgroundColor: '#f5f6fa', borderRadius: 10, padding: 12 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, marginBottom: 8, backgroundColor: '#fff' },
  imagePickerBtn: {
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 10,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardText: { color: '#555', fontSize: 14 },
}); 