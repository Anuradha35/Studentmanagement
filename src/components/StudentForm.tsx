```typescript
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
    calculatedEndDate = \`${endDay}.${endMonth}.${endYear}`;
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
      alert(\`Student Name #${i + 1} cannot be blank`);
      document.getElementById(\`studentName-${i}`)?.focus();
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
        endDate: \`${endDay}.${endMonth}.${endYear}`
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
          console.log("🔄






 
