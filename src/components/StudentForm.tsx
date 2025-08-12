import React, { useState, useEffect, useRef  } from 'react';
import { ArrowLeft, User, Phone, Mail, GraduationCap, Calendar, DollarSign, CreditCard, Receipt, Users, Plus, X } from 'lucide-react';
import { AppData, Student, Payment } from '../types';
import { Dialog } from '@headlessui/react'; // ✅ ADD THIS
import { v4 as uuidv4 } from 'uuid'; // npm install uuid
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

// ✅ NEW: Read-only state for payment fields
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


  // ✅ STEP 2: Add these state variables after existing useState declarations
const [duplicateCheckModal, setDuplicateCheckModal] = useState(false);
const [duplicateInfo, setDuplicateInfo] = useState<{
  type: 'utr' | 'receipt';
  value: string;
  existingPayment: any;
  studentInfo: any;
  courseName: string;
  batchName: string;
  yearName: string;
  paymentType: 'single' | 'group';
} | null>(null);

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

// ✅ STEP 3: Add this helper function before the useEffect hooks
const findDuplicatePayment = (utrId?: string, receiptNo?: string) => {
  // Search through all years, courses, batches, and students
  for (const [yearKey, yearData] of Object.entries(appData.years)) {
    for (const [courseKey, courseData] of Object.entries(yearData)) {
      for (const [batchKey, batchData] of Object.entries(courseData)) {
        for (const student of batchData.students) {
          // Check payments for this student
          const studentPayments = appData.payments?.filter(p => p.studentId === student.id) || [];
          
          for (const payment of studentPayments) {
            // Check UTR ID match
            if (utrId && payment.utrId === utrId) {
              return {
                type: 'utr' as const,
                value: utrId,
                existingPayment: payment,
                studentInfo: student,
                courseName: courseKey,
                batchName: batchKey,
                yearName: yearKey,
                paymentType: payment.type || 'single'
              };
            }
            
            // Check Receipt Number match
            if (receiptNo && payment.receiptNo === receiptNo) {
              return {
                type: 'receipt' as const,
                value: receiptNo,
                existingPayment: payment,
                studentInfo: student,
                courseName: courseKey,
                batchName: batchKey,
                yearName: yearKey,
                paymentType: payment.type || 'single'
              };
            }
          }
        }
      }
    }
  }
  return null;
};



  // ✅ ADD THIS NEW FUNCTION AFTER findDuplicatePayment
const checkForDuplicateStudent = (studentName: string, mobileNo: string, email: string) => {
  // Check in current batch first
  const currentBatch = appData.years[selectedYear]?.[selectedCourse]?.[selectedBatch];
  if (currentBatch?.students) {
    const duplicate = currentBatch.students.find(student => 
      student.studentName.toLowerCase() === studentName.toLowerCase() ||
      student.mobileNo === mobileNo ||
      student.email.toLowerCase() === email.toLowerCase()
    );
    
    if (duplicate) {
      return {
        student: duplicate,
        location: `${selectedCourse} - Batch ${selectedBatch} - Year ${selectedYear}`,
        type: 'same_batch'
      };
    }
  }

  // Check in all other batches and years
  for (const [yearKey, yearData] of Object.entries(appData.years)) {
    for (const [courseKey, courseData] of Object.entries(yearData)) {
      for (const [batchKey, batchData] of Object.entries(courseData)) {
        if (yearKey === selectedYear && courseKey === selectedCourse && batchKey === selectedBatch) {
          continue;
        }
        
        const duplicate = batchData.students?.find(student => 
          student.studentName.toLowerCase() === studentName.toLowerCase() ||
          student.mobileNo === mobileNo ||
          student.email.toLowerCase() === email.toLowerCase()
        );
        
        if (duplicate) {
          return {
            student: duplicate,
            location: `${courseKey} - Batch ${batchKey} - Year ${yearKey}`,
            type: 'different_batch'
          };
        }
      }
    }
  }
  
  return null;
};

// ✅ ADD THIS NEW HELPER FUNCTION RIGHT AFTER findDuplicatePayment:
const safeSetDynamicGroupEntries = (newEntries) => {
  try {
    console.log("🛡️ Safely setting group entries:", newEntries);
    setDynamicGroupEntries(newEntries);
    
    // Force a small delay to ensure React updates properly
    setTimeout(() => {
      console.log("✅ Group entries set successfully");
    }, 50);
  } catch (error) {
    console.error("❌ Error setting group entries:", error);
    // Fallback: create simple entries
    const fallbackEntries = Array.from({ length: newEntries.length || 1 }, () => ({
      studentName: '',
      amount: ''
    }));
    setDynamicGroupEntries(fallbackEntries);
  }
};
  

useEffect(() => {
  if (!dateFocusedOnce && dynamicGroupEntries.length > 0 && paymentType === "group") {
    setTimeout(() => {
      paymentDateRef.current?.focus();
      setDateFocusedOnce(true); // ✅ Ab dobara focus nahi hoga
    }, 100);
  }
}, [dynamicGroupEntries.length, paymentType]);

