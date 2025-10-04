const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 80,
  tabWidth: 2,
  endOfLine: "lf",
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.json",
      options: {
        tabWidth: 2,
      },
    },
    {
      files: "*.md",
      options: {
        proseWrap: "always",
      },
    },
  ],
};

export default config;
