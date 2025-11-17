export default {
  testEnvironment: "jsdom",

  // Solo correr tests .ts y .tsx
  testMatch: ["**/?(*.)+(test).ts?(x)"],

  // Ignorar todos los .js dentro de src/tests/
  testPathIgnorePatterns: ["<rootDir>/src/tests/.*\\.js$"],

  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2021",
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: false,
          },
          transform: {
            react: {
              runtime: "automatic",
              importSource: "react",
            },
          },
        },
        module: {
          type: "es6",
        },
      },
    ],
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
