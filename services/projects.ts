import { apiClient } from './api';

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  collaborators: string[];
  status: 'active' | 'completed' | 'archived';
  tags: string[];
  isPublic: boolean;
  researchAreas: string[];
}

export interface CreateProjectData {
  title: string;
  description: string;
  tags?: string[];
  isPublic?: boolean;
  researchAreas?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: 'active' | 'completed' | 'archived';
  collaborators?: string[];
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  collaborations: number;
}

// Projects API service
export const projectsService = {
  // Get all projects for current user
  getProjects: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects');
  },

  // Get project by ID
  getProject: async (id: string): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  // Create new project
  createProject: async (data: CreateProjectData): Promise<Project> => {
    return apiClient.post<Project>('/projects', data);
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    return apiClient.put<Project>(`/projects/${id}`, data);
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/projects/${id}`);
  },

  // Add collaborator
  addCollaborator: async (projectId: string, userId: string): Promise<Project> => {
    return apiClient.post<Project>(`/projects/${projectId}/collaborators`, { userId });
  },

  // Remove collaborator
  removeCollaborator: async (projectId: string, userId: string): Promise<Project> => {
    return apiClient.delete<Project>(`/projects/${projectId}/collaborators/${userId}`);
  },

  // Get project statistics
  getProjectStats: async (): Promise<ProjectStats> => {
    return apiClient.get<ProjectStats>('/projects/stats');
  },

  // Search public projects
  searchPublicProjects: async (query: string, limit = 20): Promise<Project[]> => {
    return apiClient.get<Project[]>(`/projects/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Get featured projects
  getFeaturedProjects: async (limit = 10): Promise<Project[]> => {
    return apiClient.get<Project[]>(`/projects/featured?limit=${limit}`);
  },
};

export default projectsService;