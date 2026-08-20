import React, { useState, useEffect } from 'react';

const StatusUpdateModal = ({ event, isOpen, onClose, onUpdate }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (event) {
      setIsActive(event.is_active);
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!event) return;

    const updatedEventData = { ...event, is_active: isActive };
    const result = await onUpdate(event.id, updatedEventData);
    if (result.success) {
      onClose();
    } else {
      alert(result.message);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl border border-gray-200 max-w-md w-full p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900 mb-4">Update Event Status</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Status</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="block w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:ring-orange-500 focus:border-orange-500"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
