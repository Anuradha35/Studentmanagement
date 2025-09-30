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
    setDuplicateCheckModal(false);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
    setDuplicateInfo(null);
    setPaymentType('single');
    // ✅ Reset flag
  setIsProcessingGroupEntry(false);
    return;
  }

  if (action === 'proceed' && duplicateInfo.paymentType === 'group' && paymentType === 'group') {
    console.log("✅ Processing 'Add to Current Group' action");

    // 🔧 Start guard: ab se duplicate checks ko temporarily disable kar do
    setIsProcessingGroupEntry(true);

    // 🆕 ENHANCED CHECK: Before adding to group, verify current student hasn't already paid
    const currentStudentCheck = hasCurrentStudentAlreadyPaid(
      duplicateInfo.type === 'utr' ? duplicateInfo.value : undefined,
      duplicateInfo.type === 'receipt' ? duplicateInfo.value : undefined
    );

    if (currentStudentCheck.hasAlreadyPaid) {
      console.log("❌ Current student already paid with this method, blocking operation");

      // 🔧 FIX: Close modal IMMEDIATELY before showing alert
      setDuplicateCheckModal(false);
      setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो

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

      setTimeout(() => {
        alert(errorMessage);
        resetFormToCleanState();
        endProcessing();   // 🔚 reset guard
      }, 100);

      return;
    }

    console.log("✅ Student hasn't paid before, proceeding with group addition");

    const existingMember = (duplicateInfo?.allGroupMembers ?? []).find(
  (member) =>
    member?.studentInfo?.studentName?.trim()?.toUpperCase() ===
      formData?.studentName?.trim()?.toUpperCase() &&
    member?.isPaid === true
);


    if (existingMember) {
      console.log("✅ Found matching student in group, using their details");

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

      if (dynamicGroupEntries.length > 0) {
        const updatedEntries = [...dynamicGroupEntries];
        updatedEntries[0] = {
          ...updatedEntries[0],
          studentName: existingMember.studentInfo.studentName,
          amount: ''
        };
        setDynamicGroupEntries(updatedEntries);
      }

      setDuplicateCheckModal(false);
      setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो

      setTimeout(() => {
        alert(`✅ ${existingMember.studentInfo.studentName} has been added to Student #1 position with existing payment details. Please enter the amount for this student.`);
        endProcessing();   // 🔚 reset guard
      }, 100);

    } else {
      console.log("❌ Current student name doesn't match any group member");
     const unpaidMatch = (duplicateInfo?.allGroupMembers ?? []).find(
  (member) =>
    member?.studentInfo?.studentName?.trim()?.toUpperCase() ===
      formData?.studentName?.trim()?.toUpperCase() &&
    member?.isPaid === false
);


      if (unpaidMatch) {
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो

        setTimeout(() => {
          alert(`⚠️ ${unpaidMatch.studentInfo.studentName} is an UNPAID group member.\n\n` +
            `This student exists in the group but has not made any payment yet.\n` +
            `Please record a payment before trying to link.`);
          endProcessing();   // 🔚 reset guard
        }, 100);

        return;
      } else {
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
          endProcessing();   // 🔚 reset guard
        }, 100);

        return;
      }
    }
  }
};
// Function to clear saved unpaid amount
const clearSavedUnpaidAmount = () => {
  console.log("🧹 Clearing saved unpaid amount");
  setSavedUnpaidAmount(0);
  setUnpaidMemberName('');
};



const handlePaymentTypeChange = (newPaymentType) => {
  
  if (paymentType !== newPaymentType) {

    unlockPaymentFields();
    setCurrentPaymentType(newPaymentType);
    // Clear saved unpaid amount when switching payment types
    console.log("🔄 Payment type changed to:", newPaymentType);
    clearSavedUnpaidAmount();
  // ✅ CRITICAL: Automatically clear ALL payment histories (like X button click)
  console.log("🧹 Auto-clearing payment histories...");
    
    if (paymentType === 'single' && newPaymentType === 'group') {
      // Switching from Single to Group
      console.log("📤 Clearing Single payment history:", payments);
      // ✅ Clear Single Payment fields
      setPaymentMode('');
      setPaymentAmount('');
      setPaymentDate('');
      setUtrId('');
      setReceiptNo('');
      
      // ✅ Clear Single Payment History
      setPayments([]);
      
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
      // Switching from Group to Single
      console.log("📤 Clearing Group payment history:", groupPayments);
      // ✅ Clear Group Payment fields
      setGroupPaymentDate('');
      setGroupOnlineAmount('');
      setGroupOfflineAmount('');
      setGroupUtrId('');
      setGroupReceiptNo('');
      setPaymentFieldsReadOnly(false);
      // ✅ Clear Group Payment History
      setGroupPayments([]);
      
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
    
    // ✅ Reset Hostel/Mess prefill selections to "None"
    setHostelPrefillSelection('none');
    setMessPrefillSelection('none');
    
   // Clear Hostel locked states and inputs
   setHostelLockDate(false);
   setHostelLockReceipt(false);
   setHostelLockUtr(false);
   setHostelFieldsReadOnly(false);
   clearHostelInputs();
   
   // Clear Mess locked states and inputs
   setMessLockDate(false);
   setMessLockReceipt(false);
   setMessLockUtr(false);
   setMessFieldsReadOnly(false);
   clearMessInputs();
   // Clear any payment validation errors
   setErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors.paymentAmount;
    delete newErrors.paymentDate;
    delete newErrors.utrId;
    delete newErrors.receiptNo;
    delete newErrors.paymentMode;
    delete newErrors.groupPayments;
    return newErrors;
  });
  
  console.log("✅ Payment type switch completed - all histories cleared");

  }
  
  setPaymentType(newPaymentType);
};

// Debug function to verify clearing worked
const debugPaymentState = () => {
  console.log("🐛 DEBUG Payment State:", {
    paymentType,
    paymentsCount: (payments || []).length,
    groupPaymentsCount: (groupPayments || []).length,
    payments: payments || [],
    groupPayments: groupPayments || []
  });
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
  const details: Array<{
    studentId: string;
    studentName: string;
    payment: any;
    unpaidAmount: number;
  }> = [];

  // Collect all existing UTR IDs, receipt numbers, and unpaid amounts
  Object.values(appData.years).forEach(year => {
    Object.values(year).forEach(course => {
      Object.values(course).forEach(batch => {
        if (!Array.isArray(batch.students)) return;

        batch.students.forEach(student => {
          // Collect this student's payments
          const studentPayments = (appData.payments || []).filter(
            p => p.studentId === student.id
          );

          studentPayments.forEach(existingPayment => {
            let unpaidAmount = 0;

            // If group payment, calculate unpaid amount
            if (existingPayment.type === "group") {
              const totalGroupAmount = existingPayment.totalGroupAmount || 0;
              const paidByThisStudent = existingPayment.amount || 0;
              unpaidAmount = totalGroupAmount - paidByThisStudent;
            }

            // Track UTR/Receipt numbers
            if (existingPayment.utrId) utrIds.add(existingPayment.utrId);
            if (existingPayment.receiptNo) receiptNos.add(existingPayment.receiptNo);

            // Save detailed info
            details.push({
              studentId: student.id,
              studentName: student.studentName,
              payment: existingPayment,
              unpaidAmount
            });
          });
        });
      });
    });
  });

  setExistingPayments({ utrIds, receiptNos, details });
}, [appData]);

useEffect(() => {
  // When component mounts or page loads
  unlockPaymentFields();
}, []);

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
 
  const checkForDuplicatePayment = async (value, type) => {
    if (!value || value.trim() === '') return null;
  
    // Check in all payment arrays
    const allPaymentSources = [
      { payments: payments, source: 'course', paymentType: paymentType },
      { payments: groupPayments, source: 'course', paymentType: 'group' },
      { payments: hostelPayments, source: 'hostel', paymentType: hostelPaymentType },
      { payments: messPayments, source: 'mess', paymentType: messPaymentType }
    ];
  
    let duplicateResults = [];
  
    for (const source of allPaymentSources) {
      const duplicateInSource = source.payments.find(payment => {
        if (type === 'utr') {
          return payment.utrId && payment.utrId.toLowerCase() === value.toLowerCase();
        } else if (type === 'receipt') {
          return payment.receiptNo && payment.receiptNo.toLowerCase() === value.toLowerCase();
        }
        return false;
      });
  
      if (duplicateInSource) {
        duplicateResults.push({
          ...duplicateInSource,
          source: source.source,
          paymentType: source.paymentType
        });
      }
    }
  
    return duplicateResults.length > 0 ? duplicateResults : null;
  };
  // 🔹 Hostel UTR change handler
const handleHostelUtrChange = (value: string) => {
  setHostelIndividualUtrId(value);

  // Auto check on 12 digits
  if (value.trim().length === 12) {
    const duplicate = findDuplicatePaymentWithAllMembers(value, undefined);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
    }
  }
};

// 🔹 Hostel Receipt blur handler
const handleHostelReceiptBlur = () => {
  if (hostelIndividualReceiptNo.trim()) {
    const duplicate = findDuplicatePaymentWithAllMembers(undefined, hostelIndividualReceiptNo);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
    }
  }
};

// 🔹 Mess UTR change handler
const handleMessUtrChange = (value: string) => {
  setMessIndividualUtrId(value);

  if (value.trim().length === 12) {
    const duplicate = findDuplicatePaymentWithAllMembers(value, undefined);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
    }
  }
};

