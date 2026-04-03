// Week 61: Medical Astrology Service
// Body parts, diseases, health predictions based on planetary positions

export interface HealthIndicator {
  bodyPart: string;
  planet: string;
  sign: string;
  house: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  description: string;
  preventiveMeasures: string[];
  ayurvedicRemedies: string[];
}

export interface MedicalAstrologyReport {
  constitution: string; // Vata/Pitta/Kapha
  dominantDosha: string;
  healthStrength: number;
  vulnerableAreas: HealthIndicator[];
  strongAreas: string[];
  criticalPlanets: string[];
  seasonalAdvice: string;
  dietRecommendations: string[];
  exerciseRecommendations: string[];
  mentalHealthInsights: string;
  overallHealthForecast: string;
}

interface PlanetData {
  name: string;
  rashiIndex: number;
  house: number;
  degrees: number;
  isRetrograde?: boolean;
}

// Planet-body part associations
const PLANET_BODY_PARTS: Record<string, string[]> = {
  Sun: ['Heart', 'Spine', 'Right Eye', 'Vitality', 'Bones'],
  Moon: ['Mind', 'Lungs', 'Left Eye', 'Breasts', 'Stomach', 'Fluids'],
  Mars: ['Blood', 'Muscles', 'Head', 'Bile', 'Bone Marrow'],
  Mercury: ['Nervous System', 'Skin', 'Lungs', 'Speech', 'Hands'],
  Jupiter: ['Liver', 'Fat', 'Thighs', 'Arteries', 'Immune System'],
  Venus: ['Kidneys', 'Reproductive System', 'Throat', 'Face', 'Semen'],
  Saturn: ['Joints', 'Teeth', 'Bones', 'Knees', 'Chronic Conditions'],
  Rahu: ['Nervous System', 'Skin Diseases', 'Poison', 'Unusual Diseases'],
  Ketu: ['Spiritual Diseases', 'Mysterious Ailments', 'Wounds', 'Fevers'],
};

// Sign-body part associations
const SIGN_BODY_PARTS: Record<number, string> = {
  0: 'Head and Brain', 1: 'Neck and Throat', 2: 'Shoulders and Arms',
  3: 'Chest and Lungs', 4: 'Heart and Spine', 5: 'Digestive System',
  6: 'Kidneys and Lower Back', 7: 'Reproductive Organs', 8: 'Thighs and Hips',
  9: 'Knees and Joints', 10: 'Calves and Ankles', 11: 'Feet and Lymphatic System',
};

// Dosha by sign
const SIGN_DOSHA: Record<number, string> = {
  0: 'Pitta', 1: 'Kapha', 2: 'Vata', 3: 'Kapha', 4: 'Pitta', 5: 'Vata',
  6: 'Vata', 7: 'Kapha', 8: 'Pitta', 9: 'Vata', 10: 'Vata', 11: 'Kapha',
};

const DISEASE_INDICATORS: Record<string, Record<number, string>> = {
  Sun: {
    6: 'Heart conditions, eye problems, fever',
    8: 'Chronic heart issues, spinal problems',
    12: 'Hidden health issues, hospitalization risk',
  },
  Moon: {
    6: 'Mental health concerns, digestive issues, fluid imbalances',
    8: 'Emotional disorders, lung problems',
    12: 'Sleep disorders, mental health challenges',
  },
  Mars: {
    6: 'Accidents, surgeries, blood disorders, infections',
    8: 'Serious injuries, blood diseases',
    12: 'Hidden enemies, hospitalization',
  },
  Saturn: {
    1: 'Chronic conditions, slow metabolism, joint issues',
    6: 'Chronic diseases, dental problems',
    8: 'Long-term illnesses, bone diseases',
  },
};

