// @/services/projectService.js

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
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '@/firebaseconfig';
  
  /**
   * Get all projects with optional filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Array>} Array of project objects
   */
  export const getProjects = async (options = {}) => {
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
      let constraints = [];
  
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
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings for easier use in components
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
        lastUpdated: doc.data().lastUpdated?.toDate().toISOString() || null
      }));
  
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
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} Project object
   */
  export const getProjectById = async (projectId) => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
  
      const projectData = projectDoc.data();
      
      // Convert timestamps to ISO strings
      return {
        id: projectDoc.id,
        ...projectData,
        createdAt: projectData.createdAt?.toDate().toISOString() || null,
        lastUpdated: projectData.lastUpdated?.toDate().toISOString() || null
      };
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  };
  
  /**
   * Get projects for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of project objects
   */
  export const getUserProjects = async (userId) => {
    try {
      // Query project_members collection to find projects this user belongs to
      const membershipQuery = query(
        collection(db, 'project_members'),
        where('userId', '==', userId)
      );
      
      const membershipSnapshot = await getDocs(membershipQuery);
      
      // Extract project IDs and roles
      const projectMemberships = membershipSnapshot.docs.map(doc => ({
        projectId: doc.data().projectId,
        role: doc.data().role
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
            
            return {
              id: projectDoc.id,
              ...projectData,
              userRole: role,
              createdAt: projectData.createdAt?.toDate().toISOString() || null,
              lastUpdated: projectData.lastUpdated?.toDate().toISOString() || null
            };
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null values from failed retrievals
      return projects.filter(Boolean);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  };
  
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - ID of the user creating the project
   * @returns {Promise<Object>} Created project object
   */
  export const createProject = async (projectData, userId) => {
    try {
      // Add default fields
      const projectWithMetadata = {
        ...projectData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        members: 1, // Start with 1 member (the creator)
        status: projectData.status || 'active'
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
        ...projectWithMetadata,
        // Since serverTimestamp is transformed after write, use current date for immediate return
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };
  
  /**
   * Update an existing project
   * @param {string} projectId - The project ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project object
   */
  export const updateProject = async (projectId, updates) => {
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
   * @param {string} projectId - The project ID
   * @returns {Promise<void>}
   */
  export const deleteProject = async (projectId) => {
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
      const membershipDeletions = membershipsSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      
      // Delete related research links
      const researchQuery = query(
        collection(db, 'project_research'),
        where('projectId', '==', projectId)
      );
      
      const researchSnapshot = await getDocs(researchQuery);
      
      const researchDeletions = researchSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
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
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID to add
   * @param {string} role - The role to assign ('member', 'admin', etc.)
   * @returns {Promise<Object>} The membership object
   */
  export const addProjectMember = async (projectId, userId, role = 'member') => {
    try {
      // Check if user is already a member
      const existingMemberQuery = query(
        collection(db, 'project_members'),
        where('projectId', '==', projectId),
        where('userId', '==', userId)
      );
      
      const existingMemberSnapshot = await getDocs(existingMemberQuery);
      
      if (!existingMemberSnapshot.empty) {
        throw new Error('User is already a member of this project');
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
   * @param {string} projectId - The project ID
   * @param {string} userId - The user ID to remove
   * @returns {Promise<void>}
   */
  export const removeProjectMember = async (projectId, userId) => {
    try {
      // Find the membership document
      const membershipQuery = query(
        collection(db, 'project_members'),
        where('projectId', '==', projectId),
        where('userId', '==', userId)
      );
      
      const membershipSnapshot = await getDocs(membershipQuery);
      
      if (membershipSnapshot.empty) {
        throw new Error('User is not a member of this project');
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
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of member objects with user details
   */
  export const getProjectMembers = async (projectId) => {
    try {
      const membersQuery = query(
        collection(db, 'project_members'),
        where('projectId', '==', projectId)
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      
      // For each member, get their user details
      // In a real implementation, you might have a users collection to lookup
      const members = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        role: doc.data().role,
        joinedAt: doc.data().joinedAt?.toDate().toISOString() || null,
        // Add user details as needed
      }));
      
      return members;
    } catch (error) {
      console.error(`Error getting members for project ${projectId}:`, error);
      throw error;
    }
  };
  
  /**
   * Get related research papers for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of research paper objects
   */
  export const getProjectResearch = async (projectId) => {
    try {
      const researchQuery = query(
        collection(db, 'project_research'),
        where('projectId', '==', projectId)
      );
      
      const researchSnapshot = await getDocs(researchQuery);
      
      const researchPapers = researchSnapshot.docs.map(doc => ({
        id: doc.id,
        researchId: doc.data().researchId,
        title: doc.data().title,
        addedBy: doc.data().addedBy,
        addedAt: doc.data().addedAt?.toDate().toISOString() || null
      }));
      
      return researchPapers;
    } catch (error) {
      console.error(`Error getting research for project ${projectId}:`, error);
      throw error;
    }
  };