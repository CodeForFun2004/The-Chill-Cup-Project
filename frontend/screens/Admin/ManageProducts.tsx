import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  Image,
  Switch,
} from 'react-native';
import drinks1 from '../../data/drinks1';
import * as ImagePicker from 'expo-image-picker';
import { Chip, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductToppingStackParamList } from '../../navigation/admin/ProductToppingStack';

const categoryIdToName: Record<string, string> = {
  '686b70553670116a4330a181': 'Matcha',
  '686b707f3670116a4330a189': 'Latte & Cafe',
  '686b70213670116a4330a17d': 'Trà sữa',
  '686b70933670116a4330a18d': 'Trà trái cây',
  '686b70a33670116a4330a191': 'Đồ uống nóng',
  '686b706c3670116a4330a185': 'Đặc biệt'
};

function MultiCategoryChips({
  categories,
  selectedCategories,
  onChangeSelected,
  showAddCategory,
  setShowAddCategory,
  newCategory,
  setNewCategory,
  addCategory
}: {
  categories: string[];
  selectedCategories: string[];
  onChangeSelected: (arr: string[]) => void;
  showAddCategory: boolean;
  setShowAddCategory: (v: boolean) => void;
  newCategory: string;
  setNewCategory: (s: string) => void;
  addCategory: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
      {categories.map((cat) => {
        const selected = selectedCategories.includes(cat);
        return (
          <Chip
            key={cat}
            selected={selected}
            onPress={() => {
              if (selected) onChangeSelected(selectedCategories.filter(c => c !== cat));
              else onChangeSelected([...selectedCategories, cat]);
            }}
            style={{
              marginRight: 8,
              marginBottom: 8,
              backgroundColor: selected ? '#007AFF' : '#fff',
              borderColor: '#007AFF',
              borderWidth: 1,
            }}
            textStyle={{ color: selected ? '#fff' : '#007AFF', fontWeight: '500' }}
            icon={selected ? 'check' : undefined}
          >
            {categoryIdToName[cat] || cat}
          </Chip>
        );
      })}
      {showAddCategory ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TextInput
            style={{ borderBottomWidth: 1, marginRight: 8, minWidth: 80, paddingVertical: 2 }}
            placeholder="Loại"
            value={newCategory}
            onChangeText={setNewCategory}
            onSubmitEditing={() => { addCategory(); setShowAddCategory(false); }}
          />
          <IconButton icon="check" onPress={() => { addCategory(); setShowAddCategory(false); }} />
          <IconButton icon="close" onPress={() => setShowAddCategory(false)} />
        </View>
      ) : (
        <Chip icon="plus" onPress={() => setShowAddCategory(true)} style={{ borderColor: '#007AFF', borderWidth: 1, backgroundColor: '#fff', marginBottom: 8 }}>Thêm</Chip>
      )}
    </View>
  );
}

interface Drink {
  _id: string;
  name: string;
  basePrice: number;
  description?: string;
  image: string | number | null;
  categoryIds: string[];
  category: string;
  isBanned?: boolean; // trạng thái bán/ngừng bán
}

