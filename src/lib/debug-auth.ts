'use client';

import { createClient } from '@/lib/supabase/client';

export const debugAuthState = async () => {
  console.log('=== DEBUG AUTH STATE ===');
  
  // Check if we're in browser
  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }
  
  // Check current URL
  console.log('🌐 Current URL:', window.location.href);
  console.log('🌐 Current pathname:', window.location.pathname);
  
  // Check localStorage for auth tokens
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const domain = supabaseUrl.split('//')[1];
    const authTokenKey = `sb-${domain}-auth-token`;
    const authToken = localStorage.getItem(authTokenKey);
    console.log('🔑 Auth token key:', authTokenKey);
    console.log('🔑 Auth token exists:', !!authToken);
    console.log('🔑 Auth token preview:', authToken ? authToken.substring(0, 50) + '...' : 'null');
  }
  
  // Check all localStorage keys related to supabase
  const allKeys = Object.keys(localStorage);
  const supabaseKeys = allKeys.filter(key => key.includes('sb-') || key.includes('supabase'));
  console.log('🔑 All Supabase-related localStorage keys:', supabaseKeys);
  
  // Check session with Supabase
  try {
    const supabase = createClient();
    console.log('📡 Supabase client created');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📡 Session data:', session);
    console.log('📡 Session error:', sessionError);
    
    if (session) {
      console.log('✅ Session active');
      console.log('👤 User ID:', session.user?.id);
      console.log('👤 User email:', session.user?.email);
      console.log('👤 User metadata:', session.user?.user_metadata);
      console.log('🕐 Session expires at:', new Date(session.expires_at! * 1000));
      console.log('🕐 Current time:', new Date());
      console.log('🕐 Session expired?', session.expires_at! * 1000 < Date.now());
    } else {
      console.log('❌ No active session');
    }
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 User data:', user);
    console.log('👤 User error:', userError);
    
  } catch (error) {
    console.error('❌ Error checking auth state:', error);
  }
  
  console.log('=== END DEBUG AUTH STATE ===');
};

// Function to clear all auth data
export const clearAllAuthData = () => {
  console.log('🧹 Clearing all auth data...');
  
  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }
  
  // Clear all supabase-related localStorage
  const allKeys = Object.keys(localStorage);
  const supabaseKeys = allKeys.filter(key => key.includes('sb-') || key.includes('supabase'));
  
  supabaseKeys.forEach(key => {
    console.log('🗑️ Removing:', key);
    localStorage.removeItem(key);
  });
  
  // Clear session storage too
  const sessionKeys = Object.keys(sessionStorage);
  const supabaseSessionKeys = sessionKeys.filter(key => key.includes('sb-') || key.includes('supabase'));
  
  supabaseSessionKeys.forEach(key => {
    console.log('🗑️ Removing from session storage:', key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Auth data cleared');
};

// Add to window for easy access in dev tools
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
  (window as any).clearAllAuthData = clearAllAuthData;
}