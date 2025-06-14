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

interface AttachedImage {
  file: File;
  preview: string;
  id: string;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ theme, isOpen, onClose, triggerRef }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'feedback' as 'bug' | 'feedback' | 'feature',
    subject: '',
    message: ''
  });
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' as 'above' | 'below', arrowLeft: '50%' });
  const [isDragOver, setIsDragOver] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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
      
      // Popup dimensions (estimated - increased for image support)
      const popupHeight = 600; // Increased from 480 for image upload area
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

  // Clean up image previews when component unmounts or closes
  useEffect(() => {
    if (!isOpen && attachedImages.length > 0) {
      // Clean up any existing image previews
      attachedImages.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
      setAttachedImages([]);
    }
  }, [isOpen]); // Remove attachedImages from dependencies to prevent infinite loop

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload: ${ALLOWED_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleImageFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: AttachedImage[] = [];
    const errors: string[] = [];

    // Check if adding these files would exceed the limit
    if (attachedImages.length + fileArray.length > MAX_IMAGES) {
      errors.push(`Maximum ${MAX_IMAGES} images allowed. You can attach ${MAX_IMAGES - attachedImages.length} more.`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateImageFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const preview = URL.createObjectURL(file);
        validFiles.push({
          file,
          preview,
          id: crypto.randomUUID()
        });
      }
    });

    if (errors.length > 0) {
      alert(`Image upload errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setAttachedImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(e.target.files);
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      ALLOWED_TYPES.includes(file.type)
    );
    
    if (files.length > 0) {
      handleImageFiles(files);
    }
  };

  const removeImage = (imageId: string) => {
    setAttachedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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

      // Convert images to base64 for email attachment
      const imageAttachments = await Promise.all(
        attachedImages.map(async (img, index) => {
          const base64 = await convertFileToBase64(img.file);
          return {
            name: `attachment_${index + 1}_${img.file.name}`,
            content: base64,
            type: img.file.type
          };
        })
      );

      const templateParams = {
        from_name: formData.name || 'Anonymous User',
        from_email: formData.email || 'not-provided@app.user',
        feedback_type: formData.feedbackType,
        subject: formData.subject || `${formData.feedbackType.charAt(0).toUpperCase() + formData.feedbackType.slice(1)} from Mango Menu Builder`,
        message: formData.message,
        app_name: 'Mango Cannabis Flower Menu Builder',
        app_version: '1.0.1',
        timestamp: new Date().toISOString(),
        to_email: EMAILJS_CONFIG.TO_EMAIL,
        // Add image information to the message
        has_attachments: attachedImages.length > 0,
        attachment_count: attachedImages.length,
        attachment_info: attachedImages.length > 0 
          ? `\n\n--- ATTACHMENTS (${attachedImages.length}) ---\n${attachedImages.map((img, i) => `${i + 1}. ${img.file.name} (${(img.file.size / 1024).toFixed(1)}KB)`).join('\n')}`
          : '',
        // Include base64 images (Note: EmailJS has size limits, so this might need adjustment based on your EmailJS plan)
        attachments: imageAttachments
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
        // Clean up images
        attachedImages.forEach(img => {
          URL.revokeObjectURL(img.preview);
        });
        setAttachedImages([]);
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
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {submitStatus === 'success' ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="text-lg font-semibold text-green-500 mb-2">Feedback Sent!</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thank you for helping us improve Mango Menu Builder. Your feedback{attachedImages.length > 0 ? ' and images' : ''} have been sent to our development team.
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

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attach Images (Optional) - Max {MAX_IMAGES} images, 5MB each
                </label>
                
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                    isDragOver
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : attachedImages.length >= MAX_IMAGES
                        ? theme === 'dark'
                          ? 'border-gray-600 bg-gray-700/50 cursor-not-allowed'
                          : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : theme === 'dark'
                          ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (attachedImages.length < MAX_IMAGES) {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={attachedImages.length >= MAX_IMAGES}
                  />
                  
                  {attachedImages.length >= MAX_IMAGES ? (
                    <div className="text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <p className="text-sm">Maximum {MAX_IMAGES} images reached</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, WebP up to 5MB each
                      </p>
                    </div>
                  )}
                </div>

                {/* Image Previews */}
                {attachedImages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Attached Images ({attachedImages.length}/{MAX_IMAGES}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {attachedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview of ${image.file.name}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b truncate">
                            {image.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      Send Feedback{attachedImages.length > 0 ? ` (${attachedImages.length} image${attachedImages.length > 1 ? 's' : ''})` : ''}
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
          <strong>Privacy:</strong> Your feedback and images go directly to our development team. We only use contact info to respond if provided.
        </div>
      </div>
    </>
  );
}; 