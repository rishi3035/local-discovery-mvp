import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { LucideChevronLeft, LucideBookmark, LucideMap, LucideMapPin } from 'lucide-react-native';
import { supabase } from '../api/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';

const { width } = Dimensions.get('window');

const GuideDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { guideId } = route.params;
  const { session } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchGuideDetails();
    checkSaveStatus();
  }, [guideId]);

  const fetchGuideDetails = async () => {
    setLoading(true);
    try {
      const [guideResponse, placesResponse] = await Promise.all([
        supabase
          .from('guides')
          .select('*, creator:profiles(*)')
          .eq('id', guideId)
          .single(),
        supabase
          .from('guide_places')
          .select(`
            order,
            place:places (
              id,
              name,
              photos,
              address,
              location,
              category:categories(name)
            )
          `)
          .eq('guide_id', guideId)
          .order('order', { ascending: true })
      ]);
      
      if (guideResponse.data) setGuide(guideResponse.data);
      if (placesResponse.data) {
        setPlaces(placesResponse.data.map((gp: any) => gp.place));
      }
    } catch (error) {
      console.error('Error fetching guide details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSaveStatus = async () => {
    if (!session?.user) return;
    try {
      const { data } = await supabase
        .from('saves')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('guide_id', guideId)
        .maybeSingle();
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!session?.user) {
      Alert.alert('Sign In Required', 'Please sign in to save guides.');
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        await supabase
          .from('saves')
          .delete()
          .eq('user_id', session.user.id)
          .eq('guide_id', guideId);
        setIsSaved(false);
      } else {
        await supabase
          .from('saves')
          .insert({
            user_id: session.user.id,
            guide_id: guideId
          });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to update save status.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!guide) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nav Buttons (Absolute) */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <LucideChevronLeft color="#000" size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, isSaved && styles.iconButtonActive]} 
            onPress={handleSaveToggle}
            disabled={saveLoading}
          >
            <LucideBookmark color={isSaved ? "#fff" : "#000"} fill={isSaved ? "#fff" : "none"} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Image 
            source={{ uri: guide.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.coverImage} 
          />
          <View style={styles.headerContent}>
            <Text style={styles.title}>{guide.title}</Text>
            <View style={styles.creatorInfo}>
              <Image 
                source={{ uri: guide.creator?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
                style={styles.creatorAvatar} 
              />
              <Text style={styles.creatorName}>by {guide.creator?.full_name}</Text>
            </View>
            <Text style={styles.description}>{guide.description}</Text>
          </View>
        </View>

        <View style={styles.mapButtonContainer}>
          <TouchableOpacity style={styles.mapButton}>
            <LucideMap size={20} color="#fff" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeList}>
          <Text style={styles.sectionTitle}>{places.length} Places</Text>
          {places.map((place, index) => (
            <TouchableOpacity 
              key={place.id} 
              style={styles.placeCard}
              onPress={() => navigation.navigate('PlaceDetail', { placeId: place.id })}
            >
              <View style={styles.placeIndex}>
                <Text style={styles.placeIndexText}>{index + 1}</Text>
              </View>
              <Image 
                source={{ uri: place.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop' }} 
                style={styles.placeImage} 
              />
              <View style={styles.placeContent}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeCategory}>{place.category?.name}</Text>
                <View style={styles.placeLocation}>
                  <LucideMapPin size={12} color="#888" />
                  <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonActive: {
    backgroundColor: '#000',
  },
  header: {
    marginBottom: 24,
  },
  coverImage: {
    width: width,
    height: 300,
  },
  headerContent: {
    padding: 24,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  creatorName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  mapButtonContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeList: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  placeIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  placeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeContent: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  placeCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  placeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  placeAddress: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
});

export default GuideDetailScreen;
