import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      if (!window.location.pathname.includes("/autho/login")) {
        window.location.href = "/autho/login";
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login/`, loginData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // error.response means the server actually responded (e.g. wrong
    // password) — safe to show that message. No error.response means the
    // request never reached the server (offline, timeout, CORS, server
    // down) — that is NOT the same as wrong credentials and must not be
    // reported as one.
    const message = error.response
      ? error.response.data?.error || error.response.data?.detail || "Invalid email or password."
      : "Couldn't reach the server. Check your connection and try again.";
    return {
      success: false,
      message,
    };
  }
};



export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/update-user/${id}/`, userData,);
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};


export const logoutUser = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) {
    console.error("Refresh token not found");
    return { success: false, message: "Refresh token missing" };
  }

  try {
    const response = await api.post("/logout/", { refresh: refresh });
    localStorage.removeItem("refresh");
    localStorage.removeItem("access_token");

    return { success: true, message: "Logout successful!" };
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    return { success: false, message: "Logout failed" };
  }
};


export const sendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-otp/`, { email });
    return { success: true, message: "OTP sent successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || "Error sending OTP.",
    };
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/userDetails/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching user details.",
    };
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-otp/`, {
      email,
      otp,
    });
    return {
      success: true,
      message: "OTP verified successfully!",
      data: response.data,
    };
  } catch (error) {
    const message = error.response
      ? error.response.data?.error || "Invalid or expired verification code."
      : "Couldn't reach the server. Check your connection and try again.";
    return {
      success: false,
      message,
      data: null,
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register/", userData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "User registered successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        "An error occurred while registering the user.",
    };
  }
};

export const fetchRole = async () => {
  try {
    const response = await api.get("/roles/");
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Roles.",
    };
  }
};

export const CreateRole = async (roleData) => {
  try {
    const response = await api.post("/roles/", roleData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Role Created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        "An error occurred while registering the Role.",
    };
  }
};

export const updaterole = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}/`, roleData);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Role updated successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        "An error occurred while updating the users.",
    };
  }
};

export const fetchUsers = async () => {
  try {
    const response = await api.get("/users/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Users.",
    };
  }
};





export const fetchAds = async () => {
  try {
    const response = await api.get("/ads/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Ads.",
    };
  }
};

export const fetchAdById = async (id) => {
  try {
    const response = await api.get(`/ads/${id}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching ad.",
    };
  }
};

export const createAds = async (AdsData) => {
  try {
    const response = await api.post("/ads/", AdsData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Ads created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    const data = error.response?.data;
    const fieldError = data && typeof data === 'object'
      ? Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`).join(' ')
      : null;
    return {
      success: false,
      message: data?.detail || fieldError || "Error creating Ads.",
    };
  }
};
export const CreateCategortblogs = async (categoryData) => {
  try {
    const response = await api.post("/categories/", categoryData);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Category created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error creating Blogs.",
    };
  }
};

export const createblogs = async (blogsData) => {
  try {
    const response = await api.post("/posts/", blogsData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Blogs created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error creating Blogs.",
    };
  }
};

export const fetchblogs = async () => {
  try {
    const response = await api.get("/posts/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Blogs.",
    };
  }
};

export const fetchblogById = async (pk) => {
  try {
    const response = await api.get(`/posts/${pk}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching blog post.",
    };
  }
};


export const fetchCategory = async () => {
  try {
    const response = await api.get("/categories/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Blogs.",
    };
  }
};

export const updatecategory = async (id, categoriesdata) => {
  try {
    const response = await api.put(`/categories/${id}/`, categoriesdata);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Category updated successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        "An error occurred while updating the Category.",
    };
  }
};

export const fetchAnnouncements = async () => {
  try {
    const response = await api.get("/announcements/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Announcements.",
    };
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    const response = await api.post("/announcements/", announcementData);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Announcement created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error creating announcement.",
    };
  }
};

export const UpdateAnnouncement = async (id, announcementData) => {
  try {
    const response = await api.put(`/announcements/${id}/`, announcementData);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Announcement updated successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        "An error occurred while updating the Announcement.",
    };
  }
};

export const fetchGalleryItems = async () => {
  try {
    const response = await api.get("/gallery/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail || "Error fetching gallery-categories.",
    };
  }
};

export const createGalleryItem = async (galleryData) => {
  try {
    const response = await api.post("/gallery/", galleryData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Gallery item created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error creating gallery item.",
    };
  }
};

export const createGalleryCategory = async (galleryCategoryData) => {
  try {
    const response = await api.post(
      "/gallery-categories/",
      galleryCategoryData
    );

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: "gallery-categories created successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail || "Error creating gallery-categories.",
    };
  }
};

export const updateGalleryCategory = async (id, galleryCategoryData) => {
  try {
    const response = await api.put(
      `/gallery-categories/${id}/`,
      galleryCategoryData
    );

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: "Gallery-categories updated successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail ||
        "An error occurred while updating the Gallery-categories.",
    };
  }
};

export const fetchGalleryCategories = async () => {
  try {
    const response = await api.get("/gallery-categories/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.detail || "Error fetching gallery-categories.",
    };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post("/events/", eventData);
    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Event created successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error creating event.",
    };
  }
};

