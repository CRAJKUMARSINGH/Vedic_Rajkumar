/**
 * Vedic Rajkumar Design System
 * Comprehensive design tokens and utilities for consistent UI/UX
 */

// ==================== COLOR SYSTEM ====================

export const colors = {
  // Primary Colors
  primary: {
    50: 'hsl(30, 90%, 95%)',
    100: 'hsl(30, 85%, 90%)',
    200: 'hsl(30, 80%, 80%)',
    300: 'hsl(30, 75%, 70%)',
    400: 'hsl(30, 70%, 60%)',
    500: 'hsl(30, 85%, 52%)', // Primary
    600: 'hsl(30, 80%, 45%)',
    700: 'hsl(30, 75%, 40%)',
    800: 'hsl(30, 70%, 35%)',
    900: 'hsl(30, 65%, 30%)',
  },

  // Secondary Colors
  secondary: {
    50: 'hsl(240, 40%, 95%)',
    100: 'hsl(240, 35%, 90%)',
    200: 'hsl(240, 30%, 80%)',
    300: 'hsl(240, 25%, 70%)',
    400: 'hsl(240, 20%, 60%)',
    500: 'hsl(240, 40%, 25%)', // Secondary
    600: 'hsl(240, 35%, 22%)',
    700: 'hsl(240, 30%, 20%)',
    800: 'hsl(240, 25%, 18%)',
    900: 'hsl(240, 20%, 15%)',
  },

  // Accent Colors
  accent: {
    50: 'hsl(15, 90%, 95%)',
    100: 'hsl(15, 85%, 90%)',
    200: 'hsl(15, 80%, 80%)',
    300: 'hsl(15, 75%, 70%)',
    400: 'hsl(15, 70%, 60%)',
    500: 'hsl(15, 75%, 55%)', // Accent
    600: 'hsl(15, 70%, 50%)',
    700: 'hsl(15, 65%, 45%)',
    800: 'hsl(15, 60%, 40%)',
    900: 'hsl(15, 55%, 35%)',
  },

  // Semantic Colors
  semantic: {
    success: {
      light: 'hsl(145, 60%, 40%)',
      DEFAULT: 'hsl(145, 55%, 35%)',
      dark: 'hsl(145, 50%, 30%)',
    },
    warning: {
      light: 'hsl(40, 80%, 50%)',
      DEFAULT: 'hsl(40, 75%, 45%)',
      dark: 'hsl(40, 70%, 40%)',
    },
    error: {
      light: 'hsl(0, 65%, 50%)',
      DEFAULT: 'hsl(0, 60%, 45%)',
      dark: 'hsl(0, 55%, 40%)',
    },
    info: {
      light: 'hsl(210, 70%, 50%)',
      DEFAULT: 'hsl(210, 65%, 45%)',
      dark: 'hsl(210, 60%, 40%)',
    },
  },

  // Vedic Colors
  vedic: {
    gold: 'hsl(42, 90%, 55%)',
    saffron: 'hsl(25, 90%, 55%)',
    indigo: 'hsl(240, 45%, 20%)',
    turmeric: 'hsl(45, 85%, 50%)',
    sandalwood: 'hsl(35, 40%, 70%)',
    lotus: 'hsl(330, 60%, 50%)',
  },

  // Neutral Colors
  neutral: {
    50: 'hsl(35, 30%, 97%)',
    100: 'hsl(35, 25%, 95%)',
    200: 'hsl(35, 20%, 90%)',
    300: 'hsl(35, 15%, 85%)',
    400: 'hsl(35, 10%, 75%)',
    500: 'hsl(35, 5%, 60%)',
    600: 'hsl(35, 10%, 45%)',
    700: 'hsl(35, 15%, 35%)',
    800: 'hsl(35, 20%, 25%)',
    900: 'hsl(35, 25%, 15%)',
  },
};

// ==================== TYPOGRAPHY ====================

