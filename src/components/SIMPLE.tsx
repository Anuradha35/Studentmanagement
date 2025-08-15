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
