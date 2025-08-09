
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as SupabaseUser, AuthError, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/types';
import { userService } from '@/lib/user.service';


interface AuthContextType {
  user: (SupabaseUser & { profile?: UserProfile }) | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string, role: UserRole, phone?: string) => Promise<{ error: AuthError | null }>;
  supabase: SupabaseClient;
  refreshUser: () => Promise<void>;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => void;
  clearSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<(SupabaseUser & { profile?: UserProfile }) | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      console.log('🔄 RefreshUser: Starting user refresh...');
      
      // Verificar si estamos en un entorno de cliente
      if (typeof window === 'undefined') {
        console.log('⚠️ RefreshUser: Running in server context, skipping refresh');
        return;
      }
      
      // Verificar la sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ RefreshUser: Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.log('⚠️ RefreshUser: No active session found');
        setUser(null);
        return;
      }
      
      console.log('✅ RefreshUser: Active session found, getting user data');
      
      // Obtener datos del usuario autenticado
      const { data: { user: authData }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ RefreshUser: Auth error:', authError);
        throw authError;
      }
      
      if (authData) {
        console.log('👤 RefreshUser: Auth user found, fetching profile...');
        
        // Establecer el usuario inmediatamente sin perfil para evitar problemas de UI
        setUser({ ...authData, profile: undefined });
        
        try {
          // Use enhanced retry logic with timeout
          const profilePromise = userService.getProfile(authData.id, 3); // Aumentado a 3 reintentos
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('RefreshUser profile fetch timeout')), 10000) // Aumentado a 10 segundos
          );
          
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          
          if (profile) {
            console.log('📋 RefreshUser: Profile fetched successfully:', profile);
            setUser({ ...authData, profile });
            console.log('✅ RefreshUser: User updated in context with profile');
          } else {
            console.warn('⚠️ RefreshUser: No profile returned, user will continue without profile');
            // El usuario ya fue establecido sin perfil anteriormente
          }
        } catch (profileError) {
          console.error('❌ RefreshUser: Profile fetch failed:', profileError);
          // El usuario ya fue establecido sin perfil anteriormente
          
          // Intentar crear el perfil como último recurso
          try {
            console.log('🔄 RefreshUser: Attempting to create profile as last resort...');
            const profile = await userService.getProfile(authData.id, 1);
            if (profile) {
              console.log('✅ RefreshUser: Profile created successfully');
              setUser({ ...authData, profile });
            }
          } catch (createError) {
            console.error('❌ RefreshUser: Failed to create profile:', createError);
          }
        }
      } else {
        console.log('❌ RefreshUser: No auth user found despite active session');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ RefreshUser: Error during refresh:', error);
      // No lanzamos el error para evitar bloquear la UI
      setUser(null);
    }
  };

  const updateUserProfile = (profileUpdates: Partial<UserProfile>) => {
    console.log('🔄 UpdateUserProfile: Updating user profile in context...');
    if (user && user.profile) {
      const updatedProfile = { ...user.profile, ...profileUpdates };
      setUser({ ...user, profile: updatedProfile });
      console.log('✅ UpdateUserProfile: Profile updated in context');
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    // Verificar el estado de autenticación al cargar el componente
    const checkInitialAuth = async () => {
      try {
        console.log('🔍 AuthContext: Verificando estado de autenticación inicial...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthContext: Error al obtener la sesión inicial:', error);
          
          // Si el error es de sesión inválida o token de refresh inválido, limpiar la sesión
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token') ||
              error.message?.includes('refresh token not found') ||
              error.message?.includes('AuthSessionMissingError') ||
              error.name === 'AuthSessionMissingError') {
            console.log('🧹 AuthContext: Sesión inválida, limpiando datos de autenticación...');
            try {
              await supabase.auth.signOut();
              // Clear local storage as well
              if (typeof window !== 'undefined') {
                localStorage.removeItem('vendra-auth-token');
                localStorage.removeItem('sb-qlbuwoyugbwpzzwdflsq-auth-token');
              }
            } catch (signOutError) {
              console.warn('⚠️ AuthContext: Error al cerrar sesión:', signOutError);
            }
          }
          
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (session?.user) {
          console.log('✅ AuthContext: Sesión inicial encontrada, usuario autenticado:', session.user.id);
          // Establecer usuario inmediatamente para evitar redirecciones incorrectas
          if (isMounted) {
            setUser({ ...session.user, profile: undefined });
            
            // Luego cargar el perfil
            try {
              const profile = await userService.getProfile(session.user.id, 2);
              if (isMounted && profile) {
                console.log('✅ AuthContext: Perfil inicial cargado correctamente');
                setUser({ ...session.user, profile });
              }
            } catch (profileError) {
              console.warn('⚠️ AuthContext: Error al cargar perfil inicial:', profileError);
            } finally {
              if (isMounted) {
                setLoading(false);
              }
            }
          }
        } else {
          console.log('ℹ️ AuthContext: No hay sesión inicial, usuario no autenticado');
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Error inesperado al verificar autenticación inicial:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    // Ejecutar verificación inicial
    checkInitialAuth();
    
    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        
        if (session?.user) {
          try {
            console.log('🔄 AuthContext: Cambio en estado de autenticación, usuario autenticado:', session.user.id);
            
            // First, set user without profile to allow app to work immediately
            setUser({ ...session.user, profile: undefined });
            setLoading(false);
            
            // Then try to fetch profile with shorter timeout for better UX
            const profilePromise = userService.getProfile(session.user.id, 2); // Reduced retries
            const timeoutPromise = new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Auth profile fetch timeout - continuing without profile')), 5000) // Reduced timeout
            );
            
            try {
              const profile = await Promise.race([profilePromise, timeoutPromise]);
              if (isMounted && profile) {
                setUser({ ...session.user, profile });
                console.log('✅ AuthContext: Profile fetched and user updated');
              }
            } catch (profileError) {
              console.warn('⚠️ AuthContext: Profile fetch failed, continuing without profile:', profileError);
              
              // Test connection in background for debugging
              userService.testConnection().then(connectionOk => {
                if (!connectionOk) {
                  console.error('❌ AuthContext: Database connection test failed');
                } else {
                  console.log('✅ AuthContext: Database connection is OK, profile fetch issue may be temporary');
                }
              });
              
              // Try to fetch profile in background after a delay
              setTimeout(async () => {
                if (!isMounted) return;
                try {
                  console.log('🔄 AuthContext: Attempting background profile fetch...');
                  const profile = await userService.getProfile(session.user.id, 1); // Single retry for background
                  if (isMounted && profile) {
                    setUser(prevUser => prevUser ? { ...prevUser, profile } : null);
                    console.log('✅ AuthContext: Background profile fetch successful');
                  }
                } catch (bgError) {
                  console.warn('⚠️ AuthContext: Background profile fetch failed:', bgError);
                }
              }, 5000);
            }
          } catch (error) {
            console.error('❌ AuthContext: Unexpected error during auth state change:', error);
            if (isMounted) {
              setUser({ ...session.user, profile: undefined });
              setLoading(false);
            }
          }
        } else {
          console.log('ℹ️ AuthContext: Cambio en estado de autenticación, usuario no autenticado');
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);


  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (error) {
      throw error;
    }
    
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const clearSession = async () => {
    console.log('🧹 AuthContext: Limpiando sesión manualmente...');
    try {
      // Limpiar el almacenamiento local
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vendra-auth-token');
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token');
      }
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar el estado del usuario
      setUser(null);
      setLoading(false);
      
      console.log('✅ AuthContext: Sesión limpiada correctamente');
    } catch (error) {
      console.error('❌ AuthContext: Error al limpiar sesión:', error);
    }
  };

  const signup = async (name: string, email: string, pass: string, role: UserRole, phone?: string) => {
    try {
      await userService.signUp(email, pass, { 
        full_name: name, 
        role,
        phone_number: phone 
      });
      return { error: null };
    } catch (error: any) {
      return { error: error as AuthError };
    }
  };
  
  const value = { 
    user, 
    loading, 
    login, 
    logout, 
    signup,
    supabase,
    refreshUser,
    updateUserProfile,
    clearSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
