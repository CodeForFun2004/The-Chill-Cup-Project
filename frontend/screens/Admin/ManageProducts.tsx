import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert
} from 'react-native';
import { drinkData } from '../../data/drinks';
import * as ImagePicker from 'expo-image-picker';
import { Chip, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductToppingStackParamList } from '../../navigation/admin/ProductToppingStack';

interface Drink {
  id: string;
  name: string;
  price: string;
  description?: string;
  image: string | number | null;
  category: string;
}

export default function ManageProducts() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductToppingStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState(drinkData.map((d) => d.category));
  const [drinks, setDrinks] = useState<Drink[]>(
    drinkData.flatMap((cat) =>
      cat.drinks.map((drink: any) => ({
        ...drink,
        category: cat.category,
        description: drink.description || '',
        image: drink.image || null // giữ lại cả require và uri
      }))
    )
  );

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setCategory('');
    setImage(null);
    setEditId(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    if (!name || !price || !category) return;
    setDrinks([...drinks, { id: Date.now().toString(), name, price, description, image, category }]);
    setModalVisible(false);
    resetForm();
  };

  const updateDrink = () => {
    if (!editId) return;
    setDrinks(drinks.map((d) => d.id === editId ? { ...d, name, price, description, image, category } : d));
    setModalVisible(false);
    resetForm();
  };

  const confirmCloseForm = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn huỷ và xoá dữ liệu đã nhập?', [
      { text: 'Không', style: 'cancel' },
      { text: 'Có', style: 'destructive', onPress: () => { resetForm(); setModalVisible(false); } }
    ]);
  };

  const confirmSave = () => {
    Alert.alert('Xác nhận', 'Bạn muốn lưu thay đổi?', [
      { text: 'Không', style: 'cancel' },
      { text: 'Có', onPress: editId ? updateDrink : addDrink }
    ]);
  };

  const confirmDelete = (drinkId: string) => {
    Alert.alert('Xác nhận xoá', 'Bạn có chắc muốn xoá thức uống này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive', onPress: () => {
          setDrinks(drinks.filter(d => d.id !== drinkId));
          setSelectedDrink(null);
        }
      }
    ]);
  };

  const startEdit = (drink: Drink) => {
    setName(drink.name);
    setPrice(drink.price);
    setDescription(drink.description || '');
    setCategory(drink.category);
    setImage(drink.image);
    setEditId(drink.id);
    setModalVisible(true);
  };

  const filteredDrinks = selectedCategoryFilter
    ? drinks.filter((d) => d.category === selectedCategoryFilter)
    : drinks;

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const renderImage = (source: string | number | null, style: any) => {
    if (!source) return null;
    return (
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={style}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Thức Uống</Text>

      <TouchableOpacity
        style={styles.toppingButton}
        onPress={() => navigation.navigate('ToppingManagement')}
      >
        <Text style={styles.toppingButtonText}>Quản lý Topping</Text>
      </TouchableOpacity>

     
      {/* FILTER */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
  <Chip
    selected={selectedCategoryFilter === null}
    onPress={() => setSelectedCategoryFilter(null)}
    style={[
      styles.categoryChip,
      selectedCategoryFilter === null && styles.categoryChipSelected
    ]}
    textStyle={[
      styles.categoryChipText,
      selectedCategoryFilter === null && styles.categoryChipTextSelected
    ]}
    icon={selectedCategoryFilter === null ? 'check' : undefined}
  >
    Tất cả
  </Chip>
   <View style={{marginBottom: 30, marginTop: 30}}></View>


  {categories.map((cat) => (
    <Chip
      key={cat}
      selected={selectedCategoryFilter === cat}
      onPress={() => setSelectedCategoryFilter(cat)}
      style={[
        styles.categoryChip,
        selectedCategoryFilter === cat && styles.categoryChipSelected
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategoryFilter === cat && styles.categoryChipTextSelected
      ]}
      icon={selectedCategoryFilter === cat ? 'check' : undefined}
    >
      {cat}
    </Chip>
  ))}
</ScrollView>



      {/* DANH SÁCH */}
      <FlatList 
        data={filteredDrinks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedDrink(item)} style={styles.card}>
            {renderImage(item.image, styles.image)}
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>Giá: {item.price}</Text>
              <Text style={styles.cardText}>Loại: {item.category}</Text>
              {item.description && <Text style={styles.cardText}>{item.description}</Text>}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* NÚT THÊM */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>

      {/* MODAL CHI TIẾT */}
      <Modal visible={!!selectedDrink} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailContainer}>
            <Text style={styles.title}>{selectedDrink?.name}</Text>
            {renderImage(selectedDrink?.image || null, styles.previewImage)}
            <Text>Giá: {selectedDrink?.price}</Text>
            <Text>Loại: {selectedDrink?.category}</Text>
            <Text>{selectedDrink?.description}</Text>
            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  if (selectedDrink) startEdit(selectedDrink);
                  setSelectedDrink(null);
                }}
              >
                <Text style={styles.buttonText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1 }]}
                onPress={() => confirmDelete(selectedDrink!.id)}
              >
                <Text style={styles.buttonText}>Xoá</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setSelectedDrink(null)} style={{ marginTop: 10 }}>
              <Text style={{ color: '#007AFF', textAlign: 'center' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL FORM */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.modalContainer} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.title}>{editId ? 'Cập nhật' : 'Thêm'} Thức Uống</Text>

            <TextInput placeholder="Tên" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Giá" style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput placeholder="Mô tả" style={styles.input} value={description} onChangeText={setDescription} />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              {categories.map((cat) => (
                <Chip key={cat} selected={category === cat} onPress={() => setCategory(cat)} style={{ marginRight: 8, marginBottom: 8 }}>
                  {cat}
                </Chip>
              ))}
              {showAddCategory ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={{ borderBottomWidth: 1, marginRight: 8, minWidth: 80 }}
                    placeholder="Loại"
                    value={newCategory}
                    onChangeText={setNewCategory}
                    onSubmitEditing={() => { addCategory(); setShowAddCategory(false); }}
                  />
                  <IconButton icon="check" onPress={() => { addCategory(); setShowAddCategory(false); }} />
                  <IconButton icon="close" onPress={() => setShowAddCategory(false)} />
                </View>
              ) : (
                <Chip icon="plus" onPress={() => setShowAddCategory(true)}>Thêm</Chip>
              )}
            </View>

            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={{ color: '#fff' }}>{image ? 'Chọn lại ảnh' : 'Tải ảnh lên'}</Text>
            </TouchableOpacity>
            {renderImage(image, styles.previewImage)}

            <TouchableOpacity style={styles.saveButton} onPress={confirmSave}>
              <Text style={styles.buttonText}>{editId ? 'Lưu' : 'Thêm'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={confirmCloseForm}>
              <Text style={styles.buttonText}>Huỷ</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalContainer: { flex: 1, padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  detailContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#007AFF' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  uploadBtn: { backgroundColor: '#4AA366', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  previewImage: { width: '100%', height: 160, marginBottom: 10, borderRadius: 8 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  cancelButton: { backgroundColor: '#aaa', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardText: { color: '#555', fontSize: 14 },
  fab: { position: 'absolute', right: 20, bottom: 80, backgroundColor: '#3E6EF3', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  toppingButton: { alignSelf: 'flex-end', backgroundColor: '#FFA500', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginBottom: 12 },
  toppingButtonText: { color: '#fff', fontWeight: 'bold' },
  categoryChip: {
  marginRight: 10,
  height: 36,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#007AFF',
  backgroundColor: '#fff',
  justifyContent: 'center'
},
categoryChipSelected: {
  backgroundColor: '#007AFF',
},
categoryChipText: {
  color: '#007AFF',
  fontWeight: '500',
  fontSize: 14,
},
categoryChipTextSelected: {
  color: '#fff',
},


});
