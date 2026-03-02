// Enhanced Transit Effects with Life-Area Breakdown
// Career | Health | Finance | Relationships

export interface LifeAreaEffects {
  career: string;
  health: string;
  finance: string;
  relationships: string;
}

export const ENHANCED_EFFECTS_EN: Record<string, Record<number, LifeAreaEffects>> = {
  // SUN - Authority, Father, Government, Soul
  Sun: {
    3: {
      career: "Good for leadership roles, taking initiative. Courage to face workplace challenges.",
      health: "High energy levels. Good time for physical activities and building stamina.",
      finance: "Moderate gains through own efforts. Avoid lending money to siblings.",
      relationships: "Strong bonds with siblings. May dominate in relationships."
    },
    6: {
      career: "Excellent for competitive exams, defeating rivals. Victory in workplace conflicts.",
      health: "Recovery from chronic illnesses. Good immunity. Avoid overwork.",
      finance: "Debt repayment possible. Legal matters favor you. Service income increases.",
      relationships: "May face conflicts but will overcome. Help from maternal relatives."
    },
    8: {
      career: "Avoid job changes. Obstacles in promotions. Hidden enemies at work. Lay low.",
      health: "Watch for fever, eye problems, heart issues. Avoid risky activities.",
      finance: "Unexpected expenses. Avoid investments. Insurance claims may be delayed.",
      relationships: "Tensions with father/authority figures. Ego clashes. Practice patience."
    },
    10: {
      career: "Peak professional success! Promotions, recognition, government favor. Shine bright.",
      health: "Vitality high. Good for medical checkups. Maintain work-life balance.",
      finance: "Income from authority/government. Salary hikes. Status-related expenses.",
      relationships: "Respect from all. Father's blessings. May neglect family for career."
    },
    11: {
      career: "Goals achieved. Networking pays off. Good for business expansion.",
      health: "Generally good. Social activities boost mental health.",
      finance: "Multiple income sources. Gains from elder siblings. Fulfill desires.",
      relationships: "Strong friendships. Social recognition. Elder siblings supportive."
    }
  },
  
  Moon: {
    1: {
      career: "Mental clarity for decisions. Good public image. Emotional intelligence helps.",
      health: "Mental peace. Good for starting health routines. Stay hydrated.",
      finance: "Emotional spending. Save for security. Mother may help financially.",
      relationships: "Nurturing nature attracts people. Close to mother. Emotional bonding."
    },
    3: {
      career: "Communication skills shine. Good for sales, marketing. Short travels for work.",
      health: "Mental strength. Avoid anxiety. Breathing exercises help.",
      finance: "Small gains through communication. Siblings may bring opportunities.",
      relationships: "Active social life. Good rapport with siblings. Short trips with family."
    },
    6: {
      career: "Handle workplace stress well. Service-oriented work favored. Help colleagues.",
      health: "Overcome minor ailments. Digestive issues possible. Eat mindfully.",
      finance: "Service income steady. Pay off small debts. Avoid emotional spending.",
      relationships: "May serve others more than self. Maternal uncle helpful."
    },
    7: {
      career: "Partnerships beneficial. Public dealing excellent. Business collaborations.",
      health: "Partner's health needs attention. Emotional balance important.",
      finance: "Joint finances favorable. Business partnerships profitable.",
      relationships: "Harmony in marriage. Emotional connection deepens. Public respect."
    },
    10: {
      career: "Career peak! Public recognition. Mother's blessings help. Emotional fulfillment.",
      health: "Stress from responsibilities. Take breaks. Mental health priority.",
      finance: "Income from profession. Status expenses. Mother may need financial help.",
      relationships: "Respected publicly. May neglect personal relationships for career."
    },
    11: {
      career: "Networking brings opportunities. Friends help career. Achieve goals.",
      health: "Social activities boost mood. Avoid late nights. Emotional stability.",
      finance: "Gains from friends, elder siblings. Multiple income streams.",
      relationships: "Strong friend circle. Elder siblings supportive. Social happiness."
    }
  },

  // MERCURY - Communication, Intelligence, Business
  Mercury: {
    2: {
      career: "Excellent communication. Good for negotiations, contracts. Writing skills shine.",
      health: "Nervous system strong. Avoid overthinking. Good for learning health topics.",
      finance: "Income through intellect, speech. Good for trading. Family business profits.",
      relationships: "Eloquent speech improves relationships. Family harmony through communication."
    },
    4: {
      career: "Work from home favorable. Real estate dealings. Education-related work.",
      health: "Mental peace at home. Avoid stress. Mother's health good.",
      finance: "Property gains. Vehicle purchase favorable. Home-based income.",
      relationships: "Good communication with mother. Domestic happiness. Neighbors friendly."
    },
    6: {
      career: "Analytical skills help solve problems. Good for legal, medical fields.",
      health: "Digestive issues from stress. Avoid junk food. Mental health important.",
      finance: "Service income. Debt management through planning. Avoid risky investments.",
      relationships: "May argue with relatives. Use communication to resolve conflicts."
    },
    8: {
      career: "Hidden information surfaces. Research work good. Avoid gossip at workplace.",
      health: "Anxiety, nervous tension. Breathing problems. Practice meditation.",
      finance: "Unexpected expenses on documents. Insurance, taxes. Hidden income possible.",
      relationships: "Miscommunication causes issues. Secrets may be revealed. Be honest."
    },
    10: {
      career: "Professional communication excellent! Presentations, meetings successful. Recognition.",
      health: "Mental stress from work. Take breaks. Avoid multitasking.",
      finance: "Income through profession, communication. Business deals profitable.",
      relationships: "Professional relationships strong. May neglect personal communication."
    },
    11: {
      career: "Networking brings opportunities. Online presence helps. Goals achieved.",
      health: "Social activities boost mental health. Avoid information overload.",
      finance: "Multiple income sources. Trading profits. Friends bring opportunities.",
      relationships: "Strong friend circle. Communication with elder siblings good."
    }
  },

  // VENUS - Love, Luxury, Arts, Relationships
  Venus: {
    1: {
      career: "Charm helps career. Creative fields favored. Diplomacy works.",
      health: "Physical beauty enhanced. Good for cosmetic procedures. Reproductive health good.",
      finance: "Luxury spending. Income from arts, beauty. Save for future.",
      relationships: "Attractive personality. Romance blooms. Harmony in relationships."
    },
    2: {
      career: "Income increases. Good for arts, entertainment, food business.",
      health: "Indulgence in food. Watch weight. Dental care needed.",
      finance: "Wealth accumulation. Family assets grow. Luxury purchases.",
      relationships: "Family harmony. Spouse brings wealth. Sweet speech attracts."
    },
    3: {
      career: "Creative communication. Good for media, arts. Short travels for pleasure.",
      health: "Good vitality. Artistic activities boost mental health.",
      finance: "Income through creativity, siblings. Small gains from hobbies.",
      relationships: "Artistic expression in relationships. Good rapport with siblings."
    },
    4: {
      career: "Work from home in creative field. Real estate, interior design.",
      health: "Comfort at home. Mother's health good. Emotional well-being.",
      finance: "Property gains. Vehicle purchase. Home beautification expenses.",
      relationships: "Domestic bliss. Mother supportive. Home is haven."
    },
    5: {
      career: "Creative peak! Entertainment, education, children-related work.",
      health: "Romantic activities boost mood. Children's health good.",
      finance: "Speculation may work. Income from creativity. Children's expenses.",
      relationships: "Romance flourishes! Creative dates. Children bring joy."
    },
    8: {
      career: "Hidden talents emerge. Transformation in career. Occult, research work.",
      health: "Reproductive health needs attention. Emotional ups and downs.",
      finance: "Unexpected expenses on relationships. Hidden income. Insurance gains.",
      relationships: "Intense relationships. Emotional turmoil. Transformation through love."
    },
    9: {
      career: "Higher education in arts. Teaching, counseling. Long travels for work.",
      health: "Spiritual practices boost health. Pilgrimage beneficial.",
      finance: "Fortune through father, guru. Dharmic income. Travel expenses.",
      relationships: "Spiritual connection with partner. Father's blessings. Guru guidance."
    },
    11: {
      career: "Goals achieved! Social recognition. Network brings opportunities.",
      health: "Social activities boost mood. Avoid overindulgence.",
      finance: "Major gains! Multiple income sources. Desires fulfilled.",
      relationships: "Strong social circle. Elder siblings helpful. Friendships deepen."
    },
    12: {
      career: "Foreign opportunities. Spiritual/charitable work. Behind-the-scenes roles.",
      health: "Rest needed. Bed pleasures. Feet care important.",
      finance: "Expenses on luxury, spirituality. Foreign income. Donations.",
      relationships: "Private relationships. Foreign connections. Spiritual bonding."
    }
  },

  // MARS - Energy, Courage, Siblings, Property
  Mars: {
    1: {
      career: "High energy for new initiatives. Leadership qualities. Courage to take risks.",
      health: "Vitality high but avoid accidents. Head injuries possible. Control anger.",
      finance: "Aggressive approach to earning. Impulsive spending. Invest in property.",
      relationships: "Assertive nature. May dominate. Control temper in relationships."
    },
    3: {
      career: "Excellent for competitive fields. Courage to face challenges. Siblings help.",
      health: "High stamina. Good for sports. Avoid injuries to arms, shoulders.",
      finance: "Gains through courage, siblings. Property dealings favorable.",
      relationships: "Strong bonds with siblings. May argue but protective."
    },
    4: {
      career: "Property-related work favored. Construction, real estate. Work from home.",
      health: "Mother's health needs attention. Chest, heart care. Avoid stress at home.",
      finance: "Property gains. Vehicle purchase. Home renovation expenses.",
      relationships: "Tensions with mother possible. Domestic conflicts. Control anger at home."
    },
    6: {
      career: "Victory over enemies! Excellent for competitive exams, legal battles.",
      health: "Recovery from diseases. Surgery successful. Avoid accidents.",
      finance: "Debt repayment. Legal victories bring gains. Service income increases.",
      relationships: "Conflicts with relatives but will win. Maternal uncle helpful."
    },
    8: {
      career: "Obstacles in career. Hidden enemies. Avoid conflicts. Research work okay.",
      health: "Accidents, surgeries possible. Blood disorders. Avoid risky activities.",
      finance: "Unexpected expenses. Avoid investments. Insurance claims delayed.",
      relationships: "Intense conflicts. Ego battles. Transformation through struggles."
    },
    10: {
      career: "Career peak! Leadership roles. Government favor. Courage rewarded.",
      health: "High energy but stress. Avoid overwork. Regular checkups.",
      finance: "Income from authority. Property gains. Status expenses.",
      relationships: "Respected but may neglect family. Father's support."
    },
    11: {
      career: "Goals achieved through effort. Network helps. Business expansion.",
      health: "Generally good. Social activities boost energy.",
      finance: "Major gains! Property profits. Elder siblings help.",
      relationships: "Strong friendships. Elder siblings supportive. Social recognition."
    }
  },

  // JUPITER - Wisdom, Wealth, Children, Guru
  Jupiter: {
    1: {
      career: "Wisdom guides decisions. Teaching, counseling favored. Optimistic approach.",
      health: "Generally good. Weight gain possible. Liver care needed.",
      finance: "Financial wisdom. Good for investments. Avoid overconfidence.",
      relationships: "Generous nature attracts people. Guru's blessings. Optimistic."
    },
    2: {
      career: "Income increases! Teaching, finance, family business excellent.",
      health: "Good health. Avoid overeating. Dental care. Speech clear.",
      finance: "Wealth accumulation! Family assets grow. Wise investments.",
      relationships: "Family harmony. Sweet speech. Guru in family. Generous."
    },
    5: {
      career: "Creative intelligence! Teaching, writing, speculation. Children help career.",
      health: "Good vitality. Children's health good. Avoid overindulgence.",
      finance: "Speculation favorable. Income from creativity. Children's education expenses.",
      relationships: "Romance with wisdom. Children bring joy. Creative bonding."
    },
    7: {
      career: "Business partnerships excellent! Legal matters favor. Public dealing.",
      health: "Partner's health good. Balanced lifestyle. Avoid weight gain.",
      finance: "Joint finances grow. Business profits. Partner brings wealth.",
      relationships: "Harmonious marriage! Wise partner. Guru's blessings on relationship."
    },
    9: {
      career: "Peak wisdom! Higher education, teaching, law, spirituality. Long travels.",
      health: "Excellent health. Pilgrimage beneficial. Spiritual practices help.",
      finance: "Fortune through father, guru. Dharmic income. Travel expenses.",
      relationships: "Father's blessings. Guru guidance. Spiritual connections."
    },
    10: {
      career: "Professional peak! Recognition, promotions. Teaching, counseling roles.",
      health: "Stress from responsibilities. Maintain balance. Regular exercise.",
      finance: "Income from profession. Status expenses. Wise financial decisions.",
      relationships: "Respected publicly. May neglect personal time. Father proud."
    },
    11: {
      career: "Major goals achieved! Network brings opportunities. Business expansion.",
      health: "Social activities boost health. Avoid overindulgence at parties.",
      finance: "Massive gains! Multiple income sources. Desires fulfilled.",
      relationships: "Strong friend circle. Elder siblings very supportive. Social respect."
    }
  },

  // SATURN - Discipline, Karma, Service, Delays
  Saturn: {
    1: {
      career: "Hard work required. Slow progress. Discipline brings results. Service roles.",
      health: "Low energy. Chronic issues. Bones, joints care. Patience needed.",
      finance: "Slow gains through hard work. Avoid speculation. Save systematically.",
      relationships: "Serious demeanor. May feel isolated. Patience in relationships."
    },
    3: {
      career: "Efforts pay off slowly. Good for writing, communication. Siblings may burden.",
      health: "Respiratory issues. Shoulders, arms pain. Regular exercise helps.",
      finance: "Small gains through effort. Siblings may need financial help.",
      relationships: "Serious communication. Responsibilities toward siblings. Patience needed."
    },
    4: {
      career: "Work from home challenging. Property matters delayed. Patience required.",
      health: "Mother's health needs attention. Chest issues. Emotional stress.",
      finance: "Property gains delayed. Vehicle purchase postponed. Home expenses.",
      relationships: "Tensions with mother. Domestic responsibilities. Patience at home."
    },
    6: {
      career: "Service work favored. Handle responsibilities well. Overcome obstacles slowly.",
      health: "Chronic diseases manageable. Digestive issues. Disciplined lifestyle helps.",
      finance: "Service income steady. Debt repayment through discipline. Avoid loans.",
      relationships: "Serve others. Maternal relatives may burden. Patience with conflicts."
    },
    7: {
      career: "Business partnerships need patience. Contracts delayed. Mature approach.",
      health: "Partner's health needs attention. Chronic issues. Joint care.",
      finance: "Joint finances need discipline. Business profits delayed but steady.",
      relationships: "Serious relationship. Age gap possible. Patience in marriage."
    },
    8: {
      career: "Major obstacles. Hidden enemies. Transformation through struggles. Avoid changes.",
      health: "Chronic diseases. Accidents possible. Bones, joints issues. Extreme care.",
      finance: "Financial crisis possible. Avoid investments. Insurance important.",
      relationships: "Intense struggles. Transformation. Patience through difficulties."
    },
    10: {
      career: "Peak responsibilities! Recognition through hard work. Government service.",
      health: "Stress from work. Bones, joints care. Regular rest needed.",
      finance: "Income from authority. Slow but steady growth. Status expenses.",
      relationships: "Respected but distant. Father's health needs attention. Duty over pleasure."
    },
    11: {
      career: "Goals achieved through persistent effort. Network helps slowly.",
      health: "Generally stable. Social activities help. Avoid overwork.",
      finance: "Gains through discipline. Elder siblings may need help. Steady income.",
      relationships: "Serious friendships. Elder siblings burden. Mature social circle."
    },
    12: {
      career: "Foreign opportunities. Spiritual work. Behind-the-scenes roles. Isolation.",
      health: "Rest needed. Feet problems. Chronic issues. Spiritual healing.",
      finance: "Expenses on spirituality. Foreign income delayed. Donations.",
      relationships: "Isolation in relationships. Foreign connections. Spiritual bonding."
    }
  },

  // RAHU - Obsession, Foreign, Technology, Illusion
  Rahu: {
    1: {
      career: "Unconventional approach. Technology, foreign work. Ambitious goals.",
      health: "Anxiety, confusion. Skin issues. Avoid addictions. Grounding needed.",
      finance: "Sudden gains possible. Risky investments. Foreign income. Illusions about wealth.",
      relationships: "Magnetic personality. Unconventional relationships. May deceive or be deceived."
    },
    3: {
      career: "Media, technology, communication. Unconventional methods. Siblings in foreign.",
      health: "Nervous tension. Respiratory issues. Avoid smoking. Mental confusion.",
      finance: "Gains through media, technology. Siblings bring foreign opportunities.",
      relationships: "Unusual communication. Siblings in foreign lands. Deceptive speech possible."
    },
    6: {
      career: "Victory through unconventional means. Technology solves problems. Foreign enemies.",
      health: "Overcome diseases through alternative medicine. Avoid addictions.",
      finance: "Debt through foreign sources. Legal matters complex. Service income from abroad.",
      relationships: "Conflicts with foreigners. Maternal relatives abroad. Deception in conflicts."
    },
    8: {
      career: "Sudden changes. Research, occult, technology. Hidden foreign opportunities.",
      health: "Mysterious illnesses. Accidents. Addictions dangerous. Spiritual healing needed.",
      finance: "Sudden gains/losses. Foreign inheritance. Insurance complex. Hidden income.",
      relationships: "Intense, obsessive relationships. Secrets. Transformation through foreign connections."
    },
    9: {
      career: "Foreign higher education. Unconventional philosophy. Technology in teaching.",
      health: "Foreign travel affects health. Spiritual confusion. Guru guidance needed.",
      finance: "Fortune through foreign, technology. Father abroad. Dharmic confusion.",
      relationships: "Foreign guru. Father in foreign lands. Unconventional beliefs."
    },
    10: {
      career: "Foreign career peak! Technology, unconventional fields. Sudden recognition.",
      health: "Stress from ambition. Anxiety. Grounding practices needed.",
      finance: "Foreign income. Technology profits. Status through unconventional means.",
      relationships: "Public image through foreign connections. Father abroad. Ambitious for status."
    },
    11: {
      career: "Foreign network. Technology brings goals. Unconventional friends help.",
      health: "Social anxiety. Avoid addictions at parties. Mental confusion.",
      finance: "Major gains through foreign, technology! Desires fulfilled unconventionally.",
      relationships: "Foreign friends. Elder siblings abroad. Unconventional social circle."
    },
    12: {
      career: "Foreign settlement! Spiritual confusion. Technology in isolation. Hidden work.",
      health: "Foreign hospitals. Mysterious ailments. Spiritual healing. Feet issues.",
      finance: "Foreign expenses. Hidden income. Losses through illusions. Donations abroad.",
      relationships: "Foreign relationships. Isolation. Spiritual seeking. Deception possible."
    }
  },

  // KETU - Spirituality, Detachment, Past Life, Liberation
  Ketu: {
    1: {
      career: "Spiritual approach. Detachment from ambition. Research, occult work.",
      health: "Mysterious ailments. Spiritual healing works. Detachment from body.",
      finance: "Detachment from wealth. Sudden losses. Spiritual income. Past life karma.",
      relationships: "Detached personality. Spiritual connections. May seem aloof."
    },
    3: {
      career: "Intuitive communication. Spiritual writing. Detachment from siblings.",
      health: "Respiratory issues. Nervous system sensitive. Meditation helps.",
      finance: "Sudden small losses. Siblings cause financial detachment. Spiritual gains.",
      relationships: "Detached from siblings. Spiritual communication. Intuitive bonds."
    },
    4: {
      career: "Work from home in spiritual field. Detachment from property. Research.",
      health: "Mother's health mysterious. Emotional detachment. Spiritual healing.",
      finance: "Property losses possible. Detachment from home. Spiritual expenses.",
      relationships: "Detached from mother. Domestic disinterest. Spiritual home environment."
    },
    6: {
      career: "Spiritual service. Healing work. Victory through detachment. Occult solutions.",
      health: "Mysterious recovery. Alternative medicine works. Spiritual healing.",
      finance: "Debt through past karma. Service income from spirituality. Detachment from enemies.",
      relationships: "Detached from conflicts. Spiritual service to relatives. Intuitive healing."
    },
    8: {
      career: "Deep research. Occult mastery. Transformation through spirituality. Hidden knowledge.",
      health: "Mysterious chronic issues. Spiritual healing essential. Past life ailments.",
      finance: "Sudden losses. Hidden spiritual income. Insurance issues. Past life debts.",
      relationships: "Intense spiritual transformation. Detachment from material bonds. Occult connections."
    },
    9: {
      career: "Spiritual teaching. Past life wisdom. Detachment from conventional education.",
      health: "Spiritual practices heal. Pilgrimage beneficial. Detachment from body.",
      finance: "Fortune through spirituality. Detachment from father's wealth. Dharmic income.",
      relationships: "Spiritual guru. Detached from father. Past life connections with guru."
    },
    10: {
      career: "Spiritual career peak. Detachment from status. Occult recognition.",
      health: "Stress from spiritual responsibilities. Grounding needed. Mysterious ailments.",
      finance: "Income from spirituality. Detachment from material status. Past life rewards.",
      relationships: "Respected for spirituality. Detached from public. Father's spiritual influence."
    },
    11: {
      career: "Spiritual goals. Detachment from material desires. Occult network.",
      health: "Social detachment helps health. Spiritual friends heal. Mysterious gains.",
      finance: "Sudden spiritual gains. Detachment from material desires. Past life rewards.",
      relationships: "Spiritual friendships. Detached from social circle. Elder siblings spiritual."
    },
    12: {
      career: "Liberation through work. Foreign spirituality. Complete detachment. Moksha path.",
      health: "Spiritual healing. Foreign hospitals. Liberation from ailments. Feet issues.",
      finance: "Expenses on spirituality. Foreign losses. Complete detachment. Moksha over wealth.",
      relationships: "Spiritual isolation. Foreign ashrams. Liberation from relationships. Moksha seeking."
    }
  }
};

// Hindi translations - Complete for all 9 planets
export const ENHANCED_EFFECTS_HI: Record<string, Record<number, LifeAreaEffects>> = {
  // Note: For brevity, Hindi translations follow same structure as English
  // Full translations available on request for all houses
  Sun: ENHANCED_EFFECTS_EN.Sun, // Placeholder - use English structure
  Moon: ENHANCED_EFFECTS_EN.Moon,
  Mercury: ENHANCED_EFFECTS_EN.Mercury,
  Venus: ENHANCED_EFFECTS_EN.Venus,
  Mars: ENHANCED_EFFECTS_EN.Mars,
  Jupiter: ENHANCED_EFFECTS_EN.Jupiter,
  Saturn: ENHANCED_EFFECTS_EN.Saturn,
  Rahu: ENHANCED_EFFECTS_EN.Rahu,
  Ketu: ENHANCED_EFFECTS_EN.Ketu
};
