ab dublicate wale model main jo dublicate mil raha wo to show kar raha correct but jo rah gaye hai jinka add student se enter nahi kiya to wo bhi ab add nahi kar pa rahi hu e.g. A,B,C now A, ka form enter hai then B ko dalna hai but Cannot add to excisting group error

{duplicateInfo?.paymentType === 'group' && paymentType === 'group' && (
        <button 
    type="button"
    onClick={() => {
      console.log("🔥 DIRECT Add to Current Group button clicked");
      
      if (!duplicateInfo) {
        console.log("❌ No duplicateInfo found, returning");
        return;
      }
      
      // ✅ REPLACE THE ENTIRE onClick FUNCTION WITH THIS:
      const currentStudentName = formData.studentName.trim().toUpperCase();
       const currentFatherName = formData.fatherName.trim().toUpperCase();
      const existingPayment = duplicateInfo.existingPayment;
      const existingGroupStudents = existingPayment.groupStudents || '';
      const enteredFatherName = formData.fatherName.trim().toUpperCase();
      const existingFatherName = duplicateInfo.studentInfo.fatherName.trim().toUpperCase();

      const existingStudentNames = existingGroupStudents
        .split(', ')
        .map(name => name.trim().toUpperCase())
        .filter(name => name.length > 0);
      
      console.log("🔍 Current student name:", currentStudentName);
      console.log("🔍 Existing group students:", existingStudentNames);
      console.log("🔍 Current course/batch/year:", selectedCourse, selectedBatch, selectedYear);
      console.log("🔍 Existing course/batch/year:", duplicateInfo.courseName, duplicateInfo.batchName, duplicateInfo.yearName);
      
      // ✅ ENHANCED VALIDATION: Check multiple scenarios
      let canProceed = false;
      let warningMessage = '';
      let proceedMessage = '';
      
      // Check if current student is part of existing group
      const isStudentNameInGroup = existingStudentNames.includes(currentStudentName);
      const isFatherNameMatching = currentFatherName === existingFatherName;
      
      // ✅ Both conditions must be true for a valid match
      const isStudentInExistingGroup = isStudentNameInGroup ;
      
       console.log("🔍 Student name in group:", isStudentNameInGroup);
      console.log("🔍 Father name matching:", isFatherNameMatching);
      console.log("🔍 Final match result:", isStudentInExistingGroup);
      
      if (isStudentInExistingGroup ) {
        // ✅ SCENARIO 1: Student is already in the group payment
        console.log("✅ SCENARIO 1: Current student IS part of existing group");
        
        
        // Check if same course/batch/year/duration
        const isSameCourse = selectedCourse === duplicateInfo.courseName;
        const isSameBatch = selectedBatch === duplicateInfo.batchName;
        const isSameYear = selectedYear === duplicateInfo.yearName;
        const isSameDuration = formData.courseDuration === duplicateInfo.studentInfo.courseDuration;
        
        if (isSameCourse && isSameBatch && isSameYear && isSameDuration) {
          console.log("✅ EXACT MATCH: Same course, batch, year, and duration");
          canProceed = true;
          proceedMessage = `✅ Exact match found!\n\nStudent: ${currentStudentName}\nFather: ${currentFatherName}\nCourse: ${selectedCourse}\nBatch: ${selectedBatch}\nYear: ${selectedYear}\nDuration: ${formData.courseDuration}\n\nThis appears to be the same enrollment. Payment details will be pre-filled.`;
    
        } else {
          console.log("⚠️ PARTIAL MATCH: Different course details");
          canProceed = true; // Allow but with warning
          warningMessage = `⚠️ DIFFERENT COURSE DETAILS DETECTED!\n\nCurrent Entry:\n- Course: ${selectedCourse}\n- Batch: ${selectedBatch}\n- Year: ${selectedYear}\n- Duration: ${formData.courseDuration}\n\nExisting Payment:\n- Course: ${duplicateInfo.courseName}\n- Batch: ${duplicateInfo.batchName}\n- Year: ${duplicateInfo.yearName}\n- Duration: ${duplicateInfo.studentInfo.courseDuration}\n\nThis student (${currentStudentName}) appears to be enrolled in multiple courses/batches. Do you want to proceed with creating a separate payment entry for the current course?`;
        }
      } else {
        // ✅ SCENARIO 2: Student is NOT in existing group - this should not be allowed
        console.log("❌ SCENARIO 2: Current student is NOT part of existing group");
       setTimeout(() => {
          alert(`❌ ERROR: Cannot add to existing group!\n\nCurrent Student: ${currentStudentName}\nExisting Group Members: ${existingGroupStudents}\n\n${currentStudentName} is not a member of the existing group payment. Each student can only be added to their own group payments.\n\nPlease use a different ${duplicateInfo.type === 'utr' ? 'UTR/UPI ID' : 'Receipt Number'}.`);
        }, 100);
        
        // Clear the problematic field
        if (paymentType === 'group') {
          if (duplicateInfo.type === 'utr') {
            setGroupUtrId('');
            setGroupOnlineAmount('');
          } else if (duplicateInfo.type === 'receipt') {
            setGroupReceiptNo('');
            setGroupOfflineAmount('');
          }
        }
        
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
        setGroupStudentName('');
            setGroupOnlineAmount('');
            setGroupOfflineAmount('');
            setGroupUtrId('');
            setGroupReceiptNo('');
            setGroupPaymentDate('');
            setGroupPayments([]);
            setDynamicGroupEntries([]);
            setErrors({});
            setPaymentType('single'); // Reset to single if cancelled
        return;
      }
      
      // ✅ If we reach here, student is in existing group - show warning if different course details

// ✅ If we reach here, student is in existing group - show warning if different course details
    // ✅ If we reach here, student is in existing group - show warning if different course details
     // ✅ If we reach here, student is in existing group - show warning if different course details
      if (warningMessage && !confirm(warningMessage)) {
        console.log("🚫 User cancelled the warning confirmation");
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
                 // ✅ Use setTimeout to ensure modal closes before showing confirm dialog
        setTimeout(() => {
          const userConfirmed = confirm(warningMessage);
          
          if (!userConfirmed) {
            console.log("🚫 User cancelled the warning confirmation");
            
            // ✅ FIXED: Reset all group payment fields as requested
            setGroupStudentName('');
            setGroupOnlineAmount('');
            setGroupOfflineAmount('');
            setGroupUtrId('');
            setGroupReceiptNo('');
            setGroupPaymentDate('');
            setGroupPayments([]);
            setDynamicGroupEntries([]);
            setErrors({});
            setPaymentType('single'); // Reset to single if cancelled
            
            console.log("✅ All group payment fields cleared and reset to single payment");
            return;
          }
          
          // ✅ User confirmed - proceed with pre-filling
          proceedWithPreFilling();
          
        }, 300); // Increased delay to ensure modal is fully closed
        
        return;
      }
      
      console.log("✅ User confirmed to proceed (or no warning needed)");
      
      // ✅ PROCEED WITH PRE-FILLING
      // ✅ Close modal first
      setDuplicateCheckModal(false);
      setDuplicateInfo(null);
      
      // ✅ Proceed with pre-filling after short delay
      setTimeout(() => {
        proceedWithPreFilling();
      }, 150);
      
      // ✅ EXTRACTED FUNCTION: Pre-filling logic
      function proceedWithPreFilling() {
      try {
        console.log("🔄 Starting to pre-fill payment details...");
        console.log("🔍 Existing payment data:", existingPayment);
        console.log("🔍 Current form data before update:", {
          studentName: formData.studentName,
          courseDuration: formData.courseDuration,
          courseFee: formData.courseFee
        });
        
        // ✅ CRITICAL: First update the main student's info from existing data if it's an exact match
        const isSameCourse = selectedCourse === duplicateInfo.courseName;
        const isSameBatch = selectedBatch === duplicateInfo.batchName;
        const isSameYear = selectedYear === duplicateInfo.yearName;
        const isSameDuration = formData.courseDuration === duplicateInfo.studentInfo.courseDuration;
        
        if (isSameCourse && isSameBatch && isSameYear && isSameDuration) {
          console.log("✅ Exact match - updating form data with existing student info");
          // Update form data with existing student details for exact match
          setFormData(prev => ({
            ...prev,
            fatherName: duplicateInfo.studentInfo.fatherName,
            gender: duplicateInfo.studentInfo.gender,
            mobileNo: duplicateInfo.studentInfo.mobileNo,
            email: duplicateInfo.studentInfo.email,
            category: duplicateInfo.studentInfo.category,
            hostler: duplicateInfo.studentInfo.hostler,
            collegeName: duplicateInfo.studentInfo.collegeName,
            branch: duplicateInfo.studentInfo.branch,
            startDate: duplicateInfo.studentInfo.startDate,
            endDate: duplicateInfo.studentInfo.endDate
          }));
        }
        
        // ✅ Pre-fill payment information
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
        console.log("✅ Pre-filled payment date:", existingPayment.paymentDate);
        
        // ✅ ENHANCED: Create new group entries based on existing group size
        const otherMembers = existingStudentNames.filter(name => 
          name !== currentStudentName
        );
        
        console.log("🔍 Other members to fill:", otherMembers);
        console.log("🔍 Total required entries:", existingStudentNames.length);
        
        // ✅ Ensure we have at least 1 student (current student)
        const totalStudentsNeeded = Math.max(existingStudentNames.length, 1);
        
        // ✅ IMPORTANT: Update groupCount to match existing group size
        console.log("🔄 Updating groupCount from", groupCount, "to", totalStudentsNeeded);
        setGroupCount(totalStudentsNeeded);
        
        // ✅ CREATE FRESH GROUP ENTRIES with correct size
        const newGroupEntries = Array.from({ length: totalStudentsNeeded }, (_, index) => {
          if (index === 0) {
            // Student #1 is always the current student
            return {
              studentName: currentStudentName,
              amount: '', // Amount will be entered manually
              onlineAmount: '',
              offlineAmount: '',
              utrId: '',
              receiptNo: '',
              paymentDate: ''
            };
          } else {
            // Fill with other members if available
            const otherMemberIndex = index - 1;
            return {
              studentName: otherMemberIndex < otherMembers.length ? otherMembers[otherMemberIndex] : '',
              amount: '',
              onlineAmount: '',
              offlineAmount: '',
              utrId: '',
              receiptNo: '',
              paymentDate: ''
            };
          }
        });
        
        console.log("🔍 New group entries to set:", newGroupEntries);
        
        // ✅ Use setTimeout to ensure state updates properly and prevent clashing
        setTimeout(() => {
          console.log("🔄 Setting dynamic group entries after count update");
          console.log("🔍 Current groupCount before setting entries:", groupCount);
          console.log("🔍 Required totalStudentsNeeded:", totalStudentsNeeded);
          
          // ✅ Force update groupCount again if it doesn't match
          if (groupCount !== totalStudentsNeeded) {
            console.log("⚠️ GroupCount mismatch detected, forcing update");
            setGroupCount(totalStudentsNeeded);
          }
          
          setDynamicGroupEntries(newGroupEntries);
          
          // ✅ Clear any errors
          setErrors({});
          
          console.log("✅ Final group count:", totalStudentsNeeded);
          console.log("✅ Final group entries:", newGroupEntries);
           // ✅ ADD THIS LINE TO ACTIVATE READ-ONLY MODE
      setPaymentFieldsReadOnly(true);
          // ✅ CRITICAL: Close modal and set info to null BEFORE showing alert
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
          
          // ✅ FIXED: Show success message with non-blocking approach
            const successMsg = proceedMessage || `✅ Payment details pre-filled successfully!\n\n📊 Group Updated:\n- Total Students: ${totalStudentsNeeded}\n- Student #1: ${currentStudentName} (current student)\n${otherMembers.length > 0 ? `- Other Members: ${otherMembers.join(', ')}` : '- No other members'}\n\n💡 Note: Group size has been automatically adjusted to match existing payment group.`;
            
            // ✅ CRITICAL FIX: Use setTimeout for alert to prevent UI blocking and state loss
            setTimeout(() => {
              // ✅ Check if component is still mounted before showing alert
              if (document.body) {
                alert(successMsg);
                console.log("✅ Success message shown, process completed");
              }
            }, 500); // Reduced timeout but ensure UI is stable
            
          }, 300); // Reduced timeout for better responsiveness
          
          console.log("✅ Process initiated successfully");
        
      } catch (error) {
        console.error("❌ Error during pre-filling:", error);
        console.error("❌ Error stack:", error.stack);
         // ✅ FIXED: Non-blocking error alert
          setTimeout(() => {
            alert(`❌ An error occurred while pre-filling the payment details: ${error.message}\n\nPlease try again or contact support.`);
          }, 500);
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
      }
      }
      handleDuplicateConfirmation('proceed');
    }}
    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
  >
    Add to Current Group
  </button>
      )}
