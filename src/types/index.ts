// User role types
export type UserRole = 'buyer' | 'agent' | 'developer';

// Base type for a user profile, matching the database table
export interface UserProfile {
  id: string; // This is the primary key that references auth.users(id)
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole; // User role
  phone_number: string | null;
  updated_at: string | null;
  created_at: string | null;
  subscription_status: 'active' | 'inactive' | null;
  is_profile_complete: boolean | null;
  // Seller/Agent onboarding fields
  national_id: string | null;
  birth_date: string | null;
  nationality: string | null;
  full_address: string | null;
  id_front_url: string | null;
  id_back_url: string | null;
  is_seller: boolean | null;
  // Buyer preferences
  preferences: {
    property_types?: string[];
    price_range?: {
      min: number;
      max: number;
      currency: string;
    };
    locations?: string[];
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  } | null;
}

// Public profile type (subset of UserProfile for public viewing)
export interface PublicUserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone_number: string | null;
  full_address: string | null;
  is_verified: boolean | null;
  subscription_status: 'active' | 'inactive' | null;
  created_at: string | null;
  updated_at: string | null;
}

// User type for authentication context
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Base type for a property, matching the database table
export interface Property {
  id: string; // UUID
  realtor_id: string; // UUID
  title: string;
  description: string | null;
  price: number;
  currency?: 'USD' | 'DOP';
  location: string | null;
  address: string | null;
  type: 'house' | 'apartment' | 'condo' | 'villa' | 'lot' | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  features: string[] | null;
  images: string[] | null;
  is_active?: boolean;
  created_at: string | null;
  // Optional realtor information (populated when joined)
  realtor?: Pick<UserProfile, 'id' | 'full_name' | 'avatar_url' | 'username'> | null;
}

// Combined type for a property including the realtor's profile info
export interface PropertyWithRealtor extends Property {
  profiles: Pick<UserProfile, 'full_name' | 'avatar_url'> | null;
}

// Rating type matching the database table
export interface Rating {
  id: number;
  created_at: string;
  rated_user_id: string;
  rater_user_id: string;
  rating: number;
  comment: string | null;
}

// Message type matching the database table
export interface Message {
  id: number; // BIGINT
  created_at: string;
  conversation_id: string; // UUID
  sender_id: string; // UUID
  content: string;
}

// Base conversation type from database
export interface ConversationFromDB {
  id: string; // UUID
  created_at: string;
  buyer_id: string; // UUID
  seller_id: string; // UUID
  last_message_sender_id: string | null; // UUID
  last_message_read: boolean;
  buyer?: UserProfile;
  seller?: UserProfile;
}

// Extended conversation type for UI
export interface Conversation extends ConversationFromDB {
  otherUser: UserProfile;
  lastMessage: string;
  lastMessageAt: string; // Timestamp of the last message, used for sorting
}

// Developer/Company profile type
export interface DeveloperProfile {
  id: string; // UUID
  user_id: string; // References auth.users(id)
  company_name: string;
  commercial_name: string | null;
  rnc_id: string | null; // RNC / Tax ID
  contact_email: string;
  contact_phone: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Development project type
export interface DevelopmentProject {
  id: string; // UUID
  developer_id: string; // References developer_profiles(id)
  name: string;
  description: string | null;
  status: 'planning' | 'construction' | 'presale' | 'completed';
  project_type: 'apartments' | 'houses' | 'commercial' | 'mixed' | 'lots';
  location: string;
  address: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  estimated_delivery: string | null; // Date
  price_range_min: number | null;
  price_range_max: number | null;
  currency: 'USD' | 'DOP';
  total_units: number | null;
  available_units: number | null;
  amenities: string[] | null;
  features: string[] | null;
  images: string[] | null;
  floor_plans: string[] | null; // URLs to floor plan PDFs/images
  brochure_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  view_count: number; // Number of times the project has been viewed
  created_at: string;
  updated_at: string;
  // Optional developer information (populated when joined)
  developer?: DeveloperProfile | null;
}

// Project interest/lead type
export interface ProjectInterest {
  id: string; // UUID
  project_id: string; // References development_projects(id)
  user_id: string; // References auth.users(id)
  interest_type: 'info_request' | 'visit_request' | 'callback_request';
  message: string | null;
  contact_preference: 'email' | 'phone' | 'whatsapp';
  status: 'pending' | 'contacted' | 'closed';
  // Client information (populated from user profile or form)
  client_name: string;
  client_email: string;
  client_phone: string | null;
  created_at: string;
  updated_at: string;
}