// focus on student name
useEffect(() => {
  if (studentNameRef.current) {
    studentNameRef.current.focus();
  }
}, []);



  // Update course fee when duration changes
  useEffect(() => {
    const fee = getCourseFee();
    setFormData(prev => ({
      ...prev,
      courseFee: fee,
      remainingFee: fee - prev.totalPaid
    }));
  }, [formData.courseDuration, selectedCourse, appData.courseFees]);

// ✅ ADD DEBUG LOGGING HERE:
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
      setGroupCount(0); // 👈 Reset to 0 every time modal opens
      setShowGroupModal(true);
    }
  }, [paymentType]);

useEffect(() => {
  if (showGroupModal) {
    const timer = setTimeout(() => {
      if (groupInputRef.current) {
        groupInputRef.current.focus();
        groupInputRef.current.select(); // optional
      }
    }, 100); // delay helps after modal mounts
    return () => clearTimeout(timer);
  }
}, [showGroupModal]);

useEffect(() => {
  const totalGroupPayment =
    (parseInt(groupOnlineAmount || '0') || 0) +
    (parseInt(groupOfflineAmount || '0') || 0);

  // ✅ Sirf Student #1 ka amount clear karo jab total payment change ho
  setDynamicGroupEntries(prevEntries => {
    const updated = [...prevEntries];
    updated[0] = { ...updated[0], amount: '' };
    return updated;
  });
  // Agar tum chaho to totalPaid reset kar sakte ho:
  setFormData(prev => ({
    ...prev,
    totalPaid: 0,
    remainingFee: prev.courseFee
  }));
}, [groupOnlineAmount, groupOfflineAmount]);

// When Group Payment is selected or group entries created
useEffect(() => {
  if (dynamicGroupEntries.length > 0 && formData.studentName) {
    const updated = [...dynamicGroupEntries];
    updated[0].studentName = formData.studentName.toUpperCase();
    setDynamicGroupEntries(updated);
  }
}, [dynamicGroupEntries.length, formData.studentName]);
// ========================================
// Find this existing useEffect and ADD this NEW useEffect AFTER it:

useEffect(() => {
  if (showGroupModal) {
    const timer = setTimeout(() => {
      if (groupInputRef.current) {
        groupInputRef.current.focus();
        groupInputRef.current.select(); // optional
      }
    }, 100); // delay helps after modal mounts
    return () => clearTimeout(timer);
  }
}, [showGroupModal]);

  // ✅ ADD THIS NEW useEffect RIGHT AFTER THE ABOVE ONE:
useEffect(() => {
  console.log("👁️ Dynamic Group Entries Changed:", dynamicGroupEntries.length);
  
  // Force re-render of the form section when entries change
  if (dynamicGroupEntries.length > 0 && paymentType === 'group') {
    // Update the group count to match entries
    if (groupCount !== dynamicGroupEntries.length) {
      setGroupCount(dynamicGroupEntries.length);
      console.log("🔄 Updated group count to match entries:", dynamicGroupEntries.length);
    }
    
    // Ensure Student #1 has current student name
    if (dynamicGroupEntries[0] && dynamicGroupEntries[0].studentName !== formData.studentName.toUpperCase()) {
      const updatedEntries = [...dynamicGroupEntries];
      updatedEntries[0] = {
        ...updatedEntries[0],
        studentName: formData.studentName.toUpperCase()
      };
      setDynamicGroupEntries(updatedEntries);
      console.log("🔄 Synced Student #1 with form student name");
    }
  }
}, [dynamicGroupEntries.length, paymentType, formData.studentName, groupCount]);

  // ✅ STEP 4: Add this handler function
const handleDuplicateConfirmation = (action: 'proceed' | 'cancel') => {
  if (!duplicateInfo) return;
  
  if (action === 'cancel') {
    setDuplicateCheckModal(false);
    setDuplicateInfo(null);
     setPaymentType('single'); // Reset to single if cancelled
    return;
  }
  
  if (action === 'proceed' && duplicateInfo.paymentType === 'group' && paymentType === 'group') {
    // Add existing student to current group
    const existingStudent = duplicateInfo.studentInfo;
    
    
    const existingPayment = duplicateInfo.existingPayment;
    
    // Set the existing student as Student #1
    setFormData(prev => ({
      ...prev,
      studentName: existingStudent.studentName,
      fatherName: existingStudent.fatherName,
      gender: existingStudent.gender,
      mobileNo: existingStudent.mobileNo,
      email: existingStudent.email,
      category: existingStudent.category,
      hostler: existingStudent.hostler,
      collegeName: existingStudent.collegeName,
      branch: existingStudent.branch
    }));
    
    // Pre-fill group payment details from existing payment
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
        studentName: existingStudent.studentName,
        amount: '' // Amount will be blank as requested
      };
      setDynamicGroupEntries(updatedEntries);
    }
    
    alert(`${existingStudent.studentName} has been added to Student #1 position with existing payment details. Please enter the amount for this student.`);
  }
  
  setDuplicateCheckModal(false);
  setDuplicateInfo(null);
};

