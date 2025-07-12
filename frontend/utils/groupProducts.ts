import { Product, GroupedProduct } from '../types/types';

export function groupProductsByCategory(products: Product[]): GroupedProduct[] {
  const grouped: { [key: string]: GroupedProduct } = {};

  products.forEach((product) => {
    product.categoryId.forEach((category) => {
      if (!grouped[category._id]) {
        grouped[category._id] = {
          _id: category._id,
          category: category.category,
          drinks: [],
        };
      }
      grouped[category._id].drinks.push(product);
    });
  });
  console.log('💥 Grouped result:', grouped); // <-- log kết quả nhóm
  return Object.values(grouped);
}
