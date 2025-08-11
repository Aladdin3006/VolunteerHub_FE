module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx)",
    "**/*.(test|spec).(ts|tsx)",
  ],
};