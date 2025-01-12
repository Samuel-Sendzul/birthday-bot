import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        tall: { raw: "(min-height: 800px)" },
      },
      transitionProperty: {
        spacing: "margin, padding",
      },
    },
    borderRadius: {
      xs: "0.6875rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.25rem",
      xl: "1.5rem",
      full: "9999px",
    },
    fontFamily: {
      text: '"Rational TW"',
      display: '"Rational TW"',
      google: "Roboto",
    },
    colors: {
      "black-rgba": "rgba(0,0,0,0.9)",
      neutral: {
        9: "#17121f",
        2: "#494747",
        1: "#696078",
        DEFAULT: "#8d8698",
        "-1": "#968fa0",
        "-2": "#a5a0ae",
        "-3": "#b4afbb",
        "-4": "#d1cfd6",
        "-5": "#e9e7eb",
        "-6": "#edecf0",
        "-7": "#f3f3f4",
        "-8": "#fbfafb",
        "-9": "#ffffff",
      },
      purple: {
        9: "#2d1040",
        2: "#5f1ca1",
        1: "#7229cf",
        DEFAULT: "#9335F9",
        "-1": "#ae59ff",
        "-2": "#b66bff",
        "-3": "#c88fff",
        "-4": "#d3a5ff",
        "-5": "#e4c7ff",
        "-6": "#f4e9ff",
        "-7": "#faf4ff",
        "-8": "#fdfbff",
      },
      blue: {
        9: "#052033",
        2: "#0f5f99",
        1: "#007aff",
        DEFAULT: "#00a3ff",
        "-1": "#42165F",
        "-2": "#67d1ff",
        "-3": "#8cddff",
        "-4": "#b3e8ff",
        "-5": "#d1f1ff",
        "-6": "#e8f8ff",
        "-7": "#f4fcff",
        "-8": "#fafeff",
      },
      green: {
        9: "#012a1e",
        2: "#027f59",
        1: "#00c187",
        DEFAULT: "#03d797",
        "-1": "#6FE2A7",
        "-2": "#80e9bd",
        "-3": "#9aedca",
        "-4": "#b3f1d7",
        "-5": "#cdf6e5",
        "-6": "#e6fbf2",
        "-7": "#f2fdf8",
        "-8": "#fafefc",
      },
      yellow: {
        9: "#2a2100",
        2: "#bc9300",
        1: "#ebb700",
        DEFAULT: "#ffdb0f",
        "-1": "#ffe040",
        "-2": "#ffe457",
        "-3": "#ffeb80",
        "-4": "#fff2ab",
        "-5": "#fff7cc",
        "-6": "#fffbe5",
        "-7": "#fffdf2",
        "-8": "#FFFEFA",
      },
      orange: {
        9: "#331600",
        2: "#cc5600",
        1: "#e56100",
        DEFAULT: "#ff7a00",
        "-1": "#ff8933",
        "-2": "#ff9e57",
        "-3": "#ffb580",
        "-4": "ffceab",
        "-5": "#ffe1cc",
        "-6": "#fff0e5",
        "-7": "#fff8f2",
        "-8": "#fffcfa",
      },
      red: {
        9: "#340006",
        2: "#cd0018",
        1: "#e80823",
        DEFAULT: "#ff7a00",
        "-1": "#F0536B",
        "-2": "#FB5C93",
        "-3": "#ffa0ab",
        "-4": "#ffd5da",
        "-5": "#fff0f2",
        "-6": "#fff7f8",
        "-7": "#fffbfb",
        "-8": "#fffcfd",
      },
    },
    fontSize: {
      "4xl": [
        "42px",
        {
          letterSpacing: "-0.03em",
          lineHeight: "1.2",
        },
      ],
      "3xl": [
        "32px",
        {
          letterSpacing: "-0.03em",
          lineHeight: "1.2",
        },
      ],
      "2xl": [
        "24px",
        {
          letterSpacing: "-0.03em",

          lineHeight: "1.2",
        },
      ],
      xl: [
        "21px",
        {
          letterSpacing: "-0.03em",
          lineHeight: "1.2",
        },
      ],
      lg: [
        "17px",
        {
          letterSpacing: "-0.02em",
          lineHeight: "1.2",
        },
      ],
      md: [
        "16px",
        {
          letterSpacing: "-0.01em",
          lineHeight: "1.2",
        },
      ],
      sm: [
        "14px",
        {
          letterSpacing: "-0.01em",
          lineHeight: "1.2",
        },
      ],
      xs: [
        "13px",
        {
          letterSpacing: "0",
          lineHeight: "1.2",
        },
      ],
      "2xs": [
        "12px",
        {
          letterSpacing: "0",
          lineHeight: "1.2",
        },
      ],
      "3xs": [
        "10px",
        {
          letterSpacing: "0",
          lineHeight: "1.2",
        },
      ],
      "4xs": [
        "8px",
        {
          letterSpacing: "0",
          lineHeight: "1.2",
        },
      ],
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semi: "600",
    },
  },
  plugins: [],
};
export default config;
