import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Chip, Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductToppingStackParamList } from '../../navigation/admin/ProductToppingStack';
import apiInstance from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces
interface Category {
  _id: string;
  category: string;
  icon?: string;
  description?: string;
}

interface Size {
  _id: string;
  size: string;
  name: string;
  multiplier: number;
  volume: string;
}

interface Topping {
  _id: string;
  name: string;
  price: number;
  icon?: string;
}

interface Drink {
  _id: string;
  name: string;
  basePrice: number;
  description?: string;
  image: string | null;
  categoryId: Category[];
  sizeOptions: Size[];
  toppingOptions: Topping[];
  isBanned?: boolean;
  status?: string;
  rating?: number;
}

// API Service Functions
const apiService = {
  async getAllProducts() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.get('/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getAllCategories() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getAllSizes() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.get('/sizes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sizes:', error);
      throw error;
    }
  },

  async getAllToppings() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.get('/toppings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching toppings:', error);
      throw error;
    }
  },

  async searchProducts(name: string, page: number = 1, limit: number = 20) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.get(`/products/search/by-name?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async createProduct(productData: FormData) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: FormData) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.put(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async banProduct(id: string, isBanned: boolean) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await apiInstance.put(`/products/${id}/ban`, 
        { isBanned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating ban status:', error);
      throw error;
    }
  },
};

// Multi-select components
function MultiCategoryChips({ categories, selectedCategories, onChangeSelected }: {
  categories: Category[];
  selectedCategories: string[];
  onChangeSelected: (arr: string[]) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
      {categories.map((cat) => {
        const selected = selectedCategories.includes(cat._id);
        return (
          <Chip
            key={cat._id}
            selected={selected}
            onPress={() => {
              if (selected) onChangeSelected(selectedCategories.filter(c => c !== cat._id));
              else onChangeSelected([...selectedCategories, cat._id]);
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
            {cat.category}
          </Chip>
        );
      })}
    </View>
  );
}

function SizeSelector({ sizes, selectedSizes, onChangeSelected }: {
  sizes: Size[];
  selectedSizes: string[];
  onChangeSelected: (arr: string[]) => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: '600', marginBottom: 8, color: '#222' }}>Chọn size:</Text>
      {sizes.map((size) => {
        const selected = selectedSizes.includes(size._id);
        return (
          <TouchableOpacity
            key={size._id}
            style={styles.checkboxRow}
            onPress={() => {
              if (selected) onChangeSelected(selectedSizes.filter(s => s !== size._id));
              else onChangeSelected([...selectedSizes, size._id]);
            }}
          >
            <Checkbox
              status={selected ? 'checked' : 'unchecked'}
              onPress={() => {
                if (selected) onChangeSelected(selectedSizes.filter(s => s !== size._id));
                else onChangeSelected([...selectedSizes, size._id]);
              }}
            />
            <Text style={styles.checkboxText}>
              {size.name} ({size.size}) - {size.volume} (x{size.multiplier})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ToppingSelector({ toppings, selectedToppings, onChangeSelected }: {
  toppings: Topping[];
  selectedToppings: string[];
  onChangeSelected: (arr: string[]) => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: '600', marginBottom: 8, color: '#222' }}>Chọn topping:</Text>
      <ScrollView style={{ maxHeight: 400 }}>
        {toppings.map((topping) => {
          const selected = selectedToppings.includes(topping._id);
          return (
            <TouchableOpacity
              key={topping._id}
              style={styles.checkboxRow}
              onPress={() => {
                if (selected) onChangeSelected(selectedToppings.filter(t => t !== topping._id));
                else onChangeSelected([...selectedToppings, topping._id]);
              }}
            >
              <Checkbox
                status={selected ? 'checked' : 'unchecked'}
                onPress={() => {
                  if (selected) onChangeSelected(selectedToppings.filter(t => t !== topping._id));
                  else onChangeSelected([...selectedToppings, topping._id]);
                }}
              />
              <Text style={styles.checkboxText}>
                {topping.icon} {topping.name} (+{topping.price.toLocaleString()}đ)
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function ManageProducts() {
  const navigation = useNavigation<NativeStackNavigationProp<ProductToppingStackParamList>>();
  
  // State management
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
  const [sizesSelected, setSizesSelected] = useState<string[]>([]);
  const [toppingsSelected, setToppingsSelected] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string[]>([]);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (text.trim().length >= 2) {
        performSearch(text);
      } else if (text.trim().length === 0) {
        loadProducts();
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  // Debounce utility function
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function debounce(func: Function, wait: number) {
    // eslint-disable-next-line no-undef
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadSizes(),
        loadToppings(),
        loadProducts()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
      }
    }
  };

  const loadSizes = async () => {
    try {
      const sizesData = await apiService.getAllSizes();
      setSizes(sizesData);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        Alert.alert('Lỗi', 'Không thể tải danh sách size');
      }
    }
  };

  const loadToppings = async () => {
    try {
      const toppingsData = await apiService.getAllToppings();
      setToppings(toppingsData);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        Alert.alert('Lỗi', 'Không thể tải danh sách topping');
      }
    }
  };

  const loadProducts = async () => {
    try {
      if (!loading) setLoading(true);
      const products = await apiService.getAllProducts();
      setDrinks(products);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (text: string) => {
    try {
      setSearchLoading(true);
      const result = await apiService.searchProducts(text);
      setDrinks(result.products || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm sản phẩm');
    } finally {
      setSearchLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setCategoriesSelected([]);
    setSizesSelected([]);
    setToppingsSelected([]);
    setImage(null);
    setEditId(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const createFormData = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('basePrice', price);
    formData.append('description', description);
    
    // Categories
    categoriesSelected.forEach((categoryId) => {
      formData.append('categoryId', categoryId);
    });

    // Sizes
    sizesSelected.forEach((sizeId) => {
      formData.append('sizeOptions', sizeId);
    });

    // Toppings
    toppingsSelected.forEach((toppingId) => {
      formData.append('toppingOptions', toppingId);
    });

    if (image) {
      const filename = image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: image,
        type,
        name: filename,
      } as any);
    }

    return formData;
  };

  const addDrink = async () => {
    if (!name || !price || categoriesSelected.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const formData = createFormData();
      const response = await apiService.createProduct(formData);
      
      Alert.alert('Thành công', response.message || 'Thêm sản phẩm thành công');
      setModalVisible(false);
      resetForm();
      await loadProducts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Không thể thêm sản phẩm';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateDrink = async () => {
    if (!editId) return;

    try {
      setLoading(true);
      const formData = createFormData();
      const response = await apiService.updateProduct(editId, formData);
      
      Alert.alert('Thành công', response.message || 'Cập nhật sản phẩm thành công');
      setModalVisible(false);
      resetForm();
      await loadProducts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Không thể cập nhật sản phẩm';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (drink: Drink) => {
    setName(drink.name);
    setPrice(drink.basePrice.toString());
    setDescription(drink.description || '');
    setCategoriesSelected(drink.categoryId.map(cat => cat._id));
    setSizesSelected(drink.sizeOptions.map(size => size._id));
    setToppingsSelected(drink.toppingOptions.map(topping => topping._id));
    setImage(drink.image);
    setEditId(drink._id);
    setModalVisible(true);
  };

  const toggleBan = async (drinkId: string) => {
    const drink = drinks.find(d => d._id === drinkId);
    if (!drink) return;

    try {
      setLoading(true);
      const newBanStatus = !drink.isBanned;
      await apiService.banProduct(drinkId, newBanStatus);
      
      setDrinks((prev) =>
        prev.map((item) =>
          item._id === drinkId ? { ...item, isBanned: newBanStatus } : item
        )
      );
      
      setSelectedDrink((cur) =>
        cur && cur._id === drinkId ? { ...cur, isBanned: newBanStatus } : cur
      );

      Alert.alert('Thành công', `${newBanStatus ? 'Ngừng bán' : 'Bán lại'} sản phẩm thành công`);
    } catch (error: any) {
      console.log('Error updating ban status:', error);
      
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (drinkId: string) => {
    Alert.alert('Xác nhận xoá', 'Bạn có chắc muốn xoá thức uống này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xoá', 
        style: 'destructive', 
        onPress: async () => {
          try {
            setLoading(true);
            await apiService.deleteProduct(drinkId);
            Alert.alert('Thành công', 'Xoá sản phẩm thành công');
            setSelectedDrink(null);
            await loadProducts();
          } catch (error: any) {
            console.log(error);
            
            Alert.alert('Lỗi', 'Không thể xoá sản phẩm');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Filter logic
  const filteredDrinks = React.useMemo(() => {
    if (selectedCategoryFilter.length === 0) {
      return drinks;
    }
    return drinks.filter((drink) =>
      drink.categoryId.some(cat => selectedCategoryFilter.includes(cat._id))
    );
  }, [drinks, selectedCategoryFilter]);

  const renderImage = (source: string | null, style: any) => {
    if (!source) return null;
    return <Image source={{ uri: source }} style={style} onError={() => console.log('Image load error')} />;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSearchText('');
    await loadInitialData();
    setRefreshing(false);
  };

  const getCategoryNames = (categoryArray: Category[]) => {
    return categoryArray.map(cat => cat.category).join(', ');
  };

  const getSizeNames = (sizeArray: Size[]) => {
    return sizeArray.map(size => `${size.name} (${size.size})`).join(', ');
  };

  const getToppingNames = (toppingArray: Topping[]) => {
    return toppingArray.map(topping => topping.name).join(', ');
  };

  if (loading && drinks.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Thức Uống</Text>
      
      <TouchableOpacity
        style={styles.toppingButton}
        onPress={() => navigation.navigate('ToppingManagement')}
      >
        <Text style={styles.toppingButtonText}>Quản lý Topping</Text>
      </TouchableOpacity>

      {/* ENHANCED SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm (ít nhất 2 ký tự)..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
        {searchLoading && (
          <ActivityIndicator 
            size="small"
            color="#007AFF"
            style={styles.searchLoader}
          />
        )}
      </View>

      {/* FILTER BY CATEGORY */}
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
          const selected = selectedCategoryFilter.includes(cat._id);
          return (
            <Chip
              key={cat._id}
              selected={selected}
              onPress={() => {
                if (selected) setSelectedCategoryFilter(selectedCategoryFilter.filter(c => c !== cat._id));
                else setSelectedCategoryFilter([...selectedCategoryFilter, cat._id]);
              }}
              style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              textStyle={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}
              icon={selected ? 'check' : undefined}
            >
              {cat.category}
            </Chip>
          );
        })}
      </ScrollView>

      {/* PRODUCT LIST */}
      <FlatList
        data={filteredDrinks}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedDrink(item)}
            style={[styles.card, item.isBanned && { opacity: 0.5 }]}
          >
            {renderImage(item.image, styles.image)}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.rating && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <Text style={{ color: '#FFD700', fontSize: 12 }}>⭐</Text>
                    <Text style={{ color: '#666', fontSize: 12, marginLeft: 2 }}>{item.rating}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardText}>Giá: {item.basePrice.toLocaleString()} VNĐ</Text>
              <Text style={styles.cardText}>Loại: {getCategoryNames(item.categoryId)}</Text>
              {item.sizeOptions.length > 0 && (
                <Text style={styles.cardText}>Size: {getSizeNames(item.sizeOptions)}</Text>
              )}
              {item.toppingOptions.length > 0 && (
                <Text style={styles.cardText}>Topping: {getToppingNames(item.toppingOptions)}</Text>
              )}
              {item.status === 'new' && (
                <Text style={{ color: '#FF6B35', marginTop: 4, fontWeight: 'bold' }}>Món mới</Text>
              )}
              {item.isBanned && (
                <Text style={{ color: 'red', marginTop: 4, fontWeight: 'bold' }}>Sản phẩm ngừng bán</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#666', fontSize: 16 }}>
              {searchText ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
            </Text>
          </View>
        }
      />

      {/* ADD BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>

      {/* DETAIL MODAL - UPDATED */}
      <Modal visible={!!selectedDrink} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailContainer}>
            {/* Header cố định */}
            <View style={styles.detailHeader}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.detailTitle}>{selectedDrink?.name}</Text>
                {selectedDrink?.rating && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <Text style={{ color: '#FFD700', fontSize: 16 }}>⭐</Text>
                    <Text style={{ color: '#666', fontSize: 14, marginLeft: 2 }}>{selectedDrink.rating}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedDrink(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Nội dung cuộn được */}
            <ScrollView 
              style={styles.detailScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.detailScrollContent}
            >
              {renderImage(selectedDrink?.image || null, styles.previewImage)}
              
              <View style={styles.detailInfoSection}>
                <Text style={styles.detailInfoText}>
                  Giá: {selectedDrink?.basePrice.toLocaleString()} VNĐ
                </Text>
                <Text style={styles.detailInfoText}>
                  Loại: {selectedDrink ? getCategoryNames(selectedDrink.categoryId) : ''}
                </Text>
                
                {selectedDrink && selectedDrink.sizeOptions.length > 0 && (
                  <Text style={styles.detailInfoText}>
                    Size: {getSizeNames(selectedDrink.sizeOptions)}
                  </Text>
                )}
                
                {selectedDrink && selectedDrink.toppingOptions.length > 0 && (
                  <Text style={styles.detailInfoText}>
                    Topping: {getToppingNames(selectedDrink.toppingOptions)}
                  </Text>
                )}
                
                {selectedDrink?.description && (
                  <Text style={styles.detailDescription}>{selectedDrink.description}</Text>
                )}
                
                {selectedDrink?.status === 'new' && (
                  <Text style={styles.newProductLabel}>Món mới phải thử</Text>
                )}
              </View>

              {/* Ban/Unban Switch */}
              <View style={styles.banSwitchContainer}>
                <Text style={styles.banSwitchLabel}>
                  {selectedDrink?.isBanned ? "Đang NGỪNG bán" : "Đang BÁN"}
                </Text>
                <Switch
                  value={!!selectedDrink?.isBanned}
                  onValueChange={() => {
                    if (selectedDrink) toggleBan(selectedDrink._id);
                  }}
                  thumbColor={selectedDrink?.isBanned ? '#FF4747' : '#3E6EF3'}
                  trackColor={{ false: '#ccc', true: '#FFD6D6' }}
                  disabled={loading}
                />
              </View>
            </ScrollView>

            {/* Buttons cố định ở dưới */}
            <View style={styles.detailButtonContainer}>
              <TouchableOpacity
                style={[styles.detailButton, styles.editButton]}
                onPress={() => {
                  if (selectedDrink) startEdit(selectedDrink);
                  setSelectedDrink(null);
                }}
                disabled={loading}
              >
                <Text style={styles.detailButtonText}>Sửa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.detailButton, styles.deleteButton]}
                onPress={() => confirmDelete(selectedDrink!._id)}
                disabled={loading}
              >
                <Text style={styles.detailButtonText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FORM MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F7F8FC' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.formContainer}>
              <Text style={[styles.title, { alignSelf: 'center', marginBottom: 16 }]}>
                {editId ? 'Cập nhật' : 'Thêm'} Thức Uống
              </Text>
              
              <TextInput
                placeholder="Tên *"
                style={[styles.input, { marginBottom: 14 }]}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
              
              <TextInput
                placeholder="Giá *"
                style={[styles.input, { marginBottom: 14 }]}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                editable={!loading}
              />
              
              <TextInput
                placeholder="Mô tả"
                style={[styles.input, { marginBottom: 18, height: 80, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                multiline
                editable={!loading}
              />
              
              <Text style={{ fontWeight: '600', marginBottom: 6, color: '#222' }}>Chọn loại thức uống: *</Text>
              <MultiCategoryChips
                categories={categories}
                selectedCategories={categoriesSelected}
                onChangeSelected={setCategoriesSelected}
              />
              
              <SizeSelector
                sizes={sizes}
                selectedSizes={sizesSelected}
                onChangeSelected={setSizesSelected}
              />
              
              <ToppingSelector
                toppings={toppings}
                selectedToppings={toppingsSelected}
                onChangeSelected={setToppingsSelected}
              />
              
              <TouchableOpacity 
                style={[styles.uploadBtn, { marginTop: 10, marginBottom: 12 }]}
                onPress={pickImage}
                disabled={loading}
              >
                <Text style={{ color: '#fff' }}>{image ? 'Chọn lại ảnh' : 'Tải ảnh lên'}</Text>
              </TouchableOpacity>
              
              {image && (
                <Image 
                  source={{ uri: image }}
                  style={{ width: '100%', height: 180, borderRadius: 14, marginBottom: 10, alignSelf: 'center' }}
                  resizeMode="cover"
                />
              )}
              
              <TouchableOpacity 
                style={[styles.saveButton, { marginTop: 8 }]}
                onPress={() => {
                  Alert.alert('Xác nhận', 'Bạn muốn lưu thay đổi?', [
                    { text: 'Không', style: 'cancel' },
                    { text: 'Có', onPress: editId ? updateDrink : addDrink }
                  ]);
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{editId ? 'Lưu' : 'Thêm'}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  Alert.alert('Xác nhận', 'Bạn có chắc muốn huỷ và xoá dữ liệu đã nhập?', [
                    { text: 'Không', style: 'cancel' },
                    { text: 'Có', style: 'destructive', onPress: () => { resetForm(); setModalVisible(false); } }
                  ]);
                }}
                disabled={loading}
              >
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  
  // CẬP NHẬT detailContainer
  detailContainer: { 
    width: '90%', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    maxHeight: '85%', // Giới hạn chiều cao
    flexDirection: 'column' // Đảm bảo layout dọc
  },
  
  // THÊM MỚI - Header của detail modal
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
  },
  
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  
  // THÊM MỚI - Scrollable content area
  detailScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  detailScrollContent: {
    paddingVertical: 10,
  },
  
  detailInfoSection: {
    marginBottom: 20,
  },
  
  detailInfoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  
  detailDescription: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
    color: '#666',
    lineHeight: 20,
  },
  
  newProductLabel: {
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14,
  },
  
  banSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
  },
  
  banSwitchLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  
  // THÊM MỚI - Fixed bottom buttons
  detailButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  editButton: {
    backgroundColor: '#007AFF',
  },
  
  deleteButton: {
    backgroundColor: '#FF4747',
  },
  
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  formContainer: {
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
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#007AFF' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  searchContainer: { 
    position: 'relative',
    marginBottom: 10,
  },
  searchInput: { 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    paddingRight: 40,
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
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
