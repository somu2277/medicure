const fs = require('fs');
let code = fs.readFileSync('client/src/pages/DoctorProfilePage.jsx', 'utf8');

// Replace state
code = code.replace(/const \[selectedDate, setSelectedDate\] = useState\(''\);/, 'const [preferredDate, setPreferredDate] = useState(\'\');\n    const [preferredTimeOfDay, setPreferredTimeOfDay] = useState(\'Any Time\');\n    const [alternativeDate, setAlternativeDate] = useState(\'\');');
code = code.replace(/const \[selectedTime, setSelectedTime\] = useState\(''\);/, '');

// Replace selectedDate default logic
code = code.replace(/setSelectedDate\(tomorrow\.toISOString\(\)\.split\('T'\)\[0\]\);/, 'setPreferredDate(tomorrow.toISOString().split(\'T\')[0]);');

// Remove getAvailableSlots
code = code.replace(/const getAvailableSlots = \(\) => \{[\s\S]*?return slots\.length > 0 \? slots : \['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'\]; \/\/ fallback\n    \};/, '');

// Fix handleNextStep for step 2
code = code.replace(/if \(step === 2 && !selectedTime\) return alert\("Please select a time slot\."\);/, '');

// Fix handlePayment payload
let paymentRegex = /date: selectedDate,\s+startTime: selectedTime,\s+endTime: selectedTime, \/\/ Simplified/;
code = code.replace(paymentRegex, 'preferredDate: preferredDate || null,\n                preferredTimeOfDay,\n                alternativeDate: alternativeDate || null,');

// Replace Paid - Awaiting Admin Approval
code = code.replace(/status: 'Paid - Awaiting Admin Approval'/, 'status: \'Paid - Awaiting Admin Review\'');

// Step 2 JSX replacement
const step2Regex = /\{\/\* Step 2: Date & Time \*\/\}([\s\S]*?)(?=\{\/\* Step 3: Patient Details \*\/)/;

const step2Replacement = `{/* Step 2: Date & Time Preferences */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Appointment</h2>
                                <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    Your selected date and time are preferences only. Our MediCare team will coordinate with the doctor and confirm your appointment after checking availability.
                                </p>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        value={preferredDate} 
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full sm:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time of Day</label>
                                    <select 
                                        value={preferredTimeOfDay} 
                                        onChange={(e) => setPreferredTimeOfDay(e.target.value)}
                                        className="w-full sm:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Any Time">Any Time</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Afternoon">Afternoon</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Alternative Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        value={alternativeDate} 
                                        onChange={(e) => setAlternativeDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full sm:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button onClick={handleBack} className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">Back</button>
                                    <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 ml-auto shadow-sm shadow-blue-200">Next Step</button>
                                </div>
                            </div>
                        )}

                        `;

code = code.replace(step2Regex, step2Replacement);

fs.writeFileSync('client/src/pages/DoctorProfilePage.jsx', code);