const PREVENTIVE_MEASURES: Record<string, string[]> = {
  Sun: ['Regular cardiac check-ups', 'Eye examinations', 'Vitamin D supplementation', 'Avoid excessive heat'],
  Moon: ['Mental health practices', 'Adequate sleep', 'Hydration', 'Emotional support systems'],
  Mars: ['Avoid risky activities', 'Blood pressure monitoring', 'Iron-rich diet', 'Anger management'],
  Mercury: ['Stress management', 'Regular breaks from screens', 'Breathing exercises', 'Mental stimulation'],
  Jupiter: ['Liver function tests', 'Weight management', 'Avoid excess fats', 'Regular exercise'],
  Venus: ['Kidney health monitoring', 'Reproductive health check-ups', 'Balanced diet', 'Adequate water intake'],
  Saturn: ['Joint health exercises', 'Calcium supplementation', 'Dental care', 'Warm environments'],
  Rahu: ['Neurological check-ups', 'Skin care', 'Avoid toxins', 'Grounding practices'],
  Ketu: ['Spiritual practices for healing', 'Wound care', 'Fever management', 'Detoxification'],
};

const AYURVEDIC_REMEDIES: Record<string, string[]> = {
  Sun: ['Surya Namaskar daily', 'Consume wheat and jaggery', 'Ruby gemstone', 'Worship Sun on Sundays'],
  Moon: ['Moonstone or Pearl', 'Consume milk and rice', 'Chandra mantra', 'Meditation near water'],
  Mars: ['Red Coral gemstone', 'Consume lentils', 'Hanuman worship', 'Physical exercise'],
  Mercury: ['Emerald gemstone', 'Green vegetables', 'Vishnu mantra', 'Learning and reading'],
  Jupiter: ['Yellow Sapphire', 'Turmeric milk', 'Guru mantra', 'Donate yellow items'],
  Venus: ['Diamond or White Sapphire', 'White foods', 'Lakshmi worship', 'Arts and music'],
  Saturn: ['Blue Sapphire or Amethyst', 'Sesame seeds', 'Shani mantra', 'Service to elderly'],
  Rahu: ['Hessonite Garnet', 'Coconut water', 'Durga mantra', 'Avoid non-vegetarian food'],
  Ketu: ['Cat\'s Eye gemstone', 'Fasting on Tuesdays', 'Ganesha mantra', 'Spiritual practices'],
};

