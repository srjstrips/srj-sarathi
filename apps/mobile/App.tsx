import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/auth/LoginScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F5F5F0" />
      <LoginScreen />
    </SafeAreaProvider>
  );
}
