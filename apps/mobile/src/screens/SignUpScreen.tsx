import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { LucideMail, LucideLock, LucideArrowRight, LucideUser } from 'lucide-react-native';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleSignUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session) {
      setSession(data.session);
    } else {
      Alert.alert('Check your email', 'A confirmation link has been sent to your email.');
      navigation.navigate('SignIn');
    }
    setLoading(false);
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Join Us</Text>
            <Text style={styles.subtitle}>Start your authentic journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <LucideUser color="#fff" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#ccc"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
              <LucideArrowRight color="#000" size={20} />
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={[styles.footerText, styles.link]}>Sign In</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
});

export default SignUpScreen;
