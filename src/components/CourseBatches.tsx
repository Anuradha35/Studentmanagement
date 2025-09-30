import React, { useState } from 'react';
import { ArrowLeft, Plus, Users, Calendar, Clock, GraduationCap, Hash } from 'lucide-react';
import { AppData } from '../types';
import BatchDialog from './BatchDialog';
import ViewStudents from './ViewStudents'; // NEW COMPONENT

interface CourseBatchesProps {
  appData: AppData;
  selectedYear: string;
  selectedCourse: string;
  selectedCourseName: string;
  selectedBatch: string;
  setSelectedBatch: (batch: string) => void;
  onAddBatch: (year: string, courseName: string, batchNumber: number, startDate: string, courseDurations: string[]) => void;
  onNavigateToForm: (courseDuration?: string, startDate?: string) => void;
  onNavigateToEditStudent: (student: Student) => void;
  onBack: () => void;
  onNavigateToCourseFees: () => void;
}

const CourseBatches: React.FC<CourseBatchesProps> = ({
  appData,
  selectedYear,
  selectedCourse,
  selectedCourseName,
  selectedBatch,
  setSelectedBatch,
  onAddBatch,
  onNavigateToForm,
  onNavigateToEditStudent,
  onBack,
  onNavigateToCourseFees
}) => {
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState<string | null>(null);

  // NEW STATE FOR VIEW MODE
  const [viewMode, setViewMode] = useState<"default" | "viewStudents">("default");
  const [selectedBatchForView, setSelectedBatchForView] = useState<string | null>(null);

  const currentYearData = appData.years[selectedYear] || {};
  const currentCourseData = currentYearData[selectedCourse] || {};
  const availableBatches = Object.keys(currentCourseData);

  const getBatchStudents = (batchName: string) => {
    const batch = currentCourseData[batchName];
    return batch ? batch.students.length : 0;
  };

  const getStudentsByDuration = (batchName: string, duration: string) => {
    const batch = currentCourseData[batchName];
    if (!batch) return 0;
    return batch.students.filter(student => student.courseDuration === duration).length;
  };

  const getNextBatchNumber = () => {
    if (!currentCourseData || Object.keys(currentCourseData).length === 0) return 1;
    
    const batchNumbers = Object.keys(currentCourseData)
      .map(batchName => parseInt(batchName.substring(1)))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a);
    
    return batchNumbers.length > 0 ? batchNumbers[0] + 1 : 1;
  };

  const getCourseFees = () => {
    return appData.courseFees?.filter(fee => fee.courseName === selectedCourse) || [];
  };

  const handleAddBatch = () => {
    const courseFees = getCourseFees();
    if (courseFees.length === 0) {
      alert(`No course fees set for ${selectedCourse}! Please set course fees first.`);
      onNavigateToCourseFees();
      return;
    }
    setShowBatchDialog(true);
  };

  const handleEditBatch = (batchName: string) => {
    const courseFees = getCourseFees();
    if (courseFees.length === 0) {
      alert(`No course fees set for ${selectedCourse}! Please set course fees first.`);
      onNavigateToCourseFees();
      return;
    }
    setEditingBatch(batchName);
    setShowBatchDialog(true);
  };

  const getTotalStudents = () => {
    return Object.values(currentCourseData).reduce((total, batch) => total + batch.students.length, 0);
  };

  // IF IN VIEW MODE, SHOW STUDENTS
 // CourseBatches.tsx - Updated ViewStudents call

