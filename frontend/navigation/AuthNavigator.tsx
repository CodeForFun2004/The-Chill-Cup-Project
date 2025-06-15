// navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/Auth/VerifyCodeScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import PasswordChangedScreen from '../screens/Auth/PasswordChangedScreen';
import CreateAccountScreen from '../screens/Auth/CreateAccountScreen';


export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string }; // ✅ có truyền email từ ForgotPassword
  ResetPassword: undefined;
  PasswordChanged: undefined;
  CreateAccount: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;