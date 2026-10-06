/**
 * Warm dashboard theme tokens.
 * Coral/beige palette inspired by modern ed-tech dashboards.
 */

export const LIGHT_THEME = {
  bgPrimary: '#FFF5ED',
  bgSurface: '#FFFFFF',
  bgSubtle: '#FFF0E5',
  coral: '#FF6B6B',
  coralLight: '#FFE0E0',
  coralDark: '#E85555',
  coralBg: '#FFF0F0',
  textPrimary: '#2D2D2D',
  textSecondary: '#6B6B6B',
  textMuted: '#9E9E9E',
  border: '#F0E0D0',
  borderLight: '#FAE8DD',
  shadow: 'rgba(45, 20, 10, 0.06)',
  shadowCoral: 'rgba(255, 107, 107, 0.15)',
} as const

export const DARK_THEME = {
  bgPrimary: '#0F172A',
  bgSurface: '#1E293B',
  bgSubtle: '#1a2332',
  coral: '#FF6B6B',
  coralLight: '#FFE0E0',
  coralDark: '#E85555',
  coralBg: 'rgba(255, 107, 107, 0.1)',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  borderLight: '#2D3A4D',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowCoral: 'rgba(255, 107, 107, 0.2)',
} as const

export function getPhaseColor(phaseId: string, theme: typeof LIGHT_THEME | typeof DARK_THEME = LIGHT_THEME) {
  const map: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'phase-1': { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE', dot: '#3B82F6' },
    'phase-2': { bg: '#F5F3FF', text: '#8B5CF6', border: '#DDD6FE', dot: '#8B5CF6' },
    'phase-3': { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A', dot: '#F59E0B' },
    'phase-4': { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0', dot: '#10B981' },
  }
  if (theme === DARK_THEME) {
    return {
      'phase-1': { bg: 'rgba(59,130,246,0.1)', text: '#60A5FA', border: 'rgba(59,130,246,0.2)', dot: '#3B82F6' },
      'phase-2': { bg: 'rgba(139,92,246,0.1)', text: '#A78BFA', border: 'rgba(139,92,246,0.2)', dot: '#8B5CF6' },
      'phase-3': { bg: 'rgba(245,158,11,0.1)', text: '#FBBF24', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B' },
      'phase-4': { bg: 'rgba(16,185,129,0.1)', text: '#34D399', border: 'rgba(16,185,129,0.2)', dot: '#10B981' },
    }[phaseId]
  }
  return map[phaseId] || map['phase-1']
}

export const DIFFICULTY_COLORS = {
  Beginner: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  Intermediate: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  Advanced: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
} as const
