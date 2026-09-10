# Week 6: Accessibility and Mobile-Friendly Presentation Research

## Executive Summary
This research focuses on the usability of dense astrological data—such as birth charts (Kundli), timelines (Dashas), and comparison views (Ashtakavarga / Kundli Milan)—on small screens and across varied interaction methods (including keyboards and screen readers). Our goal is to avoid desktop-only design thinking and improve inclusiveness for all users of Vedic_Rajkumar.

## 1. Chart Interaction Patterns for Keyboard Use
Astrological charts (like the North/South Indian style Kundli) are highly visual and complex. To make them keyboard accessible:

*   **Roving Tabindex:** Instead of placing every house or planet in the tab order, use a roving tabindex. Only the chart container or the "active" house is focusable via the `Tab` key. Once focused, users can use arrow keys to navigate between houses (Bhavas).
*   **Focus Indicators:** Ensure that the currently focused house or planetary grouping has a distinct, high-contrast visual outline.
*   **Descriptive Labels (ARIA):** Treat each house/segment as a distinct interactive element (e.g., `role="button"` or `role="group"`) with an `aria-label` that announces the data (e.g., "First House, Ascendant, contains Sun and Mercury").
*   **Keyboard Shortcuts:** Provide quick shortcuts (e.g., pressing `A` to jump to Ascendant, `M` for Moon sign) and document them via a screen-reader-only accessible dialogue or visible tooltip.

## 2. Mobile Presentation Patterns for Dense Data
Mobile screens struggle with wide, multi-column tables (e.g., Dasha timelines or planetary dignities). Forcing horizontal scrolling can be a frustrating experience.

*   **Table-to-Card Conversion:** On mobile breakpoints, convert dense rows (like a Vimshottari Dasha sequence) into vertical "cards". For example, instead of a table row `[Planet] | [Start Date] | [End Date] | [Age]`, stack the data vertically:
    **Jupiter Mahadasha**
    *Start:* 12 Jan 2024
    *End:* 12 Jan 2040
    *Age:* 30 - 46
*   **Expandable Sections (Progressive Disclosure):** For nested data like Antardasha (sub-periods) within Mahadasha, use collapsible accordions (`<details>`/`<summary>` or accessible custom accordions). Avoid loading all granular data at once on a small screen.
*   **Data Alternatives:** Provide an alternative accessible data table format or a "Download as CSV" option for users who cannot easily digest complex SVG/Canvas charts on their devices.

## 3. Practical Accessibility Upgrades for Astrology Interfaces
To guide the next UI polish pass, we recommend the following practical upgrades:

*   **Semantic HTML for Timelines:** Use `<ol>` (ordered lists) for chronologically ordered Dasha periods so that screen readers announce the total number of periods and the current position.
*   **Color Contrast & Reliance:** Never rely *only* on color to convey astrological meaning (e.g., red for malefic, green for benefic). Use icons or text labels (e.g., ⚠️ for malefic, ✅ for benefic) alongside colors. Ensure a minimum 4.5:1 contrast ratio.
*   **Skip Links:** Add a "Skip to Chart" or "Skip to Interpretations" link at the top of the page so keyboard/screen reader users can bypass repetitive header or form data and get straight to the astrological insights.
*   **Touch Targets:** Ensure all tappable elements on mobile (like selecting a specific planet to see its details) have a minimum touch target size of 44x44 CSS pixels.

## Conclusion & Next Steps
By implementing roving focus for our SVG charts, converting data tables to cards on mobile, and ensuring we don't rely solely on color for astrological dignities, we can make Vedic_Rajkumar a much more robust and inclusive product. 

These recommendations should be incorporated into the upcoming UI polish cycle, prioritizing the Dasha timelines and the main Birth Chart SVGs.
