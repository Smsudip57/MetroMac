import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        //--------------- Light Mode Colors -------------------
        // "light-alpha": "hsla(179, 6%, 20%, 1)", // #2F3535
        // "light-beta": "hsla(180, 5%, 44%, 1)", // #6A7575
        // "light-stroke-alpha": "hsla(180, 5%, 70%, 1)", // #AEB7B7
        // "light-stroke-beta": "hsla(180, 5%, 80%, 1)", // #C9CFCF
        // "light-fill-alpha": "hsla(156, 12%, 90%, 0.80)", // #E2EBE6
        // "light-fill-beta": "hsla(156, 12%, 90%, 0.46)", // #E2EBE6
        // "light-Fill-beta": "#EBF1EE",

        // "light-emerald-lightest-3": "#FAFFFF",
        // "light-emerald-lightest-2": "#E6FFFF",
        // "light-emerald-lightest": "#34F7F5",
        // "light-emerald-lighter": "#1DD0CF",
        // "light-emerald-light": "#209D9C",
        // "light-emerald-base": "#006564",
        // "light-emerald-dark": "#004343",
        // "light-emerald-darker": "#002221",

        // "light-sun-yellow-dark-alpha": "#C58907",
        // "light-sun-yellow-alpha": "#F7B931",
        // "light-sun-yellow-beta": "#FDDE9B",
        // "light-sun-yellow-gama": "#FEEECD",

        // "light-warning-yellow": "#F7B931",
        // "light-warning-yellow-trans": "#FEEECD",

        // "warning": "hsla(359, 100%, 47%, 1)", // #F00003
        // "warning-trans": "hsla(359, 100%, 47%, 0.24)",

        // "light-warning-orange": "#FE782F",
        // "light-warning-orange-trans": "#FAF4EC",

        // "light-warning-purple": "#8E00FA",
        // "light-warning-purple-trans": "#F0EAFC",

        // "light-warning-pink": "#F80080",
        // "light-warning-pink-trans": "#F9EAF1",

        // "light-warning-teal": "#00A1CE",
        // "light-warning-teal-trans": "#E5F7F8",

        // "light-warning-green": "hsla(154, 96%, 33%, 1)", // #04A35E
        // "light-warning-green-trans": "hsla(154, 96%, 33%, 0.24)",

        // "light-warning-blue": "#4C4FF3",
        // "light-warning-blue-trans": "hsla(178, 100%, 7%, 0.08)",

        // "light-alpha-white": "#FFFFFF",
        // "light-alpha-black": "#0D0D0D",

        // "light-bg-gradient-overlay-1": "hsla(0, 0%, 100%, 0.03)", // #FFFFFF
        // "light-bg-gradient-overlay-2": "hsla(120, 76%, 95%, 0.08)", // #E9FCE9
        // "light-bg-gradient-overlay-3": "hsla(156, 78%, 82%, 0.10)", // #AEF5D9

        // //--------------- Dark Mode Colors -------------------
        // "dark-alpha": "hsla(0, 0%, 100%, 1)",
        // "dark-beta": "hsla(0, 0%, 100%, 0.70)",
        // "dark-stroke-alpha": "hsla(0, 0%, 100%, 0.60)",
        // "dark-stroke-beta": "hsla(0, 0%, 100%, 0.12)",
        // "dark-fill-alpha": "hsla(0, 0%, 100%, 0.06)",
        // "dark-fill-beta": "hsla(0, 0%, 100%, 0.03)",

        // "dark-emerald-lightest": "#14F0EE", // (179, 88%, 51%)
        // "dark-emerald-lighter": "#1DD0CF", // (180, 76%, 46%)
        // "dark-emerald-light": "#209D9C", // (180, 66%, 37%)
        // "dark-emerald-base": "#006564", // (179, 100%, 20%)
        // "dark-emerald-dark": "#004343", // (180, 100%, 13%)
        // "dark-emerald-darker": "#002221", // (178, 100%, 7%)

        // "dark-sun-yellow-alpha": "#E8B442", // 100%
        // "dark-sun-yellow-beta": "#E8B442B3", // 70%
        // "dark-sun-yellow-gama": "#E8B44280", // 50%

        // "dark-warning-red": "#F45A5C", // solid red
        // "dark-warning-red-trans": "hsla(359, 88%, 65%, 0.24)", // transparent red

        // "dark-warning-green": "#04A35E", // solid green
        // "dark-warning-green-trans": "hsla(154, 96%, 33%, 0.24)", // transparent green

        // "dark-warning-blue": "#002221", // solid blue
        // "dark-warning-blue-trans": "hsla(178, 100%, 7%, 0.24)", // transparent blue

        // "dark-alpha-white": "#FFFFFF",
        // "dark-alpha-black": "#0D0D0D",

        // "dark-bg-gradient-overlay-1": "hsla(179, 100%, 20%, 0.30)", // based on #006564
        // "dark-bg-gradient-overlay-2": "hsla(178, 100%, 7%, 0.03)", // based on #002221

        // // Primary
        // "dark-suma-jade": "#006591",
        // white: "#FFFFFF",

        // //--------------- for both dark and light mode -------------------
        // "medium-jade": "#367D79", // R:54 G:125 B:121
        // "light-jade": "#5E967E", // R:94 G:150 B:126

        // sand: "#C1B29A", // R:193 G:180 B:154
        // "light-sand": "#DCDCC0", // R:220 G:218 B:188

        // slate: "#C6C2C1", // R:198 G:194 B:193
        // "light-slate": "#EBEDF0", // R:235 G:237 B:240

        // // Accent
        // "suma-golden": "#E8B442", // R:232 G:180 B:66

        // Current Brand Colors
        // primary: "#2D3A3F", // Dark Slate
        // secondary: "#F1F5F8", // Light Gray
        // accent: "#4A90E2", // Blue
        // neutral: "#D1D8E0", // Muted Gray
        // highlight: "#F5A623",
        // primary: "#2C3E50", // Charcoal
        // secondary: "#ECF0F1", // Light Gray
        // accent: "#3498DB", // Sky Blue
        // neutral: "#BDC3C7", // Silver
        // highlight: "#E74C3C", // Red
        // primary: "#1F2A44", // Deep Blue
        // secondary: "#F7F9FC", // Off-White
        // accent: "#50E3C2", // Teal
        // neutral: "#B8C2CC", // Light Gray
        // highlight: "#FF7F50", // Coral
        // shadow-[0px_3px_200px_0px_rgba(0,0,0,0.10)]
        primary: "var(--color-primary)",
        "primary/5": "color-mix(in srgb, var(--color-primary) 5%, transparent)",
        "primary/10":
          "color-mix(in srgb, var(--color-primary) 10%, transparent)",
        "primary/20":
          "color-mix(in srgb, var(--color-primary) 20%, transparent)",
        "primary/30":
          "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        "primary/40":
          "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        "primary/50":
          "color-mix(in srgb, var(--color-primary) 50%, transparent)",
        "primary/60":
          "color-mix(in srgb, var(--color-primary) 60%, transparent)",
        "primary/70":
          "color-mix(in srgb, var(--color-primary) 70%, transparent)",
        "primary/80":
          "color-mix(in srgb, var(--color-primary) 80%, transparent)",
        "primary/90":
          "color-mix(in srgb, var(--color-primary) 90%, transparent)",
        secondary: "var(--color-secondary)",
        "secondary/5":
          "color-mix(in srgb, var(--color-secondary) 5%, transparent)",
        "secondary/10":
          "color-mix(in srgb, var(--color-secondary) 10%, transparent)",
        "secondary/20":
          "color-mix(in srgb, var(--color-secondary) 20%, transparent)",
        "secondary/30":
          "color-mix(in srgb, var(--color-secondary) 30%, transparent)",
        "secondary/40":
          "color-mix(in srgb, var(--color-secondary) 40%, transparent)",
        "secondary/50":
          "color-mix(in srgb, var(--color-secondary) 50%, transparent)",
        "secondary/60":
          "color-mix(in srgb, var(--color-secondary) 60%, transparent)",
        "secondary/70":
          "color-mix(in srgb, var(--color-secondary) 70%, transparent)",
        "secondary/80":
          "color-mix(in srgb, var(--color-secondary) 80%, transparent)",
        "secondary/90":
          "color-mix(in srgb, var(--color-secondary) 90%, transparent)",
        tertiary: "var(--color-tertiary)",
        "tertiary/10":
          "color-mix(in srgb, var(--color-tertiary) 10%, transparent)",
        "tertiary/20":
          "color-mix(in srgb, var(--color-tertiary) 20%, transparent)",
        "tertiary/30":
          "color-mix(in srgb, var(--color-tertiary) 30%, transparent)",
        "tertiary/40":
          "color-mix(in srgb, var(--color-tertiary) 40%, transparent)",
        "tertiary/50":
          "color-mix(in srgb, var(--color-tertiary) 50%, transparent)",
        "tertiary/60":
          "color-mix(in srgb, var(--color-tertiary) 60%, transparent)",
        "tertiary/70":
          "color-mix(in srgb, var(--color-tertiary) 70%, transparent)",
        "tertiary/80":
          "color-mix(in srgb, var(--color-tertiary) 80%, transparent)",
        "tertiary/90":
          "color-mix(in srgb, var(--color-tertiary) 90%, transparent)",
        success: "var(--color-success)",
        "success/10":
          "color-mix(in srgb, var(--color-success) 10%, transparent)",
        "success/20":
          "color-mix(in srgb, var(--color-success) 20%, transparent)",
        "success/30":
          "color-mix(in srgb, var(--color-success) 30%, transparent)",
        "success/40":
          "color-mix(in srgb, var(--color-success) 40%, transparent)",
        "success/50":
          "color-mix(in srgb, var(--color-success) 50%, transparent)",
        "success/60":
          "color-mix(in srgb, var(--color-success) 60%, transparent)",
        "success/70":
          "color-mix(in srgb, var(--color-success) 70%, transparent)",
        "success/80":
          "color-mix(in srgb, var(--color-success) 80%, transparent)",
        "success/90":
          "color-mix(in srgb, var(--color-success) 90%, transparent)",
        warning: "var(--color-warning)",
        "warning/10":
          "color-mix(in srgb, var(--color-warning) 10%, transparent)",
        "warning/20":
          "color-mix(in srgb, var(--color-warning) 20%, transparent)",
        "warning/30":
          "color-mix(in srgb, var(--color-warning) 30%, transparent)",
        "warning/40":
          "color-mix(in srgb, var(--color-warning) 40%, transparent)",
        "warning/50":
          "color-mix(in srgb, var(--color-warning) 50%, transparent)",
        "warning/60":
          "color-mix(in srgb, var(--color-warning) 60%, transparent)",
        "warning/70":
          "color-mix(in srgb, var(--color-warning) 70%, transparent)",
        "warning/80":
          "color-mix(in srgb, var(--color-warning) 80%, transparent)",
        "warning/90":
          "color-mix(in srgb, var(--color-warning) 90%, transparent)",
        neutral: "var(--color-neutral)",
        "neutral/10":
          "color-mix(in srgb, var(--color-neutral) 10%, transparent)",
        "neutral/20":
          "color-mix(in srgb, var(--color-neutral) 20%, transparent)",
        "neutral/30":
          "color-mix(in srgb, var(--color-neutral) 30%, transparent)",
        "neutral/40":
          "color-mix(in srgb, var(--color-neutral) 40%, transparent)",
        "neutral/50":
          "color-mix(in srgb, var(--color-neutral) 50%, transparent)",
        "neutral/60":
          "color-mix(in srgb, var(--color-neutral) 60%, transparent)",
        "neutral/70":
          "color-mix(in srgb, var(--color-neutral) 70%, transparent)",
        "neutral/80":
          "color-mix(in srgb, var(--color-neutral) 80%, transparent)",
        "neutral/90":
          "color-mix(in srgb, var(--color-neutral) 90%, transparent)",
        border: "var(--color-border)",
        bg: "var(--color-bg)",
        bg_shade: "var(--color-bg-shade)",
        text: "var(--color-text)",
        text_highlight: "var(--color-text-highlight)",
        gray_dark: "var(--color-gray-dark)",
        // text_highlight: "#747382",
        // primary: "#000000", // Black
        // secondary: "#52057B", // Dark Purple
        // accent: "#892CDC", // Medium Purple
        // neutral: "#BC6FF1", // Light Purple
        // highlight: "#F5A623", // Optional highlight (you can add a yellow/orange for contrast)
      },

      // Prefer an explicit RGB CSS var for consistent, controllable alpha shadows.
      // Define --color-primary-rgb in your globals (e.g. :root { --color-primary-rgb: 59 130 246; })
      // Then use `shadow-primary` to get a shadow similar to `rgba(59,130,246,0.14)`.
      boxShadow: {
        primary: "0 10px 30px rgb(var(--color-primary) / 0.14)",
      },
      borderRadius: {
        // lg: "12px",
      },
      fontSize: {
        // sm: ["14px", { lineHeight: "14px" }],
        "mega-display": [
          "88px",
          { lineHeight: "64px", letterSpacing: "0.02em" },
        ],
        display: ["56px", { lineHeight: "64px", letterSpacing: "0.02em" }],
        "heading-1": ["36px", { lineHeight: "40px", letterSpacing: "0.02em" }],
        "heading-2": ["32px", { lineHeight: "40px", letterSpacing: "0.02em" }],
        "heading-3": ["28px", { lineHeight: "32px", letterSpacing: "0.02em" }],
        "heading-4": ["24px", { lineHeight: "32px", letterSpacing: "0.02em" }],
        "heading-5": ["20px", { lineHeight: "28px", letterSpacing: "0.02em" }],
        body: ["16px", { lineHeight: "24px", letterSpacing: "0.02em" }],
        "body-2": ["14px", { lineHeight: "20px", letterSpacing: "0.02em" }],
        small: ["12px", { lineHeight: "20px", letterSpacing: "0.02em" }],
        smallest: ["10px", { lineHeight: "16px", letterSpacing: "0.02em" }],
      },

      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
            overflow: "hidden",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
            overflow: "visible",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
            overflow: "visible",
          },
          to: {
            height: "0",
            overflow: "hidden",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out forwards",
        "accordion-up": "accordion-up 0.2s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
