import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../theme/colors';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    setError(null);
    setLoading(true);
    // Auth service call will be wired here
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6">
            {/* Logo / Brand */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 rounded-full bg-brand-orange items-center justify-center mb-4">
                <Text className="text-white text-2xl font-bold">S</Text>
              </View>
              <Text className="text-text-primary text-3xl font-bold">Sarthi</Text>
              <Text className="text-text-secondary text-sm mt-1">SRJ Steel HRMS</Text>
            </View>

            {/* Form card */}
            <View className="bg-surface-card rounded-card p-6 shadow-sm">
              <Text className="text-text-primary text-xl font-semibold mb-6">Sign In</Text>

              <View className="mb-4">
                <Text className="text-text-secondary text-sm mb-1">Username</Text>
                <TextInput
                  className="border border-surface-border rounded-lg px-4 py-3 text-text-primary bg-surface-bg"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor={Colors.text.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View className="mb-6">
                <Text className="text-text-secondary text-sm mb-1">Password</Text>
                <TextInput
                  className="border border-surface-border rounded-lg px-4 py-3 text-text-primary bg-surface-bg"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.text.muted}
                  secureTextEntry
                />
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  <Text className="text-status-error text-sm">{error}</Text>
                </View>
              )}

              <Button title="Sign In" onPress={handleLogin} loading={loading} fullWidth />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
