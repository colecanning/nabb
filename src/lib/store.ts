import { create } from 'zustand';

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

