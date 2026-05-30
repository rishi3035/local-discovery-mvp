import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LucideArrowRight, LucideCheck } from 'lucide-react-native';
import { supabase } from '../api/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const InterestsSelectionScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const renderItem = ({ item }: { item: Category }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => toggleSelection(item.id)}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item.name}</Text>
        {isSelected && <LucideCheck color="#fff" size={16} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 3</Text>
          <Text style={styles.title}>What's your vibe?</Text>
          <Text style={styles.subtitle}>Select the categories that interest you most. We'll tailor your feed to these.</Text>
        </View>

        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
        />

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, selectedIds.length === 0 && styles.disabledButton]}
            onPress={() => navigation.navigate('VibeBudget', { interests: selectedIds })}
            disabled={selectedIds.length === 0}
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
  list: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  item: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
  },
  itemSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemTextSelected: {
    color: '#fff',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default InterestsSelectionScreen;
