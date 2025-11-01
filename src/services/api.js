// Base URL untuk WordPress REST API
// Ganti dengan URL WordPress Anda
const API_BASE_URL = "https://apinulis.sdit.web.id/wp-json/writing-app/v1";
// const API_BASE_URL = 'http://writing-app.local/wp-json/writing-app/v1';

/**
 * Service untuk handle semua API calls ke WordPress backend
 */
class WritingApiService {
  /**
   * Get semua writings dengan pagination dan search
   */
  async getWritings(page = 1, search = "") {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${API_BASE_URL}/posts?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch writings");
      }

      return data;
    } catch (error) {
      console.error("Error fetching writings:", error);
      throw error;
    }
  }

  /**
   * Get single writing by ID
   */
  async getWriting(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Writing not found");
      }

      return data;
    } catch (error) {
      console.error("Error fetching writing:", error);
      throw error;
    }
  }

  /**
   * Create new writing
   */
  async createWriting(writingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(writingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create writing");
      }

      return data;
    } catch (error) {
      console.error("Error creating writing:", error);
      throw error;
    }
  }

  /**
   * Update writing
   */
  async updateWriting(id, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update writing");
      }

      return data;
    } catch (error) {
      console.error("Error updating writing:", error);
      throw error;
    }
  }

  /**
   * Auto-save writing content (lightweight update)
   */
  async autoSaveWriting(id, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-save/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to auto-save writing");
      }

      return data;
    } catch (error) {
      console.error("Error auto-saving writing:", error);
      throw error;
    }
  }

  /**
   * Delete writing
   */
  async deleteWriting(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete writing");
      }

      return data;
    } catch (error) {
      console.error("Error deleting writing:", error);
      throw error;
    }
  }

  /**
   * Search writings by title
   */
  async searchWritings(keyword, page = 1) {
    return this.getWritings(page, keyword);
  }

  /**
   * Get writings by status (draft/published)
   */
  async getWritingsByStatus(status, page = 1) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: status,
      });

      const response = await fetch(`${API_BASE_URL}/posts?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch writings by status");
      }

      return data;
    } catch (error) {
      console.error("Error fetching writings by status:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default new WritingApiService();
