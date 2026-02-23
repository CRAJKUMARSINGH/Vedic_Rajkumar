// Bilingual content
const translations = {
    en: {
        title: "Vedic Transit Calculator",
        subtitle: "Gochara Phal with Vedha Analysis",
        labelDate: "Birth Date",
        labelTime: "Birth Time",
        labelPlace: "Birth Place",
        labelMoon: "Natal Moon Sign (Rashi)",
        labelTransitDate: "Transit Date",
        btnCalculate: "Calculate Transit",
        resultsTitle: "Transit Results",
        scoreLabel: "Overall Score",
        favCount: "Effective Favorable Transits:",
        thPlanet: "Planet",
        thHouse: "House from Moon",
        thBase: "Base",
        thVedha: "Vedha?",
        thStatus: "Effective Status",
        thScore: "Score",
        summaryLabel: "Summary:",
        favorable: "Favorable",
        unfavorable: "Unfavorable",
        yes: "Yes",
        no: "No",
        favWithoutVedha: "Favorable without Vedha",
        favWithVedha: "Favorable but Vedha",
        unfavWithVedha: "Unfavorable with Vedha",
        planets: {
            Sun: "Sun",
            Moon: "Moon",
            Mercury: "Mercury",
            Venus: "Venus",
            Mars: "Mars",
            Jupiter: "Jupiter",
            Saturn: "Saturn",
            Rahu: "Rahu",
            Ketu: "Ketu"
        }
    },
    hi: {
        title: "वैदिक गोचर कैलकुलेटर",
        subtitle: "वेध विश्लेषण के साथ गोचर फल",
        labelDate: "जन्म तिथि",
        labelTime: "जन्म समय",
        labelPlace: "जन्म स्थान",
        labelMoon: "चंद्र राशि",
        labelTransitDate: "गोचर तिथि",
        btnCalculate: "गोचर की गणना करें",
        resultsTitle: "गोचर परिणाम",
        scoreLabel: "कुल स्कोर",
        favCount: "प्रभावी अनुकूल गोचर:",
        thPlanet: "ग्रह",
        thHouse: "चंद्र से भाव",
        thBase: "आधार",
        thVedha: "वेध?",
        thStatus: "प्रभावी स्थिति",
        thScore: "स्कोर",
        summaryLabel: "सारांश:",
        favorable: "अनुकूल",
        unfavorable: "प्रतिकूल",
        yes: "हाँ",
        no: "नहीं",
        favWithoutVedha: "बिना वेध के अनुकूल",
        favWithVedha: "वेध के साथ अनुकूल",
        unfavWithVedha: "वेध के साथ प्रतिकूल",
        planets: {
            Sun: "सूर्य",
            Moon: "चंद्र",
            Mercury: "बुध",
            Venus: "शुक्र",
            Mars: "मंगल",
            Jupiter: "गुरु",
            Saturn: "शनि",
            Rahu: "राहु",
            Ketu: "केतु"
        }
    }
};

let currentLang = 'en';

// Favorable houses for each planet from Moon
const favorableHouses = {
    Sun: [3, 6, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mercury: [2, 4, 6, 8, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 6, 11],
    Jupiter: [2, 5, 7, 9, 11],
    Saturn: [3, 6, 11],
    Rahu: [3, 6, 11], // Similar to Saturn
    Ketu: [3, 6, 11]  // Similar to Mars
};

// Sample transit data (in real app, this would come from API)
const sampleTransits = {
    Sun: { sign: "Aquarius", house: 8 },
    Moon: { sign: "Aries", house: 10 },
    Mercury: { sign: "Aquarius", house: 8 },
    Venus: { sign: "Aquarius", house: 8 },
    Mars: { sign: "Capricorn", house: 7 },
    Jupiter: { sign: "Gemini", house: 12 },
    Saturn: { sign: "Pisces", house: 9 },
    Rahu: { sign: "Aquarius", house: 8 },
    Ketu: { sign: "Leo", house: 2 }
};

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];
    
    document.getElementById('title').textContent = t.title;
    document.getElementById('subtitle').textContent = t.subtitle;
    document.getElementById('label-date').textContent = t.labelDate;
    document.getElementById('label-time').textContent = t.labelTime;
    document.getElementById('label-place').textContent = t.labelPlace;
    document.getElementById('label-moon').textContent = t.labelMoon;
    document.getElementById('label-transit-date').textContent = t.labelTransitDate;
    document.getElementById('btn-calculate').textContent = t.btnCalculate;
    document.getElementById('results-title').textContent = t.resultsTitle;
    document.getElementById('score-label').textContent = t.scoreLabel;
    document.getElementById('th-planet').textContent = t.thPlanet;
    document.getElementById('th-house').textContent = t.thHouse;
    document.getElementById('th-base').textContent = t.thBase;
    document.getElementById('th-vedha').textContent = t.thVedha;
    document.getElementById('th-status').textContent = t.thStatus;
    document.getElementById('th-score').textContent = t.thScore;
    document.getElementById('summary-label').textContent = t.summaryLabel;
    
    document.querySelector('.lang-toggle').textContent = currentLang === 'en' ? 'हिंदी' : 'English';
}

