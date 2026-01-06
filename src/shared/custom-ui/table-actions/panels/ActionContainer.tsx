// 1️⃣ IMPORTS
import { Button } from "@/shared/components/ui/button";
import type { ActionContainerProps } from "../types/action-container.types";
import { ColumnConfigPanel } from "./ColumnConfigPanel";
import { TagsPanel } from "./TagsPanel";
import { CommsPanel } from "./CommsPanel";
import { useColumnManagement } from "../hooks/useColumnManagement";
import { useTagsSelection } from "../hooks/useTagsSelection";
import { useCommsTemplate } from "../hooks/useCommsTemplate";

// 2️⃣ TYPE DEFINITIONS - from types file

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * ActionContainer - Unified panel for columns, tags, and communication
 */
export function ActionContainer({
  activePanel,
  onClose,
  columns = [],
  onColumnApply,
  availableTags = [],
  selectedCount = 0,
  onTagsApply,
  templates = [],
  onCommsApply,
}: ActionContainerProps) {
  // 5️⃣ INITIALIZE HOOKS
  // Initialize all hooks (only active panel's hook will be used)
  const columnManagement = useColumnManagement(columns);
  const tagsSelection = useTagsSelection();
  const commsTemplate = useCommsTemplate();

  // 6️⃣ REFS - None

  // 7️⃣ EFFECTS - None

  // 8️⃣ HANDLERS
  const handleSubmit = () => {
    if (activePanel === "columns" && onColumnApply) {
      const visibility = columns.reduce(
        (acc, col) => ({
          ...acc,
          [col.id]: columnManagement.activeColumns.includes(col.id),
        }),
        {},
      );
      onColumnApply(columnManagement.activeColumns, visibility);
    } else if (activePanel === "tags" && onTagsApply) {
      onTagsApply({
        tags: tagsSelection.selectedTags,
        applyTo: tagsSelection.applyTo,
      });
      tagsSelection.clearTags();
    } else if (
      activePanel === "comms" &&
      onCommsApply &&
      commsTemplate.templateId
    ) {
      onCommsApply(commsTemplate.templateId, commsTemplate.commMode);
      commsTemplate.clearTemplate();
    }
    onClose();
  };

  // 9️⃣ EARLY RETURN
  if (!activePanel) return null;

  // 🔟 JSX RETURN
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
      {/* Panel Content */}
      <div className="p-5">
        {/* Render appropriate panel based on activePanel */}
        {activePanel === "columns" && (
          <ColumnConfigPanel
            columns={columns}
            columnManagement={columnManagement}
          />
        )}

        {activePanel === "tags" && <TagsPanel availableTags={availableTags} />}

        {activePanel === "comms" && (
          <CommsPanel
            templates={templates}
            selectedCount={selectedCount}
            commsTemplate={commsTemplate}
          />
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="flex gap-3 justify-end px-5 py-3 bg-gray-50 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700 gap-1.5"
        >
          <span className="text-red-500">✕</span> Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            (activePanel === "tags" &&
              (tagsSelection.selectedTags.length === 0 ||
                tagsSelection.applyTo.length === 0)) ||
            (activePanel === "comms" && !commsTemplate.templateId)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {activePanel === "comms" ? "Preview & Send" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
