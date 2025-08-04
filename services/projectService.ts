// @/services/projectService.ts

import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebaseconfig';
import type {
  Project,
  ProjectMember,
  ProjectFilters,
  ProjectsResponse,
  ResearchPaper,
  ApiError
} from '@/types';

// Internal types for project service
interface CreateProjectData {
  title: string;
  description: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
  status?: 'active' | 'planning' | 'completed' | 'archived';
  relatedResearch?: ResearchPaper[];
}

interface UpdateProjectData {
  title?: string;
  description?: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
}

interface ProjectWithUserRole extends Project {
  userRole: 'admin' | 'member' | 'viewer';
}

interface ProjectMembership {
  projectId: string;
  role: 'admin' | 'member' | 'viewer';
}

interface ProjectResearchLink {
  id: string;
  researchId: string;
  title: string;
  addedBy: string;
  addedAt: string | null;
}

/**
 * Get all projects with optional filtering and pagination
 * @param options - Filter and pagination options
 * @returns Promise resolving to projects response with pagination
 */
export const getProjects = async (options: ProjectFilters = {}): Promise<ProjectsResponse> => {
  try {
    const { 
      category,
      featured,
      sortBy = 'recent',
      searchTerm = '',
      lastVisible = null,
      pageSize = 12
    } = options;

    let projectsRef = collection(db, 'projects');
    let constraints: any[] = [];

    // Add filters
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }

    if (featured) {
      constraints.push(where('featured', '==', true));
    }

    // Add sorting
    if (sortBy === 'recent') {
      constraints.push(orderBy('lastUpdated', 'desc'));
    } else if (sortBy === 'popular') {
      constraints.push(orderBy('members', 'desc'));
    }

    // Add pagination
    constraints.push(limit(pageSize));
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    // Create and execute query
    const projectsQuery = query(projectsRef, ...constraints);
    const snapshot = await getDocs(projectsQuery);

    // Convert snapshot to array of projects
    const projects: Project[] = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category,
        featured: data.featured || false,
        tags: data.tags || [],
        createdBy: data.createdBy || '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || '',
        lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toISOString() : data.lastUpdated || '',
        members: data.members || 0,
        status: data.status || 'active',
        relatedResearch: data.relatedResearch || []
      };
    });

    // If there's a search term, filter results client-side
    // Note: For production with large datasets, consider using Algolia or similar search service
    const filteredProjects = searchTerm 
      ? projects.filter(project => 
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.tags && project.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        )
      : projects;

    // Get the last visible document for pagination
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      projects: filteredProjects,
      lastVisible: lastVisibleDoc,
      hasMore: projects.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

/**
 * Get a specific project by ID
 * @param projectId - The project ID
 * @returns Promise resolving to project object
 */
export const getProjectById = async (projectId: string): Promise<Project> => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    
    if (!projectDoc.exists()) {
      const error: ApiError = { message: 'Project not found' };
      throw error;
    }

    const projectData = projectDoc.data();
    
    // Convert timestamps to ISO strings
    return {
      id: projectDoc.id,
      title: projectData.title || '',
      description: projectData.description || '',
      category: projectData.category,
      featured: projectData.featured || false,
      tags: projectData.tags || [],
      createdBy: projectData.createdBy || '',
      createdAt: projectData.createdAt instanceof Timestamp ? projectData.createdAt.toDate().toISOString() : projectData.createdAt || '',
      lastUpdated: projectData.lastUpdated instanceof Timestamp ? projectData.lastUpdated.toDate().toISOString() : projectData.lastUpdated || '',
      members: projectData.members || 0,
      status: projectData.status || 'active',
      relatedResearch: projectData.relatedResearch || []
    };
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get projects for a specific user
 * @param userId - The user ID
 * @returns Promise resolving to array of project objects with user roles
 */
