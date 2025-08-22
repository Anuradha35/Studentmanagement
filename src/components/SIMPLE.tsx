<div>
  <label className="block text-gray-300 text-sm font-medium mb-2">
    Student Name *
  </label>
  <input
    ref={studentNameRef}
    type="text"
    value={formData.studentName}
    onChange={(e) => {
      const nameValue = e.target.value.toUpperCase();

      // ✅ Allow only alphabets and spaces
      if (/^[A-Z\s]*$/.test(nameValue)) {
        // Update personal info name
        setFormData({ ...formData, studentName: nameValue });

        // Auto-fill Group Payment first student name
        setDynamicGroupEntries((prev) => {
          if (!prev.length) return prev;

          if (!prev[0]) {
            console.warn("⚠️ First group entry is undefined, creating new entry");
            return [{
              studentName: nameValue,
              amount: '',
              onlineAmount: '',
              offlineAmount: '',
              utrId: '',
              receiptNo: '',
              paymentDate: ''
            }, ...prev.slice(1)];
          }

          const updated = [...prev];
          updated[0] = { ...updated[0], studentName: nameValue };
          return updated;
        });

        if (errors.studentName) {
          setErrors({ ...errors, studentName: '' });
        }
      }
    }}
    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter student name"
  />
  {errors.studentName && (
    <p className="text-red-400 text-sm mt-1">{errors.studentName}</p>
  )}
</div>

<div>
  <label className="block text-gray-300 text-sm font-medium mb-2">
    Father's Name *
  </label>
  <input
    type="text"
    value={formData.fatherName}
    onChange={(e) => {
      const fatherValue = e.target.value.toUpperCase();

      // ✅ Allow only alphabets and spacess
      if (/^[A-Z\s]*$/.test(fatherValue)) {
        setFormData({ ...formData, fatherName: fatherValue });
        if (errors.fatherName) setErrors({ ...errors, fatherName: '' });
      }
    }}
    className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter father's name"
  />
  {errors.fatherName && <p className="text-red-400 text-sm mt-1">{errors.fatherName}</p>}
</div>







  no wo correct hai main chahati hu ki ye jo Amount field hai isme jab hum amount enter kare to uski validation set ho ek to pehle hi hai ki course fee se jayada na ho and total group se bhi exceed na ho agar duplicate detection nahi ho raha tab but agar duplicate detection hai to wo us duplicate ke ander unpaid member main jo remaining amount show ho raha hai jo orange color main show ho raha hai usse exceed na ho e.g. jaise yaha y1,y2,y3 member hai jisme y1,y2 ne paid kar diya hai and unpaid 3000 show ho raha to main chahati hu ki Amount field ka validation ye bhi ho jaye ki ab wo phir 3000 se jayada pay nahi kar sakta. but meri course fee and agar duplicate nahi hai to total group se exceed wali validation waise hi apply ho wo change na ho but isme changes <label className="text-sm text-white">Amount</label>

                        <input

                          type="text"

                          placeholder="Enter amount"

                          value={dynamicGroupEntries[0]?.amount || ''}

                          disabled={

                            (parseInt(groupOnlineAmount || '0') + parseInt(groupOfflineAmount || '0')) === 0

                          }

                          onChange={(e) => {

                            const value = e.target.value.replace(/\D/g, '');

                            const amountNum = parseInt(value || '0');

                            const totalGroupPayment =

                              (parseInt(groupOnlineAmount || '0') || 0) +

                              (parseInt(groupOfflineAmount || '0') || 0);

                            if (amountNum > formData.courseFee) {

                              alert(`Amount cannot be more than ₹${formData.courseFee.toLocaleString()}`);

                              return;

                            }

                            if (amountNum > totalGroupPayment) {

                              alert(`Amount cannot be more than total group payment ₹${totalGroupPayment.toLocaleString()}`);

                              return;

                            }

                            // 3. Duplicate group ke liye unpaid member ka remaining amount se jyada na hos

  if (duplicateInfo && duplicateInfo.paymentType === "group") {

    const unpaidRemaining = duplicateInfo.otherMembersAmount || 0; // 🔑 ye value aapko duplicate modal se pass karni hai

    if (amountNum > unpaidRemaining) {

      alert(`❌ This member can only pay up to ₹${unpaidRemaining.toLocaleString()} (remaining balance).`);

      return;

    }

  }

                            setErrors(prev => ({ ...prev, [`amount_0`]: '' }));

                            const updatedEntries = [...dynamicGroupEntries];

                            if (!updatedEntries[0]) {

                              updatedEntries[0] = {

                                studentName: formData.studentName.toUpperCase(),

                                amount: '',

                                onlineAmount: '',

                                offlineAmount: '',

                                utrId: '',

                                receiptNo: '',

                                paymentDate: ''

                              };

                            }

                            updatedEntries[0] = { ...updatedEntries[0], amount: value };

                            setDynamicGroupEntries(updatedEntries);

                            const totalPaid = updatedEntries.reduce(

                              (sum, entry) => sum + parseInt(entry?.amount || '0'),

                              0

                            );

                            setFormData((prev) => ({

                              ...prev,

                              totalPaid: totalPaid,

                              remainingFee: prev.courseFee - totalPaid < 0 ? 0 : prev.courseFee - totalPaid

                            }));

                          }}

                          className="w-full p-3 bg-slate-700 border border-white/30 rounded-lg text-white"

                        />

                        {errors[`amount_0`] && (

                          <p className="text-red-400 text-sm">{errors[`amount_0`]}</p>

                        )}









