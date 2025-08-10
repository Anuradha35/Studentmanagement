import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CourseBatches from './components/CourseBatches';
import StudentForm from './components/StudentForm';
import { AppData, Student, Course, Batch, CourseFee, Payment } from './types';
import CourseFeeManager from './components/CourseFeeManager';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'course-batches' | 'student-form' | 'course-fees'>('dashboard');
  
  // ✅ UPDATED: Add payments array to initial state
  const [appData, setAppData] = useState<AppData>({
    years: {},
    collegeNames: ['RGPV', 'VIT University', 'Amity University', 'Lovely Professional University'],
    branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
    courseDurations: ['15 Days', '30 Days', '45 Days', '60 Days', '90 Days'],
    courseFees: [],
    payments: []  // ✅ ADD THIS LINE
  });
  
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [preSelectedDuration, setPreSelectedDuration] = useState<string>('');
  const [preSelectedStartDate, setPreSelectedStartDate] = useState<string>('');

  const navigateToCourseFees = () => setCurrentPage('course-fees');

  useEffect(() => {
    const savedData = localStorage.getItem('studentManagementData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // ✅ UPDATED: Ensure payments array exists in loaded data
      if (!parsedData.payments) {
        parsedData.payments = [];
      }
      setAppData(parsedData);
    }
  }, []);

  const saveData = (newData: AppData) => {
    setAppData(newData);
    localStorage.setItem('studentManagementData', JSON.stringify(newData));
  };

  const addCourseFee = (courseName: string, courseDuration: string, fee: number) => {
    const newData = { ...appData };
    // ✅ Fix: Ensure courseFees is initialized
    if (!newData.courseFees) {
      newData.courseFees = [];
    }
    const newCourseFee: CourseFee = {
      id: Date.now().toString(),
      courseName,
      courseDuration,
      fee,
      createdAt: new Date().toISOString()
    };
    newData.courseFees.push(newCourseFee);
    saveData(newData);
  };

  const updateCourseFee = (id: string, fee: number) => {
    const newData = { ...appData };
    const courseFeeIndex = newData.courseFees.findIndex(cf => cf.id === id);
    if (courseFeeIndex !== -1) {
      newData.courseFees[courseFeeIndex].fee = fee;
      saveData(newData);
    }
  };

  const deleteCourseFee = (id: string) => {
    const newData = { ...appData };
    newData.courseFees = newData.courseFees.filter(cf => cf.id !== id);
    saveData(newData);
  };

  // ✅ UPDATED: Replace the simple addPayment with comprehensive payment handler
  const handleAddPayment = (studentId: string, payment: Omit<Payment, 'id' | 'studentId' | 'createdAt'>) => {
    const newPayment: Payment = {
      id: `payment_${Date.now()}_${Math.random()}`,
      studentId,
      createdAt: new Date().toISOString(),
      ...payment
    };

    setAppData(prev => ({
      ...prev,
      payments: [...(prev.payments || []), newPayment]
    }));

    // Update student's payment summary if it's a single payment
    if (payment.type === 'single') {
      setAppData(prev => {
        const newData = { ...prev };
        
        // Find and update the student
        Object.keys(newData.years).forEach(year => {
          Object.keys(newData.years[year]).forEach(course => {
            Object.keys(newData.years[year][course]).forEach(batch => {
              const studentIndex = newData.years[year][course][batch].students
                .findIndex(s => s.id === studentId);
              
              if (studentIndex !== -1) {
                const student = newData.years[year][course][batch].students[studentIndex];
                const newTotalPaid =  payment.amount;
                
                newData.years[year][course][batch].students[studentIndex] = {
                  ...student,
                  totalPaid: newTotalPaid,
                  remainingFee: student.courseFee - newTotalPaid
                };
              }
            });
          });
        });
        
        return newData;
      });
    }

    // Save to localStorage after payment is added
    setTimeout(() => {
      const updatedData = { ...appData, payments: [...(appData.payments || []), newPayment] };
      localStorage.setItem('studentManagementData', JSON.stringify(updatedData));
    }, 100);
  };

  const addCourse = (year: string, courseName: string) => {
    const newData = { ...appData };
    if (!newData.years[year]) {
      newData.years[year] = {};
    }
    if (!newData.years[year][courseName]) {
      newData.years[year][courseName] = {};
    }
    saveData(newData);
  };

  const addBatch = (year: string, courseName: string, batchNumber: number, startDate: string, courseDurations: string[]) => {
    const newData = { ...appData };
    const batchName = `B${batchNumber}`;
    
    if (!newData.years[year]) {
      newData.years[year] = {};
    }
    if (!newData.years[year][courseName]) {
      newData.years[year][courseName] = {};
    }
    
    newData.years[year][courseName][batchName] = {
      batchName,
      startDate,
      courseDurations,
      students: []
    };
    
    saveData(newData);
  };

  const addStudent = (year: string, courseName: string, batchName: string, student: Student) => {
    const newData = { ...appData };
    if (newData.years[year]?.[courseName]?.[batchName]) {
      newData.years[year][courseName][batchName].students.push(student);
      saveData(newData);
    }
  };

  const addCollegeName = (collegeName: string) => {
    if (!appData.collegeNames.includes(collegeName)) {
      const newData = { ...appData };
      newData.collegeNames.push(collegeName);
      saveData(newData);
    }
  };

  const addBranch = (branchName: string) => {
    if (!appData.branches.includes(branchName)) {
      const newData = { ...appData };
      newData.branches.push(branchName);
      saveData(newData);
    }
  };

  const addCourseDuration = (duration: string) => {
    if (!appData.courseDurations.includes(duration)) {
      const newData = { ...appData };
      newData.courseDurations.push(duration);
      saveData(newData);
    }
  };

  const navigateToCourse = (courseName: string) => {
    setSelectedCourseName(courseName);
    setSelectedCourse(courseName);
    setCurrentPage('course-batches');
  };

  const navigateToForm = (courseDuration?: string, startDate?: string) => {
    setPreSelectedDuration(courseDuration || '');
    setPreSelectedStartDate(startDate || '');
    setCurrentPage('student-form');
  };

  // ✅ UPDATED: Enhanced safety check including payments
  if (!appData || !Array.isArray(appData.courseFees) || !appData.years || !Array.isArray(appData.payments)) {
    return (
      <div className="text-white p-6">
        ⚠️ App data is not ready or is incomplete. Please reload or check local storage.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentPage === 'dashboard' && (
        <Dashboard
          appData={appData}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          onAddCourse={addCourse}
          onAddBatch={addBatch}
          onNavigateToCourse={navigateToCourse}
          onNavigateToCourseFees={() => setCurrentPage('course-fees')}
        />
      )}
      
      {currentPage === 'course-batches' && (
        <CourseBatches
          appData={appData}
          selectedYear={selectedYear}
          selectedCourse={selectedCourse}
          selectedCourseName={selectedCourseName}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          onAddBatch={addBatch}
          onNavigateToForm={navigateToForm}
          onBack={() => setCurrentPage('dashboard')}
          onNavigateToCourseFees={navigateToCourseFees}
        />
      )}
      
      {currentPage === 'student-form' && (
        <StudentForm
          appData={appData}
          selectedYear={selectedYear}
          selectedCourse={selectedCourse}
          selectedBatch={selectedBatch}
          preSelectedDuration={preSelectedDuration}
          preSelectedStartDate={preSelectedStartDate}
          onAddStudent={addStudent}
          onAddCollegeName={addCollegeName}
          onAddBranch={addBranch}
          onAddCourseDuration={addCourseDuration}
          onAddPayment={handleAddPayment}  // ✅ UPDATED: Use new payment handler
          onBack={() => setCurrentPage('course-batches')}
        />
      )}
      
      {currentPage === 'course-fees' && (
        <CourseFeeManager
          appData={appData}
          courseFees={appData.courseFees}
          onAddCourseFee={addCourseFee}
          onUpdateCourseFee={updateCourseFee}
          onDeleteCourseFee={deleteCourseFee}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  );
}

export default App;