import { DeveloperProfile, DevelopmentProject, ProjectInterest } from '@/types/index';
import { createClient } from '@/lib/supabase/client';

class DeveloperService {
  // Create developer profile
  async createDeveloperProfile(userId: string, profileData: Omit<DeveloperProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DeveloperProfile> {
    try {
      const { data, error } = await this.supabase
        .from('developer_profiles')
        .insert({
          user_id: userId,
          ...profileData,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating developer profile:', error);
      throw error;
    }
  }
  // Lazy initialization of Supabase client
  private get supabase() {
    return createClient();
  }

  // Update developer profile by user_id
  async updateDeveloperProfileByUserId(userId: string, updates: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    try {
      const { data, error } = await this.supabase
        .from('developer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating developer profile by user_id:', error);
      throw error;
    }
  }

  // Upload generic file (for documents, floor plans, brochures)
  async getDeveloperProfile(userId: string): Promise<DeveloperProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('developer_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching developer profile:', error);
      throw error;
    }
  }

  // Update developer profile
  async updateDeveloperProfile(developerId: string, updates: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    try {
      const { data, error } = await this.supabase
        .from('developer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', developerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating developer profile:', error);
      throw error;
    }
  }

  // Create development project
  async createProject(developerId: string, projectData: Omit<DevelopmentProject, 'id' | 'developer_id' | 'created_at' | 'updated_at'>): Promise<DevelopmentProject> {
    try {
      const { data, error } = await this.supabase
        .from('development_projects')
        .insert({
          developer_id: developerId,
          ...projectData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Get projects by developer
  async getProjectsByDeveloper(developerId: string): Promise<DevelopmentProject[]> {
    try {
      const { data, error } = await this.supabase
        .from('development_projects')
        .select('*')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching developer projects:', error);
      throw error;
    }
  }

  // Get all active projects
  async getAllActiveProjects(): Promise<DevelopmentProject[]> {
    try {
      console.log('🔍 Querying all projects from database...');
      
      // First, let's check ALL projects without filters
      const { data: allProjects, error: allError } = await this.supabase
        .from('development_projects')
        .select(`
          *,
          developer:developer_profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      console.log('📊 ALL projects in database:', allProjects);
      console.log('📊 Total projects count:', allProjects?.length || 0);
      
      // Now get only active projects
      const { data, error } = await this.supabase
        .from('development_projects')
        .select(`
          *,
          developer:developer_profiles(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('📊 Active projects query result:', { data, error });
      console.log('📊 Active projects count:', data?.length || 0);
      
      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }
      
      // If no active projects, return all projects for debugging
      if (!data || data.length === 0) {
        console.log('⚠️ No active projects found, returning all projects for debugging');
        return allProjects || [];
      }
      
      console.log('✅ Active projects found:', data.length);
      return data || [];
    } catch (error) {
      console.error('Error fetching active projects:', error);
      throw error;
    }
  }

  // Get project by ID
  async getProject(projectId: string): Promise<DevelopmentProject | null> {
    try {
      console.log('🔍 Fetching project by ID:', projectId);
      
      const { data, error } = await this.supabase
        .from('development_projects')
        .select(`
          *,
          developer:developer_profiles(*)
        `)
        .eq('id', projectId)
        .maybeSingle();

      console.log('📊 Project query result:', { data, error });

      if (error) {
        console.error('❌ Database error fetching project:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Project found:', data.name);
      } else {
        console.log('⚠️ Project not found with ID:', projectId);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId: string, updates: Partial<DevelopmentProject>): Promise<DevelopmentProject> {
    try {
      const { data, error } = await this.supabase
        .from('development_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting project:', projectId);
      
      // First, get project data to clean up files
      const project = await this.getProject(projectId);
      
      if (project) {
        // Delete associated files from storage
        try {
          // Delete project images
          if (project.images && project.images.length > 0) {
            console.log('🗑️ Cleaning up project images...');
            // Note: File cleanup would require extracting file paths from URLs
            // For now, we'll just delete the database record
          }
          
          // Delete floor plans and brochure
          if (project.floor_plans && project.floor_plans.length > 0) {
            console.log('🗑️ Cleaning up floor plans...');
          }
          
          if (project.brochure_url) {
            console.log('🗑️ Cleaning up brochure...');
          }
        } catch (cleanupError) {
          console.warn('⚠️ File cleanup failed:', cleanupError);
          // Continue with database deletion even if file cleanup fails
        }
      }

      // Delete project from database
      const { error } = await this.supabase
        .from('development_projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('❌ Database deletion error:', error);
        throw error;
      }
      
      console.log('✅ Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Create project interest
  async createProjectInterest(interestData: Omit<ProjectInterest, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectInterest> {
    try {
      const { data, error } = await this.supabase
        .from('project_interests')
        .insert(interestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project interest:', error);
      throw error;
    }
  }

  // Get interests for a project
  async getProjectInterests(projectId: string): Promise<ProjectInterest[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_interests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project interests:', error);
      throw error;
    }
  }

  // Get interests by developer (all projects)
  async getInterestsByDeveloper(developerId: string): Promise<ProjectInterest[]> {
    try {
      // First get all project IDs for this developer
      const { data: projects, error: projectsError } = await this.supabase
        .from('development_projects')
        .select('id')
        .eq('developer_id', developerId);

      if (projectsError) throw projectsError;
      
      if (!projects || projects.length === 0) {
        return [];
      }

      const projectIds = projects.map((p: { id: string }) => p.id);

      // Then get interests for those projects
      const { data, error } = await this.supabase
        .from('project_interests')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching developer interests:', error);
      throw error;
    }
  }

  // Update interest status
  async updateInterestStatus(interestId: string, status: ProjectInterest['status']): Promise<ProjectInterest> {
    try {
      const { data, error } = await this.supabase
        .from('project_interests')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating interest status:', error);
      throw error;
    }
  }

  // Upload project images
  async uploadProjectImage(projectId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', projectId);
    formData.append('bucket', 'project_images');
    const res = await fetch('/api/upload-developer-file-edge', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Error uploading project image');
    }
    return result.publicUrl;
  }

  // Upload developer logo
  async uploadDeveloperLogo(developerId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', developerId);
    formData.append('bucket', 'developer_logos');
    const res = await fetch('/api/upload-developer-file-edge', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Error uploading developer logo');
    }
    return result.publicUrl;
  }

  // Upload generic file (for documents, floor plans, brochures)
  async uploadFile(file: File, bucket: string = 'documents'): Promise<string> {
    // Decide bucket según tipo de archivo
    let targetBucket: string;
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    if (isPDF) {
      targetBucket = 'documents';
    } else if (isImage) {
      targetBucket = bucket === 'documents' ? 'documents' : 'project_images';
    } else {
      throw new Error(`Unsupported file type: ${file.type}. Only PDF and image files are supported.`);
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', 'documents');
    formData.append('bucket', targetBucket);
    const res = await fetch('/api/upload-developer-file-edge', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Error uploading file');
    }
    return result.publicUrl;
  }
}

export const developerService = new DeveloperService();