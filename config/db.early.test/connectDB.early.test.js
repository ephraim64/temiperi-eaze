
import mongoose from "mongoose";
import { connectDB } from '../db';


// Import the necessary modules


// Import the necessary modules
// Mock the mongoose module
jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe('connectDB() connectDB method', () => {
  // Happy Path Tests
  describe('Happy Path', () => {
    it('should resolve and log "DB connected" when the connection is successful', async () => {
      // Arrange: Set up the mock to resolve
      mongoose.connect.mockResolvedValueOnce();

      // Act: Call the function
      await connectDB();

      // Assert: Check if the console.log was called with the correct message
      expect(console.log).toHaveBeenCalledWith('DB connected');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should catch and log an error message when the connection fails', async () => {
      // Arrange: Set up the mock to reject
      mongoose.connect.mockRejectedValueOnce(new Error('Connection failed'));

      // Act: Call the function
      await connectDB();

      // Assert: Check if the console.log was called with the error message
      expect(console.log).toHaveBeenCalledWith('There was an error connecting to the database');
    });
  });
});

// Mock console.log to prevent actual logging during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});