import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Chip, IconButton, Searchbar } from 'react-native-paper';
import { API_BASE_URL } from "../../services/api"

// API service functions
const apiService = {
  // Products
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  createProduct: async (productData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: productData,
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: productData,
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  searchProducts: async (name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search/by-name?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  filterByCategory: async (categoryId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/filter-by-category?categoryId=${categoryId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error filtering by category:', error);
      return { products: [] };
    }
  },

  banProduct: async (id: string, isBanned: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBanned }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error banning product:', error);
      throw error;
    }
  },

  // Toppings
  getAllToppings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/toppings`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching toppings:', error);
      return [];
    }
  },

  // Categories
  getAllCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};

// Mock function - implement based on your auth system
const getAuthToken = async () => {
  // Return your auth token here
  return 'your-auth-token';
};

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  categoryId: string[];
  status: 'new' | 'old';
  isBanned: boolean;
  toppingOptions: string[];
}

interface Topping {
  _id: string;
  name: string;
  price: number;
}

interface Category {
  _id: string;
  category: string;
}

// Helper functions for safe data handling
const safePrice = (price: any): number => {
  const numPrice = Number(price);
  return isNaN(numPrice) ? 0 : numPrice;
};

const safeString = (str: any): string => {
  return str && typeof str === 'string' ? str : '';
};

const safeArray = (arr: any): any[] => {
  return Array.isArray(arr) ? arr : [];
};

export default function ManageProducts() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'new' | 'old'>('new');
  const [editId, setEditId] = useState<string | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [showToppingModal, setShowToppingModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, toppingsData] = await Promise.all([
        apiService.getAllProducts(),
        apiService.getAllCategories(),
        apiService.getAllToppings(),
      ]);
      
      // Normalize product data
      const normalizedProducts = productsData.map((product: any) => ({
        _id: product._id || '',
        name: safeString(product.name),
        price: safePrice(product.price),
        image: safeString(product.image),
        description: safeString(product.description),
        categoryId: safeArray(product.categoryId),
        status: product.status === 'old' ? 'old' as 'old' : 'new' as 'new',
        isBanned: Boolean(product.isBanned),
        toppingOptions: safeArray(product.toppingOptions),
      }));

      setProducts(normalizedProducts);
      setCategories(categoriesData);
      setToppings(toppingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  // Create FormData for API
  const createFormData = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('status', status);
    
    // Handle multiple categories
    selectedCategories.forEach(categoryId => {
      formData.append('categoryId', categoryId);
    });
    
    // Handle toppings
    selectedToppings.forEach(toppingId => {
      formData.append('toppingOptions', toppingId);
    });

    // Handle image
    if (image) {
      const imageUri = image;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    return formData;
  };

  // Validation
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return false;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return false;
    }
    return true;
  };

  // CRUD operations
  const addProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = createFormData();
      const result = await apiService.createProduct(formData);
      
      if (result.error) {
        Alert.alert('Lỗi', result.error);
      } else {
        Alert.alert('Thành công', 'Thêm sản phẩm thành công');
        resetForm();
        refreshData();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async () => {
    if (!editId || !validateForm()) return;

    setLoading(true);
    try {
      const formData = createFormData();
      const result = await apiService.updateProduct(editId, formData);
      
      if (result.error) {
        Alert.alert('Lỗi', result.error);
      } else {
        Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
        resetForm();
        refreshData();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.deleteProduct(id);
              Alert.alert('Thành công', 'Xóa sản phẩm thành công');
              refreshData();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const banProduct = async (id: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'bỏ cấm' : 'cấm';
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${action} sản phẩm này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.banProduct(id, !currentBanStatus);
              Alert.alert('Thành công', `${action} sản phẩm thành công`);
              refreshData();
            } catch (error) {
              console.error('Error banning product:', error);
              Alert.alert('Lỗi', `Không thể ${action} sản phẩm`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Form helpers
  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setSelectedCategories([]);
    setSelectedToppings([]);
    setImage(null);
    setStatus('new');
    setEditId(null);
  };

  const startEditProduct = (product: Product) => {
    setEditId(product._id);
    setName(product.name || '');
    setPrice(product.price ? product.price.toString() : '');
    setDescription(product.description || '');
    setSelectedCategories(safeArray(product.categoryId));
    setSelectedToppings(safeArray(product.toppingOptions));
    setImage(product.image || null);
    setStatus(product.status || 'new');
  };

  // Search and filter
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      try {
        const results = await apiService.searchProducts(query);
        setProducts(results);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    } else {
      refreshData();
    }
  };

  const handleCategoryFilter = async (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    if (categoryId) {
      setLoading(true);
      try {
        const results = await apiService.filterByCategory(categoryId);
        setProducts(safeArray(results.products));
      } catch (error) {
        console.error('Error filtering:', error);
      } finally {
        setLoading(false);
      }
    } else {
      refreshData();
    }
  };

  // Category selection
  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Topping selection
  const toggleToppingSelection = (toppingId: string) => {
    setSelectedToppings(prev => 
      prev.includes(toppingId) 
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const renderToppingModal = () => (
    <Modal
      visible={showToppingModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowToppingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn Topping</Text>
          <ScrollView style={styles.toppingList}>
            {toppings.map((topping) => (
              <TouchableOpacity
                key={topping._id}
                style={[
                  styles.toppingItem,
                  selectedToppings.includes(topping._id) && styles.selectedTopping
                ]}
                onPress={() => toggleToppingSelection(topping._id)}
              >
                <Text style={styles.toppingName}>{topping.name || 'Không có tên'}</Text>
                <Text style={styles.toppingPrice}>+{safePrice(topping.price).toLocaleString()}đ</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setShowToppingModal(false)}
          >
            <Text style={styles.modalCloseBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
      }
    >
      <Text style={styles.title}>Quản lý Thức Uống</Text>

      {/* Search */}
      <Searchbar
        placeholder="Tìm kiếm sản phẩm..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Lọc theo danh mục:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategoryFilter === ''}
            onPress={() => handleCategoryFilter('')}
            style={styles.filterChip}
          >
            Tất cả
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category._id}
              selected={selectedCategoryFilter === category._id}
              onPress={() => handleCategoryFilter(category._id)}
              style={styles.filterChip}
            >
              {category.category || 'Không có tên'}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên thức uống"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Giá"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* Category Selection */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Danh mục:</Text>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <Chip
                key={category._id}
                selected={selectedCategories.includes(category._id)}
                onPress={() => toggleCategorySelection(category._id)}
                style={styles.categoryChip}
              >
                {category.category || 'Không có tên'}
              </Chip>
            ))}
          </View>
        </View>

        {/* Status Selection */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Trạng thái:</Text>
          <View style={styles.statusContainer}>
            <Chip
              selected={status === 'new'}
              onPress={() => setStatus('new')}
              style={styles.statusChip}
            >
              Mới
            </Chip>
            <Chip
              selected={status === 'old'}
              onPress={() => setStatus('old')}
              style={styles.statusChip}
            >
              Cũ
            </Chip>
          </View>
        </View>

        {/* Topping Selection */}
        <TouchableOpacity
          style={styles.toppingBtn}
          onPress={() => setShowToppingModal(true)}
        >
          <Text style={styles.toppingBtnText}>
            Chọn Topping ({selectedToppings.length})
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Mô tả"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.imagePickerBtn, { backgroundColor: image ? '#4AA366' : '#ffb3b3' }]}
          onPress={pickImage}
        >
          <Text style={styles.imagePickerText}>
            {image ? 'Đã chọn ảnh' : 'Chọn hình ảnh'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={editId ? updateProduct : addProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>
              {editId ? 'Cập nhật' : 'Thêm thức uống'}
            </Text>
          )}
        </TouchableOpacity>

        {editId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product List */}
      <Text style={styles.subtitle}>Danh sách thức uống ({products.length})</Text>
      
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
        </View>
      ) : (
        products.map((product) => (
          <View key={product._id} style={[
            styles.card,
            product.isBanned && styles.bannedCard
          ]}>
            {product.image && (
              <Image 
                source={{ uri: product.image }} 
                style={styles.image}
                onError={() => console.log('Error loading image:', product.image)}
              />
            )}
            
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {product.name || 'Không có tên'}
                {product.isBanned && <Text style={styles.bannedText}> (Đã cấm)</Text>}
              </Text>
              <Text style={styles.cardText}>
                Giá: {safePrice(product.price).toLocaleString()}đ
              </Text>
              <Text style={styles.cardText}>
                Trạng thái: {product.status === 'new' ? 'Mới' : 'Cũ'}
              </Text>
              <Text style={styles.cardText}>
                Topping: {safeArray(product.toppingOptions).length}
              </Text>
              <Text style={styles.cardText}>
                {product.description || 'Không có mô tả'}
              </Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => startEditProduct(product)}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>Sửa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => banProduct(product._id, product.isBanned)}
                style={[styles.banBtn, product.isBanned && styles.unbanBtn]}
              >
                <Text style={styles.banBtnText}>
                  {product.isBanned ? 'Bỏ cấm' : 'Cấm'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => deleteProduct(product._id)}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {renderToppingModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchBar: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  form: {
    marginBottom: 16,
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  categorySection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusSection: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusChip: {
    marginRight: 8,
  },
  toppingBtn: {
    backgroundColor: '#e3f0ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  toppingBtnText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  imagePickerBtn: {
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 12,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannedCard: {
    backgroundColor: '#ffe6e6',
    opacity: 0.7,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  bannedText: {
    color: '#ff3b30',
    fontSize: 12,
  },
  cardText: {
    color: '#555',
    fontSize: 14,
    marginBottom: 2,
  },
  cardActions: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#e3f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  editBtnText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  banBtn: {
    backgroundColor: '#fff3cd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  unbanBtn: {
    backgroundColor: '#d4edda',
  },
  banBtnText: {
    color: '#856404',
    fontWeight: 'bold',
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: '#ffeaea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#ff3b30',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  toppingList: {
    maxHeight: 300,
  },
  toppingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedTopping: {
    backgroundColor: '#e3f0ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  toppingName: {
    fontSize: 16,
    fontWeight: '500',
  },
  toppingPrice: {
    fontSize: 14,
    color: '#666',
  },
  modalCloseBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});