import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../api/supabase';
import { LucideLogOut, LucideSettings } from 'lucide-react-native';

const ProfileScreen = () => {
  const { profile, session, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <LucideSettings color="#000" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarPlaceholder}>
            {profile?.full_name?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LucideLogOut color="#ff4444" size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  menu: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#fff1f1',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
});

export default ProfileScreen;
