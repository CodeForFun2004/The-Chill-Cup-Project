import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

const VerifyCodeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute();
  const email = (route.params as any)?.email || 'helloworld@gmail.com';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState(false);
  const refs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setError(false);
    if (text && index < 5) refs[index + 1].current?.focus();
  };

  const handleVerify = () => {
  const fullCode = code.join('');
  
  if (timer === 0) {
    Alert.alert('Timeout', 'Verification time expired. Please request a new code.');
    return;
  }

  if (fullCode === '123456') {
    navigation.navigate('ResetPassword');
  } else {
    setError(true);
  }
};

  const handleResend = () => {
    Alert.alert('Success', 'A new code has been sent to your email.');
    setTimer(30);
    setError(false);
    setCode(['', '', '', '', '', '']);
    refs[0].current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>

        <Image source={require('../../assets/splash.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.subtitle}>
          We’ve sent a code to <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={refs[index]}
              style={[styles.codeInput, error && styles.codeInputError]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>Wrong code, please try again</Text>}

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendText, timer > 0 && { color: '#aaa' }]}>
                 Send code again <Text style={{ fontWeight: 'bold' }}>{`00:${timer < 10 ? '0' : ''}${timer}`}</Text>
            </Text>
        </TouchableOpacity>

      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerifyCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 60,
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A2D2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 32,
  },
  email: {
    fontWeight: '600',
    color: '#000',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#fff',
  },
  codeInputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  verifyBtn: {
    backgroundColor: '#4AA366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
});
