import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});



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

export const fetchAnnouncements = async () => {
    try {
        const response = await api.get("/announcements/active/");
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

export const fetchblogByUuid = async (postUuid) => {
    try {
        const response = await api.get(`/posts/uuid/${postUuid}/`);
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

export const eventByUuid = async (eventUuid) => {
    try {
        const response = await api.get(`/events_detail/uuid/${eventUuid}/`);
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

export const fetchTestimonials = async () => {
    try {
        const response = await api.get("/testimonials/public/");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.detail || "Error fetching testimonials.",
        };
    }
};

export const submitTestimonial = async (testimonialData) => {
    try {
        const response = await api.post("/testimonials/public/", testimonialData);
        return {
            success: true,
            message: response.data?.message || "Thank you! Your testimonial has been submitted for review.",
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || "Error submitting testimonial.",
            errors: error.response?.data,
        };
    }
};

export const createDonation = async (donationData) => {
    try {
        const response = await api.post(`/donation/interest/`, donationData,);
        return response;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const createContact = async (contactData) => {
    try {
        const response = await api.post(`/contact/`, contactData,);
        return response;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};