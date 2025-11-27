export interface SplitSheet {
  trackTitle: string;
  artistName: string;
  isrc?: string;
  contributors: Contributor[];
  metadata?: {
    generated?: string;
    template?: string;
    version?: string;
  };
}

export interface Contributor {
  name: string;
  percentage: number;
  role: 'Composer' | 'Lyricist' | 'Producer' | 'Other';
  email?: string;
  samroNumber?: string;
}

export interface SAMROFormData {
  trackInfo: {
    title: string;
    artist: string;
    isrc: string;
  };
  contributors: Contributor[];
  completion: string[];
}