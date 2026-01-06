// 1️⃣ IMPORTS
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Label } from "@/shared/components/ui/label";
import { Combobox } from "@/shared/components/ui/combobox";
import {
  IoMail,
  IoChatbubble,
  IoNotifications,
  IoPeople,
} from "react-icons/io5";
import { cn } from "@/shared/lib/utils";
import type {
  Template,
  CommunicationMode,
} from "../types/action-container.types";

// 2️⃣ TYPE DEFINITIONS
export interface CommsPanelProps {
  templates: Template[];
  selectedCount: number;
  commsTemplate: {
    commMode: CommunicationMode;
    setCommMode: (mode: CommunicationMode) => void;
    templateId: string;
    setTemplateId: (id: string) => void;
  };
}

interface ModeOptionProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ HELPER COMPONENT
function ModeOption({ id, icon, label, isSelected }: ModeOptionProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-3 px-3 h-[52px] rounded-lg border cursor-pointer transition-all",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <RadioGroupItem value={id} id={id} className="sr-only" />
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500",
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          isSelected ? "text-blue-700" : "text-gray-700",
        )}
      >
        {label}
      </span>
    </label>
  );
}

// 5️⃣ MAIN COMPONENT
export function CommsPanel({
  templates,
  selectedCount,
  commsTemplate,
}: CommsPanelProps) {
  const { commMode, setCommMode, templateId, setTemplateId } = commsTemplate;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <IoChatbubble className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">
          Send Communication
        </h3>
      </div>

      {/* 3 Column Grid - Properly Aligned */}
      <div className="grid grid-cols-3 gap-6">
        {/* Column 1: Communication Mode */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Communication Mode
          </Label>
          <RadioGroup
            value={commMode}
            onValueChange={(v) => setCommMode(v as CommunicationMode)}
            className="space-y-2"
          >
            <ModeOption
              id="email"
              icon={<IoMail className="h-4 w-4" />}
              label="Email"
              isSelected={commMode === "email"}
            />
            <ModeOption
              id="sms"
              icon={<IoChatbubble className="h-4 w-4" />}
              label="SMS"
              isSelected={commMode === "sms"}
            />
            <ModeOption
              id="push"
              icon={<IoNotifications className="h-4 w-4" />}
              label="Push Notification"
              isSelected={commMode === "push"}
            />
          </RadioGroup>
        </div>

        {/* Column 2: Select Template */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Select Template
          </Label>
          <div className="space-y-2">
            <Combobox
              options={templates.map((t) => ({ value: t.id, label: t.name }))}
              value={templateId}
              onValueChange={setTemplateId}
              placeholder="Choose a template..."
              searchPlaceholder="Search templates..."
              emptyText="No templates found."
              className="w-full h-[52px]"
              showCheck={false}
            />
            <p className="text-xs text-gray-400">
              Select a pre-configured message template
            </p>
          </div>
        </div>

        {/* Column 3: Recipients */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Recipients
          </Label>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 h-[52px]">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <IoPeople className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-700 leading-tight">
                {selectedCount}
              </p>
              <p className="text-[10px] text-indigo-500">Selected customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
