import React, { useState, useEffect, useRef  } from 'react';
import { ArrowLeft, User, Phone, Mail, GraduationCap, Calendar, DollarSign, CreditCard, Receipt, Users, Plus, X } from 'lucide-react';
import { AppData, Student, Payment } from '../types';
import { Dialog } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';
import { AlertTriangle } from 'lucide-react';

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
  const [paymentFieldsReadOnly, setPaymentFieldsReadOnly] = useState(false);
  
  const [groupRemainingAmount, setGroupRemainingAmount] = useState('');
  const [groupCourseName, setGroupCourseName] = useState('');
  const [groupCourseDuration, setGroupCourseDuration] = useState('');
  const studentNameRef = useRef<HTMLInputElement>(null);

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
  const groupInputRef = useRef<HTMLInputElement>(null);

  // Add state for tracking existing payments for validation
  const [existingPayments, setExistingPayments] = useState<{
    utrIds: Set<string>;
    receiptNos: Set<string>;
  }>({ utrIds: new Set(), receiptNos: new Set() });

  // Enhanced state for duplicate checking
  const [duplicateCheckModal, setDuplicateCheckModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    type: 'utr' | 'receipt';
    value: string;
    existingPayment: any;
    allGroupMembers: Array<{
      studentInfo: any;
      courseName: string;
      batchName: string;
      yearName: string;
    }>;
    paymentType: 'single' | 'group';
    totalStudentsInGroup: number;
  } | null>(null);

  // 🆕 NEW: Enhanced duplicate student modal
  const [duplicateStudentModal, setDuplicateStudentModal] = useState(false);
  const [duplicateStudentInfo, setDuplicateStudentInfo] = useState<{
    existingEnrollments: Array<{
      student: any;
      courseName: string;
      batchName: string;
      yearName: string;
      isActive: boolean;
      isSameCourse: boolean;
    }>;
    currentStudent: {
      name: string;
      fatherName: string;
      course: string;
      year: string;
    };
  } | null>(null);

  const [receiptCheckTimeout, setReceiptCheckTimeout] = useState(null);
  const handleSingleReceiptChange = (e) => {
  const value = e.target.value.replace(/\D/g, '');
  setReceiptNo(value);
  
  // Clear error if exists
  if (errors.receiptNo) setErrors({ ...errors, receiptNo: '' });
  
  // Clear previous timeout
  if (receiptCheckTimeout) {
    clearTimeout(receiptCheckTimeout);
  }
  
  // Set new timeout for duplicate check
  if (value.trim() !== "") {
    const timeoutId = setTimeout(() => {
      const duplicate = findDuplicatePaymentWithAllMembers(undefined, value.trim());
      if (duplicate) {
        setDuplicateInfo(duplicate);
        setDuplicateCheckModal(true);
        setReceiptNo('');
      }
    }, 1000); // 1 second delay
    
    setReceiptCheckTimeout(timeoutId);
  }
};
// Function add karo
const handleGroupReceiptChange = (e) => {
  const value = e.target.value.replace(/\D/g, '');
  setGroupReceiptNo(value);
  
  if (errors.groupReceiptNo) setErrors({ ...errors, groupReceiptNo: '' });
  
  // Clear previous timeout
  if (receiptCheckTimeout) {
    clearTimeout(receiptCheckTimeout);
  }
  
  // Set new timeout for duplicate check
  if (value.trim() !== "") {
    const timeoutId = setTimeout(() => {
      const duplicate = findDuplicatePaymentWithAllMembers(undefined, value.trim());
      if (duplicate) {
        setDuplicateInfo(duplicate);
        setDuplicateCheckModal(true);
        setReceiptNo('');
      }
    }, 1000);
    
    setReceiptCheckTimeout(timeoutId);
  }
};
// Cleanup useEffect
useEffect(() => {
  return () => {
    if (receiptCheckTimeout) {
      clearTimeout(receiptCheckTimeout);
    }
  };
}, [receiptCheckTimeout]);
  // Just add this useEffect in your component
useEffect(() => {
  if (duplicateCheckModal) {
    document.body.style.overflow = 'hidden';
    
    const blockAll = (e) => {
      const modal = e.target.closest('[data-duplicate-modal]');
      if (!modal) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    document.addEventListener('click', blockAll, true);
    document.addEventListener('keydown', blockAll, true);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('click', blockAll, true);
      document.removeEventListener('keydown', blockAll, true);
    };
  }
}, [duplicateCheckModal]);
// ✅ ENHANCED FUNCTION: Check for ALL student enrollments across ALL courses
const checkForAllStudentEnrollments = (studentName: string, fatherName: string) => {
  console.log("🔍 Checking for student across ALL courses:", { studentName, fatherName });
  
  const enrollments: Array<{
    student: any;
    courseName: string;
    batchName: string;
    yearName: string;
    isActive: boolean;
    isSameCourse: boolean;
  }> = [];

  const today = new Date();
  const normalizedStudentName = studentName.trim().toUpperCase();
  const normalizedFatherName = fatherName.trim().toUpperCase();

  // Search through ALL years, courses, and batches
  Object.entries(appData.years).forEach(([yearKey, yearData]) => {
    Object.entries(yearData).forEach(([courseKey, courseData]) => {
      Object.entries(courseData).forEach(([batchKey, batchData]) => {
        if (!Array.isArray(batchData.students)) return;

        batchData.students.forEach(student => {
          if (!student) return;

          const studentNameMatch = student.studentName.trim().toUpperCase() === normalizedStudentName;
          const fatherNameMatch = student.fatherName.trim().toUpperCase() === normalizedFatherName;

          if (studentNameMatch && fatherNameMatch) {
            // Check if course is still active
            let isActive = false;
            if (student.endDate) {
              const [day, month, year] = student.endDate.split('.');
              const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              isActive = endDate >= today;
            }

            const isSameCourse = courseKey === selectedCourse && yearKey === selectedYear;

            enrollments.push({
              student,
              courseName: courseKey,
              batchName: batchKey,
              yearName: yearKey,
              isActive,
              isSameCourse
            });

            console.log("✅ Found enrollment:", {
              course: courseKey,
              batch: batchKey,
              year: yearKey,
              isActive,
              isSameCourse,
              endDate: student.endDate
            });
          }
        });
      });
    });
  });

  return enrollments;
};

// ✅ GLOBAL PAYMENT DUPLICATE CHECK (across all courses)
const isPaymentDuplicateGlobal = (utrId?: string, receiptNo?: string) => {
  console.log("🔍 Checking global payment duplicates:", { utrId, receiptNo });
  
  // Search through ALL payments across ALL students
  for (const payment of (appData.payments || [])) {
    // Check UTR ID match
    if (utrId && payment.utrId === utrId.trim()) {
      console.log("❌ UTR ID already used:", utrId);
      return {
        isDuplicate: true,
        type: 'utr' as const,
        value: utrId,
        existingPayment: payment
      };
    }
    
    // Check Receipt Number match
    if (receiptNo && payment.receiptNo === receiptNo.trim()) {
      console.log("❌ Receipt Number already used:", receiptNo);
      return {
        isDuplicate: true,
        type: 'receipt' as const,
        value: receiptNo,
        existingPayment: payment
      };
    }
  }

  console.log("✅ No global payment duplicates found");
  return { isDuplicate: false };
};

// Add this function after your state declarations (around line 100)
const resetFormToCleanState = () => {
  console.log("🔄 Resetting form to clean state");
  
  // Calculate end date manually for reset
  let calculatedEndDate = '';
  if (preSelectedStartDate && preSelectedDuration) {
    const [day, month, year] = preSelectedStartDate.split('.');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const durationDays = parseInt(preSelectedDuration.replace(' Days', ''));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays - 1);
    
    const endDay = endDate.getDate().toString().padStart(2, '0');
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endYear = endDate.getFullYear();
    calculatedEndDate = `${endDay}.${endMonth}.${endYear}`;
  }

  // Reset form data
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

  // Clear payment fields
  setPayments([]);
  setPaymentAmount('');
  setPaymentDate('');
  setReceiptNo('');
  setUtrId('');
  setPaymentMode('offline');
  
  // Clear group payment fields
  setGroupPayments([]);
  setGroupStudentName('');
  setGroupOnlineAmount('');
  setGroupOfflineAmount('');
  setGroupUtrId('');
  setGroupReceiptNo('');
  setGroupPaymentDate('');
  setDynamicGroupEntries([]);
  setGroupCount(0);
  
  // Reset payment type
  setPaymentType('single');
  setPaymentFieldsReadOnly(false);
  
  // Clear errors
  setErrors({});
  
  // Clear college/branch inputs
  setNewCollegeName('');
  setNewBranch('');
  setShowNewCollegeInput(false);
  setShowNewBranchInput(false);

  // Focus on student name
  setTimeout(() => {
    if (studentNameRef.current) {
      studentNameRef.current.focus();
    }
  }, 100);
};
  
  // Get course fee based on selected course and duration
  const getCourseFee = () => {
    if (!appData.courseFees || !selectedCourse || !formData.courseDuration) return 0;
    
    const courseFee = appData.courseFees.find(fee => 
      fee.courseName === selectedCourse && 
      fee.courseDuration === formData.courseDuration
    );
    
    return courseFee ? courseFee.fee : 0;
  };

// Top of StudentForm.tsx component function me (props/state ke upar)
const paymentDateRef = useRef(null);

const validateGroupEntries = () => {
  for (let i = 0; i < dynamicGroupEntries.length; i++) {
    if (!dynamicGroupEntries[i].studentName?.trim()) {
      alert(`Student Name #${i + 1} cannot be blank`);
      document.getElementById(`studentName-${i}`).focus();
      return false;
    }
  }
  return true;
};

const [dateFocusedOnce, setDateFocusedOnce] = useState(false);

 // ✅ ENHANCED: Find ALL students who are part of the same group payment
  // ✅ ENHANCED: Find ALL students who are part of the same group payment
