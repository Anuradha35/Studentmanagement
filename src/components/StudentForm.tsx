import React, { useState, useEffect, useRef  } from 'react';
import { ArrowLeft, User, Phone, Mail, GraduationCap, Calendar, DollarSign, CreditCard, Receipt, Users, Plus, X, Home, Utensils } from 'lucide-react';
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
  editingStudent?: Student | null;
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
  editingStudent = null,
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
    registrationDate: '',   // ✅ NEW FIELD
    courseFee: 0,
    totalPaid: 0,
    remainingFee: 0, 
    // 🏨 Add hostel dates
  hostelStartDate: '',
  hostelEndDate: ''
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
  const [paymentCategory, setPaymentCategory] = useState<'course' | 'hostel' | 'mess'>('course');

  
  const [groupRemainingAmount, setGroupRemainingAmount] = useState('');
  const [groupCourseName, setGroupCourseName] = useState('');
  const [groupCourseDuration, setGroupCourseDuration] = useState('');
  // Add these state variables at the top of your component (where other useState declarations are)
const [savedUnpaidAmount, setSavedUnpaidAmount] = useState(0);
const [unpaidMemberName, setUnpaidMemberName] = useState('');
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
  const [isProcessingGroupEntry, setIsProcessingGroupEntry] = useState(false);

  // 🏨 NEW: Hostel & Mess Payment States
  const [hostelPaymentType, setHostelPaymentType] = useState<'single' | 'group'>('single');
  const [messPaymentType, setMessPaymentType] = useState<'single' | 'group'>('single');
  
  // Hostel Individual Payment States
  const [hostelIndividualPaymentMode, setHostelIndividualPaymentMode] = useState('online');
  const [hostelIndividualAmount, setHostelIndividualAmount] = useState('');
  const [hostelIndividualOfflineAmount, setHostelIndividualOfflineAmount] = useState('');
  const [hostelIndividualPaymentDate, setHostelIndividualPaymentDate] = useState('');
  const [hostelIndividualReceiptNo, setHostelIndividualReceiptNo] = useState('');
  const [hostelIndividualPaymentDateError, setHostelIndividualPaymentDateError] = useState('');
  const [hostelUtrError, setHostelUtrError] = useState('');
  const [hostelIndividualUtrId, setHostelIndividualUtrId] = useState('');
  const [hostelFieldsReadOnly, setHostelFieldsReadOnly] = useState(false);
const [messFieldsReadOnly, setMessFieldsReadOnly] = useState(false);
  
  // Hostel Group Payment States
  const [hostelGroupCount, setHostelGroupCount] = useState(0);
  const [hostelGroupEntries, setHostelGroupEntries] = useState<Array<{studentName: string, amount: number}>>([]);
  const [hostelPayments, setHostelPayments] = useState<Array<{
    paymentMode: 'online' | 'offline' | 'mixed';
    amount: number;
    utrId?: string;
    receiptNo?: string;
    paymentDate: string;
  }>>([]);
  
  // Mess Individual Payment States
  const [messIndividualPaymentMode, setMessIndividualPaymentMode] = useState('online');
  const [messIndividualAmount, setMessIndividualAmount] = useState('');
  const [messIndividualOfflineAmount, setMessIndividualOfflineAmount] = useState('');
  const [messIndividualPaymentDate, setMessIndividualPaymentDate] = useState('');
  const [messIndividualReceiptNo, setMessIndividualReceiptNo] = useState('');
  const [messIndividualPaymentDateError, setMessIndividualPaymentDateError] = useState('');
  const [messUtrError, setMessUtrError] = useState('');
  const [messIndividualUtrId, setMessIndividualUtrId] = useState('');
  
  // Mess Group Payment States
  const [messGroupCount, setMessGroupCount] = useState(0);
  // Add these new state variables at the top of your component
