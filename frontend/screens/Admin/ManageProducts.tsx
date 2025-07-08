import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Chip, IconButton } from 'react-native-paper';

const initialDrinks = [
  {
    id: '1',
    name: 'Trà Sữa Truyền Thống',
    price: 35000,
    image: require('../../assets/images/bubble-tea/tra-sua-truyen-thong.png'),
    description: 'Trà sữa truyền thống thơm ngon',
    category: 'Trà sữa',
  },
  {
    id: '2',
    name: 'Cà Phê Sữa',
    price: 30000,
    image: require('../../assets/images/coffee/bac-xiu.png'),
    description: 'Cà phê sữa đậm đà',
    category: 'Cà phê',
  },
  {
    id: '3',
    name: 'Matcha Latte',
    price: 40000,
    image: require('../../assets/images/matcha/matcha-latte.png'),
    description: 'Matcha latte thơm ngon',
    category: 'Matcha',
  },
  {
    id: '4',
    name: 'Trà Đào Cam Sả',
    price: 38000,
    image: require('../../assets/images/fruit-tea/tra-dao-cam-sa.png'),
    description: 'Trà đào cam sả mát lạnh',
    category: 'Nước trái cây',
  },
];

export default function ManageProducts() {
  const [drinks, setDrinks] = useState(initialDrinks);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState(['Trà sữa', 'Cà phê', 'Matcha', 'Nước trái cây']);
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

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

  const addDrink = () => {
    if (!name || !price) return;
    setDrinks([
      ...drinks,
      {
        id: Date.now().toString(),
        name,
        price: parseInt(price),
        image,
        description,
        category,
      },
    ]);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setImage(null);
  };

  const removeDrink = (id: string) => {
    setDrinks(drinks.filter((d) => d.id !== id));
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const startEditDrink = (drink: any) => {
    setEditId(drink.id);
    setName(drink.name);
    setPrice(drink.price.toString());
    setDescription(drink.description);
    setCategory(drink.category);
    setImage(drink.image);
  };

  const updateDrink = () => {
    if (!editId) return;
    setDrinks(drinks.map((d) => d.id === editId ? {
      ...d,
      name,
      price: parseInt(price),
      description,
      category,
      image,
    } : d));
    setEditId(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setImage(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Quản lý Thức Uống</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Tên thức uống" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Giá" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
                style={{ marginRight: 8, marginBottom: 8, backgroundColor: category === cat ? '#007AFF' : '#f0f4ff' }}
                textStyle={{ color: category === cat ? '#fff' : '#222', fontWeight: 'bold' }}
              >
                {cat}
              </Chip>
            ))}
            {showAddCategory ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, marginBottom: 8, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#007AFF', paddingLeft: 8 }}>
                <TextInput
                  style={{ minWidth: 80, paddingVertical: 0, paddingHorizontal: 0, fontSize: 14 }}
                  placeholder="Tên loại"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  onSubmitEditing={() => { addCategory(); setShowAddCategory(false); }}
                  autoFocus
                />
                <IconButton
                  icon="check"
                  size={18}
                  onPress={() => { addCategory(); setShowAddCategory(false); }}
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="close"
                  size={18}
                  onPress={() => { setShowAddCategory(false); setNewCategory(''); }}
                  style={{ margin: 0 }}
                />
              </View>
            ) : (
              <Chip
                icon="plus"
                onPress={() => setShowAddCategory(true)}
                style={{ backgroundColor: '#e3f0ff', marginRight: 8, marginBottom: 8 }}
                textStyle={{ color: '#007AFF', fontWeight: 'bold' }}
              >
                Thêm
              </Chip>
            )}
          </View>
        </View>
        <TextInput style={styles.input} placeholder="Mô tả" value={description} onChangeText={setDescription} />
        <TouchableOpacity
          style={[styles.imagePickerBtn, { backgroundColor: image ? '#4AA366' : '#ffb3b3' }]}
          onPress={pickImage}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{image ? 'Đã chọn ảnh' : 'Chọn hình ảnh'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={editId ? updateDrink : addDrink}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{editId ? 'Cập nhật' : 'Thêm thức uống'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Danh sách thức uống</Text>
      {drinks.map((drink) => (
        <View key={drink.id} style={styles.card}>
          {drink.image && (
            <Image source={typeof drink.image === 'string' ? { uri: drink.image } : drink.image} style={styles.image} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{drink.name}</Text>
            <Text style={styles.cardText}>Giá: {drink.price.toLocaleString()}đ</Text>
            <Text style={styles.cardText}>Loại: {drink.category}</Text>
            <Text style={styles.cardText}>{drink.description}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity onPress={() => startEditDrink(drink)} style={{ backgroundColor: '#e3f0ff', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, marginRight: 8 }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeDrink(drink.id)} style={{ backgroundColor: '#ffeaea', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 }}>
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