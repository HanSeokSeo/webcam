/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        webcambg: "rgba(245, 240, 215, 0.5)",
      },
      scrollbar: (theme) => ({
        thin: {
          width: "8px",
          "scrollbar-thumb": {
            backgroundColor: "rgba(155, 155, 155, .5)",
            "&:hover": { backgroundColor: "rgba(155, 155, 155, .7)" },
          },
          "scrollbar-thumb:hover": { backgroundColor: "transparent" },
        },
      }),
    },
  },
  plugins: [require("tailwind-scrollbar")],
}
