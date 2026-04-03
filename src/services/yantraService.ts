/**
 * Yantra Service - Complete Yantra Database & Recommendation System
 * Week 40: Comprehensive Remedies - Yantra System (30+ Yantras)
 */

export interface YantraInfo {
  id: string;
  name: string;
  nameHi: string;
  planet?: string;
  deity: string;
  deityHi: string;
  category: 'planetary' | 'wealth' | 'protection' | 'spiritual' | 'health' | 'special';
  purpose: { en: string; hi: string };
  benefits: { en: string[]; hi: string[] };
  material: string;
  materialHi: string;
  bestDay: string;
  bestDayHi: string;
  activationMantra: string;
  activationMantraHi: string;
  mantraReps: number;
  installationProcedure: { en: string[]; hi: string[] };
  price: { low: number; medium: number; high: number };
}

function yantra(id: string, name: string, nameHi: string, planet: string | undefined,
  deity: string, deityHi: string, category: YantraInfo['category'],
  purposeEn: string, purposeHi: string,
  benefitsEn: string[], benefitsHi: string[],
  material: string, materialHi: string, bestDay: string, bestDayHi: string,
  mantra: string, mantraHi: string, reps: number,
  procEn: string[], procHi: string[],
  price: [number, number, number]
): YantraInfo {
  return {
    id, name, nameHi, planet, deity, deityHi, category,
    purpose: { en: purposeEn, hi: purposeHi },
    benefits: { en: benefitsEn, hi: benefitsHi },
    material, materialHi, bestDay, bestDayHi,
    activationMantra: mantra, activationMantraHi: mantraHi, mantraReps: reps,
    installationProcedure: { en: procEn, hi: procHi },
    price: { low: price[0], medium: price[1], high: price[2] }
  };
}

