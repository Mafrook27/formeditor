// 1️⃣ IMPORTS
import React, { useState } from "react";
import { Plus, RotateCcw, ChevronDown, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

// 2️⃣ TYPE DEFINITIONS
export interface EditSheetField {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  options?: { value: string; label: string }[];
  editable?: boolean;
  placeholder?: string;
  required?: boolean;
}

interface EditSheetProps<T extends Record<string, unknown>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  data?: T | null;
  fields: EditSheetField[];
  onSave: (data: T) => void;
  onReset?: () => void;
  mode?: "edit" | "add";
  saveButtonText?: string;
  saveButtonIcon?: React.ReactNode;
  showResetButton?: boolean;
  width?: string;
}

interface EditSheetFormProps<T extends Record<string, unknown>> {
  data?: T | null;
  fields: EditSheetField[];
  onSave: (data: T) => void;
  onReset?: () => void;
  onClose: () => void;
  mode?: "edit" | "add";
  saveButtonText?: string;
  saveButtonIcon?: React.ReactNode;
  showResetButton?: boolean;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT HELPER
function EditSheetForm<T extends Record<string, unknown>>({
  data,
  fields,
  onSave,
  onReset,
  onClose,
  mode = "edit",
  saveButtonText,
  saveButtonIcon,
  showResetButton = false,
}: EditSheetFormProps<T>) {
  // 5️⃣ STATE
  const getInitialData = (): T => {
    if (data) return { ...data };
    const emptyData: Record<string, unknown> = {};
    fields.forEach((field) => {
      emptyData[field.key] = field.type === "number" ? 0 : "";
    });
    return emptyData as T;
  };

  const [formData, setFormData] = useState<T>(getInitialData);

  // 6️⃣ REFS - None
  // 7️⃣ CUSTOM HOOKS - None

  // 8️⃣ DERIVED VALUES
  // Check if all fields are checkboxes
  const allCheckboxes = fields.every((f) => f.type === "checkbox");

  // 9️⃣ EFFECTS - None

  // 🔟 HANDLER FUNCTIONS
  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData(getInitialData());
    onReset?.();
  };

  // 1️⃣1️⃣ RENDER HELPERS
  const renderField = (field: EditSheetField) => {
    const value = formData[field.key];
    const isEditable = field.editable !== false;

    if (field.type === "select" && field.options) {
      return (
        <div className="relative">
          <select
            id={field.key}
            value={String(value ?? "")}
            onChange={(e) => handleChange(field.key, e.target.value)}
            disabled={!isEditable}
            className="w-full h-10 sm:h-12 px-3 sm:px-4 pr-10 text-sm bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          id={field.key}
          value={String(value ?? "")}
          onChange={(e) => handleChange(field.key, e.target.value)}
          disabled={!isEditable}
          placeholder={field.placeholder}
          rows={4}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            id={field.key}
            checked={value === true || value === "true"}
            onChange={(e) =>
              handleChange(field.key, e.target.checked ? "true" : "false")
            }
            disabled={!isEditable}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
        </label>
      );
    }

    return (
      <Input
        id={field.key}
        type={field.type || "text"}
        value={String(value ?? "")}
        onChange={(e) =>
          handleChange(
            field.key,
            field.type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
        disabled={!isEditable}
        placeholder={field.placeholder}
        className="h-10 sm:h-12 px-3 sm:px-4 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
      />
    );
  };

  // 1️⃣2️⃣ JSX RETURN
  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {allCheckboxes ? (
          // Grid layout for checkbox-only forms
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {fields.map((field) => {
              const value = formData[field.key];
              const isEditable = field.editable !== false;
              return (
                <label
                  key={field.key}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={field.key}
                    checked={value === true || value === "true"}
                    onChange={(e) =>
                      handleChange(
                        field.key,
                        e.target.checked ? "true" : "false",
                      )
                    }
                    disabled={!isEditable}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {field.label}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          // Standard layout for mixed fields
          <div className="space-y-4 sm:space-y-6">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.type === "checkbox" ? "" : "space-y-2"}
              >
                {field.type !== "checkbox" && (
                  <Label
                    htmlFor={field.key}
                    className="text-sm font-medium text-gray-700 block"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                )}
                {renderField(field)}
              </div>
            ))}
          </div>
        )}
      </div>

      <SheetFooter className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 sm:gap-3 w-full flex-nowrap">
          <Button
            variant="default"
            onClick={handleSave}
            className="cursor-pointer flex-1 min-w-0 h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            {saveButtonIcon ||
              (mode === "add" ? (
                <Plus size={16} className="mr-1 sm:mr-2" />
              ) : null)}
            <span className="truncate">
              {saveButtonText ||
                (mode === "add" ? "Add Notes" : "Save Changes")}
            </span>
          </Button>

          {showResetButton && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="cursor-pointer h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
              title="Reset"
            >
              <RotateCcw size={18} className="sm:size-5" />
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
            title="Close"
          >
            <X size={18} className="sm:size-5" />
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}

// 4️⃣ MAIN COMPONENT DECLARATION
export function EditSheet<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  data,
  fields,
  onSave,
  onReset,
  mode = "edit",
  saveButtonText,
  saveButtonIcon,
  showResetButton = false,
  width = "w-full sm:w-[520px] md:w-[560px]",
}: EditSheetProps<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`${width} max-w-full flex flex-col h-full bg-gray-50 border-l border-gray-200`}
      >
        <SheetHeader className="shrink-0 px-4 py-4 sm:px-6 sm:py-6 bg-white border-b border-gray-200">
          <SheetTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-xs sm:text-sm text-gray-600 mt-1">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        {open && (
          <EditSheetForm
            data={data}
            fields={fields}
            onSave={onSave}
            onReset={onReset}
            onClose={() => onOpenChange(false)}
            mode={mode}
            saveButtonText={saveButtonText}
            saveButtonIcon={saveButtonIcon}
            showResetButton={showResetButton}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

// 5️⃣ EXPORT
export default EditSheet;