// Main handler function
const handlePaymentTypeChange = (newPaymentType) => {
  if (paymentType !== newPaymentType) {
    
    if (paymentType === 'single' && newPaymentType === 'group') {
      // Single → Group: Clear single fields
      setPaymentMode('');
      setPaymentAmount('');
      setPaymentDate('');
      setUtrId('');
      setReceiptNo('');
      
      // Setup group with student #1 pre-filled
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
      // Group → Single: Clear group fields
      setGroupPaymentDate('');
      setGroupOnlineAmount('');
      setGroupOfflineAmount('');
      setGroupUtrId('');
      setGroupReceiptNo('');
      setGroupPayments([]);
      setPaymentFieldsReadOnly(false);
      
      // Clear student entries except #1 name
      const resetEntries = [...dynamicGroupEntries];
      if (resetEntries.length > 0) {
        resetEntries[0].amount = '';
        // Clear student #2, #3, etc.
        for (let i = 1; i < resetEntries.length; i++) {
          resetEntries[i].studentName = '';
          resetEntries[i].amount = '';
        }
      }
      setDynamicGroupEntries(resetEntries);
      
      // Reset form data summary
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
     const entries = Array.from({ length: groupCount }, () => ({
  studentName: '',
  onlineAmount: '',
  offlineAmount: '',
  utrId: '',
  receiptNo: '',
  paymentDate: ''
}));
setDynamicGroupEntries(entries);
    setGroupCount(count); // Save the count to state
  
  setShowGroupModal(false); // Close modal
  // ✅ Set this here (not in the radio button)
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


 // StudentForm.tsx - Fixed handleSubmit (सिर्फ यह function replace करें)

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

// ✅ ADD THIS DUPLICATE CHECK BEFORE setErrors(newErrors)
// Check for duplicate students
if (formData.studentName.trim() && formData.mobileNo.trim() && formData.email.trim()) {
  const duplicateStudent = checkForDuplicateStudent(
    formData.studentName.trim(),
    formData.mobileNo.trim(),
    formData.email.trim()
  );

  if (duplicateStudent) {
    const { student, location, type } = duplicateStudent;
    let message = '';
    let field = '';

    if (student.studentName.toLowerCase() === formData.studentName.toLowerCase()) {
      message = `Student "${student.studentName}" already exists in ${location}`;
      field = 'studentName';
    } else if (student.mobileNo === formData.mobileNo) {
      message = `Mobile number "${formData.mobileNo}" already exists for student "${student.studentName}" in ${location}`;
      field = 'mobileNo';
    } else if (student.email.toLowerCase() === formData.email.toLowerCase()) {
      message = `Email "${formData.email}" already exists for student "${student.studentName}" in ${location}`;
      field = 'email';
    }

    newErrors[field] = message;
    alert(`⚠️ Duplicate Entry Detected!\n\n${message}\n\nPlease verify the information and make necessary changes.`);
  }
}
  

  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    const student: Student = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    // ✅ FIXED: सिर्फ main student को batch में add करें
    onAddStudent(selectedYear, selectedCourse, selectedBatch, student);

    // ✅ SINGLE PAYMENT SAVE (unchanged)
    if (paymentType === 'single') {
      payments.forEach(payment => {
        onAddPayment(student.id, {
          ...payment,
          paymentDate: payment.paymentDate,
          type: 'single'
        });
      });
    }

    // ✅ FIXED: GROUP PAYMENT SAVE - Replace this section in your StudentForm.tsx handleSubmit function

// Find this section in your StudentForm.tsx (around line 540-565):
// ✅ FIXED: GROUP PAYMENT SAVE - Single Student Record with Group Details
if (paymentType === 'group' && dynamicGroupEntries.length > 0) {
  const groupId = `group_${Date.now()}`;
  const totalOnlineAmount = parseInt(groupOnlineAmount || '0');
  const totalOfflineAmount = parseInt(groupOfflineAmount || '0');
  const mainStudentAmount = parseInt(dynamicGroupEntries[0]?.amount || '0');

  // Update main student's payment info
  student.totalPaid = mainStudentAmount;
  student.remainingFee = student.courseFee - mainStudentAmount;

  // ✅ CREATE ONE GROUP PAYMENT ENTRY for main student with all group info
  onAddPayment(student.id, {
    groupId,
    studentName: student.studentName,
    amount: mainStudentAmount, // Main student का share
    totalGroupAmount: totalOnlineAmount + totalOfflineAmount,
    onlineAmount: totalOnlineAmount,
    offlineAmount: totalOfflineAmount,
    utrId: totalOnlineAmount > 0 ? groupUtrId : '',
    receiptNo: totalOfflineAmount > 0 ? groupReceiptNo : '',
    paymentDate: groupPaymentDate,
    type: 'group',
    // ✅ FIXED: Store all group students as comma-separated string
    groupStudents: dynamicGroupEntries.map(e => e.studentName).join(', '),
    studentIndex: 0
  });

  // ✅ NO MORE: Don't create separate student records for other group members
  // They will only appear in the group payment details as comma-separated names
}
    
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

    // Reset form logic...
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
    // ✅ ADD THIS LINE in the form reset section
setPaymentFieldsReadOnly(false); // Reset read-only state

    // Focus on Student Name after adding
    if (studentNameRef.current) {
      studentNameRef.current.focus();
    }

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

  
  console.log("📦 Should Render Group Section?", {
    paymentType,
    groupCount,
    entries: dynamicGroupEntries.length
  });
  

  return (

    <div className="min-h-screen p-6">

{/* ✅ REPLACE THE EXISTING GROUP MODAL WITH THIS ENHANCED VERSION */}
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
          setPaymentType('single'); // Reset to single if cancelled
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

      



      <form onSubmit={handleSubmit} 
      className="max-w-4xl mx-auto space-y-8">
        
       


        
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
        if (!prev.length) return prev; // If no group entries yet
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
                  onChange={(e) =>{
                     // अगर पहले group था तो group fields clear करें
      if (paymentType === 'group') {
        // Group fields clear करें
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
        
        // Form summary reset करें
        setFormData(prev => ({
          ...prev,
          totalPaid: 0,
          remainingFee: prev.courseFee
        }));
        
        // Group errors clear करें
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
// अगर पहले single था तो single fields clear करें  
      if (paymentType === 'single') {
        setPaymentMode('');
        setPaymentAmount('');
        setPaymentDate('');
        setUtrId('');
        setReceiptNo('');
        
        // Single errors clear करें
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

  // ✅ Clear previous group data
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
                      onChange={(e) => {
  const value = e.target.value.replace(/\D/g, '');
  setReceiptNo(value);
  
  // ✅ Check for duplicates immediately
  if (value.length > 0) {
    const duplicate = findDuplicatePayment(undefined, value);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
      setReceiptNo(''); // Clear the input
      return;
    }
  }
  
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
  
  // ✅ Check for duplicates when UTR ID is complete (12 digits)
  if (value.length === 12) {
    const duplicate = findDuplicatePayment(value, undefined);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
      setUtrId(''); // Clear the input
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
  {/* Course Fee */}
  <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
    <p className="text-blue-300 text-sm">Course Fee</p>
    <p className="text-2xl font-bold text-white">
      ₹{formData.courseFee?.toLocaleString() || 0}
    </p>
  </div>

  {/* Total Paid */}
  <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
    <p className="text-green-300 text-sm">Total Paid</p>
    <p className="text-2xl font-bold text-white">
      ₹{formData.totalPaid?.toLocaleString() || 0}
    </p>
  </div>

  {/* Remaining */}
  <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-500/30">
    <p className="text-orange-300 text-sm">Remaining</p>
    <p className="text-2xl font-bold text-white">
      ₹{formData.remainingFee?.toLocaleString() || 0}
    </p>
  </div>

  {/* Total Group Payment */}
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

    {/* Total Payment */}
    <div className="text-right mb-2">
      <span className="text-2xl font-bold text-white">
        Total: ₹
        {groupPayments.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
      </span>
    </div>

    <div className="space-y-1 text-sm">
      {groupPayments.map((payment, index) => (
        <div key={index}>
          {/* Student 1 */}
          <div className="flex justify-between items-center text-blue-200">
            <span>{payment.studentName}</span>
            <span>₹{payment.student1Amount.toLocaleString()}</span>
          </div>

          {/* Other Students Combined */}
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
                  <label className="block text-gray-300 text-sm font-medium mb-2 ">
                    Payment Date *
                  </label>
                  <input
                    type="text"
                     ref={paymentDateRef}   // 👈 Ye add karo
                    value={groupPaymentDate}
                    readOnly={paymentFieldsReadOnly} // ✅ यह line add करें
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
                </div></div>
                <div className="flex-1 min-w-[200px]">
                 <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Online Payment Amount
                  </label>
                  <input
                    type="text"
                    value={groupOnlineAmount}
                     readOnly={paymentFieldsReadOnly} // ✅ यह line add करें
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setGroupOnlineAmount(value);
                      // ✅ Agar value ya offlineAmount me kuch hai to groupAmount error clear
        if (parseInt(value || '0') > 0 || parseInt(groupOfflineAmount || '0') > 0) {
          setErrors(prev => ({ ...prev, groupAmount: '' }));
        }
                    }}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter online amount (optional)"
                  />
                   {/* ✅ Ye line add karo — message Online Payment Amount ke niche dikhega */}
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
                     readOnly={paymentFieldsReadOnly} // ✅ यह line add करें
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setGroupOfflineAmount(value);
                    }}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter offline amount (optional)"
                  />
                </div></div>
                <div className="flex-1 min-w-[200px]">
                  </div>
                <div className="flex-1 min-w-[200px]">
 {parseInt(groupOnlineAmount) > 0 && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      UTR/UPI ID
                    </label>
                    <input
                      type="text"
                      value={groupUtrId}
                       readOnly={paymentFieldsReadOnly} // ✅ यह line add करें
                     onChange={(e) => {
  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
  setGroupUtrId(value);
  
  // ✅ Check for duplicates when UTR ID is complete (12 digits)
  if (value.length === 12) {
    const duplicate = findDuplicatePayment(value, undefined);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
      if (duplicate.paymentType === 'single') {
        setGroupUtrId(''); // Clear input for single payments
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
                )}</div>
                <div className="flex-1 min-w-[200px]">

                {parseInt(groupOfflineAmount) > 0 && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      value={groupReceiptNo}
                       readOnly={paymentFieldsReadOnly} // ✅ यह line add करें
                      onChange={(e) => {
  const value = e.target.value.replace(/\D/g, '');
  setGroupReceiptNo(value);
  
  // ✅ Check for duplicates immediately
  if (value.length > 0) {
    const duplicate = findDuplicatePayment(undefined, value);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
      if (duplicate.paymentType === 'single') {
        setGroupReceiptNo(''); // Clear input for single payments
      }
      return;
    }
  }
  
  if (errors.groupReceiptNo) setErrors({ ...errors, groupReceiptNo: '' });
}}

                      className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter receipt number"
                    />
                    {errors.groupReceiptNo && <p className="text-red-400 text-sm mt-1">{errors.groupReceiptNo}</p>}
                  </div>
                )}</div>
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
    readOnly={paymentFieldsReadOnly}
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

      // ✅ Validation: Ensure Student #1 amount ≤ course fee
      if (amountNum > formData.courseFee) {
        alert(`Amount cannot be more than ₹${formData.courseFee.toLocaleString()}`);
        return;
      }



        // ✅ Validation 2: Amount ≤ Total Group Payment
  if (amountNum > totalGroupPayment) {
    alert(`Amount cannot be more than total group payment ₹${totalGroupPayment.toLocaleString()}`);
    return;
  }
 // ✅ Error clear on typing
    setErrors(prev => ({ ...prev, [`amount_0`]: '' }));
       // 1️⃣ Update group entry amount
      const updatedEntries = [...dynamicGroupEntries];
      updatedEntries[0].amount = value;
      setDynamicGroupEntries(updatedEntries);

      // 2️⃣ Update total paid and remaining for summary
      const totalPaid = updatedEntries.reduce(
      (sum, entry) => sum + parseInt(entry.amount || '0'),
      0
    );

      // 3️⃣ Update formData summary
  setFormData((prev) => ({
    ...prev,
    totalPaid: totalPaid,
    remainingFee: prev.courseFee - totalPaid < 0 ? 0 : prev.courseFee - totalPaid
  }));

      const updated = [...dynamicGroupEntries];
      updated[0].amount = value;
      setDynamicGroupEntries(updated);
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
         readOnly={paymentFieldsReadOnly} // ✅ यह line add करें
        onChange={(e) => {
          const updated = [...dynamicGroupEntries];
          updated[index + 1].studentName = e.target.value.toUpperCase();
          setDynamicGroupEntries(updated);

          // ✅ Error clear on typing
          setErrors(prev => ({ ...prev, [`studentName_${index + 1}`]: '' }));
        }}
        value={entry.studentName}
        className="w-full p-3 bg-gray-800 border border-white/30 rounded-lg text-white"
        placeholder={`Student Name #${index + 2}`}
      />

      {/* 🔹 Validation error per student field */}
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

                

               
               
               
              </div>

             
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
                          {/* ✅ Yaha sabhi students ka naam join karke print */}
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

{/* ✅ ENHANCED Duplicate Check Modal - ViewStudent style layout */}
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
  className="fixed z-50 inset-0 flex items-center justify-center"
>
  <div className="bg-black bg-opacity-50 fixed inset-0"></div>
  <Dialog.Panel className="bg-slate-800 border border-red-500/30 rounded-lg p-6 z-50 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
    <div className="flex items-center gap-3 mb-6">
      <AlertTriangle className="w-6 h-6 text-red-400" />
      <Dialog.Title className="text-xl font-bold text-red-400">
        Duplicate Payment Detected!
      </Dialog.Title>
    </div>
    
    {duplicateInfo && (
      <div className="space-y-6 mb-6">
        {/* Student Information Card */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Existing Student Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Student Name</p>
                <p className="text-white font-medium">{duplicateInfo.studentInfo.studentName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Father's Name</p>
                <p className="text-white">{duplicateInfo.studentInfo.fatherName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mobile Number</p>
                <p className="text-white">{duplicateInfo.studentInfo.mobileNo}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white text-sm">{duplicateInfo.studentInfo.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Course</p>
                <p className="text-white font-medium">{duplicateInfo.courseName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Batch & Year</p>
                <p className="text-white">{duplicateInfo.batchName} • {duplicateInfo.yearName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white">{duplicateInfo.studentInfo.courseDuration}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Course Dates</p>
                <p className="text-white">{duplicateInfo.studentInfo.startDate} to {duplicateInfo.studentInfo.endDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Fee Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
            <p className="text-blue-300 text-sm">Course Fee</p>
            <p className="text-2xl font-bold text-white">₹{duplicateInfo.studentInfo.courseFee?.toLocaleString()}</p>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
            <p className="text-green-300 text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-white">₹{duplicateInfo.studentInfo.totalPaid?.toLocaleString()}</p>
          </div>
          <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-300 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-white">₹{duplicateInfo.studentInfo.remainingFee?.toLocaleString()}</p>
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

              <div className="space-y-2">
                {/* Payment Amounts based on type */}
                {duplicateInfo.paymentType === 'single' ? (
                  <div>
                    <p className="text-gray-400 text-sm">Payment Amount</p>
                    <p className="text-2xl font-bold text-green-400">
                      ₹{duplicateInfo.existingPayment.amount?.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-sm">Total Group Payment</p>
                      <p className="text-xl font-bold text-purple-400">
                        ₹{duplicateInfo.existingPayment.totalGroupAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">This Student's Share</p>
                        <p className="text-green-400 font-medium">
                          ₹{duplicateInfo.existingPayment.amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Others' Share</p>
                        <p className="text-blue-400 font-medium">
                          ₹{(duplicateInfo.existingPayment.totalGroupAmount - duplicateInfo.existingPayment.amount)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Online/Offline breakdown for group payments */}
                {duplicateInfo.paymentType === 'group' && (
                  <div className="text-sm space-y-1 mt-2 pt-2 border-t border-gray-600">
                    {duplicateInfo.existingPayment.onlineAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">💳 Online Amount:</span>
                        <span className="text-white">₹{duplicateInfo.existingPayment.onlineAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    {duplicateInfo.existingPayment.offlineAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">💵 Offline Amount:</span>
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
                  </div>
                )}
              </div>
            </div>

            {/* Group Members for group payments */}
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
            <p>Since both payments are group payments, you can add <strong>{duplicateInfo.studentInfo.studentName}</strong> to your current group as Student #1. 
            The existing payment details will be pre-filled, but you'll need to enter the amount for this student.</p>
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
          console.log("🔍 Current paymentType:", paymentType);
          console.log("🔍 duplicateInfo.type:", duplicateInfo.type);
          
          // Clear payment fields based on payment type and duplicate type
          if (paymentType === 'single') {
            if (duplicateInfo.type === 'utr') {
              console.log("🧹 Clearing single UTR ID:", utrId);
              setUtrId('');
            } else if (duplicateInfo.type === 'receipt') {
              console.log("🧹 Clearing single Receipt No:", receiptNo);
              setReceiptNo('');
            }
          } else if (paymentType === 'group') {
            if (duplicateInfo.type === 'utr') {
              console.log("🧹 Clearing group UTR ID and online amount:", groupUtrId, groupOnlineAmount);
              setGroupUtrId('');
              setGroupOnlineAmount('');
            } else if (duplicateInfo.type === 'receipt') {
              console.log("🧹 Clearing group Receipt No and offline amount:", groupReceiptNo, groupOfflineAmount);
              setGroupReceiptNo('');
              setGroupOfflineAmount('');
            }
          }
          
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
          console.log("✅ Modal closed after cancel");
          // ✅ Clear previous group data
  setGroupStudentName('');
  setGroupOnlineAmount('');
  setGroupOfflineAmount('');
  setGroupUtrId('');
  setGroupReceiptNo('');
  setGroupPaymentDate('');
  setGroupPayments([]);
  setDynamicGroupEntries([]);
  setErrors({});
           setPaymentType('single'); // Reset to single if cancelled
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
      
      // ✅ REPLACE THE ENTIRE onClick FUNCTION WITH THIS:
      const currentStudentName = formData.studentName.trim().toUpperCase();
      const existingPayment = duplicateInfo.existingPayment;
      const existingGroupStudents = existingPayment.groupStudents || '';
      const enteredFatherName = formData.fatherName.trim().toUpperCase();
      const existingFatherName = duplicateInfo.studentInfo.fatherName.trim().toUpperCase();

      const existingStudentNames = existingGroupStudents
        .split(', ')
        .map(name => name.trim().toUpperCase())
        .filter(name => name.length > 0);
      
      console.log("🔍 Current student name:", currentStudentName);
      console.log("🔍 Existing group students:", existingStudentNames);
      console.log("🔍 Current course/batch/year:", selectedCourse, selectedBatch, selectedYear);
      console.log("🔍 Existing course/batch/year:", duplicateInfo.courseName, duplicateInfo.batchName, duplicateInfo.yearName);
      
      // ✅ ENHANCED VALIDATION: Check multiple scenarios
      let canProceed = false;
      let warningMessage = '';
      let proceedMessage = '';
      
      // Check if current student is part of existing group
      const isStudentInExistingGroup = existingStudentNames.includes(currentStudentName);
      
      
      if (isStudentInExistingGroup ) {
        // ✅ SCENARIO 1: Student is already in the group payment
        console.log("✅ SCENARIO 1: Current student IS part of existing group");
        
        
        // Check if same course/batch/year/duration
        const isSameCourse = selectedCourse === duplicateInfo.courseName;
        const isSameBatch = selectedBatch === duplicateInfo.batchName;
        const isSameYear = selectedYear === duplicateInfo.yearName;
        const isSameDuration = formData.courseDuration === duplicateInfo.studentInfo.courseDuration;
        
        if (isSameCourse && isSameBatch && isSameYear && isSameDuration) {
          console.log("✅ EXACT MATCH: Same course, batch, year, and duration");
          canProceed = true;
          proceedMessage = `✅ Exact match found!\n\nStudent: ${currentStudentName}\nCourse: ${selectedCourse}\nBatch: ${selectedBatch}\nYear: ${selectedYear}\nDuration: ${formData.courseDuration}\n\nThis appears to be the same enrollment. Payment details will be pre-filled.`;
        } else {
          console.log("⚠️ PARTIAL MATCH: Different course details");
          canProceed = true; // Allow but with warning
          warningMessage = `⚠️ DIFFERENT COURSE DETAILS DETECTED!\n\nCurrent Entry:\n- Course: ${selectedCourse}\n- Batch: ${selectedBatch}\n- Year: ${selectedYear}\n- Duration: ${formData.courseDuration}\n\nExisting Payment:\n- Course: ${duplicateInfo.courseName}\n- Batch: ${duplicateInfo.batchName}\n- Year: ${duplicateInfo.yearName}\n- Duration: ${duplicateInfo.studentInfo.courseDuration}\n\nThis student (${currentStudentName}) appears to be enrolled in multiple courses/batches. Do you want to proceed with creating a separate payment entry for the current course?`;
        }
      } else {
        // ✅ SCENARIO 2: Student is NOT in existing group - this should not be allowed
        console.log("❌ SCENARIO 2: Current student is NOT part of existing group");
       setTimeout(() => {
          alert(`❌ ERROR: Cannot add to existing group!\n\nCurrent Student: ${currentStudentName}\nExisting Group Members: ${existingGroupStudents}\n\n${currentStudentName} is not a member of the existing group payment. Each student can only be added to their own group payments.\n\nPlease use a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`);
        }, 1000);
        
        // Clear the problematic field
        if (paymentType === 'group') {
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
        return;
      }
      
      // ✅ If we reach here, student is in existing group - show warning if different course details

// ✅ If we reach here, student is in existing group - show warning if different course details
    // ✅ If we reach here, student is in existing group - show warning if different course details
     // ✅ If we reach here, student is in existing group - show warning if different course details
      if (warningMessage && !confirm(warningMessage)) {
        console.log("🚫 User cancelled the warning confirmation");
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
                 // ✅ Use setTimeout to ensure modal closes before showing confirm dialog
        setTimeout(() => {
          const userConfirmed = confirm(warningMessage);
          
          if (!userConfirmed) {
            console.log("🚫 User cancelled the warning confirmation");
            
            // ✅ FIXED: Reset all group payment fields as requested
            setGroupStudentName('');
            setGroupOnlineAmount('');
            setGroupOfflineAmount('');
            setGroupUtrId('');
            setGroupReceiptNo('');
            setGroupPaymentDate('');
            setGroupPayments([]);
            setDynamicGroupEntries([]);
            setErrors({});
            setPaymentType('single'); // Reset to single if cancelled
            
            console.log("✅ All group payment fields cleared and reset to single payment");
            return;
          }
          
          // ✅ User confirmed - proceed with pre-filling
          proceedWithPreFilling();
          
        }, 300); // Increased delay to ensure modal is fully closed
        
        return;
      }
      
      console.log("✅ User confirmed to proceed (or no warning needed)");
      
      // ✅ PROCEED WITH PRE-FILLING
      // ✅ Close modal first
      setDuplicateCheckModal(false);
      setDuplicateInfo(null);
      
      // ✅ Proceed with pre-filling after short delay
      setTimeout(() => {
        proceedWithPreFilling();
      }, 150);
      
      // ✅ EXTRACTED FUNCTION: Pre-filling logic
      function proceedWithPreFilling() {
      try {
        console.log("🔄 Starting to pre-fill payment details...");
        console.log("🔍 Existing payment data:", existingPayment);
        console.log("🔍 Current form data before update:", {
          studentName: formData.studentName,
          courseDuration: formData.courseDuration,
          courseFee: formData.courseFee
        });
        
        // ✅ CRITICAL: First update the main student's info from existing data if it's an exact match
        const isSameCourse = selectedCourse === duplicateInfo.courseName;
        const isSameBatch = selectedBatch === duplicateInfo.batchName;
        const isSameYear = selectedYear === duplicateInfo.yearName;
        const isSameDuration = formData.courseDuration === duplicateInfo.studentInfo.courseDuration;
        
        if (isSameCourse && isSameBatch && isSameYear && isSameDuration) {
          console.log("✅ Exact match - updating form data with existing student info");
          // Update form data with existing student details for exact match
          setFormData(prev => ({
            ...prev,
            fatherName: duplicateInfo.studentInfo.fatherName,
            gender: duplicateInfo.studentInfo.gender,
            mobileNo: duplicateInfo.studentInfo.mobileNo,
            email: duplicateInfo.studentInfo.email,
            category: duplicateInfo.studentInfo.category,
            hostler: duplicateInfo.studentInfo.hostler,
            collegeName: duplicateInfo.studentInfo.collegeName,
            branch: duplicateInfo.studentInfo.branch,
            startDate: duplicateInfo.studentInfo.startDate,
            endDate: duplicateInfo.studentInfo.endDate
          }));
        }
        
        // ✅ Pre-fill payment information
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
        console.log("✅ Pre-filled payment date:", existingPayment.paymentDate);
        
        // ✅ ENHANCED: Create new group entries based on existing group size
        const otherMembers = existingStudentNames.filter(name => 
          name !== currentStudentName
        );
        
        console.log("🔍 Other members to fill:", otherMembers);
        console.log("🔍 Total required entries:", existingStudentNames.length);
        
        // ✅ Ensure we have at least 1 student (current student)
        const totalStudentsNeeded = Math.max(existingStudentNames.length, 1);
        
        // ✅ IMPORTANT: Update groupCount to match existing group size
        console.log("🔄 Updating groupCount from", groupCount, "to", totalStudentsNeeded);
        setGroupCount(totalStudentsNeeded);
        
        // ✅ CREATE FRESH GROUP ENTRIES with correct size
        const newGroupEntries = Array.from({ length: totalStudentsNeeded }, (_, index) => {
          if (index === 0) {
            // Student #1 is always the current student
            return {
              studentName: currentStudentName,
              amount: '', // Amount will be entered manually
              onlineAmount: '',
              offlineAmount: '',
              utrId: '',
              receiptNo: '',
              paymentDate: ''
            };
          } else {
            // Fill with other members if available
            const otherMemberIndex = index - 1;
            return {
              studentName: otherMemberIndex < otherMembers.length ? otherMembers[otherMemberIndex] : '',
              amount: '',
              onlineAmount: '',
              offlineAmount: '',
              utrId: '',
              receiptNo: '',
              paymentDate: ''
            };
          }
        });
        
        console.log("🔍 New group entries to set:", newGroupEntries);
        
        // ✅ Use setTimeout to ensure state updates properly and prevent clashing
        setTimeout(() => {
          console.log("🔄 Setting dynamic group entries after count update");
          console.log("🔍 Current groupCount before setting entries:", groupCount);
          console.log("🔍 Required totalStudentsNeeded:", totalStudentsNeeded);
          
          // ✅ Force update groupCount again if it doesn't match
          if (groupCount !== totalStudentsNeeded) {
            console.log("⚠️ GroupCount mismatch detected, forcing update");
            setGroupCount(totalStudentsNeeded);
          }
          
          setDynamicGroupEntries(newGroupEntries);
          
          // ✅ Clear any errors
          setErrors({});
          
          console.log("✅ Final group count:", totalStudentsNeeded);
          console.log("✅ Final group entries:", newGroupEntries);
           // ✅ ADD THIS LINE TO ACTIVATE READ-ONLY MODE
      setPaymentFieldsReadOnly(true);
          // ✅ CRITICAL: Close modal and set info to null BEFORE showing alert
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
          
          // ✅ FIXED: Show success message with non-blocking approach
            const successMsg = proceedMessage || `✅ Payment details pre-filled successfully!\n\n📊 Group Updated:\n- Total Students: ${totalStudentsNeeded}\n- Student #1: ${currentStudentName} (current student)\n${otherMembers.length > 0 ? `- Other Members: ${otherMembers.join(', ')}` : '- No other members'}\n\n💡 Note: Group size has been automatically adjusted to match existing payment group.`;
            
            // ✅ CRITICAL FIX: Use setTimeout for alert to prevent UI blocking and state loss
            setTimeout(() => {
              // ✅ Check if component is still mounted before showing alert
              if (document.body) {
                alert(successMsg);
                console.log("✅ Success message shown, process completed");
              }
            }, 9000); // Reduced timeout but ensure UI is stable
            
          }, 5000); // Reduced timeout for better responsiveness
          
          console.log("✅ Process initiated successfully");
        
      } catch (error) {
        console.error("❌ Error during pre-filling:", error);
        console.error("❌ Error stack:", error.stack);
         // ✅ FIXED: Non-blocking error alert
          setTimeout(() => {
            alert(`❌ An error occurred while pre-filling the payment details: ${error.message}\n\nPlease try again or contact support.`);
          }, 5000);
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
      }
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

      
    </div>
  );
};

export default StudentForm;
