// src/services/api.js
// API service for course recommendations and knowledge graph data

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://capstone-backend-env.eba-enkzsfa3.us-east-1.elasticbeanstalk.com/api';

export const courseAPI = {
  /**
   * Get course recommendations for multiple skills
   * @param {Array<string>} skills - Array of skill names
   * @returns {Promise} Course recommendations with learning paths
   */
  getRecommendations: async (skills) => {
    try {
      console.log('Fetching course recommendations for skills:', skills);
      
      const response = await axios.post(`${API_BASE_URL}/courses/recommendations`, {
        skills
      });
      
      console.log('Course recommendations received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      throw error;
    }
  },

  /**
   * Get knowledge graph data for skills
   * @param {Array<string>} skills - Array of skill names
   * @returns {Promise} Knowledge graph nodes and edges
   */
  getKnowledgeGraphData: async (skills) => {
    try {
      console.log('Fetching knowledge graph data for skills:', skills);
      
      const response = await axios.post(`${API_BASE_URL}/courses/knowledge-graph`, {
        skills
      });
      
      console.log('Knowledge graph data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      throw error;
    }
  },

  /**
   * Get courses for a specific skill
   * @param {string} skillName - Name of the skill
   * @returns {Promise} Courses for the specified skill
   */
  getSkillCourses: async (skillName) => {
    try {
      console.log(`Fetching courses for skill: ${skillName}`);
      
      const response = await axios.get(`${API_BASE_URL}/courses/skill/${skillName}`);
      
      console.log(`Courses for ${skillName} received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching courses for ${skillName}:`, error);
      throw error;
    }
  },

  /**
   * Get all available courses
   * @returns {Promise} All courses in the database
   */
  getAllCourses: async () => {
    try {
      console.log('Fetching all courses');
      
      const response = await axios.get(`${API_BASE_URL}/courses`);
      
      console.log('All courses received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      throw error;
    }
  }
};

// Export individual functions for convenience
export const {
  getRecommendations,
  getKnowledgeGraphData,
  getSkillCourses,
  getAllCourses
} = courseAPI;

export default courseAPI;
