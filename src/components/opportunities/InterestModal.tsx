'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { submitInvestorEnquiry } from '@/lib/enquirySubmissions';
import type { Opportunity } from '@/lib/opportunitiesData';
import CustomSelect from './CustomSelect';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
}

export default function InterestModal({
  isOpen,
  onClose,
  opportunity,
}: InterestModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'developer' | 'investor' | 'other'>('developer');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedRef, setGeneratedRef] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) return;

    const ref = submitInvestorEnquiry({
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: userType === 'developer' ? 'Independent Developer' : userType === 'investor' ? 'Private Investor' : 'Partner',
      role: userType,
      interest: 'request_info',
      opportunityId: opportunity.id,
      message: message.trim() || `Interest expressed for ${opportunity.title} via project detail page. Preferred contact: ${preferredContact}.`,
    });

    setGeneratedRef(ref);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[22px] max-w-lg w-full p-6 md:p-8 border border-gray-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 p-1.5 rounded-full text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest block mb-1">
                Express Interest
              </span>
              <h2 className="text-[22px] font-heading font-bold text-foreground leading-tight">
                {opportunity.title}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Connect with the TRINFRA facilitation team to receive detailed project information.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Menon"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjun@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                    User Type
                  </label>
                  <CustomSelect
                    value={userType}
                    onChange={(val) => setUserType(val as 'developer' | 'investor' | 'other')}
                    options={[
                      { value: 'developer', label: 'Developer' },
                      { value: 'investor', label: 'Investor' },
                      { value: 'other', label: 'Other / Institution' },
                    ]}
                    placeholder="User Type"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                    Preferred Contact
                  </label>
                  <CustomSelect
                    value={preferredContact}
                    onChange={(val) => setPreferredContact(val as 'whatsapp' | 'phone' | 'email')}
                    options={[
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'phone', label: 'Phone Call' },
                      { value: 'email', label: 'Email' },
                    ]}
                    placeholder="Preferred Contact"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                  Message / Specific Questions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your project requirements, proposed development timeline, or specific questions..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none transition-all text-[13px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Confidential & secure</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Submit Interest</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="pt-3 border-t border-gray-100 text-center">
                <Link
                  href={`/opportunities/${opportunity.id}/enquiry`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-primary transition-colors"
                >
                  <span>Looking for custom investment or joint development?</span>
                  <span className="font-bold text-accent underline">Open Full Enquiry Page →</span>
                </Link>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-[22px] font-heading font-bold text-foreground">
                Interest Received
              </h3>
              <p className="text-[14px] text-gray-600 max-w-sm mx-auto mt-2 leading-relaxed">
                Thank you for your interest in <span className="font-semibold text-foreground">{opportunity.title}</span>. Our facilitation team will review your enquiry and contact you shortly.
              </p>
            </div>

            {generatedRef && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 max-w-xs mx-auto">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">
                  Reference Code
                </span>
                <span className="font-mono font-bold text-primary text-[14px]">
                  {generatedRef}
                </span>
              </div>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg text-[13px] hover:bg-primary-dark transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
