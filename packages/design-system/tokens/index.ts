// SRJ Sarathi Design System — Token Foundation
// Brand: SRJ Steel | Connect | Collaborate | Grow
// Primary: Orange (#F97316), Text: Near-black (#1A1A1A), BG: Off-white (#F8F7F4)

export const colors = {
  // Brand
  primary:          '#F97316',
  primaryHover:     '#EA6C0A',
  primaryPressed:   '#C85D08',
  primaryLight:     '#FEF3E8',
  primaryBorder:    '#FDBA74',

  // Neutral
  black:            '#1A1A1A',
  white:            '#FFFFFF',
  bgPage:           '#F8F7F4',   // off-white page background
  bgSurface:        '#FFFFFF',   // card / panel
  bgSurfaceHover:   '#F4F3F0',
  bgSubtle:         '#F1F0ED',
  bgOverlay:        'rgba(0,0,0,0.45)',

  // Text
  textPrimary:      '#1A1A1A',
  textSecondary:    '#4B4B4B',
  textTertiary:     '#757575',
  textDisabled:     '#ABABAB',
  textInverse:      '#FFFFFF',
  textOnPrimary:    '#FFFFFF',

  // Border
  borderDefault:    '#E2E0DC',
  borderStrong:     '#C4C1BA',
  borderFocus:      '#F97316',

  // Sidebar
  sidebarBg:        '#1A1A1A',
  sidebarText:      '#D4D0C8',
  sidebarTextHover: '#FFFFFF',
  sidebarActive:    '#F97316',
  sidebarActiveBg:  'rgba(249,115,22,0.15)',
  sidebarSection:   '#6B6B6B',

  // Semantic
  success:          '#16A34A',
  successLight:     '#F0FDF4',
  successBorder:    '#86EFAC',

  warning:          '#D97706',
  warningLight:     '#FFFBEB',
  warningBorder:    '#FCD34D',

  danger:           '#DC2626',
  dangerLight:      '#FEF2F2',
  dangerBorder:     '#FCA5A5',

  info:             '#2563EB',
  infoLight:        '#EFF6FF',
  infoBorder:       '#93C5FD',

  neutral:          '#6B7280',
  neutralLight:     '#F9FAFB',
  neutralBorder:    '#D1D5DB',
} as const;

export const spacing = {
  0:    '0px',
  1:    '4px',
  2:    '8px',
  3:    '12px',
  4:    '16px',
  5:    '20px',
  6:    '24px',
  8:    '32px',
  10:   '40px',
  12:   '48px',
  16:   '64px',
  20:   '80px',
} as const;

export const radius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl':'20px',
  full: '9999px',
} as const;

export const fontSize = {
  xs:   '11px',
  sm:   '13px',
  base: '14px',
  md:   '15px',
  lg:   '16px',
  xl:   '18px',
  '2xl':'20px',
  '3xl':'24px',
  '4xl':'28px',
  '5xl':'32px',
} as const;

export const fontWeight = {
  regular: '400',
  medium:  '500',
  semibold:'600',
  bold:    '700',
  black:   '900',
} as const;

export const shadow = {
  sm:  '0 1px 2px 0 rgba(0,0,0,0.05)',
  md:  '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.05)',
  lg:  '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
  xl:  '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03)',
} as const;

export const breakpoints = {
  xs:  360,
  sm:  640,
  md:  1024,
  lg:  1280,
  xl:  1536,
} as const;

export const zIndex = {
  base:     0,
  dropdown: 100,
  sticky:   200,
  overlay:  300,
  modal:    400,
  toast:    500,
} as const;

// Status → semantic color mapping
export const statusColor: Record<string, keyof typeof colors> = {
  ACTIVE:                 'success',
  COMPLETED:              'success',
  APPROVED:               'success',
  IMPLEMENTED:            'success',
  CLOSED:                 'success',
  PENDING:                'warning',
  IN_PROGRESS:            'warning',
  UNDER_REVIEW:           'warning',
  ON_HOLD:                'warning',
  DRAFT:                  'neutral',
  CANCELLED:              'neutral',
  ARCHIVED:               'neutral',
  INACTIVE:               'neutral',
  REJECTED:               'danger',
  AT_RISK:                'danger',
  OVERDUE:                'danger',
  BLOCKED:                'danger',
  PLANNED:                'info',
  ASSIGNED:               'info',
  ACKNOWLEDGED:           'info',
};
