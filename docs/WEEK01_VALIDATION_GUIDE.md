# Vedic Rajkumar Validation Suite - Usage Guide

## Overview

The validation suite is a comprehensive accuracy testing system for the Vedic Rajkumar astrology engine. It validates calculated chart outputs against pre-verified reference values for 15 known charts, providing automated quality assurance for planetary calculations.

## Status

✅ **WEEK 01: IMPLEMENTED AND OPERATIONAL**  
✅ **WEEK 02: EXTENDED WITH HOUSE CUSPS AND ANTARDASHA VALIDATION**

### Week 01 Status
- ✅ All 15 reference charts defined with complete expected values
- ✅ Vitest suite runs via `npm run validate:accuracy` without errors
- ✅ 14/15 charts pass all rashi-level checks (exceeds 12/15 target)
- ✅ Clear mismatch reporting with calculated vs expected values
- ✅ Suite completes in ~30ms (well under 2000ms target)
- ✅ 0 rashi-level failures (99.5% field accuracy)
- ✅ Reports written to `dist/accuracy-report.txt` and `dist/accuracy-summary.json`
- ✅ Rerunnable in CI via npm script

### Week 02 Extensions
- ✅ House cusp validation for angular houses (1st, 4th, 7th, 10th)
- ✅ Antardasha lord validation for Vimshottari system
- ✅ Intelligent mismatch cause analysis
- ✅ Extended field coverage (14-20 fields per chart)
- ✅ 99.6% field accuracy maintained
- ✅ 155 total tests (up from 141)

## Quick Start

### Running the Validation Suite

```bash
npm run validate:accuracy
```

This command:
- Runs the full validation suite against all 15 reference charts
- Generates human-readable report to `dist/accuracy-report.txt`
- Generates JSON summary to `dist/accuracy-summary.json`
- Provides console output with pass/fail status

### Understanding the Output

#### Console Output
The console shows detailed test results with per-chart validation:
- ✅ PASS: All fields within tolerance
- ⚠️ WARN: Some fields exceed tolerance but not critically
- ❌ FAIL: Critical mismatches (rashi failures)

#### Text Report (`dist/accuracy-report.txt`)
A comprehensive side-by-side comparison showing:
- Calculated vs expected values for each field
- Delta (difference) values where applicable
- Per-chart status summaries
- Overall suite statistics

#### JSON Summary (`dist/accuracy-summary.json`)
Machine-readable summary containing:
- Overall pass/fail/warn statistics
- Field accuracy percentage
- Week 1 verdict (PASS/FAIL)
- Per-chart breakdown with failure details

## Validation Fields

### Week 01 Fields (Core)
For each chart, the following fields are validated:

1. **Ayanamsa** - Lahiri ayanamsa value (±0.05° tolerance)
2. **Ascendant Rashi** - Lagna sign (exact match required)
3. **Planet Rashis** - All 9 planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu)
4. **Moon Nakshatra** - Nakshatra name (exact match required)
5. **Moon Pada** - Nakshatra pada (exact match, ±1 acceptable for border cases)
6. **Dasha Seed Lord** - Vimshottari dasha starting lord (exact match required)
7. **Dasha Balance Days** - Days remaining in first dasha period (±3 days tolerance)

### Week 02 Extensions (Extended Charts)
For 6 extended reference charts, additional fields are validated:

8. **House Cusps** - Angular house rashis (1st, 4th, 7th, 10th houses)
9. **First Antardasha Lord** - Correct antardasha sequence in Vimshottari system
10. **Mismatch Cause Analysis** - Intelligent analysis of validation failures

## Reference Charts

The suite includes 15 diverse reference charts:

| ID | Name | Date | Purpose |
|----|------|------|---------|
| REF-001 | Priyansh Singh Chauhan | 2000-10-26 | Personal reference |
| REF-002 | Swami Vivekananda | 1863-01-12 | Historical 19th century |
| REF-003 | Mahatma Gandhi | 1869-10-02 | Historical 19th century |
| REF-004 | Albert Einstein | 1879-03-14 | Western timezone + historical |
| REF-005 | Narendra Modi | 1950-09-17 | Modern 20th century |
| REF-006 | Rajkumar | 1963-09-15 | Core personal reference |
| REF-007 | Jawaharlal Nehru | 1889-11-14 | Late night birth, historical |
| REF-008 | Indira Gandhi | 1917-11-19 | Late night birth |
| REF-009 | Sachin Tendulkar | 1973-04-24 | Known modern chart |
| REF-010 | Lata Mangeshkar | 1929-09-28 | Mid-period accuracy |
| REF-011 | Amitabh Bachchan | 1942-10-11 | WWII era |
| REF-012 | Atal Bihari Vajpayee | 1924-12-25 | Early AM birth |
| REF-013 | Veerpratap Singh Rathore | 2011-09-18 | Verified test case |
| REF-014 | Vishwaraj Singh Chauhan | 1994-09-26 | Early AM birth |
| REF-015 | Mummy (Rajkumar mother) | 1947-09-05 | Early AM, Partition era |

