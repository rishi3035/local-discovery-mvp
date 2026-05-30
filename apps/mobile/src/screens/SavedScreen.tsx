import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../api/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LucideMapPin } from 'lucide-react-native';

const SavedScreen = () => {
  const [activeTab, setActiveTab] = useState<'places' | 'guides'>('places');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const { session } = useAuthStore();
  const navigation = useNavigation<any>();

  const fetchSavedItems = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'places') {
        const { data, error } = await supabase
          .from('saves')
          .select(`
            place:places (
              id,
              name,
              photos,
              address,
              category:categories(name)
            )
          `)
          .eq('user_id', session.user.id)
          .not('place_id', 'is', null);

        if (error) throw error;
        setItems(data?.map(item => item.place) || []);
      } else {
        const { data, error } = await supabase
          .from('saves')
          .select(`
            guide:guides (
              id,
              title,
              cover_image,
              description,
              creator:profiles(full_name)
            )
          `)
          .eq('user_id', session.user.id)
          .not('guide_id', 'is', null);

        if (error) throw error;
        setItems(data?.map(item => item.guide) || []);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedItems();
    }, [activeTab, session])
  );

  const renderPlaceItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.placeCard}
      onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
    >
      <Image 
        source={{ uri: item.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop' }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category?.name}</Text>
        <View style={styles.itemLocation}>
          <LucideMapPin size={12} color="#888" />
          <Text style={styles.itemAddress} numberOfLines={1}>{item.address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGuideItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.guideCard}
      onPress={() => navigation.navigate('GuideDetail', { guideId: item.id })}
    >
      <Image 
        source={{ uri: item.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop' }} 
        style={styles.guideImage} 
      />
      <View style={styles.guideContent}>
        <Text style={styles.guideTitle}>{item.title}</Text>
        <Text style={styles.guideCreator}>by {item.creator?.full_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'places' && styles.activeTab]}
          onPress={() => setActiveTab('places')}
        >
          <Text style={[styles.tabText, activeTab === 'places' && styles.activeTabText]}>Places</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'guides' && styles.activeTab]}
          onPress={() => setActiveTab('guides')}
        >
          <Text style={[styles.tabText, activeTab === 'guides' && styles.activeTabText]}>Guides</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : items.length > 0 ? (
          <FlatList
            data={items}
            renderItem={activeTab === 'places' ? renderPlaceItem : renderGuideItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholder}>You haven't saved any {activeTab} yet.</Text>
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
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginVertical: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  itemCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  itemAddress: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  guideCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  guideImage: {
    width: '100%',
    height: 160,
  },
  guideContent: {
    padding: 16,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  guideCreator: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  placeholder: {
    color: '#888',
    fontSize: 16,
  },
});

export default SavedScreen;
