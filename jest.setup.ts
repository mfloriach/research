import "@testing-library/jest-dom";

// Test bootstrap: provide the secrets lib/config.ts strictly requires so
// suites exercise the real validation path (CI has no .env.local).
process.env.MONGODB_URI ??=
  "mongodb://localhost:27017/epistimology-test";
process.env.OPENAI_API_KEY ??= "test-openai-key";