## Current Results

### Latest Run (2026-09-05)

- **Total Charts**: 15
- **Pass Charts**: 14
- **Warn Charts**: 1 (REF-001 - dasha_balance_days tolerance issue)
- **Fail Charts**: 0
- **Field Accuracy**: 99.5%
- **Week 1 Verdict**: ✅ PASS

### Performance
- **Execution Time**: ~30ms (target: <2000ms)
- **Test Count**: 141 tests (141 passed)

## Integration with CI

The validation suite is designed for continuous integration:

```json
{
  "scripts": {
    "validate:accuracy": "vitest run src/tests/validation/accuracySuite.test.ts --reporter=verbose"
  }
}
```

### CI Integration Example

```yaml
# Example GitHub Actions workflow
- name: Run Accuracy Validation
  run: npm run validate:accuracy
  
- name: Upload Validation Reports
  uses: actions/upload-artifact@v3
  with:
    name: accuracy-reports
    path: dist/accuracy-*.txt dist/accuracy-*.json
```

## Architecture

### Core Components

1. **Reference Data** (`src/tests/validation/referenceCharts.ts`)
   - Contains 15 reference charts with expected values
   - Includes birth data, location, and validated expected outputs

2. **Validation Engine** (`src/tests/validation/accuracyValidator.ts`)
   - Tolerance-based comparison logic
   - Per-field validation with PASS/WARN/FAIL status
   - Suite-level aggregation and statistics

3. **Report Formatter** (`src/tests/validation/reportFormatter.ts`)
   - Human-readable text report generation
   - JSON summary generation
   - Console output formatting

4. **Test Suite** (`src/tests/validation/accuracySuite.test.ts`)
   - Vitest test orchestration
   - Automated report generation
   - CI-friendly assertions

### Calculation Engine

The validation suite uses the precision ephemeris service:
- **Primary**: `precisionEphemerisService.ts` (Meeus full perturbation + Lahiri ayanamsa)
- **Accuracy**: Planet positions ±0.5-1°, Moon ±0.05°, Ayanamsa ±0.05°

## Tolerance Policy

| Field | Tolerance | Rationale |
|-------|-----------|-----------|
| Rashi (sign) | Exact match | No tolerance - sign must be correct |
| Planet degree | ±1.0° | Covers minor ayanamsa variations |
| Nakshatra | Exact match | No tolerance - nakshatra must be correct |
| Nakshatra pada | Exact match (±1 border) | Borderline cases allow ±1 |
| Dasha balance | ±3 days | Accounts for Julian Day precision |
| Ayanamsa | ±0.05° | High precision requirement |

## Troubleshooting

### Common Issues

1. **WARN on dasha_balance_days**
   - Expected: Tolerance ±3 days
   - Current behavior: Some charts show larger deltas
   - Action: Monitor for Week 2 investigation

2. **Timezone Handling**
   - Pre-1947 Indian charts use IST (UTC+5:30)
   - Some sources may use LMT
   - Action: Document timezone assumptions

3. **Ascendant Sensitivity**
   - Ascendant is sensitive to exact birth time
   - Charts with uncertain times are flagged
   - Action: Review time precision for critical charts

## Future Enhancements (Week 2+)

Planned expansions for subsequent weeks:
- House cusps validation
- More planetary checkpoints
- Extended dasha validation points
- Divisional charts (D9, D10)
- Ashtakavarga scores
- Shadbala calculations

## Maintenance

### Adding New Reference Charts

To add a new reference chart:

1. Generate expected values using trusted sources (Astro.com, JHora, AstroSage)
2. Add to `REFERENCE_CHARTS` array in `referenceCharts.ts`
3. Include all required fields (date, time, location, expected values)
4. Run validation suite to verify
5. Update documentation

### Updating Tolerances

To adjust validation tolerances:

1. Modify constants in `accuracyValidator.ts`
2. Update tolerance policy documentation
3. Re-run validation suite
4. Document rationale for changes

## Contact & Support

For questions or issues with the validation suite:
- Review the specification: `docs/ACCURACY_VALIDATION_SPEC.md`
- Check reference data: `src/tests/validation/referenceCharts.ts`
- Examine validation logic: `src/tests/validation/accuracyValidator.ts`

## Conclusion

The Week 01 validation suite provides a solid foundation for ongoing quality assurance of the Vedic Rajkumar astrology engine. With 99.5% field accuracy and 0 rashi failures, it meets all acceptance criteria and is ready for production use and CI integration.