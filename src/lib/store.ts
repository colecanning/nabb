import { WebhookOutput } from '@/app/api/test-webhook/route';
import { create } from 'zustand';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
  duration?: string | null;
  thumbnail?: string | null;
  raw?: any;
}

interface InstagramWebhookDataState {
  videoUrl: string;
  titleText: string;
  descriptionText?: string;
  setVideoUrl: (url: string) => void;
  setTitleText: (title: string) => void;
  setDescriptionText: (description: string) => void;
  setInstagramData: (data: { videoUrl?: string | null; title?: string | null; description?: string | null }) => void;
  reset: () => void;
}

export const useInstagramWebhookDataStore = create<InstagramWebhookDataState>((set) => ({
  videoUrl: '',
  titleText: '',
  descriptionText: '',
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTitleText: (title) => set({ titleText: title }),
  setDescriptionText: (description) => set({ descriptionText: description }),
  setInstagramData: (data) => set({
    videoUrl: data.videoUrl || '',
    titleText: data.title || '',
    descriptionText: data.description || '',
  }),
  reset: () => set({
    videoUrl: '',
    titleText: '',
    descriptionText: '',
  }),
}));

interface VideoDurationState {
  videoDuration: number | null;
  setVideoDuration: (duration: number | null) => void;
  reset: () => void;
}

export const useVideoDurationStore = create<VideoDurationState>((set) => ({
  videoDuration: null,
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  reset: () => set({ videoDuration: null }),
}));

interface TranscriptionState {
  transcription: string | null;
  transcribing: boolean;
  setTranscription: (transcription: string | null) => void;
  setTranscribing: (transcribing: boolean) => void;
  reset: () => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  transcription: '',
  transcribing: false,
  setTranscription: (transcription) => set({ transcription }),
  setTranscribing: (transcribing) => set({ transcribing }),
  reset: () => set({ transcription: '', transcribing: false }),
}));

// interface FinalResult {
//   videoUrl?: string;
//   title?: string;
//   description?: string;
//   audioTranscription?: string;
//   matchedInstagramUrl?: string;
// }

// Deep partial type helper for nested objects
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

interface FinalResultState {
  finalResult: WebhookOutput;
  setFinalResult: (result: WebhookOutput | ((prev: WebhookOutput) => WebhookOutput)) => void;
  updateFinalResult: (updates: DeepPartial<WebhookOutput>) => void;
  resetFinalResult: () => void;
}

// Deep merge utility for nested objects
const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

export const useFinalResultStore = create<FinalResultState>((set) => ({
  finalResult: {},
  setFinalResult: (result) => set((state) => ({
    finalResult: typeof result === 'function' ? result(state.finalResult) : result,
  })),
  updateFinalResult: (updates) => set((state) => ({
    finalResult: deepMerge(state.finalResult, updates),
  })),
  resetFinalResult: () => set({ finalResult: {} }),
}));

interface SearchResultsState {
  searchResults: SearchResult[] | null;
  searching: boolean;
  setSearchResults: (results: SearchResult[] | null) => void;
  setSearching: (searching: boolean) => void;
  reset: () => void;
}

export const useSearchResultsStore = create<SearchResultsState>((set) => ({
  searchResults: null,
  searching: false,
  setSearchResults: (results) => set({ searchResults: results }),
  setSearching: (searching) => set({ searching }),
  reset: () => set({ searchResults: null, searching: false }),
}));

export interface MatchedResult extends SearchResult {
  matchScore: number;
  durationScore: number;
  titleScore: number;
}

interface MatchResultsState {
  matchedResult: MatchedResult | null;
  findingMatch: boolean;
  setMatchedResult: (result: MatchedResult | null) => void;
  setFindingMatch: (finding: boolean) => void;
  reset: () => void;
}

export const useMatchResultsStore = create<MatchResultsState>((set) => ({
  matchedResult: null,
  findingMatch: false,
  setMatchedResult: (result) => set({ matchedResult: result }),
  setFindingMatch: (finding) => set({ findingMatch: finding }),
  reset: () => set({ matchedResult: null, findingMatch: false }),
}));

export interface ScrapedMatchData {
  success?: boolean;
  title?: string | null;
  description?: string | null;
  videoUrl?: string | null;
  error?: string;
  debug?: any;
}

interface ScrapeMatchState {
  scrapedMatchData: ScrapedMatchData | null;
  scrapingMatch: boolean;
  setScrapedMatchData: (data: ScrapedMatchData | null) => void;
  setScrapingMatch: (scraping: boolean) => void;
  reset: () => void;
}

export const useScrapeMatchStore = create<ScrapeMatchState>((set) => ({
  scrapedMatchData: null,
  scrapingMatch: false,
  setScrapedMatchData: (data) => set({ scrapedMatchData: data }),
  setScrapingMatch: (scraping) => set({ scrapingMatch: scraping }),
  reset: () => set({ scrapedMatchData: null, scrapingMatch: false }),
}));

