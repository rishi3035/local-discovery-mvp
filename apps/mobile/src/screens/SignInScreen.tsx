import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { LucideMail, LucideLock, LucideArrowRight } from 'lucide-react-native';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSession, setLoading: setStoreLoading } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session) {
      setSession(data.session);
    }
    setLoading(false);
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Local Discovery</Text>
            <Text style={styles.subtitle}>Find the soul of the city</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <LucideMail color="#fff" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <LucideLock color="#fff" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              <LucideArrowRight color="#000" size={20} />
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={[styles.footerText, styles.link]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialContainer}>
              <View style={styles.divider} />
              <Text style={styles.socialText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    marginBottom: 50,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#eee',
    marginTop: 10,
    fontStyle: 'italic',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  socialText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default SignInScreen;
