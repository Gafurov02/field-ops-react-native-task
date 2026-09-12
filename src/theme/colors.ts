export type ThemeMode = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  danger: string;
  warning: string;
  success: string;
  overlay: string;
  mapFallback: string;
}

const light: Palette = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EFF3F8',
  text: '#172033',
  textMuted: '#627089',
  border: '#DCE3EE',
  primary: '#1267E8',
  primaryPressed: '#0D54C3',
  primarySoft: '#E8F0FF',
  danger: '#C92B3C',
  warning: '#AD6B00',
  success: '#16794A',
  overlay: 'rgba(23, 32, 51, 0.35)',
  mapFallback: '#D9E9DE',
};

const dark: Palette = {
  background: '#111827',
  surface: '#1B2537',
  surfaceMuted: '#253248',
  text: '#F6F8FC',
  textMuted: '#ABB9CF',
  border: '#34445D',
  primary: '#6BA4FF',
  primaryPressed: '#8AB8FF',
  primarySoft: '#1C365F',
  danger: '#FF8A99',
  warning: '#F4BA62',
  success: '#72D49A',
  overlay: 'rgba(0, 0, 0, 0.5)',
  mapFallback: '#294238',
};

export const getPalette = (mode: ThemeMode): Palette => (mode === 'dark' ? dark : light);