// 🔹 Mess Receipt blur handler
const handleMessReceiptBlur = () => {
  if (messIndividualReceiptNo.trim()) {
    const duplicate = findDuplicatePaymentWithAllMembers(undefined, messIndividualReceiptNo);
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateCheckModal(true);
    }
  }
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
     
      const allStudents = dynamicGroupEntries
      .filter(entry => entry.studentName?.trim())
      .map(entry => entry.studentName.trim())
      .join(', ');
    const newGroupPayment = {
      studentName: student1Name,
      student1Amount,
      otherStudents,
      otherStudentsAmount,amount: totalPayment, // ✅ ADD: Total amount for ViewStudents
      total: student1Amount + otherStudentsAmount,
      onlineAmount: onlineAmount,
      offlineAmount: offlineAmount,
      utrId: onlineAmount > 0 ? groupUtrId : undefined,
      receiptNo: offlineAmount > 0 ? groupReceiptNo : undefined,
      paymentDate: groupPaymentDate,
      groupStudents: allStudents, // ✅ ADD THIS for consistency
      paymentCategory: 'course', // ✅ ADD THIS for proper categorization
      type: 'group' // ✅ ADD THIS to identify as group payment
    };
  
    setGroupPayments((prev) => [...prev, newGroupPayment]);
  // 🔒 LOCK FIELDS after successful payment entry
  setPaymentFieldsReadOnly(true);
  console.log("🔒 Fields locked after adding group payment");
    
  }
   // ✅ Reset the processing flag after saving
    setIsProcessingGroupEntry(false);
  };

  const unlockPaymentFields = () => {
    setPaymentFieldsReadOnly(false);
    console.log("🔓 Payment fields unlocked");
  };
  const handlePageRefresh = () => {
    unlockPaymentFields();
    // Add your other refresh logic here
  };
  const handlePaymentModeSwitch = () => {
    unlockPaymentFields();
    // Add your payment mode switch logic here
  };
  const handleClearCourseHistory = () => {
    unlockPaymentFields();
    
    // Reset all group payment related states
    setGroupPayments([]);
    
    setGroupPaymentDate('');
    setGroupOnlineAmount('');
    setGroupOfflineAmount('');
    setGroupUtrId('');
    setGroupReceiptNo('');
    setErrors({});

    // 🎯 BLANK STUDENT NAMES #2 to #n (keep Student #1 intact)
  const clearedEntries = dynamicGroupEntries.map((entry, index) => ({
    ...entry,
    studentName: index === 0 ? entry.studentName : '', // 📝 Keep Student #1, blank others
    amount: index === 0 ? '' : entry.amount // Clear Student #1 amount only
  }));
  
  setDynamicGroupEntries(clearedEntries);
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
if (!formData.registrationDate.trim()) {
  newErrors.registrationDate = 'Registration date is required';
} else if (
  formData.registrationDate.length !== 10 ||
  !validateDate(formData.registrationDate)
) {
  newErrors.registrationDate = 'Please enter a valid date (DD.MM.YYYY)';
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
 
// ✅ Hostel Payment Validation
// ✅ Skip hostel validation if student is not a hosteler
if (formData.hostler === "Yes") {
  if (!formData.hostelStartDate?.trim()) {
    newErrors.hostelStartDate = "Hostel start date is required";
  } else if (
    formData.hostelStartDate.length !== 10 ||
    !validateDate(formData.hostelStartDate)
  ) {
    newErrors.hostelStartDate = "Please enter a valid hostel start date (DD.MM.YYYY)";
  }

  // Hostel end date validation
  if (!formData.hostelEndDate?.trim()) {
    newErrors.hostelEndDate = "Hostel end date is required";
  } else if (
    formData.hostelEndDate.length !== 10 ||
    !validateDate(formData.hostelEndDate)
  ) {
    newErrors.hostelEndDate = "Please enter a valid hostel end date (DD.MM.YYYY)";
  }
  
if (!hostelPaymentType) {
  newErrors.hostelPaymentType = "Please select a hostel payment method (Single or Group)";
} else {
  if (hostelPaymentType === "single" && hostelPayments.length === 0) {
    newErrors.hostelPaymentType = "Please add at least one hostel payment before submitting";
  }
  if (hostelPaymentType === "group" && hostelPayments.length === 0) {
    newErrors.hostelPaymentType = "Please add at least one hostel group payment before submitting";
  }
}


// ✅ Mess Payment Validation

 
if (!messPaymentType) {
  newErrors.messPaymentType = "Please select a mess payment method (Single or Group)";
} else {
  if (messPaymentType === "single" && messPayments.length === 0) {
    newErrors.messPaymentType = "Please add at least one mess payment before submitting";
  }
  if (messPaymentType === "group" && messPayments.length === 0) {
    newErrors.messPaymentType = "Please add at least one mess group payment before submitting";
  }
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

 // 🆕 ENHANCED: Global payment duplicate validation with GROUP MEMBER support
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
    if (formData.hostler === "Yes") {
    // -------------------------
    // ✅ COURSE PAYMENTS
    // -------------------------
    if (paymentType === "single") {
      payments.forEach((payment) => {
        onAddPayment(student.id, {
          ...payment,
          paymentDate: payment.paymentDate,
          type: "single",
          paymentCategory: "course",
          courseAmount: Number(payment.amount) || 0,
          hostelAmount: 0,
          messAmount: 0,
        });
      });
    }

    if (paymentType === "group" && dynamicGroupEntries.length > 0) {
      const groupId = `group_${Date.now()}`;
      const totalOnlineAmount = parseInt(groupOnlineAmount || "0");
      const totalOfflineAmount = parseInt(groupOfflineAmount || "0");
      const mainStudentAmount = parseInt(dynamicGroupEntries[0]?.amount || "0");

      student.totalPaid = mainStudentAmount;
      student.remainingFee = student.courseFee - mainStudentAmount;

      onAddPayment(student.id, {
        groupId,
        studentName: student.studentName,
        amount: mainStudentAmount,
        totalGroupAmount: totalOnlineAmount + totalOfflineAmount,
        onlineAmount: totalOnlineAmount,
        offlineAmount: totalOfflineAmount,
        ...(totalOnlineAmount > 0 ? { utrId: groupUtrId } : {}),
        ...(totalOfflineAmount > 0 ? { receiptNo: groupReceiptNo } : {}),
        paymentDate: groupPaymentDate,
        type: "group",
        paymentCategory: "course",
        courseAmount: mainStudentAmount,
        hostelAmount: 0,
        messAmount: 0,
        groupStudents: dynamicGroupEntries.map((e) => e.studentName).join(", "),
        students: dynamicGroupEntries.map((e) => ({ name: e.studentName, amount: parseInt(e.amount || '0') || 0 })),
        studentIndex: 0,
      });
    }

    // -------------------------
    // ✅ HOSTEL PAYMENTS
    // -------------------------
   
      if (hostelPaymentType === "single") {
        hostelPayments.forEach((payment) => {
          const { paymentMode, ...rest } = payment as any;
          const payload = (paymentMode === 'mixed') ? rest : { paymentMode, ...rest };
          onAddPayment(student.id, {
            ...(payload as any),
            type: "single",
            paymentCategory: "hostel",courseAmount: 0,
            hostelAmount: Number((payload as any).amount) || 0,
            messAmount: 0,
          });
        });
      }

      if (hostelPaymentType === "group" && hostelGroupEntries.length > 0) {
        const groupId = `hostel_group_${Date.now()}`;
        const totalOnlineAmount = parseInt(hostelGroupOnlineAmount || "0");
        const totalOfflineAmount = parseInt(hostelGroupOfflineAmount || "0");
        const mainStudentAmount = parseInt(hostelGroupEntries[0]?.amount || "0");
        const latestGroup = [...hostelPayments].reverse().find((p: any) => p.type === 'group');
               const utrIdVal = latestGroup ? latestGroup.utrId : hostelGroupUtrId;
        const receiptVal = latestGroup ? latestGroup.receiptNo : hostelGroupReceiptNo;
        const dateVal = latestGroup ? latestGroup.paymentDate : hostelGroupPaymentDate;
        const groupStudentsVal = latestGroup ? (latestGroup.groupStudents || latestGroup.studentNames) : hostelGroupEntries.map((e) => e.studentName).join(", ");
        const computedHostelMainAmount = latestGroup ? (parseInt(latestGroup?.students?.[0]?.amount || 0) || 0) : (parseInt(hostelGroupEntries[0]?.amount || "0") || 0);
       

        onAddPayment(student.id, {
          groupId,
          studentName: student.studentName,
          amount: mainStudentAmount,
          totalGroupAmount: totalOnlineAmount + totalOfflineAmount,
          onlineAmount: totalOnlineAmount,
          offlineAmount: totalOfflineAmount,
          ...(totalOnlineAmount > 0 ? { utrId: hostelGroupUtrId } : {}),
          ...(totalOfflineAmount > 0 ? { receiptNo: hostelGroupReceiptNo } : {}),
          paymentDate: hostelGroupPaymentDate,
          type: "group",
          paymentCategory: "hostel",
          groupStudents: hostelGroupEntries.map((e) => e.studentName).join(", "),
          studentIndex: 0,
          courseAmount: 0,
          hostelAmount: mainStudentAmount,
          messAmount: 0,
        
          students: hostelGroupEntries.map((e) => ({ name: e.studentName, amount: parseInt(e.amount || '0') || 0 })),
          
        });
      }
    

    // -------------------------
    // ✅ MESS PAYMENTS
    // -------------------------
      if (messPaymentType === "single") {
        messPayments.forEach((payment) => {
          const { paymentMode, ...rest } = payment as any;
          const payload = (paymentMode === 'mixed') ? rest : { paymentMode, ...rest };
          onAddPayment(student.id, {
            ...(payload as any),
            type: "single",
            paymentCategory: "mess", courseAmount: 0,
            hostelAmount: 0,
            messAmount: Number((payload as any).amount) || 0,
          });
        });
      }

      if (messPaymentType === "group" && messGroupEntries.length > 0) {
        const latestGroup = [...messPayments].reverse().find((p: any) => p.type === 'group');
         const utrIdVal = latestGroup ? latestGroup.utrId : messGroupUtrId;
        const receiptVal = latestGroup ? latestGroup.receiptNo : messGroupReceiptNo;
        const dateVal = latestGroup ? latestGroup.paymentDate : messGroupPaymentDate;
        const groupStudentsVal = latestGroup ? (latestGroup.groupStudents || latestGroup.studentNames) : messGroupEntries.map((e) => e.studentName).join(", ");
        const computedMessMainAmount = latestGroup ? (parseInt(latestGroup?.students?.[0]?.amount || 0) || 0) : (parseInt(messGroupEntries[0]?.amount || "0") || 0);
        const groupId = `mess_group_${Date.now()}`;
        const totalOnlineAmount = parseInt(messGroupOnlineAmount || "0");
        const totalOfflineAmount = parseInt(messGroupOfflineAmount || "0");
        const mainStudentAmount = parseInt(messGroupEntries[0]?.amount || "0");

        onAddPayment(student.id, {
          
          groupId,
          studentName: student.studentName,
          amount: mainStudentAmount,
          totalGroupAmount: totalOnlineAmount + totalOfflineAmount,
          onlineAmount: totalOnlineAmount,
          offlineAmount: totalOfflineAmount,
          ...(totalOnlineAmount > 0 ? { utrId: messGroupUtrId } : {}),
          ...(totalOfflineAmount > 0 ? { receiptNo: messGroupReceiptNo } : {}),
          paymentDate: messGroupPaymentDate,
          type: "group",
          paymentCategory: "mess",
          groupStudents: messGroupEntries.map((e) => e.studentName).join(", "),
          studentIndex: 0,courseAmount: 0,
          hostelAmount: 0,
          messAmount: mainStudentAmount,
          students: messGroupEntries.map((e) => ({ name: e.studentName, amount: parseInt(e.amount || '0') || 0 })),
      
        });
      }
    }
    else if(formData.hostler === "No"){
      // -------------------------
    // ✅ COURSE PAYMENTS
    // -------------------------
    if (paymentType === "single") {
      payments.forEach((payment) => {
        onAddPayment(student.id, {
          ...payment,
          paymentDate: payment.paymentDate,
          type: "single",
          paymentCategory: "course",
          courseAmount: Number(payment.amount) || 0,
          hostelAmount: 0,
          messAmount: 0,
        });
      });
    }

    if (paymentType === "group" && dynamicGroupEntries.length > 0) {
      const groupId = `group_${Date.now()}`;
      const totalOnlineAmount = parseInt(groupOnlineAmount || "0");
      const totalOfflineAmount = parseInt(groupOfflineAmount || "0");
      const mainStudentAmount = parseInt(dynamicGroupEntries[0]?.amount || "0");

      student.totalPaid = mainStudentAmount;
      student.remainingFee = student.courseFee - mainStudentAmount;

      onAddPayment(student.id, {
        groupId,
        studentName: student.studentName,
        amount: mainStudentAmount,
        totalGroupAmount: totalOnlineAmount + totalOfflineAmount,
        onlineAmount: totalOnlineAmount,
        offlineAmount: totalOfflineAmount,
        ...(totalOnlineAmount > 0 ? { utrId: groupUtrId } : {}),
        ...(totalOfflineAmount > 0 ? { receiptNo: groupReceiptNo } : {}),
        paymentDate: groupPaymentDate,
        type: "group",
        paymentCategory: "course",
        courseAmount: mainStudentAmount,
        hostelAmount: 0,
        messAmount: 0,
        groupStudents: dynamicGroupEntries.map((e) => e.studentName).join(", "),
        students: dynamicGroupEntries.map((e) => ({ name: e.studentName, amount: parseInt(e.amount || '0') || 0 })),
        studentIndex: 0,
      });
    }


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
    // ✅ clear hostel & mess too
    setHostelPayments([]);
    setHostelGroupEntries([]);
    setHostelPaymentType("single");
    setHostelGroupOnlineAmount("");
    setHostelGroupOfflineAmount("");
    setHostelGroupUtrId("");
    setHostelGroupReceiptNo("");
    setHostelGroupPaymentDate("");

    setMessPayments([]);
    setMessGroupEntries([]);
    setMessPaymentType("single");
    setMessGroupOnlineAmount("");
    setMessGroupOfflineAmount("");
    setMessGroupUtrId("");
    setMessGroupReceiptNo("");
    setMessGroupPaymentDate("");

    // Focus on Student Name after adding
    if (studentNameRef.current) {
      studentNameRef.current.focus();
    }

    alert('✅ Student enrolled successfully!');
     // On successful submission, clear saved unpaid amount
    clearSavedUnpaidAmount();
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

 // 🏨 NEW: Hostel & Mess Payment Handler Functions
 // 🏨 FIXED: Hostel Payment Handler Functions
const handleAddHostelPayment = () => {
  const newErrors: { [key: string]: string } = {};
  
  // ✅ Skip hostel validation if student is not a hosteler
  if (formData.hostler !== "Yes") {
    return;
  }
  
  if (hostelPaymentType === 'single') {
    const onlineAmount = parseInt(hostelIndividualAmount || '0') || 0;
    const offlineAmount = parseInt(hostelIndividualOfflineAmount || '0') || 0;
    
    // Prefill-mode specific amount checks
    if (hostelPrefillSelection === 'utr' && onlineAmount <= 0) {
      alert('Please enter Online Amount');
      return;
    }
    if (hostelPrefillSelection === 'receipt' && offlineAmount <= 0) {
      alert('Please enter Offline Amount');
      return;
    }
    if (hostelPrefillSelection === 'both' && (onlineAmount <= 0 || offlineAmount <= 0)) {
      if (onlineAmount <= 0 && offlineAmount <= 0) {
        alert('Please enter Online and Offline Amounts');
      } else if (onlineAmount <= 0) {
        alert('Please enter Online Amount');
      } else {
        alert('Please enter Offline Amount');
      }
      return;
    }
    
    // ✅ NONE mode checks
    if (hostelPrefillSelection === "none") {
      // 1. Both blank
      if (onlineAmount <= 0 && offlineAmount <= 0) {
        alert("Please enter either Online or Offline Amount");
        return;
      }

      // 2. Online entered but no UTR
      if (onlineAmount > 0 && hostelIndividualUtrId.trim().length === 0) {
        alert("Please enter UTR/UPI ID");
        return;
      }

      // 3. UTR entered but no online amount
      if (hostelIndividualUtrId.trim().length > 0 && onlineAmount <= 0) {
        alert("Please enter Online Amount");
        return;
      }

      // 4. Offline entered but no receipt
      if (offlineAmount > 0 && !hostelIndividualReceiptNo.trim()) {
        alert("Please enter Receipt No.");
        return;
      }

      // 5. Receipt entered but no offline amount
      if (hostelIndividualReceiptNo.trim().length > 0 && offlineAmount <= 0) {
        alert("Please enter Offline Amount");
        return;
      }
    }

    if (!hostelIndividualPaymentDate || hostelIndividualPaymentDateError) {
      alert('Please enter a valid payment date');
      return;
    }
    
    // Validate UTR/Receipt based on amounts
    if (onlineAmount > 0 && hostelIndividualUtrId.length !== 12) {
      setHostelUtrError('Please enter 12-digit UTR/UPI ID for online amount');
      return;
    }
    if (offlineAmount > 0 && !hostelIndividualReceiptNo) {
      alert('Please enter Receipt Number for offline amount');
      return;
    }
    
    const totalAmount = onlineAmount + offlineAmount;
    
    // ✅ FIXED: Only check for DUPLICATE within HOSTEL section only
    const isDuplicateInHostel = hostelPayments.some(payment => 
      (onlineAmount > 0 && payment.utrId === hostelIndividualUtrId) ||
      (offlineAmount > 0 && payment.receiptNo === hostelIndividualReceiptNo)
    );

    if (isDuplicateInHostel) {
      alert('This UTR/Receipt is already used in Hostel payments. Please use different details.');
      return;
    }
    
    // ✅ FIXED: Correct payment mode logic
    let paymentMode: 'online' | 'offline' | 'mixed' = 'online';
    if (onlineAmount > 0 && offlineAmount > 0) {
      paymentMode = 'mixed';
    } else if (offlineAmount > 0 && onlineAmount === 0) {
      paymentMode = 'offline';
    } else if (onlineAmount > 0 && offlineAmount === 0) {
      paymentMode = 'online';
    }
    
    const newPayment = {
      paymentMode,
      amount: totalAmount,
      onlineAmount,
      offlineAmount,
      paymentDate: hostelIndividualPaymentDate,
      studentNames: formData.studentName,
      students: [{ 
        name: formData.studentName, 
        amount: totalAmount 
      }],
      ...(offlineAmount > 0 ? { receiptNo: hostelIndividualReceiptNo } : {}),
      ...(onlineAmount > 0 ? { utrId: hostelIndividualUtrId } : {})
    };

    // ✅ REMOVED: Global duplicate check - Only checking within hostel section above

    // Add payment to list
    setHostelPayments([...hostelPayments, newPayment]);
    
    // Update existing payments to prevent duplicates in same session
    if (onlineAmount > 0 && hostelIndividualUtrId) {
      setExistingPayments(prev => ({
        ...prev,
        utrIds: new Set([...prev.utrIds, hostelIndividualUtrId])
      }));
    }
    if (offlineAmount > 0 && hostelIndividualReceiptNo) {
      setExistingPayments(prev => ({
        ...prev,
        receiptNos: new Set([...prev.receiptNos, hostelIndividualReceiptNo])
      }));
    }

    // ✅ Clear hostel error
    setErrors(prev => ({ ...prev, hostelPaymentType: "" }));
    
    // Clear form inputs
    setHostelIndividualPaymentMode('online');
    setHostelIndividualPaymentDate('');
    setHostelIndividualReceiptNo('');
    setHostelIndividualUtrId('');
    setHostelIndividualAmount('');
    setHostelIndividualOfflineAmount('');
    setHostelIndividualPaymentDateError('');
    setHostelUtrError('');

    // Reset prefill selection
    setHostelPrefillSelection('none');
    setHostelLockDate(false);
    setHostelLockReceipt(false);
    setHostelLockUtr(false);
  }
};

const handleAddHostelGroupPayment = () => {
  const newErrors: { [key: string]: string } = {};
  
  // ✅ Skip hostel validation if student is not a hosteler
  if (formData.hostler !== "Yes") {
    return;
  }

  // Validation checks
  if (!hostelGroupPaymentDate || hostelGroupDateError) {
    alert('Please enter a valid payment date');
    return;
  }

  const onlineAmount = parseInt(hostelGroupOnlineAmount || '0') || 0;
  const offlineAmount = parseInt(hostelGroupOfflineAmount || '0') || 0;
  const totalAmount = onlineAmount + offlineAmount;

  // Prefill-mode specific amount checks
  if (hostelPrefillSelection === 'utr' && onlineAmount <= 0) {
    alert('Please enter Online Amount');
    return;
  }
  if (hostelPrefillSelection === 'receipt' && offlineAmount <= 0) {
    alert('Please enter Offline Amount');
    return;
  }
  if (hostelPrefillSelection === 'both' && (onlineAmount <= 0 || offlineAmount <= 0)) {
    if (onlineAmount <= 0 && offlineAmount <= 0) {
      alert('Please enter Online and Offline Amounts');
    } else if (onlineAmount <= 0) {
      alert('Please enter Online Amount');
    } else {
      alert('Please enter Offline Amount');
    }
    return;
  }

  // ✅ NONE mode checks
  if (hostelPrefillSelection === "none") {
    if (onlineAmount <= 0 && offlineAmount <= 0) {
      alert("Please enter either Online or Offline Amount");
      return;
    }

    if (onlineAmount > 0 && hostelGroupUtrId.trim().length === 0) {
      alert("Please enter UTR/UPI ID");
      return;
    }

    if (hostelGroupUtrId.trim().length > 0 && onlineAmount <= 0) {
      alert("Please enter Online Amount");
      return;
    }

    if (offlineAmount > 0 && !hostelGroupReceiptNo.trim()) {
      alert("Please enter Receipt No.");
      return;
    }

    if (hostelGroupReceiptNo.trim().length > 0 && offlineAmount <= 0) {
      alert("Please enter Offline Amount");
      return;
    }
  }

  // UTR validation
  if (onlineAmount > 0 && (!hostelGroupUtrId || hostelGroupUtrId.length !== 12)) {
    alert('Please enter a valid 12-digit UTR/UPI ID for online payment');
    return;
  }

  // Receipt validation
  if (offlineAmount > 0 && !hostelGroupReceiptNo?.trim()) {
    alert('Please enter a receipt number for offline payment');
    return;
  }
 // 🔹 Validate Student #1 amount
 if (!hostelGroupEntries[0] || (hostelGroupEntries[0].amount || 0) <= 0) {
  setHostelGroupAmountError("Please enter amount");
  return;
}
  // Student names validation
  const studentErrors = {};
  hostelGroupEntries.slice(1).forEach((entry, idx) => {
    const fieldIndex = idx + 1;
    if (!entry.studentName?.trim()) {
      studentErrors[fieldIndex] = `Student #${fieldIndex + 1} name is required`;
    }
  });

  if (Object.keys(studentErrors).length > 0) {
    setHostelGroupStudentErrors(studentErrors);
    alert('Please fill all student names');
    return;
  }

  // Amount distribution validation
  const student1Amount = hostelGroupEntries?.[0]?.amount || 0;
const otherStudentsAmount = Math.max(0, totalAmount - student1Amount);

   
  const totalAllocated = hostelGroupEntries.reduce((sum, entry) => student1Amount + (otherStudentsAmount || 0), 0);
  

  // ✅ FIXED: Only check for DUPLICATE within HOSTEL section only
  const isDuplicateInHostel = hostelPayments.some(payment => 
    (onlineAmount > 0 && payment.utrId === hostelGroupUtrId) ||
    (offlineAmount > 0 && payment.receiptNo === hostelGroupReceiptNo)
  );

  if (isDuplicateInHostel) {
    alert('This UTR/Receipt is already used in Hostel payments. Please use different details.');
    return;
  }


  // Create payment record with proper structure
  const paymentMode = onlineAmount > 0 && offlineAmount > 0 ? 'mixed' : 
                     onlineAmount > 0 ? 'online' : 'offline';

  const allStudentNames = hostelGroupEntries
    .filter(entry => entry.studentName?.trim())
    .map(entry => entry.studentName.trim())
    .join(', ');

  const newPayment = {
    amount: totalAmount,
    paymentMode,
    paymentDate: hostelGroupPaymentDate,
    studentNames: allStudentNames, // Keep this for compatibility
    groupStudents: allStudentNames, // ✅ ADD THIS for ViewStudents compatibility
    paymentCategory: 'hostel', // ✅ ADD THIS for proper categorization
    type: 'group', // ✅ ADD THIS to identify as group payment
    onlineAmount,
    offlineAmount,
    students: hostelGroupEntries.map(entry => ({
      name: entry.studentName || formData.studentName,
      amount: entry.amount || 0
    })),
    otherStudentsAmount,
    ...(onlineAmount > 0 && { utrId: hostelGroupUtrId }),
    ...(offlineAmount > 0 && { receiptNo: hostelGroupReceiptNo })
  };

  // Add to hostel payments
  setHostelPayments([...hostelPayments, newPayment]);


  // Update existing payments to prevent duplicates in same session
  if (onlineAmount > 0 && hostelGroupUtrId) {
    setExistingPayments(prev => ({
      ...prev,
      utrIds: new Set([...prev.utrIds, hostelGroupUtrId])
    }));
  }
  if (offlineAmount > 0 && hostelGroupReceiptNo) {
    setExistingPayments(prev => ({
      ...prev,
      receiptNos: new Set([...prev.receiptNos, hostelGroupReceiptNo])
    }));
  }

  // Clear all inputs
  setHostelGroupPaymentDate('');
  setHostelGroupOnlineAmount('');
  setHostelGroupOfflineAmount('');
  setHostelGroupUtrId('');
  setHostelGroupReceiptNo('');
  setHostelGroupDateError('');
  setHostelGroupUtrError('');
  setHostelGroupAmountError('');
  setHostelGroupStudentErrors({});
  
  // Reset entries
  setHostelGroupEntries([
    { studentName: formData.studentName, amount: 0 },
    { studentName: '', amount: 0 }
  ]);

  // Reset prefill selection and locks
  setHostelPrefillSelection('none');
  setHostelFieldsReadOnly(false);
  setHostelLockDate(false);
  setHostelLockReceipt(false);
  setHostelLockUtr(false);
  
  // Clear any errors
  setErrors(prev => ({ ...prev, hostelPaymentType: '' }));
};


// 🍽️ FIXED: Mess Payment Handler Functions
const handleAddMessPayment = () => {
  const newErrors: { [key: string]: string } = {};
  
  if (formData.hostler !== "Yes") {
    return;
  }
  
  if (messPaymentType === 'single') {
    const onlineAmount = parseInt(messIndividualAmount || '0') || 0;
    const offlineAmount = parseInt(messIndividualOfflineAmount || '0') || 0;
    
    // Prefill-mode specific amount checks
    if (messPrefillSelection === 'utr' && onlineAmount <= 0) {
      alert('Please enter Online Amount');
      return;
    }
    if (messPrefillSelection === 'receipt' && offlineAmount <= 0) {
      alert('Please enter Offline Amount');
      return;
    }
    if (messPrefillSelection === 'both' && (onlineAmount <= 0 || offlineAmount <= 0)) {
      if (onlineAmount <= 0 && offlineAmount <= 0) {
        alert('Please enter Online and Offline Amounts');
      } else if (onlineAmount <= 0) {
        alert('Please enter Online Amount');
      } else {
        alert('Please enter Offline Amount');
      }
      return;
    }
    
    // ✅ NONE mode checks
    if (messPrefillSelection === "none") {
      // 1. Both blank
      if (onlineAmount <= 0 && offlineAmount <= 0) {
        alert("Please enter either Online or Offline Amount");
        return;
      }

      // 2. Online entered but no UTR
      if (onlineAmount > 0 && messIndividualUtrId.trim().length === 0) {
        alert("Please enter UTR/UPI ID");
        return;
      }

      // 3. UTR entered but no online amount
      if (messIndividualUtrId.trim().length > 0 && onlineAmount <= 0) {
        alert("Please enter Online Amount");
        return;
      }

      // 4. Offline entered but no receipt
      if (offlineAmount > 0 && !messIndividualReceiptNo.trim()) {
        alert("Please enter Receipt No.");
        return;
      }

      // 5. Receipt entered but no offline amount
      if (messIndividualReceiptNo.trim().length > 0 && offlineAmount <= 0) {
        alert("Please enter Offline Amount");
        return;
      }
    }

    // Date validation
    if (!messIndividualPaymentDate || messIndividualPaymentDate.length < 10) {
      alert('Please enter a valid payment date (DD.MM.YYYY)');
      return;
    }
    
    // Validate UTR/Receipt based on amounts
    if (onlineAmount > 0 && messIndividualUtrId.length !== 12) {
      setMessUtrError('Please enter 12-digit UTR/UPI ID for online amount');
      return;
    }
    if (offlineAmount > 0 && !messIndividualReceiptNo) {
      alert('Please enter Receipt Number for offline amount');
      return;
    }
    
    const totalAmount = onlineAmount + offlineAmount;
    
    // ✅ FIXED: Only check for DUPLICATE within MESS section only
    const isDuplicateInMess = messPayments.some(payment => 
      (onlineAmount > 0 && payment.utrId === messIndividualUtrId) ||
      (offlineAmount > 0 && payment.receiptNo === messIndividualReceiptNo)
    );

    if (isDuplicateInMess) {
      alert('This UTR/Receipt is already used in Mess payments. Please use different details.');
      return;
    }
    
    // ✅ FIXED: Correct payment mode logic
    let paymentMode: 'online' | 'offline' | 'mixed' = 'online';
    if (onlineAmount > 0 && offlineAmount > 0) {
      paymentMode = 'mixed';
    } else if (offlineAmount > 0 && onlineAmount === 0) {
      paymentMode = 'offline';
    } else if (onlineAmount > 0 && offlineAmount === 0) {
      paymentMode = 'online';
    }
    
    const newPayment = {
      paymentMode,
      amount: totalAmount,
      onlineAmount,
      offlineAmount,
      paymentDate: messIndividualPaymentDate,
      studentNames: formData.studentName,
      students: [{ 
        name: formData.studentName, 
        amount: totalAmount 
      }],
      ...(offlineAmount > 0 ? { receiptNo: messIndividualReceiptNo } : {}),
      ...(onlineAmount > 0 ? { utrId: messIndividualUtrId } : {})
    };

    // ✅ REMOVED: Global duplicate check - Only checking within mess section above

    // Add payment to list
    setMessPayments([...messPayments, newPayment]);

    // Update existing payments to prevent duplicates in same session
    if (onlineAmount > 0 && messIndividualUtrId) {
      setExistingPayments(prev => ({
        ...prev,
        utrIds: new Set([...prev.utrIds, messIndividualUtrId])
      }));
    }
    if (offlineAmount > 0 && messIndividualReceiptNo) {
      setExistingPayments(prev => ({
        ...prev,
        receiptNos: new Set([...prev.receiptNos, messIndividualReceiptNo])
      }));
    }

    // ✅ Clear mess error
    setErrors(prev => ({ ...prev, messPaymentType: "" }));
    
    // Clear form inputs
    setMessIndividualPaymentMode('online');
    setMessIndividualPaymentDate('');
    setMessIndividualReceiptNo('');
    setMessIndividualUtrId('');
    setMessIndividualAmount('');
    setMessIndividualOfflineAmount('');
    setMessIndividualPaymentDateError('');
    setMessUtrError('');

    // Reset prefill selection
    setMessPrefillSelection('none');
    setMessLockDate(false);
    setMessLockReceipt(false);
    setMessLockUtr(false);
  }
};

const handleAddMessGroupPayment = () => {
  const newErrors: { [key: string]: string } = {};
  
  if (formData.hostler !== "Yes") {
    return;
  }

  // Validation checks
  if (!messGroupPaymentDate || messGroupDateError) {
    alert('Please enter a valid payment date');
    return;
  }

  const onlineAmount = parseInt(messGroupOnlineAmount || '0') || 0;
  const offlineAmount = parseInt(messGroupOfflineAmount || '0') || 0;
  const totalAmount = onlineAmount + offlineAmount;

  // Prefill-mode specific amount checks
  if (messPrefillSelection === 'utr' && onlineAmount <= 0) {
    alert('Please enter Online Amount');
    return;
  }
  if (messPrefillSelection === 'receipt' && offlineAmount <= 0) {
    alert('Please enter Offline Amount');
    return;
  }
  if (messPrefillSelection === 'both' && (onlineAmount <= 0 || offlineAmount <= 0)) {
    if (onlineAmount <= 0 && offlineAmount <= 0) {
      alert('Please enter Online and Offline Amounts');
    } else if (onlineAmount <= 0) {
      alert('Please enter Online Amount');
    } else {
      alert('Please enter Offline Amount');
    }
    return;
  }

  // ✅ NONE mode checks
  if (messPrefillSelection === "none") {
    if (onlineAmount <= 0 && offlineAmount <= 0) {
      alert("Please enter either Online or Offline Amount");
      return;
    }

    if (onlineAmount > 0 && messGroupUtrId.trim().length === 0) {
      alert("Please enter UTR/UPI ID");
      return;
    }

    if (messGroupUtrId.trim().length > 0 && onlineAmount <= 0) {
      alert("Please enter Online Amount");
      return;
    }

    if (offlineAmount > 0 && !messGroupReceiptNo.trim()) {
      alert("Please enter Receipt No.");
      return;
    }

    if (messGroupReceiptNo.trim().length > 0 && offlineAmount <= 0) {
      alert("Please enter Offline Amount");
      return;
    }
  }

  // UTR validation
  if (onlineAmount > 0 && (!messGroupUtrId || messGroupUtrId.length !== 12)) {
    alert('Please enter a valid 12-digit UTR/UPI ID for online payment');
    return;
  }

  // Receipt validation
  if (offlineAmount > 0 && !messGroupReceiptNo?.trim()) {
    alert('Please enter a receipt number for offline payment');
    return;
  }
 // 🔹 Validate Student #1 amount
 if (!messGroupEntries[0] || (messGroupEntries[0].amount || 0) <= 0) {
  setMessGroupAmountError("Please enter amount");
  return;
}
  // Student names validation
  const studentErrors = {};
  messGroupEntries.slice(1).forEach((entry, idx) => {
    const fieldIndex = idx + 1;
    if (!entry.studentName?.trim()) {
      studentErrors[fieldIndex] = `Student #${fieldIndex + 1} name is required`;
    }
  });

  if (Object.keys(studentErrors).length > 0) {
    setMessGroupStudentErrors(studentErrors);
    alert('Please fill all student names');
    return;
  }
 
 // Amount distribution validation
 const student1Amount = messGroupEntries?.[0]?.amount || 0;
const otherStudentsAmount = Math.max(0, totalAmount - student1Amount);

const totalAllocated = messGroupEntries.reduce(
  (sum, entry) => sum + (entry.amount || 0), 
0);

    
   // const totalAllocated = messGroupEntries.reduce((sum, entry) => student1Amount + (otherStudentsAmount ), 0);
 
  // ✅ FIXED: Only check for DUPLICATE within MESS section only
  const isDuplicateInMess = messPayments.some(payment => 
    (onlineAmount > 0 && payment.utrId === messGroupUtrId) ||
    (offlineAmount > 0 && payment.receiptNo === messGroupReceiptNo)
  );

  if (isDuplicateInMess) {
    alert('This UTR/Receipt is already used in Mess payments. Please use different details.');
    return;
  }

 

 

    // Create payment record with proper structure
    const paymentMode = onlineAmount > 0 && offlineAmount > 0 ? 'mixed' : 
                       onlineAmount > 0 ? 'online' : 'offline';
  
    const allStudentNames = messGroupEntries
      .filter(entry => entry.studentName?.trim())
      .map(entry => entry.studentName.trim())
      .join(', ');
  
    const newPayment = {
      amount: totalAmount,
      paymentMode,
      paymentDate: messGroupPaymentDate,
      studentNames: allStudentNames, // Keep this for compatibility
      groupStudents: allStudentNames, // ✅ ADD THIS for ViewStudents compatibility
      paymentCategory: 'mess', // ✅ ADD THIS for proper categorization
      type: 'group', // ✅ ADD THIS to identify as group payment
      onlineAmount,
      offlineAmount,
      students: messGroupEntries.map(entry => ({
        name: entry.studentName || formData.studentName,
        amount: entry.amount || 0
      })),
      otherStudentsAmount,
      ...(onlineAmount > 0 && { utrId: messGroupUtrId }),
      ...(offlineAmount > 0 && { receiptNo: messGroupReceiptNo })
    };
  
   // Add to mess payments
  setMessPayments([...messPayments, newPayment]);

 

  // Update existing payments to prevent duplicates in same session
  if (onlineAmount > 0 && messGroupUtrId) {
    setExistingPayments(prev => ({
      ...prev,
      utrIds: new Set([...prev.utrIds, messGroupUtrId])
    }));
  }
  if (offlineAmount > 0 && messGroupReceiptNo) {
    setExistingPayments(prev => ({
      ...prev,
      receiptNos: new Set([...prev.receiptNos, messGroupReceiptNo])
    }));
  }

  // Clear all inputs
  setMessGroupPaymentDate('');
  setMessGroupOnlineAmount('');
  setMessGroupOfflineAmount('');
  setMessGroupUtrId('');
  setMessGroupReceiptNo('');
  setMessGroupDateError('');
  setMessGroupUtrError('');
  setMessGroupAmountError('');
  setMessGroupStudentErrors({});
  
  // Reset entries
  setMessGroupEntries([
    { studentName: formData.studentName, amount: 0 },
    { studentName: '', amount: 0 }
  ]);

  // Reset prefill selection and locks
  setMessPrefillSelection('none');
  setMessFieldsReadOnly(false);
  setMessLockDate(false);
  setMessLockReceipt(false);
  setMessLockUtr(false);
  
  // Clear any errors
  setErrors(prev => ({ ...prev, messPaymentType: '' }));
};

  

  const handleHostelGroupCountConfirm = () => {
    if (hostelGroupCount < 2) {
      alert('Please enter at least 2 students for group payment');
      return;
    }
    
    const entries = Array.from({ length: hostelGroupCount }, (_, index) => ({
      studentName: index === 0 ? formData.studentName.toUpperCase() : ``,
      amount: 0
    }));
    
    setHostelGroupEntries(entries);
    setShowHostelGroupModal(false);
  };

  const handleMessGroupCountConfirm = () => {
    if (messGroupCount < 2) {
      alert('Please enter at least 2 students for group payment');
      return;
    }
    
    const entries = Array.from({ length: messGroupCount }, (_, index) => ({
      studentName: index === 0 ? formData.studentName.toUpperCase() : ``,
      amount: 0
    }));
    
    setMessGroupEntries(entries);
    setShowMessGroupModal(false);
  };

  // Helper functions to calculate totals from payment history
  const calculateHostelTotalFromPayments = () => {
    if (hostelPaymentType === 'group') {
      return (parseInt(hostelGroupOnlineAmount || '0') || 0) + (parseInt(hostelGroupOfflineAmount || '0') || 0);
    } else {
      // For single payments, calculate from payment history
      const totalFromHistory = hostelPayments.reduce((sum, payment) => sum + payment.amount, 0);
      // Also add current form amounts if they exist
      const currentOnline = parseInt(hostelIndividualAmount || '0') || 0;
      const currentOffline = parseInt(hostelIndividualOfflineAmount || '0') || 0;
      return totalFromHistory + currentOnline + currentOffline;
    }
  };

  const calculateMessTotalFromPayments = () => {
    if (messPaymentType === 'group') {
      return (parseInt(messGroupOnlineAmount || '0') || 0) + (parseInt(messGroupOfflineAmount || '0') || 0);
    } else {
      // For single payments, calculate from payment history
      const totalFromHistory = messPayments.reduce((sum, payment) => sum + payment.amount, 0);
      // Also add current form amounts if they exist
      const currentOnline = parseInt(messIndividualAmount || '0') || 0;
      const currentOffline = parseInt(messIndividualOfflineAmount || '0') || 0;
      return totalFromHistory + currentOnline + currentOffline;
    }
  };

  // Prefill utility functions for Hostel and Mess payments based on Course payment history
  type PrefillMatchMode = 'utr' | 'receipt' | 'both';
  type PrefillSelection = 'none' | PrefillMatchMode;

  const findMatchingCoursePayment = (utrId?: string, receiptNo?: string, mode: PrefillMatchMode = 'utr') => {
    // Search through course payments (single)
    const coursePayments = appData.payments || [];
    for (const payment of coursePayments) {
      const utrMatches = !!(utrId && payment.utrId === utrId);
      const receiptMatches = !!(receiptNo && payment.receiptNo === receiptNo);
      if (
        (mode === 'utr' && utrMatches) ||
        (mode === 'receipt' && receiptMatches) ||
        (mode === 'both' && utrMatches && receiptMatches)
      ) {
        return { payment } as const;
      }
    }
    return null;
  };

  const findMatchingCourseGroupPayment = (utrId?: string, receiptNo?: string, mode: PrefillMatchMode = 'utr') => {
    // Search through course group payments
    const courseGroupPayments = appData.groupPayments || [];
    for (const groupPayment of courseGroupPayments) {
      const utrMatches = !!(utrId && groupPayment.utrId === utrId);
      const receiptMatches = !!(receiptNo && groupPayment.receiptNo === receiptNo);
      if (
        (mode === 'utr' && utrMatches) ||
        (mode === 'receipt' && receiptMatches) ||
        (mode === 'both' && utrMatches && receiptMatches)
      ) {
        return { groupPayment } as const;
      }
    }
    return null;
  };

  const checkGroupStudentOverlap = (courseGroupStudents: string[], hostelGroupStudents: string[]) => {
    const courseSet = new Set(courseGroupStudents.map(s => s.trim().toLowerCase()));
    const hostelSet = new Set(hostelGroupStudents.map(s => s.trim().toLowerCase()));
    
    let overlapCount = 0;
    for (const student of courseSet) {
      if (hostelSet.has(student)) {
        overlapCount++;
      }
    }
    
    return overlapCount;
  };

  const prefillHostelFromCourse = (utrId?: string, receiptNo?: string, mode: PrefillMatchMode = 'utr') => {
    // 1) Require Course payment history present in this form first
    if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
      alert('Please enter Course payment history first');
      return false;
    }

    // 2) Validate inputs based on selected mode
    if ((mode === 'utr' && !utrId) || (mode === 'receipt' && !receiptNo) || (mode === 'both' && (!utrId || !receiptNo))) {
      // Silently ignore if required inputs are not present
      return false;
    }
    if (!utrId && !receiptNo) return false;
    
    // First check single course payments per mode
    const singleMatch = findMatchingCoursePayment(utrId, receiptNo, mode);
    if (singleMatch) {
      const { payment } = singleMatch;
      
      if (hostelPaymentType === 'single') {
        // Single → Single: Prefill date, amounts, and UTR/Receipt
        setHostelIndividualPaymentDate(payment.paymentDate);
        if (payment.onlineAmount && payment.onlineAmount > 0) {
          setHostelIndividualAmount(payment.onlineAmount.toString());
        }
        if (payment.offlineAmount && payment.offlineAmount > 0) {
          setHostelIndividualOfflineAmount(payment.offlineAmount.toString());
        }
        if (payment.utrId) setHostelIndividualUtrId(payment.utrId);
        if (payment.receiptNo) setHostelIndividualReceiptNo(payment.receiptNo);
        return true;
      } else if (hostelPaymentType === 'group') {
        // Single → Group: Prefill date and amounts
        setHostelGroupPaymentDate(payment.paymentDate);
        if (payment.onlineAmount && payment.onlineAmount > 0) {
          setHostelGroupOnlineAmount(payment.onlineAmount.toString());
        }
        if (payment.offlineAmount && payment.offlineAmount > 0) {
          setHostelGroupOfflineAmount(payment.offlineAmount.toString());
        }
        if (payment.utrId) setHostelGroupUtrId(payment.utrId);
        if (payment.receiptNo) setHostelGroupReceiptNo(payment.receiptNo);
        return true;
      }
    }
    
    // Check course group payments
    const groupMatch = findMatchingCourseGroupPayment(utrId, receiptNo, mode);
    if (groupMatch) {
      const { groupPayment } = groupMatch;
      
      if (hostelPaymentType === 'single') {
        // Group → Single: Check if current student is in the group
        const groupStudents = groupPayment.groupStudents?.split(',').map(s => s.trim()) || [];
        const currentStudentName = formData.studentName.trim().toLowerCase();
        
        if (groupStudents.some(s => s.toLowerCase() === currentStudentName)) {
          // Student is in group, prefill details
          setHostelIndividualPaymentDate(groupPayment.paymentDate);
          if (groupPayment.onlineAmount && groupPayment.onlineAmount > 0) {
            setHostelIndividualAmount(groupPayment.onlineAmount.toString());
          }
          if (groupPayment.offlineAmount && groupPayment.offlineAmount > 0) {
            setHostelIndividualOfflineAmount(groupPayment.offlineAmount.toString());
          }
          if (groupPayment.utrId) setHostelIndividualUtrId(groupPayment.utrId);
          if (groupPayment.receiptNo) setHostelIndividualReceiptNo(groupPayment.receiptNo);
          return true;
        }
      } else if (hostelPaymentType === 'group') {
        // Group → Group: Check for student overlap
        const courseGroupStudents = groupPayment.groupStudents?.split(',').map(s => s.trim()) || [];
        const currentHostelStudents = hostelGroupEntries.map(e => e.studentName.trim());
        
        const overlap = checkGroupStudentOverlap(courseGroupStudents, currentHostelStudents);
        if (overlap > 0) {
          // There's overlap, prefill group details
          setHostelGroupPaymentDate(groupPayment.paymentDate);
          if (groupPayment.onlineAmount && groupPayment.onlineAmount > 0) {
            setHostelGroupOnlineAmount(groupPayment.onlineAmount.toString());
          }
          if (groupPayment.offlineAmount && groupPayment.offlineAmount > 0) {
            setHostelGroupOfflineAmount(groupPayment.offlineAmount.toString());
          }
          if (groupPayment.utrId) setHostelGroupUtrId(groupPayment.utrId);
          if (groupPayment.receiptNo) setHostelGroupReceiptNo(groupPayment.receiptNo);
          
          // Prefill student list if possible
          if (courseGroupStudents.length > 0) {
            const newEntries = courseGroupStudents.map((name, index) => ({
              studentName: index === 0 ? formData.studentName.toUpperCase() : name.toUpperCase(),
              amount: 0
            }));
            setHostelGroupEntries(newEntries);
          }
          return true;
        }
      }
    }
    
    return false;
  };

  const prefillMessFromCourse = (utrId?: string, receiptNo?: string, mode: PrefillMatchMode = 'utr') => {
    // 1) Require Course payment history present in this form first
    if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
      alert('Please enter Course payment history first');
      return false;
    }

    // 2) Validate inputs based on selected mode
    if ((mode === 'utr' && !utrId) || (mode === 'receipt' && !receiptNo) || (mode === 'both' && (!utrId || !receiptNo))) {
      // Silently ignore if required inputs are not present
      return false;
    }
    if (!utrId && !receiptNo) return false;
    
    // First check single course payments per mode
    const singleMatch = findMatchingCoursePayment(utrId, receiptNo, mode);
    if (singleMatch) {
      const { payment } = singleMatch;
      
      if (messPaymentType === 'single') {
        // Single → Single: Prefill date, amounts, and UTR/Receipt
        setMessIndividualPaymentDate(payment.paymentDate);
        if (payment.onlineAmount && payment.onlineAmount > 0) {
          setMessIndividualAmount(payment.onlineAmount.toString());
        }
        if (payment.offlineAmount && payment.offlineAmount > 0) {
          setMessIndividualOfflineAmount(payment.offlineAmount.toString());
        }
        if (payment.utrId) setMessIndividualUtrId(payment.utrId);
        if (payment.receiptNo) setMessIndividualReceiptNo(payment.receiptNo);
        return true;
      } else if (messPaymentType === 'group') {
        // Single → Group: Prefill date and amounts
        setMessGroupPaymentDate(payment.paymentDate);
        if (payment.onlineAmount && payment.onlineAmount > 0) {
          setMessGroupOnlineAmount(payment.onlineAmount.toString());
        }
        if (payment.offlineAmount && payment.offlineAmount > 0) {
          setMessGroupOfflineAmount(payment.offlineAmount.toString());
        }
        if (payment.utrId) setMessGroupUtrId(payment.utrId);
        if (payment.receiptNo) setMessGroupReceiptNo(payment.receiptNo);
        return true;
      }
    }
    
    // Check course group payments
    const groupMatch = findMatchingCourseGroupPayment(utrId, receiptNo, mode);
    if (groupMatch) {
      const { groupPayment } = groupMatch;
      
      if (messPaymentType === 'single') {
        // Group → Single: Check if current student is in the group
        const groupStudents = groupPayment.groupStudents?.split(',').map(s => s.trim()) || [];
        const currentStudentName = formData.studentName.trim().toLowerCase();
        
        if (groupStudents.some(s => s.toLowerCase() === currentStudentName)) {
          // Student is in group, prefill details
          setMessIndividualPaymentDate(groupPayment.paymentDate);
          if (groupPayment.onlineAmount && groupPayment.onlineAmount > 0) {
            setMessIndividualAmount(groupPayment.onlineAmount.toString());
          }
          if (groupPayment.offlineAmount && groupPayment.offlineAmount > 0) {
            setMessIndividualOfflineAmount(groupPayment.offlineAmount.toString());
          }
          if (groupPayment.utrId) setMessIndividualUtrId(groupPayment.utrId);
          if (groupPayment.receiptNo) setMessIndividualReceiptNo(groupPayment.receiptNo);
          return true;
        }
      } else if (messPaymentType === 'group') {
        // Group → Group: Check for student overlap
        const courseGroupStudents = groupPayment.groupStudents?.split(',').map(s => s.trim()) || [];
        const currentMessStudents = messGroupEntries.map(e => e.studentName.trim());
        
        const overlap = checkGroupStudentOverlap(courseGroupStudents, currentMessStudents);
        if (overlap > 0) {
          // There's overlap, prefill group details
          setMessGroupPaymentDate(groupPayment.paymentDate);
          if (groupPayment.onlineAmount && groupPayment.onlineAmount > 0) {
            setMessGroupOnlineAmount(groupPayment.onlineAmount.toString());
          }
          if (groupPayment.offlineAmount && groupPayment.offlineAmount > 0) {
            setMessGroupOfflineAmount(groupPayment.offlineAmount.toString());
          }
          if (groupPayment.utrId) setMessGroupUtrId(groupPayment.utrId);
          if (groupPayment.receiptNo) setMessGroupReceiptNo(groupPayment.receiptNo);
          
          // Prefill student list if possible
          if (courseGroupStudents.length > 0) {
            const newEntries = courseGroupStudents.map((name, index) => ({
              studentName: index === 0 ? formData.studentName.toUpperCase() : name.toUpperCase(),
              amount: 0
            }));
            setMessGroupEntries(newEntries);
          }
          return true;
        }
      }
    }
    
    return false;
  };

  // Fixed radio button onChange handlers - replace your current radio inputs with these
const singlePaymentRadioHandler = (e) => {
  if (paymentType === 'group') {
    console.log("🧹 Clearing Group data when switching to Single");
    
    // Clear Group fields
    setGroupPaymentDate('');
    setGroupOnlineAmount('');
    setGroupOfflineAmount('');
    setGroupUtrId('');
    setGroupReceiptNo('');
    setPaymentFieldsReadOnly(false);
    setGroupStudentName('');
    setDynamicGroupEntries([]);
    setGroupCount(2);
    
    // ✅ CRITICAL: Clear Group Payment History Array
    setGroupPayments([]);
    console.log("✅ Cleared groupPayments array");
    
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
    
    // Reset hostel/mess prefill selections
    setHostelPrefillSelection('none');
    setMessPrefillSelection('none');
  }
  
  setPaymentType(e.target.value);
};

const groupPaymentRadioHandler = (e) => {
  if (paymentType === 'single') {
    console.log("🧹 Clearing Single data when switching to Group");
    
    // Clear Single fields
    setPaymentMode('');
    setPaymentAmount('');
    setPaymentDate('');
    setUtrId('');
    setReceiptNo('');
    
    // ✅ CRITICAL: Clear Single Payment History Array
    setPayments([]);
    console.log("✅ Cleared payments array");
    
    setErrors(prev => ({
      ...prev,
      paymentMode: '',
      paymentAmount: '',
      paymentDate: '',
      utrId: '',
      receiptNo: ''
    }));
    
    // Reset hostel/mess prefill selections
    setHostelPrefillSelection('none');
    setMessPrefillSelection('none');
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
};


  // Helper: get latest payment from current form's Course payment history that satisfies mode
  const getLatestCoursePaymentFromForm = (mode) => {
    // ✅ CRITICAL: Only use current form payments (visible on screen)
    // Don't access any cached/historical data beyond current form state
    // Triple-check that we only use current arrays
  const currentSinglePayments = Array.isArray(payments) ? payments : [];
  const currentGroupPayments = Array.isArray(groupPayments) ? groupPayments : [];
  
  console.log("🔍 Checking current form payments:", {
    singlePayments: currentSinglePayments,
    groupPayments: currentGroupPayments,
    singleCount: currentSinglePayments.length,
    groupCount: currentGroupPayments.length,
    mode: mode
  });
   // If no current payments exist, return null immediately
   if (currentSinglePayments.length === 0 && currentGroupPayments.length === 0) {
    console.log("❌ No current course payments found - arrays are empty");
    return null;
  }
    
    if (mode === 'both') {
      // For 'both' mode, look for separate payments with UTR and Receipt
      const allPayments = [...currentSinglePayments, ...currentGroupPayments];
      
      if (allPayments.length === 0) {
        console.log("❌ No current payments found for 'both' mode");
        return null;
      }
      
      // Find the latest UTR payment from CURRENT data only
      const utrPayment = allPayments
        .filter(p => !!p.utrId)
        .sort((a, b) => {
          const dateA = new Date(a.paymentDate.split('.').reverse().join('-'));
          const dateB = new Date(b.paymentDate.split('.').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        })[0];
      
      // Find the latest Receipt payment from CURRENT data only
      const receiptPayment = allPayments
        .filter(p => !!p.receiptNo)
        .sort((a, b) => {
          const dateA = new Date(a.paymentDate.split('.').reverse().join('-'));
          const dateB = new Date(b.paymentDate.split('.').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        })[0];
      
      // If both exist, combine them
      if (utrPayment && receiptPayment) {
        console.log("✅ Found both UTR and Receipt in current payments");
        return {
          paymentDate: utrPayment.paymentDate, // Use UTR payment date as primary
          utrId: utrPayment.utrId,
          receiptNo: receiptPayment.receiptNo,
          onlineAmount: (utrPayment as any).onlineAmount || (utrPayment as any).amount || 0,
          offlineAmount: (receiptPayment as any).offlineAmount || (receiptPayment as any).amount || 0,
        };
      }
      console.log("❌ Both UTR and Receipt not found in current payments");
      return null;
    }
    
    // For 'utr' and 'receipt' modes, use original logic but ONLY on current data
    const singleMatch = currentSinglePayments
      .slice()
      .reverse()
      .find(p => {
        const hasUtr = !!p.utrId;
        const hasReceipt = !!p.receiptNo;
        if (mode === 'utr') return hasUtr;
        if (mode === 'receipt') return hasReceipt;
        return false;
      });
      
    if (singleMatch) {
      console.log(`✅ Found ${mode} match in current single payments`);
      return {
        paymentDate: singleMatch.paymentDate,
        utrId: singleMatch.utrId,
        receiptNo: singleMatch.receiptNo,
        onlineAmount: (singleMatch as any).onlineAmount || (singleMatch as any).amount || 0,
        offlineAmount: (singleMatch as any).offlineAmount || (singleMatch as any).amount || 0,
      };
    }
    
    const groupMatch = currentGroupPayments
      .slice()
      .reverse()
      .find((g: any) => {
        const hasUtr = !!g.utrId;
        const hasReceipt = !!g.receiptNo;
        if (mode === 'utr') return hasUtr;
        if (mode === 'receipt') return hasReceipt;
        return false;
      });
      
    if (groupMatch) {
      console.log(`✅ Found ${mode} match in current group payments`);
      return {
        paymentDate: groupMatch.paymentDate,
        utrId: groupMatch.utrId,
        receiptNo: groupMatch.receiptNo,
        onlineAmount: groupMatch.onlineAmount || 0,
        offlineAmount: groupMatch.offlineAmount || 0,
      };
    }
    
    console.log(`❌ No ${mode} match found in current payments`);
    return null;
  };
  

  // Clear hostel inputs helper
  const clearHostelInputs = () => {
    setHostelIndividualAmount('');
    setHostelIndividualOfflineAmount('');
    setHostelIndividualUtrId('');
    setHostelIndividualReceiptNo('');
    setHostelIndividualPaymentDate('');
    setHostelGroupOnlineAmount('');
    setHostelGroupOfflineAmount('');
    setHostelGroupUtrId('');
    setHostelGroupReceiptNo('');
    setHostelGroupPaymentDate('');
  };
// Debug function to check current payment state
const debugCurrentPaymentState = () => {
  console.log("🐛 DEBUG - Current Payment State:", {
    paymentType,
    payments: payments || [],
    groupPayments: groupPayments || [],
    paymentAmount,
    paymentDate,
    utrId,
    receiptNo,
    groupPaymentDate,
    groupOnlineAmount,
    groupOfflineAmount,
    groupUtrId,
    groupReceiptNo
  });
};
  // Fixed Prefill hostel from course payment history based on mode
const prefillHostelFromCourseHistory = (mode: PrefillMatchMode) => {
  const latestPayment = getLatestCoursePaymentFromForm(mode);
  if (!latestPayment) {
    return false;
  }

  if (hostelPaymentType === 'single') {
    // Single payment - only prefill date, UTR, receipt (NO AMOUNTS as per requirement)
    setHostelIndividualPaymentDate(latestPayment.paymentDate);
    if (latestPayment.utrId) setHostelIndividualUtrId(latestPayment.utrId);
    if (latestPayment.receiptNo) setHostelIndividualReceiptNo(latestPayment.receiptNo);
   
  } else if (hostelPaymentType === 'group') {
    // Group payment - prefill amounts + other details
    setHostelGroupPaymentDate(latestPayment.paymentDate);
    // ✅ ADD: Prefill student names for group payment (Student #2 to #n)
    if (latestPayment.studentNames && latestPayment.studentNames.length > 1) {
      // Skip Student #1 (index 0), prefill from Student #2 onwards
      setHostelGroupEntries((prev) => {
        const updated = [...prev];
        
        // Ensure we have enough entries for all students
        const requiredEntries = latestPayment.studentNames.length;
        while (updated.length < requiredEntries) {
          updated.push({ studentName: '', amount: 0 });
        }
        
        // Prefill Student #2 to #n (skip index 0)
        for (let i = 1; i < latestPayment.studentNames.length; i++) {
          if (updated[i]) {
            updated[i] = { ...updated[i], studentName: latestPayment.studentNames[i] };
          }
        }
        
        return updated;
      });
    }
    // Prefill amounts based on mode
    if (mode === 'utr') {
      // UTR mode: only online amount + UTR
      if (latestPayment.onlineAmount) {
        setHostelGroupOnlineAmount(latestPayment.onlineAmount.toString());
      }
      if (latestPayment.utrId) setHostelGroupUtrId(latestPayment.utrId);
    } else if (mode === 'receipt') {
      // Receipt mode: only offline amount + receipt
      if (latestPayment.offlineAmount) {
        setHostelGroupOfflineAmount(latestPayment.offlineAmount.toString());
      }
      if (latestPayment.receiptNo) setHostelGroupReceiptNo(latestPayment.receiptNo);
    } else if (mode === 'both') {
      // Both mode: online + offline + UTR + receipt
      if (latestPayment.onlineAmount) {
        setHostelGroupOnlineAmount(latestPayment.onlineAmount.toString());
      }
      if (latestPayment.offlineAmount) {
        setHostelGroupOfflineAmount(latestPayment.offlineAmount.toString());
      }
      if (latestPayment.utrId) setHostelGroupUtrId(latestPayment.utrId);
      if (latestPayment.receiptNo) setHostelGroupReceiptNo(latestPayment.receiptNo);
    }
    
    // Set fields as read-only for group payments when prefilled
    setHostelFieldsReadOnly(true);
  }

  // Set lock states based on what was prefilled
  setHostelLockDate(true);
  if (latestPayment.utrId) setHostelLockUtr(true);
  if (latestPayment.receiptNo) setHostelLockReceipt(true);

  return true;
};

// Fixed Prefill mess from course payment history based on mode
const prefillMessFromCourseHistory = (mode: PrefillMatchMode) => {
  const latestPayment = getLatestCoursePaymentFromForm(mode);
  if (!latestPayment) {
    return false;
  }

  if (messPaymentType === 'single') {
    // Single payment - only prefill date, UTR, receipt (NO AMOUNTS as per requirement)
    setMessIndividualPaymentDate(latestPayment.paymentDate);
    if (latestPayment.utrId) setMessIndividualUtrId(latestPayment.utrId);
    if (latestPayment.receiptNo) setMessIndividualReceiptNo(latestPayment.receiptNo);
  } else if (messPaymentType === 'group') {
    // Group payment - prefill amounts + other details
    setMessGroupPaymentDate(latestPayment.paymentDate);
     // ✅ ADD: Prefill student names for group payment (Student #2 to #n)
    if (latestPayment.studentNames && latestPayment.studentNames.length > 1) {
      // Skip Student #1 (index 0), prefill from Student #2 onwards
      setMessGroupEntries((prev) => {
        const updated = [...prev];
        
        // Ensure we have enough entries for all students
        const requiredEntries = latestPayment.studentNames.length;
        while (updated.length < requiredEntries) {
          updated.push({ studentName: '', amount: 0 });
        }
        
        // Prefill Student #2 to #n (skip index 0)
        for (let i = 1; i < latestPayment.studentNames.length; i++) {
          if (updated[i]) {
            updated[i] = { ...updated[i], studentName: latestPayment.studentNames[i] };
          }
        }
        
        return updated;
      });
    }
    // Prefill amounts based on mode
    if (mode === 'utr') {
      // UTR mode: only online amount + UTR
      if (latestPayment.onlineAmount) {
        setMessGroupOnlineAmount(latestPayment.onlineAmount.toString());
      }
      if (latestPayment.utrId) setMessGroupUtrId(latestPayment.utrId);
    } else if (mode === 'receipt') {
      // Receipt mode: only offline amount + receipt
      if (latestPayment.offlineAmount) {
        setMessGroupOfflineAmount(latestPayment.offlineAmount.toString());
      }
      if (latestPayment.receiptNo) setMessGroupReceiptNo(latestPayment.receiptNo);
    } else if (mode === 'both') {
      // Both mode: online + offline + UTR + receipt
      if (latestPayment.onlineAmount) {
        setMessGroupOnlineAmount(latestPayment.onlineAmount.toString());
      }
      if (latestPayment.offlineAmount) {
        setMessGroupOfflineAmount(latestPayment.offlineAmount.toString());
      }
      if (latestPayment.utrId) setMessGroupUtrId(latestPayment.utrId);
      if (latestPayment.receiptNo) setMessGroupReceiptNo(latestPayment.receiptNo);
    }
    
    // Set fields as read-only for group payments when prefilled
    setMessFieldsReadOnly(true);
  }

  // Set lock states based on what was prefilled
  setMessLockDate(true);
  if (latestPayment.utrId) setMessLockUtr(true);
  if (latestPayment.receiptNo) setMessLockReceipt(true);

  return true;
};

  const clearMessInputs = () => {
    setMessIndividualAmount('');
    setMessIndividualOfflineAmount('');
    setMessIndividualUtrId('');
    setMessIndividualReceiptNo('');
    setMessIndividualPaymentDate('');
    setMessGroupOnlineAmount('');
    setMessGroupOfflineAmount('');
    setMessGroupUtrId('');
    setMessGroupReceiptNo('');
    setMessGroupPaymentDate('');
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



      {/* 🏨 NEW: Hostel Group Modal */}
      <Dialog 
        open={showHostelGroupModal} 
        onClose={() => setShowHostelGroupModal(false)} 
        className="fixed z-50 inset-0 flex items-center justify-center"
        initialFocus={hostelGroupCountRef}
      >
        <div className="bg-black bg-opacity-50 fixed inset-0"></div>
        <Dialog.Panel className="bg-slate-800 border border-green-500/30 rounded-xl p-8 z-50 w-full max-w-md mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Home className="w-6 h-6 text-green-400" />
            <Dialog.Title className="text-xl font-bold text-white">
              Hostel Group Payment Setup
            </Dialog.Title>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                How many students will be in this hostel group payment?
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={hostelGroupCount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setHostelGroupCount(0);
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 2 && num <= 20) {
                      setHostelGroupCount(num);
                    }
                  }
                }}
                ref={hostelGroupCountRef}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hostelGroupCount && hostelGroupCount >= 2) {
                    handleHostelGroupCountConfirm();
                  }
                }}
              />
              <p className="text-gray-400 text-sm mt-2">
                💡 Minimum: 2, Maximum: 20 students
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={() => {
                setShowHostelGroupModal(false);
                setHostelPaymentType('single');
              }} 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type='button'
              onClick={handleHostelGroupCountConfirm}
              disabled={!hostelGroupCount || hostelGroupCount < 2}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>



      {/* 🏨 NEW: Mess Group Modal */}
      <Dialog 
        open={showMessGroupModal} 
        onClose={() => setShowMessGroupModal(false)} 
        className="fixed z-50 inset-0 flex items-center justify-center"
        initialFocus={messGroupCountRef}
      >
        <div className="bg-black bg-opacity-50 fixed inset-0"></div>
        <Dialog.Panel className="bg-slate-800 border border-orange-500/30 rounded-xl p-8 z-50 w-full max-w-md mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="w-6 h-6 text-orange-400" />
            <Dialog.Title className="text-xl font-bold text-white">
              Mess Group Payment Setup
            </Dialog.Title>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                How many students will be in this mess group payment?
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={messGroupCount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setMessGroupCount(0);
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 2 && num <= 20) {
                      setMessGroupCount(num);
                    }
                  }
                }}
                ref={messGroupCountRef}
                className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. 3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && messGroupCount && messGroupCount >= 2) {
                    handleMessGroupCountConfirm();
                  }
                }}
              />
              <p className="text-gray-400 text-sm mt-2">
                💡 Minimum: 2, Maximum: 20 students
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={() => {
                setShowMessGroupModal(false);
                setMessPaymentType('single');
              }} 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type='button'
              onClick={handleMessGroupCountConfirm}
              disabled={!messGroupCount || messGroupCount < 2}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      let nameValue = e.target.value.toUpperCase();

      // ✅ Allow only alphabets and spaces
       // ✅ Sirf alphabets aur space allow
       nameValue = nameValue.replace(/[^A-Za-z\s]/g, "");

       // ✅ Multiple spaces ko ek bana do
       nameValue = nameValue.replace(/\s+/g, " ");
 
       // ✅ Uppercase
       nameValue = nameValue.toUpperCase();
     
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
      }
    }
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
      let fatherValue = e.target.value.toUpperCase();
  // ✅ Sirf alphabets aur space allow
  fatherValue = fatherValue.replace(/[^A-Za-z\s]/g, "");

  // ✅ Multiple spaces ko ek bana do
  fatherValue = fatherValue.replace(/\s+/g, " ");

  // ✅ Uppercase
  fatherValue = fatherValue.toUpperCase();
     
        setFormData({ ...formData, fatherName: fatherValue });
        if (errors.fatherName) setErrors({ ...errors, fatherName: '' });
      }
    }
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
	 <div>
           <label className="block text-gray-300 text-sm font-medium mb-2">
            Registration Date *
            </label>
           <input
    		type="text"
    		value={formData.registrationDate}
    		onChange={(e) =>
      			setFormData({ ...formData, registrationDate: formatDate(e.target.value) })
   		 }
    		placeholder="DD.MM.YYYY"
    		className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white 
               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
  		/>
  		{errors.registrationDate && (
   		 <p className="text-red-400 text-sm mt-1">{errors.registrationDate}</p>
  			)}
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
                      // Reset hostel/mess "Same as..." selections to prevent picking up old group data
                      setHostelPrefillSelection('none');
                      setMessPrefillSelection('none');
          
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
                      setPayments([]); // ✅ ADD THIS LINE
                      
                      setErrors(prev => ({
                        ...prev,
                        paymentMode: '',
                        paymentAmount: '',
                        paymentDate: '',
                        utrId: '',
                        receiptNo: ''
                      }));
                       // Reset hostel/mess "Same as..." selections to prevent picking up old group data
                       setHostelPrefillSelection('none');
                       setMessPrefillSelection('none');
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
              {/* Payment SummaryW */}
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
                        onBlur={() => {
                          // ✅ Don't trigger duplicate check if dialog is open
  if (isDialogOpen) {
    console.log("🚫 Dialog is open, skipping onBlur duplicate check");
    return;
  }
                          if (receiptNo.trim() !== "") {
                            // 🔧 Guard
    if (isProcessingGroupEntry) {
      console.log("🔧 Skipping duplicate modal (processing)");
      return;
    }
                            const duplicate = findDuplicatePaymentWithAllMembers(undefined, receiptNo.trim());
                              if (duplicate) {
                              setDuplicateInfo(duplicate);setActiveDuplicateSource("course");  // ✅ mark source
                              setDuplicateCheckModal(true);
                            }
                             
                            }
                          }
                        }
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
    // 🔧 Guard
    if (isProcessingGroupEntry) {
      console.log("🔧 Skipping duplicate modal (processing)");
      return;
    }
    setDuplicateInfo(duplicate);setActiveDuplicateSource("course");   // ✅ mark source
    setDuplicateCheckModal(true);
    
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
                            onFocus={() => {
    // 🔧 ADDITIONAL FIX: Prevent focus events in readOnly mode
    if (paymentFieldsReadOnly) {
      console.log("🔧 UTR field is readOnly - preventing focus interactions");
      // Blur the field immediately to prevent any interactions
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 0);
    }
  }}
  className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    paymentFieldsReadOnly 
      ? 'bg-slate-800 border-slate-600 cursor-not-allowed opacity-75' 
      : 'bg-slate-700 border-white/30'
  }`}
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
                            onFocus={() => {
    // 🔧 ADDITIONAL FIX: Prevent focus events in readOnly mode
    if (paymentFieldsReadOnly) {
      console.log("🔧 UTR field is readOnly - preventing focus interactions");
      // Blur the field immediately to prevent any interactions
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 0);
    }
  }}
  className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    paymentFieldsReadOnly 
      ? 'bg-slate-800 border-slate-600 cursor-not-allowed opacity-75' 
      : 'bg-slate-700 border-white/30'
  }`}
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
                            onFocus={() => {
    // 🔧 ADDITIONAL FIX: Prevent focus events in readOnly mode
    if (paymentFieldsReadOnly) {
      console.log("🔧 UTR field is readOnly - preventing focus interactions");
      // Blur the field immediately to prevent any interactions
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 0);
    }
  }}
  className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    paymentFieldsReadOnly 
      ? 'bg-slate-800 border-slate-600 cursor-not-allowed opacity-75' 
      : 'bg-slate-700 border-white/30'
  }`}
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
                                    if (isProcessingGroupEntry) {
      console.log("🔧 Skipping duplicate modal (processing)");
      return;
    }
                                    setDuplicateInfo(duplicate);setActiveDuplicateSource("course");   // ✅ mark source
                                    setDuplicateCheckModal(true);
                                   
                                    return;
                                  }
                                }
                                
                                if (errors.groupUtrId) setErrors({ ...errors, groupUtrId: '' });
                              }}
                              
                             onFocus={() => {
    // 🔧 ADDITIONAL FIX: Prevent focus events in readOnly mode
    if (paymentFieldsReadOnly) {
      console.log("🔧 UTR field is readOnly - preventing focus interactions");
      // Blur the field immediately to prevent any interactions
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 0);
    }
  }}
  className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    paymentFieldsReadOnly 
      ? 'bg-slate-800 border-slate-600 cursor-not-allowed opacity-75' 
      : 'bg-slate-700 border-white/30'
  }`}
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
                                // ✅ Don't trigger duplicate check if dialog is open
  if (isDialogOpen) {
    console.log("🚫 Dialog is open, skipping onBlur duplicate check");
    return;
  }
                                 // 🔧 CRITICAL FIX: Don't trigger duplicate check if field is readOnly
    if (paymentFieldsReadOnly) {
      console.log("🔧 Skipping duplicate check - field is in readOnly mode");
      return;
    }
    
    
    
                                if (groupReceiptNo.trim() !== "") {
                                  const duplicate = findDuplicatePaymentWithAllMembers(undefined, groupReceiptNo.trim());
                                  if (duplicate) {
                                    if (isProcessingGroupEntry) {
      console.log("🔧 Skipping duplicate modal (processing)");
      return;
    }
                                    setDuplicateInfo(duplicate);setActiveDuplicateSource("course");   // ✅ mark source
                                    setDuplicateCheckModal(true);
                                   
                                    setGroupReceiptNo('');
                                  }
                                  return;
                                }
                              }}
                               onFocus={() => {
    // 🔧 ADDITIONAL FIX: Prevent focus events in readOnly mode
    if (paymentFieldsReadOnly) {
      console.log("🔧 Field is readOnly - preventing focus interactions");
      // Blur the field immediately to prevent any interactions
      setTimeout(() => {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 0);
    }
  }}
                             className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    paymentFieldsReadOnly 
      ? 'bg-slate-800 border-slate-600 cursor-not-allowed opacity-75' 
      : 'bg-slate-700 border-white/30'
  }`}
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
                      {/* Box 1: Primary Students */}
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

      // ✅ Define group membership check
  const isGroupMember =
  unpaidMemberName &&
  unpaidMemberName.toUpperCase() === formData.studentName.toUpperCase();
console.log("🔍 DEBUG - savedUnpaidAmount:", savedUnpaidAmount);
    console.log("🔍 DEBUG - unpaidMemberName:", unpaidMemberName);
    console.log("🔍 DEBUG - amountNum:", amountNum);
    console.log("🔍 DEBUG - totalGroupPayment:", totalGroupPayment);

  
    if (amountNum > formData.courseFee) {
      window.alert(`Payment amount exceeds Course Fee! Maximum allowed: ₹${formData.courseFee.toLocaleString()}`);
      return;
    }

    if (amountNum > totalGroupPayment) {
      window.alert(`Payment amount exceeds Total Group Payment! Maximum allowed: ₹${totalGroupPayment.toLocaleString()}`);
      return;
    }
    // ✅ Group member check add kiya
    if(isGroupMember   && amountNum > calculatedUnpaidAmount)
    {
      window.alert(`Payment amount exceeds Unpaid Member Remaining Amount From Total Group Payment! ₹${calculatedUnpaidAmount.toLocaleString()}`);
      return;
    }



console.log("🔍amountNum:", amountNum);
    console.log("calculatedUnpaidAmount: ",calculatedUnpaidAmount);
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
      remainingFee:
        prev.courseFee - totalPaid < 0 ? 0 : prev.courseFee - totalPaid
    }));
  }}
  className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white"
/>
{savedUnpaidAmount > 0 && (
  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
    <div className="flex items-center gap-2 text-orange-300">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm font-medium">
        Unpaid Member Detected: {unpaidMemberName} - Max Amount: ₹{calculatedUnpaidAmount.toLocaleString()}
      </span>
    </div>
  </div>
)}


                        {errors[`amount_0`] && (
                          <p className="text-red-400 text-sm">{errors[`amount_0`]}</p>
                        )}
                      </div>

                      {/* Box 2: Other Studentss */}
                      <div className="bg-slate-900 p-4 rounded-lg space-y-2 shadow-lg">
                        <div className="flex flex-wrap gap-2">
                          {dynamicGroupEntries.slice(1).map((entry, index) => (
                            <div key={index + 1} className="flex-1 min-w-[120px]">
                              <input
                                id={`studentName-${index + 1}`}
                                type="text"
                                readOnly={paymentFieldsReadOnly}
                                onChange={(e) => {
                                  let value = e.target.value;

                                  // ✅ Sirf alphabets aur space allow
                                  value = value.replace(/[^A-Za-z\s]/g, "");
                      
                                  // ✅ Multiple spaces ko single bana do
                                  value = value.replace(/\s+/g, " ");
                      
                                  // ✅ Uppercase
                                  value = value.toUpperCase();
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
                                    studentName: value,
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
                              handleClearCourseHistory();
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

        {/* Hostel & Mess Information */}
        {formData.hostler === 'Yes' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Home className="w-6 h-6 text-green-400" />
              HOSTEL & MESS Information
            </h2>

            {/* Date Information Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-white mb-2">HOSTEL START DATE</label>
                <input
                  type="text"
                  value={formData.hostelStartDate}
                  onChange={(e) => {
                                const formatted = formatDate(e.target.value);
                                setFormData(prev => ({ ...prev, hostelStartDate: formatted }));
                                // ✅ error clear karna
      if (errors.hostelStartDate) {
        setErrors(prev => ({ ...prev, hostelStartDate: "" }));
      }
                    }}
                   placeholder="DD.MM.YYYY"
                  maxLength={10}
                  className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.hostelStartDate && (
    <p className="text-red-500 text-sm mt-1">{errors.hostelStartDate}</p>
  )}
              </div>
              <div>
                <label className="block text-sm text-white mb-2">HOSTEL END DATE</label>
                <input
                  type="text"
                  value={formData.hostelEndDate}
                   onChange={(e) => {
                              const formatted = formatDate(e.target.value);
                              setFormData(prev => ({ ...prev, hostelEndDate: formatted }));
                              // ✅ error clear karna
      if (errors.hostelEndDate) {
        setErrors(prev => ({ ...prev, hostelEndDate: "" }));
      }
                           }}

                  placeholder="DD.MM.YYYY"
                  maxLength={10}
                  className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.hostelEndDate && (
    <p className="text-red-500 text-sm mt-1">{errors.hostelEndDate}</p>
  )}
              </div>
            </div>

            {/* Combined Total Amount Display */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-500/20 to-orange-500/20 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2 text-center">HOSTEL & MESS TOTAL AMOUNT</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    ₹{(calculateHostelTotalFromPayments() + calculateMessTotalFromPayments()).toLocaleString()}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    Hostel Rent: ₹{calculateHostelTotalFromPayments().toLocaleString()} + Mess Fee: ₹{calculateMessTotalFromPayments().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Sections - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* HOSTEL PAYMENT Section */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-green-400" />
                  HOSTEL PAYMENT
                </h3>
                
                {/* Hostel Rent Amount Display (from section below) */}
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-300 text-sm font-medium">Hostel Rent Amount:</span>
                    <span className="text-white font-bold text-lg">₹{calculateHostelTotalFromPayments().toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Type Selection */}
                <div className="mb-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="single"
                        checked={hostelPaymentType === 'single'}
                        onChange={() => {
                           // reset prefill state to None as per requirement
                           setHostelPrefillSelection('none');
                           setHostelLockDate(false); 
                           setHostelLockReceipt(false); 
                           setHostelLockUtr(false);
                           clearHostelInputs();
                          // reset all hostel fields first (but keep the amount as it represents total hostel rent)
                          setHostelGroupCount(0);
                          setHostelGroupEntries([]);
                          setHostelGroupPaymentDate('');
                          setHostelGroupOnlineAmount('');
                          setHostelGroupOfflineAmount('');
                          setHostelGroupUtrId('');
                          setHostelGroupReceiptNo('');
                          setHostelGroupDateError('');
                          setHostelGroupUtrError('');
                          setHostelGroupAmountError('');
                          setHostelIndividualPaymentMode('online');
                          setHostelIndividualPaymentDate('');
                          setHostelIndividualReceiptNo('');
                          setHostelIndividualUtrId('');
                          setHostelIndividualPaymentDateError('');
                          setHostelUtrError('');
                          setHostelPayments([]);
                          setHostelPaymentType('single');
                          
                          setHostelGroupStudentErrors({});  setHostelFieldsReadOnly(false); // ✅ disable hostel fields read-only
             
                        }}
                        className="text-green-500"
                      />
                      <span className="text-white">Single Hostel Payment</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="group"
                        checked={hostelPaymentType === 'group'}
                        onChange={() => {
                          // reset single inputs (but keep the amount as it represents total hostel rent)
                          setHostelIndividualPaymentMode('online');
                          setHostelIndividualPaymentDate('');
                          setHostelIndividualReceiptNo('');
                          setHostelIndividualUtrId('');
                          setHostelIndividualPaymentDateError('');
                          setHostelUtrError('');
                          setHostelPayments([]);
                          // reset prefill state to None as per requirement
                          setHostelPrefillSelection('none');
                          setHostelLockDate(false); 
                          setHostelLockReceipt(false); 
                          setHostelLockUtr(false);
                          clearHostelInputs();
                          // reset group inputs
                          setHostelGroupCount(0);
                          setHostelGroupEntries([]);
                          setHostelGroupPaymentDate('');
                          setHostelGroupOnlineAmount('');
                          setHostelGroupOfflineAmount('');
                          setHostelGroupUtrId('');
                          setHostelGroupReceiptNo('');
                          setHostelGroupDateError('');
                          setHostelGroupUtrError('');
                          setHostelGroupAmountError('');
                          // switch and open modal
                          setHostelPaymentType('group');
                          setShowHostelGroupModal(true);
                          
                          setHostelGroupStudentErrors({});setHostelFieldsReadOnly(false); // ✅ disable hostel fields read-only
                        }}
                        className="text-green-500"
                      />
                      <span className="text-white">Group Hostel Payment</span>
                    </label>
                  </div>
                </div>
                

                {/* Add Payment Subsection */}
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-white font-medium mb-3">Add Payment</h4>
                  
                  {/* Prefill from Course Payment Options */}
                  {/** Selection state for Hostel prefill mode **/}
                  {/* We store locally using useState above via React closure; define once per component scope */}
                  <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      
                      <div className="flex items-center gap-3 text-xs text-blue-100">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="hostel-prefill-mode"
                            checked={hostelPrefillSelection==='none'}
                            onChange={() => {
                              setHostelPrefillSelection('none');
                              setHostelGroupEntries((prev) =>
                                prev.map((entry, idx) =>
                                  idx === 0 ? { ...entry, amount: 0 } : { ...entry, studentName: '' }
                                )
                              );
                              setHostelGroupAmountError('');
                              setHostelLockDate(false); setHostelLockReceipt(false); setHostelLockUtr(false);
                              clearHostelInputs();
                              setHostelPayments([]);
                              setHostelGroupStudentErrors({});setHostelFieldsReadOnly(false); // ✅ disable hostel fields read-only
                            }}
                          />
                          <span>None</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="hostel-prefill-mode"
                            checked={hostelPrefillSelection==='utr'}
                            onChange={() => {
                              clearHostelInputs();
                              setHostelGroupStudentErrors({});setHostelFieldsReadOnly(false); // ✅ disable hostel fields read-only
                              setHostelPayments([]);
                              if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
                                alert('Please enter Course payment History first');
                                setHostelPrefillSelection('none');
                                return;
                              }
                              setHostelGroupEntries((prev) =>
                                prev.map((entry, idx) =>
                                  idx === 0 ? { ...entry, studentName: formData.studentName.toUpperCase(), amount: 0 }
                              : { ...entry, studentName: '' }
                                )
                              );
                              setHostelGroupAmountError('');
                              setHostelPrefillSelection('utr');
                              
                              const success = prefillHostelFromCourseHistory('utr');
                              if (success) {
                                alert('✅ Hostel details prefilled using UTR/UPI match');
                               
                              } else {
                                alert('❌ No matching Course payment in this form history');
                                setHostelPrefillSelection('none');
                              }
                            }}
                          />
                          <span>Same as UTR/UPI</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="hostel-prefill-mode"
                            checked={hostelPrefillSelection==='receipt'}
                                                        onChange={() => {
                              clearHostelInputs();setHostelGroupStudentErrors({});
                              setHostelPayments([]);setHostelFieldsReadOnly(false); // ✅ disable hostel fields read-only
                              if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
                                alert('Please enter Course payment History first');
                                setHostelPrefillSelection('none');
                                return;
                              }
                              setHostelGroupEntries((prev) =>
                                prev.map((entry, idx) =>
                                  idx === 0 ? { ...entry, studentName: formData.studentName.toUpperCase(), amount: 0 }
                              : { ...entry, studentName: '' }
                                )
                              );
                              setHostelGroupAmountError('');
                              setHostelPrefillSelection('receipt');
                              
                              const success = prefillHostelFromCourseHistory('receipt');
                              if (success) {
                                alert('✅ Hostel details prefilled using Receipt match');
                               
                              } else {
                                alert('❌ No matching Course payment in this form history');
                                setHostelPrefillSelection('none');
                              }
                            }}
                          />
                          <span>Same as Receipt No.</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="hostel-prefill-mode"
                            checked={hostelPrefillSelection==='both'}
                            onChange={() => {
                              clearHostelInputs();setHostelGroupStudentErrors({});
                              setHostelPayments([]);setHostelFieldsReadOnly(false); // ✅ disable hostel fields read-only
                              if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
                                alert('Please enter Course payment History first');
                                setHostelPrefillSelection('none');
                                return;
                              }
                              setHostelGroupEntries((prev) =>
                                prev.map((entry, idx) =>
                                  idx === 0 ? { ...entry, studentName: formData.studentName.toUpperCase(), amount: 0 }
                              : { ...entry, studentName: '' }
                                )
                              );
                              setHostelGroupAmountError('');
                              setHostelPrefillSelection('both');
                              const success = prefillHostelFromCourseHistory('both');
                              
                              if (success) {
                                alert('✅ Hostel details prefilled using Both (UTR + Receipt)');
                               
                              } else {
                                alert('❌ No matching Course payment in this form history');
                                setHostelPrefillSelection('none');
                              }
                            }}
                          />
                          <span>Same as Both</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {hostelPaymentType === 'single' ? (
                                         <div className="grid grid-cols-2 gap-3">
                       <div>
                         {hostelPrefillSelection === 'receipt' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">Online Amount</label>
                             <input
                               type="text"
                               value={hostelIndividualAmount}
                               onChange={(e) => {
                                 const digits = e.target.value.replace(/\D/g,'');
                                 setHostelIndividualAmount(digits);
                                 const num = parseInt(digits || '0') || 0;
                                 setFormData(prev => ({ ...prev, hostelRent: num }));
                               }}
                               placeholder="Online amount"
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                           </>
                         )}
                       </div>
                       <div>
                         {hostelPrefillSelection === 'receipt' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">
                               <CreditCard className="w-3 h-3 inline mr-1" />
                               UTR/UPI ID 
                             </label>
                             <input
                               type="text"
                               value={hostelIndividualUtrId || ''}
                               onChange={(e) => {
                                 const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                 setHostelIndividualUtrId(value);
                                 if (value.length !== 12) {
                                   setHostelUtrError('Please enter 12-digit UTR/UPI ID');
                                 } else {
                                   setHostelUtrError('');
                               
                                 // ✅ Duplicate check trigger
          const duplicate = findDuplicatePaymentWithAllMembers(value, undefined);
          if (duplicate) {
            
            setDuplicateInfo(duplicate);setActiveDuplicateSource("hostel");   // ✅ mark source
            setDuplicateCheckModal(true);
          } } 
                               }}
                               placeholder="12-digit UTR/UPI ID"
                               maxLength={12}
                               disabled={hostelLockUtr || parseInt(hostelIndividualAmount || '0') <= 0}
                               
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                             {hostelUtrError && (
                               <p className="text-red-400 text-xs mt-1">{hostelUtrError}</p>
                             )}
                           </>
                         )}
                       </div>
                       <div>
                         {hostelPrefillSelection === 'utr' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">Offline Amount</label>
                             <input
                               type="text"
                               value={hostelIndividualOfflineAmount || ''}
                               onChange={(e) => {
                                 const digits = e.target.value.replace(/\D/g,'');
                                 setHostelIndividualOfflineAmount(digits);
                               }}
                               placeholder="Offline amount"
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                           </>
                         )}
                       </div>
                       <div>
                         {hostelPrefillSelection === 'utr' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">
                               <Receipt className="w-3 h-3 inline mr-1" />
                               Receipt Number 
                             </label>
                             <input
                               type="text"
                               value={hostelIndividualReceiptNo}
                               onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setHostelIndividualReceiptNo(value);
                              }
                               }
                               onBlur={() => {
                                // ✅ Don't trigger duplicate check if dialog is open
  if (isDialogOpen) {
    console.log("🚫 Dialog is open, skipping onBlur duplicate check");
    return;
  }
                                if (hostelIndividualReceiptNo.trim()!== "") {
                                  if(isProcessingGroupEntry){
                                    return;
                                  }
                                const duplicate = findDuplicatePaymentWithAllMembers(undefined, hostelIndividualReceiptNo);
                                if (duplicate) {
                                 setDuplicateInfo(duplicate);
                                 setActiveDuplicateSource("hostel");   // ✅ mark source
                                setDuplicateCheckModal(true);
                                 }
                                }
                               }}
                               placeholder="Receipt No"
                               disabled={hostelLockReceipt || parseInt(hostelIndividualOfflineAmount || '0') <= 0}
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                           </>
                         )}
                       </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Payment Date</label>
                        <input
                          type="text"
                          value={hostelIndividualPaymentDate}
                          onChange={(e) => {
                            const formatted = formatDate(e.target.value);
                            setHostelIndividualPaymentDate(formatted);
                            if (formatted.length < 10) {
                              setHostelIndividualPaymentDateError('Please enter a valid date (DD.MM.YYYY)');
                            } else {
                              setHostelIndividualPaymentDateError('');
                            }
                          }}
                          placeholder="DD.MM.YYYY"
                          maxLength={10}
                          readOnly={hostelLockDate}
                          className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                        />
                        {hostelIndividualPaymentDateError && (
                          <p className="text-red-400 text-xs mt-1">{hostelIndividualPaymentDateError}</p>
                        )}
                      </div>
                     
                      
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Hostel Group Payment Entry (inline) */}
                      <div className="space-y-3 mb-2">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Payment Date *</label>
                          <input
  type="text"
  value={hostelGroupPaymentDate}
  onChange={(e)=>{
    if (!hostelFieldsReadOnly) { // ✅ Only allow changes if not readonly
      const f=formatDate(e.target.value); 
      setHostelGroupPaymentDate(f); 
      setHostelGroupDateError(f.length<10?'Please enter a valid date (DD.MM.YYYY)':'');
    }
  }}
  readOnly={hostelFieldsReadOnly} // ✅ Add readonly state
  maxLength={10}
  placeholder="DD.MM.YYYY"
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
/>
                          {hostelGroupDateError && <p className="text-red-400 text-xs mt-1">{hostelGroupDateError}</p>}
                        </div>
                        <div className="flex-1 min-w-[160px]">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Online Amount</label>
                          <input 
  type="text" 
  value={hostelGroupOnlineAmount}
  onChange={(e)=>{
    if (!hostelFieldsReadOnly) { // ✅ Only allow changes if not readonly
      const val=e.target.value.replace(/\D/g,''); 
      setHostelGroupOnlineAmount(val);
    }
  }} 
  readOnly={hostelFieldsReadOnly} // ✅ Add readonly state
  placeholder="Enter online amount (optional)" 
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/> </div>
                        {parseInt(hostelGroupOnlineAmount||'0')>0 && (
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-gray-300 text-sm font-medium mb-2">UTR/UPI ID</label>
                            
                            <input 
  type="text" 
  value={hostelGroupUtrId} 
  onChange={(e)=>{
    const v=e.target.value.replace(/\D/g,'').slice(0,12); 
    setHostelGroupUtrId(v); 
    setHostelGroupUtrError(v.length===12?'':'Please enter 12-digit UTR/UPI ID');
    
    // ✅ Only check for duplicates if NOT processing group entry and field is not readonly
    if (v.length === 12 && !isProcessingGroupEntry && !hostelFieldsReadOnly) {
      const duplicate = findDuplicatePaymentWithAllMembers(v, undefined);
      if (duplicate) {
        setDuplicateInfo(duplicate);setActiveDuplicateSource("hostel");   // ✅ mark source
        setDuplicateCheckModal(true);
      }
    }
  }} 
  placeholder="12-digit UTR/UPI ID" 
  maxLength={12} 
  readOnly={hostelFieldsReadOnly} // ✅ Add readonly state
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/>
                            {hostelGroupUtrError && <p className="text-red-400 text-xs mt-1">{hostelGroupUtrError}</p>}
                          </div>
                        )}
                        <div className="flex-1 min-w-[160px]">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Offline Amount</label>
                          <input 
  type="text" 
  value={hostelGroupOfflineAmount} 
  onChange={(e)=>{
    if (!hostelFieldsReadOnly) { // ✅ Only allow changes if not readonly
      const val=e.target.value.replace(/\D/g,''); 
      setHostelGroupOfflineAmount(val);
    }
  }} 
  readOnly={hostelFieldsReadOnly} // ✅ Add readonly state
  placeholder="Enter offline amount (optional)" 
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/> </div>
                        {parseInt(hostelGroupOfflineAmount||'0')>0 && (
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Receipt Number</label>
                           
<input 
  type="text" 
  value={hostelGroupReceiptNo} 
  onChange={(e)=>setHostelGroupReceiptNo(e.target.value)} 
  onBlur={() => {
    // ✅ Don't trigger duplicate check if dialog is open
  if (isDialogOpen) {
    console.log("🚫 Dialog is open, skipping onBlur duplicate check");
    return;
  }
    if (hostelGroupReceiptNo.trim() && !isProcessingGroupEntry && !hostelFieldsReadOnly) {
      const duplicate = findDuplicatePaymentWithAllMembers(undefined, hostelGroupReceiptNo);
      if (duplicate) {
        setDuplicateInfo(duplicate);
        setActiveDuplicateSource("hostel");   // ✅ mark source
        setDuplicateCheckModal(true);
      }
    }
  }}
  readOnly={hostelFieldsReadOnly} // ✅ Add readonly state
  placeholder="Receipt No" 
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/>

                    
                          </div>
                                )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                          <input readOnly value={formData.studentName.toUpperCase()} className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" />
                          <div className="mt-2">
                            <label className="block text-gray-400 text-xs mb-1">Amount</label>
                            <input 
                              type="text" 
                              value={hostelGroupEntries[0]?.amount || 0}
                              readOnly={((parseInt(hostelGroupOnlineAmount||'0')||0) + (parseInt(hostelGroupOfflineAmount||'0')||0)) <= 0}
                              onChange={(e)=>{
                                const limit = (parseInt(hostelGroupOnlineAmount||'0')||0) + (parseInt(hostelGroupOfflineAmount||'0')||0);
                                const val = parseInt(e.target.value.replace(/\D/g,'')||'0')||0;
                                if (val > limit) { alert('Amount cannot exceed Online + Offline total'); return; }
                                  setHostelGroupAmountError('');
                                  const v=[...hostelGroupEntries]; v[0].amount=val; setHostelGroupEntries(v);
                              }} 
                              className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
                            />
                            {savedUnpaidAmount > 0 && (
  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
    <div className="flex items-center gap-2 text-orange-300">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm font-medium">
        Unpaid Member Detected: {unpaidMemberName} - Max Amount: ₹{calculatedUnpaidAmount.toLocaleString()}
      </span>
    </div>
  </div>
)}
                            {((parseInt(hostelGroupOnlineAmount||'0')||0) + (parseInt(hostelGroupOfflineAmount||'0')||0)) <= 0 && (
                              <p className="text-red-400 text-xs mt-1">Enter Online/Offline amount to enable</p>
                            )}
                            {hostelGroupAmountError && <p className="text-red-400 text-xs mt-1">{hostelGroupAmountError}</p>}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 md:col-span-2">
                        <div className="space-y-3">
                        {hostelGroupEntries.slice(1).map((entry, idx) => {
  const fieldIndex = idx + 1;
  const hasError = !!hostelGroupStudentErrors[fieldIndex];

  return (
    <div key={idx}>
      <input
        type="text"
        value={entry.studentName || ""}
        onChange={(e) => {
          // ✅ Sirf A-Z aur space allow
          let cleanValue = e.target.value.replace(/[^A-Za-z\s]/g, "");

          // ✅ Sabko UPPERCASE me convert
          cleanValue = cleanValue.toUpperCase();

          // ✅ Multiple spaces ko single banado
          cleanValue = cleanValue.replace(/\s+/g, " ");

          // ✅ Trim leading/trailing space
          cleanValue = cleanValue.trimStart();

          // ✅ Update state
          const v = [...hostelGroupEntries];
          v[fieldIndex].studentName = cleanValue;
          setHostelGroupEntries(v);

          // ✅ Agar value valid hai to error hatao
          if (cleanValue.trim()) {
            setHostelGroupStudentErrors((prev) => {
              const copy = { ...prev };
              delete copy[fieldIndex];
              return copy;
            });
          }
        }}
        onBlur={(e) => {
          if (!e.target.value.trim()) {
            setHostelGroupStudentErrors((prev) => ({
              ...prev,
              [fieldIndex]: `Student #${fieldIndex + 1} name is required`,
            }));
          }
        }}
        placeholder={`Student Name #${fieldIndex + 1} *`}
        className={`w-full p-2 bg-slate-700 border rounded text-white text-sm ${
          hasError ? "border-red-400" : "border-white/30"
        }`}
      />

      {/* ✅ Inline error */}
      {hostelGroupStudentErrors[fieldIndex] && (
        <p className="text-red-400 text-xs mt-1">
          {hostelGroupStudentErrors[fieldIndex]}
        </p>
      )}
    </div>
  );
})}

      </div>
                          <div className="mt-3">
                            <label className="block text-gray-400 text-xs mb-1">Remaining Amount</label>
                            <input readOnly value={Math.max(0, (parseInt(hostelGroupOnlineAmount||'0')||0)+(parseInt(hostelGroupOfflineAmount||'0')||0) - (hostelGroupEntries.reduce((s,e)=>s+(e.amount||0),0))).toString()} className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Conditional IDs display */}
                      <>
  <button 
    type="button" 
    onClick={handleAddHostelGroupPayment} 
    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
  >
    Add Hostel Group Payment
  </button>

  {errors.hostelPaymentType && (
    <p className="text-red-500 text-sm mt-2">{errors.hostelPaymentType}</p>
  )}
