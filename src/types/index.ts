export interface Student {
  id: string;
  studentName: string;
  fatherName: string;
  gender: 'Male' | 'Female';
  mobileNo: string;
  email: string;
  category: 'GEN' | 'SC' | 'ST' | 'PH' | 'MINORITY' | 'W' | 'OBC';
  hostler: 'Yes' | 'No';
  collegeName: string;
  branch: string;
  courseDuration: string;
  startDate: string;
  endDate: string;
  courseFee: number;
  totalPaid: number;
  remainingFee: number;
  createdAt: string;
}

// ✅ UPDATED Payment interface for single record group payments
export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentMode?: 'online' | 'offline';
  paymentDate: string;
  utrId?: string;
  receiptNo?: string;
  transactionId?: string;
  type: 'single' | 'group';
  createdAt: string;
  
  // Group payment specific fields
  groupId?: string;
  studentName?: string;
  totalGroupAmount?: number;
  onlineAmount?: number;
  offlineAmount?: number;
  groupStudents?: string; // comma separated names (all students including main)
  studentIndex?: number;
  
  // ✅ NEW: Other students data for single record approach
  otherStudentsData?: {
    name: string;
    amount: number;
    index: number;
  }[];
}

export interface CourseFee {
  id: string;
  courseName: string;
  courseDuration: string;
  fee: number;
  createdAt: string;
}

export interface Batch {
  batchName: string;
  startDate: string;
  courseDurations: string[];
  students: Student[];
}

export interface Course {
  [batchName: string]: Batch;
}

export interface Year {
  [courseName: string]: Course;
}

export interface AppData {
  years: {
    [year: string]: Year;
  };
  collegeNames: string[];
  branches: string[];
  courseDurations: string[];
  courseFees: CourseFee[];
  payments: Payment[];
}