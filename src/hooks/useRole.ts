'use client';

import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

export function useRole() {
  const { user } = useAuth();
  
  const userRole = user?.profile?.role || 'buyer';
  
  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(userRole);
  };
  
  const isDeveloper = (): boolean => {
    return userRole === 'developer';
  };
  
  const isAgent = (): boolean => {
    return userRole === 'agent';
  };
  
  const isBuyer = (): boolean => {
    return userRole === 'buyer';
  };
  
  const canAccessDeveloperFeatures = (): boolean => {
    return userRole === 'developer';
  };
  
  const canAccessAgentFeatures = (): boolean => {
    return userRole === 'agent';
  };
  
  const canListProperties = (): boolean => {
    return userRole === 'agent' || userRole === 'developer';
  };
  
  const canCreateProjects = (): boolean => {
    return userRole === 'developer';
  };
  
  return {
    userRole,
    hasRole,
    hasAnyRole,
    isDeveloper,
    isAgent,
    isBuyer,
    canAccessDeveloperFeatures,
    canAccessAgentFeatures,
    canListProperties,
    canCreateProjects,
  };
}