/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "auth-mask-group": "url('./src/assets/svg/auth-mask-top-right.svg')",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
