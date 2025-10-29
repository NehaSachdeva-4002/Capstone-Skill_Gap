import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Get all available courses
export const getAllCourses = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/courses`);
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
};

// Get courses by skill
export const getCoursesBySkill = async (skill) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/courses/skill/${skill}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching courses for skill ${skill}:`, error);
        throw new Error(error.response?.data?.message || 'Failed to fetch courses for skill');
    }
};

// Get recommended courses based on missing skills
export const getRecommendedCourses = async (missingSkills) => {
    try {
        const allCourses = await getAllCourses();
        const recommendedCourses = allCourses.filter(course => 
            course.skillsCovered.some(skill => missingSkills.includes(skill))
        );
        return recommendedCourses;
    } catch (error) {
        console.error('Error getting recommended courses:', error);
        throw new Error('Failed to get course recommendations');
    }
};
