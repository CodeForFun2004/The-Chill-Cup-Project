// ✅ drinks.tsx (cập nhật đồng bộ với UI)
export const drinkData = [
    {
      category: 'Món Mới Phải Thử',
      icon: require('../assets/images/category_image/monmoi.jpg'),
      drinks: [
        { id: '1', name: 'Matcha Đá Xay', image: require('../assets/images/search-box/matcha-latte.png'), price: '65,000đ' },
        { id: '2', name: 'Matcha Latte', image: require('../assets/images/search-box/matcha-latte.png'), price: '59,000đ' },
        { id: '3', name: 'Matcha Đào', image: require('../assets/images/search-box/matcha-latte.png'), price: '55,000đ' },
      ],
    },
    {
      category: 'Matcha',
      icon: require('../assets/images/category_image/matcha.jpg'),
      drinks: [
        { id: '4', name: 'Matcha Latte', image: require('../assets/images/matcha/matcha-latte.png'), price: '65,000đ' },
        { id: '5', name: 'Matcha Sữa Dừa', image: require('../assets/images/matcha/matcha-sua-dua.png'), price: '59,000đ' },
        { id: '6', name: 'Matcha Yuzu', image: require('../assets/images/matcha/matcha-yuzu.png'), price: '55,000đ' },
        { id: '7', name: 'Matcha Trân Châu Đường Đen', image: require('../assets/images/matcha/matcha-tran-chau-duong-den.png'), price: '65,000đ' },
        { id: '8', name: 'Matcha Xoài', image: require('../assets/images/matcha/matcha-xoai.png'), price: '59,000đ' },
        { id: '9', name: 'Matcha Tinh Khiết', image: require('../assets/images/matcha/matcha-tinh-khiet.png'), price: '55,000đ' },
      ],
    },
    {
      category: 'Coffee',
      icon: require('../assets/images/category_image/coffee.jpg'),
      drinks: [
        { id: '10', name: 'Dirty Chai Latte', image: require('../assets/images/coffee/dirty chai latte.png'), price: '65,000đ' },
        { id: '11', name: 'Latte Caremel', image: require('../assets/images/coffee/latte-caramel.png'), price: '59,000đ' },
        { id: '12', name: 'Bạc xĩu', image: require('../assets/images/coffee/bac-xiu.png'), price: '55,000đ' },
        { id: '13', name: 'Cafe trứng', image: require('../assets/images/coffee/cafe-trung.png'), price: '65,000đ' },
        { id: '14', name: 'Cafe muối', image: require('../assets/images/coffee/cafe-muoi.png'), price: '59,000đ' },
        { id: '15', name: 'Capuchino', image: require('../assets/images/coffee/capuchino.png'), price: '55,000đ' },
      ],
    },
    {
      category: 'Trà Sữa',
      icon: require('../assets/images/category_image/trasua.jpg'),
      drinks: [
        { id: '16', name: 'Trà Sữa Truyền Thống', image: require('../assets/images/bubble-tea/tra-sua-truyen-thong.png'), price: '65,000đ' },
        { id: '17', name: 'Trà Sữa Trân Châu Đường Đen', image: require('../assets/images/bubble-tea/tra-sua-tran-chau-duong-den.png'), price: '59,000đ' },
        { id: '18', name: 'Hồng Trà Sữa Trân Châu', image: require('../assets/images/bubble-tea/hong-tra-sua-tran-chau.png'), price: '55,000đ' },
        { id: '19', name: 'Trà Sữa Oolong Kem Trứng Nướng', image: require('../assets/images/bubble-tea/tra-sua-oolong-kem-trung-nuong.png'), price: '65,000đ' },
        { id: '20', name: 'Trà Sữa Thái Đỏ', image: require('../assets/images/bubble-tea/tra-sua-thai-do.png'), price: '59,000đ' },
        { id: '21', name: 'Trà Sữa Kem Cheese', image: require('../assets/images/bubble-tea/tra-sua-kem-cheese.png'), price: '55,000đ' },
      ],
    },
    {
      category: 'Trà Trái Cây',
      icon: require('../assets/images/category_image/tratraicay.jpg'),
      drinks: [
        { id: '22', name: 'Trà Đào Cam Sả', image: require('../assets/images/fruit-tea/tra-dao-cam-sa.png'), price: '65,000đ' },
        { id: '23', name: 'Trà Tắc', image: require('../assets/images/fruit-tea/tra-tac.png'), price: '59,000đ' },
        { id: '24', name: 'Trà Vải', image: require('../assets/images/fruit-tea/tra-vai.png'), price: '55,000đ' },
        { id: '25', name: 'Trà Dưa Lưới', image: require('../assets/images/fruit-tea/tra-dua-luoi.png'), price: '65,000đ' },
        { id: '26', name: 'Trà Mãng Cầu', image: require('../assets/images/fruit-tea/tra-mang-cau.png'), price: '59,000đ' },
        { id: '27', name: 'Trà Chanh Giã Tay', image: require('../assets/images/fruit-tea/tra-chanh-gia-tay.png'), price: '55,000đ' },
      ],
    },
    {
      category: 'Món Nóng',
      icon: require('../assets/images/category_image/monnong.jpg'),
      drinks: [
        { id: '28', name: 'Americano Nóng', image: require('../assets/images/hot-drink/americano-nong.png'), price: '65,000đ' },
        { id: '29', name: 'Espresso Nóng', image: require('../assets/images/hot-drink/espresso-nong.png'), price: '59,000đ' },
        { id: '30', name: 'Cacao Nóng', image: require('../assets/images/hot-drink/cacao-nong.png'), price: '55,000đ' },
        { id: '31', name: 'Cafe Đen Nóng', image: require('../assets/images/hot-drink/cafe-den-nong.png'), price: '65,000đ' },
        { id: '32', name: 'Cafe Sữa Nóng', image: require('../assets/images/hot-drink/cafe-sua-nong.png'), price: '59,000đ' },
        { id: '33', name: 'Bạc Xĩu Nóng', image: require('../assets/images/hot-drink/bac-xiu-nong.png'), price: '55,000đ' },
      ],
    },
  ];
  