</>
 
                    </div>
                  )}

{hostelPaymentType === 'single' && (
  <>
    <button
      type="button"
      onClick={handleAddHostelPayment}
      className="w-full mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
    >
      Add Hostel Payment
    </button>

    {errors.hostelPaymentType && (
      <p className="text-red-500 text-sm mt-2">{errors.hostelPaymentType}</p>
    )}
  </>
)}

                </div>
                {/* Payment History Below */}
                {hostelPayments.length > 0 && (
  <div className="mt-4">
    <h4 className="text-white font-medium mb-2">Hostel Payment History</h4>
    <div className="grid grid-cols-1 gap-2">
      {hostelPayments.map((payment, index) => (
        <div key={index} className="p-3 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Student Names Display 
              <div className="mb-2 p-2 bg-slate-800 rounded border border-slate-600">
                <p className="text-blue-300 text-xs font-medium mb-1">
                  {payment.studentNames ? 'Students:' : 'Student:'}
                </p>
                <p className="text-white text-sm">
                  {payment.studentNames || formData.studentName || 'Unknown Student'}
                </p>
              </div>*/}
              
              {/* Payment Type Badge */}
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  payment.paymentMode === 'online' 
                    ? 'bg-green-600 text-white'
                    : payment.paymentMode === 'offline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {payment.paymentMode === 'mixed' ? 'Mixed Payment' : 
                   payment.paymentMode === 'online' ? 'Online Payment' : 'Offline Payment'}
                </span>
              </div>
              
              {/* Payment Details */}
              <div className="space-y-1">
                {payment.paymentMode === 'online' && (
                  <p className="text-white font-medium text-sm">
                    💳 Online: ₹{(payment.onlineAmount ?? payment.amount)}
                    {payment.utrId ? ` (UTR: ${payment.utrId})` : ''}
                  </p>
                )}
                
                {payment.paymentMode === 'offline' && (
                  <p className="text-white font-medium text-sm">
                    🧾 Offline: ₹{(payment.offlineAmount ?? payment.amount)}
                    {payment.receiptNo ? ` (Receipt: ${payment.receiptNo})` : ''}
                  </p>
                )}
                
                {/* Mixed */}
{payment.paymentMode === 'mixed' && (
  <>
    <p className="text-white font-medium text-sm">
      💳 Online: ₹{payment.onlineAmount}
      {payment.utrId ? ` (UTR: ${payment.utrId})` : ''}
    </p>
    <p className="text-white font-medium text-sm">
      🧾 Offline: ₹{payment.offlineAmount}
      {payment.receiptNo ? ` (Receipt: ${payment.receiptNo})` : ''}
    </p>
  </>
)}

{/* ✅ Total always visible */}
<p className="text-green-300 text-sm font-medium border-t border-slate-600 pt-1">
  💰 Total: ₹{payment.amount}
</p>
                
                <p className="text-gray-400 text-xs mt-2">📅 Date: {payment.paymentDate}</p>
              </div>

              {/* Individual Student Amount Breakdown (for group payments only) */}
              {payment.students && payment.students.length > 1 && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <p className="text-yellow-300 text-xs mb-2 font-medium">💸 Amount Distribution:</p>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="space-y-1">
                      {/* First student (Student #1) */}
                      <div className="text-xs flex justify-between py-1">
                        <span className="text-gray-300">{payment.students[0]?.name}:</span>
                        <span className="text-green-400 font-medium">₹{payment.students[0]?.amount || 0}</span>
                      </div>
                      
                      {/* Remaining students (Student #2 onwards) combined */}
                      {payment.students && payment.students.length > 1 && (() => {
  const s1Amount = payment?.students?.[0]?.amount || 0;

  // Prefer stored otherStudentsAmount; fallback = total - student1Amount
  const remainingTotal =
    typeof payment.otherStudentsAmount === 'number'
      ? payment.otherStudentsAmount
      : Math.max(0, (payment.amount || 0) - s1Amount);

  const remainingNames = (payment.students.slice(1) || [])
    .map(s => s?.name)
    .filter(Boolean)
    .join(', ');

  return remainingNames && (
    <div className="text-xs flex justify-between py-1">
      <span className="text-gray-300">{remainingNames}:</span>
      <span className="text-green-400 font-medium">₹{remainingTotal}</span>
    </div>
  );
})()}

                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => {
                
                  const newPayments = hostelPayments.filter((_, i) => i !== index);
                  setHostelPayments(newPayments);
                  if (newPayments.length === 0) {
                    setHostelPrefillSelection("none");   // ✅ correct state
                    setErrors(prev => ({ ...prev, hostelPaymentType: "" }));
                  }
                  
                
              }}
              className="text-red-400 hover:text-red-300 transition-colors ml-2 flex-shrink-0 p-1 rounded hover:bg-red-400/10"
              title="Remove Payment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              </div>

              {/* MESS PAYMENT Section */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" />
                  MESS PAYMENT
                </h3>
                
                {/* Mess Fee Amount Display (from section below) */}
                <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-300 text-sm font-medium">Mess Fee Amount:</span>
                    <span className="text-white font-bold text-lg">₹{calculateMessTotalFromPayments().toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Type Selection */}
                <div className="mb-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="single"
                        checked={messPaymentType === 'single'}
                        onChange={() => {
                          // reset all mess fields first (but keep the amount as it represents total mess fee)
                          setMessGroupCount(0);
                          setMessGroupEntries([]);
                          setMessGroupPaymentDate('');
                          setMessGroupOnlineAmount('');
                          setMessGroupOfflineAmount('');
                          setMessGroupUtrId('');
                          setMessGroupReceiptNo('');
                          setMessGroupDateError('');
                          setMessGroupUtrError('');
                          setMessGroupAmountError('');
                          setMessIndividualPaymentMode('online');
                          setMessIndividualPaymentDate('');
                          setMessIndividualReceiptNo('');
                          setMessIndividualUtrId('');
                          setMessIndividualPaymentDateError('');
                          setMessUtrError('');
                          setMessPayments([]);
                          // reset prefill state to None as per requirement
                          setMessPrefillSelection('none');
                          setMessLockDate(false); 
                          setMessLockReceipt(false); 
                          setMessLockUtr(false);
                          clearMessInputs();
                          setMessPaymentType('single');setMessGroupStudentErrors({});setMessFieldsReadOnly(false); // ✅ Make mess fields read-only
              
                        }}
                        className="text-orange-500"
                      />
                      <span className="text-white">Single Mess Payment</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="group"
                        checked={messPaymentType === 'group'}
                        onChange={() => {
                          // reset prefill state to None as per requirement
                          setMessPrefillSelection('none');
                          setMessLockDate(false); 
                          setMessLockReceipt(false); 
                          setMessLockUtr(false);
                          clearMessInputs();
                          // reset single inputs (but keep the amount as it represents total mess fee)
                          setMessIndividualPaymentMode('online');
                          setMessIndividualPaymentDate('');
                          setMessIndividualReceiptNo('');
                          setMessIndividualUtrId('');
                          setMessIndividualPaymentDateError('');
                          setMessUtrError('');
                          setMessPayments([]);
                          // reset group inputs
                          setMessGroupCount(0);
                          setMessGroupEntries([]);
                          setMessGroupPaymentDate('');
                          setMessGroupOnlineAmount('');
                          setMessGroupOfflineAmount('');
                          setMessGroupUtrId('');
                          setMessGroupReceiptNo('');
                          setMessGroupDateError('');
                          setMessGroupUtrError('');
                          setMessGroupAmountError('');
                          // switch and open modal
                          setMessPaymentType('group');
                          setShowMessGroupModal(true);setMessGroupStudentErrors({});setMessFieldsReadOnly(false);
                        }}
                        className="text-orange-500"
                      />
                      <span className="text-white">Group Mess Payment</span>
                    </label>
                  </div>
                </div>
                

                {/* Add Payment Subsection */}
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-white font-medium mb-3">Add Payment</h4>
                  
                  {/* Prefill from Course Payment Options */}
                  <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                     
                      <div className="flex items-center gap-3 text-xs text-blue-100">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="mess-prefill-mode"
                            checked={messPrefillSelection==='none'}
                            onChange={() => {
                              setMessPrefillSelection('none');
                              setMessLockDate(false); setMessLockReceipt(false); setMessLockUtr(false);setMessFieldsReadOnly(false);
                              clearMessInputs();setMessGroupStudentErrors({});
                              setMessPayments([]);
                              // 🔄 reset group entries (student #1 amount = 0, others name blank)
      setMessGroupEntries((prev) =>
        prev.map((entry, idx) =>
          idx === 0 ? { ...entry, amount: 0 } : { ...entry, studentName: '' }
        )
      );
      setMessGroupAmountError('');
                            }}
                          />
                          <span>None</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="mess-prefill-mode"
                            checked={messPrefillSelection==='utr'}
                            onChange={() => {
                              clearMessInputs();setMessGroupStudentErrors({});
                              setMessPayments([]);setMessFieldsReadOnly(false);
                              if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
                                alert('Please enter Course payment History first');
                                setMessPrefillSelection('none');
                                return;
                              }
                               // 🔄 reset group entries
                              setMessGroupEntries((prev) =>
        prev.map((entry, idx) =>
          idx === 0 ? { ...entry, studentName: formData.studentName.toUpperCase(), amount: 0 }
                              : { ...entry, studentName: '' }
        )
      );
      setMessGroupAmountError('');
                              setMessPrefillSelection('utr');
                              const success = prefillMessFromCourseHistory('utr');
                              if (success) {
                                alert('✅ Mess details prefilled using UTR/UPI match');
                                // Check if Online Amount is blank when UTR/UPI is selected
                                
                              } else {
                                alert('❌ No matching Course payment in this form history');
                                setMessPrefillSelection('none');
                              }
                              
      
                            }}
                          />
                          <span>Same as UTR/UPI</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="mess-prefill-mode"
                            checked={messPrefillSelection==='receipt'}
                            onChange={() => {
                              clearMessInputs();
                              setMessPayments([]);setMessGroupStudentErrors({});setMessFieldsReadOnly(false);
                              if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
                                alert('Please enter Course payment History first');
                                setMessPrefillSelection('none');
                                return;
                              }
                              // 🔄 reset group entries
      setMessGroupEntries((prev) =>
        prev.map((entry, idx) =>
          idx === 0 ? { ...entry, studentName: formData.studentName.toUpperCase(), amount: 0 }
      : { ...entry, studentName: '' }
        )
      );
      setMessGroupAmountError('');
                              setMessPrefillSelection('receipt');
                              const success = prefillMessFromCourseHistory('receipt');
                              if (success) {
                                alert('✅ Mess details prefilled using Receipt match');
                               
                              } else {
                                alert('❌ No matching Course payment in this form history');
                                setMessPrefillSelection('none');
                              }
                               
                            }}
                          />
                          <span>Same as Receipt No.</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="mess-prefill-mode"
                            checked={messPrefillSelection==='both'}
                            onChange={() => {
                              clearMessInputs();setMessGroupStudentErrors({});
                              setMessPayments([]);setMessFieldsReadOnly(false);
                              if ((payments?.length || 0) === 0 && (groupPayments?.length || 0) === 0) {
                                alert('Please enter Course payment History first');
                                setMessPrefillSelection('none');
                                return;
                              }
                               // 🔄 reset group entries
      setMessGroupEntries((prev) =>
        prev.map((entry, idx) =>
          idx === 0 ? { ...entry, studentName: formData.studentName.toUpperCase(), amount: 0 }
      : { ...entry, studentName: '' }
        )
      );
      setMessGroupAmountError('');
                              setMessPrefillSelection('both');
                              const success = prefillMessFromCourseHistory('both');
                              if (success) {
                                alert('✅ Mess details prefilled using Both (UTR + Receipt)');
                                
                              } else {
                                alert('❌ No matching Course payment in this form history');
                                setMessPrefillSelection('none');
                              }
                             
                            }}
                          />
                          <span>Same as Both</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {messPaymentType === 'single' ? (
                                         <div className="grid grid-cols-2 gap-3">
                       <div>
                         {messPrefillSelection === 'receipt' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">Online Amount</label>
                             <input
                               type="text"
                               value={messIndividualAmount}
                               onChange={(e) => {
                                 const digits = e.target.value.replace(/\D/g,'');
                                 setMessIndividualAmount(digits);
                                 const num = parseInt(digits || '0') || 0;
                                 setFormData(prev => ({ ...prev, messFee: num }));
                               }}
                               placeholder="Online amount"
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                           </>
                         )}
                       </div>
                       <div>
                         {messPrefillSelection === 'receipt' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">
                               <CreditCard className="w-3 h-3 inline mr-1" />
                               UTR/UPI ID 
                             </label>
                             <input
                               type="text"
                               value={messIndividualUtrId || ''}
                               onChange={(e) => {
                                 const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                 setMessIndividualUtrId(value);
                                 if (value.length !== 12) {
                                   setMessUtrError('Please enter 12-digit UTR/UPI ID');
                                 } else {
                                   setMessUtrError('');
                                   // ✅ Duplicate check
          const duplicate = findDuplicatePaymentWithAllMembers(value, undefined);
          if (duplicate) {
            setDuplicateInfo(duplicate);setActiveDuplicateSource("mess");
            setDuplicateCheckModal(true);
          }
                                 }
                               }}
                               placeholder="12-digit UTR/UPI ID"
                               disabled={messLockUtr || parseInt(messIndividualAmount || '0') <= 0}
                               maxLength={12}
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                             {messUtrError && (
                               <p className="text-red-400 text-xs mt-1">{messUtrError}</p>
                             )}
                           </>
                         )}
                       </div>
                       <div>
                         {messPrefillSelection === 'utr' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">Offline Amount</label>
                             <input
                               type="text"
                               value={messIndividualOfflineAmount || ''}
                               onChange={(e) => {
                                 const digits = e.target.value.replace(/\D/g,'');
                                 setMessIndividualOfflineAmount(digits);
                               }}
                               placeholder="Offline amount"
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                           </>
                         )}
                       </div>
                       <div>
                         {messPrefillSelection === 'utr' ? null : (
                           <>
                             <label className="block text-xs text-gray-400 mb-1">
                               <Receipt className="w-3 h-3 inline mr-1" />
                               Receipt Number 
                             </label>
                             <input
                               type="text"
                               value={messIndividualReceiptNo}
                               onChange={(e) => setMessIndividualReceiptNo(e.target.value)}
                               onBlur={() => {
                                // ✅ Don't trigger duplicate check if dialog is open
  if (isDialogOpen) {
    console.log("🚫 Dialog is open, skipping onBlur duplicate check");
    return;
  }
                                if (messIndividualReceiptNo.trim()) {
                                  const duplicate = findDuplicatePaymentWithAllMembers(undefined, messIndividualReceiptNo);
                                  if (duplicate) {
                                    setDuplicateInfo(duplicate);setActiveDuplicateSource("mess");   // ✅ mark source
                                    setDuplicateCheckModal(true);
                                  }
                                }
                              }}
                               placeholder="Receipt No"
                               disabled={messLockReceipt || parseInt(messIndividualOfflineAmount || '0') <= 0}
                               className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                             />
                                 </>
                         )}
                       </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Payment Date</label>
                        <input
                          type="text"
                          value={messIndividualPaymentDate}
                          onChange={(e) => {
                            const formatted = formatDate(e.target.value);
                            setMessIndividualPaymentDate(formatted);
                            if (formatted.length < 10) {
                              setMessIndividualPaymentDateError('Please enter a valid date (DD.MM.YYYY)');
                            } else {
                              setMessIndividualPaymentDateError('');
                            }
                          }}
                          placeholder="DD.MM.YYYY"
                          maxLength={10}
                          readOnly={messLockDate}
                          className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
                        />
                        {messIndividualPaymentDateError && (
                          <p className="text-red-400 text-xs mt-1">{messIndividualPaymentDateError}</p>
                        )}
                      </div>
                      
                      
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Mess Group Payment Entry (inline) */}
                      <div className="space-y-3 mb-2">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Payment Date *</label>
                          <input
  type="text"
  value={messGroupPaymentDate}
  onChange={(e)=>{
    if (!messFieldsReadOnly) { // ✅ Only allow changes if not readonly
      const f=formatDate(e.target.value); 
      setMessGroupPaymentDate(f); 
      setMessGroupDateError(f.length<10?'Please enter a valid date (DD.MM.YYYY)':'');
    }
  }}
  readOnly={messFieldsReadOnly} // ✅ Add readonly state
  maxLength={10}
  placeholder="DD.MM.YYYY"
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm"
/>
                          {messGroupDateError && <p className="text-red-400 text-xs mt-1">{messGroupDateError}</p>}
                        </div>
                        <div className="flex-1 min-w-[160px]">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Online Amount</label>
                          <input 
  type="text" 
  value={messGroupOnlineAmount} 
  onChange={(e)=>{
    if (!messFieldsReadOnly) { // ✅ Only allow changes if not readonly
      const val=e.target.value.replace(/\D/g,'');
      setMessGroupOnlineAmount(val);
    }
  }} 
  readOnly={messFieldsReadOnly} // ✅ Add readonly state
  placeholder="Enter online amount (optional)" 
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/>      </div>
                        {parseInt(messGroupOnlineAmount||'0')>0 && (
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-gray-300 text-sm font-medium mb-2">UTR/UPI ID</label>
                            
                            <input 
  type="text" 
  value={messGroupUtrId} 
  onChange={(e)=>{
    const v=e.target.value.replace(/\D/g,'').slice(0,12); 
    setMessGroupUtrId(v); 
    setMessGroupUtrError(v.length===12?'':'Please enter 12-digit UTR/UPI ID');
    
    // ✅ Only check for duplicates if NOT processing group entry and field is not readonly
    if (v.length === 12 && !isProcessingGroupEntry && !messFieldsReadOnly) {
      const duplicate = findDuplicatePaymentWithAllMembers(v, undefined);
      if (duplicate) {
        setDuplicateInfo(duplicate);setActiveDuplicateSource("mess");
        setDuplicateCheckModal(true);
      }
    }
  }} 
  placeholder="12-digit UTR/UPI ID" 
  maxLength={12} 
  readOnly={messFieldsReadOnly} // ✅ Add readonly state
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/>
                            {messGroupUtrError && <p className="text-red-400 text-xs mt-1">{messGroupUtrError}</p>}
                          </div>
                        )}
                        <div className="flex-1 min-w-[160px]">
                          <label className="block text-gray-300 text-sm font-medium mb-2">Offline Amount</label>
                          <input 
  type="text" 
  value={messGroupOfflineAmount} 
  onChange={(e)=>{
    if (!messFieldsReadOnly) { // ✅ Only allow changes if not readonly
      const val=e.target.value.replace(/\D/g,'');
      setMessGroupOfflineAmount(val);
    }
  }} 
  readOnly={messFieldsReadOnly} // ✅ Add readonly state
  placeholder="Enter offline amount (optional)" 
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/>  </div>
                        {parseInt(messGroupOfflineAmount||'0')>0 && (
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Receipt Number</label>
                           
                            <input 
  type="text" 
  value={messGroupReceiptNo} 
  onChange={(e)=>setMessGroupReceiptNo(e.target.value)} 
  onBlur={() => {
    // ✅ Don't trigger duplicate check if dialog is open
  if (isDialogOpen) {
    console.log("🚫 Dialog is open, skipping onBlur duplicate check");
    return;
  }
    // ✅ Only check for duplicates if NOT processing group entry and field is not readonly
    if (messGroupReceiptNo.trim() && !isProcessingGroupEntry && !messFieldsReadOnly) {
      const duplicate = findDuplicatePaymentWithAllMembers(undefined, messGroupReceiptNo);
      if (duplicate) {
        setDuplicateInfo(duplicate);setActiveDuplicateSource("mess");   // ✅ mark source
        setDuplicateCheckModal(true);
      }
    }
  }}
  readOnly={messFieldsReadOnly} // ✅ Add readonly state
  placeholder="Receipt No" 
  className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
/>
   </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                          <input readOnly value={formData.studentName.toUpperCase()} className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" />
                          <div className="mt-2">
                            <label className="block text-gray-400 text-xs mb-1">Amount</label>
                            <input 
                              type="text" 
                              value={messGroupEntries[0]?.amount || 0}
                              readOnly={((parseInt(messGroupOnlineAmount||'0')||0) + (parseInt(messGroupOfflineAmount||'0')||0)) <= 0}
                              onChange={(e)=>{
                                const limit = (parseInt(messGroupOnlineAmount||'0')||0) + (parseInt(messGroupOfflineAmount||'0')||0);
                                const val = parseInt(e.target.value.replace(/\D/g,'')||'0')||0;
                                if (val > limit) { alert('Amount cannot exceed Online + Offline total'); return; }
                                  setMessGroupAmountError('');
                                  const v=[...messGroupEntries]; v[0].amount=val; setMessGroupEntries(v);
                              }} 
                              className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" 
                            />
                             {savedUnpaidAmount > 0 && (
  <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
    <div className="flex items-center gap-2 text-orange-300">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm font-medium">
        Unpaid Member Detected: {unpaidMemberName} - Max Amount: ₹{calculatedUnpaidAmount.toLocaleString()}
      </span>
    </div>
  </div>
)}
                            {((parseInt(messGroupOnlineAmount||'0')||0) + (parseInt(messGroupOfflineAmount||'0')||0)) <= 0 && (
                              <p className="text-red-400 text-xs mt-1">Enter Online/Offline amount to enable</p>
                            )}
                            {messGroupAmountError && <p className="text-red-400 text-xs mt-1">{messGroupAmountError}</p>}
                          </div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 md:col-span-2">
                          <div className="space-y-3">
                          {messGroupEntries.slice(1).map((entry, idx) => {
  const fieldIndex = idx + 1; // shift for Student #2 onwards
  const hasError = !!messGroupStudentErrors[fieldIndex];

  return (
    <div key={idx}>
      <input
        type="text"
        value={entry.studentName || ""}
        onChange={(e) => {
          // ✅ Sirf A-Z aur space allow
          let cleanValue = e.target.value.replace(/[^A-Za-z\s]/g, "");

          // ✅ Sabko UPPERCASE me convert
          cleanValue = cleanValue.toUpperCase();

          // ✅ Multiple spaces ko single bana do
          cleanValue = cleanValue.replace(/\s+/g, " ");

          // ✅ Trim leading spaces
          cleanValue = cleanValue.trimStart();

          // ✅ Update entry
          const v = [...messGroupEntries];
          v[fieldIndex].studentName = cleanValue;
          setMessGroupEntries(v);

          // ✅ Agar value valid hai to error hatao
          if (cleanValue.trim()) {
            setMessGroupStudentErrors((prev) => {
              const copy = { ...prev };
              delete copy[fieldIndex];
              return copy;
            });
          }
        }}
        onBlur={(e) => {
          if (!e.target.value.trim()) {
            setMessGroupStudentErrors((prev) => ({
              ...prev,
              [fieldIndex]: `Student #${fieldIndex + 1} name is required`,
            }));
          }
        }}
        placeholder={`Student Name #${fieldIndex + 1} *`}
        className={`w-full p-2 bg-slate-700 border rounded text-white text-sm ${
          hasError ? "border-red-400" : "border-white/30"
        }`}
      />

      {/* ✅ Inline error show karega */}
      {messGroupStudentErrors[fieldIndex] && (
        <p className="text-red-400 text-xs mt-1">
          {messGroupStudentErrors[fieldIndex]}
        </p>
      )}
    </div>
  );
})}
                


                         

                          </div>
                          <div className="mt-3">
                            <label className="block text-gray-400 text-xs mb-1">Remaining Amount</label>
                            <input readOnly value={Math.max(0, (parseInt(messGroupOnlineAmount||'0')||0)+(parseInt(messGroupOfflineAmount||'0')||0) - (messGroupEntries.reduce((s,e)=>s+(e.amount||0),0))).toString()} className="w-full p-2 bg-slate-700 border border-white/30 rounded text-white text-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Conditional IDs display */}
                      <>
  <button 
    type="button" 
    onClick={handleAddMessGroupPayment} 
    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
  >
    Add Mess Group Payment
  </button>

  {errors.messPaymentType && (
    <p className="text-red-500 text-sm mt-2">{errors.messPaymentType}</p>
  )}
</>

                      
                      </div>
                  )}

