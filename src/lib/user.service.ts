
'use client';

import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole, PublicUserProfile } from '@/types';

// User Creation and Profile Management Service
class UserService {
  // Lazy initialization of Supabase client
  private get supabase() {
    return createClient();
  }

  // Create a new user with extended profile
  async signUp(email: string, password: string, metadata: Partial<Pick<UserProfile, 'full_name' | 'username' | 'role' | 'phone_number'>> = {}) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const userMetadata = {
        full_name: metadata.full_name || email.split('@')[0],
        username: metadata.username || email.split('@')[0],
        role: metadata.role || 'buyer',
        phone_number: metadata.phone_number || null,
      };

      // Sign up with Supabase Auth. The database trigger will handle profile creation.
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User not created in Auth.");

      // The database trigger 'handle_new_user' is responsible for creating the profile.
      // We no longer need to manually update it here, which was causing a race condition.
      // The getProfile method below has retry logic to wait for the trigger to complete.
      
      // Fetch profile to confirm and return it, using retry logic for trigger delay
      const profile = await this.getProfile(authData.user.id);

      return { user: authData.user, profile };
    } catch (error) {
      console.error('User signup error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      console.log('🔄 Starting profile update for user:', userId);
      console.log('📝 Updates to apply:', updates);
      
      // Update auth user metadata for fields that are mirrored there
      if(updates.full_name || updates.avatar_url) {
        console.log('🔐 Updating auth user metadata...');
        const { data: { user } , error: authError } = await this.supabase.auth.updateUser({
          data: {
            full_name: updates.full_name,
            avatar_url: updates.avatar_url
          }
        });

        if (authError) {
          console.error('❌ Auth update error:', authError);
          throw authError;
        }

        console.log('✅ Auth user metadata updated');
      }
      
      // Add updated_at timestamp to the updates
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Updating profiles table with:', updatesWithTimestamp);

      // Update profiles table with all provided updates
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .update(updatesWithTimestamp)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        throw profileError;
      }

      console.log('✅ Profile updated successfully:', profileData);
      return { profile: profileData };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  }
  
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    // Delegate the upload to a secure Server Action
    const { uploadFile } = await import('@/app/actions');
    const result = await uploadFile('avatars', userId, formData);

    if ('error' in result) {
      throw new Error(result.error);
    }
    return result.publicUrl;
  }
  
  async uploadIdentityDocument(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    // Delegate the upload to a secure Server Action
    const { uploadFile } = await import('@/app/actions');
    const result = await uploadFile('identity_documents', userId, formData);

    if ('error' in result) {
      throw new Error(result.error);
    }
    return result.publicUrl;
  }

  // Fetch user profile with enhanced retry logic
  async getProfile(userId: string, maxRetries: number = 3): Promise<UserProfile | null> {
    try {
      console.log('🔍 GetProfile: Starting profile fetch for user:', userId);
      
      if (!userId) {
        console.warn('❌ GetProfile: Called with empty userId');
        return null;
      }

      // Verificar primero si el usuario está autenticado
      try {
        const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ GetProfile: Session check error:', sessionError);
        } else {
          console.log('🔐 GetProfile: Session check result:', session ? 'Authenticated' : 'Not authenticated');
          
          // Si estamos buscando el perfil del usuario actual pero no hay sesión, es un problema
          if (!session) {
            console.error('❌ GetProfile: No active session found');
          } else if (session.user?.id === userId) {
            console.log('✅ GetProfile: Fetching profile for authenticated user');
          }
        }
      } catch (sessionCheckError) {
        console.error('❌ GetProfile: Error checking session:', sessionCheckError);
      }

      let lastError: any = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📡 GetProfile: Querying profiles table (attempt ${attempt}/${maxRetries})...`);
          
          // Query the profiles table
          const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); // Use maybeSingle to avoid error on no rows

          if (error) {
            console.error(`❌ GetProfile: Error fetching profile on attempt ${attempt}:`, error);
            lastError = error;
            
            // If it's a network or temporary error, retry
            if (attempt < maxRetries && this.isRetryableError(error)) {
              const delay = Math.min(1000 * attempt, 3000); // Progressive delay: 1s, 2s, 3s
              console.log(`⏳ GetProfile: Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw error;
          }

          if (data) {
            console.log(`✅ GetProfile: Profile found on attempt ${attempt}:`, data);
            return data;
          }

          // Profile not found - could be due to db trigger delay
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * attempt, 2000); // Progressive delay for trigger completion
            console.log(`⏳ GetProfile: Profile not found, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (attemptError) {
          lastError = attemptError;
          if (attempt === maxRetries) {
            throw attemptError;
          }
        }
      }

      console.warn(`❌ GetProfile: Profile for ${userId} not found after ${maxRetries} attempts`);
      
      // As a last resort, try to create the profile manually if the trigger failed
      try {
        console.log('🔧 GetProfile: Attempting to create profile manually as fallback...');
        
        // Verificar si el usuario está autenticado antes de intentar crear el perfil
        const { data: { user: authUser }, error: authError } = await this.supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ GetProfile: Auth error when getting user:', authError);
          return null;
        }
        
        if (!authUser) {
          console.error('❌ GetProfile: No authenticated user found');
          return null;
        }
        
        if (authUser.id !== userId) {
          console.error(`❌ GetProfile: Auth user ID (${authUser.id}) doesn't match requested profile ID (${userId})`);
          return null;
        }
        
        console.log('👤 GetProfile: Auth user found, creating profile as fallback...');
        
        // Intentar obtener metadatos del usuario para crear un perfil más completo
        const fallbackProfile = {
          id: userId,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_url: authUser.user_metadata?.avatar_url || null,
          email: authUser.email || '',
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
          role: authUser.user_metadata?.role || 'buyer',
          phone_number: authUser.user_metadata?.phone_number || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('📝 GetProfile: Attempting to insert fallback profile:', fallbackProfile);
        
        // Intentar insertar el perfil
        const { data: createdProfile, error: createError } = await this.supabase
          .from('profiles')
          .insert(fallbackProfile)
          .select()
          .single();
          
        if (createError) {
          console.error('❌ GetProfile: Failed to create fallback profile:', createError);
          
          // Si el error es de duplicado, intentar obtener el perfil existente
          if (createError.code === '23505') { // Código de error de duplicado en PostgreSQL
            console.log('🔄 GetProfile: Profile already exists, trying to fetch it again...');
            const { data: existingProfile, error: fetchError } = await this.supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
              
            if (fetchError) {
              console.error('❌ GetProfile: Error fetching existing profile:', fetchError);
              return null;
            }
            
            if (existingProfile) {
              console.log('✅ GetProfile: Existing profile found:', existingProfile);
              return existingProfile;
            }
          }
          
          return null;
        }
        
        console.log('✅ GetProfile: Fallback profile created successfully:', createdProfile);
        return createdProfile;
      } catch (fallbackError) {
        console.error('❌ GetProfile: Fallback profile creation failed:', fallbackError);
        return null;
      }
    } catch (error) {
      console.error('❌ GetProfile: Unhandled fetch profile error:', error);
      // En lugar de lanzar el error, devolvemos null para evitar bloquear la UI
      return null;
    }
  }

  // Helper method to determine if an error is retryable
  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, and temporary database issues are retryable
    const retryableMessages = [
      'network',
      'timeout',
      'connection',
      'temporary',
      'unavailable',
      'rate limit',
      'fetch',
      'abort'
    ];
    
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';
    
    return retryableMessages.some(msg => 
      errorMessage.includes(msg) || errorCode.includes(msg)
    );
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing database connection...');
      
      // Use a simple query with timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 3000)
      );
      
      const queryPromise = this.supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const { error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // Grant Pro subscription
  async grantProSubscription(userId: string) {
    try {
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) throw profileError;

      return { profile: profileData };
    } catch (error) {
      console.error('Grant Pro subscription error:', error);
      throw error;
    }
  }

  // Get public profile (for viewing other users' profiles)
  async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    try {
      console.log('🔍 GetPublicProfile: Fetching public profile for user:', userId);
      console.log('🔍 GetPublicProfile: Current session check...');
      
      // Check current session for debugging
      try {
        const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
        console.log('🔍 GetPublicProfile: Session status:', session ? 'Active' : 'None');
        console.log('🔍 GetPublicProfile: Session error:', sessionError);
        if (session) {
          console.log('🔍 GetPublicProfile: Session user ID:', session.user?.id);
        }
      } catch (sessionCheckError) {
        console.error('❌ GetPublicProfile: Session check failed:', sessionCheckError);
      }
      
      // Try to get the profile using a public query
      console.log('🔍 GetPublicProfile: Executing database query...');
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          bio,
          avatar_url,
          role,
          phone_number,
          full_address,
          is_verified,
          subscription_status,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      console.log('🔍 GetPublicProfile: Query result - Data:', data);
      console.log('🔍 GetPublicProfile: Query result - Error:', error);

      if (error) {
        console.error('❌ GetPublicProfile: Error fetching public profile:', error);
        console.error('❌ GetPublicProfile: Error code:', error.code);
        console.error('❌ GetPublicProfile: Error message:', error.message);
        return null;
      }

      console.log('✅ GetPublicProfile: Public profile fetched successfully:', data?.full_name);
      return data as PublicUserProfile;
    } catch (error) {
      console.error('❌ GetPublicProfile: Unexpected error:', error);
      return null;
    }
  }
}

// Export a single instance of the service
export const userService = new UserService();