export const getUserProjects = async (userId: string): Promise<ProjectWithUserRole[]> => {
  try {
    // Query project_members collection to find projects this user belongs to
    const membershipQuery = query(
      collection(db, 'project_members'),
      where('userId', '==', userId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    
    // Extract project IDs and roles
    const projectMemberships: ProjectMembership[] = membershipSnapshot.docs.map(docSnapshot => ({
      projectId: docSnapshot.data().projectId,
      role: docSnapshot.data().role
    }));
    
    if (projectMemberships.length === 0) {
      return [];
    }
    
    // Fetch each project's details
    const projects = await Promise.all(
      projectMemberships.map(async ({ projectId, role }) => {
        try {
          const projectDoc = await getDoc(doc(db, 'projects', projectId));
          
          if (!projectDoc.exists()) {
            return null;
          }
          
          const projectData = projectDoc.data();
          
          const project: ProjectWithUserRole = {
            id: projectDoc.id,
            title: projectData.title || '',
            description: projectData.description || '',
            category: projectData.category,
            featured: projectData.featured || false,
            tags: projectData.tags || [],
            createdBy: projectData.createdBy || '',
            createdAt: projectData.createdAt instanceof Timestamp ? projectData.createdAt.toDate().toISOString() : projectData.createdAt || '',
            lastUpdated: projectData.lastUpdated instanceof Timestamp ? projectData.lastUpdated.toDate().toISOString() : projectData.lastUpdated || '',
            members: projectData.members || 0,
            status: projectData.status || 'active',
            relatedResearch: projectData.relatedResearch || [],
            userRole: role
          };
          
          return project;
        } catch (error) {
          console.error(`Error fetching project ${projectId}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any null values from failed retrievals
    return projects.filter((project): project is ProjectWithUserRole => project !== null);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
};

/**
 * Create a new project
 * @param projectData - Project data
 * @param userId - ID of the user creating the project
 * @returns Promise resolving to created project object
 */
export const createProject = async (
  projectData: CreateProjectData, 
  userId: string
): Promise<Project> => {
  try {
    // Add default fields
    const projectWithMetadata = {
      ...projectData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      members: 1, // Start with 1 member (the creator)
      status: projectData.status || 'active' as const
    };
    
    // Add project to Firestore
    const projectRef = await addDoc(collection(db, 'projects'), projectWithMetadata);
    
    // Add creator as project member with 'admin' role
    await addDoc(collection(db, 'project_members'), {
      projectId: projectRef.id,
      userId,
      role: 'admin',
      joinedAt: serverTimestamp()
    });

    // If there are related research papers, add them to the project_research collection
    if (projectData.relatedResearch && projectData.relatedResearch.length > 0) {
      await Promise.all(
        projectData.relatedResearch.map(paper => 
          addDoc(collection(db, 'project_research'), {
            projectId: projectRef.id,
            researchId: paper.id,
            title: paper.title,
            addedBy: userId,
            addedAt: serverTimestamp()
          })
        )
      );
    }
    
    // Return the created project with its ID
    return {
      id: projectRef.id,
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      featured: projectData.featured || false,
      tags: projectData.tags || [],
      createdBy: userId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      members: 1,
      status: projectData.status || 'active',
      relatedResearch: projectData.relatedResearch || []
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Update an existing project
 * @param projectId - The project ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated project object
 */
export const updateProject = async (
  projectId: string, 
  updates: UpdateProjectData
): Promise<Project> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    
    // Add last updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      lastUpdated: serverTimestamp()
    };
    
    await updateDoc(projectRef, updatesWithTimestamp);
    
    // Get the updated project
    const updatedProject = await getProjectById(projectId);
    
    return updatedProject;
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Delete a project
 * @param projectId - The project ID
 * @returns Promise that resolves when the project is deleted
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    // Delete the project document
    await deleteDoc(doc(db, 'projects', projectId));
    
    // Delete project memberships
    const membershipsQuery = query(
      collection(db, 'project_members'),
      where('projectId', '==', projectId)
    );
    
    const membershipsSnapshot = await getDocs(membershipsQuery);
    
    // Delete each membership document
    const membershipDeletions = membershipsSnapshot.docs.map(docSnapshot =>
      deleteDoc(docSnapshot.ref)
    );
    
    // Delete related research links
    const researchQuery = query(
      collection(db, 'project_research'),
      where('projectId', '==', projectId)
    );
    
    const researchSnapshot = await getDocs(researchQuery);
    
    const researchDeletions = researchSnapshot.docs.map(docSnapshot =>
      deleteDoc(docSnapshot.ref)
    );
    
    // Wait for all deletions to complete
    await Promise.all([...membershipDeletions, ...researchDeletions]);
    
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Add a member to a project
 * @param projectId - The project ID
 * @param userId - The user ID to add
 * @param role - The role to assign
 * @returns Promise resolving to the membership object
 */
export const addProjectMember = async (
  projectId: string, 
  userId: string, 
  role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<ProjectMember> => {
  try {
    // Check if user is already a member
    const existingMemberQuery = query(
      collection(db, 'project_members'),
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );
    
    const existingMemberSnapshot = await getDocs(existingMemberQuery);
    
    if (!existingMemberSnapshot.empty) {
      const error: ApiError = { message: 'User is already a member of this project' };
      throw error;
    }
    
    // Add member to project_members collection
    const membershipRef = await addDoc(collection(db, 'project_members'), {
      projectId,
      userId,
      role,
      joinedAt: serverTimestamp()
    });
    
    // Update the members count in the project
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const currentMembers = projectDoc.data().members || 0;
      await updateDoc(projectRef, {
        members: currentMembers + 1,
        lastUpdated: serverTimestamp()
      });
    }
    
    return {
      id: membershipRef.id,
      projectId,
      userId,
      role,
      joinedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error adding member to project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Remove a member from a project
 * @param projectId - The project ID
 * @param userId - The user ID to remove
 * @returns Promise that resolves when the member is removed
 */
export const removeProjectMember = async (
  projectId: string, 
  userId: string
): Promise<void> => {
  try {
    // Find the membership document
    const membershipQuery = query(
      collection(db, 'project_members'),
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    
    if (membershipSnapshot.empty) {
      const error: ApiError = { message: 'User is not a member of this project' };
      throw error;
    }
    
    // Delete the membership document
    await deleteDoc(membershipSnapshot.docs[0].ref);
    
    // Update the members count in the project
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const currentMembers = projectDoc.data().members || 0;
      await updateDoc(projectRef, {
        members: Math.max(0, currentMembers - 1),
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error(`Error removing member from project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get members of a project
 * @param projectId - The project ID
 * @returns Promise resolving to array of member objects with user details
 */
export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  try {
    const membersQuery = query(
      collection(db, 'project_members'),
      where('projectId', '==', projectId)
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    
    // For each member, get their user details
    // In a real implementation, you might have a users collection to lookup
    const members: ProjectMember[] = membersSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        projectId: data.projectId,
        userId: data.userId,
        role: data.role,
        joinedAt: data.joinedAt instanceof Timestamp ? data.joinedAt.toDate().toISOString() : data.joinedAt || ''
      };
    });
    
    return members;
  } catch (error) {
    console.error(`Error getting members for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get related research papers for a project
 * @param projectId - The project ID
 * @returns Promise resolving to array of research paper objects
 */
export const getProjectResearch = async (projectId: string): Promise<ProjectResearchLink[]> => {
  try {
    const researchQuery = query(
      collection(db, 'project_research'),
      where('projectId', '==', projectId)
    );
    
    const researchSnapshot = await getDocs(researchQuery);
    
    const researchPapers: ProjectResearchLink[] = researchSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        researchId: data.researchId,
        title: data.title,
        addedBy: data.addedBy,
        addedAt: data.addedAt instanceof Timestamp ? data.addedAt.toDate().toISOString() : data.addedAt || null
      };
    });
    
    return researchPapers;
  } catch (error) {
    console.error(`Error getting research for project ${projectId}:`, error);
    throw error;
  }
};