export default function ManageProducts() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductToppingStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
  const [image, setImage] = useState<string | number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string[]>([]);

  const [categories, setCategories] = useState(
    Object.keys(categoryIdToName)
  );

  const [drinks, setDrinks] = useState<Drink[]>(
    drinks1.map((drink) => ({
      ...drink,
      category: drink.categoryIds[0],
      image: drink.image || null,
      isBanned: drink.isBanned || false, // default false
    }))
  );

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setCategoriesSelected([]);
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
    if (!name || !price || categoriesSelected.length === 0) return;
    const newDrink: Drink = {
      _id: Date.now().toString(),
      name,
      basePrice: parseInt(price),
      description,
      image,
      category: categoriesSelected[0],
      categoryIds: categoriesSelected,
      isBanned: false
    };
    setDrinks([...drinks, newDrink]);
    setModalVisible(false);
    resetForm();
  };

  const updateDrink = () => {
    if (!editId) return;
    setDrinks(drinks.map((d) =>
      d._id === editId ? {
        ...d,
        name,
        basePrice: parseInt(price),
        description,
        image,
        category: categoriesSelected[0],
        categoryIds: categoriesSelected
      } : d));
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
          setDrinks(drinks.filter(d => d._id !== drinkId));
          setSelectedDrink(null);
        }
      }
    ]);
  };

  const startEdit = (drink: Drink) => {
    setName(drink.name);
    setPrice(drink.basePrice.toString());
    setDescription(drink.description || '');
    setCategoriesSelected(drink.categoryIds || []);
    setImage(drink.image);
    setEditId(drink._id);
    setModalVisible(true);
  };

  // Toggle bán/ngừng bán, CẬP NHẬT LUÔN UI và data
  const toggleBan = (drinkId: string) => {
    setDrinks((prev) =>
      prev.map((item) =>
        item._id === drinkId ? { ...item, isBanned: !item.isBanned } : item
      )
    );
    // cập nhật luôn selectedDrink để Switch không bị lag UI
    setSelectedDrink((cur) =>
      cur && cur._id === drinkId ? { ...cur, isBanned: !cur.isBanned } : cur
    );
  };

  // Filter logic
  const filteredDrinks =
    selectedCategoryFilter.length === 0
      ? drinks
      : drinks.filter((d) =>
          d.categoryIds.some(cat => selectedCategoryFilter.includes(cat))
        );

  // Thêm loại mới
  const addCategory = () => {
    if (newCategory && !Object.values(categoryIdToName).includes(newCategory)) {
      const newId = Date.now().toString();
      categoryIdToName[newId] = newCategory;
      setCategories([...categories, newId]);
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10, paddingBottom: 20 }}>
        <Chip
          selected={selectedCategoryFilter.length === 0}
          onPress={() => setSelectedCategoryFilter([])}
          style={[styles.categoryChip, selectedCategoryFilter.length === 0 && styles.categoryChipSelected]}
          textStyle={[styles.categoryChipText, selectedCategoryFilter.length === 0 && styles.categoryChipTextSelected]}
          icon={selectedCategoryFilter.length === 0 ? 'check' : undefined}
        >
          Tất cả
        </Chip>
        {categories.map((cat) => {
          const selected = selectedCategoryFilter.includes(cat);
          return (
            <Chip
              key={cat}
              selected={selected}
              onPress={() => {
                if (selected) setSelectedCategoryFilter(selectedCategoryFilter.filter(c => c !== cat));
                else setSelectedCategoryFilter([...selectedCategoryFilter, cat]);
              }}
              style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              textStyle={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}
              icon={selected ? 'check' : undefined}
            >
              {categoryIdToName[cat] || cat}
            </Chip>
          );
        })}
      </ScrollView>

      {/* DANH SÁCH */}
      <FlatList
        data={filteredDrinks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedDrink(item)}
            style={[
              styles.card,
              item.isBanned && { opacity: 0.5 }
            ]}
            disabled={false}
          >
            {renderImage(item.image, styles.image)}
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>Giá: {item.basePrice.toLocaleString()} VNĐ</Text>
              <Text style={styles.cardText}>
                Loại: {item.categoryIds.map(id => categoryIdToName[id] || id).join(', ')}
              </Text>
              {item.isBanned && (
                <Text style={{ color: 'red', marginTop: 4, fontWeight: 'bold' }}>
                  Sản phẩm ngừng bán
                </Text>
              )}
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
            <Text>Giá: {selectedDrink?.basePrice.toLocaleString()} VNĐ</Text>
            <Text>Loại: {selectedDrink?.categoryIds?.map((id) => categoryIdToName[id] || id).join(', ')}</Text>
            <Text>{selectedDrink?.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontWeight: '600', marginRight: 8 }}>
                {selectedDrink?.isBanned ? "Đang NGỪNG bán" : "Đang BÁN"}
              </Text>
              <Switch
                value={!!selectedDrink?.isBanned}
                onValueChange={() => {
                  if (selectedDrink) toggleBan(selectedDrink._id);
                }}
                thumbColor={selectedDrink?.isBanned ? '#FF4747' : '#3E6EF3'}
                trackColor={{ false: '#ccc', true: '#FFD6D6' }}
              />
            </View>
            {selectedDrink?.isBanned && (
              <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }}>
                Sản phẩm ngừng bán
              </Text>
            )}
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
                onPress={() => confirmDelete(selectedDrink!._id)}
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
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7F8FC' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              width: '92%',
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 24,
              marginTop: 32,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowOffset: { width: 0, height: 8 },
              shadowRadius: 16,
              elevation: 6,
            }}>
              <Text style={[styles.title, { alignSelf: 'center', marginBottom: 16 }]}>{editId ? 'Cập nhật' : 'Thêm'} Thức Uống</Text>
              <TextInput
                placeholder="Tên"
                style={[styles.input, { marginBottom: 14 }]}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Giá"
                style={[styles.input, { marginBottom: 14 }]}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Mô tả"
                style={[styles.input, { marginBottom: 18, height: 80, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <Text style={{ fontWeight: '600', marginBottom: 6, color: '#222' }}>Chọn loại thức uống:</Text>
              <MultiCategoryChips
                categories={categories}
                selectedCategories={categoriesSelected}
                onChangeSelected={setCategoriesSelected}
                showAddCategory={showAddCategory}
                setShowAddCategory={setShowAddCategory}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                addCategory={addCategory}
              />
              <TouchableOpacity style={[styles.uploadBtn, { marginTop: 10, marginBottom: 12 }]} onPress={pickImage}>
                <Text style={{ color: '#fff' }}>{image ? 'Chọn lại ảnh' : 'Tải ảnh lên'}</Text>
              </TouchableOpacity>
              {image &&
                <Image source={typeof image === 'string' ? { uri: image } : image} style={{ width: '100%', height: 180, borderRadius: 14, marginBottom: 10, alignSelf: 'center' }} resizeMode="cover" />
              }
              <TouchableOpacity style={[styles.saveButton, { marginTop: 8 }]} onPress={confirmSave}>
                <Text style={styles.buttonText}>{editId ? 'Lưu' : 'Thêm'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={confirmCloseForm}>
                <Text style={styles.buttonText}>Huỷ</Text>
              </TouchableOpacity>
            </View>
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
