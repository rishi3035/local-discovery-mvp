import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { LucideSearch, LucideUtensils, LucidePalette, LucideTrees, LucideCamera, LucideShoppingBag } from 'lucide-react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { supabase } from '../api/supabase';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Food', icon: LucideUtensils, slug: 'food-drink' },
  { id: '2', name: 'Art', icon: LucidePalette, slug: 'culture-art' },
  { id: '3', name: 'Nature', icon: LucideTrees, slug: 'parks-nature' },
  { id: '4', name: 'Photo', icon: LucideCamera, slug: 'landmarks' },
  { id: '5', name: 'Shop', icon: LucideShoppingBag, slug: 'shopping' },
];

const ExploreScreen = () => {
  const navigation = useNavigation<any>();
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory]);

  const fetchPlaces = async () => {
    let query = supabase.from('places').select('*, category:categories(*)');
    
    if (selectedCategory) {
      query = query.eq('category.slug', selectedCategory);
    }

    const { data } = await query;
    if (data) setPlaces(data);
  };

  const initialRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <LucideSearch color="#888" size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search places or guides"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList} contentContainerStyle={styles.categoryListContent}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryItem,
                selectedCategory === cat.slug && styles.categoryItemActive
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
            >
              <cat.icon size={18} color={selectedCategory === cat.slug ? '#fff' : '#000'} />
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.slug && styles.categoryTextActive
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map}
          initialRegion={initialRegion}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.location?.coordinates?.[1] || 37.7749,
                longitude: place.location?.coordinates?.[0] || -122.4194,
              }}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerDot} />
              </View>
            </Marker>
          ))}
        </MapView>

        {selectedPlace && (
          <View style={styles.previewCard}>
            <Image 
              source={{ uri: selectedPlace.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop' }}
              style={styles.previewImage}
            />
            <View style={styles.previewContent}>
              <Text style={styles.previewName}>{selectedPlace.name}</Text>
              <Text style={styles.previewCategory}>{selectedPlace.category?.name}</Text>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => {
                  navigation.navigate('PlaceDetail', { placeId: selectedPlace.id });
                  setSelectedPlace(null);
                }}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    padding: 20,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 15,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryListContent: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  categoryItemActive: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  markerContainer: {
    backgroundColor: '#000',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  previewCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  previewContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  viewButton: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ExploreScreen;