// IF IN VIEW MODE, SHOW STUDENTS
if (viewMode === "viewStudents") {
  const students = selectedBatchForView === null
    ? Object.values(currentCourseData).flatMap(batch => batch.students)
    : currentCourseData[selectedBatchForView]?.students || [];

  // Get all payments from appData
  const allPayments = appData.payments || [];
  
  // Filter payments for current students
  const studentIds = students.map(s => s.id);
  const relevantPayments = allPayments.filter(payment => 
    studentIds.includes(payment.studentId)
  );

  // Separate single and group payments
  const singlePayments = relevantPayments.filter(p => p.type === 'single');
  const groupPayments = relevantPayments.filter(p => p.type === 'group');

  return (
    <ViewStudents
      students={students}
      payments={singlePayments}
      groupPayments={groupPayments}
      onBack={() => setViewMode("default")}
      onEditStudent={onNavigateToEditStudent}
    />
  );
}

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
              {selectedCourseName}
            </h1>
            <p className="text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Academic Year {selectedYear} • {availableBatches.length} Batches •{" "}
              <span
                className="cursor-pointer hover:text-blue-400"
                onClick={() => {
                  setSelectedBatchForView(null);
                  setViewMode("viewStudents");
                }}
              >
                {getTotalStudents()} Students
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Students</p>
              <p
                className="text-3xl font-bold text-white cursor-pointer hover:text-blue-400"
                onClick={() => {
                  setSelectedBatchForView(null);
                  setViewMode("viewStudents");
                }}
              >
                {getTotalStudents()}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Active Batches</p>
              <p className="text-3xl font-bold text-white">{availableBatches.length}</p>
            </div>
            <Hash className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Course</p>
              <p className="text-2xl font-bold text-white">{selectedCourseName}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Academic Year</p>
              <p className="text-3xl font-bold text-white">{selectedYear}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Add Batch Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Course Batches</h2>
        <button
          onClick={handleAddBatch}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-green-500/25"
        >
          <Plus className="w-5 h-5" />
          Add New Batch
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {availableBatches.map(batchName => {
          const batch = currentCourseData[batchName];
          return (
            <div
              key={batchName}
              onClick={() => setSelectedBatch(batchName)}
              className={`p-6 rounded-xl cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
                selectedBatch === batchName
                  ? 'bg-green-500/30 border-green-500 shadow-lg shadow-green-500/25'
                  : 'bg-white/10 border-white/20 hover:bg-green-500/20 hover:border-green-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Hash className="w-5 h-5 text-green-400" />
                  {batchName}
                </h3>
                <div className="text-right">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatchForView(batchName);
                        setViewMode("viewStudents");
                      }}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors"
                    >
                      View Student Information
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-white">{getBatchStudents(batchName)}</p>
                  <p className="text-gray-300 text-xs">Students</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Start Date: {batch.startDate}
                </p>
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Durations: {Array.isArray(batch.courseDurations) ? batch.courseDurations.join(', ') : 'N/A'}
                </p>
              </div>

              {/* Duration Breakdown */}
              <div className="space-y-1">
                <p className="text-gray-400 text-xs font-medium">Students by Duration:</p>
                {batch.courseDurations.map(duration => (
                  <div key={duration} className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs">{duration}</span>
                    <span className="text-white text-xs font-medium bg-white/10 px-2 py-1 rounded">
                      {getStudentsByDuration(batchName, duration)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Duration-specific Add Student Buttons */}
              {selectedBatch === batchName && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300 text-xs font-medium">Add Student to:</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBatch(batchName);
                      }}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors"
                    >
                      Edit Batch
                    </button>
                  </div>
                  <div className="space-y-2">
                    {batch.courseDurations.map(duration => (
                      <button
                        key={duration}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToForm(duration, batch.startDate);
                        }}
                        className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to {duration}
                      </button>
                    )).sort((a, b) => {
                      const aDays = parseInt(a.key.replace(' Days', ''));
                      const bDays = parseInt(b.key.replace(' Days', ''));
                      return aDays - bDays;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Batch Dialog */}
      <BatchDialog
        isOpen={showBatchDialog}
        onClose={() => {
          setShowBatchDialog(false);
          setEditingBatch(null);
        }}
        onAddBatch={(batchNumber, startDate, courseDurations) => {
          if (editingBatch) {
            const newData = { ...appData };
            if (newData.years[selectedYear]?.[selectedCourse]?.[editingBatch]) {
              newData.years[selectedYear][selectedCourse][editingBatch].courseDurations = courseDurations;
            }
          } else {
            onAddBatch(selectedYear, selectedCourse, batchNumber, startDate, courseDurations);
          }
          setShowBatchDialog(false);
          setEditingBatch(null);
        }}
        nextBatchNumber={getNextBatchNumber()}
        appData={appData}
        selectedCourse={selectedCourse}
        editingBatch={editingBatch}
        onNavigateToCourseFees={onNavigateToCourseFees}
      />
    </div>
  );
};

export default CourseBatches;
