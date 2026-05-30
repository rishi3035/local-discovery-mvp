import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LucideCheck } from 'lucide-react-native';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/useAuthStore';

const VibeBudgetScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { interests } = route.params;
  const { session, setProfile } = useAuthStore();

  const [vibe, setVibe] = useState('relaxed');
  const [budget, setBudget] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!session?.user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        interests,
        vibe,
        budget,
        onboarded: true,
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 3 of 3</Text>
          <Text style={styles.title}>Setting the mood</Text>
          <Text style={styles.subtitle}>How do you usually like to explore a city?</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Vibe</Text>
          <View style={styles.options}>
            {['relaxed', 'adventurous', 'luxury', 'local-only'].map(v => (
              <TouchableOpacity 
                key={v}
                style={[styles.option, vibe === v && styles.optionSelected]}
                onPress={() => setVibe(v)}
              >
                <Text style={[styles.optionText, vibe === v && styles.optionTextSelected]}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Preference</Text>
          <View style={styles.options}>
            {[1, 2, 3, 4].map(b => (
              <TouchableOpacity 
                key={b}
                style={[styles.option, budget === b && styles.optionSelected]}
                onPress={() => setBudget(b)}
              >
                <Text style={[styles.optionText, budget === b && styles.optionTextSelected]}>
                  {'$'.repeat(b)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={handleFinish}
            disabled={loading}
          >
            <Text style={styles.finishButtonText}>{loading ? 'Saving...' : 'Finish Onboarding'}</Text>
            <LucideCheck color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  step: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fdfdfd',
  },
  optionSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  finishButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 35,
    gap: 10,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default VibeBudgetScreen;
