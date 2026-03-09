# Week 2 Testing Guide

**Purpose**: Manual testing guide for Ascendant and Nakshatra calculations

---

## 🧪 Quick Test (5 minutes)

### Test Case 1: Rajkumar (Primary User)
1. Open the application in browser
2. Enter birth details:
   - **Date**: 1963-09-15
   - **Time**: 06:00
   - **Location**: Aspur (or type and select from dropdown)
3. Click "Calculate" or submit
4. **Expected Results**:
   - Ascendant card should appear with 🌅 icon
   - Shows rashi name and degrees
   - Nakshatra card should appear with ⭐ icon
   - Shows nakshatra name, pada, lord, symbol
5. Toggle language to Hindi
6. Verify Hindi translations display correctly

### Test Case 2: Priyanka Jain (Wife)
1. Click "Enter new details"
2. Enter birth details:
   - **Date**: 1984-10-23
   - **Time**: 05:50
   - **Location**: Ahmedabad
3. Submit and verify cards appear
4. Check different rashi/nakshatra than Test Case 1

---

## 🔍 Comprehensive Test (30 minutes)

### All 13 Jataks from Database

Test each jatak from `jataks/JATAKS_DATABASE.json`:

| # | Name | Date | Time | Location | Expected |
|---|------|------|------|----------|----------|
| 1 | Pankaj Jain | 1979-07-28 | 23:50 | Dungarpur | Ascendant + Nakshatra |
| 2 | Priyansh Singh | 2000-10-26 | 00:50 | Indore | Ascendant + Nakshatra |
| 3 | Vishwaraj Singh | 1994-09-26 | 02:17 | Indore | Ascendant + Nakshatra |
| 4 | Mummy | 1947-09-05 | 05:00 | Nandli | Ascendant + Nakshatra |
| 5 | Rajkumar | 1963-09-15 | 06:00 | Aspur | Ascendant + Nakshatra |
| 6 | Kanchi Jain | 2004-09-08 | 01:05 | Aspur | Ascendant + Nakshatra |
| 7 | Kiwangi Jain | 2010-12-21 | 10:10 | Idar | Ascendant + Nakshatra |
| 8 | Priyanka Jain | 1984-10-23 | 05:50 | Ahmedabad | Ascendant + Nakshatra |
| 9 | Ajit Singh | 1975-09-07 | 05:35 | Banswara | Ascendant + Nakshatra |
| 10 | Hunar Jain | 1996-09-09 | 12:47 | Dungarpur | Ascendant + Nakshatra |
| 11 | Bittu Son | 2021-05-02 | 05:45 | Banswara | Ascendant + Nakshatra |
| 12 | Naman Shah | 1997-03-29 | 03:32 | Partapur | Ascendant + Nakshatra |
| 13 | Jaya Sisodia | 1994-06-25 | 11:00 | Indore | Ascendant + Nakshatra |

### For Each Jatak, Verify:
- ✅ Ascendant card displays
- ✅ Rashi name is valid (Aries to Pisces)
- ✅ Degrees are between 0-30
- ✅ Nakshatra card displays
- ✅ Nakshatra name is valid (1 of 27)
- ✅ Pada is between 1-4
- ✅ Lord is valid planet name
- ✅ Symbol is displayed
- ✅ Hindi translation works
- ✅ No console errors

---

## 🎨 UI/UX Testing

### Visual Design
- ✅ Ascendant card has blue/primary gradient
- ✅ Nakshatra card has purple/secondary gradient
- ✅ Icons are visible (🌅 and ⭐)
- ✅ Text is readable on gradient backgrounds
- ✅ Cards are side-by-side on desktop
- ✅ Cards stack vertically on mobile

### Responsive Design
1. **Desktop (1920×1080)**:
   - Cards should be side-by-side
   - Each card ~50% width with gap
   - All text readable

2. **Tablet (768×1024)**:
   - Cards should be side-by-side
   - Slightly narrower
   - All text readable

3. **Mobile (375×667)**:
   - Cards should stack vertically
   - Full width
   - All text readable

