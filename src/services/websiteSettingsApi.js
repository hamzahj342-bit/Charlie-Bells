// Website Settings API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const websiteSettingsApi = {
  // Get all website settings
  getWebsiteSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-settings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching website settings:', error);
      throw error;
    }
  },

  // Get specific setting by key
  getSettingByKey: async (key) => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-settings/${key}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  // Update website setting
  updateWebsiteSetting: async (id, value, imageFile = null) => {
    try {
      const formData = new FormData();
      formData.append('value', value);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/website-settings/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating website setting:', error);
      throw error;
    }
  },

  // Initialize default settings
  initializeSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-settings/initialize`, {
        method: 'POST',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initializing settings:', error);
      throw error;
    }
  }
};

export default websiteSettingsApi;
