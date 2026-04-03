/**
 * Feature Request Portal Component
 * Week 28 - Monday Implementation
 * Community-driven feature voting system
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { feedbackService, type FeatureRequest, type FeedbackCategory } from '@/services/feedbackService';

interface FeatureRequestPortalProps {
  language?: 'en' | 'hi';
}

export const FeatureRequestPortal: React.FC<FeatureRequestPortalProps> = ({ language = 'en' }) => {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('features');
  const [userName, setUserName] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  useEffect(() => {
    loadRequests();
  }, [sortBy]);

  const loadRequests = () => {
    let reqs = feedbackService.getFeatureRequests();
    if (sortBy === 'votes') {
      reqs = reqs.sort((a, b) => b.votes - a.votes);
    } else {
      reqs = reqs.sort((a, b) => b.timestamp - a.timestamp);
    }
    setRequests(reqs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackService.submitFeatureRequest(title, description, category, userName || 'Anonymous');
    setShowForm(false);
    setTitle('');
    setDescription('');
    setUserName('');
    loadRequests();
  };

  const handleVote = (requestId: string) => {
    const success = feedbackService.voteFeatureRequest(requestId);
    if (success) {
      loadRequests();
    }
  };

  const t = {
    title: language === 'hi' ? '🚀 फीचर अनुरोध पोर्टल' : '🚀 Feature Request Portal',
    subtitle: language === 'hi' 
      ? 'आप क्या देखना चाहते हैं? वोट करें या नया अनुरोध सबमिट करें!' 
      : 'What would you like to see? Vote or submit new requests!',
    newRequest: language === 'hi' ? '+ नया अनुरोध' : '+ New Request',
    sortVotes: language === 'hi' ? 'वोट्स से' : 'By Votes',
    sortRecent: language === 'hi' ? 'नवीनतम' : 'Recent',
    votes: language === 'hi' ? 'वोट्स' : 'Votes',
    vote: language === 'hi' ? 'वोट करें' : 'Vote',
    voted: language === 'hi' ? 'वोट किया' : 'Voted',
    submit: language === 'hi' ? 'सबमिट करें' : 'Submit',
    cancel: language === 'hi' ? 'रद्द करें' : 'Cancel'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setSortBy('votes')}
              variant={sortBy === 'votes' ? 'default' : 'outline'}
              size="sm"
            >
              {t.sortVotes}
            </Button>
            <Button
              onClick={() => setSortBy('recent')}
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
            >
              {t.sortRecent}
            </Button>
          </div>
          <Button onClick={() => setShowForm(true)}>{t.newRequest}</Button>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {requests.map(req => (
            <Card key={req.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {/* Vote Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleVote(req.id)}
                    disabled={localStorage.getItem(`voted_${req.id}`) !== null}
                    className={`px-3 py-2 rounded-lg font-bold transition-all ${
                      localStorage.getItem(`voted_${req.id}`)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    ▲
                  </button>
                  <span className="text-lg font-bold text-gray-700 mt-1">{req.votes}</span>
                  <span className="text-xs text-gray-500">{t.votes}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{req.title}</h3>
                    <Badge className={
                      req.status === 'completed' ? 'bg-green-100 text-green-700' :
                      req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{req.description}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>📁 {req.category}</span>
                    <span>👤 {req.submittedBy}</span>
                    <span>📅 {new Date(req.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* New Request Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-6 bg-white">
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-4">Submit Feature Request</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">{t.submit}</Button>
                  <Button type="button" onClick={() => setShowForm(false)} variant="outline">
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureRequestPortal;