export const fetchEvents = async () => {
  try {
    const response = await api.get("/events/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Events.",
    };
  }
};

export const updateEvent = async (id, eventdata) => {
  try {
    const response = await api.put(`/events/${id}/`, eventdata);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Events updated successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "An error occurred while updating the Events.",
    };
  }
};

export const Eventbyid = async (id) => {
  try {
    const response = await api.get(`/events_detail/${id}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "An error occurred while displaying the Events.",
    };
  }
};

export const fetchContacts = async () => {
  try {
    const response = await api.get("/admin-contacts/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Contacts.",
    };
  }
};

export const fetchDonations = async () => {
  try {
    const response = await api.get("/admin-donations/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching Donation .",
    };
  }
};
export const updateContactStatus = async (id, contactdata) => {
  try {
    const response = await api.patch(`/admin-contacts/${id}/update/`, contactdata);

    if (response.status >= 200 && response.status < 300) {
      return { success: true, message: "Contact updated successfully!" };
    } else {
      return {
        success: false,
        message: response.data.detail || "Something went wrong!",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "An error occurred while updating the Events.",
    };
  }
};

export const updateDonationStatus = async (id, statusData) => {
  try {
    const response = await api.patch(`/admin-donations/${id}/status/`, statusData);
    return response;
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw error;
  }
};

// ---------------------------------------------------------------------
// Delete / additional update helpers
// ---------------------------------------------------------------------

export const deleteUser = async (id) => {
  try {
    await api.delete(`/users/${id}/delete/`);
    return { success: true, message: "User removed successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error removing user.",
    };
  }
};

export const deleteRole = async (id) => {
  try {
    await api.delete(`/roles/${id}/`);
    return { success: true, message: "Role removed successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error removing role.",
    };
  }
};

export const updateAds = async (id, adsData) => {
  try {
    const response = await api.put(`/ads/${id}/`, adsData);
    return { success: true, message: "Ad updated successfully!", data: response.data };
  } catch (error) {
    const data = error.response?.data;
    const fieldError = data && typeof data === 'object'
      ? Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`).join(' ')
      : null;
    return {
      success: false,
      message: data?.detail || fieldError || "Error updating ad.",
    };
  }
};

export const deleteAds = async (id) => {
  try {
    await api.delete(`/ads/${id}/`);
    return { success: true, message: "Ad deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting ad.",
    };
  }
};

export const updateblog = async (id, blogsData) => {
  try {
    const response = await api.put(`/posts/${id}/`, blogsData);
    return { success: true, message: "Blog updated successfully!", data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error updating blog.",
    };
  }
};

export const deleteblog = async (id) => {
  try {
    await api.delete(`/posts/${id}/`);
    return { success: true, message: "Blog deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting blog.",
    };
  }
};

export const deleteBlogCategory = async (id) => {
  try {
    await api.delete(`/categories/${id}/`);
    return { success: true, message: "Category deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting category.",
    };
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    await api.delete(`/announcements/${id}/`);
    return { success: true, message: "Announcement deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting announcement.",
    };
  }
};

export const deleteEvent = async (id) => {
  try {
    await api.delete(`/events/${id}/`);
    return { success: true, message: "Event deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting event.",
    };
  }
};

export const updateGalleryItem = async (id, galleryData) => {
  try {
    const response = await api.put(`/gallery/${id}/`, galleryData);
    return { success: true, message: "Gallery item updated successfully!", data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error updating gallery item.",
    };
  }
};

export const deleteGalleryItem = async (id) => {
  try {
    await api.delete(`/gallery/${id}/`);
    return { success: true, message: "Gallery item deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting gallery item.",
    };
  }
};

export const fetchTestimonials = async () => {
  try {
    const response = await api.get("/testimonials/");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching testimonials.",
    };
  }
};

export const fetchTestimonialById = async (id) => {
  try {
    const response = await api.get(`/testimonials/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error fetching testimonial.",
    };
  }
};

export const createTestimonial = async (testimonialData) => {
  try {
    const response = await api.post("/testimonials/", testimonialData);
    return { success: true, message: "Testimonial created successfully!", data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error creating testimonial.",
      errors: error.response?.data,
    };
  }
};

export const updateTestimonial = async (id, testimonialData) => {
  try {
    const response = await api.put(`/testimonials/${id}/`, testimonialData);
    return { success: true, message: "Testimonial updated successfully!", data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error updating testimonial.",
      errors: error.response?.data,
    };
  }
};

export const deleteTestimonial = async (id) => {
  try {
    await api.delete(`/testimonials/${id}/`);
    return { success: true, message: "Testimonial deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting testimonial.",
    };
  }
};

export const deleteGalleryCategory = async (id) => {
  try {
    await api.delete(`/gallery-categories/${id}/`);
    return { success: true, message: "Gallery category deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting gallery category.",
    };
  }
};

export const deleteDonation = async (id) => {
  try {
    await api.delete(`/admin-donations/${id}/`);
    return { success: true, message: "Donation record deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting donation record.",
    };
  }
};

export const deleteContact = async (id) => {
  try {
    await api.delete(`/admin-contacts/${id}/delete/`);
    return { success: true, message: "Contact deleted successfully!" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Error deleting contact.",
    };
  }
};