{messPaymentType === 'single' && (
  <>
    <button
      type="button"
      onClick={handleAddMessPayment}
      className="w-full mt-3 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
    >
      Add Mess Payment
    </button>

    {errors.messPaymentType && (
      <p className="text-red-500 text-sm mt-2">{errors.messPaymentType}</p>
    )}
  </>
)}

                </div>
                {/* Payment History Below */}
                {messPayments.length > 0 && (
  <div className="mt-4">
    <h4 className="text-white font-medium mb-2">Mess Payment History</h4>
    <div className="grid grid-cols-1 gap-2">
      {messPayments.map((payment, index) => (
        <div key={index} className="p-3 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Student Names Display 
              <div className="mb-2 p-2 bg-slate-800 rounded border border-slate-600">
                <p className="text-blue-300 text-xs font-medium mb-1">
                  {payment.studentNames ? 'Students:' : 'Student:'}
                </p>
                <p className="text-white text-sm">
                  {payment.studentNames || formData.studentName || 'Unknown Student'}
                </p>
              </div>*/}

              {/* Payment Type Badge */}
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  payment.paymentMode === 'online'
                    ? 'bg-green-600 text-white'
                    : payment.paymentMode === 'offline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {payment.paymentMode === 'mixed'
                    ? 'Mixed Payment'
                    : payment.paymentMode === 'online'
                    ? 'Online Payment'
                    : 'Offline Payment'}
                </span>
              </div>

              {/* Payment Details */}
              <div className="space-y-1">
                {payment.paymentMode === 'online' && (
                  <p className="text-white font-medium text-sm">
                    💳 Online: ₹{payment.onlineAmount ?? payment.amount}
                    {payment.utrId ? ` (UTR: ${payment.utrId})` : ''}
                  </p>
                )}

                {payment.paymentMode === 'offline' && (
                  <p className="text-white font-medium text-sm">
                    🧾 Offline: ₹{payment.offlineAmount ?? payment.amount}
                    {payment.receiptNo ? ` (Receipt: ${payment.receiptNo})` : ''}
                  </p>
                )}

{payment.paymentMode === 'mixed' && (
                <>
                  <p className="text-white font-medium text-sm">
                    Online: ₹{payment.onlineAmount}
                    {payment.utrId ? ` (UTR: ${payment.utrId})` : ''}
                  </p>
                  <p className="text-white font-medium text-sm">
                    Offline: ₹{payment.offlineAmount}
                    {payment.receiptNo ? ` (Receipt: ${payment.receiptNo})` : ''}
                  </p>
                </>
              )}

              {/* ✅ Ye add karna hai */}
              <p className="text-green-300 text-sm font-medium border-t border-slate-600 pt-1">
                💰 Total: ₹{payment.amount}
              </p>

                <p className="text-gray-400 text-xs mt-2">📅 Date: {payment.paymentDate}</p>
              </div>

              {/* Individual Student Amount Breakdown (for group payments only) */}
              {payment.students && payment.students.length > 1 && (
                <div className="mt-3 pt-2 border-t border-slate-600">
                  <p className="text-yellow-300 text-xs mb-2 font-medium">💸 Amount Distribution:</p>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="space-y-1">
                      {/* First student (Student #1) */}
                      <div className="text-xs flex justify-between py-1">
                        <span className="text-gray-300">{payment.students[0]?.name}:</span>
                        <span className="text-green-400 font-medium">₹{payment.students[0]?.amount || 0}</span>
                      </div>

                      {/* Remaining students (Student #2 onwards) combined */}
                      {payment.students && payment.students.length > 1 && (() => {
  const s1Amount = payment?.students?.[0]?.amount || 0;

  // Prefer stored otherStudentsAmount; fallback = total - student1Amount
  const remainingTotal =
    typeof payment.otherStudentsAmount === 'number'
      ? payment.otherStudentsAmount
      : Math.max(0, (payment.amount || 0) - s1Amount);

  const remainingNames = (payment.students.slice(1) || [])
    .map(s => s?.name)
    .filter(Boolean)
    .join(', ');

  return remainingNames && (
    <div className="text-xs flex justify-between py-1">
      <span className="text-gray-300">{remainingNames}:</span>
      <span className="text-green-400 font-medium">₹{remainingTotal}</span>
    </div>
  );
})()}

                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                
                  const newPayments = messPayments.filter((_, i) => i !== index);
                  setMessPayments(newPayments);
                  if (newPayments.length === 0) {
                    setMessPrefillSelection("none");   // ✅ default “None” select
                    setErrors(prev => ({ ...prev, messPaymentType: "" })); // agar error handle kar rahe ho
                  }
                
              }}
              className="text-red-400 hover:text-red-300 transition-colors ml-2 flex-shrink-0 p-1 rounded hover:bg-red-400/10"
              title="Remove Payment"
              
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

              </div>
            </div>

            {/* Combined Add Button */}
           
          </div>
        )}

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
          // Clear saved unpaid amount when modal closes
    clearSavedUnpaidAmount();
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
          
         // 🟢 Hostel clear
if (hostelPaymentType === 'single') {
  if (duplicateInfo.type === 'utr') {
    setHostelIndividualUtrId('');
  } else if (duplicateInfo.type === 'receipt') {
    setHostelIndividualReceiptNo('');
  }
} else if (hostelPaymentType === 'group') {
  if (duplicateInfo.type === 'utr') {
    setHostelGroupUtrId('');
    setHostelGroupOnlineAmount('');
  } else if (duplicateInfo.type === 'receipt') {
    setHostelGroupReceiptNo('');
    setHostelGroupOfflineAmount('');
  }
}

// 🟢 Mess clear
if (messPaymentType === 'single') {
  if (duplicateInfo.type === 'utr') {
    setMessIndividualUtrId('');
  } else if (duplicateInfo.type === 'receipt') {
    setMessIndividualReceiptNo('');
  }
} else if (messPaymentType === 'group') {
  if (duplicateInfo.type === 'utr') {
    setMessGroupUtrId('');
    setMessGroupOnlineAmount('');
  } else if (duplicateInfo.type === 'receipt') {
    setMessGroupReceiptNo('');
    setMessGroupOfflineAmount('');
  }
}

setDuplicateCheckModal(false);
setDuplicateInfo(null);
setActiveDuplicateSource(null); // ✅ यहाँ reset karo
setIsDialogOpen(false); // ✅ Reset dialog state      
        }} 
        className="fixed z-50 inset-0 flex items-center justify-center"
       
        >
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
              {/* 🆕 Enhanced: Student-wise Payment Breakdown */}
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Duplicate Payment Details 
                </h3>
                  {/* Show all group members in a grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {duplicateInfo.allGroupMembers.map((member, index) => (
                    <div key={member.studentInfo.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                      <div className="space-y-2">
                        
                        <div className="flex items-center gap-2 mb-3">

                          <User className="w-5 h-5 text-blue-400" />
                           <div>
                          <h4 className="text-white font-bold text-lg">{member.studentInfo.studentName}</h4>
                                <p className="text-gray-400 text-sm">{member.courseName} • {member.batchName} • {member.yearName}</p>
                             </div>
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
                              <span className="text-green-400 font-bold text-x">₹{member.studentInfo.courseFee?.toLocaleString()}</span>
                            </div>
                           
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 🆕 Group by Students and show their payment categories */}
                {(() => {
                  // Group members by student ID to avoid duplicates
                  const studentMap = new Map();
                  
                  duplicateInfo.allGroupMembers.forEach(member => {
                    const studentId = member.studentInfo.id;
                    if (!studentMap.has(studentId)) {
                      studentMap.set(studentId, {
                        studentInfo: member.studentInfo,
                        courseName: member.courseName,
                        batchName: member.batchName,
                        yearName: member.yearName,
                        payments: {
                          course: 0,
                          hostel: 0,
                          mess: 0,
                          total: 0
                        }
                      });
                    }
                    
                    // Add payment amounts based on category
                    const student = studentMap.get(studentId);
                    if (member.paymentCategory === 'course') {
                      student.payments.course += member.existingPayment.courseAmount || 0;
                    } else if (member.paymentCategory === 'hostel') {
                      student.payments.hostel += member.existingPayment.hostelAmount || 0;
                    } else if (member.paymentCategory === 'mess') {
                      student.payments.mess += member.existingPayment.messAmount || 0;
                    }
                    
                    student.payments.total = student.payments.course + student.payments.hostel + student.payments.mess;
                  });

                  const students = Array.from(studentMap.values());

                  return (
                    <div className="space-y-4">
                      
                    </div>
                  );
                })()}
              </div>

              
           {/* Payment Details Card - Enhanced Version */}
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
                          {(() => {
                            let onlineAmount = 0;
                            let offlineAmount = 0;
                            
                            if (duplicateInfo.paymentType === 'group') {
                              const memberCount = duplicateInfo.allGroupMembers?.length || 1;
                              onlineAmount = duplicateInfo.existingPayment.onlineAmount / memberCount;
                              offlineAmount = duplicateInfo.existingPayment.offlineAmount / memberCount;
                            } else {
                              onlineAmount = duplicateInfo.existingPayment.onlineAmount;
                              offlineAmount = duplicateInfo.existingPayment.offlineAmount;
                            }
                            
                            if (onlineAmount > 0 && offlineAmount > 0) {
                              return '💳 Online + 💵 Offline';
                            } else if (onlineAmount > 0) {
                              return '💳 Online';
                            } else {
                              return '💵 Offline';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  <div className="space-y-1 text-sm">
  <p className="text-yellow-400 font-bold text-lg">
    Individual Paid Student:
  </p>

  {/* ✅ Single or Group both handled */}
 {duplicateInfo.paymentType === 'single' ? (
  <div className="space-y-2">
    <p className="text-gray-300 font-bold mb-1">
      {duplicateInfo.existingPayment.studentName ||
       duplicateInfo.studentInfo?.studentName ||
       duplicateInfo.existingPayment.studentInfo?.studentName ||
       'Unknown Student'}
    </p>
    
    {/* Breakdown */}
    <div className="space-y-1 text-sm ml-3">
      {duplicateInfo.existingPayment.courseAmount > 0 && (
        <div className="flex justify-between">
          <span className="text-blue-300">📚 Course </span>
          <span className="text-blue-400 font-medium">
            ₹{duplicateInfo.existingPayment.courseAmount.toLocaleString()}
          </span>
        </div>
      )}
      {duplicateInfo.existingPayment.hostelAmount > 0 && (
        <div className="flex justify-between">
          <span className="text-orange-300">🏠 Hostel </span>
          <span className="text-orange-400 font-medium">
            ₹{duplicateInfo.existingPayment.hostelAmount.toLocaleString()}
          </span>
        </div>
      )}
      {duplicateInfo.existingPayment.messAmount > 0 && (
        <div className="flex justify-between">
          <span className="text-purple-300">🍽️ Mess </span>
          <span className="text-purple-400 font-medium">
            ₹{duplicateInfo.existingPayment.messAmount.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  </div>
) : (
  duplicateInfo.allGroupMembers.map((member) => (
    <div key={member.studentInfo.id} className="space-y-2 mb-3">
      <p className="text-gray-300 font-bold mb-1">
        {member.studentInfo.studentName}
      </p>

      {/* Breakdown */}
      <div className="space-y-1 text-sm ml-3">
        {member.existingPayment.courseAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-blue-300">📚 Course </span>
            <span className="text-blue-400 font-medium">
              ₹{member.existingPayment.courseAmount.toLocaleString()}
            </span>
          </div>
        )}
        {member.existingPayment.hostelAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-orange-300">🏠 Hostel </span>
            <span className="text-orange-400 font-medium">
              ₹{member.existingPayment.hostelAmount.toLocaleString()}
            </span>
          </div>
        )}
        {member.existingPayment.messAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-purple-300">🍽️ Mess </span>
            <span className="text-purple-400 font-medium">
              ₹{member.existingPayment.messAmount.toLocaleString()}
            </span>
          </div>
        )}
      </div>
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
         const calculatedUnpaidAmount =remaining;

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
                {/* ✅ Footer payment amounts - FIXED CALCULATION */}
<div className="mt-1 pt-3 border-t border-gray-700 text-sm">
  <span className="text-purple-400 font-bold text-lg mb-1">
    {duplicateInfo.paymentType === 'single'
      ? 'Single Payment:'
      : 'Total Group Payment:'}
  </span>
 
  <span className="float-right text-purple-400 font-bold">
    ₹{(() => {
      if (duplicateInfo.paymentType === 'single') {
        // FIXED: Calculate from course + hostel + mess amounts
        const courseAmount = duplicateInfo.existingPayment.courseAmount || 0;
        const hostelAmount = duplicateInfo.existingPayment.hostelAmount || 0;
        const messAmount = duplicateInfo.existingPayment.messAmount || 0;
        const totalAmount = courseAmount + hostelAmount + messAmount;
        return totalAmount.toLocaleString();
      } else {
        // Group payment: Calculate from online + offline amounts
        const memberCount = duplicateInfo.allGroupMembers?.length || 1;
        const actualOnline = duplicateInfo.existingPayment.onlineAmount / memberCount;
        const actualOffline = duplicateInfo.existingPayment.offlineAmount / memberCount;
        const totalAmount = actualOnline + actualOffline;
        return totalAmount.toLocaleString();
      }
    })()}
  </span>
</div>

                {/* Online/Offline breakdown - FIXED FOR GROUP PAYMENTS */}
                <div className="text-sm space-y-1 mt-2 pt-2 border-t border-gray-600">
                  {(() => {
                    let displayOnlineAmount = 0;
                    let displayOfflineAmount = 0;
                    
                    if (duplicateInfo.paymentType === 'group') {
                      // Group payment: Divide by number of members to get original amount
                      const memberCount = duplicateInfo.allGroupMembers?.length || 1;
                      displayOnlineAmount = duplicateInfo.existingPayment.onlineAmount / memberCount;
                      displayOfflineAmount = duplicateInfo.existingPayment.offlineAmount / memberCount;
                    } else {
                      // Single payment: Use as is
                      displayOnlineAmount = duplicateInfo.existingPayment.onlineAmount;
                      displayOfflineAmount = duplicateInfo.existingPayment.offlineAmount;
                    }
                    
                    return (
                      <>
                        {displayOnlineAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">💳 Total Online:</span>
                            <span className="text-white">₹{displayOnlineAmount.toLocaleString()}</span>
                          </div>
                        )}
                        {displayOfflineAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">💵 Total Offline:</span>
                            <span className="text-white">₹{displayOfflineAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
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

                 // ✅ Clear Hostel fields if duplicate is from hostel payment
      if (hostelPaymentType === 'single') {
        if (duplicateInfo.type === 'utr') {
          setHostelIndividualUtrId('');
          setHostelIndividualAmount('');
        } else if (duplicateInfo.type === 'receipt') {
          setHostelIndividualReceiptNo('');
          setHostelIndividualOfflineAmount('');
        }
      } else if (hostelPaymentType === 'group') {
        if (duplicateInfo.type === 'utr') {
          setHostelGroupUtrId('');
          setHostelGroupOnlineAmount('');
        } else if (duplicateInfo.type === 'receipt') {
          setHostelGroupReceiptNo('');
          setHostelGroupOfflineAmount('');
        }
      }

      // ✅ Clear Mess fields if duplicate is from mess payment
      if (messPaymentType === 'single') {
        if (duplicateInfo.type === 'utr') {
          setMessIndividualUtrId('');
          setMessIndividualAmount('');
        } else if (duplicateInfo.type === 'receipt') {
          setMessIndividualReceiptNo('');
          setMessIndividualOfflineAmount('');
        }
      } else if (messPaymentType === 'group') {
        if (duplicateInfo.type === 'utr') {
          setMessGroupUtrId('');
          setMessGroupOnlineAmount('');
        } else if (duplicateInfo.type === 'receipt') {
          setMessGroupReceiptNo('');
          setMessGroupOfflineAmount('');
        }
      }
      // ✅ Reset payment types to single and clear histories
      setPaymentType('single');
      setHostelPaymentType('single');
      setMessPaymentType('single');
      // ✅ Clear all payment histories
      setPayments([]);
      setGroupPayments([]);
      setHostelPayments([]);
      setMessPayments([]);
      
      // ✅ Reset group entries and counts
      setDynamicGroupEntries([]);
      setGroupCount(0);
      setHostelGroupEntries([]);
      setMessGroupEntries([]);
      // ✅ Clear saved unpaid amount
      clearSavedUnpaidAmount();
      
      // ✅ Clear all errors
      setErrors({});
      
      setDuplicateCheckModal(false);
      setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
      setIsDialogOpen(false); // ✅ Reset dialog state
      console.log("✅ Modal closed after cancel - all fields cleared and reset to single payments");
  
                setGroupStudentName('');
                setGroupOnlineAmount('');
                setGroupOfflineAmount('');
                setGroupUtrId('');
                setGroupReceiptNo('');
                setGroupPaymentDate('');
                
                
                
              }}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>


 {/* Add to Group Buttons - Only show when both are group payments */}
 {duplicateInfo?.paymentType === "group" && (
              <>
                {/* Course Group Payment Button 
                {paymentType === "group" && (   */}
                {activeDuplicateSource === "course" && paymentType === "group" && (
        
                 <button 
                 type="button"
                 onClick={() => {
                  
                   console.log("🔥 DIRECT Add to Current Group button clicked");
                   
                   if (!duplicateInfo) {
                     console.log("❌ No duplicateInfo found, returning");
                     return;
                   }
                   // Clear previous saved unpaid amount before processing new detection
                 clearSavedUnpaidAmount();
             
             
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
                     
                     // Clear all payment fields and reset to single mode
                     console.log("🧹 Clearing all payment fields due to invalid payment data");
                     
                     // Clear group payment fields
                     setGroupUtrId('');
                     setGroupReceiptNo('');
                     setGroupOnlineAmount('');
                     setGroupOfflineAmount('');
                     setGroupPaymentDate('');
                     setGroupCount(0);
                     setDynamicGroupEntries([]);
                     
                     // Reset to single payment mode
                     setPaymentType('single');
                     setPaymentFieldsReadOnly(false);
                     
                     // Clear errors
                     setErrors({});
                     
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
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
                     clearSavedUnpaidAmount();
                     // Clear all payment fields and reset to single mode
                     console.log("🧹 Clearing all payment fields and resetting to single mode");
                     
                     // Clear group payment fields
                     setGroupUtrId('');
                     setGroupReceiptNo('');
                     setGroupOnlineAmount('');
                     setGroupOfflineAmount('');
                     setGroupPaymentDate('');
                     setGroupCount(0);
                     setDynamicGroupEntries([]);
                     
                     // Reset to single payment mode
                     setPaymentType('single');
                     setPaymentFieldsReadOnly(false);
                     
                     // Clear errors
                     setErrors({});
                     
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                     return;
                   }
                   
                   console.log("✅ STEP 2 PASSED: Student is a member of the existing group");
                   
                   // 🆕 STEP 3: CHECK IF STUDENT IS PAID OR UNPAID (FIXED VERSION)
                   // Check against ALL paid students, not just the first one
             
                    console.log("🔍 DEBUG - existingPayment:", existingPayment);
                   console.log("🔍 DEBUG - duplicateInfo.studentInfo:", duplicateInfo.studentInfo);
                   console.log("🔍 DEBUG - duplicateInfo structure:", Object.keys(duplicateInfo));
                   let isPaidStudent = false;
                   let paidStudentData = null;
                   let unpaidAmountForCurrentStudent = 0;
             
             
                   // Method 1: If you have individualPaidStudents array in existingPayment
                   if (existingPayment.individualPaidStudents && Array.isArray(existingPayment.individualPaidStudents)) {
                      console.log("✅ Method 1: Found individualPaidStudents array");
                     console.log("🔍 individualPaidStudents:", existingPayment.individualPaidStudents);
                     const paidStudent = (existingPayment?.individualPaidStudents ?? []).find(
               (student) => student?.studentName?.trim()?.toUpperCase() === currentStudentName
             );
             
                     
                     if (paidStudent) {
                       isPaidStudent = true;
                       paidStudentData = paidStudent;
                       console.log("✅ Method 1: Found paid student:", paidStudent);
                     }
                   }
                   // Method 2: If you have paidStudentNames array
                   else if (existingPayment?.paidStudentNames && Array.isArray(existingPayment?.paidStudentNames)) {
                      console.log("✅ Method 2: Found paidStudentNames array");
                     console.log("🔍 paidStudentNames:", existingPayment.paidStudentNames);
                     isPaidStudent = (existingPayment?.paidStudentNames ??[])
                       .filter((name) => name != null) // Filter out null/undefined values
                       .map(name => name.trim().toUpperCase())
                       .includes(currentStudentName);
                       
                     // Find the paid student data
                      if (isPaidStudent && Array.isArray(existingPayment?.individualPaidStudents)) {
                 paidStudentData = (existingPayment?.individualPaidStudents ?? []).find(
                   (student) => student?.studentName?.trim()?.toUpperCase() === currentStudentName
                 );
                      console.log("✅ Method 2: Found paid student:", paidStudentData);
                     }
                   }
                   // Method 3: Fallback - check duplicateInfo.allGroupMembers (FIXED VERSION)
                   else if (duplicateInfo.allGroupMembers && Array.isArray(duplicateInfo?.allGroupMembers)) {
                     console.log("✅ Method 3: Found allGroupMembers array");
                     console.log("🔍 allGroupMembers:", duplicateInfo.allGroupMembers);
                     
                     const paidStudent = (duplicateInfo?.allGroupMembers ?? []).find((member) => {
                       // Check the structure of member - it seems to have studentInfo nested inside
                       if (!member) {
                         console.log("⚠️ Found null/undefined member:", member);
                         return false;
                       }
                       
                       try {
                         let memberName: string | null = null;
                         let memberAmount = 0;
                         
                         // Check if studentName is directly available
                         if (member.studentName) {
                           memberName = member.studentName.trim().toUpperCase();
                           memberAmount = member.amount || 0;
                         }
                         // Check if studentInfo is nested inside member
                         else if (member.studentInfo && member.studentInfo?.studentName) {
                           memberName = member.studentInfo.studentName.trim().toUpperCase();
                           // Check for amount in different locations
                           memberAmount = member.amount || member.existingPayment?.amount || 0;
                         }
                         // Check if existingPayment has the student info
                         else if (member.existingPayment && member.existingPayment?.studentName) {
                           memberName = member.existingPayment.studentName.trim().toUpperCase();
                           memberAmount = member.existingPayment.amount || member.amount || 0;
                         }
                         
                         if (!memberName) {
                           console.log("⚠️ Could not extract studentName from member:", member);
                           return false;
                         }
                         
                         console.log("🔍 Checking member:", memberName, "Amount:", memberAmount, "Target:", currentStudentName);
                         return memberName === currentStudentName && memberAmount > 0;
                         
                       } catch (error) {
                         console.log("⚠️ Error processing member:", member, error);
                         return false;
                       }
                     });
                     
                     if (paidStudent) {
                       isPaidStudent = true;
                       // Structure the paid student data properly
                       if (paidStudent.studentInfo) {
                         paidStudentData = {
                           ...paidStudent.studentInfo,
                           amount: paidStudent.amount || paidStudent.existingPayment?.amount || 0
                         };
                       } else if (paidStudent.existingPayment) {
                         paidStudentData = {
                           ...paidStudent.existingPayment,
                           amount: paidStudent.existingPayment.amount || paidStudent.amount || 0
                         };
                       } else {
                         paidStudentData = paidStudent;
                             
                       console.log("✅ Method 3: Found paid student in allGroupMembers:", paidStudentData);
                     }
                   }
                   // Method 4: Fallback - check duplicateInfo.studentInfo (current method - only works for first student)
                   else if (duplicateInfo.studentInfo && duplicateInfo.studentInfo.studentName) {
                     console.log("✅ Method 4: Using duplicateInfo.studentInfo");
                     isPaidStudent = currentStudentName === duplicateInfo.studentInfo.studentName.trim().toUpperCase();
                     if (isPaidStudent) {
                       paidStudentData = duplicateInfo.studentInfo;
                       console.log("✅ Method 4: Found paid student:", paidStudentData);
                     }
                   }
                   
                   console.log("🔍 DEBUG - Is paid student?", isPaidStudent);
                   console.log("🔍 DEBUG - Paid student data:", paidStudentData);
                   
                   if (isPaidStudent) {
                     // 🆕 STEP 4A: PAID STUDENT - CHECK FATHER NAME
                     if (!paidStudentData || !paidStudentData.fatherName) {
                       console.log("❌ ERROR: Paid student data incomplete");
                       alert(`❌ SYSTEM ERROR: Student payment data is incomplete!\n\nPlease contact support.`);
                       
                       // Clear all payment fields and reset to single mode
                       console.log("🧹 Clearing all payment fields due to incomplete student data");
                       
                       // Clear group payment fields
                       setGroupUtrId('');
                       setGroupReceiptNo('');
                       setGroupOnlineAmount('');
                       setGroupOfflineAmount('');
                       setGroupPaymentDate('');
                       setGroupCount(0);
                       setDynamicGroupEntries([]);
                       
                       // Reset to single payment mode
                       setPaymentType('single');
                       setPaymentFieldsReadOnly(false);
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     const existingFatherName = paidStudentData.fatherName.trim().toUpperCase();
                     const isFatherNameMatching = currentFatherName === existingFatherName;
                     
                     console.log("🔍 DEBUG - Existing father name:", existingFatherName);
                     console.log("🔍 DEBUG - Father name matching?", isFatherNameMatching);
                     
                     if (!isFatherNameMatching) {
                       console.log("❌ PAID STUDENT BUT FATHER NAME MISMATCH");
                       alert(`❌ FATHER NAME MISMATCH!\n\nStudent: ${formData.studentName}\nThis student has already PAID in this group.\n\nExpected Father Name: ${paidStudentData.fatherName}\nYou entered Father Name: ${formData.fatherName}\n\nFather names don't match. This student cannot be the same person.\n\nPlease verify the details or use a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`);
                       
                       // Clear all payment fields and reset to single mode
                       console.log("🧹 Clearing all payment fields due to father name mismatch");
                       clearSavedUnpaidAmount();
                       // Clear group payment fields
                       setGroupUtrId('');
                       setGroupReceiptNo('');
                       setGroupOnlineAmount('');
                       setGroupOfflineAmount('');
                       setGroupPaymentDate('');
                       setGroupCount(0);
                       setDynamicGroupEntries([]);
                       
                       // Reset to single payment mode
                       setPaymentType('single');
                       setPaymentFieldsReadOnly(false);
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     // 🆕 STEP 4B: PAID STUDENT WITH MATCHING FATHER NAME - CANNOT RE-ENTER
                     console.log("❌ PAID STUDENT WITH MATCHING FATHER NAME - DUPLICATE ENTRY NOT ALLOWED");
                     alert(`❌ DUPLICATE ENTRY NOT ALLOWED!\n\nStudent: ${formData.studentName}\nFather: ${formData.fatherName}\n\nThis student has ALREADY PAID in this group payment.\n\nExisting Payment Details:\n• Course: ${duplicateInfo.courseName}\n• Batch: ${duplicateInfo.batchName}\n• Year: ${duplicateInfo.yearName}\n• Amount: ₹${paidStudentData.amount || existingPayment.amount?.toLocaleString()}\n• Date: ${existingPayment.paymentDate}\n\n⚠️ You cannot create duplicate entries for the same student.\nUse a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} for new payments.`);
                     
                     // Clear all payment fields and reset to single mode
                     console.log("🧹 Clearing all payment fields due to duplicate entry");
                     clearSavedUnpaidAmount();
                     // Clear group payment fields
                     setGroupUtrId('');
                     setGroupReceiptNo('');
                     setGroupOnlineAmount('');
                     setGroupOfflineAmount('');
                     setGroupPaymentDate('');
                     setGroupCount(0);
                     setDynamicGroupEntries([]);
                     
                     // Reset to single payment mode
                     setPaymentType('single');
                     setPaymentFieldsReadOnly(false);
                     
                     // Clear errors
                     setErrors({});
                     
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                     return;
                     
                   } else {
                     // 🆕 STEP 5: UNPAID STUDENT - ALLOW PREFILL (NO FATHER NAME CHECK NEEDED)
                     console.log("✅ UNPAID STUDENT - CAN PREFILL PAYMENT DETAILS");
             
                     // 🔧 FIXED: Calculate unpaid amount properly
             let calculatedUnpaidAmount = 0;
             
             // Method 1: Try to get from modal's orange remaining amount
             if (duplicateInfo.remainingAmount && duplicateInfo.remainingAmount > 0) {
               calculatedUnpaidAmount = duplicateInfo.remainingAmount;
               console.log("💰 Method 1: Got unpaid amount from modal:", calculatedUnpaidAmount);
             }
             // Method 2: Calculate from total vs paid amounts
             else if (existingPayment.totalGroupAmount) {
               const totalGroupPayment = existingPayment.totalGroupAmount || 0;
               const totalPaidAmount = duplicateInfo.allGroupMembers
                 .filter(m => m && m.amount && m.amount > 0)
                 .reduce((sum, m) => sum + (m.amount || 0), 0);
               
               calculatedUnpaidAmount = totalGroupPayment - totalPaidAmount;
               console.log("💰 Method 2: Calculated unpaid amount:", calculatedUnpaidAmount);
               console.log("💰 Total Group Payment:", totalGroupPayment);
               console.log("💰 Total Paid Amount:", totalPaidAmount);
             }
             // Method 3: Calculate from online + offline amounts
             else {
               const totalAvailable = (existingPayment.onlineAmount || 0) + (existingPayment.offlineAmount || 0);
               const totalPaidAmount = duplicateInfo.allGroupMembers
                 .filter(m => m && m.amount && m.amount > 0)
                 .reduce((sum, m) => sum + (m.amount || 0), 0);
               
               calculatedUnpaidAmount = totalAvailable - totalPaidAmount;
               console.log("💰 Method 3: Calculated from online+offline amounts:", calculatedUnpaidAmount);
             }
             
                    // 🔧 CRITICAL FIX: Actually save the unpaid amount!
             if (calculatedUnpaidAmount > 0) {
               setSavedUnpaidAmount(calculatedUnpaidAmount);
               setUnpaidMemberName(currentStudentName);
               console.log(`💾 SAVED unpaid amount: ₹${calculatedUnpaidAmount} for ${currentStudentName}`);
             } else {
               console.log("⚠️ No unpaid amount calculated or amount is 0");
             }
             
                     // 🔧 FIX: Set flag to disable duplicate checking temporarily
                     console.log("🔧 Setting flag to disable duplicate checking during prefill");
                     
                     // You need to add this state variable in your component
                     // const [isProcessingGroupEntry, setIsProcessingGroupEntry] = useState(false);
                     setIsProcessingGroupEntry(true);
                     
                     // Check course details for warning
                     const isSameCourse = selectedCourse === duplicateInfo.courseName;
                     const isSameBatch = selectedBatch === duplicateInfo.batchName;
                     const isSameYear = selectedYear === duplicateInfo.yearName;
                     const isSameDuration = formData.courseDuration === duplicateInfo.studentInfo?.courseDuration;
                     
                     let shouldProceed = true;
                     
                     // Show warning if different course details
                     if (!isSameCourse || !isSameBatch || !isSameYear || !isSameDuration) {
                       const warningMessage = `⚠️ DIFFERENT COURSE DETAILS DETECTED!\n\nCurrent Entry:\n- Course: ${selectedCourse}\n- Batch: ${selectedBatch}\n- Year: ${selectedYear}\n- Duration: ${formData.courseDuration} Days\n\nExisting Payment:\n- Course: ${duplicateInfo.courseName}\n- Batch: ${duplicateInfo.batchName}\n- Year: ${duplicateInfo.yearName}\n- Duration: ${duplicateInfo.studentInfo?.courseDuration} Days\n\nNote: "${currentStudentName}" is an UNPAID member of existing group but has different course details.\n\nDo you want to proceed with creating separate payment entry?`;
                       
                       shouldProceed = confirm(warningMessage);
                     }
                     
                     if (!shouldProceed) {
                       console.log("🚫 User cancelled due to course details mismatch");
                       setIsProcessingGroupEntry(false); // Re-enable duplicate checking
                       
                       // Clear all payment fields and reset to single mode
                       console.log("🧹 Clearing all payment fields due to user cancellation");
                       
                       // Clear group payment fields
                       setGroupUtrId('');
                       setGroupReceiptNo('');
                       setGroupOnlineAmount('');
                       setGroupOfflineAmount('');
                       setGroupPaymentDate('');
                       setGroupCount(0);
                       setDynamicGroupEntries([]);
                       
                       // Reset to single payment mode
                       setPaymentType('single');
                       setPaymentFieldsReadOnly(false);
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     // 🆕 STEP 6: PROCEED WITH PREFILLING FOR UNPAID STUDENT
                     console.log("🔄 Starting prefill process for unpaid student");
                     
                     // Close modal first
                     setDuplicateCheckModal(false);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
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
                             
                             // 🔧 FIX: Re-enable duplicate checking after successful prefill
                             console.log("🔧 Re-enabling duplicate checking after successful prefill");
                             setIsProcessingGroupEntry(false);
                             
                           }, 500);
                           
                         }, 300);
                         
                       } catch (error) {
                         console.error("❌ Error during prefilling:", error);
                         alert(`❌ Error occurred while pre-filling: ${error.message}`);
                         
                         // Re-enable duplicate checking on error
                         setIsProcessingGroupEntry(false);
                         clearSavedUnpaidAmount();
                         // Clear all payment fields and reset to single mode on error
                         console.log("🧹 Clearing all payment fields due to prefill error");
                         
                         // Clear group payment fields
                         setGroupUtrId('');
                         setGroupReceiptNo('');
                         setGroupOnlineAmount('');
                         setGroupOfflineAmount('');
                         setGroupPaymentDate('');
                         setGroupCount(0);
                         setDynamicGroupEntries([]);
                         
                         // Reset to single payment mode
                         setPaymentType('single');
                         setPaymentFieldsReadOnly(false);
                         
                         // Clear errors
                         setErrors({});
                       }
                     }, 150);
                   }
                 }}}
                 className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" >
                 Add to Current Group
               </button>
                )}

                {/* Hostel Group Payment Button 
                {hostelPaymentType === "group" && (  */}
                 {activeDuplicateSource === "hostel" && hostelPaymentType === "group" && (
      
                 <button 
                 type="button"
                 onClick={() => {
                   console.log("🔥 HOSTEL - Add to Current Group button clicked");
                   
                   if (!duplicateInfo) {
                     console.log("❌ No duplicateInfo found, returning");
                     return;
                   }
                   
                   // Clear previous saved unpaid amount before processing new detection
                   clearSavedUnpaidAmount();
             
                   // 🆕 STEP 1: GET BASIC INFO
                   const currentStudentName = formData.studentName.trim().toUpperCase();
                   const currentFatherName = formData.fatherName.trim().toUpperCase();
                   
                   console.log("🔍 HOSTEL DEBUG - Current student:", currentStudentName);
                   console.log("🔍 HOSTEL DEBUG - Current father:", currentFatherName);
                   console.log("🔍 HOSTEL DEBUG - DuplicateInfo:", duplicateInfo);
                   
                   // Check if existingPayment has valid data
                   if (!duplicateInfo.existingPayment || !duplicateInfo.existingPayment.groupStudents) {
                     console.log("❌ HOSTEL ERROR: No group students found in existing payment");
                     alert(`❌ SYSTEM ERROR: Invalid hostel payment data!\n\nThe UTR/Receipt ID has incomplete information.\nPlease verify your UTR/Receipt number.`);
                     
                     // Clear all hostel payment fields and reset to single mode
                     console.log("🧹 HOSTEL - Clearing all payment fields due to invalid payment data");
                     
                     // Clear hostel group payment fields
                     setHostelGroupUtrId('');
                     setHostelGroupReceiptNo('');
                     setHostelGroupOnlineAmount('');
                     setHostelGroupOfflineAmount('');
                     setHostelGroupPaymentDate('');
                     setHostelGroupEntries([]);
                     setHostelGroupCount(0);
                     setHostelFieldsReadOnly(false);
                   
                     // Reset to single payment mode
                     setHostelPaymentType('single');
                     
                     // Clear errors
                     setErrors({});
                     
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                     return;
                   }
                   
                   const existingPayment = duplicateInfo.existingPayment;
                   const existingGroupStudents = existingPayment.groupStudents;
                   const existingStudentNames = existingGroupStudents
                     .split(', ')
                     .map(name => name.trim().toUpperCase())
                     .filter(name => name.length > 0);
                   
                   console.log("🔍 HOSTEL DEBUG - Existing group students:", existingStudentNames);
                   
                   // 🆕 STEP 2: CHECK IF CURRENT STUDENT IS A MEMBER OF THE EXISTING GROUP
                   const isStudentInGroup = existingStudentNames.includes(currentStudentName);
                   
                   if (!isStudentInGroup) {
                     console.log("❌ HOSTEL - STUDENT NOT IN GROUP");
                     alert(`❌ STUDENT NOT IN HOSTEL GROUP!\n\nYou entered: "${formData.studentName}"\n\nBut this ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} belongs to hostel group:\n"${existingGroupStudents}"\n\n"${formData.studentName}" is NOT a member of this hostel group.\n\nPlease verify:\n1. Student name spelling\n2. Correct ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}`);
                     clearSavedUnpaidAmount();
                     
                     // Clear hostel group payment fields
                     setHostelGroupUtrId('');
                     setHostelGroupReceiptNo('');
                     setHostelGroupOnlineAmount('');
                     setHostelGroupOfflineAmount('');
                     setHostelGroupPaymentDate('');
                     setHostelGroupEntries([]);
                     setHostelGroupCount(0);
                     setHostelFieldsReadOnly(false);
                     
                     // Reset to single payment mode
                     setHostelPaymentType('single');
                     
                     // Clear errors
                     setErrors({});
                     
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                     return;
                   }
                   
                   console.log("✅ HOSTEL STEP 2 PASSED: Student is a member of the existing hostel group");
                   
                   // 🆕 STEP 3: CHECK IF STUDENT IS PAID OR UNPAID
                   console.log("🔍 HOSTEL DEBUG - existingPayment:", existingPayment);
                   console.log("🔍 HOSTEL DEBUG - duplicateInfo.studentInfo:", duplicateInfo.studentInfo);
                   
                   let isPaidStudent = false;
                   let paidStudentData = null;
                   let unpaidAmountForCurrentStudent = 0;
             
                   // Method 1: If you have individualPaidStudents array in existingPayment
                   if (existingPayment.individualPaidStudents && Array.isArray(existingPayment.individualPaidStudents)) {
                     console.log("✅ HOSTEL Method 1: Found individualPaidStudents array");
                     console.log("🔍 HOSTEL individualPaidStudents:", existingPayment.individualPaidStudents);
                     
                     const paidStudent = (existingPayment?.individualPaidStudents ?? []).find(
                       (student) => student?.studentName?.trim()?.toUpperCase() === currentStudentName
                     );
                     
                     if (paidStudent) {
                       isPaidStudent = true;
                       paidStudentData = paidStudent;
                       console.log("✅ HOSTEL Method 1: Found paid student:", paidStudent);
                     }
                   }
                   // Method 2: If you have paidStudentNames array
                   else if (existingPayment?.paidStudentNames && Array.isArray(existingPayment?.paidStudentNames)) {
                     console.log("✅ HOSTEL Method 2: Found paidStudentNames array");
                     console.log("🔍 HOSTEL paidStudentNames:", existingPayment.paidStudentNames);
                     
                     isPaidStudent = (existingPayment?.paidStudentNames ?? [])
                       .filter((name) => name != null)
                       .map(name => name.trim().toUpperCase())
                       .includes(currentStudentName);
                       
                     // Find the paid student data
                     if (isPaidStudent && Array.isArray(existingPayment?.individualPaidStudents)) {
                       paidStudentData = (existingPayment?.individualPaidStudents ?? []).find(
                         (student) => student?.studentName?.trim()?.toUpperCase() === currentStudentName
                       );
                       console.log("✅ HOSTEL Method 2: Found paid student:", paidStudentData);
                     }
                   }
                   // Method 3: Fallback - check duplicateInfo.allGroupMembers
                   else if (duplicateInfo.allGroupMembers && Array.isArray(duplicateInfo?.allGroupMembers)) {
                     console.log("✅ HOSTEL Method 3: Found allGroupMembers array");
                     console.log("🔍 HOSTEL allGroupMembers:", duplicateInfo.allGroupMembers);
                     
                     const paidStudent = (duplicateInfo?.allGroupMembers ?? []).find((member) => {
                       if (!member) {
                         console.log("⚠️ HOSTEL Found null/undefined member:", member);
                         return false;
                       }
                       
                       try {
                         let memberName: string | null = null;
                         let memberAmount = 0;
                         
                         // Check if studentName is directly available
                         if (member.studentName) {
                           memberName = member.studentName.trim().toUpperCase();
                           memberAmount = member.amount || 0;
                         }
                         // Check if studentInfo is nested inside member
                         else if (member.studentInfo && member.studentInfo?.studentName) {
                           memberName = member.studentInfo.studentName.trim().toUpperCase();
                           memberAmount = member.amount || member.existingPayment?.amount || 0;
                         }
                         // Check if existingPayment has the student info
                         else if (member.existingPayment && member.existingPayment?.studentName) {
                           memberName = member.existingPayment.studentName.trim().toUpperCase();
                           memberAmount = member.existingPayment.amount || member.amount || 0;
                         }
                         
                         if (!memberName) {
                           console.log("⚠️ HOSTEL Could not extract studentName from member:", member);
                           return false;
                         }
                         
                         console.log("🔍 HOSTEL Checking member:", memberName, "Amount:", memberAmount, "Target:", currentStudentName);
                         return memberName === currentStudentName && memberAmount > 0;
                         
                       } catch (error) {
                         console.log("⚠️ HOSTEL Error processing member:", member, error);
                         return false;
                       }
                     });
                     
                     if (paidStudent) {
                       isPaidStudent = true;
                       // Structure the paid student data properly
                       if (paidStudent.studentInfo) {
                         paidStudentData = {
                           ...paidStudent.studentInfo,
                           amount: paidStudent.amount || paidStudent.existingPayment?.amount || 0
                         };
                       } else if (paidStudent.existingPayment) {
                         paidStudentData = {
                           ...paidStudent.existingPayment,
                           amount: paidStudent.existingPayment.amount || paidStudent.amount || 0
                         };
                       } else {
                         paidStudentData = paidStudent;
                       }
                             
                       console.log("✅ HOSTEL Method 3: Found paid student in allGroupMembers:", paidStudentData);
                     }
                   }
                   // Method 4: Fallback - check duplicateInfo.studentInfo
                   else if (duplicateInfo.studentInfo && duplicateInfo.studentInfo.studentName) {
                     console.log("✅ HOSTEL Method 4: Using duplicateInfo.studentInfo");
                     isPaidStudent = currentStudentName === duplicateInfo.studentInfo.studentName.trim().toUpperCase();
                     if (isPaidStudent) {
                       paidStudentData = duplicateInfo.studentInfo;
                       console.log("✅ HOSTEL Method 4: Found paid student:", paidStudentData);
                     }
                   }
                   
                   console.log("🔍 HOSTEL DEBUG - Is paid student?", isPaidStudent);
                   console.log("🔍 HOSTEL DEBUG - Paid student data:", paidStudentData);
                   
                   if (isPaidStudent) {
                     // 🆕 STEP 4A: PAID STUDENT - CHECK FATHER NAME
                     if (!paidStudentData || !paidStudentData.fatherName) {
                       console.log("❌ HOSTEL ERROR: Paid student data incomplete");
                       alert(`❌ SYSTEM ERROR: Hostel student payment data is incomplete!\n\nPlease contact support.`);
                       
                       // Clear hostel group payment fields
                       setHostelGroupUtrId('');
                       setHostelGroupReceiptNo('');
                       setHostelGroupOnlineAmount('');
                       setHostelGroupOfflineAmount('');
                       setHostelGroupPaymentDate('');
                       setHostelGroupEntries([]);
                       setHostelGroupCount(0);
                     setHostelFieldsReadOnly(false);
                       
                       // Reset to single payment mode
                       setHostelPaymentType('single');
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     const existingFatherName = paidStudentData.fatherName.trim().toUpperCase();
                     const isFatherNameMatching = currentFatherName === existingFatherName;
                     
                     console.log("🔍 HOSTEL DEBUG - Existing father name:", existingFatherName);
                     console.log("🔍 HOSTEL DEBUG - Father name matching?", isFatherNameMatching);
                     
                     if (!isFatherNameMatching) {
                       console.log("❌ HOSTEL PAID STUDENT BUT FATHER NAME MISMATCH");
                       alert(`❌ FATHER NAME MISMATCH!\n\nStudent: ${formData.studentName}\nThis student has already PAID in this hostel group.\n\nExpected Father Name: ${paidStudentData.fatherName}\nYou entered Father Name: ${formData.fatherName}\n\nFather names don't match. This student cannot be the same person.\n\nPlease verify the details or use a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`);
                       
                       // Clear hostel group payment fields
                       clearSavedUnpaidAmount();
                       setHostelGroupUtrId('');
                       setHostelGroupReceiptNo('');
                       setHostelGroupOnlineAmount('');
                       setHostelGroupOfflineAmount('');
                       setHostelGroupPaymentDate('');
                       setHostelGroupEntries([]);
                       setHostelGroupCount(0);
                     setHostelFieldsReadOnly(false);
                       
                       // Reset to single payment mode
                       setHostelPaymentType('single');
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     // 🆕 STEP 4B: PAID STUDENT WITH MATCHING FATHER NAME - CANNOT RE-ENTER
                     console.log("❌ HOSTEL PAID STUDENT WITH MATCHING FATHER NAME - DUPLICATE ENTRY NOT ALLOWED");
                     alert(`❌ DUPLICATE HOSTEL ENTRY NOT ALLOWED!\n\nStudent: ${formData.studentName}\nFather: ${formData.fatherName}\n\nThis student has ALREADY PAID in this hostel group payment.\n\nExisting Payment Details:\n• Amount: ₹${paidStudentData.amount || existingPayment.amount?.toLocaleString()}\n• Date: ${existingPayment.paymentDate}\n\n⚠️ You cannot create duplicate entries for the same student.\nUse a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} for new hostel payments.`);
                     
                     // Clear hostel group payment fields
                     clearSavedUnpaidAmount();
                     setHostelGroupUtrId('');
                     setHostelGroupReceiptNo('');
                     setHostelGroupOnlineAmount('');
                     setHostelGroupOfflineAmount('');
                     setHostelGroupPaymentDate('');
                     setHostelGroupEntries([]);
                     setHostelGroupCount(0);
                     setHostelFieldsReadOnly(false);
                     
                     // Reset to single payment mode
                     setHostelPaymentType('single');
                     
                     // Clear errors
                     setErrors({});
                     
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                     return;
                     
                   } else {
                     // 🆕 STEP 5: UNPAID STUDENT - ALLOW PREFILL
                     console.log("✅ HOSTEL UNPAID STUDENT - CAN PREFILL PAYMENT DETAILS");
             
                     // Calculate unpaid amount properly
                     let calculatedUnpaidAmount = 0;
             
                     // Method 1: Try to get from modal's orange remaining amount
                     if (duplicateInfo.remainingAmount && duplicateInfo.remainingAmount > 0) {
                       calculatedUnpaidAmount = duplicateInfo.remainingAmount;
                       console.log("💰 HOSTEL Method 1: Got unpaid amount from modal:", calculatedUnpaidAmount);
                     }
                     // Method 2: Calculate from total vs paid amounts
                     else if (existingPayment.totalGroupAmount) {
                       const totalGroupPayment = existingPayment.totalGroupAmount || 0;
                       const totalPaidAmount = duplicateInfo.allGroupMembers
                         .filter(m => m && m.amount && m.amount > 0)
                         .reduce((sum, m) => sum + (m.amount || 0), 0);
                       
                       calculatedUnpaidAmount = totalGroupPayment - totalPaidAmount;
                       console.log("💰 HOSTEL Method 2: Calculated unpaid amount:", calculatedUnpaidAmount);
                       console.log("💰 HOSTEL Total Group Payment:", totalGroupPayment);
                       console.log("💰 HOSTEL Total Paid Amount:", totalPaidAmount);
                     }
                     // Method 3: Calculate from online + offline amounts
                     else {
                       const totalAvailable = (existingPayment.onlineAmount || 0) + (existingPayment.offlineAmount || 0);
                       const totalPaidAmount = duplicateInfo.allGroupMembers
                         .filter(m => m && m.amount && m.amount > 0)
                         .reduce((sum, m) => sum + (m.amount || 0), 0);
                       
                       calculatedUnpaidAmount = totalAvailable - totalPaidAmount;
                       console.log("💰 HOSTEL Method 3: Calculated from online+offline amounts:", calculatedUnpaidAmount);
                     }
             
                     // Save the unpaid amount!
                     if (calculatedUnpaidAmount > 0) {
                       setSavedUnpaidAmount(calculatedUnpaidAmount);
                       setUnpaidMemberName(currentStudentName);
                       console.log(`💾 HOSTEL SAVED unpaid amount: ₹${calculatedUnpaidAmount} for ${currentStudentName}`);
                     } else {
                       console.log("⚠️ HOSTEL No unpaid amount calculated or amount is 0");
                     }
             
                     // Set flag to disable duplicate checking temporarily
                     console.log("🔧 HOSTEL Setting flag to disable duplicate checking during prefill");
                     setIsProcessingGroupEntry(true);
                     
                     // 🆕 STEP 6: PROCEED WITH PREFILLING FOR UNPAID STUDENT
                     console.log("🔄 HOSTEL Starting prefill process for unpaid student");
                     
                     // Close modal first
                     setDuplicateCheckModal(false);
                     setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                     
                     // Proceed with prefilling
                     setTimeout(() => {
                       try {
                         console.log("🔄 HOSTEL Pre-filling payment details for unpaid student...");
                         
                         // Pre-fill hostel payment information
                         if (existingPayment.onlineAmount > 0) {
                           setHostelGroupOnlineAmount(existingPayment.onlineAmount.toString());
                           setHostelGroupUtrId(existingPayment.utrId || '');
                           console.log("✅ HOSTEL Pre-filled online payment:", existingPayment.onlineAmount, existingPayment.utrId);
                         }
                         
                         if (existingPayment.offlineAmount > 0) {
                           setHostelGroupOfflineAmount(existingPayment.offlineAmount.toString());
                           setHostelGroupReceiptNo(existingPayment.receiptNo || '');
                           console.log("✅ HOSTEL Pre-filled offline payment:", existingPayment.offlineAmount, existingPayment.receiptNo);
                         }
                         
                         setHostelGroupPaymentDate(existingPayment.paymentDate || '');
                         
                         // Create hostel group entries with existing members
                         const newHostelGroupEntries = existingStudentNames.map((studentName, index) => ({
                           studentName: studentName,
                           amount: ''
                          
                          
                         }));
                         
                         // Set the current student as the first entry
                         const currentStudentIndex = existingStudentNames.indexOf(currentStudentName);
                         if (currentStudentIndex > 0) {
                           // Move current student to first position
                           [newHostelGroupEntries[0], newHostelGroupEntries[currentStudentIndex]] = 
                           [newHostelGroupEntries[currentStudentIndex], newHostelGroupEntries[0]];
                         }
                         
                         setTimeout(() => {
                           setHostelGroupEntries(newHostelGroupEntries);
                           setHostelFieldsReadOnly(true); // ✅ Make hostel fields read-only
              
                           setErrors({});
                           
                           const successMsg = `✅ UNPAID HOSTEL STUDENT FOUND!\n\n👤 Student: ${currentStudentName}\n📊 Group Members: ${existingStudentNames.length}\n💰 Payment details pre-filled\n\n📝 Note: This student was an unpaid member of existing hostel group payment.\nFather name verification not required for unpaid members.\n\n✨ You can now enter the amount for this hostel student.`;
                           
                           setTimeout(() => {
                             alert(successMsg);
                             
                             // Re-enable duplicate checking after successful prefill
                             console.log("🔧 HOSTEL Re-enabling duplicate checking after successful prefill");
                             setIsProcessingGroupEntry(false);
                             
                           }, 500);
                           
                         }, 300);
                         
                       } catch (error) {
                         console.error("❌ HOSTEL Error during prefilling:", error);
                         alert(`❌ Error occurred while pre-filling hostel payment: ${error.message}`);
                         
                         // Re-enable duplicate checking on error
                         setIsProcessingGroupEntry(false);
                         clearSavedUnpaidAmount();
                         
                         // Clear hostel group payment fields
                         setHostelGroupUtrId('');
                         setHostelGroupReceiptNo('');
                         setHostelGroupOnlineAmount('');
                         setHostelGroupOfflineAmount('');
                         setHostelGroupPaymentDate('');
                         setHostelGroupEntries([]);
                         setHostelGroupCount(0);
                     setHostelFieldsReadOnly(false);
                         // Reset to single payment mode
                         setHostelPaymentType('single');
                         
                         // Clear errors
                         setErrors({});
                       }
                     }, 150);
                   }
                 }}
                 className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                 Add to Current Hostel Group
               </button>
                )}

                {/* Mess Group Payment Button 
                {messPaymentType === "group" && (  */}
                 {activeDuplicateSource === "mess" && messPaymentType === "group" && (
       
                   <button 
                   type="button"
                   onClick={() => {
                     console.log("🔥 MESS - Add to Current Group button clicked");
                     
                     if (!duplicateInfo) {
                       console.log("❌ No duplicateInfo found, returning");
                       return;
                     }
                     
                     // Clear previous saved unpaid amount before processing new detection
                     clearSavedUnpaidAmount();
               
                     // 🆕 STEP 1: GET BASIC INFO
                     const currentStudentName = formData.studentName.trim().toUpperCase();
                     const currentFatherName = formData.fatherName.trim().toUpperCase();
                     
                     console.log("🔍 MESS DEBUG - Current student:", currentStudentName);
                     console.log("🔍 MESS DEBUG - Current father:", currentFatherName);
                     console.log("🔍 MESS DEBUG - DuplicateInfo:", duplicateInfo);
                     
                     // Check if existingPayment has valid data
                     if (!duplicateInfo.existingPayment || !duplicateInfo.existingPayment.groupStudents) {
                       console.log("❌ MESS ERROR: No group students found in existing payment");
                       alert(`❌ SYSTEM ERROR: Invalid mess payment data!\n\nThe UTR/Receipt ID has incomplete information.\nPlease verify your UTR/Receipt number.`);
                       
                       // Clear all mess payment fields and reset to single mode
                       console.log("🧹 MESS - Clearing all payment fields due to invalid payment data");
                       
                       // Clear mess group payment fields
                       setMessGroupUtrId('');
                       setMessGroupReceiptNo('');
                       setMessGroupOnlineAmount('');
                       setMessGroupOfflineAmount('');
                       setMessGroupPaymentDate('');
                       setMessGroupEntries([]);
                       setMessGroupCount(0);
                     setMessFieldsReadOnly(false);
                       
                       // Reset to single payment mode
                       setMessPaymentType('single');
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     const existingPayment = duplicateInfo.existingPayment;
                     const existingGroupStudents = existingPayment.groupStudents;
                     const existingStudentNames = existingGroupStudents
                       .split(', ')
                       .map(name => name.trim().toUpperCase())
                       .filter(name => name.length > 0);
                     
                     console.log("🔍 MESS DEBUG - Existing group students:", existingStudentNames);
                     
                     // 🆕 STEP 2: CHECK IF CURRENT STUDENT IS A MEMBER OF THE EXISTING GROUP
                     const isStudentInGroup = existingStudentNames.includes(currentStudentName);
                     
                     if (!isStudentInGroup) {
                       console.log("❌ MESS - STUDENT NOT IN GROUP");
                       alert(`❌ STUDENT NOT IN MESS GROUP!\n\nYou entered: "${formData.studentName}"\n\nBut this ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} belongs to mess group:\n"${existingGroupStudents}"\n\n"${formData.studentName}" is NOT a member of this mess group.\n\nPlease verify:\n1. Student name spelling\n2. Correct ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}`);
                       clearSavedUnpaidAmount();
                       
                       // Clear mess group payment fields
                       setMessGroupUtrId('');
                       setMessGroupReceiptNo('');
                       setMessGroupOnlineAmount('');
                       setMessGroupOfflineAmount('');
                       setMessGroupPaymentDate('');
                       setMessGroupEntries([]);
                       
                       // Reset to single payment mode
                       setMessPaymentType('single');
                       setMessGroupCount(0);
                     setMessFieldsReadOnly(false);
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                     }
                     
                     console.log("✅ MESS STEP 2 PASSED: Student is a member of the existing mess group");
                     
                     // 🆕 STEP 3: CHECK IF STUDENT IS PAID OR UNPAID
                     console.log("🔍 MESS DEBUG - existingPayment:", existingPayment);
                     console.log("🔍 MESS DEBUG - duplicateInfo.studentInfo:", duplicateInfo.studentInfo);
                     
                     let isPaidStudent = false;
                     let paidStudentData = null;
                     let unpaidAmountForCurrentStudent = 0;
               
                     // Method 1: If you have individualPaidStudents array in existingPayment
                     if (existingPayment.individualPaidStudents && Array.isArray(existingPayment.individualPaidStudents)) {
                       console.log("✅ MESS Method 1: Found individualPaidStudents array");
                       console.log("🔍 MESS individualPaidStudents:", existingPayment.individualPaidStudents);
                       
                       const paidStudent = (existingPayment?.individualPaidStudents ?? []).find(
                         (student) => student?.studentName?.trim()?.toUpperCase() === currentStudentName
                       );
                       
                       if (paidStudent) {
                         isPaidStudent = true;
                         paidStudentData = paidStudent;
                         console.log("✅ MESS Method 1: Found paid student:", paidStudent);
                       }
                     }
                     // Method 2: If you have paidStudentNames array
                     else if (existingPayment?.paidStudentNames && Array.isArray(existingPayment?.paidStudentNames)) {
                       console.log("✅ MESS Method 2: Found paidStudentNames array");
                       console.log("🔍 MESS paidStudentNames:", existingPayment.paidStudentNames);
                       
                       isPaidStudent = (existingPayment?.paidStudentNames ?? [])
                         .filter((name) => name != null)
                         .map(name => name.trim().toUpperCase())
                         .includes(currentStudentName);
                         
                       // Find the paid student data
                       if (isPaidStudent && Array.isArray(existingPayment?.individualPaidStudents)) {
                         paidStudentData = (existingPayment?.individualPaidStudents ?? []).find(
                           (student) => student?.studentName?.trim()?.toUpperCase() === currentStudentName
                         );
                         console.log("✅ MESS Method 2: Found paid student:", paidStudentData);
                       }
                     }
                     // Method 3: Fallback - check duplicateInfo.allGroupMembers
                     else if (duplicateInfo.allGroupMembers && Array.isArray(duplicateInfo?.allGroupMembers)) {
                       console.log("✅ MESS Method 3: Found allGroupMembers array");
                       console.log("🔍 MESS allGroupMembers:", duplicateInfo.allGroupMembers);
                       
                       const paidStudent = (duplicateInfo?.allGroupMembers ?? []).find((member) => {
                         if (!member) {
                           console.log("⚠️ MESS Found null/undefined member:", member);
                           return false;
                         }
                         
                         try {
                           let memberName: string | null = null;
                           let memberAmount = 0;
                           
                           // Check if studentName is directly available
                           if (member.studentName) {
                             memberName = member.studentName.trim().toUpperCase();
                             memberAmount = member.amount || 0;
                           }
                           // Check if studentInfo is nested inside member
                           else if (member.studentInfo && member.studentInfo?.studentName) {
                             memberName = member.studentInfo.studentName.trim().toUpperCase();
                             memberAmount = member.amount || member.existingPayment?.amount || 0;
                           }
                           // Check if existingPayment has the student info
                           else if (member.existingPayment && member.existingPayment?.studentName) {
                             memberName = member.existingPayment.studentName.trim().toUpperCase();
                             memberAmount = member.existingPayment.amount || member.amount || 0;
                           }
                           
                           if (!memberName) {
                             console.log("⚠️ MESS Could not extract studentName from member:", member);
                             return false;
                           }
                           
                           console.log("🔍 MESS Checking member:", memberName, "Amount:", memberAmount, "Target:", currentStudentName);
                           return memberName === currentStudentName && memberAmount > 0;
                           
                         } catch (error) {
                           console.log("⚠️ MESS Error processing member:", member, error);
                           return false;
                         }
                       });
                       
                       if (paidStudent) {
                         isPaidStudent = true;
                         // Structure the paid student data properly
                         if (paidStudent.studentInfo) {
                           paidStudentData = {
                             ...paidStudent.studentInfo,
                             amount: paidStudent.amount || paidStudent.existingPayment?.amount || 0
                           };
                         } else if (paidStudent.existingPayment) {
                           paidStudentData = {
                             ...paidStudent.existingPayment,
                             amount: paidStudent.existingPayment.amount || paidStudent.amount || 0
                           };
                         } else {
                           paidStudentData = paidStudent;
                         }
                               
                         console.log("✅ MESS Method 3: Found paid student in allGroupMembers:", paidStudentData);
                       }
                     }
                     // Method 4: Fallback - check duplicateInfo.studentInfo
                     else if (duplicateInfo.studentInfo && duplicateInfo.studentInfo.studentName) {
                       console.log("✅ MESS Method 4: Using duplicateInfo.studentInfo");
                       isPaidStudent = currentStudentName === duplicateInfo.studentInfo.studentName.trim().toUpperCase();
                       if (isPaidStudent) {
                         paidStudentData = duplicateInfo.studentInfo;
                         console.log("✅ MESS Method 4: Found paid student:", paidStudentData);
                       }
                     }
                     
                     console.log("🔍 MESS DEBUG - Is paid student?", isPaidStudent);
                     console.log("🔍 MESS DEBUG - Paid student data:", paidStudentData);
                     
                     if (isPaidStudent) {
                       // 🆕 STEP 4A: PAID STUDENT - CHECK FATHER NAME
                       if (!paidStudentData || !paidStudentData.fatherName) {
                         console.log("❌ MESS ERROR: Paid student data incomplete");
                         alert(`❌ SYSTEM ERROR: Mess student payment data is incomplete!\n\nPlease contact support.`);
                         
                         // Clear mess group payment fields
                         setMessGroupUtrId('');
                         setMessGroupReceiptNo('');
                         setMessGroupOnlineAmount('');
                         setMessGroupOfflineAmount('');
                         setMessGroupPaymentDate('');
                         setMessGroupEntries([]);
                         setMessGroupCount(0);
                     setMessFieldsReadOnly(false);
                         
                         // Reset to single payment mode
                         setMessPaymentType('single');
                         
                         // Clear errors
                         setErrors({});
                         
                         setDuplicateCheckModal(false);
                         setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                         return;
                       }
                       
                       const existingFatherName = paidStudentData.fatherName.trim().toUpperCase();
                       const isFatherNameMatching = currentFatherName === existingFatherName;
                       
                       console.log("🔍 MESS DEBUG - Existing father name:", existingFatherName);
                       console.log("🔍 MESS DEBUG - Father name matching?", isFatherNameMatching);
                       
                       if (!isFatherNameMatching) {
                         console.log("❌ MESS PAID STUDENT BUT FATHER NAME MISMATCH");
                         alert(`❌ FATHER NAME MISMATCH!\n\nStudent: ${formData.studentName}\nThis student has already PAID in this mess group.\n\nExpected Father Name: ${paidStudentData.fatherName}\nYou entered Father Name: ${formData.fatherName}\n\nFather names don't match. This student cannot be the same person.\n\nPlease verify the details or use a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`);
                         
                         // Clear mess group payment fields
                         clearSavedUnpaidAmount();
                         setMessGroupUtrId('');
                         setMessGroupReceiptNo('');
                         setMessGroupOnlineAmount('');
                         setMessGroupOfflineAmount('');
                         setMessGroupPaymentDate('');
                         setMessGroupEntries([]);
                         setMessGroupCount(0);
                     setMessFieldsReadOnly(false);
                         
                         // Reset to single payment mode
                         setMessPaymentType('single');
                         
                         // Clear errors
                         setErrors({});
                         
                         setDuplicateCheckModal(false);
                         setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                         return;
                       }
                       
                       // 🆕 STEP 4B: PAID STUDENT WITH MATCHING FATHER NAME - CANNOT RE-ENTER
                       console.log("❌ MESS PAID STUDENT WITH MATCHING FATHER NAME - DUPLICATE ENTRY NOT ALLOWED");
                       alert(`❌ DUPLICATE MESS ENTRY NOT ALLOWED!\n\nStudent: ${formData.studentName}\nFather: ${formData.fatherName}\n\nThis student has ALREADY PAID in this mess group payment.\n\nExisting Payment Details:\n• Amount: ₹${paidStudentData.amount || existingPayment.amount?.toLocaleString()}\n• Date: ${existingPayment.paymentDate}\n\n⚠️ You cannot create duplicate entries for the same student.\nUse a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'} for new mess payments.`);
                       
                       // Clear mess group payment fields
                       clearSavedUnpaidAmount();
                       setMessGroupUtrId('');
                       setMessGroupReceiptNo('');
                       setMessGroupOnlineAmount('');
                       setMessGroupOfflineAmount('');
                       setMessGroupPaymentDate('');
                       setMessGroupEntries([]);
                       setMessGroupCount(0);
                     setMessFieldsReadOnly(false);
                       
                       // Reset to single payment mode
                       setMessPaymentType('single');
                       
                       // Clear errors
                       setErrors({});
                       
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       return;
                       
                     } else {
                       // 🆕 STEP 5: UNPAID STUDENT - ALLOW PREFILL
                       console.log("✅ MESS UNPAID STUDENT - CAN PREFILL PAYMENT DETAILS");
               
                       // Calculate unpaid amount properly
                       let calculatedUnpaidAmount = 0;
               
                       // Method 1: Try to get from modal's orange remaining amount
                       if (duplicateInfo.remainingAmount && duplicateInfo.remainingAmount > 0) {
                         calculatedUnpaidAmount = duplicateInfo.remainingAmount;
                         console.log("💰 MESS Method 1: Got unpaid amount from modal:", calculatedUnpaidAmount);
                       }
                       // Method 2: Calculate from total vs paid amounts
                       else if (existingPayment.totalGroupAmount) {
                         const totalGroupPayment = existingPayment.totalGroupAmount || 0;
                         const totalPaidAmount = duplicateInfo.allGroupMembers
                           .filter(m => m && m.amount && m.amount > 0)
                           .reduce((sum, m) => sum + (m.amount || 0), 0);
                         
                         calculatedUnpaidAmount = totalGroupPayment - totalPaidAmount;
                         console.log("💰 MESS Method 2: Calculated unpaid amount:", calculatedUnpaidAmount);
                         console.log("💰 MESS Total Group Payment:", totalGroupPayment);
                         console.log("💰 MESS Total Paid Amount:", totalPaidAmount);
                       }
                       // Method 3: Calculate from online + offline amounts
                       else {
                         const totalAvailable = (existingPayment.onlineAmount || 0) + (existingPayment.offlineAmount || 0);
                         const totalPaidAmount = duplicateInfo.allGroupMembers
                           .filter(m => m && m.amount && m.amount > 0)
                           .reduce((sum, m) => sum + (m.amount || 0), 0);
                         
                         calculatedUnpaidAmount = totalAvailable - totalPaidAmount;
                         console.log("💰 MESS Method 3: Calculated from online+offline amounts:", calculatedUnpaidAmount);
                       }
               
                       // Save the unpaid amount!
                       if (calculatedUnpaidAmount > 0) {
                         setSavedUnpaidAmount(calculatedUnpaidAmount);
                         setUnpaidMemberName(currentStudentName);
                         console.log(`💾 MESS SAVED unpaid amount: ₹${calculatedUnpaidAmount} for ${currentStudentName}`);
                       } else {
                         console.log("⚠️ MESS No unpaid amount calculated or amount is 0");
                       }
               
                       // Set flag to disable duplicate checking temporarily
                       console.log("🔧 MESS Setting flag to disable duplicate checking during prefill");
                       setIsProcessingGroupEntry(true);
                       
                       // 🆕 STEP 6: PROCEED WITH PREFILLING FOR UNPAID STUDENT
                       console.log("🔄 MESS Starting prefill process for unpaid student");
                       
                       // Close modal first
                       setDuplicateCheckModal(false);
                       setDuplicateInfo(null);setActiveDuplicateSource(null); // ✅ यहाँ reset करो
                       
                       // Proceed with prefilling
                       setTimeout(() => {
                         try {
                           console.log("🔄 MESS Pre-filling payment details for unpaid student...");
                           
                           // Pre-fill mess payment information
                           if (existingPayment.onlineAmount > 0) {
                             setMessGroupOnlineAmount(existingPayment.onlineAmount.toString());
                             setMessGroupUtrId(existingPayment.utrId || '');
                             console.log("✅ MESS Pre-filled online payment:", existingPayment.onlineAmount, existingPayment.utrId);
                           }
                           
                           if (existingPayment.offlineAmount > 0) {
                             setMessGroupOfflineAmount(existingPayment.offlineAmount.toString());
                             setMessGroupReceiptNo(existingPayment.receiptNo || '');
                             console.log("✅ MESS Pre-filled offline payment:", existingPayment.offlineAmount, existingPayment.receiptNo);
                           }
                           
                           setMessGroupPaymentDate(existingPayment.paymentDate || '');
                           
                           // Create mess group entries with existing members
                           const newMessGroupEntries = existingStudentNames.map((studentName, index) => ({
                             studentName: studentName,
                             amount: ''
                           }));
                           
                           // Set the current student as the first entry
                           const currentStudentIndex = existingStudentNames.indexOf(currentStudentName);
                           if (currentStudentIndex > 0) {
                             // Move current student to first position
                             [newMessGroupEntries[0], newMessGroupEntries[currentStudentIndex]] = 
                             [newMessGroupEntries[currentStudentIndex], newMessGroupEntries[0]];
                           }
                           
                           setTimeout(() => {
                             setMessGroupEntries(newMessGroupEntries);
                              setMessFieldsReadOnly(true); // ✅ Make mess fields read-only
              
                             setErrors({});
                             
                             const successMsg = `✅ UNPAID MESS STUDENT FOUND!\n\n👤 Student: ${currentStudentName}\n📊 Group Members: ${existingStudentNames.length}\n💰 Payment details pre-filled\n\n📝 Note: This student was an unpaid member of existing mess group payment.\nFather name verification not required for unpaid members.\n\n✨ You can now enter the amount for this mess student.`;
                             
                             setTimeout(() => {
                               alert(successMsg);
                               
                               // Re-enable duplicate checking after successful prefill
                               console.log("🔧 MESS Re-enabling duplicate checking after successful prefill");
                               setIsProcessingGroupEntry(false);
                               
                             }, 500);
                             
                           }, 300);
                           
                         } catch (error) {
                           console.error("❌ MESS Error during prefilling:", error);
                           alert(`❌ Error occurred while pre-filling mess payment: ${error.message}`);
                           
                           // Re-enable duplicate checking on error
                           setIsProcessingGroupEntry(false);
                           clearSavedUnpaidAmount();
                           
                           // Clear mess group payment fields
                           setMessGroupUtrId('');
                           setMessGroupReceiptNo('');
                           setMessGroupOnlineAmount('');
                           setMessGroupOfflineAmount('');
                           setMessGroupPaymentDate('');
                           setMessGroupEntries([]);
                           setMessGroupCount(0);
                     setMessFieldsReadOnly(false);
                           
                           // Reset to single payment mode
                           setMessPaymentType('single');
                           
                           // Clear errors
                           setErrors({});
                         }
                       }, 150);
                     }
                   }}
                   className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                 >
                   Add to Current Mess Group
                 </button>
                )}
              </>
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






 