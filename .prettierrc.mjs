export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: true,

  overrides: [
    { files: ['*.json', '*.md'], options: { tabWidth: 2 } },
    { files: ['*.tsx', '*.jsx'], options: { jsxSingleQuote: true } },
  ],
};
