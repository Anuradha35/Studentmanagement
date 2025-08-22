import React from "react";
import { Pencil, ArrowLeft, Users, CreditCard, Receipt } from "lucide-react";

interface ViewStudentsProps {
  students?: any[];
  payments?: any[];
  groupPayments?: any[];
  onEditStudent: (studentId: string) => void;
  onBack: () => void;
}

const ViewStudents: React.FC<ViewStudentsProps> = ({
  students = [],
  payments = [],
  groupPayments = [],
  onEditStudent,
  onBack,
}) => {
  const getStudentPayments = (studentId: string, studentName: string) => {
    // Check for single payments first
    const studentSinglePayments = payments.filter(p => p.studentId === studentId);

    // Check for group payments
    const studentGroupPayments = groupPayments.filter(p =>
      p.studentId === studentId ||
      p.studentName?.toLowerCase().trim() === studentName?.toLowerCase().trim()
    );

    return {
      singlePayments: studentSinglePayments,
      groupPayments: studentGroupPayments,
      isGroupPayment: studentGroupPayments.length > 0
    };
  };

  const groupPaymentsByUtrReceipt = (payments: any[]) => {
    const grouped: { [key: string]: any } = {};

    payments.forEach(p => {
      const key = `${p.utrId || ''}-${p.receiptNo || ''}`;
      if (!grouped[key]) {
        grouped[key] = { ...p, students: [] };
      }
      grouped[key].students.push({
        id: p.studentId,
        name: p.studentName,
        amount: p.amount
      });
    });

    return Object.values(grouped);
  };

  const renderPaymentDetails = (student: any) => {
    const { singlePayments, groupPayments: studentGroupPayments, isGroupPayment } =
      getStudentPayments(student.id, student.studentName);

    if (!singlePayments.length && !studentGroupPayments.length) {
      return (
        <div className="text-gray-400 text-sm italic">
          No payments recorded
        </div>
      );
    }

    const groupedPayments = groupPaymentsByUtrReceipt(studentGroupPayments);

    return (
      <div className="space-y-2">
        {/* Single Payments */}
        {singlePayments.map((payment, index) => (
          <div key={`single-${index}`} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Single Payment</span>
              <span className="text-green-400 font-bold">₹{payment.amount?.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>Mode: {payment.paymentMode}</div>
              <div>Date: {payment.paymentDate}</div>
              {payment.utrId && <div>UTR: {payment.utrId}</div>}
              {payment.receiptNo && <div>Receipt: {payment.receiptNo}</div>}
            </div>
          </div>
        ))}

        {/* Group Payments - Combined by UTR/Receipt */}
        {groupedPayments.map((payment: any, index: number) => (
          <div key={`group-${index}`} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Group Payment</span>
              <span className="text-green-400 font-bold">₹{payment.totalGroupAmount?.toLocaleString()}</span>
            </div>

            {/* All Students Shares */}
            <div className="bg-purple-500/5 rounded-lg p-3 mb-3">
              {payment.students.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-green-400 font-bold">₹{s.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Payment Method Details */}
            <div className="text-xs text-gray-300 space-y-1 border-t border-purple-500/20 pt-2">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{payment.paymentDate}</span>
              </div>

              {payment.onlineAmount > 0 && (
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>Online: ₹{payment.onlineAmount?.toLocaleString()}</span>
                  {payment.utrId && <span className="ml-2">UTR: {payment.utrId}</span>}
                </div>
              )}

              {payment.offlineAmount > 0 && (
                <div className="flex items-center gap-1">
                  <Receipt className="w-3 h-3" />
                  <span>Offline: ₹{payment.offlineAmount?.toLocaleString()}</span>
                  {payment.receiptNo && <span className="ml-2">Receipt: {payment.receiptNo}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
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
            const { isGroupPayment } = getStudentPayments(student.id, student.studentName);

            return (
              <div
                key={student.id || student.studentName}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-white text-xl font-bold mb-1">
                      {student.studentName || "—"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      {isGroupPayment ? (
                        <Users className="w-4 h-4 text-purple-400" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-blue-400" />
                      )}
                      <span>{student.courseDuration || ""}</span>
                      <span>•</span>
                      <span>{student.startDate || "—"}</span>
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
                    <div><span className="text-gray-400">Father:</span> {student.fatherName || "—"}</div>
                    <div><span className="text-gray-400">Mobile:</span> {student.mobileNo || "—"}</div>
                    <div><span className="text-gray-400">Email:</span> {student.email || "—"}</div>
                    {student.collegeName && (
                      <div><span className="text-gray-400">College:</span> {student.collegeName}</div>
                    )}
                    {student.branch && (
                      <div><span className="text-gray-400">Branch:</span> {student.branch}</div>
                    )}
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Course Fee</div>
                      <div className="text-white font-bold">₹{(student.courseFee || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Paid</div>
                      <div className="text-green-400 font-bold">₹{(student.totalPaid || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Remaining</div>
                      <div className="text-orange-400 font-bold">₹{(student.remainingFee || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
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
