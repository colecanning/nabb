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
  setInstagramData: (data: { videoUrl?: string; title?: string; description?: string }) => void;
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
  transcription: string;
  transcribing: boolean;
  setTranscription: (transcription: string) => void;
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

interface FinalResult {
  videoUrl?: string;
  title?: string;
  description?: string;
  audioTranscription?: string;
  matchedInstagramUrl?: string;
}

interface FinalResultState {
  finalResult: FinalResult;
  setFinalResult: (result: FinalResult | ((prev: FinalResult) => FinalResult)) => void;
  updateFinalResult: (updates: Partial<FinalResult>) => void;
  resetFinalResult: () => void;
}

export const useFinalResultStore = create<FinalResultState>((set) => ({
  finalResult: {},
  setFinalResult: (result) => set((state) => ({
    finalResult: typeof result === 'function' ? result(state.finalResult) : result,
  })),
  updateFinalResult: (updates) => set((state) => ({
    finalResult: { ...state.finalResult, ...updates },
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
  title?: string;
  description?: string;
  videoUrl?: string;
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

