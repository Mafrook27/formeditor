import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { IoSearch, IoSearchOutline } from "react-icons/io5";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import type { SearchFilterSectionProps } from "./types";

export default function SearchFilterSection({
  isExpanded,
  onToggle,
  filters,
  onFilterChange,
  isSidebarCollapsed,
  onExpandSidebar,
}: SearchFilterSectionProps) {
  const handleCollapsedClick = () => {
    if (onExpandSidebar) {
      onExpandSidebar(); // Expand the sidebar first
    }
    onToggle(); // Then toggle the search section
  };

  if (isSidebarCollapsed) {
    return (
      <div className="flex justify-center items-center px-2">
        <button
          onClick={handleCollapsedClick}
          className="group w-10 h-10 flex items-center justify-center rounded-md transition-colors"
          aria-label="Search"
        >
          <span className="relative w-5 h-5 group-hover:text-blue-600 transition-colors duration-200">
            <IoSearch className="w-5 h-5 text-gray-600 group-hover:text-blue-600 absolute inset-0 group-hover:opacity-0 transition-all duration-200 shake-icon" />
            <IoSearchOutline className="w-5 h-5 text-gray-600 group-hover:text-blue-600 absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 shake-icon" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="px-2 ">
      <CollapsibleTrigger className="group flex items-center justify-between w-full p-2 pl-[14.5px] hover:bg-gray-100 rounded-md transition-colors">
        <div className="flex items-center gap-5 ml-[5px]">
          <span className="relative w-5 h-5 shrink-0 group-hover:text-blue-600 transition-colors duration-200">
            <IoSearch className="w-5 h-5 text-gray-600 group-hover:text-blue-600 absolute inset-0 group-hover:opacity-0 transition-all duration-200 shake-icon" />
            <IoSearchOutline className="w-5 h-5 text-gray-600 group-hover:text-blue-600 absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 shake-icon" />
          </span>
          <span className="text-sm font-medium text-gray-700">Search</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="text"
            placeholder="First Name"
            value={filters.firstName}
            onChange={(e) => onFilterChange("firstName", e.target.value)}
            className="h-9 text-sm col-span-1"
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={filters.lastName}
            onChange={(e) => onFilterChange("lastName", e.target.value)}
            className="h-9 text-sm col-span-1"
          />
        </div>
        <div className="mt-2">
          <Input
            type="email"
            placeholder="Email"
            value={filters.email}
            onChange={(e) => onFilterChange("email", e.target.value)}
            className="h-9 text-sm w-full"
          />
        </div>
        <div className="mt-2">
          <Input
            type="tel"
            placeholder="Phone No"
            value={filters.phoneNo}
            onChange={(e) => onFilterChange("phoneNo", e.target.value)}
            className="h-9 text-sm w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input
            type="text"
            placeholder="Loan ID"
            value={filters.loanId}
            onChange={(e) => onFilterChange("loanId", e.target.value)}
            className="h-9 text-sm col-span-1"
          />
          <Input
            type="text"
            placeholder="Cust ID"
            value={filters.custId}
            onChange={(e) => onFilterChange("custId", e.target.value)}
            className="h-9 text-sm col-span-1"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            type="text"
            placeholder="SSN"
            value={filters.ssn}
            onChange={(e) => onFilterChange("ssn", e.target.value)}
            className="h-9 text-sm  flex-1"
          />

          <Button
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 h-9 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-sm font-medium"
          >
            <IoSearch className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className=" p-0 flex-1 flex items-center justify-center gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
          >
            <Filter className="w-3 h-3" />
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
