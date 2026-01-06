import { useState, useCallback } from "react";
import type { CommunicationMode } from "../types/action-container.types";

export function useCommsTemplate() {
  const [commMode, setCommMode] = useState<CommunicationMode>("email");
  const [templateId, setTemplateId] = useState("");

  const clearTemplate = useCallback(() => {
    setTemplateId("");
  }, []);

  return {
    commMode,
    setCommMode,
    templateId,
    setTemplateId,
    clearTemplate,
  };
}