export const YANTRA_DATABASE: YantraInfo[] = [
  // ═══ 9 PLANETARY YANTRAS ═══
  yantra('surya_yantra','Surya Yantra','सूर्य यंत्र','Sun','Surya Dev','सूर्य देव','planetary',
    'Strengthens Sun for leadership and confidence','सूर्य को मजबूत करता है, नेतृत्व और आत्मविश्वास के लिए',
    ['Government favor','Authority','Father relationship','Heart health','Fame'],
    ['सरकारी कृपा','अधिकार','पिता संबंध','हृदय स्वास्थ्य','प्रसिद्धि'],
    'Copper/Gold plated','तांबा/सोने की परत','Sunday','रविवार',
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,
    ['Clean yantra with Ganga water','Place on red cloth facing East','Light ghee lamp','Offer red flowers','Chant mantra 108 times'],
    ['गंगाजल से यंत्र साफ करें','लाल कपड़े पर पूर्व दिशा में रखें','घी का दीप जलाएं','लाल फूल चढ़ाएं','108 बार मंत्र जाप करें'],
    [500,2000,8000]),
  yantra('chandra_yantra','Chandra Yantra','चंद्र यंत्र','Moon','Chandra Dev','चंद्र देव','planetary',
    'Strengthens Moon for mental peace','चंद्र को मजबूत करता है, मानसिक शांति के लिए',
    ['Mental peace','Emotional balance','Mother relationship','Intuition','Sleep quality'],
    ['मानसिक शांति','भावनात्मक संतुलन','मातृ संबंध','अंतर्ज्ञान','नींद की गुणवत्ता'],
    'Silver','चांदी','Monday','सोमवार',
    'Om Chandraya Namaha','ॐ चन्द्राय नमः',108,
    ['Wash with milk','Place on white cloth','Light camphor','Offer white flowers','Chant 108 times on Monday evening'],
    ['दूध से धोएं','सफेद कपड़े पर रखें','कपूर जलाएं','सफेद फूल चढ़ाएं','सोमवार संध्या 108 बार जाप करें'],
    [500,2000,8000]),
  yantra('mangal_yantra','Mangal Yantra','मंगल यंत्र','Mars','Mangal Dev','मंगल देव','planetary',
    'Strengthens Mars for courage and property','मंगल को मजबूत करता है, साहस और संपत्ति के लिए',
    ['Courage','Property gains','Manglik remedy','Energy','Blood health'],
    ['साहस','संपत्ति लाभ','मांगलिक उपाय','ऊर्जा','रक्त स्वास्थ्य'],
    'Copper','तांबा','Tuesday','मंगलवार',
    'Om Mangalaya Namaha','ॐ मंगलाय नमः',108,
    ['Wash with Ganga water','Place on red cloth','Offer vermilion','Light ghee lamp','Chant on Tuesday morning'],
    ['गंगाजल से धोएं','लाल कपड़े पर रखें','सिंदूर चढ़ाएं','घी का दीप जलाएं','मंगलवार प्रातः जाप करें'],
    [500,2000,8000]),
  yantra('budh_yantra','Budh Yantra','बुध यंत्र','Mercury','Budh Dev','बुध देव','planetary',
    'Strengthens Mercury for intelligence','बुध को मजबूत करता है, बुद्धि के लिए',
    ['Intelligence','Communication','Business success','Education','Analytical ability'],
    ['बुद्धि','संचार','व्यापार सफलता','शिक्षा','विश्लेषणात्मक क्षमता'],
    'Brass','पीतल','Wednesday','बुधवार',
    'Om Budhaya Namaha','ॐ बुधाय नमः',108,
    ['Wash with Ganga water','Place on green cloth','Offer green items','Light incense','Chant on Wednesday morning'],
    ['गंगाजल से धोएं','हरे कपड़े पर रखें','हरी वस्तुएं चढ़ाएं','धूप जलाएं','बुधवार प्रातः जाप करें'],
    [500,2000,8000]),
  yantra('guru_yantra','Guru Yantra','गुरु यंत्र','Jupiter','Guru Dev','गुरु देव','planetary',
    'Strengthens Jupiter for wisdom and wealth','गुरु को मजबूत करता है, ज्ञान और धन के लिए',
    ['Wisdom','Wealth','Marriage','Children','Spiritual growth'],
    ['ज्ञान','धन','विवाह','संतान','आध्यात्मिक विकास'],
    'Gold plated','सोने की परत','Thursday','गुरुवार',
    'Om Gurave Namaha','ॐ गुरवे नमः',108,
    ['Wash with Ganga water','Place on yellow cloth','Offer yellow flowers','Light ghee lamp','Chant on Thursday morning'],
    ['गंगाजल से धोएं','पीले कपड़े पर रखें','पीले फूल चढ़ाएं','घी का दीप जलाएं','गुरुवार प्रातः जाप करें'],
    [500,3000,10000]),
  yantra('shukra_yantra','Shukra Yantra','शुक्र यंत्र','Venus','Shukra Dev','शुक्र देव','planetary',
    'Strengthens Venus for love and prosperity','शुक्र को मजबूत करता है, प्रेम और समृद्धि के लिए',
    ['Love life','Marriage','Luxury','Artistic talent','Beauty'],
    ['प्रेम जीवन','विवाह','विलासिता','कलात्मक प्रतिभा','सौंदर्य'],
    'Silver','चांदी','Friday','शुक्रवार',
    'Om Shukraya Namaha','ॐ शुक्राय नमः',108,
    ['Wash with rose water','Place on white cloth','Offer white flowers','Light camphor','Chant on Friday morning'],
    ['गुलाब जल से धोएं','सफेद कपड़े पर रखें','सफेद फूल चढ़ाएं','कपूर जलाएं','शुक्रवार प्रातः जाप करें'],
    [500,2000,8000]),
  yantra('shani_yantra','Shani Yantra','शनि यंत्र','Saturn','Shani Dev','शनि देव','planetary',
    'Pacifies Saturn, removes Sade Sati effects','शनि को शांत करता है, साढ़े साती प्रभाव दूर करता है',
    ['Sade Sati remedy','Career stability','Discipline','Long-term success','Protection from Saturn'],
    ['साढ़े साती उपाय','करियर स्थिरता','अनुशासन','दीर्घकालिक सफलता','शनि से सुरक्षा'],
    'Iron/Steel','लोहा/इस्पात','Saturday','शनिवार',
    'Om Shanaischaraya Namaha','ॐ शनैश्चराय नमः',108,
    ['Wash with sesame oil','Place on black/blue cloth','Offer black sesame seeds','Light mustard oil lamp','Chant on Saturday evening'],
    ['तिल तेल से धोएं','काले/नीले कपड़े पर रखें','काले तिल चढ़ाएं','सरसों तेल का दीप जलाएं','शनिवार संध्या जाप करें'],
    [500,2000,8000]),
  yantra('rahu_yantra','Rahu Yantra','राहु यंत्र','Rahu','Rahu','राहु','planetary',
    'Pacifies Rahu for clarity and success','राहु को शांत करता है, स्पष्टता और सफलता के लिए',
    ['Removes Rahu dosha','Foreign success','Technology mastery','Removes confusion','Mental clarity'],
    ['राहु दोष दूर करता है','विदेशी सफलता','तकनीकी निपुणता','भ्रम दूर करता है','मानसिक स्पष्टता'],
    'Panchdhatu','पंचधातु','Saturday','शनिवार',
    'Om Rahave Namaha','ॐ राहवे नमः',108,
    ['Wash with Ganga water','Place on dark cloth','Offer blue flowers','Light sesame oil lamp','Chant 108 times'],
    ['गंगाजल से धोएं','गहरे कपड़े पर रखें','नीले फूल चढ़ाएं','तिल तेल का दीप जलाएं','108 बार जाप करें'],
    [500,2000,8000]),
  yantra('ketu_yantra','Ketu Yantra','केतु यंत्र','Ketu','Ketu','केतु','planetary',
    'Pacifies Ketu for spiritual growth','केतु को शांत करता है, आध्यात्मिक विकास के लिए',
    ['Spiritual liberation','Removes Ketu dosha','Psychic abilities','Meditation','Past-life healing'],
    ['आध्यात्मिक मुक्ति','केतु दोष दूर करता है','मानसिक शक्तियां','ध्यान','पूर्व जन्म उपचार'],
    'Panchdhatu','पंचधातु','Tuesday','मंगलवार',
    'Om Ketave Namaha','ॐ केतवे नमः',108,
    ['Wash with Ganga water','Place on grey cloth','Offer durva grass','Light ghee lamp','Chant on Tuesday evening'],
    ['गंगाजल से धोएं','भूरे कपड़े पर रखें','दूर्वा चढ़ाएं','घी का दीप जलाएं','मंगलवार संध्या जाप करें'],
    [500,2000,8000]),

  // ═══ SPECIAL YANTRAS ═══
  yantra('shri_yantra','Shri Yantra','श्री यंत्र',undefined,'Goddess Lakshmi','देवी लक्ष्मी','wealth',
    'Supreme yantra for wealth, prosperity and spiritual enlightenment','धन, समृद्धि और आध्यात्मिक ज्ञान के लिए सर्वोच्च यंत्र',
    ['Immense wealth','Prosperity','Spiritual growth','Material abundance','Divine blessings'],
    ['अपार धन','समृद्धि','आध्यात्मिक विकास','भौतिक प्रचुरता','दिव्य आशीर्वाद'],
    'Gold plated/Crystal','सोने की परत/स्फटिक','Friday','शुक्रवार',
    'Om Shreem Hreem Shreem Kamale Kamalaleyi Praseed Praseed','ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद',108,
    ['Perform Ganesh Puja first','Wash yantra with Panchamrit','Place on red/pink cloth','Offer lotus/red flowers','Light ghee lamp','Chant Lakshmi mantra 108 times'],
    ['पहले गणेश पूजा करें','पंचामृत से यंत्र धोएं','लाल/गुलाबी कपड़े पर रखें','कमल/लाल फूल चढ़ाएं','घी का दीप जलाएं','लक्ष्मी मंत्र 108 बार जाप करें'],
    [1000,5000,25000]),
  yantra('kuber_yantra','Kuber Yantra','कुबेर यंत्र',undefined,'Lord Kuber','भगवान कुबेर','wealth',
    'Attracts wealth and prevents financial loss','धन आकर्षित करता है और आर्थिक हानि रोकता है',
    ['Wealth attraction','Financial stability','Business growth','Prevents losses','Prosperity'],
    ['धन आकर्षण','वित्तीय स्थिरता','व्यापार वृद्धि','हानि से बचाव','समृद्धि'],
    'Gold plated','सोने की परत','Thursday','गुरुवार',
    'Om Shreem Om Hreem Shreem Kuberaya Namaha','ॐ श्रीं ॐ ह्रीं श्रीं कुबेराय नमः',108,
    ['Place in north direction of home/office','Wash with Ganga water','Offer yellow flowers','Light ghee lamp','Chant mantra 108 times on Thursday'],
    ['घर/कार्यालय की उत्तर दिशा में रखें','गंगाजल से धोएं','पीले फूल चढ़ाएं','घी का दीप जलाएं','गुरुवार को 108 बार मंत्र जाप करें'],
    [500,2500,10000]),
  yantra('mahamrityunjaya_yantra','Mahamrityunjaya Yantra','महामृत्युंजय यंत्र',undefined,'Lord Shiva','भगवान शिव','health',
    'Protects from untimely death and diseases','अकाल मृत्यु और रोगों से रक्षा करता है',
    ['Protection from death','Healing diseases','Longevity','Courage','Removes fears'],
    ['मृत्यु से सुरक्षा','रोगों का उपचार','दीर्घायु','साहस','भय दूर करता है'],
    'Silver/Copper','चांदी/तांबा','Monday','सोमवार',
    'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam','ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्',108,
    ['Wash with Ganga water','Place on white cloth','Offer Bilva leaves','Light ghee lamp','Chant Mahamrityunjaya mantra 108 times'],
    ['गंगाजल से धोएं','सफेद कपड़े पर रखें','बिल्व पत्र चढ़ाएं','घी का दीप जलाएं','महामृत्युंजय मंत्र 108 बार जाप करें'],
    [800,3000,12000]),
  yantra('baglamukhi_yantra','Baglamukhi Yantra','बगलामुखी यंत्र',undefined,'Goddess Baglamukhi','देवी बगलामुखी','protection',
    'Victory over enemies and court cases','शत्रुओं और मुकदमों पर विजय',
    ['Victory over enemies','Court case success','Stops slander','Protection from evil','Power of speech'],
    ['शत्रुओं पर विजय','मुकदमे में सफलता','निंदा रोकता है','बुराई से सुरक्षा','वाणी की शक्ति'],
    'Gold plated','सोने की परत','Tuesday','मंगलवार',
    'Om Hleem Baglamukhi Sarvadushtanam Vacham Mukham Padam Stambhaya','ॐ ह्लीं बगलामुखी सर्वदुष्टानां वाचं मुखं पदम् स्तम्भय',108,
    ['Wash with turmeric water','Place on yellow cloth','Offer yellow flowers','Light mustard oil lamp','Chant mantra 108 times on Tuesday'],
    ['हल्दी जल से धोएं','पीले कपड़े पर रखें','पीले फूल चढ़ाएं','सरसों तेल का दीप जलाएं','मंगलवार को 108 बार जाप करें'],
    [800,3000,12000]),
  yantra('saraswati_yantra','Saraswati Yantra','सरस्वती यंत्र',undefined,'Goddess Saraswati','देवी सरस्वती','spiritual',
    'Enhances knowledge, education and wisdom','ज्ञान, शिक्षा और बुद्धि बढ़ाता है',
    ['Education success','Memory enhancement','Artistic talent','Wisdom','Speech improvement'],
    ['शिक्षा में सफलता','स्मृति वृद्धि','कलात्मक प्रतिभा','ज्ञान','वाणी सुधार'],
    'Silver','चांदी','Thursday','गुरुवार',
    'Om Aim Saraswatyai Namaha','ॐ ऐं सरस्वत्यै नमः',108,
    ['Wash with Ganga water','Place on white cloth','Offer white flowers','Light ghee lamp','Chant on Thursday/Basant Panchami'],
    ['गंगाजल से धोएं','सफेद कपड़े पर रखें','सफेद फूल चढ़ाएं','घी का दीप जलाएं','गुरुवार/बसंत पंचमी को जाप करें'],
    [500,2500,10000]),
  yantra('hanuman_yantra','Hanuman Yantra','हनुमान यंत्र',undefined,'Lord Hanuman','भगवान हनुमान','protection',
    'Protection from evil, courage and strength','बुराई से सुरक्षा, साहस और शक्ति',
    ['Protection from evil spirits','Courage','Physical strength','Devotion','Removes Shani effects'],
    ['बुरी आत्माओं से सुरक्षा','साहस','शारीरिक शक्ति','भक्ति','शनि प्रभाव दूर करता है'],
    'Copper','तांबा','Tuesday/Saturday','मंगलवार/शनिवार',
    'Om Hanumate Namaha','ॐ हनुमते नमः',108,
    ['Wash with Ganga water','Place on red cloth','Offer vermilion and jasmine oil','Light ghee lamp','Chant Hanuman Chalisa'],
    ['गंगाजल से धोएं','लाल कपड़े पर रखें','सिंदूर और चमेली तेल चढ़ाएं','घी का दीप जलाएं','हनुमान चालीसा पाठ करें'],
    [500,2000,8000]),
  yantra('gayatri_yantra','Gayatri Yantra','गायत्री यंत्र',undefined,'Goddess Gayatri','देवी गायत्री','spiritual',
    'Supreme spiritual purification and enlightenment','सर्वोच्च आध्यात्मिक शुद्धि और ज्ञान',
    ['Spiritual purification','Intelligence','Divine protection','Removes sins','Inner peace'],
    ['आध्यात्मिक शुद्धि','बुद्धि','दिव्य सुरक्षा','पापों का नाश','आंतरिक शांति'],
    'Gold plated','सोने की परत','Sunday','रविवार',
    'Om Bhur Bhuva Swaha...','ॐ भूर्भुवः स्वः...',108,
    ['Wash with Ganga water','Place facing East','Offer sandalwood paste','Light ghee lamp','Chant Gayatri Mantra 108 times at sunrise'],
    ['गंगाजल से धोएं','पूर्व दिशा में रखें','चंदन का लेप चढ़ाएं','घी का दीप जलाएं','सूर्योदय पर गायत्री मंत्र 108 बार जाप करें'],
    [500,2500,10000]),
  yantra('navgraha_yantra','Navgraha Yantra','नवग्रह यंत्र',undefined,'Nine Planets','नौ ग्रह','planetary',
    'Balances all 9 planets simultaneously','सभी 9 ग्रहों को एक साथ संतुलित करता है',
    ['Overall planetary balance','Removes all planetary doshas','General protection','Holistic remedy','Peace'],
    ['समग्र ग्रह संतुलन','सभी ग्रह दोष दूर करता है','सामान्य सुरक्षा','समग्र उपाय','शांति'],
    'Panchdhatu','पंचधातु','Any auspicious day','कोई भी शुभ दिन',
    'Om Navagraha Devtabhyo Namaha','ॐ नवग्रह देवताभ्यो नमः',108,
    ['Wash with Panchamrit','Place in puja room','Offer flowers of all colors','Light 9 wicks lamp','Chant Navgraha mantra 108 times'],
    ['पंचामृत से धोएं','पूजा कक्ष में रखें','सभी रंगों के फूल चढ़ाएं','9 बत्ती का दीप जलाएं','नवग्रह मंत्र 108 बार जाप करें'],
    [800,3000,15000]),
  yantra('vastu_yantra','Vastu Yantra','वास्तु यंत्र',undefined,'Vastu Purush','वास्तु पुरुष','special',
    'Removes Vastu defects from home/office','घर/कार्यालय के वास्तु दोष दूर करता है',
    ['Removes Vastu dosha','Brings harmony','Positive energy','Prosperity in home','Family peace'],
    ['वास्तु दोष दूर करता है','सामंजस्य लाता है','सकारात्मक ऊर्जा','घर में समृद्धि','पारिवारिक शांति'],
    'Copper','तांबा','Thursday','गुरुवार',
    'Om Vastu Purushaya Namaha','ॐ वास्तु पुरुषाय नमः',108,
    ['Bury in center of plot or hang on wall','Wash with Ganga water','Offer flowers','Light incense','Chant mantra 108 times'],
    ['भूमि के केंद्र में दबाएं या दीवार पर लगाएं','गंगाजल से धोएं','फूल चढ़ाएं','धूप जलाएं','108 बार मंत्र जाप करें'],
    [500,2000,8000]),
  yantra('ganesh_yantra','Ganesh Yantra','गणेश यंत्र',undefined,'Lord Ganesh','भगवान गणेश','special',
    'Removes obstacles and brings success','बाधाएं दूर करता है और सफलता लाता है',
    ['Removes obstacles','New beginnings','Wisdom','Success in ventures','Knowledge'],
    ['बाधाएं दूर करता है','नई शुरुआत','ज्ञान','उपक्रमों में सफलता','विद्या'],
    'Gold plated','सोने की परत','Wednesday','बुधवार',
    'Om Gam Ganapataye Namaha','ॐ गं गणपतये नमः',108,
    ['Wash with Ganga water','Place on red/yellow cloth','Offer modak/ladoo','Light ghee lamp','Chant Ganesh mantra 108 times'],
    ['गंगाजल से धोएं','लाल/पीले कपड़े पर रखें','मोदक/लड्डू चढ़ाएं','घी का दीप जलाएं','गणेश मंत्र 108 बार जाप करें'],
    [500,2500,10000]),
  yantra('durga_yantra','Durga Yantra','दुर्गा यंत्र',undefined,'Goddess Durga','देवी दुर्गा','protection',
    'Protection from enemies and negative forces','शत्रुओं और नकारात्मक शक्तियों से सुरक्षा',
    ['Protection','Courage','Victory','Female empowerment','Removal of negative energy'],
    ['सुरक्षा','साहस','विजय','नारी सशक्तिकरण','नकारात्मक ऊर्जा दूर करता है'],
    'Gold plated/Copper','सोने की परत/तांबा','Tuesday/Friday','मंगलवार/शुक्रवार',
    'Om Dum Durgayai Namaha','ॐ दुं दुर्गायै नमः',108,
    ['Wash with Ganga water','Place on red cloth','Offer red flowers','Light ghee lamp','Chant Durga mantra 108 times'],
    ['गंगाजल से धोएं','लाल कपड़े पर रखें','लाल फूल चढ़ाएं','घी का दीप जलाएं','दुर्गा मंत्र 108 बार जाप करें'],
    [500,2500,10000]),
  yantra('kaal_sarp_yantra','Kaal Sarp Yantra','काल सर्प यंत्र',undefined,'Lord Shiva/Rahu-Ketu','शिव/राहु-केतु','special',
    'Specific remedy for Kaal Sarp Dosha','काल सर्प दोष के विशेष उपाय',
    ['Kaal Sarp dosha remedy','Removes snake-related fears','Career obstacles removed','Relationship harmony','Mental peace'],
    ['काल सर्प दोष उपाय','सर्प संबंधी भय दूर','करियर बाधाएं दूर','रिश्तों में सामंजस्य','मानसिक शांति'],
    'Silver/Panchdhatu','चांदी/पंचधातु','Nag Panchami/Saturday','नाग पंचमी/शनिवार',
    'Om Namah Shivaya','ॐ नमः शिवाय',108,
    ['Wash with milk and Ganga water','Place near Shiva idol','Offer Bilva leaves and milk','Light ghee lamp','Chant mantra 108 times'],
    ['दूध और गंगाजल से धोएं','शिव मूर्ति के पास रखें','बिल्व पत्र और दूध चढ़ाएं','घी का दीप जलाएं','108 बार मंत्र जाप करें'],
    [800,3000,12000]),
  yantra('vyapar_vridhi_yantra','Vyapar Vridhi Yantra','व्यापार वृद्धि यंत्र',undefined,'Lord Ganesh/Lakshmi','गणेश/लक्ष्मी','wealth',
    'Business growth and commercial success','व्यापार वृद्धि और वाणिज्यिक सफलता',
    ['Business growth','Customer attraction','Profit increase','Partnership success','Market expansion'],
    ['व्यापार वृद्धि','ग्राहक आकर्षण','लाभ वृद्धि','साझेदारी सफलता','बाजार विस्तार'],
    'Gold plated','सोने की परत','Thursday','गुरुवार',
    'Om Shreem Hreem Kleem Maha Lakshmyai Namaha','ॐ श्रीं ह्रीं क्लीं महा लक्ष्म्यै नमः',108,
    ['Place in cash register or office','Wash with Ganga water','Offer yellow flowers','Light ghee lamp on Thursday','Chant mantra 108 times'],
    ['कैश रजिस्टर या कार्यालय में रखें','गंगाजल से धोएं','पीले फूल चढ़ाएं','गुरुवार को घी दीप जलाएं','108 बार मंत्र जाप करें'],
    [500,2500,10000]),
  yantra('santan_gopal_yantra','Santan Gopal Yantra','संतान गोपाल यंत्र',undefined,'Lord Krishna','भगवान कृष्ण','special',
    'For blessing of children','संतान प्राप्ति के लिए',
    ['Child blessings','Fertility','Healthy pregnancy','Son/daughter blessing','Family growth'],
    ['संतान आशीर्वाद','प्रजनन क्षमता','स्वस्थ गर्भावस्था','पुत्र/पुत्री आशीर्वाद','परिवार वृद्धि'],
    'Gold plated','सोने की परत','Monday/Thursday','सोमवार/गुरुवार',
    'Om Kleem Devaki Sut Govinda Vasudeva Jagatpate Dehime Tanayam Krishna Tvam Aham Sharanam Gatah','ॐ क्लीं देवकी सुत गोविन्द वासुदेव जगत्पते देहिमे तनयं कृष्ण त्वामहं शरणं गतः',108,
    ['Wash with Panchamrit','Place on yellow cloth','Offer butter and tulsi','Light ghee lamp','Chant Santan Gopal mantra 108 times'],
    ['पंचामृत से धोएं','पीले कपड़े पर रखें','मक्खन और तुलसी चढ़ाएं','घी का दीप जलाएं','संतान गोपाल मंत्र 108 बार जाप करें'],
    [800,3000,12000]),
  yantra('sudarshan_yantra','Sudarshan Yantra','सुदर्शन यंत्र',undefined,'Lord Vishnu','भगवान विष्णु','protection',
    'Supreme protection from all negativity','सभी नकारात्मकता से सर्वोच्च सुरक्षा',
    ['Supreme protection','Removes black magic','Destroys enemies','Divine shield','Spiritual power'],
    ['सर्वोच्च सुरक्षा','काला जादू दूर करता है','शत्रुओं का नाश','दिव्य कवच','आध्यात्मिक शक्ति'],
    'Gold plated/Copper','सोने की परत/तांबा','Thursday','गुरुवार',
    'Om Sudarshanaaya Vidmahe Sahasra-ditaye Dheemahi Tanno Chakra Prachodayat','ॐ सुदर्शनाय विद्महे सहस्रादित्ये धीमही तन्नो चक्रः प्रचोदयात्',108,
    ['Wash with Ganga water','Place in puja room','Offer tulsi and yellow flowers','Light ghee lamp','Chant Sudarshan mantra 108 times'],
    ['गंगाजल से धोएं','पूजा कक्ष में रखें','तुलसी और पीले फूल चढ़ाएं','घी का दीप जलाएं','सुदर्शन मंत्र 108 बार जाप करें'],
    [500,2500,10000]),
];

