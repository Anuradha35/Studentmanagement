import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, GraduationCap, Calendar, DollarSign, CreditCard, Receipt, Users, Plus, X } from 'lucide-react';
import { AppData, Student, Payment } from '../types';
import { Dialog } from '@headlessui/react';


interface StudentFormProps {
  appData: AppData;
  selectedYear: string;
  selectedCourse: string;
  selectedBatch: string;
  preSelectedDuration: string;
  preSelectedStartDate: string;
  onAddStudent: (year: string, courseName: string, batchName: string, student: Student) => void;
  onAddCollegeName: (collegeName: string) => void;
  onAddBranch: (branchName: string) => void;
  onAddCourseDuration: (duration: string) => void;
  onAddPayment: (studentId: string, payment: Omit<Payment, 'id' | 'studentId' | 'createdAt'>) => void;
  onBack: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  appData,
  selectedYear,
  selectedCourse,
  selectedBatch,
  preSelectedDuration,
  preSelectedStartDate,
  onAddStudent,
  onAddCollegeName,
  onAddBranch,
  onAddCourseDuration,
  onAddPayment,
  onBack
}) => {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    gender: 'Male' as 'Male' | 'Female',
    mobileNo: '',
    email: '',
    category: 'GEN' as 'GEN' | 'SC' | 'ST' | 'PH' | 'MINORITY' | 'W' | 'OBC',
    hostler: 'No' as 'Yes' | 'No',
    collegeName: '',
    branch: '',
    courseDuration: preSelectedDuration || '',
    startDate: preSelectedStartDate || '',
    endDate: '',
    courseFee: 0,
    totalPaid: 0,
    remainingFee: 0
  });
  const [showStudentCountModal, setShowStudentCountModal] = useState(false);
  const [studentCount, setStudentCount] = useState('');
  const [dynamicGroupForms, setDynamicGroupForms] = useState<any[]>([]);

  const [newCollegeName, setNewCollegeName] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [showNewCollegeInput, setShowNewCollegeInput] = useState(false);
  const [showNewBranchInput, setShowNewBranchInput] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [payments, setPayments] = useState<Array<{
    paymentMode: 'online' | 'offline';
    amount: number;
    receiptNo?: string;
    utrId?: string;
    paymentDate: string;
  }>>([]);
  const [paymentMode, setPaymentMode] = useState<'online' | 'offline'>('offline');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [utrId, setUtrId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentType, setPaymentType] = useState<'single' | 'group'>('single');
   const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupCount, setGroupCount] = useState(0);
  const [dynamicGroupEntries, setDynamicGroupEntries] = useState<any[]>([]);

  useEffect(() => {
    if (paymentType === 'group') {
      setShowGroupModal(true);
    }
  }, [paymentType]);

  const handleGroupCountConfirm = () => {
    const entries = [];
    for (let i = 0; i < groupCount; i++) {
      entries.push({
        studentName: '',
        onlineAmount: '',
        offlineAmount: '',
        utrId: '',
        receiptNo: '',
        paymentDate: ''
      });
    }
    setDynamicGroupEntries(entries);
    setShowGroupModal(false);
  };

  const handleDynamicGroupChange = (index: number, field: string, value: string) => {
    const updated = [...dynamicGroupEntries];
    updated[index][field] = value;
    setDynamicGroupEntries(updated);
  };

  
  // Group payment states
  const [groupPayments, setGroupPayments] = useState<Array<{
    studentName: string;
    onlineAmount: number;
    offlineAmount: number;
    utrId?: string;
    receiptNo?: string;
    paymentDate: string;
  }>>([]);
  const [groupStudentName, setGroupStudentName] = useState('');
  const [groupOnlineAmount, setGroupOnlineAmount] = useState('');
  const [groupOfflineAmount, setGroupOfflineAmount] = useState('');
  const [groupUtrId, setGroupUtrId] = useState('');
  const [groupReceiptNo, setGroupReceiptNo] = useState('');
  const [groupPaymentDate, setGroupPaymentDate] = useState('');

  // Add state for tracking existing payments for validation
  const [existingPayments, setExistingPayments] = useState<{
    utrIds: Set<string>;
    receiptNos: Set<string>;
  }>({ utrIds: new Set(), receiptNos: new Set() });

  // Get course fee based on selected course and duration
  const getCourseFee = () => {
    if (!appData.courseFees || !selectedCourse || !formData.courseDuration) return 0;
    
    const courseFee = appData.courseFees.find(fee => 
      fee.courseName === selectedCourse && 
      fee.courseDuration === formData.courseDuration
    );
    
    return courseFee ? courseFee.fee : 0;
  };

  // Update course fee when duration changes
  useEffect(() => {
    const fee = getCourseFee();
    setFormData(prev => ({
      ...prev,
      courseFee: fee,
      remainingFee: fee - prev.totalPaid
    }));
  }, [formData.courseDuration, selectedCourse, appData.courseFees]);

  // Calculate end date based on start date and duration
  useEffect(() => {
    if (formData.startDate && formData.courseDuration) {
      const [day, month, year] = formData.startDate.split('.');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const durationDays = parseInt(formData.courseDuration.replace(' Days', ''));
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays - 1); // Include start date in calculation
      
      const endDay = endDate.getDate().toString().padStart(2, '0');
      const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
      const endYear = endDate.getFullYear();
      
      setFormData(prev => ({
        ...prev,
        endDate: `${endDay}.${endMonth}.${endYear}`
      }));
    }
  }, [formData.startDate, formData.courseDuration]);

  // Load existing payments for validation
  useEffect(() => {
    const utrIds = new Set<string>();
    const receiptNos = new Set<string>();
    
    // Collect all existing UTR IDs and receipt numbers from all students
    Object.values(appData.years).forEach(year => {
      Object.values(year).forEach(course => {
        Object.values(course).forEach(batch => {
          batch.students.forEach(student => {
            // This would typically come from a payments database
            // For now, we'll simulate it
          });
        });
      });
    });
    
    setExistingPayments({ utrIds, receiptNos });
  }, [appData]);

  // Update total paid and remaining fee when payments change
  useEffect(() => {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    setFormData(prev => ({
      ...prev,
      totalPaid,
      remainingFee: prev.courseFee - totalPaid
    }));
  }, [payments]);

  const formatDate = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
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

  const validatePaymentDuplicate = (utrId?: string, receiptNo?: string): string | null => {
    if (utrId && existingPayments.utrIds.has(utrId)) {
      // Find which student used this UTR ID
      return `UTR/UPI ID ${utrId} has already been used by another student`;
    }
    if (receiptNo && existingPayments.receiptNos.has(receiptNo)) {
      return `Receipt number ${receiptNo} has already been used by another student`;
    }
    return null;
  };

  const handleAddPayment = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!paymentAmount.trim()) {
      newErrors.paymentAmount = 'Payment amount is required';
    }
    
    if (!paymentDate.trim()) {
      newErrors.paymentDate = 'Payment date is required';
    } else if (paymentDate.length !== 10 || !validateDate(paymentDate)) {
      newErrors.paymentDate = 'Please enter a valid date (DD.MM.YYYY)';
    }
    
    if (paymentMode === 'offline' && !receiptNo.trim()) {
      newErrors.receiptNo = 'Receipt number is required for offline payment';
    }
    
    if (paymentMode === 'online' && !utrId.trim()) {
      newErrors.utrId = 'UTR/UPI ID is required for online payment';
    }
    
    if (paymentMode === 'online' && utrId.length !== 12) {
      newErrors.utrId = 'UTR/UPI ID must be exactly 12 digits';
    }
    
    const amount = parseInt(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.paymentAmount = 'Please enter a valid amount';
    }
    
    // Check if payment exceeds remaining fee
    const currentTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (amount + currentTotal > formData.courseFee) {
      newErrors.paymentAmount = `Payment amount exceeds course fee! Maximum allowed: ₹${formData.courseFee - currentTotal}`;
    }
    
    // Check for duplicate UTR/Receipt numbers
    const duplicateError = validatePaymentDuplicate(
      paymentMode === 'online' ? utrId : undefined,
      paymentMode === 'offline' ? receiptNo : undefined
    );
    if (duplicateError) {
      if (paymentMode === 'online') {
        newErrors.utrId = duplicateError;
      } else {
        newErrors.receiptNo = duplicateError;
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const newPayment = {
        paymentMode,
        amount,
        paymentDate,
        ...(paymentMode === 'offline' ? { receiptNo } : { utrId })
      };
      
      setPayments([...payments, newPayment]);
      setPaymentAmount('');
      setReceiptNo('');
      setUtrId('');
      setPaymentDate('');
      
      // Add to existing payments to prevent duplicates in same session
      if (paymentMode === 'online' && utrId) {
        setExistingPayments(prev => ({
          ...prev,
          utrIds: new Set([...prev.utrIds, utrId])
        }));
      }
      if (paymentMode === 'offline' && receiptNo) {
        setExistingPayments(prev => ({
          ...prev,
          receiptNos: new Set([...prev.receiptNos, receiptNo])
        }));
      }
    }
  };

  const handleAddGroupPayment = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!groupStudentName.trim()) newErrors.groupStudentName = 'Student name is required';
    if (!groupPaymentDate.trim()) {
      newErrors.groupPaymentDate = 'Payment date is required';
    } else if (groupPaymentDate.length !== 10 || !validateDate(groupPaymentDate)) {
      newErrors.groupPaymentDate = 'Please enter a valid date (DD.MM.YYYY)';
    }
    
    const onlineAmount = parseInt(groupOnlineAmount) || 0;
    const offlineAmount = parseInt(groupOfflineAmount) || 0;
    
    if (onlineAmount === 0 && offlineAmount === 0) {
      newErrors.groupAmount = 'At least one payment amount is required';
    }
    
    if (onlineAmount > 0 && !groupUtrId.trim()) {
      newErrors.groupUtrId = 'UTR/UPI ID is required for online payment';
    }
    
    if (onlineAmount > 0 && groupUtrId.length !== 12) {
      newErrors.groupUtrId = 'UTR/UPI ID must be exactly 12 digits';
    }
    
    if (offlineAmount > 0 && !groupReceiptNo.trim()) {
      newErrors.groupReceiptNo = 'Receipt number is required for offline payment';
    }
    
    // Check for duplicate UTR/Receipt numbers in group payments
    const duplicateError = validatePaymentDuplicate(
      onlineAmount > 0 ? groupUtrId : undefined,
      offlineAmount > 0 ? groupReceiptNo : undefined
    );
    if (duplicateError) {
      if (onlineAmount > 0) {
        newErrors.groupUtrId = duplicateError;
      }
      if (offlineAmount > 0) {
        newErrors.groupReceiptNo = duplicateError;
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const newGroupPayment = {
        studentName: groupStudentName,
        onlineAmount,
        offlineAmount,
        utrId: onlineAmount > 0 ? groupUtrId : undefined,
        receiptNo: offlineAmount > 0 ? groupReceiptNo : undefined,
        paymentDate: groupPaymentDate
      };
      
      setGroupPayments([...groupPayments, newGroupPayment]);
      
      // Add to existing payments to prevent duplicates
      if (onlineAmount > 0 && groupUtrId) {
        setExistingPayments(prev => ({
          ...prev,
          utrIds: new Set([...prev.utrIds, groupUtrId])
        }));
      }
      if (offlineAmount > 0 && groupReceiptNo) {
        setExistingPayments(prev => ({
          ...prev,
          receiptNos: new Set([...prev.receiptNos, groupReceiptNo])
        }));
      }
      
      // Clear form
      setGroupStudentName('');
      setGroupOnlineAmount('');
      setGroupOfflineAmount('');
      setGroupUtrId('');
      setGroupReceiptNo('');
      setGroupPaymentDate('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
    } else if (formData.mobileNo.length !== 10) {
      newErrors.mobileNo = 'Mobile number must be exactly 10 digits';
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.courseDuration) newErrors.courseDuration = 'Course duration is required';
    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    } else if (formData.startDate.length !== 10 || !validateDate(formData.startDate)) {
      newErrors.startDate = 'Please enter a valid date (DD.MM.YYYY)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const student: Student = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };

      onAddStudent(selectedYear, selectedCourse, selectedBatch, student);

      // Add payments
      payments.forEach(payment => {
        onAddPayment(student.id, {
          ...payment,
          paymentDate: payment.paymentDate
        });
      });

      // Calculate end date manually after reset
      let calculatedEndDate = '';
      if (preSelectedStartDate && preSelectedDuration) {
        const [day, month, year] = preSelectedStartDate.split('.');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const durationDays = parseInt(preSelectedDuration.replace(' Days', ''));

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + durationDays - 1); // Include start date

        const endDay = endDate.getDate().toString().padStart(2, '0');
        const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
        const endYear = endDate.getFullYear();
        calculatedEndDate = `${endDay}.${endMonth}.${endYear}`;
      }

      // Reset form with pre-selected values
      const fee = getCourseFee();
      setFormData({
        studentName: '',
        fatherName: '',
        gender: 'Male',
        mobileNo: '',
        email: '',
        category: 'GEN',
        hostler: 'No',
        collegeName: '',
        branch: '',
        courseDuration: preSelectedDuration || '',
        startDate: preSelectedStartDate || '',
        endDate: calculatedEndDate,
        courseFee: fee,
        totalPaid: 0,
        remainingFee: fee
      });

      // Clear only payment-related fields, keep form structure
      setPayments([]);
      setPaymentAmount('');
      setPaymentDate('');
      setReceiptNo('');
      setUtrId('');
      
      // Clear group payment fields
      setGroupPayments([]);
      setGroupStudentName('');
      setGroupCourseName('');
      setGroupCourseDuration('');
      setGroupOnlineAmount('');
      setGroupOfflineAmount('');
      setGroupUtrId('');
      setGroupReceiptNo('');
      setGroupPaymentDate('');
      
      alert('Student added successfully!');
    }
  };

  const handleAddNewCollege = () => {
    if (newCollegeName.trim()) {
      onAddCollegeName(newCollegeName.trim());
      setFormData({ ...formData, collegeName: newCollegeName.trim() });
      setNewCollegeName('');
      setShowNewCollegeInput(false);
    }
  };

  const handleAddNewBranch = () => {
    if (newBranch.trim()) {
      onAddBranch(newBranch.trim());
      setFormData({ ...formData, branch: newBranch.trim() });
      setNewBranch('');
      setShowNewBranchInput(false);
    }
  };

  // Get available durations for the selected course from course fees
  const getAvailableDurations = () => {
    if (!appData.courseFees) return [];
    
    const courseDurations = appData.courseFees
      .filter(fee => fee.courseName === selectedCourse)
      .map(fee => fee.courseDuration)
      .sort((a, b) => {
        const aDays = parseInt(a.replace(' Days', ''));
        const bDays = parseInt(b.replace(' Days', ''));
        return aDays - bDays;
      });
    
    return courseDurations;
  };

  const availableDurations = getAvailableDurations();
  const sortedCollegeNames = [...appData.collegeNames].sort();
  const sortedBranches = [...appData.branches].sort();

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
            <h1 className="text-4xl font-bold text-white mb-2">Add New Student</h1>
            <p className="text-gray-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {selectedCourse} • Batch {selectedBatch} • Year {selectedYear}
              {preSelectedDuration && (
                <>
                  <span className="text-blue-400">•</span>
                  <span className="text-blue-400">{preSelectedDuration}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {/* Personal Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => {
                  setFormData({ ...formData, studentName: e.target.value.toUpperCase() });
                  if (errors.studentName) setErrors({ ...errors, studentName: '' });
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student name"
              />
              {errors.studentName && <p className="text-red-400 text-sm mt-1">{errors.studentName}</p>}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Father's Name *
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => {
                  setFormData({ ...formData, fatherName: e.target.value.toUpperCase() });
                  if (errors.fatherName) setErrors({ ...errors, fatherName: '' });
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter father's name"
              />
              {errors.fatherName && <p className="text-red-400 text-sm mt-1">{errors.fatherName}</p>}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Mobile Number *
              </label>
              <input
                type="text"
                value={formData.mobileNo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, mobileNo: value });
                  if (errors.mobileNo) setErrors({ ...errors, mobileNo: '' });
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
              {errors.mobileNo && <p className="text-red-400 text-sm mt-1">{errors.mobileNo}</p>}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GEN">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="PH">PH</option>
                <option value="MINORITY">Minority</option>
                <option value="W">W</option>
                <option value="OBC">OBC</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Hostler *
              </label>
              <select
                value={formData.hostler}
                onChange={(e) => setFormData({ ...formData, hostler: e.target.value as 'Yes' | 'No' })}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-green-400" />
            Academic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                College Name
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.collegeName}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setShowNewCollegeInput(true);
                    } else {
                      setFormData({ ...formData, collegeName: e.target.value });
                    }
                  }}
                  className="flex-1 p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select College</option>
                  {sortedCollegeNames.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                  <option value="ADD_NEW">+ Add New College</option>
                </select>
              </div>
              
              {showNewCollegeInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCollegeName}
                    onChange={(e) => setNewCollegeName(e.target.value.toUpperCase())}
                    className="flex-1 p-2 bg-slate-700 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new college name"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCollege}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCollegeInput(false)}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Branch
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.branch}
                  onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') {
                      setShowNewBranchInput(true);
                    } else {
                      setFormData({ ...formData, branch: e.target.value });
                    }
                  }}
                  className="flex-1 p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {sortedBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                  <option value="ADD_NEW">+ Add New Branch</option>
                </select>
              </div>
              
              {showNewBranchInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value.toUpperCase())}
                    className="flex-1 p-2 bg-slate-700 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new branch name"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewBranch}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewBranchInput(false)}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Course Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Course Duration *
              </label>
              <select
                value={formData.courseDuration}
                onChange={(e) => {
                  setFormData({ ...formData, courseDuration: e.target.value });
                  if (errors.courseDuration) setErrors({ ...errors, courseDuration: '' });
                }}
                disabled={!!preSelectedDuration}
                className={`w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  preSelectedDuration ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select Duration</option>
                {availableDurations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
              {errors.courseDuration && <p className="text-red-400 text-sm mt-1">{errors.courseDuration}</p>}
              {preSelectedDuration && (
                <p className="text-blue-400 text-sm mt-1">Pre-selected duration from batch</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Course Fee
              </label>
              <div className="p-3 bg-slate-700 border border-white/30 rounded-lg">
                <p className="text-2xl font-bold text-green-400">₹{formData.courseFee.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">Auto-calculated based on course and duration</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Start Date *
              </label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => {
                  const formatted = formatDate(e.target.value);
                  setFormData({ ...formData, startDate: formatted });
                  if (errors.startDate) setErrors({ ...errors, startDate: '' });
                }}
                disabled={!!preSelectedStartDate}
                className={`w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  preSelectedStartDate ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                placeholder="DD.MM.YYYY (e.g., 01.07.2025)"
                maxLength={10}
              />
              {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
              {preSelectedStartDate && (
                <p className="text-blue-400 text-sm mt-1">Pre-selected start date from batch</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                End Date
              </label>
              <div className="p-3 bg-slate-700 border border-white/30 rounded-lg">
                <p className="text-white">{formData.endDate || 'Auto-calculated'}</p>
                <p className="text-gray-400 text-sm">Based on start date + course duration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            Payment Information
          </h2>

          {/* Payment Type Selection */}
          <div className="mb-6">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="single"
                  checked={paymentType === 'single'}
                  onChange={(e) => setPaymentType(e.target.value as 'single' | 'group')}
                  className="text-blue-500"
                />
                <span className="text-white">Single Payment</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="group"
                  checked={paymentType === 'group'}
                  onChange={(e) => setPaymentType(e.target.value as 'single' | 'group')}
                  className="text-blue-500"
                />
                <span className="text-white">Group Payment</span>
              </label>
            </div>
          </div>

          {paymentType === 'single' && (
            <>
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-blue-300 text-sm">Course Fee</p>
                  <p className="text-2xl font-bold text-white">₹{formData.courseFee.toLocaleString()}</p>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <p className="text-green-300 text-sm">Total Paid</p>
                  <p className="text-2xl font-bold text-white">₹{formData.totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-500/30">
                  <p className="text-orange-300 text-sm">Remaining</p>
                  <p className="text-2xl font-bold text-white">₹{formData.remainingFee.toLocaleString()}</p>
                </div>
              </div>

              {/* Add Payment Form */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add Payment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as 'online' | 'offline')}
                      className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Payment Amount
                    </label>
                    <input
                      type="text"
                      value={paymentAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentAmount(value);
                        if (errors.paymentAmount) setErrors({ ...errors, paymentAmount: '' });
                      }}
                      className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                    {errors.paymentAmount && <p className="text-red-400 text-sm mt-1">{errors.paymentAmount}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Payment Date
                    </label>
                    <input
                      type="text"
                      value={paymentDate}
                      onChange={(e) => {
                        const formatted = formatDate(e.target.value);
                        setPaymentDate(formatted);
                        if (errors.paymentDate) setErrors({ ...errors, paymentDate: '' });
                      }}
                      className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DD.MM.YYYY"
                      maxLength={10}
                    />
                    {errors.paymentDate && <p className="text-red-400 text-sm mt-1">{errors.paymentDate}</p>}
                  </div>

                  {paymentMode === 'offline' ? (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <Receipt className="w-4 h-4 inline mr-1" />
                        Receipt Number
                      </label>
                      <input
                        type="text"
                        value={receiptNo}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setReceiptNo(value);
                          if (errors.receiptNo) setErrors({ ...errors, receiptNo: '' });
                        }}
                        className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter receipt number"
                      />
                      {errors.receiptNo && <p className="text-red-400 text-sm mt-1">{errors.receiptNo}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        <CreditCard className="w-4 h-4 inline mr-1" />
                        UTR/UPI ID
                      </label>
                      <input
                        type="text"
                        value={utrId}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                          setUtrId(value);
                          if (errors.utrId) setErrors({ ...errors, utrId: '' });
                        }}
                        className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 12-digit UTR/UPI ID"
                        maxLength={12}
                      />
                      {errors.utrId && <p className="text-red-400 text-sm mt-1">{errors.utrId}</p>}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Payment
                </button>
              </div>

              {/* Payment List */}
              {payments.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">
                            {payment.paymentMode === 'offline' ? '💵 Offline' : '💳 Online'} - ₹{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {payment.paymentMode === 'offline' 
                              ? `Receipt: ${payment.receiptNo}` 
                              : `UTR: ${payment.utrId}`
                            } • {payment.paymentDate}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newPayments = payments.filter((_, i) => i !== index);
                            setPayments(newPayments);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {paymentType === 'group' && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group Payment Entry
              </h3>
              
              {/* Group Payment Summary */}
              {groupPayments.length > 0 && (
                <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">Group Payment Summary</h4>
                  <div className="text-right mb-2">
                    <span className="text-2xl font-bold text-white">
                      Total: ₹{groupPayments.reduce((sum, p) => sum + p.onlineAmount + p.offlineAmount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {groupPayments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center text-blue-200">
                        <span>{payment.studentName}</span>
                        <span>₹{(payment.onlineAmount + payment.offlineAmount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show button to create new group if no dynamic forms and no existing group */}
              {dynamicGroupForms.length === 0 && groupPayments.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">No group payment created yet</p>
                  <button
                    onClick={() => setShowStudentCountModal(true)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Group Payment
                  </button>
                </div>
              )}

              {/* Payment Entries Display */}
              {groupPayments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={groupStudentName}
                    onChange={(e) => {
                      setGroupStudentName(e.target.value.toUpperCase());
                      if (errors.groupStudentName) setErrors({ ...errors, groupStudentName: '' });
                    }}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter student name"
                  />
                  {errors.groupStudentName && <p className="text-red-400 text-sm mt-1">{errors.groupStudentName}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="text"
                    value={groupPaymentDate}
                    onChange={(e) => {
                      const formatted = formatDate(e.target.value);
                      setGroupPaymentDate(formatted);
                      if (errors.groupPaymentDate) setErrors({ ...errors, groupPaymentDate: '' });
                    }}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DD.MM.YYYY"
                    maxLength={10}
                  />
                  {errors.groupPaymentDate && <p className="text-red-400 text-sm mt-1">{errors.groupPaymentDate}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Online Payment Amount
                  </label>
                  <input
                    type="text"
                    value={groupOnlineAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setGroupOnlineAmount(value);
                    }}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter online amount (optional)"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Offline Payment Amount
                  </label>
                  <input
                    type="text"
                    value={groupOfflineAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setGroupOfflineAmount(value);
                    }}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter offline amount (optional)"
                  />
                </div>

                {parseInt(groupOnlineAmount) > 0 && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      UTR/UPI ID
                    </label>
                    <input
                      type="text"
                      value={groupUtrId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setGroupUtrId(value);
                        if (errors.groupUtrId) setErrors({ ...errors, groupUtrId: '' });
                      }}
                      className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 12-digit UTR/UPI ID"
                      maxLength={12}
                    />
                    {errors.groupUtrId && <p className="text-red-400 text-sm mt-1">{errors.groupUtrId}</p>}
                  </div>
                )}

                {parseInt(groupOfflineAmount) > 0 && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      value={groupReceiptNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setGroupReceiptNo(value);
                        if (errors.groupReceiptNo) setErrors({ ...errors, groupReceiptNo: '' });
                      }}
                      className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter receipt number"
                    />
                    {errors.groupReceiptNo && <p className="text-red-400 text-sm mt-1">{errors.groupReceiptNo}</p>}
                  </div>
                )}
              </div>
              {errors.groupAmount && <p className="text-red-400 text-sm mb-4">{errors.groupAmount}</p>}

              <button
                type="button"
                onClick={handleAddGroupPayment}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mb-4"
              >
                Add to Group Payment
              </button>

              {/* Group Payment List */}
              {groupPayments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Payment Entries:</h4>
                  {groupPayments.map((payment, index) => (
                    <div key={index} className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{payment.studentName}</p>
                          <p className="text-gray-400 text-sm">
                            {payment.onlineAmount > 0 && `Online: ₹${payment.onlineAmount} (UTR: ${payment.utrId})`}
                            {payment.onlineAmount > 0 && payment.offlineAmount > 0 && ' | '}
                            {payment.offlineAmount > 0 && `Offline: ₹${payment.offlineAmount} (Receipt: ${payment.receiptNo})`}
                          </p>
                          <p className="text-gray-400 text-sm">Date: {payment.paymentDate}</p>
                          <p className="text-green-400 text-sm font-medium">
                            Total: ₹{(payment.onlineAmount + payment.offlineAmount).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newGroupPayments = groupPayments.filter((_, i) => i !== index);
                            setGroupPayments(newGroupPayments);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
          >
            Add Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;