import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

interface PageIndicatorProps {
  total: number;
  active: number;
  onChange: (index: number) => void;  // Định nghĩa kiểu cho onChange
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ total = 3, active = 0, onChange }) => {
  const [currentActive, setCurrentActive] = useState(active);

  useEffect(() => {
    // Set interval to change active dot every 2 seconds (2000 ms)
    const interval = setInterval(() => {
      setCurrentActive(prev => (prev + 1) % total); // Change to the next dot and loop back to 0
    }, 2000);

    // Call the onChange function when active page changes
    if (onChange) {
      onChange(currentActive);
    }

    // Clear interval when component is unmounted or when `total` or `active` changes
    return () => clearInterval(interval);
  }, [currentActive, total, onChange]);

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, currentActive === i && styles.activeDot]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4AA366',
  },
});

export default PageIndicator;