/**
 * Recommend yantras based on weak planets and doshas
 */
export function recommendYantras(
  weakPlanets: string[],
  doshas: string[]
): YantraInfo[] {
  const recommendations: YantraInfo[] = [];
  
  // Add planetary yantras for weak planets
  weakPlanets.forEach(planet => {
    const planetYantra = YANTRA_DATABASE.find(y => y.planet === planet && y.category === 'planetary');
    if (planetYantra) recommendations.push(planetYantra);
  });

  // Add dosha-specific yantras
  if (doshas.includes('Kaal Sarp')) {
    const ks = YANTRA_DATABASE.find(y => y.id === 'kaal_sarp_yantra');
    if (ks) recommendations.push(ks);
  }
  if (doshas.includes('Manglik')) {
    const mangal = YANTRA_DATABASE.find(y => y.id === 'mangal_yantra');
    if (mangal && !recommendations.includes(mangal)) recommendations.push(mangal);
  }

  // Always recommend Navgraha for overall balance
  const navgraha = YANTRA_DATABASE.find(y => y.id === 'navgraha_yantra');
  if (navgraha && !recommendations.includes(navgraha)) recommendations.push(navgraha);
  
  // Add Shri Yantra for wealth (universal recommendation)
  const shri = YANTRA_DATABASE.find(y => y.id === 'shri_yantra');
  if (shri) recommendations.push(shri);
  
  return recommendations.slice(0, 5); // Top 5 recommendations
}

/**
 * Get yantras by category
 */
export function getYantrasByCategory(category: YantraInfo['category']): YantraInfo[] {
  return YANTRA_DATABASE.filter(y => y.category === category);
}

export default {
  YANTRA_DATABASE,
  recommendYantras,
  getYantrasByCategory
};
