import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Film, Image, MessageSquare, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { fetchTestimonials, deleteTestimonial, updateTestimonial } from '../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function GetTestimonials() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchTestimonials();
    if (result.success) {
      setTestimonials(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const result = await deleteTestimonial(id);
    if (result.success) {
      toast.success('Testimonial deleted successfully!');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } else {
      toast.error(result.message);
    }
    setDeleteConfirmationId(null);
  };

  const handleToggleActive = async (testimonial) => {
    const result = await updateTestimonial(testimonial.id, { is_active: !testimonial.is_active });
    if (result.success) {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === testimonial.id ? { ...t, is_active: !t.is_active } : t))
      );
    } else {
      toast.error(result.message);
    }
  };

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.role && t.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Testimonials</h1>
            <p className="mt-1 text-gray-600">Manage testimonials and their attached photo or video</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/addTestimonial')}
            className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center"
          >
            <Plus size={16} className="mr-1" /> New Testimonial
          </button>
        </div>

        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or role..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading testimonials...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              No testimonials found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3">
                        {t.gallery_item ? (
                          t.gallery_item.media_type === 'image' ? (
                            <img
                              src={t.gallery_item.thumbnail_url || t.gallery_item.media_url}
                              alt={t.gallery_item.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                              <Film size={18} className="text-white" />
                            </div>
                          )
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image size={18} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.role || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{t.quote || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(t)} className="flex items-center gap-1">
                          {t.is_active ? (
                            <ToggleRight size={22} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={22} className="text-gray-400" />
                          )}
                          <span className={`text-xs ${t.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                            {t.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/editTestimonial/${t.id}`)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                          >
                            <Edit size={16} />
                          </button>
                          {deleteConfirmationId === t.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="px-2 py-1 text-xs rounded-md bg-orange-600 text-white"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmationId(null)}
                                className="px-2 py-1 text-xs rounded-md border border-gray-300"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmationId(t.id)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