const findDuplicatePaymentWithAllMembers = (utrId?: string, receiptNo?: string) => {
  const allGroupMembers: Array<{
    studentInfo: any;
    courseName: string;
    batchName: string;
    yearName: string;
    existingPayment: any;
    isPaid: boolean;   // 🆕 Add paid/unpaid flag
  }> = [];

  let mainPayment: any = null;
  let firstMatchFound = false;

  // Search through all years, courses, batches, and students
  for (const [yearKey, yearData] of Object.entries(appData.years)) {
    for (const [courseKey, courseData] of Object.entries(yearData)) {
      for (const [batchKey, batchData] of Object.entries(courseData)) {
        if (!Array.isArray(batchData.students)) continue;

        for (const student of batchData.students) {
          if (!student) continue;

          const studentPayments = appData.payments?.filter(p => p.studentId === student.id) || [];
          
          for (const payment of studentPayments) {
            let isMatch = false;
            let matchType: 'utr' | 'receipt' = 'utr';

            if (utrId && payment.utrId === utrId) {
              isMatch = true;
              matchType = 'utr';
            }
            if (receiptNo && payment.receiptNo === receiptNo) {
              isMatch = true;
              matchType = 'receipt';
            }

            if (isMatch) {
              if (!firstMatchFound) {
                mainPayment = {
                  type: matchType,
                  value: matchType === 'utr' ? utrId : receiptNo,
                  existingPayment: payment,
                  paymentType: payment.type || 'single'
                };
                firstMatchFound = true;
              }

              const alreadyExists = allGroupMembers.some(m => m.studentInfo.id === student.id);
              if (!alreadyExists) {
                allGroupMembers.push({
                  studentInfo: student,
                  courseName: courseKey,
                  batchName: batchKey,
                  yearName: yearKey,
                  existingPayment: payment,
                  isPaid: (payment.amount || 0) > 0   // 🆕 mark as paid/unpaid
                });
              }

              // ✅ For group payments, find all members of same groupId
              if (payment.type === 'group' && payment.groupId) {
                const sameGroupPayments = appData.payments?.filter(
                  p => p.groupId === payment.groupId && p.studentId !== student.id
                ) || [];

                for (const groupPayment of sameGroupPayments) {
                  for (const [y, yData] of Object.entries(appData.years)) {
                    for (const [c, cData] of Object.entries(yData)) {
                      for (const [b, bData] of Object.entries(cData)) {
                        const groupStudent = Array.isArray(bData.students) 
                          ? bData.students.find(s => s && s.id === groupPayment.studentId)
                          : null;

                        if (groupStudent) {
                          const alreadyAdded = allGroupMembers.some(m => m.studentInfo.id === groupStudent.id);
                          if (!alreadyAdded) {
                            allGroupMembers.push({
                              studentInfo: groupStudent,
                              courseName: c,
                              batchName: b,
                              yearName: y,
                              existingPayment: groupPayment,
                              isPaid: (groupPayment.amount || 0) > 0
                            });
                          }
                          break;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (mainPayment && allGroupMembers.length > 0) {
    return {
      ...mainPayment,
      allGroupMembers,
      totalStudentsInGroup: allGroupMembers.length,
      studentInfo: allGroupMembers[0]?.studentInfo,
      courseName: allGroupMembers[0]?.courseName,
      batchName: allGroupMembers[0]?.batchName,
      yearName: allGroupMembers[0]?.yearName
    };
  }

  return null;
};


// 🆕 NEW FUNCTION: Check if current student has already paid with this UTR/Receipt
const hasCurrentStudentAlreadyPaid = (utrId?: string, receiptNo?: string) => {
  const currentStudentName = formData.studentName.trim().toUpperCase();
  const currentFatherName = formData.fatherName.trim().toUpperCase();
  
  console.log("🔍 Checking if current student already paid with:", { 
    utrId, 
    receiptNo, 
    currentStudentName, 
    currentFatherName 
  });
  
  // Search through all payments to find if current student used this payment method
  for (const [yearKey, yearData] of Object.entries(appData.years)) {
    for (const [courseKey, courseData] of Object.entries(yearData)) {
      for (const [batchKey, batchData] of Object.entries(courseData)) {
        // 🔧 FIX: Add safety check for students array
        if (!Array.isArray(batchData.students)) continue;
        
        for (const student of batchData.students) {
          if (!student) continue; // Safety check
          
          // Check if this is the same student (name + father name match)
          const isCurrentStudent = 
            student.studentName.trim().toUpperCase() === currentStudentName &&
            student.fatherName.trim().toUpperCase() === currentFatherName;
          
          if (isCurrentStudent) {
            // Check payments for this student
            const studentPayments = appData.payments?.filter(p => p.studentId === student.id) || [];
            
            for (const payment of studentPayments) {
              // Check if payment uses the same UTR/Receipt
              const usedSameUTR = utrId && payment.utrId === utrId.trim();
              const usedSameReceipt = receiptNo && payment.receiptNo === receiptNo.trim();
              
              if (usedSameUTR || usedSameReceipt) {
                console.log("❌ Current student already used this payment method:", {
                  student: student.studentName,
                  course: courseKey,
                  batch: batchKey,
                  year: yearKey,
                  payment: payment
                });
                
                return {
                  hasAlreadyPaid: true,
                  paymentType: usedSameUTR ? 'utr' : 'receipt',
                  paymentValue: usedSameUTR ? utrId : receiptNo,
                  existingPayment: payment,
                  studentInfo: student,
                  courseName: courseKey,
                  batchName: batchKey,
                  yearName: yearKey
                };
              }
            }
          }
        }
      }
    }
  }
  
  console.log("✅ Current student has not paid with this payment method");
  return { hasAlreadyPaid: false };
};

// ✅ ENHANCED FUNCTION: Handle duplicate student confirmation
const handleDuplicateStudentConfirmation = (action: 'proceed' | 'cancel') => {
  if (!duplicateStudentInfo) return;
  
  if (action === 'cancel') {
    console.log("🚫 User cancelled student enrollment");
    setDuplicateStudentModal(false);
    setDuplicateStudentInfo(null);
    
    // Reset form to clean state
    resetFormToCleanState();
    return;
  }
  
  if (action === 'proceed') {
    console.log("✅ User confirmed to proceed with enrollment");
    setDuplicateStudentModal(false);
    setDuplicateStudentInfo(null);
    
    // Continue with normal form submission process
    // The actual submission will be handled by the form submit
  }
};

// ✅ ADD THIS NEW HELPER FUNCTION RIGHT AFTER findDuplicatePayment:
const safeSetDynamicGroupEntries = (newEntries) => {
  try {
    console.log("🛡️ Safely setting group entries:", newEntries);
    
    // 🔧 SAFETY: Validate entries structure
    const validatedEntries = newEntries.map((entry, index) => ({
      studentName: entry?.studentName || (index === 0 ? formData.studentName.toUpperCase() : ''),
      amount: entry?.amount || '',
      onlineAmount: entry?.onlineAmount || '',
      offlineAmount: entry?.offlineAmount || '',
      utrId: entry?.utrId || '',
      receiptNo: entry?.receiptNo || '',
      paymentDate: entry?.paymentDate || ''
    }));
    
    setDynamicGroupEntries(validatedEntries);
    
    // Force a small delay to ensure React updates properly
    setTimeout(() => {
      console.log("✅ Group entries set successfully");
    }, 50);
  } catch (error) {
    console.error("❌ Error setting group entries:", error);
    // Fallback: create simple entries
    const fallbackEntries = Array.from({ length: newEntries.length || 1 }, (_, index) => ({
      studentName: index === 0 ? formData.studentName.toUpperCase() : '',
      amount: '',
      onlineAmount: '',
      offlineAmount: '',
      utrId: '',
      receiptNo: '',
      paymentDate: ''
    }));
    setDynamicGroupEntries(fallbackEntries);
  }
};

useEffect(() => {
  if (!dateFocusedOnce && dynamicGroupEntries.length > 0 && paymentType === "group") {
    setTimeout(() => {
      paymentDateRef.current?.focus();
      setDateFocusedOnce(true);
    }, 100);
  }
}, [dynamicGroupEntries.length, paymentType]);

// focus on student name
useEffect(() => {
  if (studentNameRef.current) {
    studentNameRef.current.focus();
  }
}, []);

useEffect(() => {
  // Current payments se existingPayments Set rebuild karo
  const newExistingPayments = {
    utrIds: new Set(),
    receiptNos: new Set()
  };
  
  // Individual payments se add karo
  payments.forEach(payment => {
    if (payment.paymentMode === 'online' && payment.utrId) {
      newExistingPayments.utrIds.add(payment.utrId);
    }
    if (payment.paymentMode === 'offline' && payment.receiptNo) {
      newExistingPayments.receiptNos.add(payment.receiptNo);
    }
  });
  
  // Group payments se add karo
  groupPayments.forEach(groupPayment => {
    if (groupPayment.utrId) {
      newExistingPayments.utrIds.add(groupPayment.utrId);
    }
    if (groupPayment.receiptNo) {
      newExistingPayments.receiptNos.add(groupPayment.receiptNo);
    }
  });
  
  setExistingPayments(newExistingPayments);
}, [payments, groupPayments]);

useEffect(() => {
  if (paymentType === 'single') {
    setPaymentMode('offline');
  } else if (paymentType === 'group') {
    setPaymentMode('offline');
  }
}, [paymentType]);

  // Update course fee when duration changes
  useEffect(() => {
    const fee = getCourseFee();
    setFormData(prev => ({
      ...prev,
      courseFee: fee,
      remainingFee: fee - prev.totalPaid
    }));
  }, [formData.courseDuration, selectedCourse, appData.courseFees]);

useEffect(() => {
  console.log("👀 Should Render Dynamic Group Inputs?");
  console.log("✅ paymentType:", paymentType);
  console.log("✅ groupCount:", groupCount);
  console.log("✅ dynamicGroupEntries.length:", dynamicGroupEntries.length);
}, [paymentType, groupCount, dynamicGroupEntries]);

useEffect(() => {
  console.log("👀 useEffect watching dynamicGroupEntries:", dynamicGroupEntries);
}, [dynamicGroupEntries]);

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

   useEffect(() => {
    if (paymentType === 'group') {
      setGroupCount(0);
      setShowGroupModal(true);
    }
  }, [paymentType]);

useEffect(() => {
  if (showGroupModal) {
    const timer = setTimeout(() => {
      if (groupInputRef.current) {
        groupInputRef.current.focus();
        groupInputRef.current.select();
      }
    }, 100);
    return () => clearTimeout(timer);
  }
}, [showGroupModal]);

 useEffect(() => {
    const totalGroupPayment =
      (parseInt(groupOnlineAmount || '0') || 0) +
      (parseInt(groupOfflineAmount || '0') || 0);

    setDynamicGroupEntries(prevEntries => {
      const updated = [...prevEntries];
      updated[0] = { ...updated[0], amount: '' };
      return updated;
    });
    
    setFormData(prev => ({
      ...prev,
      totalPaid: 0,
      remainingFee: prev.courseFee
    }));
  }, [groupOnlineAmount, groupOfflineAmount]);

  useEffect(() => {
    if (dynamicGroupEntries.length > 0 && formData.studentName) {
      const updated = [...dynamicGroupEntries];
      updated[0].studentName = formData.studentName.toUpperCase();
      setDynamicGroupEntries(updated);
    }
  }, [dynamicGroupEntries.length, formData.studentName]);

  useEffect(() => {
    if (showGroupModal) {
      const timer = setTimeout(() => {
        if (groupInputRef.current) {
          groupInputRef.current.focus();
          groupInputRef.current.select();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showGroupModal]);

  useEffect(() => {
  // Add safety check for dynamicGroupEntries
  if (dynamicGroupEntries.length > 0 && paymentType === 'group') {
    if (groupCount !== dynamicGroupEntries.length) {
      setGroupCount(dynamicGroupEntries.length);
      console.log("🔄 Updated group count to match entries:", dynamicGroupEntries.length);
    }
    
    // 🔧 SAFETY CHECK: Ensure first entry exists before accessing studentName
    if (dynamicGroupEntries[0] && formData.studentName) {
      const currentStudentName = formData.studentName.toUpperCase();
      
      // Check if the studentName property exists and is different
      if (dynamicGroupEntries[0].studentName !== currentStudentName) {
        const updatedEntries = [...dynamicGroupEntries];
        
        // 🔧 SAFETY: Ensure the entry object exists before updating
        if (updatedEntries[0]) {
          updatedEntries[0] = {
            ...updatedEntries[0],
            studentName: currentStudentName
          };
          setDynamicGroupEntries(updatedEntries);
          console.log("🔄 Synced Student #1 with form student name");
        }
      }
    }
  }
}, [dynamicGroupEntries.length, paymentType, formData.studentName, groupCount]);

  // ✅ ENHANCED: Handle duplicate with better group member management
const handleDuplicateConfirmation = (action: 'proceed' | 'cancel') => {
  if (!duplicateInfo) return;
  
  if (action === 'cancel') {
    console.log("🚫 User cancelled duplicate payment");
    setDuplicateCheckModal(false);
    setDuplicateInfo(null);
    setPaymentType('single');
    return;
  }
  
  if (action === 'proceed' && duplicateInfo.paymentType === 'group' && paymentType === 'group') {
    console.log("✅ Processing 'Add to Current Group' action");
    
    // 🆕 ENHANCED CHECK: Before adding to group, verify current student hasn't already paid
    const currentStudentCheck = hasCurrentStudentAlreadyPaid(
      duplicateInfo.type === 'utr' ? duplicateInfo.value : undefined,
      duplicateInfo.type === 'receipt' ? duplicateInfo.value : undefined
    );
    
    if (currentStudentCheck.hasAlreadyPaid) {
      console.log("❌ Current student already paid with this method, blocking operation");
      
      // 🔧 FIX: Close modal IMMEDIATELY before showing alert
      setDuplicateCheckModal(false);
      setDuplicateInfo(null);
      
      // Show detailed error message
      const errorMessage = `❌ PAYMENT ALREADY USED BY YOU!\n\n` +
        `Student: ${formData.studentName.toUpperCase()}\n` +
        `Father: ${formData.fatherName.toUpperCase()}\n\n` +
        `You have already paid using this ${currentStudentCheck.paymentType === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}: ${currentStudentCheck.paymentValue}\n\n` +
        `Previous Payment Details:\n` +
        `• Course: ${currentStudentCheck.courseName}\n` +
        `• Batch: ${currentStudentCheck.batchName}\n` +
        `• Year: ${currentStudentCheck.yearName}\n` +
        `• Amount: ₹${currentStudentCheck.existingPayment.amount?.toLocaleString()}\n` +
        `• Date: ${currentStudentCheck.existingPayment.paymentDate}\n\n` +
        `⚠️ You cannot use the same payment details twice. Please use a different ${currentStudentCheck.paymentType === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`;
      
      // 🔧 FIX: Use setTimeout to ensure modal closes before alert
      setTimeout(() => {
        alert(errorMessage);
        resetFormToCleanState();
      }, 100); // Small delay to ensure modal closes
      
      return;
    }
    
    console.log("✅ Student hasn't paid before, proceeding with group addition");
    
    // 🔧 FIX: Check if current student name matches any existing group members
    // ✅ To this:
const existingMember = duplicateInfo.allGroupMembers.find(member => 
  member.studentInfo.studentName.trim().toUpperCase() === formData.studentName.trim().toUpperCase()
  && member.isPaid === true
);
    
    if (existingMember) {
      console.log("✅ Found matching student in group, using their details");
      
      // Set the existing student as Student #1
      setFormData(prev => ({
        ...prev,
        studentName: existingMember.studentInfo.studentName,
        fatherName: existingMember.studentInfo.fatherName,
        gender: existingMember.studentInfo.gender,
        mobileNo: existingMember.studentInfo.mobileNo,
        email: existingMember.studentInfo.email,
        category: existingMember.studentInfo.category,
        hostler: existingMember.studentInfo.hostler,
        collegeName: existingMember.studentInfo.collegeName,
        branch: existingMember.studentInfo.branch
      }));
      
      // Pre-fill group payment details from existing payment
      const existingPayment = existingMember.existingPayment;
      if (existingPayment.onlineAmount > 0) {
        setGroupOnlineAmount(existingPayment.onlineAmount.toString());
        setGroupUtrId(existingPayment.utrId || '');
      }
      if (existingPayment.offlineAmount > 0) {
        setGroupOfflineAmount(existingPayment.offlineAmount.toString());
        setGroupReceiptNo(existingPayment.receiptNo || '');
      }
      setGroupPaymentDate(existingPayment.paymentDate || '');
      
      // Update group entries - Student #1 gets existing student info
      if (dynamicGroupEntries.length > 0) {
        const updatedEntries = [...dynamicGroupEntries];
        updatedEntries[0] = {
          ...updatedEntries[0],
          studentName: existingMember.studentInfo.studentName,
          amount: ''
        };
        setDynamicGroupEntries(updatedEntries);
      }
      
      // 🔧 FIX: Close modal BEFORE showing alert
      setDuplicateCheckModal(false);
      setDuplicateInfo(null);
      
      // 🔧 FIX: Use setTimeout for alert to ensure modal closes first
      setTimeout(() => {
        alert(`✅ ${existingMember.studentInfo.studentName} has been added to Student #1 position with existing payment details. Please enter the amount for this student.`);
      }, 100);
      
    } else {
      console.log("❌ Current student name doesn't match any group member");
      const unpaidMatch = duplicateInfo.allGroupMembers.find(member =>
    member.studentInfo.studentName.trim().toUpperCase() === formData.studentName.trim().toUpperCase()
    && member.isPaid === false
  );
       if (unpaidMatch) {
    // 🔧 FIX: Close modal BEFORE showing alert
    setDuplicateCheckModal(false);
    setDuplicateInfo(null);

    setTimeout(() => {
      alert(`⚠️ ${unpaidMatch.studentInfo.studentName} is an UNPAID group member.\n\n` +
        `This student exists in the group but has not made any payment yet.\n` +
        `Please record a payment before trying to link.`);
    }, 100);

  } 
     else {
    // 🚫 Student not in group at all
    setDuplicateCheckModal(false);
    setDuplicateInfo(null);

    setTimeout(() => {
      alert(`❌ STUDENT NOT IN GROUP!\n\n` +
        `Current Student: ${formData.studentName.toUpperCase()}\n` +
        `Father: ${formData.fatherName.toUpperCase()}\n\n` +
        `This student is not part of the existing group payment.\n` +
        `Group Members: ${duplicateInfo.allGroupMembers.map(m => m.studentInfo.studentName).join(', ')}\n\n` +
        `Please use a different payment method or verify the student details.`);
      resetFormToCleanState();
    }, 100);
  } 
      
      
    }
  }
};

  const handlePaymentTypeChange = (newPaymentType) => {
    if (paymentType !== newPaymentType) {
      
      if (paymentType === 'single' && newPaymentType === 'group') {
        setPaymentMode('');
        setPaymentAmount('');
        setPaymentDate('');
        setUtrId('');
        setReceiptNo('');
        
        const initialGroupEntries = [
          {
            studentName: formData.studentName.toUpperCase(),
            amount: ''
          },
          {
            studentName: '',
            amount: ''
          }
        ];
        setDynamicGroupEntries(initialGroupEntries);
        setGroupCount(2);
        
      } else if (paymentType === 'group' && newPaymentType === 'single') {
        setGroupPaymentDate('');
        setGroupOnlineAmount('');
        setGroupOfflineAmount('');
        setGroupUtrId('');
        setGroupReceiptNo('');
        setGroupPayments([]);
        setPaymentFieldsReadOnly(false);
        
        const resetEntries = [...dynamicGroupEntries];
        if (resetEntries.length > 0) {
          resetEntries[0].amount = '';
          for (let i = 1; i < resetEntries.length; i++) {
            resetEntries[i].studentName = '';
            resetEntries[i].amount = '';
          }
        }
        setDynamicGroupEntries(resetEntries);
        
        setFormData(prev => ({
          ...prev,
          totalPaid: 0,
          remainingFee: prev.courseFee
        }));
      }
    }
    
    setPaymentType(newPaymentType);
  };

 const handleGroupCountConfirm = () => {
  console.log("✅ Confirm button clicked");
  console.log("✅ groupCount =", groupCount);
  const value = groupInputRef.current?.value;
  const count = parseInt(value || '0');

  if (isNaN(count) || count <= 0) {
    alert('Please enter a valid number of students');
    return;
  }

  // 🔧 SAFETY: Create proper entry structure
  const entries = Array.from({ length: count }, (_, index) => ({
    studentName: index === 0 ? formData.studentName.toUpperCase() : '',
    amount: '',
    onlineAmount: '',
    offlineAmount: '',
    utrId: '',
    receiptNo: '',
    paymentDate: ''
  }));

  setDynamicGroupEntries(entries);
  setGroupCount(count);
  setShowGroupModal(false);
  setPaymentType('group');
};

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

  // Validate payment date
  if (!groupPaymentDate.trim()) {
    newErrors.groupPaymentDate = 'Payment date is required';
  } else if (groupPaymentDate.length !== 10 || !validateDate(groupPaymentDate)) {
    newErrors.groupPaymentDate = 'Please enter a valid date (DD.MM.YYYY)';
  }

  const onlineAmount = parseInt(groupOnlineAmount) || 0;
  const offlineAmount = parseInt(groupOfflineAmount) || 0;

  // Student 1 ka amount
const student1Amount = parseInt(dynamicGroupEntries[0].amount || '0');

// Baki students ka combined remaining amount (input field se liya hua)
const otherStudentsAmount = parseInt(groupRemainingAmount || '0'); 


  if (onlineAmount === 0 && offlineAmount === 0) {
    newErrors.groupAmount = 'At least one payment amount is required';
  }

  if (onlineAmount > 0 && !groupUtrId.trim()) {
    newErrors.groupUtrId = 'UTR/UPI ID is required for online payment';
  } else if (onlineAmount > 0 && groupUtrId.length !== 12) {
    newErrors.groupUtrId = 'UTR/UPI ID must be exactly 12 digits';
  }

  if (offlineAmount > 0 && !groupReceiptNo.trim()) {
    newErrors.groupReceiptNo = 'Receipt number is required for offline payment';
  }

  // Check for duplicate UTR/Receipt numbers
  const duplicateError = validatePaymentDuplicate(
    onlineAmount > 0 ? groupUtrId : undefined,
    offlineAmount > 0 ? groupReceiptNo : undefined
  );
  if (duplicateError) {
    if (onlineAmount > 0) newErrors.groupUtrId = duplicateError;
    if (offlineAmount > 0) newErrors.groupReceiptNo = duplicateError;
  }

  // Check student name fields
  const validStudents = dynamicGroupEntries
    .map((entry) => entry.studentName.trim())
    .filter((name) => name !== '');

  if (validStudents.length === 0) {
    newErrors.groupAmount = 'Please enter at least one student name';
  }

// ✅ Validate all student fields filled
dynamicGroupEntries.forEach((entry, idx) => {
  if (!entry.studentName?.trim()) {
    newErrors[`studentName_${idx}`] = `Student Name #${idx + 1} is required`;
  }
});

// Amount blank validation for Student 1
if (!dynamicGroupEntries[0].amount || parseInt(dynamicGroupEntries[0].amount) <= 0) {
  newErrors[`amount_0`] = 'Amount is required';
}


  // Check for blank student names
const emptyIndex = dynamicGroupEntries.findIndex(
  (entry) => !entry.studentName?.trim()
);
if (emptyIndex !== -1) {
  newErrors[`studentName_${emptyIndex}`] = `Student Name #${emptyIndex + 1} is required`;
}

  setErrors(newErrors);

 if (Object.keys(newErrors).length === 0) {
  const student1Name = dynamicGroupEntries[0].studentName;
  const student1Amount = parseInt(dynamicGroupEntries[0].amount || '0');

  // Ye wahi calculation jo tum input me use kar rahi ho
  const totalPayment = (onlineAmount || 0) + (offlineAmount || 0);
  const otherStudentsAmount = totalPayment - student1Amount;

  const otherStudents = dynamicGroupEntries
    .slice(1)
    .map((s) => s.studentName)
    .join(', ');

  const newGroupPayment = {
    studentName: student1Name,
    student1Amount,
    otherStudents,
    otherStudentsAmount,
    total: student1Amount + otherStudentsAmount,
    onlineAmount: onlineAmount,
    offlineAmount: offlineAmount,
    utrId: onlineAmount > 0 ? groupUtrId : undefined,
    receiptNo: offlineAmount > 0 ? groupReceiptNo : undefined,
    paymentDate: groupPaymentDate
  };

  setGroupPayments((prev) => [...prev, newGroupPayment]);

  
}

};

// 🆕 ENHANCED handleSubmit with comprehensive student and payment validation
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

  if (!paymentType) {
    newErrors.paymentType = "Please select a payment method (Single or Group)";
  } else {
    if (paymentType === "single" && payments.length === 0) {
      newErrors.paymentType = "Please add at least one payment before submitting";
    }
    if (paymentType === "group" && groupPayments.length === 0) {
      newErrors.paymentType = "Please add at least one group payment before submitting";
    }
  }

  // 🆕 ENHANCED: Student enrollment validation across ALL courses
  if (formData.studentName.trim() && formData.fatherName.trim()) {
    console.log("🔍 Starting comprehensive student enrollment check...");
    
    const allEnrollments = checkForAllStudentEnrollments(
      formData.studentName.trim(),
      formData.fatherName.trim()
    );

    console.log("🔍 Found enrollments:", allEnrollments);

    if (allEnrollments.length > 0) {
      // Group enrollments by type
      const sameCourseEnrollments = allEnrollments.filter(e => e.isSameCourse && e.isActive);
      const differentCourseEnrollments = allEnrollments.filter(e => !e.isSameCourse);

      // 🚫 BLOCK: Active enrollment in same course
      if (sameCourseEnrollments.length > 0) {
        const enrollment = sameCourseEnrollments[0];
        const errorMsg = `❌ DUPLICATE ENROLLMENT BLOCKED!\n\n` +
          `Student: ${formData.studentName.toUpperCase()}\n` +
          `Father: ${formData.fatherName.toUpperCase()}\n\n` +
          `Already enrolled in:\n` +
          `📚 Course: ${enrollment.courseName}\n` +
          `📅 Year: ${enrollment.yearName}\n` +
          `🎯 Batch: ${enrollment.batchName}\n` +
          `⏰ Course End Date: ${enrollment.student.endDate}\n\n` +
          `⚠️ Cannot enroll the same student in the same course while it's still active.`;

        alert(errorMsg);
        console.log("❌ Blocked: Same course active enrollment");
        return;
      }

      // 🟡 CONFIRM: Different course enrollments (allow but confirm)
      if (differentCourseEnrollments.length > 0) {
        const courseList = differentCourseEnrollments
          .map(e => `• ${e.courseName} (${e.yearName}) - ${e.isActive ? 'Active' : 'Completed'}`)
          .join('\n');

        const confirmMsg = `ℹ️ MULTIPLE COURSE ENROLLMENT\n\n` +
          `Student: ${formData.studentName.toUpperCase()}\n` +
          `Father: ${formData.fatherName.toUpperCase()}\n\n` +
          `Existing Enrollments:\n${courseList}\n\n` +
          `New Enrollment:\n• ${selectedCourse} (${selectedYear})\n\n` +
          `Do you want to proceed with enrolling this student in a different course?`;

        if (!confirm(confirmMsg)) {
          console.log("🚫 User cancelled different course enrollment");
          return;
        }

        console.log("✅ User confirmed different course enrollment");
      }
    }
  }

  // 🆕 ENHANCED: Global payment duplicate validation
  const currentPayments = [];
  if (paymentType === 'single') {
    payments.forEach(payment => {
      if (payment.utrId) currentPayments.push({ type: 'utr', value: payment.utrId });
      if (payment.receiptNo) currentPayments.push({ type: 'receipt', value: payment.receiptNo });
    });
  } else if (paymentType === 'group') {
    if (groupUtrId) currentPayments.push({ type: 'utr', value: groupUtrId });
    if (groupReceiptNo) currentPayments.push({ type: 'receipt', value: groupReceiptNo });
  }

 // Check each payment for global duplicates with GROUP MEMBER logics
for (const payment of currentPayments) {
  console.log("🔍 Checking payment for duplicates:", payment);
  
  const globalCheck = isPaymentDuplicateGlobal(
    payment.type === 'utr' ? payment.value : undefined,
    payment.type === 'receipt' ? payment.value : undefined
  );

  if (globalCheck.isDuplicate) {
    console.log("🔍 Duplicate found, checking if group member...", globalCheck);
    
    // 🆕 ENHANCED: Check if current student is a member of existing group
    const existingPayment = globalCheck.existingPayment;
    const currentStudentName = formData.studentName.trim().toUpperCase();
    const currentFatherName = formData.fatherName.trim().toUpperCase();
    
    // Check if existing payment is a group payment
    const isGroupPayment = existingPayment.type === 'group' && existingPayment.groupStudents;
    
    console.log("🔍 Is existing payment a group payment?", isGroupPayment);
    console.log("🔍 Current student:", currentStudentName);
    console.log("🔍 Current father:", currentFatherName);
    
    if (isGroupPayment) {
      // 🔍 GROUP PAYMENT: Check if current student is a member
      const existingGroupStudents = existingPayment.groupStudents || '';
      const existingStudentNames = existingGroupStudents
        .split(', ')
        .map(name => name.trim().toUpperCase())
        .filter(name => name.length > 0);
      
      const isStudentInGroup = existingStudentNames.includes(currentStudentName);
      
      console.log("🔍 Existing group students:", existingStudentNames);
      console.log("🔍 Is current student in group?", isStudentInGroup);
      
      if (isStudentInGroup) {
        // ✅ CURRENT STUDENT IS A GROUP MEMBER
        console.log("✅ Current student is a group member, checking paid/unpaid status");
        
        // Check if student is the paid student (the one who submitted the form)
        const paidStudentName = existingPayment.studentName?.trim().toUpperCase();
        const isPaidStudent = currentStudentName === paidStudentName;
        
        console.log("🔍 Paid student name:", paidStudentName);
        console.log("🔍 Is current student the paid student?", isPaidStudent);
        
        if (isPaidStudent) {
          // 🔍 PAID STUDENT: Check father name for exact match
          const existingFatherName = globalCheck.studentInfo?.fatherName?.trim().toUpperCase();
          const isFatherMatching = currentFatherName === existingFatherName;
          
          console.log("🔍 Existing father name:", existingFatherName);
          console.log("🔍 Father name matching?", isFatherMatching);
          
          if (isFatherMatching) {
            // 🚫 SAME PAID STUDENT - BLOCK DUPLICATE ENTRY
            const errorMsg = `❌ DUPLICATE ENTRY BLOCKED!\n\n` +
              `Student: ${formData.studentName.toUpperCase()}\n` +
              `Father: ${formData.fatherName.toUpperCase()}\n\n` +
              `This student has ALREADY PAID using this ${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}: ${payment.value}\n\n` +
              `Previous Payment Details:\n` +
              `• Course: ${globalCheck.courseName || 'N/A'}\n` +
              `• Batch: ${globalCheck.batchName || 'N/A'}\n` +
              `• Year: ${globalCheck.yearName || 'N/A'}\n` +
              `• Amount: ₹${existingPayment.amount?.toLocaleString() || 'N/A'}\n` +
              `• Date: ${existingPayment.paymentDate || 'N/A'}\n\n` +
              `⚠️ You cannot create duplicate entries for the same student.`;

            alert(errorMsg);
            console.log("❌ Blocked: Same paid student trying to re-enter");
            return;
          } else {
            // 🚫 SAME NAME BUT DIFFERENT FATHER - BLOCK
            const errorMsg = `❌ FATHER NAME MISMATCH!\n\n` +
              `Student Name: ${formData.studentName.toUpperCase()}\n` +
              `This student name already exists in the group payment but with different father name.\n\n` +
              `Expected Father: ${globalCheck.studentInfo?.fatherName || 'N/A'}\n` +
              `You Entered: ${formData.fatherName.toUpperCase()}\n\n` +
              `Father names don't match. This cannot be the same person.\n` +
              `Please verify the details or use different ${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`;

            alert(errorMsg);
            console.log("❌ Blocked: Same name but different father");
            return;
          }
        } else {
          // ✅ UNPAID GROUP MEMBER - ALLOW ENROLLMENT
          console.log("✅ Current student is unpaid group member - allowing enrollment");
          
          // Show confirmation message for unpaid member
          const confirmMsg = `✅ GROUP MEMBER DETECTED!\n\n` +
            `Student: ${formData.studentName.toUpperCase()}\n` +
            `Group Members: ${existingGroupStudents}\n\n` +
            `This student is an UNPAID member of existing group payment.\n` +
            `Using ${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}: ${payment.value}\n\n` +
            `✅ This is allowed for group payments.\n` +
            `Continue with enrollment?`;
          
          if (!confirm(confirmMsg)) {
            console.log("🚫 User cancelled unpaid member enrollment");
            return;
          }
          
          console.log("✅ User confirmed unpaid member enrollment - proceeding");
          // Continue with enrollment (don't return, let the process continue)
        }
      } else {
        // 🚫 NOT A GROUP MEMBER - BLOCK
        const errorMsg = `❌ PAYMENT ALREADY USED!\n\n` +
          `${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}: ${payment.value}\n\n` +
          `This payment method has already been used by a GROUP:\n` +
          `"${existingGroupStudents}"\n\n` +
          `But "${formData.studentName.toUpperCase()}" is NOT a member of this group.\n\n` +
          `Please use a different ${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`;

        alert(errorMsg);
        console.log("❌ Blocked: Not a group member");
        return;
      }
    } else {
      // 🚫 SINGLE PAYMENT - BLOCK (existing behavior)
      const errorMsg = `❌ DUPLICATE PAYMENT DETECTED!\n\n` +
        `${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}: ${payment.value}\n\n` +
        `This payment method has already been used by another student.\n` +
        `Please use a different ${payment.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`;

      alert(errorMsg);
      console.log("❌ Blocked: Single payment duplicate");
      return;
    }
  } else {
    console.log("✅ No duplicate found for payment:", payment);
  }
}


  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    console.log("✅ All validations passed, proceeding with enrollment");

    const student: Student = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    // Add student to batch
    onAddStudent(selectedYear, selectedCourse, selectedBatch, student);

    // Add payments
    if (paymentType === 'single') {
      payments.forEach(payment => {
        onAddPayment(student.id, {
          ...payment,
          paymentDate: payment.paymentDate,
          type: 'single'
        });
      });
    }

    if (paymentType === 'group' && dynamicGroupEntries.length > 0) {
      const groupId = `group_${Date.now()}`;
      const totalOnlineAmount = parseInt(groupOnlineAmount || '0');
      const totalOfflineAmount = parseInt(groupOfflineAmount || '0');
      const mainStudentAmount = parseInt(dynamicGroupEntries[0]?.amount || '0');

      // Update main student's payment info
      student.totalPaid = mainStudentAmount;
      student.remainingFee = student.courseFee - mainStudentAmount;

      // Create group payment entry
      onAddPayment(student.id, {
        groupId,
        studentName: student.studentName,
        amount: mainStudentAmount,
        totalGroupAmount: totalOnlineAmount + totalOfflineAmount,
        onlineAmount: totalOnlineAmount,
        offlineAmount: totalOfflineAmount,
        utrId: totalOnlineAmount > 0 ? groupUtrId : '',
        receiptNo: totalOfflineAmount > 0 ? groupReceiptNo : '',
        paymentDate: groupPaymentDate,
        type: 'group',
        groupStudents: dynamicGroupEntries.map(e => e.studentName).join(', '),
        studentIndex: 0
      });
    }
    
    // Calculate end date manually after reset
    let calculatedEndDate = '';
    if (preSelectedStartDate && preSelectedDuration) {
      const [day, month, year] = preSelectedStartDate.split('.');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const durationDays = parseInt(preSelectedDuration.replace(' Days', ''));

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays - 1);

      const endDay = endDate.getDate().toString().padStart(2, '0');
      const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
      const endYear = endDate.getFullYear();
      calculatedEndDate = `${endDay}.${endMonth}.${endYear}`;
    }

    // Reset form
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

    // Clear all payment fields
    setPayments([]);
    setPaymentAmount('');
    setPaymentDate('');
    setReceiptNo('');
    setUtrId('');
    setGroupPayments([]);
    setPaymentType('single');
    setGroupStudentName('');
    setGroupCourseName('');
    setGroupCourseDuration('');
    setGroupOnlineAmount('');
    setGroupOfflineAmount('');
    setGroupUtrId('');
    setGroupReceiptNo('');
    setGroupPaymentDate('');
    setDynamicGroupEntries([]);
    setPaymentFieldsReadOnly(false);

    // Focus on Student Name after adding
    if (studentNameRef.current) {
      studentNameRef.current.focus();
    }

    alert('✅ Student enrolled successfully!');
    console.log("✅ Enrollment completed successfully");
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

  console.log("📦 Should Render Group Section?", {
    paymentType,
    groupCount,
    entries: dynamicGroupEntries.length
  });

  return (
    <div className="min-h-screen p-6">
      {/* Group Modal */}
      <Dialog 
        open={showGroupModal} 
        onClose={() => setShowGroupModal(false)} 
        className="fixed z-50 inset-0 flex items-center justify-center"
      >
        <div className="bg-black bg-opacity-50 fixed inset-0"></div>
        <Dialog.Panel className="bg-slate-800 border border-blue-500/30 rounded-xl p-8 z-50 w-full max-w-md mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-400" />
            <Dialog.Title className="text-xl font-bold text-white">
              Group Payment Setup
            </Dialog.Title>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                How many students will be in this group payment?
              </label>
              <input
                type="number"
                ref={groupInputRef}
                min={1}
                max={20}
                value={groupCount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setGroupCount(0);
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 20) {
                      setGroupCount(num);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGroupCountConfirm();
                  }
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 3"
              />
              <p className="text-gray-400 text-sm mt-2">
                💡 Minimum: 1, Maximum: 20 students
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={() => {
                setShowGroupModal(false);
                setPaymentType('single');
              }} 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type='button'
              onClick={handleGroupCountConfirm}
              disabled={!groupCount || groupCount < 1}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

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
                ref={studentNameRef}
                type="text"
                value={formData.studentName}
                onChange={(e) => {
                  const nameValue = e.target.value.toUpperCase();

                  // Update personal info name
                  setFormData({ ...formData, studentName: nameValue });

                  // Auto-fill Group Payment first student name
                  setDynamicGroupEntries((prev) => {
                    if (!prev.length) return prev;
                    
                    if (!prev[0]) {
                      console.warn("⚠️ First group entry is undefined, creating new entry");
                      return [{
                        studentName: nameValue,
                        amount: '',
                        onlineAmount: '',
                        offlineAmount: '',
                        utrId: '',
                        receiptNo: '',
                        paymentDate: ''
                      }, ...prev.slice(1)];
                    }
                    
                    const updated = [...prev];
                    updated[0] = { ...updated[0], studentName: nameValue };
                    return updated;
                  });

                  if (errors.studentName) {
                    setErrors({ ...errors, studentName: '' });
                  }
                }}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student name"
              />
              {errors.studentName && (
                <p className="text-red-400 text-sm mt-1">{errors.studentName}</p>
              )}
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
                  onChange={(e) => {
                    if (paymentType === 'group') {
                      setGroupPaymentDate('');
                      setGroupOnlineAmount('');
                      setGroupOfflineAmount('');
                      setGroupUtrId('');
                      setGroupReceiptNo('');
                      setGroupPayments([]);
                      setPaymentFieldsReadOnly(false);
                      setGroupStudentName('');
                      setDynamicGroupEntries([]);
                      setGroupCount(2);
                      
                      setFormData(prev => ({
                        ...prev,
                        totalPaid: 0,
                        remainingFee: prev.courseFee
                      }));
                      
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        Object.keys(newErrors).forEach(key => {
                          if (key.startsWith('group') || key.startsWith('studentName_') || key.startsWith('amount_')) {
                            delete newErrors[key];
                          }
                        });
                        return newErrors;
                      });
                    }
                    
                    setPaymentType(e.target.value as 'single' | 'group')
                  }}
                  className="text-blue-500"
                />
                <span className="text-white">Single Payment</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="group"
                  checked={paymentType === 'group'}
                  onChange={(e) => {
                    if (paymentType === 'single') {
                      setPaymentMode('');
                      setPaymentAmount('');
                      setPaymentDate('');
                      setUtrId('');
                      setReceiptNo('');
                      
                      setErrors(prev => ({
                        ...prev,
                        paymentMode: '',
                        paymentAmount: '',
                        paymentDate: '',
                        utrId: '',
                        receiptNo: ''
                      }));
                    }
                    
                    setPaymentType('group');
                    setShowGroupModal(true);

                    // Clear previous group data
                    setGroupStudentName('');
                    setGroupOnlineAmount('');
                    setGroupOfflineAmount('');
                    setGroupUtrId('');
                    setGroupReceiptNo('');
                    setGroupPaymentDate('');
                    setGroupPayments([]);
                    setDynamicGroupEntries([]);
                    setErrors({});
                  }}
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
  onChange={handleSingleReceiptChange} // Yeh new function use karo
  // onBlur ko remove kar do
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
                          
                          if (value.length === 12) {
                            const duplicate = findDuplicatePaymentWithAllMembers(value, undefined);
                            if (duplicate) {
                              setDuplicateInfo(duplicate);
                              setDuplicateCheckModal(true);
                              setUtrId('');
                              return;
                            }
                          }
                          
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
                {errors.paymentType && (
                  <p className="text-red-400 text-sm mt-2">{errors.paymentType}</p>
                )}
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

              {/* Group Payment Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-blue-300 text-sm">Course Fee</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{formData.courseFee?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <p className="text-green-300 text-sm">Total Paid</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{formData.totalPaid?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-500/30">
                  <p className="text-orange-300 text-sm">Remaining</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{formData.remainingFee?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <p className="text-purple-300 text-sm">Total Group Payment</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{(
                      parseInt(groupOnlineAmount || "0") +
                      parseInt(groupOfflineAmount || "0")
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Group Payment Summary */}
              {groupPayments.length > 0 && (
                <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">Group Payment Summary</h4>

                  <div className="text-right mb-2">
                    <span className="text-2xl font-bold text-white">
                      Total: ₹
                      {groupPayments.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    {groupPayments.map((payment, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center text-blue-200">
                          <span>{payment.studentName}</span>
                          <span>₹{payment.student1Amount.toLocaleString()}</span>
                        </div>

                        {payment.otherStudents && (
                          <div className="flex justify-between items-center text-blue-200">
                            <span>{payment.otherStudents}</span>
                            <span>₹{payment.otherStudentsAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simplified Group Payment Form */}
              <div className="w-full space-y-6">
                {dynamicGroupEntries.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                      {/* Payment Date */}
                      <div className="flex-1 min-w-[200px]">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Payment Date *
                          </label>
                          <input
                            type="text"
                            ref={paymentDateRef}
                            value={groupPaymentDate}
                            readOnly={paymentFieldsReadOnly}
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
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Online Payment Amount
                          </label>
                          <input
                            type="text"
                            value={groupOnlineAmount}
                            readOnly={paymentFieldsReadOnly}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setGroupOnlineAmount(value);
                              if (parseInt(value || '0') > 0 || parseInt(groupOfflineAmount || '0') > 0) {
                                setErrors(prev => ({ ...prev, groupAmount: '' }));
                              }
                            }}
                            className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter online amount (optional)"
                          />
                          {errors.groupAmount && !groupOnlineAmount && !groupOfflineAmount && (
                            <p className="text-red-400 text-sm mt-1">{errors.groupAmount}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Offline Payment Amount
                          </label>
                          <input
                            type="text"
                            value={groupOfflineAmount}
                            readOnly={paymentFieldsReadOnly}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setGroupOfflineAmount(value);
                            }}
                            className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter offline amount (optional)"
                          />
                        </div>
                      </div>
<div className="flex-1 min-w-[200px]"></div>
                      <div className="flex-1 min-w-[200px]">
                        {parseInt(groupOnlineAmount) > 0 && (
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              UTR/UPI ID
                            </label>
                            <input
                              type="text"
                              value={groupUtrId}
                              readOnly={paymentFieldsReadOnly}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                setGroupUtrId(value);
                                
                                if (value.length === 12) {
                                  const duplicate = findDuplicatePaymentWithAllMembers(value, undefined);
                                  if (duplicate) {
                                    setDuplicateInfo(duplicate);
                                    setDuplicateCheckModal(true);
                                    if (duplicate.paymentType === 'single') {
                                      setGroupUtrId('');
                                    }
                                    return;
                                  }
                                }
                                
                                if (errors.groupUtrId) setErrors({ ...errors, groupUtrId: '' });
                              }}
                              className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter 12-digit UTR/UPI ID"
                              maxLength={12}
                            />
                            {errors.groupUtrId && <p className="text-red-400 text-sm mt-1">{errors.groupUtrId}</p>}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        {parseInt(groupOfflineAmount) > 0 && (
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Receipt Number
                            </label>
                            <input
                              type="text"
                              value={groupReceiptNo}
                              readOnly={paymentFieldsReadOnly}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setGroupReceiptNo(value);
                                if (errors.groupReceiptNo) setErrors({ ...errors, groupReceiptNo: '' });
                              }}
                              onBlur={() => {
                                if (groupReceiptNo.trim() !== "") {
                                  const duplicate = findDuplicatePaymentWithAllMembers(undefined, groupReceiptNo.trim());
                                  if (duplicate) {
                                    setDuplicateInfo(duplicate);
                                    setDuplicateCheckModal(true);
                                    setReceiptNo('');
                                  }
                                  return;
                                }
                              }}
                              className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter receipt number"
                            />
                            {errors.groupReceiptNo && <p className="text-red-400 text-sm mt-1">{errors.groupReceiptNo}</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Group Student Names *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Box 1: Primary Student */}
                      <div className="bg-slate-900 p-4 rounded-lg space-y-3 shadow-lg">
                        <input
                          type="text"
                          readOnly
                          value={dynamicGroupEntries[0]?.studentName || ''}
                          placeholder={`Student Name #1`}
                          className="w-full p-3 bg-gray-800 border border-white/30 rounded-lg text-white"
                        />
                        {errors[`studentName_0`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`studentName_0`]}</p>
                        )}

                        <label className="text-sm text-white">Amount</label>
                        <input
                          type="text"
                          placeholder="Enter amount"
                          value={dynamicGroupEntries[0]?.amount || ''}
                          disabled={
                            (parseInt(groupOnlineAmount || '0') + parseInt(groupOfflineAmount || '0')) === 0
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const amountNum = parseInt(value || '0');
                            const totalGroupPayment =
                              (parseInt(groupOnlineAmount || '0') || 0) +
                              (parseInt(groupOfflineAmount || '0') || 0);

                            if (amountNum > formData.courseFee) {
                              alert(`Amount cannot be more than ₹${formData.courseFee.toLocaleString()}`);
                              return;
                            }

                            if (amountNum > totalGroupPayment) {
                              alert(`Amount cannot be more than total group payment ₹${totalGroupPayment.toLocaleString()}`);
                              return;
                            }

                            setErrors(prev => ({ ...prev, [`amount_0`]: '' }));

                            const updatedEntries = [...dynamicGroupEntries];
                            if (!updatedEntries[0]) {
                              updatedEntries[0] = {
                                studentName: formData.studentName.toUpperCase(),
                                amount: '',
                                onlineAmount: '',
                                offlineAmount: '',
                                utrId: '',
                                receiptNo: '',
                                paymentDate: ''
                              };
                            }
                            updatedEntries[0] = { ...updatedEntries[0], amount: value };
                            setDynamicGroupEntries(updatedEntries);

                            const totalPaid = updatedEntries.reduce(
                              (sum, entry) => sum + parseInt(entry?.amount || '0'),
                              0
                            );

                            setFormData((prev) => ({
                              ...prev,
                              totalPaid: totalPaid,
                              remainingFee: prev.courseFee - totalPaid < 0 ? 0 : prev.courseFee - totalPaid
                            }));
                          }}
                          className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white"
                        />
                        {errors[`amount_0`] && (
                          <p className="text-red-400 text-sm">{errors[`amount_0`]}</p>
                        )}
                      </div>

                      {/* Box 2: Other Students */}
                      <div className="bg-slate-900 p-4 rounded-lg space-y-2 shadow-lg">
                        <div className="flex flex-wrap gap-2">
                          {dynamicGroupEntries.slice(1).map((entry, index) => (
                            <div key={index + 1} className="flex-1 min-w-[120px]">
                              <input
                                id={`studentName-${index + 1}`}
                                type="text"
                                readOnly={paymentFieldsReadOnly}
                                onChange={(e) => {
                                  const updated = [...dynamicGroupEntries];
                                  
                                  if (!updated[index + 1]) {
                                    updated[index + 1] = {
                                      studentName: '',
                                      amount: '',
                                      onlineAmount: '',
                                      offlineAmount: '',
                                      utrId: '',
                                      receiptNo: '',
                                      paymentDate: ''
                                    };
                                  }
                                  
                                  updated[index + 1] = {
                                    ...updated[index + 1],
                                    studentName: e.target.value.toUpperCase()
                                  };
                                  setDynamicGroupEntries(updated);

                                  setErrors(prev => ({ ...prev, [`studentName_${index + 1}`]: '' }));
                                }}
                                value={entry?.studentName || ''}
                                className="w-full p-3 bg-gray-800 border border-white/30 rounded-lg text-white"
                                placeholder={`Student Name #${index + 2}`}
                              />

                              {errors[`studentName_${index + 1}`] && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors[`studentName_${index + 1}`]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        <label className="text-sm text-white mt-4 block">Remaining Amount</label>
                        <input
                          type="text"
                          readOnly
                          value={
                            (() => {
                              const total =
                                parseInt(groupOnlineAmount || '0') + parseInt(groupOfflineAmount || '0');
                              const firstAmount = parseInt(dynamicGroupEntries[0]?.amount || '0');
                              return total - firstAmount > 0 ? total - firstAmount : '';
                            })()
                          }
                          className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white"
                          placeholder="Auto-filled remaining"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddGroupPayment}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mb-4"
                >
                  Add to Group Payment
                </button>
                {errors.paymentType && (
                  <p className="text-red-400 text-sm mt-2">{errors.paymentType}</p>
                )}

                {/* Group Payment List */}
                {groupPayments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Payment Entries:</h4>
                    {groupPayments.map((payment, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">
                              {dynamicGroupEntries.map(s => s.studentName).join(', ')}
                            </p>
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
              </div>
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

      {/* Enhanced Duplicate Check Modal */}
      <Dialog 
        open={duplicateCheckModal} 
        onClose={() => {
          console.log("🔥 Dialog onClose triggered - treating as cancel");
          
          if (!duplicateInfo) return;
          
          // Clear payment fields on close
          if (paymentType === 'single') {
            if (duplicateInfo.type === 'utr') {
              setUtrId('');
            } else if (duplicateInfo.type === 'receipt') {
              setReceiptNo('');
            }
          } else if (paymentType === 'group') {
            if (duplicateInfo.type === 'utr') {
              setGroupUtrId('');
              setGroupOnlineAmount('');
            } else if (duplicateInfo.type === 'receipt') {
              setGroupReceiptNo('');
              setGroupOfflineAmount('');
            }
          }
          
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
        }} 
        className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="bg-black bg-opacity-50 fixed inset-0"></div>
        <Dialog.Panel className="bg-slate-800 border border-red-500/30 rounded-lg p-6 z-50 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <Dialog.Title className="text-xl font-bold text-red-400">
              Duplicate Payment Detected!
            </Dialog.Title>
          </div>
          
          {duplicateInfo && (
            <div className="space-y-6 mb-6">
              {/* Enhanced: Show ALL Group Members */}
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Existing Group Members ({duplicateInfo.totalStudentsInGroup})
                </h3>
                
                {/* Show all group members in a grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {duplicateInfo.allGroupMembers.map((member, index) => (
                    <div key={member.studentInfo.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-medium text-sm">Student #{index + 1}</span>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-xs">Student Name</p>
                          <p className="text-white font-medium text-sm">{member.studentInfo.studentName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Father's Name</p>
                          <p className="text-white text-sm">{member.studentInfo.fatherName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Mobile Number</p>
                          <p className="text-white text-sm">{member.studentInfo.mobileNo}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Course Location</p>
                          <p className="text-white text-sm">{member.courseName} • {member.batchName} • {member.yearName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Course Duration</p>
                          <p className="text-white text-sm">{member.studentInfo.courseDuration}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Course Dates</p>
                          <p className="text-white text-sm">{member.studentInfo.startDate} to {member.studentInfo.endDate}</p>
                        </div>
                        
                        {/* Show individual payment details */}
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-xs">Payment Details</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Course Fee:</span>
                              <span className="text-white">₹{member.studentInfo.courseFee?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Individual Amount:</span>
                              <span className="text-green-400 font-medium">₹{member.existingPayment.amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Remaining:</span>
                              <span className="text-orange-400">₹{member.studentInfo.remainingFee?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  Duplicate Payment Information
                </h3>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    {duplicateInfo.type === 'utr' ? (
                      <CreditCard className="w-4 h-4 text-red-400" />
                    ) : (
                      <Receipt className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-medium text-red-300">
                      {duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}: {duplicateInfo.value}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">Payment Type</p>
                        <p className="text-white font-medium">
                          {duplicateInfo.paymentType === 'single' ? '💵 Single Payment' : '👥 Group Payment'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment Date</p>
                        <p className="text-white">{duplicateInfo.existingPayment.paymentDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment Mode</p>
                        <p className="text-white">
                          {duplicateInfo.existingPayment.onlineAmount > 0 && duplicateInfo.existingPayment.offlineAmount > 0
                            ? '💳 Online + 💵 Offline'
                            : duplicateInfo.existingPayment.onlineAmount > 0
                            ? '💳 Online'
                            : '💵 Offline'
                          }
                        </p>
                      </div>
                    </div>
                  <div className="space-y-1 text-sm">
  <p className="text-yellow-400 font-bold text-lg">
    Individual Paid Student:
  </p>

  {/* ✅ Single or Group both handled */}
 {duplicateInfo.paymentType === 'single' ? (
  <div className="flex justify-between">
    <span className="text-gray-300 truncate mr-2">
      {duplicateInfo.existingPayment.studentName ||
       duplicateInfo.studentInfo?.studentName ||
       duplicateInfo.existingPayment.studentInfo?.studentName ||
       'Unknown Student'}:
    </span>
    <span className="text-green-400 font-medium">
      ₹{duplicateInfo.existingPayment.amount?.toLocaleString()}
    </span>
  </div>
) : (
  duplicateInfo.allGroupMembers.map((member) => (
    <div
      key={member.studentInfo.id}
      className="flex justify-between"
    >
      <span className="text-gray-300 truncate mr-2">
        {member.studentInfo.studentName}:
      </span>
      <span className="text-green-400 font-medium">
        ₹{member.existingPayment.amount?.toLocaleString()}
      </span>
    </div>
  ))
)}

  {/* ✅ Only show unpaid members if group */}
  {duplicateInfo.paymentType === 'group' && (() => {
    const existingPaymentMembers = duplicateInfo.allGroupMembers || [];
    const currentPaidMemberNames = existingPaymentMembers.map(m => m.studentInfo.studentName.trim());
    const allMembers = duplicateInfo.existingPayment.groupStudents
      ? duplicateInfo.existingPayment.groupStudents.split(', ').map(name => name.trim())
      : [];
    const unpaidMembers = allMembers.filter(m => !currentPaidMemberNames.includes(m));

    const actualTotal = duplicateInfo.existingPayment.totalGroupAmount || 0;
    const actualPaid = existingPaymentMembers.reduce((sum, m) => sum + (m.existingPayment.amount || 0), 0);
    const remaining = actualTotal - actualPaid;

    if (unpaidMembers.length > 0 && remaining > 0) {
      return (
        <div className="mt-3 pt-3 border-t border-gray-700 text-sm">
          <p className="text-yellow-400 font-bold text-lg mb-1">Other Members:</p>
          <div className="flex justify-between items-center">
            <span className="text-blue-200">{unpaidMembers.join(', ')}</span>
            <span className="text-orange-400 font-medium">
              ₹{remaining.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  })()}
</div>

{/* ✅ Footer payment amount */}
<div className="mt-1 pt-3 border-t border-gray-700 text-sm">
 
</div>


              <div className="space-y-2">
                {/*    <div>
                  <p className="text-gray-400 text-sm">Total Group Payment</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ₹{duplicateInfo.existingPayment.totalGroupAmount?.toLocaleString()}
                  </p>
                </div>*/}
                
                {/* ✅ Show breakdown by member */}
                
                 



                {/* ✅ Footer payment amounts */}
<div className="mt-1 pt-3 border-t border-gray-700 text-sm">
  <span className="text-purple-400 font-bold text-lg mb-1">
    {duplicateInfo.paymentType === 'single'
      ? 'Single Payment:'
      : 'Total Group Payment:'}
  </span>
  <span className="float-right text-purple-400 font-bold">
    ₹{duplicateInfo.existingPayment.totalGroupAmount?.toLocaleString() ||
      duplicateInfo.existingPayment.amount?.toLocaleString()}
  </span>
</div>

                                

                {/* Online/Offline breakdown */}
                <div className="text-sm space-y-1 mt-2 pt-2 border-t border-gray-600">
                  {duplicateInfo.existingPayment.onlineAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">💳 Total Online:</span>
                      <span className="text-white">₹{duplicateInfo.existingPayment.onlineAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {duplicateInfo.existingPayment.offlineAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">💵 Total Offline:</span>
                      <span className="text-white">₹{duplicateInfo.existingPayment.offlineAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {duplicateInfo.existingPayment.utrId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">UTR ID:</span>
                      <span className="text-white font-mono">{duplicateInfo.existingPayment.utrId}</span>
                    </div>
                  )}
                  {duplicateInfo.existingPayment.receiptNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Receipt No:</span>
                      <span className="text-white font-mono">{duplicateInfo.existingPayment.receiptNo}</span>
                    </div>
                  )}
                  {duplicateInfo.paymentType === 'group' && duplicateInfo.existingPayment.groupStudents && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <p className="text-gray-400 text-sm mb-2">Group Members</p>
                <div className="flex flex-wrap gap-2">
                  {duplicateInfo.existingPayment.groupStudents.split(', ').map((student, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                      {student}
                    </span>
                  ))}
                </div>
              </div>
            )}
                  
                </div>
              </div>
            </div>
           
          </div>
        </div>

              {/* Action Message */}
              {duplicateInfo.paymentType === 'single' || paymentType === 'single' ? (
                <div className="text-yellow-300 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <strong>Cannot Proceed</strong>
                  </div>
                  <p>This {duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} has already been used for a payment. 
                  Duplicate payment IDs are not allowed to maintain data integrity.</p>
                </div>
              ) : (
                <div className="text-blue-300 text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <strong>Group Payment Option Available</strong>
                  </div>
                  <p>Since both payments are group payments, you can add your current student to this existing group if they are a member. 
                  The existing payment details will be pre-filled, but you'll need to enter the amount for your student.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => {
                console.log("🔥 DIRECT Cancel button clicked");
                
                if (!duplicateInfo) {
                  console.log("❌ No duplicateInfo found, returning");
                  return;
                }
                
                console.log("🚫 CANCEL ACTION - clearing payment fields");
                
                // Clear payment fields based on payment type and duplicate type
                if (paymentType === 'single') {
                  if (duplicateInfo.type === 'utr') {
                    setUtrId('');
                  } else if (duplicateInfo.type === 'receipt') {
                    setReceiptNo('');
                  }
                } else if (paymentType === 'group') {
                  if (duplicateInfo.type === 'utr') {
                    setGroupUtrId('');
                    setGroupOnlineAmount('');
                  } else if (duplicateInfo.type === 'receipt') {
                    setGroupReceiptNo('');
                    setGroupOfflineAmount('');
                  }
                }
                
                setDuplicateCheckModal(false);
                setDuplicateInfo(null);
                console.log("✅ Modal closed after cancel");
                
                // Clear previous group data
                setGroupStudentName('');
                setGroupOnlineAmount('');
                setGroupOfflineAmount('');
                setGroupUtrId('');
                setGroupReceiptNo('');
                setGroupPaymentDate('');
                setGroupPayments([]);
                setDynamicGroupEntries([]);
                setErrors({});
                setPaymentType('single');
              }}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            
             {duplicateInfo?.paymentType === 'group' && paymentType === 'group' && (
        <button 
    type="button"
    onClick={() => {
      console.log("🔥 DIRECT Add to Current Group button clicked");
      
      if (!duplicateInfo) {
        console.log("❌ No duplicateInfo found, returning");
        return;
      }

      // 🆕 STEP 1: GET BASIC INFO
      const currentStudentName = formData.studentName.trim().toUpperCase();
      const currentFatherName = formData.fatherName.trim().toUpperCase();
      
      console.log("🔍 DEBUG - Current student:", currentStudentName);
      console.log("🔍 DEBUG - Current father:", currentFatherName);
      console.log("🔍 DEBUG - DuplicateInfo:", duplicateInfo);
      
      // Check if existingPayment has valid data
      if (!duplicateInfo.existingPayment || !duplicateInfo.existingPayment.groupStudents) {
        console.log("❌ ERROR: No group students found in existing payment");
        alert(`❌ SYSTEM ERROR: Invalid payment data!\n\nThe UTR/Receipt ID has incomplete information.\nPlease verify your UTR/Receipt number.`);
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
        return;
      }
      
      const existingPayment = duplicateInfo.existingPayment;
      const existingGroupStudents = existingPayment.groupStudents;
      const existingStudentNames = existingGroupStudents
        .split(', ')
        .map(name => name.trim().toUpperCase())
        .filter(name => name.length > 0);
      
      console.log("🔍 DEBUG - Existing group students:", existingStudentNames);
      
      // 🆕 STEP 2: CHECK IF CURRENT STUDENT IS A MEMBER OF THE EXISTING GROUP
      const isStudentInGroup = existingStudentNames.includes(currentStudentName);
      
      if (!isStudentInGroup) {
        console.log("❌ STUDENT NOT IN GROUP");
        alert(`❌ STUDENT NOT IN GROUP!\n\nYou entered: "${formData.studentName}"\n\nBut this ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} belongs to group:\n"${existingGroupStudents}"\n\n"${formData.studentName}" is NOT a member of this group.\n\nPlease verify:\n1. Student name spelling\n2. Correct ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}`);
        
        // Clear the problematic field
        if (duplicateInfo.type === 'utr') {
          setGroupUtrId('');
        } else if (duplicateInfo.type === 'receipt') {
          setGroupReceiptNo('');
        }
        
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
        return;
      }
      
      console.log("✅ STEP 2 PASSED: Student is a member of the existing group");
      
      // 🆕 STEP 3: CHECK IF STUDENT IS PAID OR UNPAID
      const isPaidStudent = currentStudentName === duplicateInfo.studentInfo.studentName.trim().toUpperCase();
      
      console.log("🔍 DEBUG - Is paid student?", isPaidStudent);
      console.log("🔍 DEBUG - Paid student name:", duplicateInfo.studentInfo.studentName.trim().toUpperCase());
      
      if (isPaidStudent) {
        // 🆕 STEP 4A: PAID STUDENT - CHECK FATHER NAME
        const existingFatherName = duplicateInfo.studentInfo.fatherName.trim().toUpperCase();
        const isFatherNameMatching = currentFatherName === existingFatherName;
        
        console.log("🔍 DEBUG - Existing father name:", existingFatherName);
        console.log("🔍 DEBUG - Father name matching?", isFatherNameMatching);
        
        if (!isFatherNameMatching) {
          console.log("❌ PAID STUDENT BUT FATHER NAME MISMATCH");
          alert(`❌ FATHER NAME MISMATCH!\n\nStudent: ${formData.studentName}\nThis student has already PAID in this group.\n\nExpected Father Name: ${duplicateInfo.studentInfo.fatherName}\nYou entered Father Name: ${formData.fatherName}\n\nFather names don't match. This student cannot be the same person.\n\nPlease verify the details or use a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`);
          
          // Clear the problematic field
          if (duplicateInfo.type === 'utr') {
            setGroupUtrId('');
          } else if (duplicateInfo.type === 'receipt') {
            setGroupReceiptNo('');
          }
          
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
          return;
        }
        
        // 🆕 STEP 4B: PAID STUDENT WITH MATCHING FATHER NAME - CANNOT RE-ENTER
        console.log("❌ PAID STUDENT WITH MATCHING FATHER NAME - DUPLICATE ENTRY NOT ALLOWED");
        alert(`❌ DUPLICATE ENTRY NOT ALLOWED!\n\nStudent: ${formData.studentName}\nFather: ${formData.fatherName}\n\nThis student has ALREADY PAID in this group payment.\n\nExisting Payment Details:\n• Course: ${duplicateInfo.courseName}\n• Batch: ${duplicateInfo.batchName}\n• Year: ${duplicateInfo.yearName}\n• Amount: ₹${existingPayment.amount?.toLocaleString()}\n• Date: ${existingPayment.paymentDate}\n\n⚠️ You cannot create duplicate entries for the same student.\nUse a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} for new payments.`);
        
        // Clear the problematic field and reset form
        if (duplicateInfo.type === 'utr') {
          setGroupUtrId('');
        } else if (duplicateInfo.type === 'receipt') {
          setGroupReceiptNo('');
        }
        
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
        return;
        
      } else {
        // 🆕 STEP 5: UNPAID STUDENT - ALLOW PREFILL (NO FATHER NAME CHECK NEEDED)
        console.log("✅ UNPAID STUDENT - CAN PREFILL PAYMENT DETAILS");
        
        // Check course details for warning
        const isSameCourse = selectedCourse === duplicateInfo.courseName;
        const isSameBatch = selectedBatch === duplicateInfo.batchName;
        const isSameYear = selectedYear === duplicateInfo.yearName;
        const isSameDuration = formData.courseDuration === duplicateInfo.studentInfo.courseDuration;
        
        let shouldProceed = true;
        
        // Show warning if different course details
        if (!isSameCourse || !isSameBatch || !isSameYear || !isSameDuration) {
          const warningMessage = `⚠️ DIFFERENT COURSE DETAILS DETECTED!\n\nCurrent Entry:\n- Course: ${selectedCourse}\n- Batch: ${selectedBatch}\n- Year: ${selectedYear}\n- Duration: ${formData.courseDuration} Days\n\nExisting Payment:\n- Course: ${duplicateInfo.courseName}\n- Batch: ${duplicateInfo.batchName}\n- Year: ${duplicateInfo.yearName}\n- Duration: ${duplicateInfo.studentInfo.courseDuration} Days\n\nNote: "${currentStudentName}" is an UNPAID member of existing group but has different course details.\n\nDo you want to proceed with creating separate payment entry?`;
          
          shouldProceed = confirm(warningMessage);
        }
        
        if (!shouldProceed) {
          console.log("🚫 User cancelled due to course details mismatch");
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
          return;
        }
        
        // 🆕 STEP 6: PROCEED WITH PREFILLING FOR UNPAID STUDENT
        console.log("🔄 Starting prefill process for unpaid student");
        
        // Close modal first
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
        
        // Proceed with prefilling
        setTimeout(() => {
          try {
            console.log("🔄 Pre-filling payment details for unpaid student...");
            
            // Pre-fill payment information
            if (existingPayment.onlineAmount > 0) {
              setGroupOnlineAmount(existingPayment.onlineAmount.toString());
              setGroupUtrId(existingPayment.utrId || '');
              console.log("✅ Pre-filled online payment:", existingPayment.onlineAmount, existingPayment.utrId);
            }
            
            if (existingPayment.offlineAmount > 0) {
              setGroupOfflineAmount(existingPayment.offlineAmount.toString());
              setGroupReceiptNo(existingPayment.receiptNo || '');
              console.log("✅ Pre-filled offline payment:", existingPayment.offlineAmount, existingPayment.receiptNo);
            }
            
            setGroupPaymentDate(existingPayment.paymentDate || '');
            
            // Create group entries with existing members
            const totalStudentsNeeded = existingStudentNames.length;
            setGroupCount(totalStudentsNeeded);
            
            const newGroupEntries = existingStudentNames.map((studentName, index) => ({
              studentName: studentName,
              amount: '',
              onlineAmount: '',
              offlineAmount: '',
              utrId: '',
              receiptNo: '',
              paymentDate: ''
            }));
            
            // Set the current student as the first entry
            const currentStudentIndex = existingStudentNames.indexOf(currentStudentName);
            if (currentStudentIndex > 0) {
              // Move current student to first position
              [newGroupEntries[0], newGroupEntries[currentStudentIndex]] = 
              [newGroupEntries[currentStudentIndex], newGroupEntries[0]];
            }
            
            setTimeout(() => {
              setDynamicGroupEntries(newGroupEntries);
              setPaymentFieldsReadOnly(true);
              setErrors({});
              
              const successMsg = `✅ UNPAID STUDENT FOUND!\n\n👤 Student: ${currentStudentName}\n📊 Group Members: ${existingStudentNames.length}\n💰 Payment details pre-filled\n\n📝 Note: This student was an unpaid member of existing group payment.\nFather name verification not required for unpaid members.\n\n✨ You can now enter the amount for this student.`;
              
              setTimeout(() => {
                alert(successMsg);
              }, 500);
              
            }, 300);
            
          } catch (error) {
            console.error("❌ Error during prefilling:", error);
            alert(`❌ Error occurred while pre-filling: ${error.message}`);
          }
        }, 150);
      }
    }}
    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
  >
    Add to Current Group
  </button>
      )}
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* 🆕 NEW: Enhanced Duplicate Student Modal */}
      <Dialog 
        open={duplicateStudentModal} 
        onClose={() => handleDuplicateStudentConfirmation('cancel')}
        className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="bg-black bg-opacity-50 fixed inset-0"></div>
        <Dialog.Panel className="bg-slate-800 border border-orange-500/30 rounded-lg p-6 z-50 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-orange-400" />
            <Dialog.Title className="text-xl font-bold text-orange-400">
              Student Already Enrolled
            </Dialog.Title>
          </div>
          
          {duplicateStudentInfo && (
            <div className="space-y-6 mb-6">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-orange-300 mb-2">Current Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{duplicateStudentInfo.currentStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Father:</span>
                    <span className="text-white ml-2">{duplicateStudentInfo.currentStudent.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">New Course:</span>
                    <span className="text-white ml-2">{duplicateStudentInfo.currentStudent.course} ({duplicateStudentInfo.currentStudent.year})</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Existing Enrollments</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {duplicateStudentInfo.existingEnrollments.map((enrollment, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      enrollment.isSameCourse && enrollment.isActive
                        ? 'bg-red-500/10 border-red-500/30'
                        : enrollment.isActive
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">
                            {enrollment.courseName} • {enrollment.batchName} • {enrollment.yearName}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Duration: {enrollment.student.courseDuration}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Dates: {enrollment.student.startDate} to {enrollment.student.endDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            enrollment.isSameCourse && enrollment.isActive
                              ? 'bg-red-500/20 text-red-300'
                              : enrollment.isActive
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {enrollment.isSameCourse && enrollment.isActive
                              ? '🚫 Same Course (Active)'
                              : enrollment.isActive
                              ? '⚠️ Different Course (Active)'
                              : '✅ Completed'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-gray-600">
                        <div>
                          <span className="text-gray-400">Fee:</span>
                          <span className="text-white ml-2">₹{enrollment.student.courseFee?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Paid:</span>
                          <span className="text-green-400 ml-2">₹{enrollment.student.totalPaid?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Remaining:</span>
                          <span className="text-orange-400 ml-2">₹{enrollment.student.remainingFee?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Message */}
              {duplicateStudentInfo.existingEnrollments.some(e => e.isSameCourse && e.isActive) ? (
                <div className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <strong>Cannot Proceed - Duplicate Enrollment</strong>
                  </div>
                  <p>This student is already enrolled in the same course and the enrollment is still active. 
                  Duplicate enrollments in the same course are not allowed.</p>
                </div>
              ) : (
                <div className="text-blue-300 text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <strong>Multiple Course Enrollment</strong>
                  </div>
                  <p>This student is enrolled in other courses. You can proceed with enrolling them in the new course 
                  as it's a different course/year combination.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => handleDuplicateStudentConfirmation('cancel')}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel Enrollment
            </button>
            
            {duplicateStudentInfo && !duplicateStudentInfo.existingEnrollments.some(e => e.isSameCourse && e.isActive) && (
              <button 
                type="button"
                onClick={() => handleDuplicateStudentConfirmation('proceed')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Proceed with New Course
              </button>
            )}
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default StudentForm;
