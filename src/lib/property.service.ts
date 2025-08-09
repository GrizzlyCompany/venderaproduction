'use client';

import { createClient } from '@/lib/supabase/client';
import type { PropertyWithRealtor } from '@/types'; // Asumimos que este tipo existe o lo crearemos

const supabase = createClient();

/**
 * Service class for managing property-related operations.
 */
class PropertyService {

  /**
   * Fetches all properties from the database, including realtor profile information.
   * @returns A promise that resolves to an array of properties.
   */
  async getAllProperties(): Promise<PropertyWithRealtor[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Log the detailed Supabase error for easier debugging
        console.error('Supabase fetch properties error:', error);
        throw new Error('Failed to fetch properties from the database.');
      }

      return data || [];
    } catch (error) {
      // This will catch the error thrown above or any other unexpected errors.
      console.error('Error in getAllProperties service:', error);
      throw error;
    }
  }

  /**
   * Fetches a single property by its ID.
   * @param propertyId The ID of the property to fetch.
   * @returns A promise that resolves to a single property or null if not found.
   */
  async getPropertyById(propertyId: number): Promise<PropertyWithRealtor | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, profiles(*)')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error(`Error fetching property ${propertyId}:`, error);
      return null;
    }
    return data;
  }
}

export const propertyService = new PropertyService();