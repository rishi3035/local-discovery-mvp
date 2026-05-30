import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LucideMapPin, LucideArrowRight } from 'lucide-react-native';

const CitySelectionScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 3</Text>
          <Text style={styles.title}>Where are you exploring?</Text>
          <Text style={styles.subtitle}>We'll start with your current city to find local gems near you.</Text>
        </View>

        <View style={styles.cityCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc39?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.cityImage}
          />
          <View style={styles.cityInfo}>
            <LucideMapPin color="#000" size={24} />
            <Text style={styles.cityName}>San Francisco</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Default</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.otherCity}>
          <Text style={styles.otherCityText}>Choose another city...</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => navigation.navigate('InterestsSelection')}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <LucideArrowRight color="#fff" size={20} />
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
  cityCard: {
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cityImage: {
    width: '100%',
    height: 200,
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  otherCity: {
    alignItems: 'center',
    marginTop: 24,
  },
  otherCityText: {
    color: '#666',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 35,
    gap: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CitySelectionScreen;
