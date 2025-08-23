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








NOW AB YE BHI WORK KAR RAHA HAI AB MUJHE YE SAMAGH NAHI AA RAHA KI AAGE KAISE DESIGN KARU AND USKO
  IMPLEMENT KARU MAIN APNI CONDITIONS BATATI HU JAB IS FORM MAIN HOSTELER HAI TO USME MAINE YES/NO LIKHA HAI AGAR KISI STUDENT KA
  NO HAI TO KOI PROBLEM NAHI HAI BUT AGAR KISI STUDENT KA YES HAI TO ISME KAI CONDITIONS HO SAKTI HAI LIKE 
  JAB HOSTEL YES HOGA TAB YE FIELD SAMNE SHOW HO 
  HOSTEL REGISTERATION STARTING DATE,END DATE, HOSTEL RENT (FEES), RECIEPT OR UTR/UPI, MESS FEE, RECIEPT OR UTR/UPI 
  NOW CONDITION
  1. SINGLE PAYMENT KA STUDENT -> LIKE JIS STUDENT KO HOSTEL LENA HAI TO USNE APNE COUSE FEE WALI RECIEPT OR URT/UPI ID YA BOTH MEANS KUCH CASH AND 
  KUCH ONLINE PAYMENT MAIN HI APNI HOSTEL RENT JISKA AMOUNT ALAG HOGA BHI ADD KARWA DIYA TO UNKA RECIEPT NO. OR UTR/UPI ID YA BOTH SAME HO 
  GAYA AND MESS FEE BHI
  2. SINGLE PAYMENT KA STUDENT  -> USNE ABHI PAYMENT NAHI KI KUCH DIN BAAD KARE GA TO YAHA UTR/UPI OR RECIEPT NO. DONO CHANGE HO
  GAYE BUT YAHA BHI CONDITION HO GAYI KI AND AND MESS FEE BHI
      1. AKELE RECIEPT/UTR/UPI HAI
      2. USKI HOTEL RENT KI SLIP GROUP MAIN KISSI AUR STUDENT KE SAATH CUT GAI
  3. GROUP PAYMENT KA STUDENT -> USNE USSI WAQT PAYMENT KAR DI TO SAME UTR/UPI ID BHI HO SAKTI HAI AND MESS FEE BHI
  4. GROUP PAYMENT KA STUDENT  -> USNE ABHI PAYMENT NAHI KI KUCH DIN BAAD KARE GA TO YAHA UTR/UPI OR RECIEPT NO. DONO CHANGE HO
  GAYE BUT YAHA BHI CONDITION HO GAYI KI AND MESS FEE BHI
      1. AKELE RECIEPT/UTR/UPI HAI
      2. USKI HOTEL RENT KI SLIP GROUP MAIN KISSI AUR STUDENT KE SAATH CUT GAI
  
  AND YE MERI STUDENTS ADD KARNE KA FORM HAI JISKE ACCORDING HAME YAHA STUDENT KA HOSTEL AND MESS KARNA HAI PLEASE
  GIVE ME SUGGESSION JISSE MERA STUDENT INFO MAIN NA PROBLEM AND NA KISI KI PAYMENT MAIN DUBLICACY HO
  🏨 Hostel Management Design Strategy
Phase 1: Basic Hostel Fields (Immediate Implementation)

When Hostler = "Yes":
├── Hostel Registration Start Date
├── Hostel Registration End Date  
├── Hostel Rent Amount
├── Mess Fee Amount
└── Payment Integration (with existing course payment)
Phase 2: Payment Integration Logic

Hostel Payment Options:
├── Same Receipt/UTR as Course Fee (Combined Payment)
├── Separate Receipt/UTR (Different Payment)
└── Group Hostel Payment (Multiple students sharing)
Phase 3: Advanced Scenarios

Complex Cases:
├── Individual Hostel + Group Course
├── Group Hostel + Individual Course  
├── Mixed Payment Methods
└── Later Payment Updates
🎯 Recommended Implementation Approach:
Step 1: Start Simple
पहले basic hostel fields add करें जब hostler = "Yes":

Hostel dates और amounts
Simple payment integration
Step 2: Payment Logic
Existing payment system को extend करें:

Course + Hostel combined payments
Separate hostel payment tracking
Step 3: Group Scenarios
Group payment logic को hostel के लिए भी implement करें

💡 My Suggestion:
क्या आप चाहेंगे कि मैं पहले Step 1 implement करूं?

मैं आपके existing form में hostel fields add कर सकता हूं जो:

✅ Hostler = "Yes" पर show हों
✅ Basic validation के साथ
✅ Existing payment system के साथ integrate हों
✅ Future expansion के लिए ready structure हो
या आप चाहते हैं कि मैं पूरा detailed design document बनाऊं पहले?

आप बताएं कि कौन सा approach prefer करेंगे:

Option A: Step-by-step implementation (पहले basic, फिर advanced)
Option B: Complete design planning पहले, implementation बाद में


  1. New Hostel Fields (Show only when Hostler = "Yes")

✅ Hostel Registration Start Date
✅ Hostel Registration End Date  
✅ Hostel Rent Amount
✅ Mess Fee Amount
✅ Payment Method Selection (Combined/Separate)
2. Payment Integration Options

🔄 Combined Payment: Same receipt/UTR as course fee
🔄 Separate Payment: Different receipt/UTR for hostel & mess
3. Smart Validation

✅ Required field validation for hostel students
✅ Date validation (end date > start date)
✅ Payment details validation for separate payments
✅ Numeric validation for amounts
4. Data Structure

hostelInfo?: {
  registrationStartDate: string;
  registrationEndDate: string;
  hostelRent: number;
  messFee: number;
  paymentMethod: 'combined' | 'separate';
  hostelPaymentDetails?: { ... };
  messPaymentDetails?: { ... };
}
🎯 How It Works:
Scenario 1: Hostler = "No"

Normal form → No hostel fields → Simple course payment
Scenario 2: Hostler = "Yes" + Combined Payment

Hostel fields show → Combined payment selected → Same UTR/Receipt as course
Scenario 3: Hostler = "Yes" + Separate Payment

Hostel fields show → Separate payment selected → Different UTR/Receipt fields
✅ Ready for Step 2!
अब आप test कर सकते हैं:

Hostler = "No" → Normal form
Hostler = "Yes" → Hostel section appears
Combined Payment → Uses course payment details
Separate Payment → Shows separate payment fields
Next Step 2 में हम करेंगे:

Payment calculation integration
Group hostel payments
Advanced scenarios
