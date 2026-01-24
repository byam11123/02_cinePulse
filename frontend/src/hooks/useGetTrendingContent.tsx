import { useEffect, useState } from "react";
import { useContentStore } from "../store/content";
import apiClient from "../utils/apiClient";
import type { ContentItem } from "../types";

const useGetTrendingContent = () => {
  const [trendingContent, setTrendingContent] = useState<ContentItem | null>(null);
  const { contentType } = useContentStore();

  useEffect(() => {
    const getTrendingContent = async () => {
      const res = await apiClient.get(`/${contentType}/trending`);
      setTrendingContent(res.data.content);
    };
    getTrendingContent();
  }, [contentType]);

  return { trendingContent };
};

export default useGetTrendingContent;
