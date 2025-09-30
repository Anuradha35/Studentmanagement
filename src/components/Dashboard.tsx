import React, { useState } from 'react';
import { Calendar, Users, BookOpen, Plus, TrendingUp, GraduationCap, Building2, DollarSign } from 'lucide-react';
import { AppData } from '../types';
import BatchDialog from './BatchDialog';
import CourseDialog from './CourseDialog';

interface DashboardProps {
  appData: AppData;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  selectedBatch: string;
  setSelectedBatch: (batch: string) => void;
  onAddCourse: (year: string, courseName: string) => void;
  onAddBatch: (year: string, courseName: string, batchNumber: number, startDate: string, courseDurations: string[]) => void;
  onNavigateToCourse: (courseName: string) => void;
  onNavigateToEditStudent: (student: Student) => void;
  onNavigateToCourseFees: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  appData,
  selectedYear,
  setSelectedYear,
  selectedCourse,
  setSelectedCourse,
  selectedBatch,
  setSelectedBatch,
  onAddCourse,
  onAddBatch,
  onNavigateToCourse,
  onNavigateToEditStudent,
  onNavigateToCourseFees
}) => {
  const [showCourseDialog, setShowCourseDialog] = useState(false);

  const currentYearData = appData.years[selectedYear] || {};
  const currentCourseData = currentYearData[selectedCourse] || {};
  const availableYears = Object.keys(appData.years).sort().reverse();
  const availableCourses = Object.keys(currentYearData);

  const getTotalStudents = () => {
    let total = 0;
    Object.values(currentYearData).forEach(course => {
      Object.values(course).forEach(batch => {
        total += batch.students.length;
      });
    });
    return total;
  };

  const getCourseStudents = (courseName: string) => {
    let total = 0;
    const course = currentYearData[courseName];
    if (course) {
      Object.values(course).forEach(batch => {
        total += batch.students.length;
      });
    }
    return total;
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Student Management System
            </h1>
            <p className="text-gray-300">Manage students, courses, and batches efficiently</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-white">{getTotalStudents()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Active Courses</p>
              <p className="text-3xl font-bold text-white">{availableCourses.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Batches</p>
              <p className="text-3xl font-bold text-white">
                {Object.values(currentYearData).reduce((total, course) => total + Object.keys(course).length, 0)}
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Current Year</p>
              <p className="text-3xl font-bold text-white">{selectedYear}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Year Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Select Academic Year</h2>
        <div className="flex flex-wrap gap-3">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedYear === year
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {year}
            </button>
          ))}
          <button
            onClick={() => {
              const newYear = (parseInt(selectedYear) + 1).toString();
              setSelectedYear(newYear);
            }}
            className="px-6 py-3 rounded-lg font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {parseInt(selectedYear) + 1}
          </button>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Courses for {selectedYear}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToCourseFees}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Manage Course Fees
            </button>
            <button
              onClick={() => setShowCourseDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCourses.map(courseName => (
            <div
              key={courseName}
              onClick={() => onNavigateToCourse(courseName)}
              className="p-6 rounded-xl cursor-pointer transition-all duration-200 border bg-white/10 border-white/20 hover:bg-blue-500/20 hover:border-blue-500/50 backdrop-blur-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{courseName}</h3>
                <Building2 className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <p className="text-gray-300 group-hover:text-blue-200 text-sm mb-2 transition-colors">
                {Object.keys(currentYearData[courseName]).length} Batches
              </p>
              <p className="text-gray-300 group-hover:text-blue-200 text-sm transition-colors">
                {getCourseStudents(courseName)} Students
              </p>
              <div className="mt-3 flex items-center text-blue-400 group-hover:text-blue-300 text-sm transition-colors">
                <span>View Batches</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <CourseDialog
        isOpen={showCourseDialog}
        onClose={() => setShowCourseDialog(false)}
        onAddCourse={(courseName) => {
          onAddCourse(selectedYear, courseName);
          setShowCourseDialog(false);
        }}
      />

    </div>
  );
};

export default Dashboard;