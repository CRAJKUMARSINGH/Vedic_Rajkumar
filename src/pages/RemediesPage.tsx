/**
 * Remedies Page - Comprehensive Remedy System UI
 * Week 15: Remedies Database - Thursday Implementation
 * Complete user interface for remedies system with search and filters
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Star, Heart, Book, Gift } from 'lucide-react';
import { getComprehensiveRemedies, createRemedyPlan } from '../services/remediesService';
import { getMantrasByPlanet, getMantrasByType } from '../services/mantraService';
import { getCharityByPlanet, getCharityByType } from '../services/charityService';

interface RemediesPageProps {
  birthChart?: {
    weakPlanets: string[];
    doshas: string[];
    planetaryStrengths: Record<string, number>;
  };
}

export const RemediesPage: React.FC<RemediesPageProps> = ({ birthChart }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mantras' | 'charity' | 'fasting' | 'rituals'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanet, setSelectedPlanet] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCost, setSelectedCost] = useState<string>('all');
  const [remedies, setRemedies] = useState<any>(null);
  const [personalizedPlan, setPersonalizedPlan] = useState<any>(null);

  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  
  useEffect(() => {
    if (birthChart) {
      const comprehensiveRemedies = getComprehensiveRemedies(birthChart, {
        budget: 'medium',
        difficulty: 'medium',
        timeAvailable: 'moderate'
      });
      setRemedies(comprehensiveRemedies);

      const plan = createRemedyPlan('user', birthChart);
      setPersonalizedPlan(plan);
    }
  }, [birthChart]);

  const TabButton: React.FC<{ 
    tab: string; 
    icon: React.ReactNode; 
    label: string; 
    count?: number 
  }> = ({ tab, icon, label, count }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count && (
        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  const RemedyCard: React.FC<{ remedy: any; type: string }> = ({ remedy, type }) => (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {type === 'mantra' && <Book className="h-6 w-6 text-blue-600" />}
          {type === 'charity' && <Gift className="h-6 w-6 text-green-600" />}
          {type === 'fasting' && <Heart className="h-6 w-6 text-red-600" />}
          <div>
            <h3 className="text-lg font-bold">
              {type === 'mantra' ? remedy.sanskrit : 
               type === 'charity' ? `${remedy.planet} Charity` :
               remedy.title?.en || remedy.planet}
            </h3>
            <p className="text-sm text-muted-foreground">
              Planet: {remedy.planet} • Duration: {remedy.duration}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            remedy.difficulty === 'beginner' || remedy.difficulty === 'easy' 
              ? 'bg-green-100 text-green-700'
              : remedy.difficulty === 'intermediate' || remedy.difficulty === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {remedy.difficulty || 'Medium'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            remedy.cost === 'free' ? 'bg-blue-100 text-blue-700' :
            remedy.cost === 'low' ? 'bg-green-100 text-green-700' :
            remedy.cost === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {remedy.cost || 'Free'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {type === 'mantra' && (
          <>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pronunciation:</p>
              <p className="text-sm bg-muted/30 p-2 rounded font-mono">
                {remedy.pronunciation}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Meaning:</p>
              <p className="text-sm">{remedy.meaning?.en}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Repetitions:</p>
              <div className="flex gap-2">
                {remedy.repetitions?.map((count: number, index: number) => (
                  <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    {count}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'charity' && (
          <>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Items to Donate:</p>
              <div className="flex flex-wrap gap-1">
                {remedy.items?.map((item: string, index: number) => (
                  <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Suggested Amount:</p>
              <p className="text-sm">{remedy.amounts?.medium}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Best Days:</p>
              <div className="flex gap-1">
                {remedy.timing?.bestDays?.map((day: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Benefits:</p>
          <ul className="text-sm space-y-1">
            {remedy.benefits?.en?.slice(0, 3).map((benefit: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <Star className="h-3 w-3 text-yellow-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
          Add to My Plan
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Vedic Remedies Database</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive remedy system for planetary healing and spiritual growth
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search remedies, mantras, or benefits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedPlanet}
                onChange={(e) => setSelectedPlanet(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Planets</option>
                {planets.map(planet => (
                  <option key={planet} value={planet}>{planet}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Costs</option>
                <option value="free">Free</option>
                <option value="low">Low Cost</option>
                <option value="medium">Medium Cost</option>
                <option value="high">High Cost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton 
            tab="all" 
            icon={<Filter className="h-4 w-4" />} 
            label="All Remedies" 
            count={remedies ? (remedies.mantras?.length || 0) + (remedies.charity?.length || 0) + (remedies.fasting?.length || 0) : 0}
          />
          <TabButton 
            tab="mantras" 
            icon={<Book className="h-4 w-4" />} 
            label="Mantras" 
            count={remedies?.mantras?.length || 0}
          />
          <TabButton 
            tab="charity" 
            icon={<Gift className="h-4 w-4" />} 
            label="Charity" 
            count={remedies?.charity?.length || 0}
          />
          <TabButton 
            tab="fasting" 
            icon={<Heart className="h-4 w-4" />} 
            label="Fasting" 
            count={remedies?.fasting?.length || 0}
          />
          <TabButton 
            tab="rituals" 
            icon={<Calendar className="h-4 w-4" />} 
            label="Rituals" 
            count={0}
          />
        </div>

        {/* Personalized Plan */}
        {personalizedPlan && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Your Personalized Remedy Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Daily Practices</h3>
                <p className="text-sm text-muted-foreground">
                  {personalizedPlan.dailyPractices?.length || 0} recommended practices
                </p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Weekly Practices</h3>
                <p className="text-sm text-muted-foreground">
                  {personalizedPlan.weeklyPractices?.length || 0} recommended practices
                </p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Monthly Practices</h3>
                <p className="text-sm text-muted-foreground">
                  {personalizedPlan.monthlyPractices?.length || 0} recommended practices
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Remedies Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeTab === 'all' && remedies && (
            <>
              {remedies.mantras?.map((mantra: any, index: number) => (
                <RemedyCard key={`mantra-${index}`} remedy={mantra} type="mantra" />
              ))}
              {remedies.charity?.map((charity: any, index: number) => (
                <RemedyCard key={`charity-${index}`} remedy={charity} type="charity" />
              ))}
              {remedies.fasting?.map((fasting: any, index: number) => (
                <RemedyCard key={`fasting-${index}`} remedy={fasting} type="fasting" />
              ))}
            </>
          )}

          {activeTab === 'mantras' && remedies?.mantras?.map((mantra: any, index: number) => (
            <RemedyCard key={`mantra-${index}`} remedy={mantra} type="mantra" />
          ))}

          {activeTab === 'charity' && remedies?.charity?.map((charity: any, index: number) => (
            <RemedyCard key={`charity-${index}`} remedy={charity} type="charity" />
          ))}

          {activeTab === 'fasting' && remedies?.fasting?.map((fasting: any, index: number) => (
            <RemedyCard key={`fasting-${index}`} remedy={fasting} type="fasting" />
          ))}
        </div>

        {/* Empty State */}
        {(!remedies || (
          (activeTab === 'all' && (!remedies.mantras?.length && !remedies.charity?.length && !remedies.fasting?.length)) ||
          (activeTab === 'mantras' && !remedies.mantras?.length) ||
          (activeTab === 'charity' && !remedies.charity?.length) ||
          (activeTab === 'fasting' && !remedies.fasting?.length)
        )) && (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No remedies found</h3>
            <p className="text-muted-foreground">
              {!birthChart 
                ? 'Please provide your birth chart details to get personalized remedy recommendations.'
                : 'Try adjusting your search criteria or filters to find more remedies.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemediesPage;