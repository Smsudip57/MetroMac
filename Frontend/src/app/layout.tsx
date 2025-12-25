import StoreProvider from "@/providers/StoreProvider";
import { UserProvider } from "@/providers/UserProvider";
import { RootLayoutProvider } from "@/providers/RootLayoutProvider";
import { Public_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { API_CONFIG } from "@/lib/config";
import { ErrorHandler } from "@/helpers/ErrorHandler";
import "./globals.css";
import type { Metadata } from "next";

// export const dynamic = "force-dynamic";

const rubik = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Generate metadata function (replaces useGetMeQuerytadata)
export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await fetch(
      `${API_CONFIG.base_url}/api/v1/general-settings`,
      {
        next: { revalidate: 60 }, // Revalidate every 1 minutes
      }
    );

    const settings = await response.json();
    const companyName = settings?.data?.company_name || "STech";

    return {
      title: settings?.data?.meta_title || companyName,
      description:
        settings?.data?.meta_description ||
        `${companyName} - Your one-stop solution for all your business needs.`,
      icons: {
        icon:
          settings?.data?.company_icon ||
          settings?.data?.company_logo ||
          "/logo.svg",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata
    return {
      title: "STech",
      description:
        "STech - Your one-stop solution for all your business needs.",
      icons: {
        icon: "/logo.svg",
      },
    };
  }
}

// Root layout (now synchronous)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#6157ff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="MetroMac" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon-192.png" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Get saved theme or default to light
                  const saved = localStorage.getItem("theme");
                  let theme = "light";
                  
                  if (saved === "dark" || saved === "light") {
                    theme = saved;
                  }
                  
                  // Apply theme immediately to document
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                  
                  // Mark theme as ready so components know
                  sessionStorage.setItem("themeReady", "true");
                } catch (e) {
                  console.warn("Theme initialization error:", e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${rubik.className} text-text`}>
        <StoreProvider>
          <RootLayoutProvider>
            <UserProvider>{children}</UserProvider>
            <ErrorHandler />
          </RootLayoutProvider>
        </StoreProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              padding: "14px",
              zIndex: 99999999,
            },
          }}
        />
      </body>
    </html>
  );
}
