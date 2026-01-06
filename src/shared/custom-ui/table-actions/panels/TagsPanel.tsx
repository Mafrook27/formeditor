// 1️⃣ IMPORTS
import { ChevronsUpDown } from "lucide-react";
import { IoPricetag, IoCheckmarkCircle } from "react-icons/io5";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { useTagsSelection } from "../hooks/useTagsSelection";

// 2️⃣ TYPE DEFINITIONS
export interface TagsPanelProps {
  availableTags: string[];
}

// 3️⃣ CONSTANTS
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> =
  {
    Recovery: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    Priority: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    cp: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    VIP: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    Doc: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    LIC_Doc: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    InsTags: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
  };

const DEFAULT_COLOR = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  border: "border-gray-200",
};

// 4️⃣ HELPER FUNCTIONS
const getTagColor = (tag: string) => TAG_COLORS[tag] || DEFAULT_COLOR;

// 5️⃣ COMPONENT DECLARATION
export function TagsPanel({ availableTags }: TagsPanelProps) {
  const {
    selectedTags,
    tagComboOpen,
    setTagComboOpen,
    toggleTag,
    applyTo,
    toggleApplyTo,
  } = useTagsSelection();

  // 6️⃣ JSX RETURN
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <IoPricetag className="h-4 w-4 text-amber-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">Add Tags</h3>
      </div>

      {/* 2 Column Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Column 1: Search Tags + Loan/Customer */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Search Tags
          </Label>
          <Popover open={tagComboOpen} onOpenChange={setTagComboOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={tagComboOpen}
                className="w-full justify-between h-10 text-sm border-gray-200"
              >
                <span className="text-gray-500">Select tags</span>
                <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Search..." className="h-8 text-sm" />
                <CommandList>
                  <CommandEmpty>No tag found.</CommandEmpty>
                  <CommandGroup>
                    {availableTags.map((tag) => {
                      const colors = getTagColor(tag);
                      return (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={toggleTag}
                          className={cn(
                            "cursor-pointer text-sm py-1.5",
                            selectedTags.includes(tag) && colors.bg,
                          )}
                        >
                          <Checkbox
                            checked={selectedTags.includes(tag)}
                            className="mr-2 h-3.5 w-3.5"
                          />
                          <span
                            className={cn(
                              selectedTags.includes(tag) &&
                                `font-medium ${colors.text}`,
                            )}
                          >
                            {tag}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Loan / Customer Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <label
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-all",
                applyTo.includes("loan")
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400",
              )}
            >
              <Checkbox
                checked={applyTo.includes("loan")}
                onCheckedChange={() => toggleApplyTo("loan")}
                className={cn(
                  "h-4 w-4 border-2",
                  applyTo.includes("loan")
                    ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                    : "border-gray-400",
                )}
              />
              <span className="text-sm font-medium">Loan</span>
            </label>

            <label
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-all",
                applyTo.includes("customer")
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-400",
              )}
            >
              <Checkbox
                checked={applyTo.includes("customer")}
                onCheckedChange={() => toggleApplyTo("customer")}
                className={cn(
                  "h-4 w-4 border-2",
                  applyTo.includes("customer")
                    ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-green-600"
                    : "border-gray-400",
                )}
              />
              <span className="text-sm font-medium">Customer</span>
            </label>
          </div>
        </div>

        {/* Column 2: Available Tags */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Available Tags
          </Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50/50 min-h-[80px]">
            {availableTags.map((tag) => {
              const colors = getTagColor(tag);
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all h-fit",
                    isSelected
                      ? `${colors.bg} ${colors.text} ${colors.border} border`
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100",
                  )}
                >
                  {isSelected && <IoCheckmarkCircle className="h-3 w-3" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Summary */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Badge
          variant="secondary"
          className={cn(
            "text-xs",
            selectedTags.length > 0
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-500",
          )}
        >
          {selectedTags.length} selected
        </Badge>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => {
              const colors = getTagColor(tag);
              return (
                <Badge
                  key={tag}
                  className={cn(
                    "cursor-pointer text-xs px-2 py-0.5",
                    colors.bg,
                    colors.text,
                    "border-0",
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ×
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
