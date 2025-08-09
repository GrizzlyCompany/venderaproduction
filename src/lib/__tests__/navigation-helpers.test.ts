/**
 * Tests para los helpers de navegación
 */

import { 
  getProfileUrl, 
  isProfileRouteActive, 
  shouldRedirectFromProfile,
  getRedirectUrlFromProfile,
  getPostLoginRedirectUrl
} from '../navigation-helpers';
import type { UserProfile } from '@/types';

// Mock user profiles
const developerProfile: UserProfile = {
  id: '123',
  full_name: 'Test Developer',
  username: 'testdev',
  email: 'dev@test.com',
  avatar_url: null,
  bio: null,
  role: 'developer',
  phone_number: null,
  updated_at: null,
  created_at: null,
  subscription_status: null,
  is_profile_complete: true,
  national_id: null,
  birth_date: null,
  nationality: null,
  full_address: null,
  id_front_url: null,
  id_back_url: null,
  is_seller: null,
  preferences: null
};

const buyerProfile: UserProfile = {
  ...developerProfile,
  role: 'buyer'
};

const agentProfile: UserProfile = {
  ...developerProfile,
  role: 'agent'
};

describe('Navigation Helpers', () => {
  describe('getProfileUrl', () => {
    it('should return dashboard URL for developers', () => {
      const result = getProfileUrl('123', developerProfile);
      expect(result).toBe('/developer/dashboard');
    });

    it('should return profile URL for buyers', () => {
      const result = getProfileUrl('123', buyerProfile);
      expect(result).toBe('/profile/123');
    });

    it('should return profile URL for agents', () => {
      const result = getProfileUrl('123', agentProfile);
      expect(result).toBe('/profile/123');
    });

    it('should return profile URL when no profile provided', () => {
      const result = getProfileUrl('123', null);
      expect(result).toBe('/profile/123');
    });
  });

  describe('isProfileRouteActive', () => {
    it('should return true for developer dashboard route', () => {
      const result = isProfileRouteActive('/developer/dashboard', developerProfile);
      expect(result).toBe(true);
    });

    it('should return true for profile route with non-developer', () => {
      const result = isProfileRouteActive('/profile/123', buyerProfile);
      expect(result).toBe(true);
    });

    it('should return false for profile route with developer', () => {
      const result = isProfileRouteActive('/profile/123', developerProfile);
      expect(result).toBe(false);
    });
  });

  describe('shouldRedirectFromProfile', () => {
    it('should return true for developers', () => {
      const result = shouldRedirectFromProfile(developerProfile);
      expect(result).toBe(true);
    });

    it('should return false for non-developers', () => {
      const result = shouldRedirectFromProfile(buyerProfile);
      expect(result).toBe(false);
    });
  });

  describe('getPostLoginRedirectUrl', () => {
    it('should return dashboard URL for developers', () => {
      const result = getPostLoginRedirectUrl(developerProfile, '/');
      expect(result).toBe('/developer/dashboard');
    });

    it('should return default URL for non-developers', () => {
      const result = getPostLoginRedirectUrl(buyerProfile, '/custom');
      expect(result).toBe('/custom');
    });

    it('should work with partial profile objects', () => {
      const result = getPostLoginRedirectUrl({ role: 'developer' }, '/');
      expect(result).toBe('/developer/dashboard');
    });

    it('should work with partial profile objects for non-developers', () => {
      const result = getPostLoginRedirectUrl({ role: 'buyer' }, '/custom');
      expect(result).toBe('/custom');
    });
  });
});