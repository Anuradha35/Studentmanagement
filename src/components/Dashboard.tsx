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
  onNavigateToCourseFees: () => void;
  onNavigateToGroupPayment: () => void; // New prop for group payment navigation
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
  onNavigateToCourseFees,
  onNavigateToGroupPayment // Use the new prop
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
            {/* New Group Payment Button */}
            <button
              onClick={onNavigateToGroupPayment}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 group flex items-center gap-2"
            >
              <Users className="w-5 h-5 text-white group-hover:text-blue-300 transition-colors" />
              <span className="text-white">Group Payment</span>
            </button>
          </div>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500/50 to-purple-500/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex flex-col items-center justify-center text-white">
          <Users className="w-10 h-10 mb-4" />
          <p className="text-5xl font-bold">{getTotalStudents()}</p>
          <p className="text-sm uppercase tracking-wide opacity-80">Total Students</p>
        </div>
        <div className="bg-gradient-to-r from-green-500/50 to-teal-500/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex flex-col items-center justify-center text-white">
          <TrendingUp className="w-10 h-10 mb-4" />
          <p className="text-5xl font-bold">12%</p>
          <p className="text-sm uppercase tracking-wide opacity-80">Growth this month</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500/50 to-orange-500/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex flex-col items-center justify-center text-white">
          <DollarSign className="w-10 h-10 mb-4" />
          <p className="text-5xl font-bold">₹1.2M</p>
          <p className="text-sm uppercase tracking-wide opacity-80">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-r from-red-500/50 to-pink-500/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex flex-col items-center justify-center text-white">
          <GraduationCap className="w-10 h-10 mb-4" />
          <p className="text-5xl font-bold">{availableCourses.length}</p>
          <p className="text-sm uppercase tracking-wide opacity-80">Active Courses</p>
        </div>
      </div>
      {/* Year & Courses */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-yellow-400" />
            Current Year:
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-white font-bold text-xl ml-2 focus:outline-none"
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="bg-gray-800 text-white">{year}</option>
              ))}
            </select>
          </h2>
          <button
            onClick={() => setShowCourseDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg shadow-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Course
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((courseName) => (
            <div
              key={courseName}
              onClick={() => onNavigateToCourse(courseName)}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <h3 className="text-xl font-semibold text-white mb-2">{courseName}</h3>
              <p className="text-gray-400 mb-4">Total students: {getCourseStudents(courseName)}</p>
              <div className="flex items-center text-blue-300 hover:underline">
                <BookOpen className="w-4 h-4 mr-2" />
                View Details
              </div>
            </div>
          ))}
          {availableCourses.length === 0 && (
            <div className="col-span-full text-center text-gray-400 p-8 border border-dashed border-white/20 rounded-xl">
              No courses found for this year.
            </div>
          )}
        </div>
      </div>
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