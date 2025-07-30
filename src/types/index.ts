export interface Student {
  id: string;
  studentName: string;
  fatherName: string;
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

export interface Payment {
  id: string;
  studentId: string;
  paymentMode: 'online' | 'offline';
  amount: number;
  receiptNo?: string;
  transactionId?: string;
  utrId?: string;
  paymentDate: string;
  createdAt: string;
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
}