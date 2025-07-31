import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, GraduationCap, Calendar, Clock, Save, DollarSign } from 'lucide-react';
import { AppData, Student, Payment } from '../types';

interface StudentFormProps {
  appData: AppData;
  selectedYear: string;
  selectedCourse: string;
  selectedBatch: string;
  preSelectedDuration?: string;
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
    mobileNo: '',
    email: '',
    category: 'GEN' as Student['category'],
    hostler: 'No' as Student['hostler'],
    collegeName: '',
    branch: '',
    courseDuration: preSelectedDuration || ''
  });

  const [payments, setPayments] = useState<{
    online: { amount: string; transactionId: string; utrId: string; paymentDate: string }[];
    offline: { amount: string; receiptNo: string; paymentDate: string }[];
  }>({
    online: [{ amount: '', transactionId: '', utrId: '', paymentDate: '' }],
    offline: [{ amount: '', receiptNo: '', paymentDate: '' }]
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationNumber, setCustomDurationNumber] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<{ [key: string]: string }>({});

  const batchData = appData.years[selectedYear]?.[selectedCourse]?.[selectedBatch];
  const batchStartDate = batchData?.startDate || '';

  // Get course fee based on selected course and duration
  const getCourseFee = (): number => {
    const courseFee = appData.courseFees?.find(
      fee => fee.courseName === selectedCourse && fee.courseDuration === formData.courseDuration
    );
    return courseFee?.fee || 0;
  };

  // Calculate total payments
  const getTotalPayments = (): number => {
    const onlineTotal = payments.online.reduce((sum, payment) => {
      const amount = parseInt(payment.amount) || 0;
      return sum + amount;
    }, 0);
    
    const offlineTotal = payments.offline.reduce((sum, payment) => {
      const amount = parseInt(payment.amount) || 0;
      return sum + amount;
    }, 0);
    
    return onlineTotal + offlineTotal;
  };

  const calculateEndDate = (startDate: string, duration: string): string => {
    if (!startDate || !duration) return '';
    
    const durationDays = parseInt(duration.replace(' Days', ''));
    if (isNaN(durationDays)) return '';
    
    const [day, month, year] = startDate.split('.');
    const start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    start.setDate(start.getDate() + durationDays - 1);
    
    return `${start.getDate().toString().padStart(2, '0')}.${(start.getMonth() + 1).toString().padStart(2, '0')}.${start.getFullYear()}`;
  };

  // Format date for input (DD.MM.YYYY)
  const formatDateForInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 8)}`;
    }
  };

  // Validate payment amounts to prevent negative remaining balance
  const validatePaymentAmount = (newAmount: number): boolean => {
    const courseFee = getCourseFee();
    const currentTotal = getTotalPayments();
    const newTotal = currentTotal - (newAmount > 0 ? 0 : newAmount) + newAmount;
    
    if (newTotal > courseFee) {
      alert(`Payment amount exceeds course fee! Maximum allowed: ₹${(courseFee - currentTotal).toLocaleString()}`);
      return false;
    }
    return true;
  };

  // Add payment row
  const addPaymentRow = (type: 'online' | 'offline') => {
    setPayments(prev => ({
      ...prev,
      [type]: [
        ...prev[type],
        type === 'online' 
          ? { amount: '', transactionId: '', utrId: '', paymentDate: '' }
          : { amount: '', receiptNo: '', paymentDate: '' }
      ]
    }));
  };

  // Remove payment row
  const removePaymentRow = (type: 'online' | 'offline', index: number) => {
    setPayments(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
    
    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = 'Mobile number must be exactly 10 digits';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // College name and branch can be blank - removing validation
    // if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    // if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.courseDuration.trim()) newErrors.courseDuration = 'Course duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const courseFee = getCourseFee();
    const totalPaid = getTotalPayments();

    const student: Student = {
      id: Date.now().toString(),
      studentName: formData.studentName.toUpperCase(),
      fatherName: formData.fatherName.toUpperCase(),
      mobileNo: formData.mobileNo,
      email: formData.email, // Keep original case
      category: formData.category,
      hostler: formData.hostler,
      collegeName: formData.collegeName.toUpperCase(),
      branch: formData.branch.toUpperCase(),
      courseDuration: formData.courseDuration,
      startDate: batchStartDate,
      endDate: calculateEndDate(batchStartDate, formData.courseDuration),
      courseFee,
      totalPaid,
      remainingFee: courseFee - totalPaid,
      createdAt: new Date().toISOString()
    };

    // Add to lists if custom values
    if (isCustomCollege && formData.collegeName.trim()) {
      onAddCollegeName(formData.collegeName.toUpperCase());
    }
    if (isCustomBranch && formData.branch.trim()) {
      onAddBranch(formData.branch.toUpperCase());
    }
    if (isCustomDuration && formData.courseDuration.trim()) {
      onAddCourseDuration(formData.courseDuration);
    }

    onAddStudent(selectedYear, selectedCourse, selectedBatch, student);
    
    // Add payments
    payments.online.forEach(payment => {
      if (payment.amount && (payment.transactionId || payment.utrId)) {
        onAddPayment(student.id, {
          paymentMode: 'online',
          amount: parseInt(payment.amount),
          transactionId: payment.transactionId || undefined,
          utrId: payment.utrId || undefined,
          paymentDate: new Date().toISOString()
        });
      }
    });

    payments.offline.forEach(payment => {
      if (payment.amount && payment.receiptNo) {
        onAddPayment(student.id, {
          paymentMode: 'offline',
          amount: parseInt(payment.amount),
          receiptNo: payment.receiptNo,
          paymentDate: new Date().toISOString()
        });
      }
    });

    // Reset form
    setFormData({
      studentName: '',
      fatherName: '',
      mobileNo: '',
      email: '',
      category: 'GEN',
      hostler: 'No',
      collegeName: '',
      branch: '',
      courseDuration: preSelectedDuration || ''
    });
    setPayments({
      online: [{ amount: '', transactionId: '', utrId: '', paymentDate: '' }],
      offline: [{ amount: '', receiptNo: '', paymentDate: '' }]
    });
    setErrors({});
    alert('Student added successfully!');
  };

  const handleCollegeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomCollege(true);
      setFormData({ ...formData, collegeName: '' });
    } else {
      setIsCustomCollege(false);
      setFormData({ ...formData, collegeName: value });
    }
  };

  const handleBranchChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomBranch(true);
      setFormData({ ...formData, branch: '' });
    } else {
      setIsCustomBranch(false);
      setFormData({ ...formData, branch: value });
    }
  };

  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
      setFormData({ ...formData, courseDuration: '' });
    } else {
      setIsCustomDuration(false);
      setFormData({ ...formData, courseDuration: value });
    }
  };

  const handleCustomDurationSubmit = () => {
    if (customDurationNumber && /^\d+$/.test(customDurationNumber)) {
      const duration = `${customDurationNumber} Days`;
      setFormData({ ...formData, courseDuration: duration });
      setCustomDurationNumber('');
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Student</h1>
            <p className="text-gray-300">
              {selectedYear} • {selectedCourse} • Batch {selectedBatch}
            </p>
          </div>
        </div>
        
        {batchStartDate && (
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
            <p className="text-blue-300">
              <Calendar className="w-4 h-4 inline mr-2" />
              Batch Start Date: {batchStartDate}
            </p>
            {preSelectedDuration && (
              <p className="text-green-300 mt-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Pre-selected Duration: {preSelectedDuration}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter father's name"
                />
                {errors.fatherName && <p className="text-red-400 text-sm mt-1">{errors.fatherName}</p>}
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
                  }}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
                {errors.mobileNo && <p className="text-red-400 text-sm mt-1">{errors.mobileNo}</p>}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Student['category'] })}
                  className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GEN">General (GEN)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="PH">Physically Handicapped (PH)</option>
                  <option value="MINORITY">Minority</option>
                  <option value="W">Women (W)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Hostler *
                </label>
                <select
                  value={formData.hostler}
                  onChange={(e) => setFormData({ ...formData, hostler: e.target.value as Student['hostler'] })}
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
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  College Name *
                </label>
                {!isCustomCollege ? (
                  <select
                    value={formData.collegeName}
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select College</option>
                    {appData.collegeNames.sort().map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                    <option value="custom">+ Add New College</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new college name"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCollege(false)}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Branch *
                </label>
                {!isCustomBranch ? (
                  <select
                    value={formData.branch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Branch</option>
                    {appData.branches.sort().map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                    <option value="custom">+ Add New Branch</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new branch name"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomBranch(false)}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Course Duration *
                </label>
                {!isCustomDuration ? (
                  <select
                    value={formData.courseDuration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!preSelectedDuration}
                  >
                    <option value="">Select Duration</option>
                    {appData.courseDurations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                    {!preSelectedDuration && <option value="custom">+ Add Custom Duration</option>}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDurationNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setCustomDurationNumber(value);
                        }}
                        className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter number of days"
                      />
                      <button
                        type="button"
                        onClick={handleCustomDurationSubmit}
                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomDuration(false)}
                        className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    {formData.courseDuration && (
                      <p className="text-green-400 text-sm">Selected: {formData.courseDuration}</p>
                    )}
                  </div>
                )}
                {errors.courseDuration && <p className="text-red-400 text-sm mt-1">{errors.courseDuration}</p>}
              </div>

              {formData.courseDuration && batchStartDate && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Course End Date
                  </label>
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 font-medium">
                      {calculateEndDate(batchStartDate, formData.courseDuration)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Fee & Payment Information */}
          {formData.courseDuration && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Course Fee & Payment Information
              </h2>
              
              {/* Course Fee Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">Course Fee</p>
                  <p className="text-2xl font-bold text-white">₹{getCourseFee().toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm">Total Paid</p>
                  <p className="text-2xl font-bold text-white">₹{getTotalPayments().toLocaleString()}</p>
                </div>
                <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                  <p className="text-orange-300 text-sm">Remaining</p>
                  <p className="text-2xl font-bold text-white">₹{(getCourseFee() - getTotalPayments()).toLocaleString()}</p>
                </div>
              </div>

              {/* Online Payments */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Online Payments</h3>
                  <button
                    type="button"
                    onClick={() => addPaymentRow('online')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    + Add Online Payment
                  </button>
                </div>
                
                {payments.online.map((payment, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <input
                      type="text"
                      value={payment.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value && !validatePaymentAmount(parseInt(value))) return;
                        const newPayments = [...payments.online];
                        newPayments[index].amount = value;
                        setPayments({ ...payments, online: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={payment.transactionId || payment.utrId}
                      onChange={(e) => {
                        const newPayments = [...payments.online];
                        newPayments[index].transactionId = e.target.value;
                        newPayments[index].utrId = e.target.value; // Same value for both
                        setPayments({ ...payments, online: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Transaction ID / UTR / UPI ID"
                    />
                    <input
                      type="text"
                      value={payment.utrId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 12); // 12 digits only
                        const newPayments = [...payments.online];
                        newPayments[index].utrId = value;
                        newPayments[index].transactionId = value; // Same value for both
                        setPayments({ ...payments, online: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="UTR/UPI (12 digits)"
                      maxLength={12}
                    />
                    <input
                      type="text"
                      value={payment.paymentDate}
                      onChange={(e) => {
                        const formatted = formatDateForInput(e.target.value);
                        const newPayments = [...payments.online];
                        newPayments[index].paymentDate = formatted;
                        setPayments({ ...payments, online: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="DD.MM.YYYY"
                      maxLength={10}
                    />
                    {payments.online.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentRow('online', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Offline Payments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Offline Payments</h3>
                  <button
                    type="button"
                    onClick={() => addPaymentRow('offline')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    + Add Offline Payment
                  </button>
                </div>
                
                {payments.offline.map((payment, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <input
                      type="text"
                      value={payment.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value && !validatePaymentAmount(parseInt(value))) return;
                        const newPayments = [...payments.offline];
                        newPayments[index].amount = value;
                        setPayments({ ...payments, offline: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={payment.receiptNo}
                      onChange={(e) => {
                        const newPayments = [...payments.offline];
                        newPayments[index].receiptNo = e.target.value;
                        setPayments({ ...payments, offline: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Receipt Number"
                    />
                    <input
                      type="text"
                      value={payment.paymentDate}
                      onChange={(e) => {
                        const formatted = formatDateForInput(e.target.value);
                        const newPayments = [...payments.offline];
                        newPayments[index].paymentDate = formatted;
                        setPayments({ ...payments, offline: newPayments });
                      }}
                      className="p-2 bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="DD.MM.YYYY"
                      maxLength={10}
                    />
                    {payments.offline.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentRow('offline', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;