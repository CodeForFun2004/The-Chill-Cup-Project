import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ChangePasswordScreen = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSave = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    Alert.alert('Success', 'Password updated successfully');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.currentPassword}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, currentPassword: text }))
              }
              placeholder="Enter current password"
              secureTextEntry={!showPasswords.current}
            />
            <TouchableOpacity
              onPress={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  current: !prev.current,
                }))
              }
            >
              <MaterialIcons
                name={showPasswords.current ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.newPassword}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, newPassword: text }))
              }
              placeholder="Enter new password"
              secureTextEntry={!showPasswords.new}
            />
            <TouchableOpacity
              onPress={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  new: !prev.new,
                }))
              }
            >
              <MaterialIcons
                name={showPasswords.new ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, confirmPassword: text }))
              }
              placeholder="Confirm new password"
              secureTextEntry={!showPasswords.confirm}
            />
            <TouchableOpacity
              onPress={() =>
                setShowPasswords((prev) => ({
                  ...prev,
                  confirm: !prev.confirm,
                }))
              }
            >
              <MaterialIcons
                name={showPasswords.confirm ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  form: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4AA366',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen; 