export const typography = {
  // Font Families
  fonts: {
    heading: "'Crimson Pro', serif",
    body: "'Inter', sans-serif",
    hindi: "'Noto Sans Devanagari', sans-serif",
    code: "'JetBrains Mono', monospace",
  },

  // Font Sizes (rem)
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },

  // Line Heights
  lineHeights: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Font Weights
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// ==================== SPACING ====================

export const spacing = {
  // Spacing Scale (rem)
  scale: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
    40: '10rem',     // 160px
    48: '12rem',     // 192px
    64: '16rem',     // 256px
  },

  // Container Widths
  containers: {
    xs: '20rem',     // 320px
    sm: '24rem',     // 384px
    md: '28rem',     // 448px
    lg: '32rem',     // 512px
    xl: '36rem',     // 576px
    '2xl': '42rem',  // 672px
    '3xl': '48rem',  // 768px
    '4xl': '56rem',  // 896px
    '5xl': '64rem',  // 1024px
    '6xl': '72rem',  // 1152px
    '7xl': '80rem',  // 1280px
  },
};

// ==================== BORDER RADIUS ====================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  full: '9999px',
};

// ==================== SHADOWS ====================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// ==================== ANIMATIONS ====================

export const animations = {
  durations: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  
  easings: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// ==================== BREAKPOINTS ====================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ==================== Z-INDEX ====================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  return color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
}

/**
 * Get responsive class
 */
export function responsive(breakpoint: keyof typeof breakpoints, className: string): string {
  return `${breakpoint}:${className}`;
}

/**
 * Get spacing value
 */
export function space(value: keyof typeof spacing.scale): string {
  return spacing.scale[value];
}

/**
 * Get font size
 */
export function fontSize(size: keyof typeof typography.sizes): string {
  return typography.sizes[size];
}

/**
 * Get border radius
 */
export function rounded(radius: keyof typeof borderRadius): string {
  return borderRadius[radius];
}

// ==================== COMPONENT TOKENS ====================

export const components = {
  button: {
    sizes: {
      sm: {
        padding: `${spacing.scale[2]} ${spacing.scale[3]}`,
        fontSize: typography.sizes.sm,
        borderRadius: borderRadius.DEFAULT,
      },
      md: {
        padding: `${spacing.scale[3]} ${spacing.scale[4]}`,
        fontSize: typography.sizes.base,
        borderRadius: borderRadius.DEFAULT,
      },
      lg: {
        padding: `${spacing.scale[4]} ${spacing.scale[6]}`,
        fontSize: typography.sizes.lg,
        borderRadius: borderRadius.md,
      },
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[500],
        color: 'white',
        hover: {
          backgroundColor: colors.primary[600],
        },
        focus: {
          ringColor: colors.primary[500],
        },
      },
      secondary: {
        backgroundColor: colors.secondary[500],
        color: 'white',
        hover: {
          backgroundColor: colors.secondary[600],
        },
        focus: {
          ringColor: colors.secondary[500],
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        border: `1px solid ${colors.neutral[300]}`,
        hover: {
          backgroundColor: colors.neutral[100],
        },
        focus: {
          ringColor: colors.neutral[300],
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.neutral[700],
        hover: {
          backgroundColor: colors.neutral[100],
        },
        focus: {
          ringColor: colors.neutral[300],
        },
      },
    },
  },

  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
      padding: spacing.scale[6],
    },
    elevated: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      padding: spacing.scale[6],
    },
    flat: {
      backgroundColor: colors.neutral[50],
      borderRadius: borderRadius.lg,
      padding: spacing.scale[6],
    },
  },

  input: {
    base: {
      backgroundColor: 'white',
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.DEFAULT,
      padding: `${spacing.scale[3]} ${spacing.scale[4]}`,
      fontSize: typography.sizes.base,
      focus: {
        borderColor: colors.primary[500],
        ringColor: colors.primary[500],
      },
      error: {
        borderColor: colors.semantic.error.DEFAULT,
        ringColor: colors.semantic.error.DEFAULT,
      },
    },
  },
};

// ==================== EXPORT ====================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  components,
  withOpacity,
  responsive,
  space,
  fontSize,
  rounded,
};