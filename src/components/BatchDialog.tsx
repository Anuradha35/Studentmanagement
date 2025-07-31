import React, { useState, useRef, useEffect } from 'react';
import { X, Hash, Calendar, Clock } from 'lucide-react';
import { AppData } from '../types';

interface BatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatch: (batchNumber: number, startDate: string, courseDurations: string[]) => void;
  nextBatchNumber: number;
  appData: AppData;
  selectedCourse: string;
  editingBatch?: string | null;
  onNavigateToCourseFees: () => void;
}

const BatchDialog: React.FC<BatchDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAddBatch, 
  nextBatchNumber,
  appData,
  selectedCourse,
  editingBatch,
  onNavigateToCourseFees
}) => {
  const [batchNumber, setBatchNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [customDuration, setCustomDuration] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFirstBatch, setIsFirstBatch] = useState(nextBatchNumber === 1);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(!!editingBatch);
      setIsFirstBatch(!editingBatch && nextBatchNumber === 1);
      
      if (nextBatchNumber > 1) {
        setBatchNumber(nextBatchNumber.toString());
      }
      
      // If editing, load existing batch data
      if (editingBatch) {
        const batchData = appData.years[Object.keys(appData.years)[0]]?.[selectedCourse]?.[editingBatch];
        if (batchData) {
          setSelectedDurations(batchData.courseDurations || []);
          setStartDate(batchData.startDate || '');
        }
      } else {
        setSelectedDurations([]);
      }
      
      setCustomDuration('');
    }
  }, [isOpen, nextBatchNumber, editingBatch, appData, selectedCourse]);

  const formatDate = (value: string): string => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as DD.MM.YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 8)}`;
    }
  };

  const validateDate = (dateStr: string): boolean => {
    const [day, month, year] = dateStr.split('.').map(num => parseInt(num));
    
    if (!day || !month || !year) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 2020 || year > 2030) return false;
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};

    // Validate batch number
    if (isFirstBatch) {
      if (!batchNumber.trim()) {
        newErrors.batchNumber = 'Batch number is required';
      } else if (!/^\d+$/.test(batchNumber)) {
        newErrors.batchNumber = 'Only numbers are allowed';
      } else if (parseInt(batchNumber) <= 0) {
        newErrors.batchNumber = 'Please enter a positive number';
      }
    }

    // Validate start date
    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    } else if (startDate.length !== 10) {
      newErrors.startDate = 'Please enter complete date (DD.MM.YYYY)';
    } else if (!validateDate(startDate)) {
      newErrors.startDate = 'Please enter a valid date';
    }

    // Validate course durations
    if (selectedDurations.length === 0) {
      newErrors.courseDurations = 'Please select at least one course duration';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const finalBatchNumber = isFirstBatch ? parseInt(batchNumber) : nextBatchNumber;
      onAddBatch(finalBatchNumber, startDate, selectedDurations);
      handleClose();
    }
  };

  const handleClose = () => {
    setBatchNumber('');
    setStartDate('');
    setSelectedDurations([]);
    setCustomDuration('');
    setErrors({});
    onClose();
  };

  const handleBatchNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    setBatchNumber(value);
    if (errors.batchNumber) {
      setErrors({ ...errors, batchNumber: '' });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setStartDate(formatted);
    if (errors.startDate) {
      setErrors({ ...errors, startDate: '' });
    }
  };

  const handleDurationToggle = (duration: string) => {
    setSelectedDurations(prev => 
      prev.includes(duration) 
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
    if (errors.courseDurations) {
      setErrors({ ...errors, courseDurations: '' });
    }
  };

  const handleCustomDurationAdd = () => {
    if (customDuration && /^\d+$/.test(customDuration)) {
      const duration = `${customDuration} Days`;
      if (!selectedDurations.includes(duration)) {
        setSelectedDurations(prev => [...prev, duration]);
      }
      setCustomDuration('');
    }
  };

  // Get available durations for the selected course from course fees
  const getAvailableDurations = () => {
    if (!appData.courseFees) return [];
    
    const courseDurations = appData.courseFees
      .filter(fee => fee.courseName === selectedCourse)
      .map(fee => fee.courseDuration);
      .sort((a, b) => {
        const aDays = parseInt(a.replace(' Days', ''));
        const bDays = parseInt(b.replace(' Days', ''));
        return aDays - bDays;
      });
    
    return courseDurations;
  };

  const availableDurations = getAvailableDurations();

  // Check if course has fees set
  if (isOpen && availableDurations.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-md border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Course Fees Set</h2>
            <p className="text-gray-300 mb-6">
              Please set course fees for <strong>{selectedCourse}</strong> before creating batches.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCourseFees();
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Set Course Fees
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? `Edit Batch ${editingBatch}` : isFirstBatch ? 'Create First Batch' : `Create Batch B${nextBatchNumber}`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstBatch && !isEditing && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Starting Batch Number *
              </label>
              <input
                ref={inputRef}
                type="text"
                value={batchNumber}
                onChange={handleBatchNumberChange}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 10"
              />
              {errors.batchNumber && <p className="text-red-400 text-sm mt-1">{errors.batchNumber}</p>}
              <p className="text-gray-400 text-xs mt-1">
                This will create batch B{batchNumber || '10'}
              </p>
            </div>
          )}

          {!isFirstBatch && !isEditing && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-medium">
                🔢 Creating Batch: B{nextBatchNumber}
              </p>
              <p className="text-green-200 text-sm">
                Auto-incremented from previous batch
              </p>
            </div>
          )}

          {isEditing && (
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 font-medium">
                ✏️ Editing Batch: {editingBatch}
              </p>
              <p className="text-blue-200 text-sm">
                Modify course durations for this batch
              </p>
            </div>
          )}

          {!isEditing && (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Batch Start Date *
            </label>
            <input
              type="text"
              value={startDate}
              onChange={handleDateChange}
              maxLength={10}
              className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="DD.MM.YYYY (e.g., 01.07.2025)"
            />
            {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
            <p className="text-gray-400 text-xs mt-1">
              Format: DD.MM.YYYY
            </p>
          </div>
          )}

          {/* Course Duration Selection */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Available Course Durations for {selectedCourse} *
            </label>
            
            {/* Available Durations */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {availableDurations.map(duration => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => handleDurationToggle(duration)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedDurations.includes(duration)
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
            
            {/* Selected Durations Display */}
            {selectedDurations.length > 0 && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm font-medium mb-2">Selected Durations:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedDurations.map(duration => (
                    <span
                      key={duration}
                      className="bg-green-500/30 text-green-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {duration}
                      <button
                        type="button"
                        onClick={() => handleDurationToggle(duration)}
                        className="hover:text-red-300 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {errors.courseDurations && <p className="text-red-400 text-sm mt-1">{errors.courseDurations}</p>}
            <p className="text-gray-400 text-xs mt-1">
              Students in this batch can have any of these durations
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {isEditing ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchDialog;