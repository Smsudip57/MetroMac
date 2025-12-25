import { API_CONFIG } from "@/lib/config";
import { downloadAndResizeIcon } from "@/lib/imageProcessor";

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

    // Download and resize icon if it's a valid URL
    let icon64 = "/icon-64x64.png";
    let icon64Type = "image/png";
    let icon192 = "/icon-192x192.png";
    let icon192Type = "image/png";
    let icon512 = "/icon-512x512.png";
    let icon512Type = "image/png";

    if (companyIcon && companyIcon.startsWith("http")) {
      try {
        const resizedIcons = await downloadAndResizeIcon(companyIcon);
        icon64 = resizedIcons.icon64;
        icon192 = resizedIcons.icon192;
        icon512 = resizedIcons.icon512;

        // Check if SVG was returned
        if (icon64.endsWith('.svg')) {
          icon64Type = "image/svg+xml";
        }
        if (icon192.endsWith('.svg')) {
          icon192Type = "image/svg+xml";
        }
        if (icon512.endsWith('.svg')) {
          icon512Type = "image/svg+xml";
        }
      } catch (error) {
        console.error("[Manifest] Failed to resize icon:", error);
        // Falls back to defaults
      }
    }

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
          src: icon64,
          sizes: "64x64",
          type: icon64Type,
        },
        {
          src: icon192,
          sizes: "192x192",
          type: icon192Type,
          purpose: "any",
        },
        {
          src: icon512,
          sizes: "512x512",
          type: icon512Type,
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
