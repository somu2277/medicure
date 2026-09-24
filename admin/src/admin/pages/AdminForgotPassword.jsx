import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Activity } from 'lucide-react';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally this would call api.post('/auth/forgot-password', { email })
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            {submitted 
              ? "Check your email for reset instructions." 
              : "Enter your admin email to receive a reset link."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="admin@medicare.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium text-center border border-emerald-100 mb-6">
            A password reset link has been sent to {email} if it exists in our system.
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/admin/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
