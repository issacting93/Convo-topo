/**
 * GenUI Type Definitions
 * 
 * Simplified type definitions for GenUI integration.
 * These match the types from GenUI/src/types.ts
 */

export interface ColorTokens {
  mode: 'light' | 'dark';
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

export interface TypographyTokens {
  scale: 'compact' | 'standard' | 'large';
  weight: 'regular' | 'medium' | 'bold';
  style: 'functional' | 'technical' | 'conversational' | 'friendly';
  fontFamily: string;
}

export interface DesignTokens {
  aesthetic: { density: string; decoration: string; depth: string };
  color: ColorTokens;
  typography: TypographyTokens;
  spacing: { rhythm: string; unit: number };
  motion: { enabled: boolean; duration: number; easing?: string };
  borders: string;
  shadows: string;
}

export interface InteractionContract {
  primaryMode: string;
  navigation: string;
  feedback: string;
  affordances: {
    keyboard: boolean;
    hover: string;
    click: string;
    scroll: string;
  };
}

export interface VisualLanguage {
  id: string;
  name: string;
  zone: string;
  epistemicPosture: string;
  cognitiveContract: string;
  tokens: DesignTokens;
  interaction: InteractionContract;
  components: string[];
  absences: string[];
}

export interface UserProfile {
  name: string;
  primaryZone: string;
  movement: string;
  intensity: string;
  linguisticStyle: string;
  diversity: string;
  temporalOrientation: string;
  conversations: number;
  recentTopics: string[];
}

export interface TraceStep {
  step: string;
  action: string;
  modifier?: string;
  result?: any;
}

