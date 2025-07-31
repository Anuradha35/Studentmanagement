import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Plus, Edit2, Trash2, BookOpen, Clock } from 'lucide-react';
import { CourseFee, AppData } from '../types';

interface CourseFeeManagerProps {
  appData: AppData;
  courseFees: CourseFee[];
  onAddCourseFee: (courseName: string, courseDuration: string, fee: number) => void;
  onUpdateCourseFee: (id: string, fee: number) => void;
  onDeleteCourseFee: (id: string) => void;
  onBack: () => void;
}

const CourseFeeManager: React.FC<CourseFeeManagerProps> = ({
  appData,
  courseFees = [],
  onAddCourseFee,
  onUpdateCourseFee,
  onDeleteCourseFee,
  onBack
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseDuration: '',
    fee: ''
  });
  const [editFee, setEditFee] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.courseName.trim() || !formData.courseDuration.trim() || !formData.fee.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    if (!formData.courseDuration.trim()) {
      newErrors.courseDuration = 'Course duration is required';
    }
    if (!formData.fee.trim()) {
      newErrors.fee = 'Fee amount is required';
    }
    
    // Check for duplicate course name + duration combination
    const isDuplicate = courseFees.some(fee => 
      fee.courseName === formData.courseName && 
      fee.courseDuration === formData.courseDuration
    );
    
    if (isDuplicate) {
      newErrors.duplicate = `Fee for ${formData.courseName} - ${formData.courseDuration} already exists!`;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const fee = parseInt(formData.fee);
    if (isNaN(fee) || fee <= 0) {
      setErrors({ fee: 'Please enter a valid fee amount' });
      return;
    }

    onAddCourseFee(formData.courseName.toUpperCase(), formData.courseDuration, fee);
    setFormData({ courseName: '', courseDuration: '', fee: '' });
    setErrors({});
    setShowAddForm(false);
  };

  const handleEdit = (courseFee: CourseFee) => {
    setEditingId(courseFee.id);
    setEditFee(courseFee.fee.toString());
  };

  const handleUpdateFee = (id: string) => {
    const fee = parseInt(editFee);
    if (isNaN(fee) || fee <= 0) {
      alert('Please enter a valid fee amount');
      return;
    }
    onUpdateCourseFee(id, fee);
    setEditingId(null);
    setEditFee('');
  };

  // Get all unique course names from appData
  const getAllCourseNames = () => {
    const courseNames = new Set<string>();
    Object.values(appData.years).forEach(year => {
      Object.keys(year).forEach(courseName => courseNames.add(courseName));
    });
    return Array.from(courseNames).sort();
  };

  const groupedFees = (courseFees || []).reduce((acc, fee) => {
    if (!acc[fee.courseName]) {
      acc[fee.courseName] = [];
    }
    acc[fee.courseName].push(fee);
    return acc;
  }, {} as { [courseName: string]: CourseFee[] });

  const availableCourseNames = getAllCourseNames();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-blue-300 transition-colors" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Course Fee Management
            </h1>
            <p className="text-gray-300">Manage course fees for different durations</p>
          </div>
        </div>
      </div>

      {/* Add Fee Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Course Fee
        </button>
      </div>

      {/* Add Fee Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Add New Course Fee
          </h2>
          
          {errors.duplicate && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{errors.duplicate}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Course Name *
              </label>
              <select
                value={formData.courseName}
                onChange={(e) => {
                  setFormData({ ...formData, courseName: e.target.value });
                  setErrors({ ...errors, courseName: '', duplicate: '' });
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Course</option>
                {availableCourseNames.map(courseName => (
                  <option key={courseName} value={courseName}>{courseName}</option>
                ))}
              </select>
              {errors.courseName && <p className="text-red-400 text-sm mt-1">{errors.courseName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={formData.courseDuration}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, courseDuration: value ? `${value} Days` : '' });
                  setErrors({ ...errors, courseDuration: '', duplicate: '' });
                }}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter days (e.g., 30)"
              />
              {errors.courseDuration && <p className="text-red-400 text-sm mt-1">{errors.courseDuration}</p>}
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Fee Amount *
              </label>
              <input
                type="text"
                value={formData.fee}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, fee: value });
                  setErrors({ ...errors, fee: '' });
                }}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter fee amount"
              />
              {errors.fee && <p className="text-red-400 text-sm mt-1">{errors.fee}</p>}
            </div>
            
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Fee
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Fees Display */}
      <div className="space-y-6">
        {Object.entries(groupedFees).map(([courseName, fees]) => (
          <div key={courseName} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              {courseName}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fees.sort((a, b) => {
                const aDays = parseInt(a.courseDuration.replace(' Days', ''));
                const bDays = parseInt(b.courseDuration.replace(' Days', ''));
                return aDays - bDays;
              }).map(fee => (
                <div key={fee.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300 text-sm">{fee.courseDuration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(fee)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCourseFee(fee.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {editingId === fee.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editFee}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setEditFee(value);
                        }}
                        className="flex-1 p-2 bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleUpdateFee(fee.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditFee('');
                        }}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-green-400">₹{fee.fee.toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {courseFees.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Course Fees Added</h3>
          <p className="text-gray-400 mb-4">Start by adding course fees for different durations</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add First Course Fee
          </button>
        </div>
      )}
    </div>
  );
};







export default CourseFeeManager;