### Language Toggle
1. Start in English
2. Click language toggle to Hindi
3. Verify:
   - "Ascendant (Lagna)" → "लग्न (Ascendant)"
   - "Nakshatra (Birth Star)" → "नक्षत्र (Birth Star)"
   - Rashi names translate
   - Nakshatra names translate
   - "Pada" → "पाद"
   - "Lord" → "स्वामी"
   - "Symbol" → "प्रतीक"

---

## 🔬 Accuracy Verification

### Cross-Check with Professional Software

#### AstroSage (Online)
1. Go to https://www.astrosage.com/free-kundali.asp
2. Enter same birth details
3. Compare:
   - Ascendant rashi (should match ±1 rashi due to ±2-3° accuracy)
   - Nakshatra (should match exactly)
   - Pada (should match exactly)

#### Jagannatha Hora (Desktop)
1. Open Jagannatha Hora software
2. Enter birth details
3. Compare Ascendant and Nakshatra
4. Note any differences

#### Expected Accuracy
- **Ascendant**: ±2-3 degrees (may be different rashi at cusp)
- **Nakshatra**: Exact match (Moon position is more accurate)
- **Pada**: Exact match

---

## 🐛 Error Testing

### Edge Cases

#### Test 1: Invalid Location
1. Enter birth details with unknown location
2. Should use default coordinates (Gujarat: 23.0°N, 72.0°E)
3. Calculations should still work

#### Test 2: Midnight Birth
1. Enter time: 00:00
2. Should calculate correctly
3. No errors in console

#### Test 3: Noon Birth
1. Enter time: 12:00
2. Should calculate correctly
3. Different Ascendant than midnight

#### Test 4: Location with Coordinates
1. Enter location: "Mumbai (19.08, 72.88)"
2. Should parse coordinates correctly
3. Use parsed coordinates for calculation

---

## 📊 Performance Testing

### Load Time
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check:
   - ✅ Page loads in <2 seconds
   - ✅ No failed requests
   - ✅ Bundle size reasonable

### Calculation Speed
1. Open browser DevTools (F12)
2. Go to Console tab
3. Enter birth details and submit
4. Check console for timing logs
5. Expected: <100ms for all calculations

---

## ✅ Success Criteria

### Must Pass (Critical)
- ✅ All 13 jataks calculate without errors
- ✅ Ascendant displays for all jataks
- ✅ Nakshatra displays for all jataks
- ✅ No console errors
- ✅ Build successful

### Should Pass (Important)
- ✅ Hindi translation works correctly
- ✅ Responsive design works on mobile
- ✅ Calculations match professional software (±2-3°)
- ✅ UI is visually appealing
- ✅ Performance is fast (<100ms)

### Nice to Have (Optional)
- ✅ Smooth animations
- ✅ Tooltips for additional info
- ✅ Print-friendly layout
- ✅ Keyboard navigation

---

## 🚨 Known Limitations

### Accuracy
- Using simplified algorithms (not Swiss Ephemeris)
- Ascendant accuracy: ±2-3 degrees
- May differ from professional software at rashi cusps
- Equal House system only (no Placidus, Koch, etc.)

### Features Not Yet Implemented
- Planetary positions (Week 3)
- Planetary aspects (Week 3)
- Divisional charts (Future)
- Dasha calculations (Future)

---

## 📝 Bug Reporting

If you find any issues, note:
1. **What you did**: Steps to reproduce
2. **What happened**: Actual result
3. **What you expected**: Expected result
4. **Browser**: Chrome, Firefox, Safari, etc.
5. **Device**: Desktop, tablet, mobile
6. **Screenshot**: If visual issue

---

## 🎉 Testing Complete!

Once all tests pass:
1. ✅ Mark Week 2 as complete
2. ✅ Update documentation
3. ✅ Commit changes to git
4. ✅ Deploy to production (optional)
5. ✅ Start Week 3 planning

**Next**: Week 3 - Planetary Positions & Aspects
