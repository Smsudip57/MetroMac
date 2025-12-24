"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Building2,
  Award,
  MapPin,
  Database,
  Shield,
  Users,
} from "lucide-react";

type SettingsLayoutProps = {
  children: React.ReactNode;
};

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const pathname = usePathname();

  const settingsMenuItems = [
    {
      title: "General",
      icon: <Settings className="size-4" />,
      link: "/settings",
      description: "Basic application settings",
    },
    {
      title: "User Management",
      icon: <Users className="size-4" />,
      link: "/settings/users",
      description: "Manage system users and roles",
    },
    {
      title: "Permissions",
      icon: <Shield className="size-4" />,
      link: "/settings/permissions",
      description: "Access control and permissions",
    },
    {
      title: "Constants",
      icon: <Database className="size-4" />,
      link: "/settings/constants",
    },
  ];

  const isActiveLink = (link: string) => {
    if (link === "/settings") {
      return pathname === "/settings";
    }
    return pathname.startsWith(link);
  };

  return (
    <div className="flex h-full bg-bg_shade">
      {/* Settings Sidebar */}
      <div className="w-64 bg-bg flex flex-col rounded-lg h-[calc(100vh-250px)]">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text_highlight">
                Settings
              </h1>
              <p className="text-sm text-text">Manage your application</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {settingsMenuItems.map((item) => (
              <div key={item.link}>
                <Link
                  href={item.link}
                  className={`group flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActiveLink(item.link)
                      ? "bg-gradient-to-r from-secondary/10 to-primary/10 text-primary border border-primary/20"
                      : "text-text hover:bg-bg_shade hover:text-text_highlight"
                  }`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" title={item.description}>
                      {item.title}
                    </div>
                    {/* <div className="text-xs text-text truncate">
                      {item.description}
                    </div> */}
                  </div>
                </Link>

                {/* Sub Items */}
                {/* {item.subItems && isActiveLink(item.link) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.link}
                        href={subItem.link}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === subItem.link
                            ? "bg-primary/5 text-primary"
                            : "text-text hover:bg-bg_shade/50 hover:text-text_highlight"
                        }`}
                      >
                        {subItem.icon}
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )} */}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <div className="p-6 pt-1 ">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
