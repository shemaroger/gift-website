import { useState } from 'react';
import { Calendar, Link, Image, FileUp, CheckSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createAds } from "../../api";
import { useNavigate, useLocation } from 'react-router-dom';

export default function EnhancedAdForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        content: '',
        target_url: '',
        is_active: true,
        start_date: '',
        end_date: '',

    });

    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            // Handle file upload
            if (files && files[0]) {
                setFormData({
                    ...formData,
                    [name]: files[0]
                });

                // Create preview URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(files[0]);
            }
        } else if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.target_url.trim()) newErrors.target_url = 'Target URL is required';
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (!formData.end_date) newErrors.end_date = 'End date is required';

        // URL validation
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (formData.target_url && !urlPattern.test(formData.target_url)) {
            newErrors.target_url = 'Please enter a valid URL';
        }

        // Date validation
        if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
            newErrors.end_date = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (validateForm()) {
            setIsSubmitting(true);

            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image') {
                    if (formData.image) {
                        submitData.append(key, formData.image);
                    }
                } else {
                    submitData.append(key, formData[key]);
                }
            });
            console.log('Form submitted with image:', formData.image);

            console.log('Form submitted:', formData);
            setIsSubmitting(false);
            setSubmitSuccess(true);
            await createAds(submitData)


            toast.success('Advertisement created successfully!');

            navigate(-1);

            setTimeout(() => {
                setSubmitSuccess(false);
                setFormData({
                    title: '',
                    description: '',
                    image: null,
                    content: '',
                    target_url: '',
                    is_active: true,
                    start_date: '',
                    end_date: '',
                    category: '',
                    budget: '',
                    audience: ''
                });
                setImagePreview(null);
            }, 3000);

        }
    };

    return (
        <div className="min-h-screen  py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-6 max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold font-display">
                            Create New Advertisement
                        </h1>

                        <div className="flex space-x-2">

                            <a href='/dashboard/getAds' className="px-4 py-2  text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center">
                                <ArrowLeft size={16} className="mr-1" /> Back to Ads
                            </a>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-600">
                        Design and launch your new ad campaign in minutes
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-8">



                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 font-display">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Target URL */}
                                <div>
                                    <label htmlFor="target_url" className="block text-sm font-medium text-gray-700 mb-1">
                                        Target URL <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <Link className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="url"
                                            id="target_url"
                                            name="target_url"
                                            value={formData.target_url}
                                            onChange={handleChange}
                                            placeholder="https://example.com"
                                            className={`w-full px-3 py-2 border rounded-r-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${errors.target_url ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    {errors.target_url && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.target_url}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Campaign Timing Section - Second Row */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 font-display">Campaign Timing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <Calendar className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="date"
                                            id="start_date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-r-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${errors.start_date ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <Calendar className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="date"
                                            id="end_date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-r-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${errors.end_date ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Section - Third Row */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 font-display">Ad Content</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Short Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    ></textarea>
                                </div>

                                {/* Content */}
                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                        Detailed Content
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    ></textarea>
                                </div>

                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 font-display">Media</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Image Upload */}
                                <div className="col-span-1">
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ad Image
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                                            <span className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                                <FileUp className="h-5 w-5 mr-2" />
                                                Choose Image
                                            </span>
                                            <input
                                                id="image"
                                                name="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                        </label>
                                        <span className="ml-3 text-sm text-gray-500">
                                            {formData.image ? formData.image.name : 'No file chosen'}
                                        </span>
                                    </div>
                                </div>

                                {/* Image Preview */}
                                <div className="col-span-1">
                                    {imagePreview ? (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                            <div className="relative w-40 h-40 border border-gray-200 rounded-md overflow-hidden">
                                                <img
                                                    src={imagePreview}
                                                    alt="Ad preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                            <div className="relative w-40 h-40 border border-gray-200 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                <Image className="h-8 w-8 text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Is Active toggle in third column */}
                                <div className="col-span-1 flex items-start pt-8">
                                    <div className="bg-gray-50 rounded-lg p-4 w-full">
                                        <div className="flex items-center">
                                            <input
                                                id="is_active"
                                                name="is_active"
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                                Make this ad active immediately
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            If checked, your ad will go live once approved. Otherwise, it will be saved as a draft.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex justify-end space-x-4">

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`flex justify-center py-2 px-6 border border-transparent rounded-md text-sm font-medium text-white ${isSubmitting
                                        ? 'bg-orange-400 cursor-not-allowed'
                                        : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                                        }`}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Advertisement'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}