# Week 2 Kickoff - Ascendant & Nakshatra Calculations

**Week**: 2 of 25  
**Date**: March 1, 2026  
**Status**: 🚀 STARTING  
**Focus**: Foundation for House-Based Predictions

---

## 🎯 Week 2 Goals

Implement accurate Ascendant (Lagna) and Nakshatra calculations - the foundation for all advanced astrological predictions.

### Why This Matters
- **Ascendant**: Determines all 12 house positions
- **Nakshatra**: Essential for compatibility, naming, muhurat
- **Foundation**: Required for 90% of advanced features
- **Accuracy**: Must match professional astrology software

---

## 📋 Week 2 Plan

### Day 1-2: Swiss Ephemeris Integration
**Goal**: Set up accurate planetary position calculations

**Tasks**:
- Research Swiss Ephemeris options for JavaScript
- Install and configure library
- Create ephemeris service wrapper
- Test planetary position accuracy
- Handle timezone conversions

**Deliverables**:
- `src/services/ephemerisService.ts`
- Accurate planetary positions
- Timezone handling
- Test script

### Day 3: Ascendant Calculation
**Goal**: Calculate rising sign from birth time/place

**Tasks**:
- Implement Ascendant calculation algorithm
- Calculate all 12 house cusps
- Determine house lords (Bhava Adhipati)
- Validate against known charts
- Add to UI

**Deliverables**:
- `src/services/ascendantService.ts`
- House system implementation
- UI display component
- Validation tests

### Day 4: Nakshatra Calculation
**Goal**: Identify birth star and characteristics

**Tasks**:
- Calculate Moon's precise position
- Determine nakshatra (1 of 27)
- Calculate pada (quarter)
- Determine nakshatra lord
- Create nakshatra database

**Deliverables**:
- `src/services/nakshatraService.ts`
- `src/data/nakshatraData.ts`
- Complete nakshatra characteristics
- UI integration

### Day 5: Testing & Documentation
**Goal**: Ensure accuracy and completeness

**Tasks**:
- Test with all 13 jataks
- Verify against professional software
- Cross-check calculations
- Document methodology
- Update user guides

**Deliverables**:
- Test scripts
- Accuracy report
- Complete documentation
- Week 2 summary

---

## 🔧 Technical Approach

### Swiss Ephemeris Options

**Option 1: swisseph (Node.js binding)**
- Pros: Most accurate, industry standard
- Cons: Native dependency, complex setup

**Option 2: astronomia (Pure JavaScript)**
- Pros: No native dependencies, easier setup
- Cons: Less accurate for precise calculations

**Option 3: astro-seek API**
- Pros: No local calculation needed
- Cons: API dependency, rate limits

**Decision**: Start with astronomia for rapid development, consider swisseph for production accuracy

### Calculation Flow

```
Birth Details (Date, Time, Place)
         ↓
Timezone Conversion (UTC)
         ↓
Julian Day Calculation
         ↓
Swiss Ephemeris Query
         ↓
Planetary Positions (Sidereal)
         ↓
Ayanamsa Correction (Lahiri)
         ↓
Ascendant Calculation
         ↓
House Cusps (Placidus/Equal)
         ↓
Nakshatra Identification
```

---

## 📊 Success Criteria

### Accuracy Requirements
- **Ascendant**: Within 1° of professional software
- **Nakshatra**: Exact match (no margin for error)
- **House Cusps**: Within 1° of professional software
- **Planetary Positions**: Within 0.1° of Swiss Ephemeris

### Validation Method
- Compare with AstroSage calculations
- Cross-check with Jagannatha Hora
- Verify with known birth charts
- Test edge cases (midnight, polar regions)

---

## 🎓 Astrological Background

### Ascendant (Lagna)
- **Definition**: Sign rising on eastern horizon at birth time
- **Importance**: Most important factor in Vedic astrology
- **Determines**: All 12 house positions
- **Changes**: Every 2 hours approximately
- **Accuracy**: Requires exact birth time

### Nakshatra (Birth Star)
- **Definition**: Moon's position in 27 lunar mansions
- **Each Nakshatra**: 13°20' of zodiac
- **4 Padas**: Each pada is 3°20'
- **Importance**: Used in compatibility, naming, muhurat
- **Lord**: Each nakshatra has a planetary lord

### House System
- **Placidus**: Most common in Western astrology
- **Equal House**: Each house is 30° from Ascendant
- **Whole Sign**: Each sign is one house
- **Vedic Preference**: Whole Sign or Equal House

---

## 📚 Resources Needed

### Libraries
- Swiss Ephemeris (or astronomia)
- Timezone database (moment-timezone)
- Date manipulation (date-fns)

### Data
- Ayanamsa values (Lahiri)
- Nakshatra boundaries
- House system algorithms
- Planetary lord mappings

### References
- Brihat Parashara Hora Shastra (BPHS)
- Phaladeepika
- Jataka Parijata
- Modern ephemeris tables

---

## 🚀 Getting Started

### Immediate Next Steps
1. Research Swiss Ephemeris JavaScript libraries
2. Install chosen library
3. Create basic ephemeris service
4. Test planetary position calculation
5. Validate accuracy

### First Implementation
- Start with simple planetary positions
- Add timezone handling
- Implement Ayanamsa correction
- Test with Rajkumar's chart
- Expand to all 13 jataks

---

## 💪 Commitment

**Same Spirit**: Rapid, professional implementations  
**Same Dynamism**: 2-4 hours per major task  
**Same Quality**: Production-ready code  
**Same Documentation**: Comprehensive guides  
**Same Testing**: 100% validation  

---

## 📈 Expected Outcomes

### By End of Week 2
- ✅ Accurate Ascendant calculation
- ✅ Complete Nakshatra identification
- ✅ House system implemented
- ✅ Validated with 13 jataks
- ✅ UI integration complete
- ✅ Documentation comprehensive

### Impact on App
- **Unlocks**: 90% of advanced features
- **Enables**: Compatibility, career, health predictions
- **Foundation**: For Weeks 3-25
- **Value**: Professional-level calculations

---

## 🎯 Week 2 Status

**Status**: 🚀 STARTING  
**Day**: 1 of 5  
**Focus**: Swiss Ephemeris Integration  
**Energy**: HIGH 💪  
**Confidence**: HIGH ✅  

---

**Let's begin Week 2 with the same spirit and dynamism!** 🚀

---

**Document Version**: 1.0  
**Author**: Kiro AI Assistant  
**Date**: March 1, 2026  
**Status**: WEEK 2 KICKOFF
