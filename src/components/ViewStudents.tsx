import React from "react";
import { Pencil, ArrowLeft } from "lucide-react";

interface ViewStudentsProps {
  students?: any[];            // batch.students
  payments?: any[];            // all single payments (optional)
  groupPayments?: any[];       // all group payments (optional)
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
  const matchName = (a: string = "", b: string = "") =>
    a?.trim().toLowerCase() === b?.trim().toLowerCase();

  // Map for single payments by studentId
  const paymentsByStudentId = new Map<string, any[]>();
  (payments || []).forEach((p) => {
    if (!p) return;
    const sid = p.studentId || p.student?.id;
    if (!sid) return;
    const arr = paymentsByStudentId.get(sid) || [];
    arr.push(p);
    paymentsByStudentId.set(sid, arr);
  });

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-3 py-2 bg-white/10 rounded-md text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold text-white">View Students</h1>
      </div>

      {students.length === 0 ? (
        <div className="text-gray-400">No students in this batch.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map((s) => {
            const studentId = s.id || s.studentId;

            // Find if student is part of any group payment
            const studentGroupPayment = (groupPayments || []).find(
              (gp) => gp && matchName(gp.studentName, s.studentName)
            );

            let allPaymentsForThis: any[] = [];
            let isGroup = false;

            if (studentGroupPayment) {
              isGroup = true;

              if (studentGroupPayment.groupId) {
                // Use groupId to get full group
                allPaymentsForThis = groupPayments.filter(
                  (gp) => gp.groupId === studentGroupPayment.groupId
                );
              } else {
                // Fallback: match by UTR + Date
                allPaymentsForThis = groupPayments.filter(
                  (gp) =>
                    gp.utrId === studentGroupPayment.utrId &&
                    gp.paymentDate === studentGroupPayment.paymentDate
                );
              }
            } else {
              // Single payment case
              allPaymentsForThis =
                s.payments || paymentsByStudentId.get(studentId) || [];
            }

            return (
              <div
                key={studentId || s.studentName}
                className="bg-white/8 border border-white/10 rounded-xl p-5 backdrop-blur-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-white text-lg font-semibold">
                      {s.studentName || "—"}
                    </h2>
                    <p className="text-gray-300 text-sm">
                      {s.courseDuration || ""} • {s.startDate || "—"} → {s.endDate || "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => onEditStudent(studentId)}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                    title="Edit student"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 gap-1 text-sm text-gray-300">
                  <div><span className="text-gray-400">Father:</span> {s.fatherName || "—"}</div>
                  <div><span className="text-gray-400">Mobile:</span> {s.mobileNo || "—"}</div>
                  <div><span className="text-gray-400">Email:</span> {s.email || "—"}</div>
                  <div><span className="text-gray-400">College:</span> {s.collegeName || "—"}</div>
                  <div><span className="text-gray-400">Branch:</span> {s.branch || "—"}</div>
                </div>

                {/* Fee Summary */}
                <div className="mt-3 border-t border-white/8 pt-3">
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <div>
                      <div className="text-gray-400 text-xs">Course Fee</div>
                      <div className="text-white font-medium">₹{(s.courseFee || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Total Paid</div>
                      <div className="text-white font-medium">₹{(s.totalPaid || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Remaining</div>
                      <div className="text-white font-medium">₹{(s.remainingFee || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-3 border-t border-white/8 pt-3">
                  <p className="text-gray-300 text-sm mb-2">Payment details</p>

                  {!allPaymentsForThis || allPaymentsForThis.length === 0 ? (
                    <div className="text-gray-400 text-sm">No payments recorded for this student.</div>
                  ) : isGroup ? (
                    <>
                      {allPaymentsForThis.map((gp: any, i: number) => (
                        <div key={i} className="mb-2 p-2 bg-white/3 rounded">
                          <div className="flex justify-between">
                            <div className="text-sm text-white">{gp.studentName}</div>
                            <div className="text-green-400 font-medium">
                              ₹{((gp.onlineAmount || 0) + (gp.offlineAmount || 0)).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-300">
                            {gp.onlineAmount ? `Online: ₹${gp.onlineAmount}` : ""}
                            {gp.offlineAmount ? (gp.onlineAmount ? " • " : "") + `Offline: ₹${gp.offlineAmount}` : ""}
                            {gp.utrId ? ` • UTR: ${gp.utrId}` : ""}
                            {gp.receiptNo ? ` • Receipt: ${gp.receiptNo}` : ""}
                            {gp.paymentDate ? ` • Date: ${gp.paymentDate}` : ""}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {allPaymentsForThis.map((p: any, i: number) => (
                        <div key={i} className="mb-2 p-2 bg-white/3 rounded">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-white">₹{(p.amount || p.amt || 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-300">{p.paymentDate || p.date || ""}</div>
                          </div>
                          <div className="text-xs text-gray-300">
                            {p.paymentMode ? `${p.paymentMode}` : ""}
                            {p.utrId ? ` • UTR: ${p.utrId}` : ""}
                            {p.receiptNo ? ` • Receipt: ${p.receiptNo}` : ""}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
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