function calculateTransit(planet, house) {
    const isFavorable = favorableHouses[planet].includes(house);
    const hasVedha = checkVedha(planet, house);
    
    let effectiveStatus;
    let score = 0;
    
    if (isFavorable && !hasVedha) {
        effectiveStatus = 'favWithoutVedha';
        score = 1;
    } else if (isFavorable && hasVedha) {
        effectiveStatus = 'favWithVedha';
        score = 0;
    } else if (!isFavorable && hasVedha) {
        effectiveStatus = 'unfavWithVedha';
        score = 0;
    } else {
        effectiveStatus = 'unfavorable';
        score = 0;
    }
    
    return {
        base: isFavorable ? 'favorable' : 'unfavorable',
        vedha: hasVedha ? 'yes' : 'no',
        effectiveStatus,
        score
    };
}

function checkVedha(planet, house) {
    // Simplified Vedha logic - in real app, check actual planetary positions
    // For Moon in 10th, no major Vedha typically
    if (planet === 'Moon' && house === 10) return false;
    
    // Heavy 8th house concentration might create some Vedha effects
    if (house === 8) return Math.random() > 0.7; // Simplified
    
    return false;
}

function generateSummary(totalScore) {
    const summaries = {
        en: {
            0: "Highly challenging day. Focus on caution, avoid major decisions. Good for spiritual practices.",
            1: "Predominantly unfavorable with minor relief. Stay grounded and patient.",
            2: "Mixed energies. Some favorable areas but proceed carefully.",
            3: "Balanced day. Focus on favorable transits and manage challenges wisely.",
            4: "Moderately favorable. Good for steady progress in select areas.",
            5: "Favorable day overall. Good for important activities and decisions.",
            6: "Very favorable. Excellent for new beginnings and important work.",
            7: "Highly auspicious. Strong support for major endeavors.",
            8: "Exceptionally favorable. Rare alignment supporting all activities.",
            9: "Perfect alignment. Extremely rare and highly auspicious for all matters."
        },
        hi: {
            0: "अत्यधिक चुनौतीपूर्ण दिन। सावधानी बरतें, बड़े निर्णय टालें। आध्यात्मिक कार्यों के लिए अच्छा।",
            1: "मुख्यतः प्रतिकूल, थोड़ी राहत। धैर्य रखें।",
            2: "मिश्रित ऊर्जा। कुछ अनुकूल क्षेत्र लेकिन सावधानी से आगे बढ़ें।",
            3: "संतुलित दिन। अनुकूल गोचर पर ध्यान दें और चुनौतियों को बुद्धिमानी से संभालें।",
            4: "मध्यम अनुकूल। चुनिंदा क्षेत्रों में स्थिर प्रगति के लिए अच्छा।",
            5: "कुल मिलाकर अनुकूल दिन। महत्वपूर्ण गतिविधियों और निर्णयों के लिए अच्छा।",
            6: "बहुत अनुकूल। नई शुरुआत और महत्वपूर्ण कार्यों के लिए उत्कृष्ट।",
            7: "अत्यधिक शुभ। प्रमुख प्रयासों के लिए मजबूत समर्थन।",
            8: "असाधारण रूप से अनुकूल। सभी गतिविधियों का समर्थन करने वाला दुर्लभ संरेखण।",
            9: "पूर्ण संरेखण। सभी मामलों के लिए अत्यंत दुर्लभ और अत्यधिक शुभ।"
        }
    };
    
    return summaries[currentLang][totalScore];
}

document.getElementById('transitForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const t = translations[currentLang];
    const tbody = document.getElementById('transitBody');
    tbody.innerHTML = '';
    
    let totalScore = 0;
    let favorableCount = 0;
    
    // Calculate for each planet
    Object.keys(sampleTransits).forEach(planet => {
        const transit = sampleTransits[planet];
        const result = calculateTransit(planet, transit.house);
        
        totalScore += result.score;
        if (result.score === 1) favorableCount++;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${t.planets[planet]}</strong></td>
            <td>${transit.house}</td>
            <td>${t[result.base]}</td>
            <td>${t[result.vedha]}</td>
            <td>${t[result.effectiveStatus]}</td>
            <td><strong>${result.score}</strong></td>
        `;
    });
    
    // Update score display
    document.getElementById('overallScore').textContent = `${totalScore}/9`;
    document.getElementById('fav-count').textContent = `${t.favCount} ${favorableCount}`;
    document.getElementById('summaryText').textContent = generateSummary(totalScore);
    
    // Show results
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
});

// Set today's date as default for transit date
document.getElementById('transitDate').valueAsDate = new Date();

// Initialize language
updateLanguage();
