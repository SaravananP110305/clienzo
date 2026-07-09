import { useCallback, useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import {
  MdDashboard,
  MdBusinessCenter,
  MdCall,
  MdEvent,
  MdAssessment,
  MdSettings,
  MdPeople,
} from "react-icons/md";
import { ChevronDownIcon } from "../icons";
import logo from "/images/logo/logo.png"


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
  }[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <MdDashboard className="size-5" />,
    path: "/dashboard",
  },
  {
    name: "Master",
    icon: <MdSettings className="size-5" />,
    subItems: [
      { name: "Lead sources", path: "/master/lead-sources" },
      { name: "Industries", path: "/master/industries" },
      { name: "Meeting types", path: "/master/meeting-types" },
      { name: "Follow-up reasons", path: "/master/follow-up-reasons" },
      { name: "Lost reasons", path: "/master/lost-reasons" },
    ],
  },
  {
    name: "User Management",
    icon: <MdPeople className="size-5" />,
    subItems: [
      { name: "User Roles", path: "/roles" },
      { name: "Users", path: "/users" },
    ],
  },
  {
    name: "Lead Management",
    icon: <MdBusinessCenter className="size-5" />,
    subItems: [
      { name: "Lead list", path: "/leads" },
      { name: "Add lead", path: "/leads/add" },
    ],
  },
  {
    name: "Connect",
    icon: <MdCall className="size-5" />,
    subItems: [
      { name: "My leads", path: "/contacts/my-leads" },
      { name: "Follow-ups", path: "/contacts/follow-ups" },
    ],
  },
  {
    name: "Meeting Management",
    icon: <MdEvent className="size-5" />,
    subItems: [
      { name: "Upcoming meetings", path: "/meetings/upcoming" },
      { name: "Today's meetings", path: "/meetings/today" },
      { name: "Completed meetings", path: "/meetings/completed" },
    ],
  },
  {
    name: "Reports",
    icon: <MdAssessment className="size-5" />,
    subItems: [
      { name: "Lead report", path: "/reports/leads" },
      { name: "Meeting report", path: "/reports/meetings" },
      { name: "Employee report", path: "/reports/employees" },
      { name: "Follow-up report", path: "/reports/follow-ups" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isMasterPath = location.pathname.startsWith("/master/");
  const isUserMgmtPath = location.pathname === "/users" || location.pathname === "/roles";
  const isLeadMgmtPath = location.pathname.startsWith("/leads");
  const isConnectPath = location.pathname.startsWith("/contacts");
  const isMeetingsPath = location.pathname.startsWith("/meetings");
  const isReportsPath = location.pathname.startsWith("/reports");

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "Master": isMasterPath,
    "User Management": isUserMgmtPath,
    "Lead Management": isLeadMgmtPath,
    "Connect": isConnectPath,
    "Meeting Management": isMeetingsPath,
    "Reports": isReportsPath,
  });

  useEffect(() => {
    if (location.pathname.startsWith("/master/")) {
      setOpenSubMenus({ "Master": true });
    } else if (location.pathname === "/users" || location.pathname === "/roles") {
      setOpenSubMenus({ "User Management": true });
    } else if (location.pathname.startsWith("/leads")) {
      setOpenSubMenus({ "Lead Management": true });
    } else if (location.pathname.startsWith("/contacts")) {
      setOpenSubMenus({ "Connect": true });
    } else if (location.pathname.startsWith("/meetings")) {
      setOpenSubMenus({ "Meeting Management": true });
    } else if (location.pathname.startsWith("/reports")) {
      setOpenSubMenus({ "Reports": true });
    } else {
      setOpenSubMenus({});
    }
  }, [location.pathname]);

  const isActive = useCallback(
    (path: string) => {
      if (path === "/dashboard") {
        return location.pathname === "/" || location.pathname === "/dashboard";
      }
      return location.pathname === path;
    },
    [location.pathname]
  );

  const isSubActive = useCallback(
    (subItems?: { path: string }[]) => {
      return subItems?.some((sub) => location.pathname === sub.path) || false;
    },
    [location.pathname]
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="w-20 h-auto" />
              <span className="text-2xl font-bold tracking-tight text-gray-600 dark:text-gray-400">ClienZo</span>
            </div>
          ) : (
            <img src={logo} alt="Logo" className="w-15 h-auto" />
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar grow">
        <nav className="mb-6">
          <ul className="flex flex-col gap-2">
            {navItems.map((nav) => {
              const hasSubItems = !!nav.subItems;
              const isSubOpen = openSubMenus[nav.name] || isSubActive(nav.subItems);
              const parentActive = hasSubItems ? isSubActive(nav.subItems) : isActive(nav.path!);

              return (
                <li key={nav.name} className="flex flex-col">
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => {
                          setOpenSubMenus((prev) => ({
                            [nav.name]: !prev[nav.name],
                          }));
                        }}
                        className={`menu-item group w-full text-left justify-between cursor-pointer ${parentActive
                          ? "menu-item-active font-semibold"
                          : "menu-item-inactive"
                          } ${!isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "lg:justify-between"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`menu-item-icon-size ${parentActive
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                              }`}
                          >
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <span className="menu-item-text text-theme-sm">{nav.name}</span>
                          )}
                        </div>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${isSubOpen ? "rotate-180 menu-item-arrow-active" : "menu-item-arrow-inactive"
                              }`}
                          />
                        )}
                      </button>
                      {isSubOpen && (isExpanded || isHovered || isMobileOpen) && (
                        <ul className="mt-1 pl-9 flex flex-col gap-1">
                          {nav.subItems!.map((sub) => {
                            const subActive = location.pathname === sub.path;
                            return (
                              <li key={sub.name}>
                                <Link
                                  to={sub.path}
                                  className={`menu-dropdown-item ${subActive
                                    ? "menu-dropdown-item-active font-semibold"
                                    : "menu-dropdown-item-inactive"
                                    }`}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={nav.path!}
                      className={`menu-item group ${isActive(nav.path!)
                        ? "menu-item-active font-semibold"
                        : "menu-item-inactive"
                        } ${!isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start"
                        }`}
                    >
                      <span
                        className={`menu-item-icon-size ${isActive(nav.path!)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                          }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text text-theme-sm">{nav.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
