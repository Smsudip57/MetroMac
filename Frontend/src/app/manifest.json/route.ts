import { API_CONFIG } from "@/lib/config";

export async function GET() {
  try {
    // Fetch icon from dedicated endpoint
    const iconResponse = await fetch(
      `${API_CONFIG.base_url}/api/v1/general-settings/icon`,
      {
        next: { revalidate: 3600 }, // Revalidate every 1 hour
      }
    );

    const iconData = await iconResponse.json();
    const companyIcon = iconData?.data?.icon || "/logo.svg";
    const companyName = iconData?.data?.appName || "MetroMac";

    const manifest = {
      name: companyName,
      short_name: companyName.substring(0, 12),
      description: `${companyName} Task Management and Collaboration Platform`,
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#ffffff",
      theme_color: "#6157ff",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "64x64",
          type: "image/x-icon",
        },
        {
          src: companyIcon,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: companyIcon,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
      categories: ["productivity", "business"],
      shortcuts: [
        {
          name: "Create Task",
          short_name: "New Task",
          description: "Create a new task",
          url: "/dashboard/tasks?action=new",
        },
        {
          name: "View Dashboard",
          short_name: "Dashboard",
          description: "Go to dashboard",
          url: "/dashboard",
        },
      ],
    };

    return Response.json(manifest);
  } catch (error) {
    console.error("Error generating manifest:", error);

    // Fallback manifest
    const fallback = {
      name: "MetroMac",
      short_name: "MetroMac",
      description: "Advanced Task Management and Collaboration Platform",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#ffffff",
      theme_color: "#6157ff",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "64x64",
          type: "image/x-icon",
        },
        {
          src: "/header-logo.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/header-logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
      categories: ["productivity", "business"],
      shortcuts: [
        {
          name: "Create Task",
          short_name: "New Task",
          description: "Create a new task",
          url: "/dashboard/tasks?action=new",
        },
        {
          name: "View Dashboard",
          short_name: "Dashboard",
          description: "Go to dashboard",
          url: "/dashboard",
        },
      ],
    };

    return Response.json(fallback);
  }
}
