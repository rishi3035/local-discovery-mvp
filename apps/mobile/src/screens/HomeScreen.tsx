import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { LucideSearch, LucideBell, LucideMapPin } from 'lucide-react-native';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
  const [creatorPicks, setCreatorPicks] = useState<any[]>([]);
  const [interestPlaces, setInterestPlaces] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const city = profile?.city || 'San Francisco';

  useEffect(() => {
    fetchFeedData();
  }, [city, profile?.interests]);

  const fetchFeedData = async () => {
    setLoading(true);
    try {
      // 1. Trending in [City]
      const { data: trending } = await supabase
        .from('places')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (trending) setTrendingPlaces(trending);

      // 2. Creator Picks (Guides)
      const { data: guides } = await supabase
        .from('guides')
        .select('*, creator:profiles(full_name)')
        .limit(3);
      
      if (guides) setCreatorPicks(guides);

      // 3. Based on interests
      if (profile?.interests?.length > 0) {
        const { data: interests } = await supabase
          .from('places')
          .select('*, category:categories(name)')
          .in('category.name', profile.interests)
          .limit(5);
        if (interests) setInterestPlaces(interests);
      }
    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <View style={styles.locationContainer}>
            <LucideMapPin size={16} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.location}>{city}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <LucideBell color="#000" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBarContainer}>
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {creatorPicks.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Creator Picks</Text>
            <TouchableOpacity 
              style={styles.featuredCard}
              onPress={() => navigation.navigate('GuideDetail', { guideId: creatorPicks[0].id })}
            >
              <Image 
                source={{ uri: creatorPicks[0].cover_image }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredTitle}>{creatorPicks[0].title}</Text>
                <Text style={styles.featuredSubtitle}>By {creatorPicks[0].creator?.full_name}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>Trending in {city}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingList}>
            {trendingPlaces.map(place => (
              <TouchableOpacity 
                key={place.id} 
                style={styles.trendingCard}
                onPress={() => navigation.navigate('PlaceDetail', { placeId: place.id })}
              >
                <Image 
                  source={{ uri: place.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop' }}
                  style={styles.trendingImage}
                />
                <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.placeCategory}>{place.category?.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {interestPlaces.length > 0 && (
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>Based on your interests</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingList}>
              {interestPlaces.map(place => (
                <TouchableOpacity 
                  key={place.id} 
                  style={styles.trendingCard}
                  onPress={() => navigation.navigate('PlaceDetail', { placeId: place.id })}
                >
                  <Image 
                    source={{ uri: place.photos?.[0] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop' }}
                    style={styles.trendingImage}
                  />
                  <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                  <Text style={styles.placeCategory}>{place.category?.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  searchBarContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  featuredSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 250,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  featuredSubtitle: {
    color: '#eee',
    fontSize: 14,
    marginTop: 4,
  },
  trendingSection: {
    paddingVertical: 12,
  },
  trendingList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  trendingCard: {
    width: 200,
  },
  trendingImage: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    marginBottom: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeCategory: {
    fontSize: 12,
    color: '#888',
  },
});

export default HomeScreen;
