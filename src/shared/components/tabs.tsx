import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { LucideIcon } from "lucide-react";

type TabItem = {
  name: string;
  value: string;
  icon: LucideIcon;
};

type TabsWithIconProps = {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
};

const TabsWithIcon = ({ tabs, defaultValue, className }: TabsWithIconProps) => {
  return (
    <div
      className={`w-full  flex justify-center ${className || ""}`}
      style={{ marginTop: -10 }}
    >
      <Tabs defaultValue={defaultValue ?? tabs[0]?.value}>
        <TabsList className="bg-muted p-1 rounded-lg flex justify-center">
          {tabs.map(({ icon: Icon, name, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                flex items-center gap-1 px-2
                data-[state=active]:bg-white 
                data-[state=active]:text-foreground
                data-[state=active]:shadow-sm
              "
            >
              <Icon className="h-4 w-4" />
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabsWithIcon;
