// Enhanced Transit Effects with Life-Area Breakdown
// Career | Health | Finance | Relationships

export interface LifeAreaEffects {
  career: string;
  health: string;
  finance: string;
  relationships: string;
}

export const ENHANCED_EFFECTS_EN: Record<string, Record<number, LifeAreaEffects>> = {
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
  }
};

  
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
  }
};

// Hindi translations
export const ENHANCED_EFFECTS_HI: Record<string, Record<number, LifeAreaEffects>> = {
  Sun: {
    3: {
      career: "नेतृत्व भूमिका के लिए अच्छा। कार्यस्थल चुनौतियों का सामना करने का साहस।",
      health: "उच्च ऊर्जा स्तर। शारीरिक गतिविधियों और सहनशक्ति निर्माण के लिए अच्छा समय।",
      finance: "अपने प्रयासों से मध्यम लाभ। भाई-बहनों को पैसे उधार देने से बचें।",
      relationships: "भाई-बहनों के साथ मजबूत बंधन। संबंधों में हावी हो सकते हैं।"
    },
    6: {
      career: "प्रतियोगी परीक्षाओं, प्रतिद्वंद्वियों को हराने के लिए उत्कृष्ट। कार्यस्थल संघर्षों में विजय।",
      health: "पुरानी बीमारियों से उबरना। अच्छी प्रतिरक्षा। अधिक काम से बचें।",
      finance: "ऋण चुकौती संभव। कानूनी मामले आपके पक्ष में। सेवा आय बढ़ती है।",
      relationships: "संघर्ष हो सकते हैं लेकिन जीतेंगे। मातृ पक्ष से सहायता।"
    },
    8: {
      career: "नौकरी बदलने से बचें। पदोन्नति में बाधाएं। काम पर छिपे दुश्मन। शांत रहें।",
      health: "बुखार, आंखों की समस्या, हृदय संबंधी समस्याओं से सावधान। जोखिम भरी गतिविधियों से बचें।",
      finance: "अप्रत्याशित खर्च। निवेश से बचें। बीमा दावे में देरी हो सकती है।",
      relationships: "पिता/अधिकारियों के साथ तनाव। अहंकार टकराव। धैर्य रखें।"
    },
    10: {
      career: "व्यावसायिक सफलता का शिखर! पदोन्नति, मान्यता, सरकारी कृपा। चमकें।",
      health: "जीवन शक्ति उच्च। चिकित्सा जांच के लिए अच्छा। कार्य-जीवन संतुलन बनाए रखें।",
      finance: "अधिकार/सरकार से आय। वेतन वृद्धि। स्थिति संबंधी खर्च।",
      relationships: "सभी से सम्मान। पिता का आशीर्वाद। करियर के लिए परिवार की उपेक्षा हो सकती है।"
    },
    11: {
      career: "लक्ष्य प्राप्त। नेटवर्किंग फलदायी। व्यवसाय विस्तार के लिए अच्छा।",
      health: "आम तौर पर अच्छा। सामाजिक गतिविधियां मानसिक स्वास्थ्य को बढ़ावा देती हैं।",
      finance: "कई आय स्रोत। बड़े भाई-बहनों से लाभ। इच्छाएं पूरी करें।",
      relationships: "मजबूत दोस्ती। सामाजिक मान्यता। बड़े भाई-बहन सहायक।"
    }
  }
};
