import { useEffect, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";
import type { ContentItem } from "../types";

const useGetTrendingContent = () => {
  const [trendingContent, setTrendingContent] = useState<ContentItem | null>(null);
  const { contentType } = useContentStore();

  useEffect(() => {
    const getTrendingContent = async () => {
      const res = await axios.get(`/api/v1/${contentType}/trending`);
      setTrendingContent(res.data.content);
    };
    getTrendingContent();
  }, [contentType]);

  return { trendingContent };
};

export default useGetTrendingContent;
