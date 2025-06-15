import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const mockActivities = [
  { id: '1', title: 'Bạn nhận được 56 BEAN', desc: 'Đơn hàng #A123', points: '+56' },
  { id: '2', title: 'Bạn nhận được 123 BEAN', desc: 'Đơn hàng #A124', points: '+123' },
  { id: '3', title: 'Bạn đổi 100 BEAN lấy voucher', desc: 'Voucher giảm giá 20%', points: '-100' },
];

const LoyaltyScreen = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const bean = userInfo?.bean ?? 0;
  const name = userInfo?.name || 'Thành viên';
  const memberId = userInfo?.id || 'M123456';
  const nextReward = 1000;
  const progress = Math.min(bean / nextReward, 1);
  const inviteCode = memberId;

  const renderItem = ({ item }: { item: typeof mockActivities[0] }) => (
    <View style={styles.activityItem}>
      <MaterialIcons name="history" size={20} color="#4AA366" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.activityText}>{item.title}</Text>
        <Text style={styles.activityDesc}>{item.desc}</Text>
      </View>
      <Text style={[styles.activityPoints, { color: item.points.startsWith('+') ? '#4AA366' : '#FF3B30' }]}>
        {item.points}
      </Text>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Điểm BEAN</Text>
          <Feather name="coffee" size={24} color="#4AA366" />
        </View>
        <Text style={styles.beanText}>{bean} <Text style={styles.beanUnit}>BEAN</Text></Text>
        <Text style={styles.progressText}>{bean} / {nextReward} BEAN để nhận phần thưởng tiếp theo</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.memberRow}>
          <Text style={styles.memberName}>{name}</Text>
          <Text style={styles.memberId}>{memberId}</Text>
        </View>
      </View>

      <View style={styles.inviteCard}>
        <Text style={styles.inviteTitle}>Mời bạn bè, nhận BEAN</Text>
        <Text style={styles.inviteDesc}>Khi bạn bè nhập mã giới thiệu, bạn sẽ nhận ngay 300 BEAN</Text>
        <TouchableOpacity style={styles.inviteBtn}>
          <Feather name="share-2" size={18} color="#fff" />
          <Text style={styles.inviteBtnText}>Chia sẻ mã: {inviteCode}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.activityTitle}>Hoạt động gần đây</Text>
    </>
  );

  return (
    <FlatList
      data={mockActivities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    />
  );
};

export default LoyaltyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4AA366',
    marginBottom: 8,
  },
  beanText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4AA366',
    marginBottom: 4,
  },
  beanUnit: {
    fontSize: 18,
    color: '#4AA366',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4AA366',
    borderRadius: 4,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  memberId: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4AA366',
    marginBottom: 4,
  },
  inviteDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4AA366',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inviteBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  activityText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  activityDesc: {
    fontSize: 12,
    color: '#888',
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