const [hostelGroupStudentErrors, setHostelGroupStudentErrors] = useState({});
const [messGroupStudentErrors, setMessGroupStudentErrors] = useState<{[key:number]: string}>({});



  const [messGroupEntries, setMessGroupEntries] = useState<Array<{studentName: string, amount: number}>>([]);
  const [messPayments, setMessPayments] = useState<Array<{
    paymentMode: 'online' | 'offline' | 'mixed';
    amount: number;
    utrId?: string;
    receiptNo?: string;
    paymentDate: string;
  }>>([]);
  
  // Modal States
  const [showHostelGroupModal, setShowHostelGroupModal] = useState(false);
  const [showMessGroupModal, setShowMessGroupModal] = useState(false);
  // Group modal input focus refs
  const hostelGroupCountRef = useRef<HTMLInputElement | null>(null);
  const messGroupCountRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showHostelGroupModal && hostelGroupCountRef.current) {
      hostelGroupCountRef.current.focus();
    }
  }, [showHostelGroupModal]);

  useEffect(() => {
    if (showMessGroupModal && messGroupCountRef.current) {
      messGroupCountRef.current.focus();
    }
  }, [showMessGroupModal]);

  // Hostel/Mess group payment fields (similar to Payment Information group)
  const [hostelGroupPaymentDate, setHostelGroupPaymentDate] = useState('');
  const [hostelGroupOnlineAmount, setHostelGroupOnlineAmount] = useState('');
  const [hostelGroupOfflineAmount, setHostelGroupOfflineAmount] = useState('');
  const [hostelGroupUtrId, setHostelGroupUtrId] = useState('');
  const [hostelGroupReceiptNo, setHostelGroupReceiptNo] = useState('');
  const [hostelGroupDateError, setHostelGroupDateError] = useState('');
  const [hostelGroupUtrError, setHostelGroupUtrError] = useState('');
  const [hostelGroupAmountError, setHostelGroupAmountError] = useState('');
  // Add this state variable at the top of your component (if not already present)
const [isDialogOpen, setIsDialogOpen] = useState(false);


  const [messGroupPaymentDate, setMessGroupPaymentDate] = useState('');
  const [messGroupOnlineAmount, setMessGroupOnlineAmount] = useState('');
  const [messGroupOfflineAmount, setMessGroupOfflineAmount] = useState('');
  const [messGroupUtrId, setMessGroupUtrId] = useState('');
  const [messGroupReceiptNo, setMessGroupReceiptNo] = useState('');
  const [messGroupDateError, setMessGroupDateError] = useState('');
  const [messGroupUtrError, setMessGroupUtrError] = useState('');
  const [messGroupAmountError, setMessGroupAmountError] = useState('');

  // Prefill selection and lock states
  const [hostelPrefillSelection, setHostelPrefillSelection] = useState<PrefillSelection>('none');

  // Initialize form data with editing student data
  useEffect(() => {
    if (editingStudent) {
      console.log("🔄 Populating form with editing student data:", editingStudent);
      
      setFormData({
        studentName: editingStudent.studentName || '',
        fatherName: editingStudent.fatherName || '',
        gender: editingStudent.gender || 'Male',
        mobileNo: editingStudent.mobileNo || '',
        email: editingStudent.email || '',
        category: editingStudent.category || 'GEN',
        hostler: editingStudent.hostler || 'No',
        collegeName: editingStudent.collegeName || '',
        branch: editingStudent.branch || '',
        courseDuration: editingStudent.courseDuration || '',
        startDate: editingStudent.startDate || '',
        endDate: editingStudent.endDate || '',
        registrationDate: editingStudent.registrationDate || '',
        courseFee: editingStudent.courseFee || 0,
        totalPaid: editingStudent.totalPaid || 0,
        remainingFee: editingStudent.remainingFee || 0,
        hostelStartDate: editingStudent.hostelStartDate || '',
        hostelEndDate: editingStudent.hostelEndDate || ''
      });

      // Clear any existing payments/errors when editing
      setPayments([]);
      setGroupPayments([]);
      setDynamicGroupEntries([]);
      setErrors({});
      
      console.log("✅ Form populated with student data");
    } else {
      // Reset form for new student
      resetFormToCleanState();
    }
  }, [editingStudent]);

  const [messPrefillSelection, setMessPrefillSelection] = useState<PrefillSelection>('none');
  const [hostelLockDate, setHostelLockDate] = useState(false);
  const [hostelLockReceipt, setHostelLockReceipt] = useState(false);
  const [hostelLockUtr, setHostelLockUtr] = useState(false);
  const [messLockDate, setMessLockDate] = useState(false);
  const [messLockReceipt, setMessLockReceipt] = useState(false);
  const [messLockUtr, setMessLockUtr] = useState(false);
  // state ऊपर रखो
