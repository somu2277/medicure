const fs = require('fs');
let code = fs.readFileSync('client/src/pages/DoctorProfilePage.jsx', 'utf8');

code = code.replace(
    /<div className="flex justify-between"><span className="font-medium text-slate-800">Date:<\/span> \{new Date\(selectedDate\)\.toDateString\(\)\}<\/div>/,
    '<div className="flex justify-between"><span className="font-medium text-slate-800">Date:</span> {preferredDate ? new Date(preferredDate).toDateString() : \'Any Date\'}</div>'
);

code = code.replace(
    /<div className="flex justify-between"><span className="font-medium text-slate-800">Time:<\/span> \{selectedTime\}<\/div>/,
    '<div className="flex justify-between"><span className="font-medium text-slate-800">Time:</span> {preferredTimeOfDay || \'Any Time\'}</div>'
);

code = code.replace(
    /Your appointment request for <strong>\{new Date\(selectedDate\)\.toDateString\(\)\} at \{selectedTime\}<\/strong> has been successfully placed\. It is currently awaiting Admin Approval\./,
    'Your appointment request has been successfully placed. Our team will review your preferences and coordinate with the doctor to confirm the schedule.'
);

fs.writeFileSync('client/src/pages/DoctorProfilePage.jsx', code);
