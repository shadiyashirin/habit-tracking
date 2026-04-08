export const COLORS = {
  // Brand
  primary:       '#1D9E75',
  primaryLight:  '#E1F5EE',
  primaryDark:   '#0F6E56',

  // Habit colors
  teal:          '#1D9E75',
  tealLight:     '#E1F5EE',
  purple:        '#534AB7',
  purpleLight:   '#EEEDFE',
  coral:         '#D85A30',
  coralLight:    '#FAECE7',
  blue:          '#378ADD',
  blueLight:     '#E6F1FB',
  amber:         '#BA7517',
  amberLight:    '#FAEEDA',
  green:         '#639922',
  greenLight:    '#EAF3DE',

  // Neutrals
  bg:            '#F7F6F2',
  bgCard:        '#FFFFFF',
  bgMuted:       '#FAFAF8',
  border:        '#ECEAE3',
  borderLight:   '#F0EFEA',

  // Text
  text:          '#2C2C2A',
  textSecondary: '#888780',
  textMuted:     '#AAAAAA',
  textWhite:     '#FFFFFF',

  // Dark mode
  dark: {
    bg:          '#141412',
    bgCard:      '#1E1E1C',
    bgMuted:     '#1A1A18',
    border:      '#2A2A28',
    text:        '#E0E0DA',
    textSecondary: '#888780',
  },
}

export const HABIT_COLORS = {
  teal:   { main: COLORS.teal,   light: COLORS.tealLight },
  purple: { main: COLORS.purple, light: COLORS.purpleLight },
  coral:  { main: COLORS.coral,  light: COLORS.coralLight },
  blue:   { main: COLORS.blue,   light: COLORS.blueLight },
  amber:  { main: COLORS.amber,  light: COLORS.amberLight },
  green:  { main: COLORS.green,  light: COLORS.greenLight },
}

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 999,
}

export const FONT = {
  sizes: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   22,
    xxl:  28,
    xxxl: 34,
  },
  weights: {
    regular: '400',
    medium:  '500',
    semibold:'600',
    bold:    '700',
    heavy:   '800',
  },
}