const [activeDuplicateSource, setActiveDuplicateSource] = useState<"course" | "hostel" | "mess" | null>(null);
const [isGroupLocked, setIsGroupLocked] = useState(false);


// chhota helper: processing flag ko thoda delay ke saath reset karna safe hota hai
const endProcessing = () => {
  setTimeout(() => setIsProcessingGroupEntry(false), 200);
};

  // Add state for tracking existing payments for validation
  const [existingPayments, setExistingPayments] = useState<{
  utrIds: Set<string>;
  receiptNos: Set<string>;
  details: Array<{
    studentId: string;
    studentName: string;
    payment: any;
    unpaidAmount: number;
  }>;
}>({ utrIds: new Set(), receiptNos: new Set(), details: [] });

  // Enhanced state for duplicate checking
  const [duplicateCheckModal, setDuplicateCheckModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    type: 'utr' | 'receipt';
    value: string;
    unpaidAmount?: number;
    existingPayment: any;
    allGroupMembers: Array<{
      studentInfo: any;
      courseName: string;
      batchName: string;
      yearName: string;
      existingPayment: {
      courseAmount?: number;
      hostelAmount?: number;
      messAmount?: number;
      totalAmount?: number;
    };
    }>;
    allStudentPayments?: {
    courseAmount?: number;
    hostelAmount?: number;
    messAmount?: number;
    totalAmount?: number;
  };
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
const student: Student = {
  id: Date.now().toString(),
  ...formData,
  createdAt: new Date().toISOString()
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
    registrationDate: '',   // ✅ NEW FIELD
    courseFee: fee,
    totalPaid: 0,
    remainingFee: fee,
    hostelStartDate: '',
    hostelEndDate: ''
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
    
    const courseFee = appData?.courseFees?.find(
  (fee) =>
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
      document.getElementById(`studentName-${i}`)?.focus();
      return false;
    }
  }
  return true;
};

const [dateFocusedOnce, setDateFocusedOnce] = useState(false);

 // ✅ ENHANCED: Find ALL students who are part of the same group payment
  // ✅ ENHANCED: Find ALL students who are part of the same group payment
