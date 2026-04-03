// Week 13: Gemstone Recommendation Card Component
// AstroSage Feature Integration Part 3 - Monday Implementation

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  getGemstoneRecommendation, 
  calculateGemstonePrice,
  validateGemstoneOrder,
  type GemstoneRecommendation,
  type GemstoneOrder,
  type Gemstone
} from '@/services/gemstoneService';
import { type SupportedLanguage } from '@/services/multiLanguageService';

interface GemstoneRecommendationCardProps {
  ascendantRashi: number;
  planetaryPositions: any[];
  birthDate: string;
  lang: SupportedLanguage;
}

const GemstoneRecommendationCard: React.FC<GemstoneRecommendationCardProps> = ({
  ascendantRashi,
  planetaryPositions,
  birthDate,
  lang
}) => {
  const [selectedGemstone, setSelectedGemstone] = useState<Gemstone | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [order, setOrder] = useState<Partial<GemstoneOrder>>({
    quality: 'aa',
    carats: 3,
    certification: true,
    energization: true,
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  });

  const isHi = lang === 'hi';
  const recommendation = getGemstoneRecommendation(ascendantRashi, planetaryPositions, birthDate);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePurchase = (gemstone: Gemstone) => {
    setSelectedGemstone(gemstone);
    setOrder(prev => ({ ...prev, gemstoneId: gemstone.id }));
    setShowPurchase(true);
  };

  const calculatePrice = () => {
    if (!selectedGemstone || !order.quality || !order.carats) return 0;
    return calculateGemstonePrice(
      selectedGemstone,
      order.quality as 'aaa' | 'aa' | 'a',
      order.carats,
      order.certification,
      order.energization
    );
  };

  const renderGemstoneCard = (gemstone: Gemstone, isPrimary: boolean = false) => (
    <Card key={gemstone.id} className={`${isPrimary ? 'border-2 border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
            💎 {isHi ? gemstone.nameHi : gemstone.name}
            {isPrimary && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {isHi ? 'मुख्य' : 'Primary'}
              </Badge>
            )}
          </CardTitle>
          <Badge className={getUrgencyColor(recommendation.urgency)}>
            {isHi ? 
              (recommendation.urgency === 'high' ? 'अत्यावश्यक' : 
               recommendation.urgency === 'medium' ? 'आवश्यक' : 'वैकल्पिक') :
              recommendation.urgency.toUpperCase()
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'ग्रह:' : 'Planet:'}
            </span>
            <span className="ml-2">{gemstone.planet}</span>
          </div>
          <div>
            <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'रंग:' : 'Color:'}
            </span>
            <span className="ml-2">{gemstone.color}</span>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h4 className={`font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'लाभ:' : 'Benefits:'}
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {(isHi ? gemstone.benefits.hi : gemstone.benefits.en).map((benefit, idx) => (
              <li key={idx} className={isHi ? 'font-hindi' : ''}>{benefit}</li>
            ))}
          </ul>
        </div>

        {/* Wearing Instructions */}
        <div className="bg-muted p-3 rounded-lg">
          <h4 className={`font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'धारण विधि:' : 'Wearing Instructions:'}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={isHi ? 'font-hindi' : ''}>
              <strong>{isHi ? 'अंगुली:' : 'Finger:'}</strong> {isHi ? gemstone.wearingInstructions.fingerHi : gemstone.wearingInstructions.finger}
            </div>
            <div className={isHi ? 'font-hindi' : ''}>
              <strong>{isHi ? 'दिन:' : 'Day:'}</strong> {isHi ? gemstone.wearingInstructions.dayHi : gemstone.wearingInstructions.day}
            </div>
            <div className={isHi ? 'font-hindi' : ''}>
              <strong>{isHi ? 'समय:' : 'Time:'}</strong> {isHi ? gemstone.wearingInstructions.timeHi : gemstone.wearingInstructions.time}
            </div>
            <div className={isHi ? 'font-hindi' : ''}>
              <strong>{isHi ? 'धातु:' : 'Metal:'}</strong> {isHi ? gemstone.wearingInstructions.metalHi : gemstone.wearingInstructions.metal}
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className={`font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'मूल्य सीमा (प्रति कैरेट):' : 'Price Range (per carat):'}
          </h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'मानक' : 'Standard'}
              </div>
              <div>₹{gemstone.price.low.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'उत्तम' : 'Premium'}
              </div>
              <div>₹{gemstone.price.medium.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'श्रेष्ठ' : 'Luxury'}
              </div>
              <div>₹{gemstone.price.high.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <Button 
          onClick={() => handlePurchase(gemstone)}
          className="w-full"
          variant={isPrimary ? "default" : "outline"}
        >
          <span className={isHi ? 'font-hindi' : ''}>
            {isHi ? '🛒 खरीदारी करें' : '🛒 Purchase Now'}
          </span>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={`text-xl ${isHi ? 'font-hindi' : ''}`}>
          💎 {isHi ? 'रत्न सिफारिश' : 'Gemstone Recommendation'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isHi ? 'font-hindi' : ''}>
            {isHi ? 'उपयुक्तता:' : 'Suitability:'} {recommendation.suitability}%
          </Badge>
          <Badge className={getUrgencyColor(recommendation.urgency)}>
            {isHi ? 
              (recommendation.urgency === 'high' ? 'अत्यावश्यक' : 
               recommendation.urgency === 'medium' ? 'आवश्यक' : 'वैकल्पिक') :
              recommendation.urgency.toUpperCase()
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Recommendation Reason */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
            💡 {isHi ? recommendation.reason.hi : recommendation.reason.en}
          </p>
        </div>

        <Tabs defaultValue="recommendation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendation" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'सिफारिश' : 'Recommendation'}
            </TabsTrigger>
            <TabsTrigger value="purchase" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'खरीदारी' : 'Purchase'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendation" className="space-y-6">
            {/* Primary Gemstone */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'मुख्य रत्न' : 'Primary Gemstone'}
              </h3>
              {renderGemstoneCard(recommendation.primary, true)}
            </div>

            {/* Substitute Gemstones */}
            {recommendation.substitutes.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'वैकल्पिक रत्न (उपरत्न)' : 'Substitute Gemstones (Upratna)'}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendation.substitutes.map(gemstone => renderGemstoneCard(gemstone))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchase" className="space-y-4">
            {showPurchase && selectedGemstone ? (
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'खरीदारी विवरण' : 'Purchase Details'}
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className={isHi ? 'font-hindi' : ''}>
                      {isHi ? 'गुणवत्ता' : 'Quality'}
                    </Label>
                    <Select 
                      value={order.quality} 
                      onValueChange={(value) => setOrder(prev => ({ ...prev, quality: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aaa">AAA - {selectedGemstone.quality.aaa}</SelectItem>
                        <SelectItem value="aa">AA - {selectedGemstone.quality.aa}</SelectItem>
                        <SelectItem value="a">A - {selectedGemstone.quality.a}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isHi ? 'font-hindi' : ''}>
                      {isHi ? 'कैरेट' : 'Carats'}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="25"
                      value={order.carats}
                      onChange={(e) => setOrder(prev => ({ ...prev, carats: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="certification"
                      checked={order.certification}
                      onCheckedChange={(checked) => setOrder(prev => ({ ...prev, certification: checked as boolean }))}
                    />
                    <Label htmlFor="certification" className={isHi ? 'font-hindi' : ''}>
                      {isHi ? 'प्रमाणपत्र (+₹2,000)' : 'Certification (+₹2,000)'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="energization"
                      checked={order.energization}
                      onCheckedChange={(checked) => setOrder(prev => ({ ...prev, energization: checked as boolean }))}
                    />
                    <Label htmlFor="energization" className={isHi ? 'font-hindi' : ''}>
                      {isHi ? 'प्राण प्रतिष्ठा (+₹1,500)' : 'Energization (+₹1,500)'}
                    </Label>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'कुल मूल्य:' : 'Total Price:'} ₹{calculatePrice().toLocaleString()}
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <span className={isHi ? 'font-hindi' : ''}>
                    {isHi ? '🛒 ऑर्डर करें' : '🛒 Place Order'}
                  </span>
                </Button>
              </div>
            ) : (
              <div className={`text-center py-8 text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'कृपया पहले एक रत्न चुनें' : 'Please select a gemstone first'}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GemstoneRecommendationCard;