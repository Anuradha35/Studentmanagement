import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { AppData } from "../types";

// ✅ Centralized safe duplicate check
const findDuplicatePaymentSafe = (
  appData: AppData,
  utrId?: string,
  receiptNo?: string
) => {
  console.log("🔍 Running duplicate payment search...", { utrId, receiptNo });

  const allGroupMembers: Array<{
    studentInfo: any;
    courseName: string;
    batchName: string;
    yearName: string;
    existingPayment: any;
  }> = [];
  let mainPayment: any = null;

  for (const [yearKey, yearData] of Object.entries(appData.years || {})) {
    for (const [courseKey, courseData] of Object.entries(yearData || {})) {
      for (const [batchKey, batchData] of Object.entries(courseData || {})) {
        if (!Array.isArray(batchData?.students)) continue;

        for (const student of batchData.students) {
          if (!student) continue;

          const studentPayments =
            appData.payments?.filter((p) => p.studentId === student.id) || [];

          for (const payment of studentPayments) {
            let isMatch = false;
            let matchType: "utr" | "receipt" = "utr";

            if (utrId && payment.utrId === utrId) {
              isMatch = true;
              matchType = "utr";
            }
            if (receiptNo && payment.receiptNo === receiptNo) {
              isMatch = true;
              matchType = "receipt";
            }

            if (isMatch) {
              if (!mainPayment) {
                mainPayment = {
                  type: matchType,
                  value: matchType === "utr" ? utrId : receiptNo,
                  existingPayment: payment,
                  paymentType: payment.type || "single",
                };
                console.log("⚠ Duplicate payment found:", mainPayment);
              }

              allGroupMembers.push({
                studentInfo: student,
                courseName: courseKey,
                batchName: batchKey,
                yearName: yearKey,
                existingPayment: payment,
              });

              if (payment.type === "group" && payment.groupId) {
                const sameGroupPayments =
                  appData.payments?.filter(
                    (p) =>
                      p.groupId === payment.groupId &&
                      p.studentId !== student.id
                  ) || [];

                for (const groupPayment of sameGroupPayments) {
                  for (const [y, yData] of Object.entries(appData.years || {})) {
                    for (const [c, cData] of Object.entries(yData || {})) {
                      for (const [b, bData] of Object.entries(cData || {})) {
                        if (!Array.isArray(bData?.students)) continue;

                        const groupStudent = bData.students.find(
                          (s) => s.id === groupPayment.studentId
                        );
                        if (groupStudent) {
                          const alreadyAdded = allGroupMembers.some(
                            (m) => m.studentInfo.id === groupStudent.id
                          );
                          if (!alreadyAdded) {
                            allGroupMembers.push({
                              studentInfo: groupStudent,
                              courseName: c,
                              batchName: b,
                              yearName: y,
                              existingPayment: groupPayment,
                            });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (mainPayment && allGroupMembers.length > 0) {
    console.table(
      allGroupMembers.map((m) => ({
        Student: m?.studentInfo?.studentName || "Unknown",
        Course: m?.courseName || "N/A",
        Batch: m?.batchName || "N/A",
        Year: m?.yearName || "N/A",
      }))
    );
    return {
      ...mainPayment,
      allGroupMembers,
      totalStudentsInGroup: allGroupMembers.length,
    };
  }
  console.log("✅ No duplicate payment found.");
  return null;
};

export default function StudentForm({
  appData,
  selectedYear,
  selectedCourse,
  selectedBatch,
}: {
  appData: AppData;
  selectedYear: string;
  selectedCourse: string;
  selectedBatch: string;
}) {
  const [formData, setFormData] = useState<any>({
    studentName: "",
    fatherName: "",
    mobileNo: "",
    email: "",
    startDate: "",
    endDate: "",
    receiptNo: "",
    utrId: "",
    courseFee: "",
  });

  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field: "receiptNo" | "utrId") => {
    const value = formData[field]?.trim();
    if (!value) return;
    const duplicate = findDuplicatePaymentSafe(
      appData,
      field === "utrId" ? value : undefined,
      field === "receiptNo" ? value : undefined
    );
    if (duplicate) {
      setDuplicateInfo(duplicate);
      setDuplicateModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📤 Submitting student form:", formData);
    // TODO: your form submit logic
  };

    return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Student Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Info */}
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={formData.studentName}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="fatherName"
          placeholder="Father Name"
          value={formData.fatherName}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="mobileNo"
          placeholder="Mobile Number"
          value={formData.mobileNo}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {/* Dates */}
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={formData.startDate}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={formData.endDate}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {/* Payment Info */}
        <input
          type="text"
          name="courseFee"
          placeholder="Course Fee"
          value={formData.courseFee}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="receiptNo"
          placeholder="Receipt No"
          value={formData.receiptNo}
          onChange={handleChange}
          onBlur={() => handleBlur("receiptNo")}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="utrId"
          placeholder="UTR / UPI ID"
          value={formData.utrId}
          onChange={handleChange}
          onBlur={() => handleBlur("utrId")}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Student
        </button>
      </form>

      {/* Duplicate Modal */}
      <Dialog
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <div className="bg-black bg-opacity-50 fixed inset-0"></div>
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <Dialog.Title className="text-lg font-bold text-red-600">
            Duplicate Payment Found
          </Dialog.Title>

          {duplicateInfo && (
            <div className="mt-4 text-gray-800">
              <p>
                ⚠️ Student{" "}
                <strong>
                  {duplicateInfo?.studentName ||
                    duplicateInfo?.studentInfo?.studentName ||
                    "Unknown"}
                </strong>{" "}
                already has a payment with this{" "}
                {duplicateInfo?.type === "utr" ? "UTR ID" : "Receipt No"}:{" "}
                <strong>{duplicateInfo?.value || "N/A"}</strong>
              </p>

              {duplicateInfo?.paymentType === "group" &&
                duplicateInfo?.allGroupMembers?.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold">Group Members:</p>
                    <ul className="list-disc ml-5">
                      {duplicateInfo.allGroupMembers.map((m: any, idx: number) => (
                        <li key={idx}>
                          {m?.studentInfo?.studentName || "Unknown"} (
                          {m?.courseName || "N/A"} - {m?.batchName || "N/A"})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setDuplicateModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