const findDuplicatePaymentWithAllMembers = (utrId?: string, receiptNo?: string) => {
    // 🔧 Guard: agar abhi group entry process ho rahi hai, to duplicate check skip
  if (isProcessingGroupEntry) {
    console.log("🔧 Skipping duplicate check - currently processing group entry");
    return null; // callers me 'if (duplicate)' falsy ho jayega
  }

  const allGroupMembers: Array<{
    studentInfo: any;
    courseName: string;
    batchName: string;
    yearName: string;
    existingPayment: {
      courseAmount?: number;
      hostelAmount?: number;
      messAmount?: number;
      totalAmount?: number;
      [key: string]: any;
    };
    isPaid: boolean;   // 🆕 Add paid/unpaid flag
    paymentCategory: 'course' | 'hostel' | 'mess'; // 🆕 Track payment category
  }> = [];

  let mainPayment: any = null;
  let firstMatchFound = false;

 // 🆕 Enhanced: Search through all payment sources
 const allPaymentSources = [
  { payments: (appData.payments || []).filter(p => p.paymentCategory === 'course'), category: 'course' as const },
  { payments: (appData.payments || []).filter(p => p.paymentCategory === 'hostel'), category: 'hostel' as const },
  { payments: (appData.payments || []).filter(p => p.paymentCategory === 'mess'), category: 'mess' as const }
];

// Search through all payment sources
for (const source of allPaymentSources) {
  for (const payment of source.payments) {
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

      // Find the student for this payment
      let student = null;
      let courseName = '';
      let batchName = '';
      let yearName = '';

      // Search through all years, courses, batches to find the student
      for (const [yearKey, yearData] of Object.entries(appData.years)) {
        for (const [courseKey, courseData] of Object.entries(yearData)) {
          for (const [batchKey, batchData] of Object.entries(courseData)) {
            if (!Array.isArray(batchData.students)) continue;
            
            const foundStudent = batchData.students.find(s => s && s.id === payment.studentId);
            if (foundStudent) {
              student = foundStudent;
              courseName = courseKey;
              batchName = batchKey;
              yearName = yearKey;
              break;
            }
          }
          if (student) break;
        }
        if (student) break;
      }

      if (student) {
        // Check if this student is already added
        const existingMember = allGroupMembers.find(m => 
          m.studentInfo.id === student.id && m.paymentCategory === source.category
        );

        if (!existingMember) {
          // Calculate amounts based on payment category
          let courseAmount = 0;
          let hostelAmount = 0;
          let messAmount = 0;

          if (source.category === 'course') {
            courseAmount = payment.amount || 0;
          } else if (source.category === 'hostel') {
            hostelAmount = payment.amount || 0;
          } else if (source.category === 'mess') {
            messAmount = payment.amount || 0;
          }

          allGroupMembers.push({
            studentInfo: student,
            courseName: courseName,
            batchName: batchName,
            yearName: yearName,
            existingPayment: {
              ...payment,
              courseAmount: courseAmount,
              hostelAmount: hostelAmount,
              messAmount: messAmount,
              totalAmount: courseAmount + hostelAmount + messAmount,
            },
            isPaid: (payment.amount || 0) > 0,
            paymentCategory: source.category as 'course' | 'hostel' | 'mess' // 🆕 Track which category this payment belongs to
          });
        }

        // ✅ For group payments, find all members of same groupId
        if (payment.type === 'group' && payment.groupId) {
          const sameGroupPayments = source.payments.filter(
            p => p.groupId === payment.groupId && p.studentId !== payment.studentId
          );

          for (const groupPayment of sameGroupPayments) {
            // Find the student for this group payment
            let groupStudent = null;
            let groupCourseName = '';
            let groupBatchName = '';
            let groupYearName = '';

            for (const [y, yData] of Object.entries(appData.years)) {
              for (const [c, cData] of Object.entries(yData)) {
                for (const [b, bData] of Object.entries(cData)) {
                  if (!Array.isArray(bData?.students)) continue;
                  
                  const foundGroupStudent = bData.students.find((s) => s && s.id === groupPayment.studentId);
                  if (foundGroupStudent) {
                    groupStudent = foundGroupStudent;
                    groupCourseName = c;
                    groupBatchName = b;
                    groupYearName = y;
                    break;
                  }
                }
                if (groupStudent) break;
              }
              if (groupStudent) break;
            }

            if (groupStudent) {
              const alreadyAdded = allGroupMembers.some(m => 
                m.studentInfo.id === groupStudent.id && m.paymentCategory === source.category
              );
              
              if (!alreadyAdded) {
                // Calculate amounts based on payment category
                let groupCourseAmount = 0;
                let groupHostelAmount = 0;
                let groupMessAmount = 0;

                if (source.category === 'course') {
                  groupCourseAmount = groupPayment.amount || 0;
                } else if (source.category === 'hostel') {
                  groupHostelAmount = groupPayment.amount || 0;
                } else if (source.category === 'mess') {
                  groupMessAmount = groupPayment.amount || 0;
                }

                allGroupMembers.push({
                  studentInfo: groupStudent,
                  courseName: groupCourseName,
                  batchName: groupBatchName,
                  yearName: groupYearName,
                  existingPayment: {
                    ...groupPayment,
                    courseAmount: groupCourseAmount,
                    hostelAmount: groupHostelAmount,
                    messAmount: groupMessAmount,
                    totalAmount: groupCourseAmount + groupHostelAmount + groupMessAmount,
                  },
                  isPaid: (groupPayment.amount || 0) > 0,
                  paymentCategory: source.category as 'course' | 'hostel' | 'mess'
                });
              }
            }
          }
        }
      }
    }
  }
}
if (mainPayment && allGroupMembers.length > 0) {
  // 🔄 Merge entries by studentId across categories
  const mergedMembersMap = new Map();
  allGroupMembers.forEach(m => {
    const id = m.studentInfo.id;
    if (!mergedMembersMap.has(id)) {
      mergedMembersMap.set(id, {
        ...m,
        existingPayment: {
          ...m.existingPayment,
          courseAmount: 0,
          hostelAmount: 0,
          messAmount: 0,
          totalAmount: 0,
        }
      });
    }
    const target = mergedMembersMap.get(id);
    target.existingPayment.courseAmount += m.existingPayment.courseAmount || 0;
    target.existingPayment.hostelAmount += m.existingPayment.hostelAmount || 0;
    target.existingPayment.messAmount += m.existingPayment.messAmount || 0;
    target.existingPayment.totalAmount =
      target.existingPayment.courseAmount +
      target.existingPayment.hostelAmount +
      target.existingPayment.messAmount;
    target.existingPayment.amount = target.existingPayment.totalAmount; // compatibility
  });
  const mergedMembers = Array.from(mergedMembersMap.values());

  const totals = mergedMembers.reduce(
    (acc, m) => {
      acc.courseAmount += m.existingPayment.courseAmount || 0;
      acc.hostelAmount += m.existingPayment.hostelAmount || 0;
      acc.messAmount += m.existingPayment.messAmount || 0;
      acc.totalAmount += m.existingPayment.totalAmount || 0;
      return acc;
    },
    { courseAmount: 0, hostelAmount: 0, messAmount: 0, totalAmount: 0 }
   );

   // 🆕 Enhanced: Calculate comprehensive category breakdown
   const categoryBreakdown = {
     courseAmount: totals.courseAmount,
     hostelAmount: totals.hostelAmount,
     messAmount: totals.messAmount,
     totalAmount: totals.totalAmount,
     coursePaymentType: mergedMembers.some(m => (m.existingPayment.courseAmount || 0) > 0) ? 
       (allGroupMembers.filter(m => (m.existingPayment.courseAmount || 0) > 0).length > 1 ? 'group' : 'single') : 'none',
     hostelPaymentType: mergedMembers.some(m => (m.existingPayment.hostelAmount || 0) > 0) ? 
       (allGroupMembers.filter(m => (m.existingPayment.hostelAmount || 0) > 0).length > 1 ? 'group' : 'single') : 'none',
     messPaymentType: mergedMembers.some(m => (m.existingPayment.messAmount || 0) > 0) ? 
       (allGroupMembers.filter(m => (m.existingPayment.messAmount || 0) > 0).length > 1 ? 'group' : 'single') : 'none',
     courseStudentCount: mergedMembers.filter(m => (m.existingPayment.courseAmount || 0) > 0).length,
     hostelStudentCount: mergedMembers.filter(m => (m.existingPayment.hostelAmount || 0) > 0).length,
     messStudentCount: mergedMembers.filter(m => (m.existingPayment.messAmount || 0) > 0).length,
     // Payment method breakdown - aggregate from all payment sources
     onlineAmount: mergedMembers.reduce((sum, m) => sum + (m.existingPayment.onlineAmount || 0), 0),
     offlineAmount: mergedMembers.reduce((sum, m) => sum + (m.existingPayment.offlineAmount || 0), 0),
     // Course details
     courseNames: [...new Set(mergedMembers.map(m => m.courseName))],
     batchNames: [...new Set(mergedMembers.map(m => m.batchName))],
     yearNames: [...new Set(mergedMembers.map(m => m.yearName))],
   };

   return {
     ...mainPayment,
     allGroupMembers: mergedMembers, // ✅ merged
     totalStudentsInGroup: mergedMembers.length,
     studentInfo: mergedMembers[0]?.studentInfo,
     courseName: mergedMembers[0]?.courseName,
     batchName: mergedMembers[0]?.batchName,
     yearName: mergedMembers[0]?.yearName,
     categoryBreakdown, // 🆕 Enhanced category breakdown
     existingPayment: {
       ...mainPayment.existingPayment, // keep original
       courseAmount: categoryBreakdown.courseAmount,
       hostelAmount: categoryBreakdown.hostelAmount,
       messAmount: categoryBreakdown.messAmount,
       totalGroupAmount: 
   (categoryBreakdown.onlineAmount + categoryBreakdown.offlineAmount) > 0
     ? categoryBreakdown.onlineAmount + categoryBreakdown.offlineAmount
     : (categoryBreakdown.courseAmount + categoryBreakdown.hostelAmount + categoryBreakdown.messAmount), // ✅ FIX
        onlineAmount: categoryBreakdown.onlineAmount,
       offlineAmount: categoryBreakdown.offlineAmount
     }
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
    receiptNos: new Set(),
    details: []
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
  const [calculatedUnpaidAmount, setCalculatedUnpaidAmount] = useState(0);

useEffect(() => {
  if (duplicateInfo?.paymentType === 'group') {
    const existingPaymentMembers = duplicateInfo.allGroupMembers || [];
    const currentPaidMemberNames = existingPaymentMembers.map(
      m => m.studentInfo.studentName.trim()
    );

    const allMembers = duplicateInfo.existingPayment.groupStudents
      ? duplicateInfo.existingPayment.groupStudents.split(', ').map(name => name.trim())
      : [];

    const actualTotal = duplicateInfo.existingPayment.totalGroupAmount || 0;
    const actualPaid = existingPaymentMembers.reduce(
      (sum, m) => sum + (m.existingPayment.amount || 0), 0
    );

    const remaining = actualTotal - actualPaid;
    setCalculatedUnpaidAmount(remaining);
  }
}, [duplicateInfo]);

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
    if (hostelGroupEntries.length > 0 && formData.studentName) {
      const updated = [...hostelGroupEntries];
      updated[0].studentName = formData.studentName.toUpperCase();
      setHostelGroupEntries(updated);
    }
  }, [formData.studentName, hostelGroupEntries.length]);
  
  useEffect(() => {
    if (messGroupEntries.length > 0 && formData.studentName) {
      const updated = [...messGroupEntries];
      updated[0].studentName = formData.studentName.toUpperCase();
      setMessGroupEntries(updated);
    }
  }, [formData.studentName, messGroupEntries.length]);
  
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
          console.log("🔄 Updated first entry student name to:", currentStudentName);
        }
      }
    }
  }
}, [dynamicGroupEntries, formData.studentName, paymentType, groupCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddCollegeName = () => {
    if (newCollegeName.trim()) {
      onAddCollegeName(newCollegeName.trim());
      setFormData(prev => ({ ...prev, collegeName: newCollegeName.trim() }));
      setNewCollegeName('');
      setShowNewCollegeInput(false);
    }
  };

  const handleAddBranch = () => {
    if (newBranch.trim()) {
      onAddBranch(newBranch.trim());
      setFormData(prev => ({ ...prev, branch: newBranch.trim() }));
      setNewBranch('');
      setShowNewBranchInput(false);
    }
  };

  const handleAddCourseDuration = () => {
    if (formData.courseDuration && !appData.courseDurations.includes(formData.courseDuration)) {
      onAddCourseDuration(formData.courseDuration);
    }
  };

  const addPayment = () => {
    if (!paymentAmount || !paymentDate) {
      alert('Please fill in payment amount and date');
      return;
    }

    const newPayment = {
      paymentMode,
      amount: parseInt(paymentAmount),
      paymentDate,
      ...(paymentMode === 'online' ? { utrId } : { receiptNo })
    };

    setPayments(prev => [...prev, newPayment]);
    
    // Update total paid
    const newTotalPaid = formData.totalPaid + parseInt(paymentAmount);
    setFormData(prev => ({
      ...prev,
      totalPaid: newTotalPaid,
      remainingFee: prev.courseFee - newTotalPaid
    }));

    // Clear payment fields
    setPaymentAmount('');
    setPaymentDate('');
    setReceiptNo('');
    setUtrId('');
  };

  const removePayment = (index: number) => {
    const removedPayment = payments[index];
    setPayments(prev => prev.filter((_, i) => i !== index));
    
    // Update total paid
    const newTotalPaid = formData.totalPaid - removedPayment.amount;
    setFormData(prev => ({
      ...prev,
      totalPaid: newTotalPaid,
      remainingFee: prev.courseFee - newTotalPaid
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
    if (!formData.mobileNo.trim()) newErrors.mobileNo = 'Mobile number is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.courseDuration) newErrors.courseDuration = 'Course duration is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // ✅ ENHANCED: Check for duplicate student enrollments
    const existingEnrollments = checkForAllStudentEnrollments(formData.studentName, formData.fatherName);
    
    if (existingEnrollments.length > 0 && !editingStudent) {
      console.log("⚠️ Found existing enrollments:", existingEnrollments);
      
      setDuplicateStudentInfo({
        existingEnrollments,
        currentStudent: {
          name: formData.studentName,
          fatherName: formData.fatherName,
          course: selectedCourse,
          year: selectedYear
        }
      });
      setDuplicateStudentModal(true);
      return; // Stop submission until user confirms
    }

    try {
      const student: Student = {
        id: editingStudent?.id || Date.now().toString(),
        ...formData,
        createdAt: editingStudent?.createdAt || new Date().toISOString()
      };

      onAddStudent(selectedYear, selectedCourse, selectedBatch, student);

      // Add payments if any
      for (const payment of payments) {
        onAddPayment(student.id, {
          ...payment,
          type: 'single',
          paymentCategory: 'course'
        });
      }

      // Add group payments if any
      for (const groupPayment of groupPayments) {
        onAddPayment(student.id, {
          paymentMode: 'mixed',
          amount: groupPayment.onlineAmount + groupPayment.offlineAmount,
          onlineAmount: groupPayment.onlineAmount,
          offlineAmount: groupPayment.offlineAmount,
          paymentDate: groupPayment.paymentDate,
          utrId: groupPayment.utrId,
          receiptNo: groupPayment.receiptNo,
          type: 'group',
          paymentCategory: 'course'
        });
      }

      onBack();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving student data');
    }
  };

  // Get unique college names and branches
  const collegeNames = [...new Set(appData.collegeNames || [])];
  const branches = [...new Set(appData.branches || [])];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-300">
            <span className="font-medium">{selectedYear}</span> • 
            <span className="font-medium ml-1">{selectedCourse}</span> • 
            <span className="font-medium ml-1">{selectedBatch}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Student Name *
                </label>
                <input
                  ref={studentNameRef}
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.studentName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter student name"
                />
                {errors.studentName && (
                  <p className="text-red-400 text-sm mt-1">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Father's Name *
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fatherName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter father's name"
                />
                {errors.fatherName && (
                  <p className="text-red-400 text-sm mt-1">{errors.fatherName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mobileNo ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter mobile number"
                />
                {errors.mobileNo && (
                  <p className="text-red-400 text-sm mt-1">{errors.mobileNo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GEN">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="PH">PH</option>
                  <option value="MINORITY">Minority</option>
                  <option value="W">Women</option>
                  <option value="OBC">OBC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  Hostler
                </label>
                <select
                  name="hostler"
                  value={formData.hostler}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Date
                </label>
                <input
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Academic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  College Name *
                </label>
                <div className="flex gap-2">
                  <select
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.collegeName ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select college</option>
                    {collegeNames.map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCollegeInput(!showNewCollegeInput)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {errors.collegeName && (
                  <p className="text-red-400 text-sm mt-1">{errors.collegeName}</p>
                )}
                
                {showNewCollegeInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCollegeName}
                      onChange={(e) => setNewCollegeName(e.target.value)}
                      placeholder="Enter new college name"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddCollegeName}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCollegeInput(false)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Branch *
                </label>
                <div className="flex gap-2">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.branch ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewBranchInput(!showNewBranchInput)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {errors.branch && (
                  <p className="text-red-400 text-sm mt-1">{errors.branch}</p>
                )}
                
                {showNewBranchInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                      placeholder="Enter new branch"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewBranchInput(false)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Duration *
                </label>
                <select
                  name="courseDuration"
                  value={formData.courseDuration}
                  onChange={handleInputChange}
                  onBlur={handleAddCourseDuration}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.courseDuration ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Select duration</option>
                  {appData.courseDurations?.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
                {errors.courseDuration && (
                  <p className="text-red-400 text-sm mt-1">{errors.courseDuration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date *
                </label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="DD.MM.YYYY"
                  readOnly
                />
                {errors.startDate && (
                  <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="text"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD.MM.YYYY"
                  readOnly
                />
              </div>

              {/* 🏨 Hostel Dates - Show only if hostler is Yes */}
              {formData.hostler === 'Yes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Home className="w-4 h-4 inline mr-1" />
                      Hostel Start Date
                    </label>
                    <input
                      type="date"
                      name="hostelStartDate"
                      value={formData.hostelStartDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Home className="w-4 h-4 inline mr-1" />
                      Hostel End Date
                    </label>
                    <input
                      type="date"
                      name="hostelEndDate"
                      value={formData.hostelEndDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fee Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Fee Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Fee
                </label>
                <input
                  type="number"
                  name="courseFee"
                  value={formData.courseFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Paid
                </label>
                <input
                  type="number"
                  name="totalPaid"
                  value={formData.totalPaid}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Remaining Fee
                </label>
                <input
                  type="number"
                  name="remainingFee"
                  value={formData.remainingFee}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {editingStudent ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>

        {/* 🆕 Enhanced Duplicate Student Modal */}
        <Dialog open={duplicateStudentModal} onClose={() => {}} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl w-full bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <Dialog.Title className="text-lg font-semibold text-white">
                  Student Already Enrolled
                </Dialog.Title>
              </div>
              
              {duplicateStudentInfo && (
                <div className="space-y-4">
                  <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                    <p className="text-yellow-200 mb-3">
                      <strong>{duplicateStudentInfo.currentStudent.name}</strong> (Father: {duplicateStudentInfo.currentStudent.fatherName}) 
                      is already enrolled in the following courses:
                    </p>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {duplicateStudentInfo.existingEnrollments.map((enrollment, index) => (
                        <div key={index} className={`p-3 rounded border-l-4 ${
                          enrollment.isActive 
                            ? 'bg-red-900/20 border-red-500' 
                            : 'bg-gray-700/50 border-gray-500'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">
                                {enrollment.yearName} • {enrollment.courseName} • {enrollment.batchName}
                              </p>
                              <p className="text-gray-300 text-sm">
                                End Date: {enrollment.student.endDate || 'Not specified'}
                              </p>
                              {enrollment.isSameCourse && (
                                <p className="text-yellow-400 text-sm font-medium">
                                  ⚠️ Same course as current enrollment
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              enrollment.isActive 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-600 text-gray-300'
                            }`}>
                              {enrollment.isActive ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                      <strong>Current Enrollment:</strong> {duplicateStudentInfo.currentStudent.year} • {duplicateStudentInfo.currentStudent.course}
                    </p>
                  </div>
                  
                  <p className="text-gray-300 text-sm">
                    Do you want to proceed with this enrollment? This will create a new enrollment record for the same student.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => handleDuplicateStudentConfirmation('cancel')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDuplicateStudentConfirmation('proceed')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Proceed Anyway
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentForm;