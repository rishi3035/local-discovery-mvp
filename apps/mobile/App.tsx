import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { supabase } from './src/api/supabase';
import { useAuthStore } from './src/store/useAuthStore';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const { setSession, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    setSession(session);
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RootNavigator />
    </NavigationContainer>
  );
}
