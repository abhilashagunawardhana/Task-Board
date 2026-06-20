// Import ESLint configurations and environment global lists
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  // Load standard recommended rules from ESLint team
  js.configs.recommended,
  {
    // Define JavaScript execution context parameters
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      // Merge environment namespaces (Node + Jest) so standard globals aren't flagged as undefined
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    // Customize rule enforcements
    rules: {
      "no-unused-vars": "warn", // Flag unused variables as warnings instead of blocker errors
      "no-console": "off",      // Allow console.log calls for logging server events
    },
  },
];