Failed to load resource: the server responded with a status of 404 ()
blitz.96435430.js:19  [Contextify] [WARNING] running source code in new context
(anonymous) @ blitz.96435430.js:19
blitz.96435430.js:19  [Contextify] [WARNING] running source code in new context
(anonymous) @ blitz.96435430.js:19
headless?coep=credentialless&version=1.6.4-internal.3:1  The resource https://w-credentialless-staticblitz.com/fetch.worker.96435430.js was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
headless?coep=credentialless&version=1.6.4-internal.3:1  The resource https://w-credentialless-staticblitz.com/fetch.worker.96435430.js was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 0
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(0)
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 0
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(0)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 1
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(1)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 1
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(1)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 1
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(1)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 1
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(1)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: single
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 1
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(1)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 0
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 0
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(0)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 0
StudentForm.tsx:1017 ✅ Confirm button clicked
StudentForm.tsx:1018 ✅ groupCount = 5
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:3329 🔥 DIRECT Add to Current Group button clicked
StudentForm.tsx:955 🧹 Clearing saved unpaid amount
StudentForm.tsx:3343 🔍 DEBUG - Current student: Y3
StudentForm.tsx:3344 🔍 DEBUG - Current father: BBB
StudentForm.tsx:3345 🔍 DEBUG - DuplicateInfo: Object
StudentForm.tsx:3383 🔍 DEBUG - Existing group students: Array(3)
StudentForm.tsx:3416 ✅ STEP 2 PASSED: Student is a member of the existing group
StudentForm.tsx:3421 🔍 DEBUG - existingPayment: Object
StudentForm.tsx:3422 🔍 DEBUG - duplicateInfo.studentInfo: Object
StudentForm.tsx:3423 🔍 DEBUG - duplicateInfo structure: Array(10)
StudentForm.tsx:3463 ✅ Method 3: Found allGroupMembers array
StudentForm.tsx:3464 🔍 allGroupMembers: Array(2)
StudentForm.tsx:3499 🔍 Checking member: Y1 Amount: 3000 Target: Y3
StudentForm.tsx:3499 🔍 Checking member: Y2 Amount: 4000 Target: Y3
StudentForm.tsx:3546 ✅ Method 4: Using duplicateInfo.studentInfo
StudentForm.tsx:3554 🔍 DEBUG - Is paid student? false
StudentForm.tsx:3555 🔍 DEBUG - Paid student data: null
StudentForm.tsx:3650 ✅ UNPAID STUDENT - CAN PREFILL PAYMENT DETAILS
StudentForm.tsx:3658 🔧 Setting flag to disable duplicate checking during prefill
StudentForm.tsx:3708 🔄 Starting prefill process for unpaid student
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:3717 🔄 Pre-filling payment details for unpaid student...
StudentForm.tsx:3723 ✅ Pre-filled online payment: 5000 444444444444
StudentForm.tsx:3729 ✅ Pre-filled offline payment: 5000 44
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:777 🔄 Updated group count to match entries: 5
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 5
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(5)
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 5
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:777 🔄 Updated group count to match entries: 3
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:3767 🔧 Re-enabling duplicate checking after successful prefill
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 5
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 5
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 50
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 50
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 500
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 500
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 50
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 50
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 5
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 5
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 0
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 0
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 2
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 2
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 20
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 20
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 200
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 200
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 2000
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 2000
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 200
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 200
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 20
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 20
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 2
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 2
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 0
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 0
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 4
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 4
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 40
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 40
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 400
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 400
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 4000
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 4000
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 400
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 400
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 40
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 40
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 4
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 4
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 0
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 0
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:1728 📦 Should Render Group Section? Object
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: Array(3)
[NEW] Explain Console errors by using Copilot in Edge: click
         
         to explain an error. 
        Learn more
        Don't show again
headless?coep=credentialless&version=1.6.4-internal.3:1  The resource https://w-credentialless-staticblitz.com/fetch.worker.96435430.js was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 4
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 4
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: (3) [{…}, {…}, {…}]
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 40
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 40
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: (3) [{…}, {…}, {…}]
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 400
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 400
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: (3) [{…}, {…}, {…}]
StudentForm.tsx:2771 🔍 unpaidInfo: undefined amountNum: 4000
StudentForm.tsx:2778 🔍 unpaidInfo: undefined amountNum: 4000
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:1728 📦 Should Render Group Section? {paymentType: 'group', groupCount: 3, entries: 3}
StudentForm.tsx:684 👀 Should Render Dynamic Group Inputs?
StudentForm.tsx:685 ✅ paymentType: group
StudentForm.tsx:686 ✅ groupCount: 3
StudentForm.tsx:687 ✅ dynamicGroupEntries.length: 3
StudentForm.tsx:691 👀 useEffect watching dynamicGroupEntries: (3) [{…}, {…}, {…}]
