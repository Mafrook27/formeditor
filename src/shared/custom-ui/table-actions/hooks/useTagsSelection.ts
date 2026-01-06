import { useState, useCallback } from "react";

export type ApplyToType = "loan" | "customer";

export function useTagsSelection() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagComboOpen, setTagComboOpen] = useState(false);
  const [applyTo, setApplyTo] = useState<ApplyToType[]>(["loan"]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const toggleApplyTo = useCallback((type: ApplyToType) => {
    setApplyTo((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTags([]);
    setApplyTo(["loan"]);
  }, []);

  return {
    selectedTags,
    tagComboOpen,
    setTagComboOpen,
    toggleTag,
    clearTags,
    applyTo,
    toggleApplyTo,
  };
}
