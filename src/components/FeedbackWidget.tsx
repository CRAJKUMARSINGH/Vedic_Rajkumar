/**
 * Feedback Widget Component
 * Week 28 - Monday Implementation
 * Floating feedback button with modal form
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { feedbackService, type FeedbackType, type FeedbackCategory } from '@/services/feedbackService';

interface FeedbackWidgetProps {
  language?: 'en' | 'hi';
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ language = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('general');
  const [category, setCategory] = useState<FeedbackCategory>('other');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const t = {
    button: language === 'hi' ? '💬 फीडबैक' : '💬 Feedback',
    title: language === 'hi' ? 'अपना फीडबैक साझा करें' : 'Share Your Feedback',
    typeLabel: language === 'hi' ? 'फीडबैक प्रकार' : 'Feedback Type',
    categoryLabel: language === 'hi' ? 'श्रेणी' : 'Category',
    titleLabel: language === 'hi' ? 'शीर्षक' : 'Title',
    descLabel: language === 'hi' ? 'विवरण' : 'Description',
    ratingLabel: language === 'hi' ? 'रेटिंग (वैकल्पिक)' : 'Rating (Optional)',
    emailLabel: language === 'hi' ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)',
    submit: language === 'hi' ? 'सबमिट करें' : 'Submit',
    cancel: language === 'hi' ? 'रद्द करें' : 'Cancel',
    thanks: language === 'hi' ? 'धन्यवाद!' : 'Thank You!',
    thanksMsg: language === 'hi' 
      ? 'आपका फीडबैक सफलतापूर्वक सबमिट हो गया है।' 
      : 'Your feedback has been submitted successfully.',
    close: language === 'hi' ? 'बंद करें' : 'Close'
  };

  const types: Record<FeedbackType, string> = {
    general: language === 'hi' ? 'सामान्य' : 'General',
    bug: language === 'hi' ? 'बग रिपोर्ट' : 'Bug Report',
    feature_request: language === 'hi' ? 'फीचर अनुरोध' : 'Feature Request',
    improvement: language === 'hi' ? 'सुधार' : 'Improvement',
    complaint: language === 'hi' ? 'शिकायत' : 'Complaint',
    praise: language === 'hi' ? 'प्रशंसा' : 'Praise'
  };

  const categories: Record<FeedbackCategory, string> = {
    ui_ux: language === 'hi' ? 'UI/UX' : 'UI/UX',
    accuracy: language === 'hi' ? 'सटीकता' : 'Accuracy',
    performance: language === 'hi' ? 'प्रदर्शन' : 'Performance',
    features: language === 'hi' ? 'फीचर्स' : 'Features',
    content: language === 'hi' ? 'सामग्री' : 'Content',
    other: language === 'hi' ? 'अन्य' : 'Other'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    feedbackService.submitFeedback({
      type,
      category,
      title,
      description,
      rating: rating > 0 ? rating : undefined,
      userEmail: email || undefined,
      priority: type === 'bug' ? 'high' : 'medium',
      page: window.location.pathname
    });

    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setRating(0);
      setEmail('');
    }, 3000);
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        {t.button}
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white/95 backdrop-blur-lg">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">{t.thanks}</h2>
                <p className="text-gray-600 mb-6">{t.thanksMsg}</p>
                <Button onClick={() => setIsOpen(false)}>{t.close}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t.title}
                </h2>

                {/* Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t.typeLabel}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(types) as FeedbackType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all ${
                          type === t
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {types[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t.categoryLabel}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {(Object.keys(categories) as FeedbackCategory[]).map(c => (
                      <option key={c} value={c}>{categories[c]}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t.titleLabel}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={language === 'hi' ? 'संक्षिप्त शीर्षक...' : 'Brief title...'}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t.descLabel}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={language === 'hi' ? 'विस्तृत विवरण...' : 'Detailed description...'}
                  />
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t.ratingLabel}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">{t.emailLabel}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={language === 'hi' ? 'your@email.com' : 'your@email.com'}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {t.submit}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
