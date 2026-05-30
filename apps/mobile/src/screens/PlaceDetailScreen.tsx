import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator, Dimensions, Modal, TextInput, Switch, Alert } from 'react-native';
import { LucideMapPin, LucideClock, LucideMessageCircle, LucideChevronLeft, LucideBookmark, LucideEdit2, LucideFlag, LucideInfo, LucideShield, LucideCheckCircle, LucideX } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../api/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';

const { width } = Dimensions.get('window');

const PlaceDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { placeId } = route.params;
  const { session } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState<any>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Tip submission state
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipContent, setTipContent] = useState('');
  const [freshnessConfirmed, setFreshnessConfirmed] = useState(false);
  const [submittingTip, setSubmittingTip] = useState(false);

  // Claim submission state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimRelationship, setClaimRelationship] = useState('');
  const [claimVerification, setClaimVerification] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    fetchPlaceDetails();
    checkSaveStatus();
  }, [placeId]);

  const fetchPlaceDetails = async () => {
    setLoading(true);
    try {
      const [placeResponse, tipsResponse, guidesResponse] = await Promise.all([
        supabase
          .from('places')
          .select('*, category:categories(*)')
          .eq('id', placeId)
          .single(),
        supabase
          .from('tips')
          .select('*, user:profiles(full_name, avatar_url)')
          .eq('place_id', placeId)
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('guide_places')
          .select('guide:guides(*, creator:profiles(full_name, avatar_url))')
          .eq('place_id', placeId)
          .limit(3)
      ]);
      
      if (placeResponse.data) setPlace(placeResponse.data);
      if (tipsResponse.data) setTips(tipsResponse.data);
      if (guidesResponse.data) {
        setGuides(guidesResponse.data.map((gp: any) => gp.guide).filter(g => g !== null));
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
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
        .eq('place_id', placeId)
        .maybeSingle();
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!session?.user) {
      Alert.alert('Sign In Required', 'Please sign in to save places.');
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        await supabase
          .from('saves')
          .delete()
          .eq('user_id', session.user.id)
          .eq('place_id', placeId);
        setIsSaved(false);
      } else {
        await supabase
          .from('saves')
          .insert({
            user_id: session.user.id,
            place_id: placeId
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

  const handleSubmitTip = async () => {
    if (!tipContent.trim()) return;
    if (!session?.user) {
      Alert.alert('Sign In Required', 'Please sign in to share a tip.');
      return;
    }

    setSubmittingTip(true);
    try {
      const { error } = await supabase
        .from('tips')
        .insert({
          user_id: session.user.id,
          place_id: placeId,
          content: tipContent,
          freshness_confirmed: freshnessConfirmed,
          moderation_status: 'pending'
        });

      if (error) throw error;

      Alert.alert('Success', 'Tip submitted for review!');
      setShowTipModal(false);
      setTipContent('');
      setFreshnessConfirmed(false);
    } catch (error) {
      console.error('Error submitting tip:', error);
      Alert.alert('Error', 'Failed to submit tip.');
    } finally {
      setSubmittingTip(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimRelationship.trim() || !claimVerification.trim()) {
      Alert.alert('Required Fields', 'Please fill in all verification details.');
      return;
    }
    if (!session?.user) {
      Alert.alert('Sign In Required', 'Please sign in to claim this business.');
      return;
    }

    setSubmittingClaim(true);
    try {
      const { error } = await supabase
        .from('business_claims')
        .insert({
          user_id: session.user.id,
          place_id: placeId,
          status: 'pending',
          verification_details: {
            relationship: claimRelationship,
            details: claimVerification
          }
        });

      if (error) throw error;

      Alert.alert('Claim Submitted', 'We will review your claim and get back to you soon.');
      setShowClaimModal(false);
      setClaimRelationship('');
      setClaimVerification('');
    } catch (error) {
      console.error('Error submitting claim:', error);
      Alert.alert('Error', 'Failed to submit claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleGetDirections = () => {
    if (place?.location?.coordinates) {
      const [lng, lat] = place.location.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!place) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {(place.photos?.length > 0 ? place.photos : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop']).map((photo: string, index: number) => (
              <Image key={index} source={{ uri: photo }} style={styles.galleryImage} />
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <LucideChevronLeft color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.category}>{place.category?.name}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, isSaved && styles.saveButtonActive]} 
              onPress={handleSaveToggle}
              disabled={saveLoading}
            >
              <LucideBookmark color={isSaved ? "#fff" : "#000"} fill={isSaved ? "#fff" : "none"} size={24} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{place.description}</Text>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <LucideMapPin size={20} color="#666" />
              <Text style={styles.infoText}>{place.address}</Text>
            </View>
            <View style={styles.infoItem}>
              <LucideClock size={20} color="#666" />
              <Text style={styles.infoText}>
                {place.hours?.open || 'Hours not available'}
              </Text>
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: place.location?.coordinates?.[1] || 37.7749,
                longitude: place.location?.coordinates?.[0] || -122.4194,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: place.location?.coordinates?.[1] || 37.7749,
                  longitude: place.location?.coordinates?.[0] || -122.4194,
                }}
              />
            </MapView>
          </View>

          <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>

          {/* Creator Context */}
          {guides.length > 0 && (
            <View style={styles.guidesSection}>
              <Text style={styles.sectionTitle}>Featured in Guides</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guideList}>
                {guides.map((guide) => (
                  <TouchableOpacity 
                    key={guide.id} 
                    style={styles.guideCard}
                    onPress={() => navigation.navigate('GuideDetail', { guideId: guide.id })}
                  >
                    <Image source={{ uri: guide.cover_image }} style={styles.guideImage} />
                    <View style={styles.guideOverlay}>
                      <Text style={styles.guideTitle} numberOfLines={2}>{guide.title}</Text>
                      <Text style={styles.guideCreator}>by {guide.creator?.full_name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Safety & Accessibility */}
          {(place.safety_notes || place.accessibility_notes) && (
            <View style={styles.notesSection}>
              {place.accessibility_notes && (
                <View style={styles.noteItem}>
                  <LucideInfo size={20} color="#000" />
                  <View style={styles.noteContent}>
                    <Text style={styles.noteTitle}>Accessibility</Text>
                    <Text style={styles.noteText}>{place.accessibility_notes}</Text>
                  </View>
                </View>
              )}
              {place.safety_notes && (
                <View style={styles.noteItem}>
                  <LucideShield size={20} color="#000" />
                  <View style={styles.noteContent}>
                    <Text style={styles.noteTitle}>Safety</Text>
                    <Text style={styles.noteText}>{place.safety_notes}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeader}>
              <View>
                <Text style={styles.sectionTitle}>Community Tips</Text>
                <Text style={styles.sectionSubtitle}>Insider info from locals</Text>
              </View>
              <TouchableOpacity style={styles.writeTipButton} onPress={() => setShowTipModal(true)}>
                <LucideEdit2 size={16} color="#fff" />
                <Text style={styles.writeTipText}>Write a Tip</Text>
              </TouchableOpacity>
            </View>
            {tips.length > 0 ? (
              tips.map((tip) => (
                <View key={tip.id} style={styles.tipCard}>
                  <View style={styles.tipHeaderRow}>
                    <View style={styles.tipUser}>
                      <Image 
                        source={{ uri: tip.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
                        style={styles.tipAvatar} 
                      />
                      <Text style={styles.tipUserName}>{tip.user?.full_name}</Text>
                    </View>
                    {tip.freshness_confirmed && (
                      <View style={styles.freshBadge}>
                        <LucideCheckCircle size={12} color="#10b981" />
                        <Text style={styles.freshText}>Still Good</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tipContent}>{tip.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noTips}>No tips yet. Be the first to add one!</Text>
            )}
          </View>

          {/* Business Claiming */}
          {!place.is_claimed && (
            <TouchableOpacity style={styles.claimBanner} onPress={() => setShowClaimModal(true)}>
              <LucideShield size={20} color="#6366f1" />
              <View style={styles.claimContent}>
                <Text style={styles.claimTitle}>Own this business?</Text>
                <Text style={styles.claimSubtitle}>Claim it to manage your profile and tips.</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Actions */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionItem}>
              <LucideEdit2 size={20} color="#666" />
              <Text style={styles.actionText}>Suggest Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <LucideFlag size={20} color="#666" />
              <Text style={styles.actionText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Write a Tip Modal */}
      <Modal visible={showTipModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share a Tip</Text>
              <TouchableOpacity onPress={() => setShowTipModal(false)}>
                <LucideX size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.tipInput}
              placeholder="What should others know about this place?"
              multiline
              value={tipContent}
              onChangeText={setTipContent}
            />
            <View style={styles.switchContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Still Good?</Text>
                <Text style={styles.switchSubtitle}>Confirm information is still accurate</Text>
              </View>
              <Switch 
                value={freshnessConfirmed} 
                onValueChange={setFreshnessConfirmed}
                trackColor={{ false: '#eee', true: '#000' }}
              />
            </View>
            <TouchableOpacity 
              style={[styles.submitButton, submittingTip && styles.disabledButton]} 
              onPress={handleSubmitTip}
              disabled={submittingTip}
            >
              {submittingTip ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Tip</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Claim Business Modal */}
      <Modal visible={showClaimModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Claim Business</Text>
              <TouchableOpacity onPress={() => setShowClaimModal(false)}>
                <LucideX size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Relationship to Business</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Owner, Manager"
              value={claimRelationship}
              onChangeText={setClaimRelationship}
            />
            <Text style={styles.inputLabel}>Verification Details</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="e.g. Website URL, business phone number"
              multiline
              value={claimVerification}
              onChangeText={setClaimVerification}
            />
            <TouchableOpacity 
              style={[styles.submitButton, submittingClaim && styles.disabledButton]} 
              onPress={handleSubmitClaim}
              disabled={submittingClaim}
            >
              {submittingClaim ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Claim</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  galleryContainer: {
    height: 300,
    backgroundColor: '#eee',
  },
  galleryImage: {
    width: width,
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  category: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  saveButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
  },
  saveButtonActive: {
    backgroundColor: '#000',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 32,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guidesSection: {
    marginBottom: 32,
  },
  guideList: {
    marginTop: 16,
  },
  guideCard: {
    width: 160,
    height: 200,
    marginRight: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  guideTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  guideCreator: {
    color: '#eee',
    fontSize: 10,
    marginTop: 2,
  },
  notesSection: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 20,
    gap: 20,
    marginBottom: 32,
  },
  noteItem: {
    flexDirection: 'row',
    gap: 16,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  writeTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  writeTipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tipUserName: {
    fontSize: 14,
    fontWeight: '600',
  },
  freshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  freshText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  tipContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  noTips: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  claimBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    padding: 16,
    borderRadius: 15,
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  claimContent: {
    flex: 1,
  },
  claimTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4338ca',
  },
  claimSubtitle: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 24,
    paddingBottom: 40,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  tipInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
});

export default PlaceDetailScreen;
