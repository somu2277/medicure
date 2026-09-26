const fs = require('fs');
let code = fs.readFileSync('client/src/pages/DashboardPage.jsx', 'utf8');

const regex = /\{\/\* Appointments Tab \*\/\}([\s\S]*?)\{\/\* Lab Bookings Tab \*\/\}/;

const replacement = `{/* Appointments Tab */}
        {activeTab === 'appointments' && (
          data.appointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">No appointments</h2>
              <p className="text-slate-500 mb-6">You haven't booked any doctor consultations.</p>
              <Link to="/doctors" className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg transition-colors hover:bg-primary/90">
                Find a Doctor
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.appointments.map(appt => (
                <div key={appt._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">Dr. {appt.doctorId?.userId?.name || 'Doctor'}</h3>
                    <p className="text-sm text-slate-500 mb-4">{appt.doctorId?.specialization || 'Consultation'}</p>
                    
                    {appt.confirmedDate ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-3">
                            <span className="text-xs text-emerald-700 font-bold block mb-1">CONFIRMED SCHEDULE</span>
                            <div className="flex gap-4 text-sm text-emerald-800">
                              <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(appt.confirmedDate).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock size={14}/> {appt.confirmedStartTime}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-3">
                            <span className="text-xs text-slate-500 font-bold block mb-1">REQUESTED PREFERENCES</span>
                            <div className="flex gap-4 text-sm text-slate-700">
                              <span className="flex items-center gap-1"><Calendar size={14}/> {appt.preferredDate ? new Date(appt.preferredDate).toLocaleDateString() : 'Any Date'}</span>
                              <span className="flex items-center gap-1"><Clock size={14}/> {appt.preferredTimeOfDay || 'Any Time'}</span>
                            </div>
                            <p className="text-xs text-amber-600 mt-2 font-medium">Your appointment is awaiting scheduling. Our team will contact you after checking the doctor's availability.</p>
                        </div>
                    )}
                    
                    {appt.schedulingNotes && (
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-2 border border-blue-100"><strong>Note from Admin:</strong> {appt.schedulingNotes}</p>
                    )}

                    {appt.meetingLink && appt.status.includes('Approved') && (
                        <a href={\`https://\${appt.meetingLink}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            Join Video Call
                        </a>
                    )}
                    {appt.rejectionReason && appt.status === 'Rejected' && (
                        <p className="text-sm text-red-600 mt-3 bg-red-50 p-2 rounded border border-red-100"><strong>Reason for Rejection:</strong> {appt.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between min-w-[120px]">
                    <div className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border \${getStatusColor(appt.status)}\`}>
                      {getStatusIcon(appt.status)}
                      {appt.status}
                    </div>
                    <span className="text-sm font-bold text-slate-800 mt-4">₹{appt.feeSnapshot}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Lab Bookings Tab */}`;

code = code.replace(regex, replacement);

fs.writeFileSync('client/src/pages/DashboardPage.jsx', code);