export function generateMedicalReport(planets: PlanetData[], ascendantRashi: number): MedicalAstrologyReport {
  const rashiNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  // Determine constitution from Ascendant and Moon
  const moon = planets.find(p => p.name === 'Moon');
  const ascDosha = SIGN_DOSHA[ascendantRashi] ?? 'Vata';
  const moonDosha = moon ? (SIGN_DOSHA[moon.rashiIndex] ?? 'Vata') : 'Vata';
  const constitution = `${ascDosha}-${moonDosha}`;
  const dominantDosha = ascDosha;

  // Calculate health strength
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];
  let healthScore = 65;
  planets.forEach(p => {
    if (benefics.includes(p.name) && [1, 5, 9, 11].includes(p.house)) healthScore += 3;
    if (malefics.includes(p.name) && [6, 8, 12].includes(p.house)) healthScore -= 4;
    if (p.isRetrograde) healthScore -= 2;
  });
  healthScore = Math.min(100, Math.max(20, healthScore));

  // Vulnerable areas
  const vulnerableAreas: HealthIndicator[] = [];
  planets.forEach(p => {
    const diseaseInfo = DISEASE_INDICATORS[p.name]?.[p.house];
    if (diseaseInfo || [6, 8, 12].includes(p.house)) {
      const riskLevel: HealthIndicator['riskLevel'] = p.house === 8 ? 'High' : p.house === 6 || p.house === 12 ? 'Moderate' : 'Low';
      vulnerableAreas.push({
        bodyPart: PLANET_BODY_PARTS[p.name]?.[0] ?? 'General Health',
        planet: p.name,
        sign: rashiNames[p.rashiIndex],
        house: p.house,
        riskLevel,
        description: diseaseInfo ?? `${p.name} in house ${p.house} requires health attention`,
        preventiveMeasures: PREVENTIVE_MEASURES[p.name] ?? [],
        ayurvedicRemedies: AYURVEDIC_REMEDIES[p.name] ?? [],
      });
    }
  });

  // Strong areas
  const strongAreas = planets
    .filter(p => [1, 5, 9, 11].includes(p.house) && benefics.includes(p.name))
    .map(p => `${PLANET_BODY_PARTS[p.name]?.[0] ?? p.name} (${p.name} in House ${p.house})`);

  // Critical planets
  const criticalPlanets = planets
    .filter(p => [6, 8, 12].includes(p.house) && malefics.includes(p.name))
    .map(p => p.name);

  // Seasonal advice based on dominant dosha
  const seasonalAdvice: Record<string, string> = {
    Pitta: 'Avoid excessive heat and spicy foods in summer. Stay cool and hydrated. Favor cooling foods like cucumber, coconut water, and mint.',
    Vata: 'Protect yourself from cold and wind. Maintain regular routines. Favor warm, oily, and grounding foods.',
    Kapha: 'Stay active and avoid heavy, cold foods. Exercise regularly. Favor light, warm, and spicy foods to stimulate metabolism.',
  };

  const dietRecs: Record<string, string[]> = {
    Pitta: ['Cooling foods (cucumber, coconut)', 'Avoid spicy and fried foods', 'Sweet, bitter, astringent tastes', 'Plenty of water and herbal teas'],
    Vata: ['Warm, cooked foods', 'Healthy oils and fats', 'Sweet, sour, salty tastes', 'Avoid raw and cold foods'],
    Kapha: ['Light, dry foods', 'Spices like ginger and pepper', 'Bitter, pungent, astringent tastes', 'Avoid dairy and sweets'],
  };

  const exerciseRecs: Record<string, string[]> = {
    Pitta: ['Swimming', 'Yoga (cooling poses)', 'Evening walks', 'Avoid intense midday exercise'],
    Vata: ['Gentle yoga', 'Walking', 'Tai Chi', 'Avoid excessive or irregular exercise'],
    Kapha: ['Vigorous exercise', 'Running', 'Aerobics', 'Morning workouts', 'Strength training'],
  };

  const mentalHealthInsights: Record<string, string> = {
    Pitta: 'Prone to anger, perfectionism, and burnout. Practice cooling meditation, forgiveness, and avoid competitive stress.',
    Vata: 'Prone to anxiety, fear, and scattered thinking. Ground yourself with routine, warm foods, and calming practices.',
    Kapha: 'Prone to depression, lethargy, and attachment. Stimulate yourself with new activities, social engagement, and exercise.',
  };

  return {
    constitution,
    dominantDosha,
    healthStrength: healthScore,
    vulnerableAreas: vulnerableAreas.slice(0, 5),
    strongAreas: strongAreas.length > 0 ? strongAreas : ['General vitality is supported'],
    criticalPlanets,
    seasonalAdvice: seasonalAdvice[dominantDosha] ?? seasonalAdvice.Vata,
    dietRecommendations: dietRecs[dominantDosha] ?? dietRecs.Vata,
    exerciseRecommendations: exerciseRecs[dominantDosha] ?? exerciseRecs.Vata,
    mentalHealthInsights: mentalHealthInsights[dominantDosha] ?? mentalHealthInsights.Vata,
    overallHealthForecast: `Your health strength score is ${healthScore}/100. ${healthScore >= 70 ? 'Generally robust health with good vitality.' : healthScore >= 50 ? 'Moderate health requiring regular attention and preventive care.' : 'Health needs careful attention; follow preventive measures diligently.'} Your ${dominantDosha} constitution requires ${dominantDosha === 'Pitta' ? 'cooling and calming' : dominantDosha === 'Vata' ? 'grounding and warming' : 'stimulating and lightening'} lifestyle choices.`,
  };
}

export { SIGN_BODY_PARTS, PLANET_BODY_PARTS };
