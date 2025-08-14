jaise hi koi dublicate entry hai to single payment main to koi problem nahi but Agar payment group main hai to jo dublicate error show kar raha usme sirf ek single student ki kar raha ya problem hai e.g. student A,B,C ne group payment ki and A ka add student form add phir B student ke usme dublicacy A student ki hi hogi kyoki abhi Sirf A student ki hi form enter hai but ab maine B ka bhi enter kar diya hai and ab main C ka enter karna chahati hu jaise hi maine online ya offline main same utr/upi or reciept no. enter kiya to dublicacy ka message show kiya but usme sirf A ka hi show ho raha jabki A and B dono ko Add student se data successfuly enter kar chuke hai


kya ye same batch ke student ka hi information utha rahai hai kyoki ye bhi to ho sakta hai ki ek naam ke multiple student ho in same course with same batch to

toh can you consider ki jo naam hai unke naam match ho to unki payment record check kare jisse pata chale ki wo ek group ke hi hai ya nahi kyoki ye bhi ho sakte hai ki froup member same course aur alag course dono main ho sakte hai

<Dialog 
  open={duplicateCheckModal} 
  onClose={() => {
    console.log("🔥 Dialog onClose triggered - treating as cancel");
    
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
    
    setDuplicateCheckModal(false);
    setDuplicateInfo(null);
  }} 
  className="fixed z-50 inset-0 flex items-center justify-center"
>
  <div className="bg-black bg-opacity-50 fixed inset-0"></div>
  <Dialog.Panel className="bg-slate-800 border border-red-500/30 rounded-lg p-6 z-50 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
    <div className="flex items-center gap-3 mb-6">
      <AlertTriangle className="w-6 h-6 text-red-400" />
      <Dialog.Title className="text-xl font-bold text-red-400">
        Duplicate Payment Detected!
      </Dialog.Title>
    </div>
    
    {duplicateInfo && (
      <div className="space-y-6 mb-6">
        {/* Student Information Card */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Existing Student Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Student Name</p>
                <p className="text-white font-medium">{duplicateInfo.studentInfo.studentName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Father's Name</p>
                <p className="text-white">{duplicateInfo.studentInfo.fatherName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mobile Number</p>
                <p className="text-white">{duplicateInfo.studentInfo.mobileNo}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white text-sm">{duplicateInfo.studentInfo.email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Course</p>
                <p className="text-white font-medium">{duplicateInfo.courseName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Batch & Year</p>
                <p className="text-white">{duplicateInfo.batchName} • {duplicateInfo.yearName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white">{duplicateInfo.studentInfo.courseDuration}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Course Dates</p>
                <p className="text-white">{duplicateInfo.studentInfo.startDate} to {duplicateInfo.studentInfo.endDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Fee Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
            <p className="text-blue-300 text-sm">Course Fee</p>
            <p className="text-2xl font-bold text-white">₹{duplicateInfo.studentInfo.courseFee?.toLocaleString()}</p>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
            <p className="text-green-300 text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-white">₹{duplicateInfo.studentInfo.totalPaid?.toLocaleString()}</p>
          </div>
          <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-300 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-white">₹{duplicateInfo.studentInfo.remainingFee?.toLocaleString()}</p>
          </div>
        </div>

        {/* Payment Details Card */}
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
                    {duplicateInfo.existingPayment.onlineAmount > 0 && duplicateInfo.existingPayment.offlineAmount > 0
                      ? '💳 Online + 💵 Offline'
                      : duplicateInfo.existingPayment.onlineAmount > 0
                      ? '💳 Online'
                      : '💵 Offline'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {/* Payment Amounts based on type */}
                {duplicateInfo.paymentType === 'single' ? (
                  <div>
                    <p className="text-gray-400 text-sm">Payment Amount</p>
                    <p className="text-2xl font-bold text-green-400">
                      ₹{duplicateInfo.existingPayment.amount?.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-sm">Total Group Payment</p>
                      <p className="text-xl font-bold text-purple-400">
                        ₹{duplicateInfo.existingPayment.totalGroupAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">This Student's Share</p>
                        <p className="text-green-400 font-medium">
                          ₹{duplicateInfo.existingPayment.amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Others' Share</p>
                        <p className="text-blue-400 font-medium">
                          ₹{(duplicateInfo.existingPayment.totalGroupAmount - duplicateInfo.existingPayment.amount)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Online/Offline breakdown for group payments */}
                {duplicateInfo.paymentType === 'group' && (
                  <div className="text-sm space-y-1 mt-2 pt-2 border-t border-gray-600">
                    {duplicateInfo.existingPayment.onlineAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">💳 Online Amount:</span>
                        <span className="text-white">₹{duplicateInfo.existingPayment.onlineAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    {duplicateInfo.existingPayment.offlineAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">💵 Offline Amount:</span>
                        <span className="text-white">₹{duplicateInfo.existingPayment.offlineAmount?.toLocaleString()}</span>
                      </div>
                    )}
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
                  </div>
                )}
              </div>
            </div>

            {/* Group Members for group payments */}
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
            <p>Since both payments are group payments, you can add <strong>{duplicateInfo.studentInfo.studentName}</strong> to your current group as Student #1. 
            The existing payment details will be pre-filled, but you'll need to enter the amount for this student.</p>
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
          console.log("🔍 Current paymentType:", paymentType);
          console.log("🔍 duplicateInfo.type:", duplicateInfo.type);
          
          // Clear payment fields based on payment type and duplicate type
          if (paymentType === 'single') {
            if (duplicateInfo.type === 'utr') {
              console.log("🧹 Clearing single UTR ID:", utrId);
              setUtrId('');
            } else if (duplicateInfo.type === 'receipt') {
              console.log("🧹 Clearing single Receipt No:", receiptNo);
              setReceiptNo('');
            }
          } else if (paymentType === 'group') {
            if (duplicateInfo.type === 'utr') {
              console.log("🧹 Clearing group UTR ID and online amount:", groupUtrId, groupOnlineAmount);
              setGroupUtrId('');
              setGroupOnlineAmount('');
            } else if (duplicateInfo.type === 'receipt') {
              console.log("🧹 Clearing group Receipt No and offline amount:", groupReceiptNo, groupOfflineAmount);
              setGroupReceiptNo('');
              setGroupOfflineAmount('');
            }
          }
          
          setDuplicateCheckModal(false);
          setDuplicateInfo(null);
          console.log("✅ Modal closed after cancel");
          // ✅ Clear previous group data
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
        }}
        className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
      >
        Cancel
      </button>
      
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
        }, 1000);
        
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
      }, 1500);
      
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
            }, 9000); // Reduced timeout but ensure UI is stable
            
          }, 5000); // Reduced timeout for better responsiveness
          
          console.log("✅ Process initiated successfully");
        
      } catch (error) {
        console.error("❌ Error during pre-filling:", error);
        console.error("❌ Error stack:", error.stack);
         // ✅ FIXED: Non-blocking error alert
          setTimeout(() => {
            alert(`❌ An error occurred while pre-filling the payment details: ${error.message}\n\nPlease try again or contact support.`);
          }, 5000);
        setDuplicateCheckModal(false);
        setDuplicateInfo(null);
      }
      }
    }}
    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
  >
    Add to Current Group
  </button>
      )}
    </div>
  </Dialog.Panel>
</Dialog>
