# PDF Export Feature Guide

## Overview
The app now includes a professional PDF export feature that generates landscape-oriented transit reports with complete tabulated data.

## Features

### PDF Layout
- **Orientation**: Landscape (A4)
- **Format**: Professional table with color-coded results
- **Sections**:
  1. Header with title and subtitle
  2. Birth details and transit date
  3. Comprehensive transit table
  4. Overall score summary
  5. Interpretation guidance
  6. Disclaimer footer

### Table Columns
1. **Planet** (ग्रह) - Planet name with symbol
2. **Current Sign** (वर्तमान राशि) - Rashi with symbol
3. **House** (भाव) - House number from Moon
4. **Base** (मूल) - Base favorable/unfavorable status
5. **Vedha?** (वेध?) - Obstruction check (Yes/No)
6. **Effective Status** (प्रभावी स्थिति) - Final status after Vedha
7. **+/-** - Score contribution (+1 or 0)
8. **Rating** (अंक) - Individual rating out of 9
9. **Key Effect** (मुख्य प्रभाव) - Detailed effect description

### Color Coding
- **Green**: Favorable status, +1 score
- **Red**: Unfavorable status
- **Yellow**: Mixed status (Vedha obstruction)
- **Gray**: 0 score contribution

## How to Use

### In the App
1. Enter birth details and submit
2. View transit results
3. Click "Export PDF" button (top right of table)
4. PDF downloads automatically

### File Naming
Format: `Gochar_Phal_[BirthDate]_[TransitDate].pdf`
Example: `Gochar_Phal_1963-09-15_2026-02-23.pdf`

## Example: Rajkumar's Transit Report

### Birth Details
- **Date**: 15 September 1963
- **Time**: 6:00 AM
- **Place**: Udaipur, Rajasthan
- **Moon Sign**: Cancer (Karka) ♋

### Transit Date
23 February 2026, 02:11 PM IST

### Planetary Positions (Sidereal/Lahiri)

| Planet | Current Sign | House from Moon | Base Status | Vedha? | Effective Status | Score | Rating |
|--------|-------------|-----------------|-------------|--------|------------------|-------|--------|
| ☉ Sun | ♒ Aquarius | 8th | Unfavorable | No | Unfavorable | 0 | 3/9 |
| ☽ Moon | ♈ Aries | 10th | Favorable | No | Favorable | +1 | 7/9 |
| ☿ Mercury | ♒ Aquarius | 8th | Favorable | No | Favorable | +1 | 7/9 |
| ♀ Venus | ♒ Aquarius | 8th | Favorable | No | Favorable | +1 | 7/9 |
| ♂ Mars | ♑ Capricorn | 7th | Unfavorable | No | Unfavorable | 0 | 3/9 |
| ♃ Jupiter | ♊ Gemini | 12th | Unfavorable | No | Unfavorable | 0 | 4/9 |
| ♄ Saturn | ♓ Pisces | 9th | Unfavorable | No | Unfavorable | 0 | 3/9 |
| ☊ Rahu | ♒ Aquarius | 8th | Unfavorable | No | Unfavorable | 0 | 3/9 |
| ☋ Ketu | ♌ Leo | 2nd | Unfavorable | No | Unfavorable | 0 | 3/9 |

### Overall Score: 3/9

**Interpretation**: 3 planets in effectively favorable position (without Vedha). Exercise caution; spiritual activities recommended. Heavy 8th house emphasis suggests focus on introspection and avoiding major risks.

### Key Observations

1. **8th House Cluster**: Sun, Mercury, Venus, Rahu all in 8th house
   - Indicates transformative period
   - Caution with health, finances, secrets
   - Potential for hidden insights

2. **Moon in 10th**: Only strong favorable transit
   - Career/professional matters supported
   - Short-term (Moon moves fast)

3. **Jupiter in 12th**: Expenses, spiritual focus
   - Good for meditation, charity
   - Watch spending

4. **Mars in 7th**: Partnership caution
   - Avoid confrontations
   - Be diplomatic

### Recommendations
- Focus on career opportunities (Moon 10th)
- Practice caution with finances (8th house emphasis)
- Good time for spiritual practices
- Avoid major decisions or risks
- Be patient with delays (Saturn 9th)

## Technical Details

### Dependencies
- `jspdf`: PDF generation library
- `jspdf-autotable`: Table plugin for jsPDF

### Installation
```bash
npm install jspdf jspdf-autotable
```

### Implementation Files
- `src/services/pdfExportService.ts` - PDF generation logic
- `src/components/TransitTable.tsx` - Export button integration
- `src/pages/Index.tsx` - Data passing

### Customization Options

You can customize the PDF by modifying `pdfExportService.ts`:

1. **Colors**: Change RGB values in color coding section
2. **Fonts**: Modify font sizes and styles
3. **Layout**: Adjust column widths in `columnStyles`
4. **Content**: Add/remove sections as needed

### Language Support
- Full bilingual support (English/Hindi)
- Automatic font selection based on language
- Proper Unicode rendering for Devanagari script

## Troubleshooting

### PDF Not Downloading
- Check browser popup blocker
- Ensure birth data and transit date are available
- Check browser console for errors

### Layout Issues
- Landscape orientation is fixed
- Table auto-adjusts to content
- Long text wraps automatically

### Font Issues
- Hindi text uses system fonts
- Ensure proper Unicode support
- Some symbols may vary by system

## Future Enhancements

Potential improvements:
1. Add chart/graph visualizations
2. Include Ashtakavarga scores
3. Add Dasha period information
4. Multi-page support for detailed analysis
5. Custom branding/logo support
6. Email delivery option

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all required data is present
3. Test with different browsers
4. Check PDF viewer compatibility
