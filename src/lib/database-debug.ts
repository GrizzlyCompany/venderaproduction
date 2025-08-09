import { createClient } from '@/lib/supabase/client';

export async function debugUserState(userId?: string) {
  const supabase = createClient();
  
  try {
    console.log('🔍 Debugging user state...');
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return { error: sessionError };
    }
    
    const targetUserId = userId || session?.user?.id;
    
    if (!targetUserId) {
      console.error('❌ No user ID available');
      return { error: 'No user ID available' };
    }
    
    // Call the debug function
    const { data, error } = await supabase.rpc('debug_user_state', {
      user_id: targetUserId
    });
    
    if (error) {
      console.error('❌ Debug function error:', error);
      return { error };
    }
    
    console.log('🔍 User state debug result:', data);
    return { data };
    
  } catch (error) {
    console.error('❌ Debug user state error:', error);
    return { error };
  }
}

export async function ensureUserProfile(userId?: string) {
  const supabase = createClient();
  
  try {
    console.log('🔧 Ensuring user profile exists...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return { error: sessionError };
    }
    
    const targetUserId = userId || session?.user?.id;
    
    if (!targetUserId) {
      console.error('❌ No user ID available');
      return { error: 'No user ID available' };
    }
    
    // Call the ensure profile function
    const { data, error } = await supabase.rpc('ensure_user_profile', {
      user_id: targetUserId
    });
    
    if (error) {
      console.error('❌ Ensure profile function error:', error);
      return { error };
    }
    
    console.log('✅ Profile ensured:', data);
    return { data };
    
  } catch (error) {
    console.error('❌ Ensure user profile error:', error);
    return { error };
  }
}

export async function clearAuthCache() {
  console.log('🧹 Clearing auth cache...');
  
  if (typeof window !== 'undefined') {
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('vendra'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🧹 Removing key:', key);
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('vendra'))) {
        sessionKeysToRemove.push(key);
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      console.log('🧹 Removing session key:', key);
      sessionStorage.removeItem(key);
    });
    
    console.log('✅ Auth cache cleared');
  }
}