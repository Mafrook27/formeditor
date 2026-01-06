import { useLocation, useNavigate } from "react-router-dom";
import {
  IoHome,
  IoHomeOutline,
  IoSettings,
  IoSettingsOutline,
  IoMail,
  IoMailOutline,
  IoChatbubble,
  IoChatbubbleOutline,
  IoThumbsUp,
  IoThumbsUpOutline,
  IoCash,
  IoCashOutline,
  IoGrid,
  IoGridOutline,
  IoPerson,
  IoPersonOutline,
  IoMenu,
  IoMenuOutline,
  IoLogOut,
} from "react-icons/io5";
import { MdOutlineAddCircle, MdOutlineAddCircleOutline } from "react-icons/md";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useSidebarContext } from "@/shared/custom-ui/sidebar";

interface NavbarProps {
  showHamburger?: boolean;
  onMenuToggle?: () => void;
}

/* ---------------- SINGLE SOURCE OF TRUTH ---------------- */

const NAV_ACTIONS = [
  {
    label: "Home",
    icon: IoHome,
    outline: IoHomeOutline,
    path: "/dashboard/dashboard-tab",
  },
  {
    label: "Leads",
    icon: MdOutlineAddCircle,
    outline: MdOutlineAddCircleOutline,
    path: "/customers/leads",
  },
  { label: "Admin", icon: IoPerson, outline: IoPersonOutline },
  { label: "Settings", icon: IoSettings, outline: IoSettingsOutline },
  { label: "Mail", icon: IoMail, outline: IoMailOutline },
  { label: "Messages", icon: IoChatbubble, outline: IoChatbubbleOutline },
  { label: "Approvals", icon: IoThumbsUp, outline: IoThumbsUpOutline },
  { label: "Payments", icon: IoCash, outline: IoCashOutline },
  { label: "Apps", icon: IoGrid, outline: IoGridOutline },
];

export default function Navbar({ showHamburger, onMenuToggle }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const customerRoutes = ["/customers", "/customerDetails"];
  const dashboardRoutes = ["/dashboard"];
  const isCustomerRoute = customerRoutes.some((route) =>
    location.pathname.startsWith(route),
  );
  const isDashboardRoute = dashboardRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  const { toggleSidebar } = useSidebarContext();
  const userInitials = "AD";

  const handleHamburgerClick = () => {
    console.log("Hamburger clicked in Navbar");
    if (onMenuToggle) {
      console.log("Calling onMenuToggle prop");
      onMenuToggle();
    } else {
      console.log("Calling toggleSidebar from context");
      toggleSidebar();
    }
  };

  const handleNavIconClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const handleSignOut = () => {
    console.log("Sign out");
  };

  return (
    <header className="sticky top-0 h-16 flex items-center justify-between px-[15px] shrink-0 shadow-sm border-b border-gray-200 bg-white z-10">
      {/* Left Section */}
      <div className="flex items-center gap-1.5">
        {/* Hamburger Menu - Show on customer and dashboard routes */}
        {(showHamburger || isCustomerRoute || isDashboardRoute) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHamburgerClick}
            className="group h-11 w-11 hover:bg-gray-100 cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <span className="relative w-5 h-5 group-hover:text-blue-600 transition-colors duration-200">
              <IoMenu className="w-6 h-6 absolute inset-0 group-hover:opacity-0 transition-opacity duration-200 shake-icon" />
              <IoMenuOutline className="w-6 h-6 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shake-icon" />
            </span>
          </Button>
        )}
        <div className="flex items-center">
          <img
            src="/sparklms_logo.svg"
            alt="SparkLMS Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* ---------------- RIGHT ---------------- */}
      <div className="flex items-center gap-1">
        {/* DESKTOP ICON BAR */}
        <TooltipProvider>
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ACTIONS.map(
              ({ label, icon: Solid, outline: Outline, path }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleNavIconClick(path)}
                      className={`group h-11 w-11 text-gray-600 hover:text-blue-600 hover:bg-gray-100 ${path ? "cursor-pointer" : ""}`}
                    >
                      <span className="relative w-5 h-5">
                        <Solid className="absolute inset-0 w-5 h-5 group-hover:opacity-0 transition-opacity" />
                        <Outline className="absolute inset-0 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ),
            )}
          </div>
        </TooltipProvider>

        {/* AVATAR MENU (MOBILE + TABLET) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-2 h-11 w-11 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
              {userInitials}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            {/* USER INFO */}
            <div className="px-3 py-2">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">
                admin@sparklms.com
              </p>
            </div>

            <DropdownMenuSeparator />

            {/* MOBILE / TABLET ACTIONS */}
            <div className="lg:hidden">
              {NAV_ACTIONS.map(({ label, icon: Icon, path }) => (
                <DropdownMenuItem
                  key={label}
                  className="gap-2"
                  onClick={() => handleNavIconClick(path)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
            </div>

            {/* SIGN OUT */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-2 text-red-600 focus:text-red-600"
            >
              <IoLogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
