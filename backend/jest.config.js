/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/message.service.spec.ts", "**/tests/message-save.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}
