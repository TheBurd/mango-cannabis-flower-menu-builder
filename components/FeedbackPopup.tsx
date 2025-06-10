import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Theme } from '../types';
import { EMAILJS_CONFIG } from '../constants';

interface FeedbackPopupProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ theme, isOpen, onClose, triggerRef }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'feedback' as 'bug' | 'feedback' | 'feature',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' as 'above' | 'below', arrowLeft: '50%' });
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !popupRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current!;
      const popup = popupRef.current!;
      const triggerRect = trigger.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate space above and below trigger
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      
      // Popup dimensions (estimated)
      const popupHeight = 480; // Approximate height of the form
      const popupWidth = 500; // Fixed width
      
      // Determine vertical placement
      let placement: 'above' | 'below' = 'below';
      let top = triggerRect.bottom + 8; // 8px gap below trigger
      
      if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
        placement = 'above';
        top = triggerRect.top - popupHeight - 8; // 8px gap above trigger
      } else if (spaceBelow < popupHeight && spaceAbove < popupHeight) {
        // Not enough space either way, position to fit best
        if (spaceAbove > spaceBelow) {
          placement = 'above';
          top = Math.max(8, triggerRect.top - popupHeight - 8);
        } else {
          placement = 'below';
          top = triggerRect.bottom + 8;
        }
      }
      
      // Calculate horizontal position (center on trigger, but keep in bounds)
      let left = triggerRect.left + (triggerRect.width / 2) - (popupWidth / 2);
      
      // Calculate where the arrow should point (center of trigger button)
      const buttonCenterX = triggerRect.left + (triggerRect.width / 2);
      
      // Adjust horizontal position to stay in viewport
      if (left < 8) {
        left = 8; // 8px margin from left edge
      } else if (left + popupWidth > viewportWidth - 8) {
        left = viewportWidth - popupWidth - 8; // 8px margin from right edge
      }
      
      // Calculate arrow position relative to the popup after boundary adjustments
      const arrowLeft = Math.max(16, Math.min(popupWidth - 16, buttonCenterX - left));
      const arrowLeftPercent = `${(arrowLeft / popupWidth) * 100}%`;
      
      // Adjust vertical position to stay in viewport
      if (top < 8) {
        top = 8; // 8px margin from top
      } else if (top + popupHeight > viewportHeight - 8) {
        top = Math.max(8, viewportHeight - popupHeight - 8); // 8px margin from bottom
      }
      
      setPosition({ top, left, placement, arrowLeft: arrowLeftPercent });
    };

    // Update position immediately and on window resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, triggerRef]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Check if EmailJS is configured
      if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' || 
          EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
          EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        throw new Error('EmailJS not configured. Please set up your EmailJS credentials in constants.ts');
      }

      const templateParams = {
        from_name: formData.name || 'Anonymous User',
        from_email: formData.email || 'not-provided@app.user',
        feedback_type: formData.feedbackType,
        subject: formData.subject || `${formData.feedbackType.charAt(0).toUpperCase() + formData.feedbackType.slice(1)} from Mango Menu Builder`,
        message: formData.message,
        app_name: 'Mango Cannabis Flower Menu Builder',
        app_version: '1.0.0',
        timestamp: new Date().toISOString(),
        to_email: EMAILJS_CONFIG.TO_EMAIL
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        // Reset form after closing
        setFormData({
          name: '',
          email: '',
          feedbackType: 'feedback',
          subject: '',
          message: ''
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to send feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '💡';
      default: return '💬';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" />
      
      {/* Popup */}
      <div
        ref={popupRef}
        className={`fixed z-50 w-[500px] max-w-[calc(100vw-16px)] rounded-lg shadow-2xl border ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-100 border-gray-600' 
            : 'bg-white text-gray-900 border-gray-300'
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Arrow pointing to trigger */}
        <div
          className={`absolute w-3 h-3 transform rotate-45 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          } ${
            position.placement === 'above' 
              ? 'bottom-[-7px] border-b border-r' 
              : 'top-[-7px] border-t border-l'
          }`}
          style={{
            left: position.arrowLeft,
            marginLeft: '-6px',
          }}
        />

        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold text-orange-500 flex items-center gap-2">
            <span>📧</span>
            Leave Feedback
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            aria-label="Close feedback"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {submitStatus === 'success' ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="text-lg font-semibold text-green-500 mb-2">Feedback Sent!</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thank you for helping us improve Mango Menu Builder. Your feedback has been sent to our development team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-orange-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                    } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-orange-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                    } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="feedbackType" className="block text-sm font-medium mb-1">
                  Feedback Type
                </label>
                <select
                  id="feedbackType"
                  name="feedbackType"
                  value={formData.feedbackType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm rounded border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-orange-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                >
                  <option value="feedback">{getFeedbackTypeIcon('feedback')} General Feedback</option>
                  <option value="bug">{getFeedbackTypeIcon('bug')} Bug Report</option>
                  <option value="feature">{getFeedbackTypeIcon('feature')} Feature Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm rounded border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-orange-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="Brief summary of your feedback"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`w-full px-3 py-2 text-sm rounded border transition-colors resize-vertical ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-orange-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                  } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  placeholder="Please describe your feedback, bug report, or feature request in detail..."
                />
              </div>

              {submitStatus === 'error' && (
                <div className="p-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Failed to send feedback. Please try again or contact <strong>brad@mangocannabis.com</strong> directly.
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    If this problem persists, the email service may not be configured yet.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 text-sm rounded font-medium transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-600 hover:bg-gray-700 text-gray-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white px-4 py-2 text-sm rounded font-medium transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>📧</span>
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer note */}
        <div className={`px-4 py-2 border-t text-xs ${
          theme === 'dark' 
            ? 'border-gray-700 bg-gray-900 text-gray-400' 
            : 'border-gray-200 bg-gray-50 text-gray-600'
        }`}>
          <strong>Privacy:</strong> Your feedback goes directly to our development team. We only use contact info to respond if provided.
        </div>
      </div>
    </>
  );
}; 