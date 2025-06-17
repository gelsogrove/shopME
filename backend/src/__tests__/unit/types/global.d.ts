// Global types for unit tests
declare global {
  var mockApiLimitService: {
    checkApiLimit: jest.Mock;
    incrementApiUsage: jest.Mock;
  };
  
  var mockMessageRepository: any;
}

export {};
