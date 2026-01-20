import { create } from "zustand";
import type { ContentState } from "../types";

export const useContentStore = create<ContentState>()((set) => ({
  contentType: "movie",
  setContentType: (type: string) => set({ contentType: type }),
}));
