
import React from "react";
import { Pencil, ArrowLeft, Users, CreditCard, Receipt } from "lucide-react";

interface ViewStudentsProps {
  students?: any[];
  payments?: any[];
  groupPayments?: any[];
  hostelPayments?: any[];
  messPayments?: any[];
  onEditStudent: (studentId: string) => void;
  onBack: () => void;
}

const ViewStudents: React.FC<ViewStudentsProps> = ({
  students = [],
  payments = [],
  groupPayments = [],
  hostelPayments = [],
  messPayments = [],
  onEditStudent,
  onBack,
}) => {
  // Function to generate unique key for group payments
  const generateGroupPaymentKey = (payment: any) => {
    const utr = payment.utrId || payment.utrUpiId || '';
    const receipt = payment.receiptNo || '';
    const date = payment.paymentDate || '';
    const category = payment.paymentCategory || payment.category || 'course';
    return `${utr}-${receipt}-${date}-${category}`;
  };

  // Function to get payments for a student
  const getStudentPayments = (studentId: string, studentName: string) => {
    // Combine all payments (both single and group)
    const allPayments = [...payments, ...groupPayments];

    const studentPayments = allPayments.filter((payment) => {
      // Direct student ID match
      if (payment.studentId === studentId) {
        return true;
      }
      
      // Group payment check
      if (payment.type === "group" && payment.groupStudents) {
        const groupStudentNames = payment.groupStudents
          .split(",")
          .map((name) => name.trim().toLowerCase());
        const isInGroup = groupStudentNames.includes(studentName.toLowerCase().trim());
        
        if (isInGroup) {
          return true;
        }
      }
      
      return false;
    });

    const studentSinglePayments = studentPayments.filter((p) => p.type === "single");
    const studentGroupPayments = studentPayments.filter((p) => p.type === "group");

    return { singlePayments: studentSinglePayments, groupPayments: studentGroupPayments };
  };

  // Function to check if student is hostler
  const isStudentHostler = (student: any) => {
    // Check for multiple possible hostler field variations
    const hostlerValue = student.hostler || student.Hostler || student.HOSTLER;
    
    if (typeof hostlerValue === 'string') {
      return hostlerValue.toLowerCase() === 'yes';
    }
    
    if (typeof hostlerValue === 'boolean') {
      return hostlerValue === true;
    }
    
    // Additional check - if student has hostel/mess fees set, consider them as hostler
    const hasHostelFee = (student.hostelFee && student.hostelFee > 0);
    const hasMessFee = (student.messFee && student.messFee > 0);
    
    return hasHostelFee || hasMessFee;
  };

  // Function to organize payments by category with duplicate prevention
  const organizePaymentsByCategory = (singlePayments: any[], groupPayments: any[], currentStudentName: string) => {
    // For group payments, filter and deduplicate based on current student
    const studentSpecificGroupPayments = groupPayments.filter(payment => {
      if (payment.groupStudents) {
        const groupMembers = payment.groupStudents.split(",").map(name => name.trim().toLowerCase());
        return groupMembers.includes(currentStudentName.toLowerCase().trim());
      }
      return false;
    });

    const getCategoryPayments = (category: string) => {
      const singleCategoryPayments = singlePayments.filter(p => {
        const paymentCategory = p.paymentCategory || p.category || "course";
        return category === "course" 
          ? (!paymentCategory || paymentCategory === "course")
          : paymentCategory === category;
      });
      
      const groupCategoryPayments = studentSpecificGroupPayments.filter(p => {
        const paymentCategory = p.paymentCategory || p.category || "course";
        return category === "course" 
          ? (!paymentCategory || paymentCategory === "course")
          : paymentCategory === category;
      });

      // Remove duplicates by creating a unique key for each group payment
      const uniqueGroupPayments = groupCategoryPayments.reduce((acc, payment) => {
        const key = generateGroupPaymentKey(payment);
        if (!acc.some(p => generateGroupPaymentKey(p) === key)) {
          acc.push(payment);
        }
        return acc;
      }, [] as any[]);

      if (uniqueGroupPayments.length > 0) {
        return uniqueGroupPayments;
      } else {
        return singleCategoryPayments;
      }
    };

    const coursePayments = getCategoryPayments("course");
    const hostelPayments = getCategoryPayments("hostel");
    const messPayments = getCategoryPayments("mess");

    // Sort each category by date (newest first)
    const sortByDate = (a: any, b: any) => {
      const dateA = new Date(a.paymentDate || '1970-01-01');
      const dateB = new Date(b.paymentDate || '1970-01-01');
      return dateB.getTime() - dateA.getTime();
    };

    coursePayments.sort(sortByDate);
    hostelPayments.sort(sortByDate);
    messPayments.sort(sortByDate);

    // Return organized payments in order: Course → Hostel → Mess
    return {
      coursePayments,
      hostelPayments,
      messPayments,
      allOrganizedPayments: [...coursePayments, ...hostelPayments, ...messPayments]
    };
  };

  // Function to group single payments by transaction
  const groupSinglePayments = (singlePayments: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    singlePayments.forEach((p) => {
      // choose a key that identifies same transaction: utrUpiId, utrId, receiptNo
      const key = (p.utrUpiId && String(p.utrUpiId).trim()) ||
                  (p.utrId && String(p.utrId).trim()) ||
                  (p.receiptNo && String(p.receiptNo).trim()) ||
                  `txn-${p.id || Math.random().toString(36).slice(2,9)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });

    // Sort payments inside a group by category so display order is stable
    Object.keys(grouped).forEach((k) => {
      grouped[k].sort((a: any, b: any) => {
        const order = { course: 0, hostel: 1, mess: 2 };
        const ca = (a.paymentCategory || a.category || 'course').toLowerCase();
        const cb = (b.paymentCategory || b.category || 'course').toLowerCase();
        return (order[ca] ?? 99) - (order[cb] ?? 99);
      });
    });

    return grouped;
  };

  // Function to render payment details for a student
  const renderPaymentDetails = (student: any) => {
    const { singlePayments, groupPayments: studentGroupPayments } = getStudentPayments(
      student.id,
      student.studentName
    );

    if (!singlePayments.length && !studentGroupPayments.length) {
      return <div className="text-gray-400 text-sm italic">No payments recorded</div>;
    }

    // Group single payments by transaction (UTR/UPI/Receipt)
    const groupedSingles = groupSinglePayments(singlePayments);

    // Remove duplicate group payments
    const uniqueGroupPayments = studentGroupPayments.reduce((acc, payment) => {
      const key = generateGroupPaymentKey(payment);
      if (!acc.some(p => generateGroupPaymentKey(p) === key)) {
        acc.push(payment);
      }
      return acc;
    }, [] as any[]);

    // Render a grouped single-transaction card
    const renderSingleGroupedCard = (txnKey: string, payments: any[]) => {
      const first = payments[0];
      const isOnlinePayment = Boolean(first.utrId || first.utrUpiId);
      const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const transactionId = first.utrUpiId || first.utrId || first.receiptNo || txnKey;

      return (
        <div key={`single-group-${txnKey}`} className="bg-blue-500/10 border-blue-500/20 border rounded-lg p-4 mb-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                Single Payment ({isOnlinePayment ? 'Online' : 'Offline'})
              </span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold text-lg">
                ₹{totalAmount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="text-xs text-gray-300 space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span>{isOnlinePayment ? 'Online' : 'Offline'}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                {isOnlinePayment ? (
                  <>
                    <CreditCard className="w-3 h-3" />
                    <span>UTR/UPI: {transactionId}</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-3 h-3" />
                    <span>Receipt: {transactionId}</span>
                  </>
                )}
                <span>({first.paymentDate || ''})</span>
              </div>
              <span className="text-green-400 font-bold">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-slate-800/30 rounded-lg p-3 mb-2">
            <div className="text-xs text-gray-400 mb-2">Category:</div>
            {payments.map((p, idx) => {
              const category = p.paymentCategory || p.category || "course";
              const amount = p.amount || 0;
              return (
                <div key={`${txnKey}-cat-${idx}`} className="flex justify-between text-sm mb-1">
                  <span className="capitalize flex items-center gap-1">
                    {category === 'course' && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                    {category === 'hostel' && <div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
                    {category === 'mess' && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                    {category}
                  </span>
                  <span className="text-white font-medium">₹{amount.toLocaleString()}</span>
                </div>
              );
            })}

            {/* Total line */}
            <div className="flex justify-between font-bold border-t border-slate-700 pt-1 mt-2">
              <span>Total ({isOnlinePayment ? "Online" : "Offline"})</span>
              <span className="text-yellow-400">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Hostel Dates (if any hostel payment) */}
          {payments.some(
            (p) => (p.paymentCategory || p.category || "").toLowerCase() === "hostel"
          ) && (student.hostelStartDate || student.hostelEndDate) && (
            <div className="text-xs text-gray-300 bg-slate-800/30 rounded px-2 py-1 mt-2">
              {student.hostelStartDate && (
                <div className="flex justify-between">
                  <span>Hostel Start:</span>
                  <span>{student.hostelStartDate}</span>
                </div>
              )}
              {student.hostelEndDate && (
                <div className="flex justify-between">
                  <span>Hostel End:</span>
                  <span>{student.hostelEndDate}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    // Render group payment card
    const renderGroupPayment = (payment: any, index: number, currentStudentName: string) => {
      const category = payment.paymentCategory || payment.category || "course";
      let studentShare = 0;
      let totalTransactionAmount = 0;
      
      if (payment.paymentMode === "combined" || payment.paymentMode === "mixed") {
        const onlineAmount = payment.onlineAmount || 0;
        const offlineAmount = payment.offlineAmount || 0;
        totalTransactionAmount = onlineAmount + offlineAmount;
        if (payment.groupStudents) {
          const groupSize = payment.groupStudents.split(",").length;
          studentShare = totalTransactionAmount / groupSize;
        } else {
          studentShare = payment.amount || 0;
        }
      } else {
        studentShare = payment.amount || 0;
        if (payment.groupStudents) {
          const groupSize = payment.groupStudents.split(",").length;
          totalTransactionAmount = studentShare * groupSize;
        } else {
          totalTransactionAmount = payment.totalGroupAmount || payment.amount || 0;
        }
      }

      // Get payment mode info
      const hasOnline = payment.utrId || payment.utrUpiId || payment.onlineAmount > 0;
      const hasOffline = payment.receiptNo || payment.offlineAmount > 0;
      const paymentMode = hasOnline && hasOffline ? "Online + Offline" : hasOnline ? "Online" : hasOffline ? "Offline" : "—";

      let displayOnlineAmount = payment.onlineAmount || 0;
      let displayOfflineAmount = payment.offlineAmount || 0;

      return (
        <div
          key={`group-${category}-${index}`}
          className="bg-purple-500/10 border-purple-500/20 border rounded-lg p-4 mb-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Group Payment</span>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold text-lg">
                ₹{totalTransactionAmount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total Amount</div>
            </div>
          </div>

          {/* Payment Mode and Transaction Details */}
          <div className="text-xs text-gray-300 space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span>{paymentMode}</span>
            </div>

            {hasOnline && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>UTR/UPI: {payment.utrUpiId || payment.utrId}</span>
                  <span>({payment.paymentDate})</span>
                </div>
                <span className="text-green-400 font-bold">
                  ₹{displayOnlineAmount.toLocaleString()}
                </span>
              </div>
            )}
            
            {hasOffline && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Receipt className="w-3 h-3" />
                  <span>Receipt: {payment.receiptNo}</span>
                  <span>({payment.paymentDate})</span>
                </div>
                <span className="text-green-400 font-bold">
                  ₹{displayOfflineAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Category Display */}
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Category:</div>
            <div className="flex justify-between text-sm">
              <span className="capitalize flex items-center gap-1">
                {category === 'course' && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                {category === 'hostel' && <div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
                {category === 'mess' && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                {category}
              </span>
              <span className="text-white font-medium">₹{studentShare.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between font-bold border-t border-slate-700 pt-1 mt-2">
              <span>Your Total</span>
              <span className="text-yellow-400">₹{studentShare.toLocaleString()}</span>
            </div>
          </div>

          {/* Group Members Info for Group Payments */}
          {payment.groupStudents && (() => {
            const allMembers = payment.groupStudents.split(",").map(name => name.trim());
            const otherMembers = allMembers.filter((name) =>
              name.toLowerCase() !== currentStudentName.toLowerCase().trim()
            );
            
            const groupSize = allMembers.length;
            const otherStudentsAmount = totalTransactionAmount - studentShare;
            const otherMembersShare = otherMembers.length > 0 ? otherStudentsAmount / otherMembers.length : 0;
            
            return otherMembers.length > 0 && (
              <div className="bg-purple-500/5 rounded-lg p-3 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-purple-100 text-sm">
                    Other Members: {otherMembers.join(", ")}
                  </span>
                  <span className="text-purple-300 font-bold">
                    ₹{otherStudentsAmount.toLocaleString()}
                  </span>
                </div>
               
              </div>
            );
          })()}

          {/* Show Hostel dates for hostel payments */}
          {category === 'hostel' && (student.hostelStartDate || student.hostelEndDate) && (
            <div className="text-xs text-gray-300 bg-slate-800/30 rounded px-2 py-1 mt-2">
              {student.hostelStartDate && (
                <div className="flex justify-between">
                  <span>Hostel Start:</span>
                  <span>{student.hostelStartDate}</span>
                </div>
              )}
              {student.hostelEndDate && (
                <div className="flex justify-between">
                  <span>Hostel End:</span>
                  <span>{student.hostelEndDate}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-3">
        {/* Render grouped single transactions first */}
        {Object.entries(groupedSingles).map(([txnKey, payments]) => 
          renderSingleGroupedCard(txnKey, payments)
        )}

        {/* Then render unique group payments */}
        {uniqueGroupPayments.map((payment: any, index: number) => 
          renderGroupPayment(payment, index, student.studentName)
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 text-white group-hover:text-blue-300 transition-colors" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">View Students</h1>
          <p className="text-gray-300">{students.length} students found</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No students in this batch.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {students.map((student) => {
            const { singlePayments, groupPayments: studentGroupPayments } = getStudentPayments(
              student.id,
              student.studentName
            );
            
            // Use organized payments for calculations with current student context
            const { allOrganizedPayments } = organizePaymentsByCategory(
              singlePayments, 
              studentGroupPayments, 
              student.studentName
            );
            const isHostler = isStudentHostler(student);

            // Course Fee Calculation
            const coursePayments = allOrganizedPayments.filter((p) => 
              !(p.paymentCategory || p.category) || (p.paymentCategory || p.category) === "course"
            );
            const coursePaid = coursePayments.reduce((sum, p) => {
              if (p.type === "single" || !p.type) {
                return sum + (p.amount || 0);
              } else if (p.type === "group") {
                let studentShare = 0;
                if (p.paymentMode === "combined" || p.paymentMode === "mixed") {
                  const totalGroupAmount = (p.onlineAmount || 0) + (p.offlineAmount || 0);
                  if (p.groupStudents) {
                    const groupSize = p.groupStudents.split(",").length;
                    studentShare = totalGroupAmount / groupSize;
                  } else {
                    studentShare = p.amount || 0;
                  }
                } else {
                  studentShare = p.amount || 0;
                }
                return sum + studentShare;
              }
              return sum;
            }, 0);

            const courseFee = student.courseFee ?? 0;
            const courseRemaining = Math.max(0, courseFee - coursePaid);

            // Hostel Fee Calculation
            const hostelPayments = allOrganizedPayments.filter((p) => 
              (p.paymentCategory || p.category)?.toLowerCase() === "hostel"
            );
            const hostelPaid = hostelPayments.reduce((sum, p) => {
              let studentShare = 0;
              if (p.type === "single" || !p.type) {
                studentShare = p.amount || 0;
              } else if (p.type === "group") {
                if (p.paymentMode === "combined" || p.paymentMode === "mixed") {
                  const totalGroupAmount = (p.onlineAmount || 0) + (p.offlineAmount || 0);
                  if (p.groupStudents) {
                    const groupSize = p.groupStudents.split(",").length;
                    studentShare = totalGroupAmount / groupSize;
                  } else {
                    studentShare = p.amount || 0;
                  }
                } else {
                  studentShare = p.amount || 0;
                }
              }
              return sum + studentShare;
            }, 0);

            const hostelFee = 0;          // Always 0
            const hostelRemaining = 0;    // Always 0

            // Mess Fee Calculation
            const messPayments = allOrganizedPayments.filter((p) => 
              (p.paymentCategory || p.category)?.toLowerCase() === "mess"
            );
            const messPaid = messPayments.reduce((sum, p) => {
              let studentShare = 0;
              if (p.type === "single" || !p.type) {
                studentShare = p.amount || 0;
              } else if (p.type === "group") {
                if (p.paymentMode === "combined" || p.paymentMode === "mixed") {
                  const totalGroupAmount = (p.onlineAmount || 0) + (p.offlineAmount || 0);
                  if (p.groupStudents) {
                    const groupSize = p.groupStudents.split(",").length;
                    studentShare = totalGroupAmount / groupSize;
                  } else {
                    studentShare = p.amount || 0;
                  }
                } else {
                  studentShare = p.amount || 0;
                }
              }
              return sum + studentShare;
            }, 0);

            const messFee = 0;          // Always 0
            const messRemaining = 0;    // Always 0

            return (
              <div
                key={student.id || student.studentName}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-1">
                      <span className="text-white">{student.studentName || "—"}</span> 
                      {" -- "} 
                      <span className="text-green-400">{student.gender}</span> 
                      {" -- "} 
                      <span className="text-yellow-400">{student.category}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span>{student.courseDuration || ""}</span>
                      <span>•</span>
                      <span>{student.startDate || "—"}</span>
                      {isHostler && (
                        <>
                          <span>•</span>
                          <span className="text-purple-300">Hostler</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onEditStudent(student.id)}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit student"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                {/* Personal Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="grid grid-cols-1 gap-1 text-gray-300">
                    <div>
                      <span className="text-gray-400">Father:</span> {student.fatherName || "—"}
                    </div>
                    <div>
                      <span className="text-gray-400">Mobile:</span> {student.mobileNo || "—"}
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span> {student.email || "—"}
                    </div>
                    <div>
                      <span className="text-gray-400">Registration Date:</span> {student.registrationDate || "—"}
                    </div>
                  
                    {student.collegeName && (
                      <div>
                        <span className="text-gray-400">College:</span> {student.collegeName}
                      </div>
                    )}
                    {student.branch && (
                      <div>
                        <span className="text-gray-400">Branch:</span> {student.branch}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="mb-4 space-y-3">
                  {/* Course Fee - Always show */}
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-gray-400 text-xs">Course Fee</div>
                        <div className="text-white font-bold">₹{courseFee.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Paid</div>
                        <div className="text-green-400 font-bold">₹{coursePaid.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Remaining</div>
                        <div
                          className={`font-bold ${
                            courseRemaining > 0 ? "text-orange-400" : "text-green-400"
                          }`}
                        >
                          ₹{courseRemaining.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Hostel Fee - Only show for hostlers or if there are hostel payments/fees */}
                  {(isHostler || hostelPayments.length > 0 || hostelFee > 0) && (
                    <div className="p-3 bg-purple-800/30 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="text-gray-400 text-xs">Hostel Fee</div>
                          <div className="text-white font-bold">₹{(hostelFee || 0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Paid</div>
                          <div className="text-green-400 font-bold">₹{(hostelPaid || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Remaining</div>
                          <div className={`font-bold ${hostelRemaining > 0 ? "text-orange-400" : "text-green-400"}`}>
                            ₹{hostelRemaining.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mess Fee - Only show for hostlers or if there are mess payments/fees */}
                  {(isHostler || messPayments.length > 0 || messFee > 0) && (
                    <div className="p-3 bg-yellow-800/30 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="text-gray-400 text-xs">Mess Fee</div>
                          <div className="text-white font-bold">₹{(messFee || 0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Paid</div>
                          <div className="text-green-400 font-bold">₹{(messPaid || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Remaining</div>
                          <div className={`font-bold ${messRemaining > 0 ? "text-orange-400" : "text-green-400"}`}>
                            ₹{messRemaining.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div>
                  <h3 className="text-gray-300 text-sm font-medium mb-2">Payment History</h3>
                  {renderPaymentDetails(student)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewStudents;
