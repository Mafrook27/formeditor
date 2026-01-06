/**
 * Shared types for ActionContainer and its panels
 */

export interface ColumnConfig {
  id: string;
  header: string;
  visible?: boolean;
}

export interface Template {
  id: string;
  name: string;
}

export type PanelType = "columns" | "tags" | "comms" | null;

export type CommunicationMode = "email" | "sms" | "push";

export type ApplyToType = "loan" | "customer";

export interface TagsApplyData {
  tags: string[];
  applyTo: ApplyToType[];
}

export interface ActionContainerProps {
  activePanel: PanelType;
  onClose: () => void;
  // Column props
  columns?: ColumnConfig[];
  onColumnApply?: (
    order: string[],
    visibility: Record<string, boolean>,
  ) => void;
  // Tags props
  availableTags?: string[];
  selectedCount?: number;
  onTagsApply?: (data: TagsApplyData) => void;
  // Comms props
  templates?: Template[];
  commMode?: CommunicationMode;
  onCommModeChange?: (mode: CommunicationMode) => void;
  onCommsApply?: (templateId: string, mode: CommunicationMode) => void;
}
