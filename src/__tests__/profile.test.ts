import {
  addSkillsToUser,
  getUserProfile,
  updateUserAvatar,
} from "../apis/profile";
import fetchMock from "jest-fetch-mock";

// describe("getUserProfile", () => {
//   const API_BASE = import.meta.env.VITE_API_BASE_URL;
//   const mockUserId = "user123";
//   const mockToken = "test-token";
//   const mockUserData = {
//     _id: mockUserId,
//     name: "Test User",
//     email: "test@example.com",
//     communeId: {
//       _id: "commune123",
//       name: "Test Commune",
//     },
//   };

//   beforeAll(() => {
//     fetchMock.enableMocks();
//   });

//   beforeEach(() => {
//     fetchMock.resetMocks();
//     jest.clearAllMocks();
//     jest.spyOn(console, "error").mockImplementation(() => {});
//   });

//   afterAll(() => {
//     fetchMock.disableMocks();
//   });

//   afterEach(() => {
//     (console.error as jest.Mock).mockRestore();
//   });

//   it("should fetch user profile successfully", async () => {
//     fetchMock.mockResponseOnce(
//       JSON.stringify({
//         user: mockUserData,
//         message: "Profile fetched successfully",
//       })
//     );

//     const result = await getUserProfile(mockUserId, mockToken);

//     expect(result).toEqual({
//       user: mockUserData,
//       message: "Profile fetched successfully",
//     });

//     expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/users/${mockUserId}`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${mockToken}`,
//         "Content-Type": "application/json",
//       },
//     });
//   });

//   it("should handle 404 error when user not found", async () => {
//     fetchMock.mockResponseOnce("User not found", { status: 404 });

//     await expect(getUserProfile(mockUserId, mockToken)).rejects.toThrow(
//       "HTTP error! status: 404, message: User not found"
//     );
//   });

//   it("should handle network errors", async () => {
//     fetchMock.mockReject(new Error("Network error"));

//     await expect(getUserProfile(mockUserId, mockToken)).rejects.toThrow(
//       "Fetch user profile failed: Network error"
//     );
//   });

//   it("should return user directly if response is not wrapped", async () => {
//     fetchMock.mockResponseOnce(JSON.stringify(mockUserData));

//     const result = await getUserProfile(mockUserId, mockToken);

//     expect(result).toEqual({
//       user: mockUserData,
//       message: undefined,
//     });
//   });
// });

// describe("updateUserAvatar", () => {
//   const API_BASE = import.meta.env.VITE_API_BASE_URL;
//   const mockUserId = "user123";
//   const mockToken = "test-token";
//   const mockFile = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
//   const mockResponse = {
//     user: {
//       _id: mockUserId,
//       name: "Test User",
//       avatar: "path/to/avatar.jpg",
//     },
//     id: mockUserId,
//     message: "Avatar updated successfully",
//   };

//   beforeAll(() => {
//     fetchMock.enableMocks();
//   });

//   beforeEach(() => {
//     fetchMock.resetMocks();
//     jest.clearAllMocks();
//     jest.spyOn(console, "error").mockImplementation(() => {});
//   });

//   afterAll(() => {
//     fetchMock.disableMocks();
//   });

//   afterEach(() => {
//     (console.error as jest.Mock).mockRestore();
//   });

//   it("should update user avatar successfully", async () => {
//     fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

//     const result = await updateUserAvatar(mockUserId, mockFile, mockToken);

//     expect(result).toEqual(mockResponse);

//     // Verify the fetch call
//     const fetchCall = fetchMock.mock.calls[0];
//     expect(fetchCall[0]).toBe(`${API_BASE}/users/update-user/${mockUserId}`);
//     expect(fetchCall[1]?.method).toBe("PUT");
//     expect(fetchCall[1]?.headers).toEqual({
//       Authorization: `Bearer ${mockToken}`,
//     });

//     // Verify FormData contains the file
//     const formData = fetchCall[1]?.body as FormData;
//     expect(formData.get("avatar")).toBeInstanceOf(File);
//   });

//   it("should work without token", async () => {
//     fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

//     const result = await updateUserAvatar(mockUserId, mockFile);

//     expect(result).toEqual(mockResponse);
//     expect(fetchMock).toHaveBeenCalledWith(
//       `${API_BASE}/users/update-user/${mockUserId}`,
//       expect.objectContaining({
//         headers: {
//           Authorization: "Bearer ",
//         },
//       })
//     );
//   });

//   it("should handle 400 error response", async () => {
//     const errorMessage = "Invalid file type";
//     fetchMock.mockResponseOnce(errorMessage, { status: 400 });

//     await expect(
//       updateUserAvatar(mockUserId, mockFile, mockToken)
//     ).rejects.toThrow(`HTTP error! status: 400, message: ${errorMessage}`);
//   });

//   it("should handle network errors", async () => {
//     fetchMock.mockReject(new Error("Network error"));

//     await expect(
//       updateUserAvatar(mockUserId, mockFile, mockToken)
//     ).rejects.toThrow("Avatar upload failed: Network error");
//   });

//   it("should handle invalid response format", async () => {
//     fetchMock.mockResponseOnce(JSON.stringify({ invalid: "response" }));

//     const result = await updateUserAvatar(mockUserId, mockFile, mockToken);
//     expect(result).toEqual({
//       user: { invalid: "response" },
//       id: undefined,
//       message: undefined,
//     });
//   });
// });

// describe("addSkillsToUser", () => {
//   const API_BASE = import.meta.env.VITE_API_BASE_URL;
//   const mockUserId = "user123";
//   const mockToken = "test-token";
//   const mockSkills = ["JavaScript", "React", "TypeScript"];
//   const mockResponse = {
//     message: "Skills added successfully",
//     data: {
//       _id: mockUserId,
//       skills: mockSkills,
//     },
//   };

//   beforeAll(() => {
//     fetchMock.enableMocks();
//   });

//   beforeEach(() => {
//     fetchMock.resetMocks();
//     jest.clearAllMocks();
//     jest.spyOn(console, "error").mockImplementation(() => {});
//   });

//   afterAll(() => {
//     fetchMock.disableMocks();
//   });

//   afterEach(() => {
//     (console.error as jest.Mock).mockRestore();
//   });

//   it("should add skills to user successfully", async () => {
//     fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

//     const result = await addSkillsToUser(mockUserId, mockSkills, mockToken);

//     expect(result).toEqual({
//       message: mockResponse.message,
//       data: mockResponse.data,
//     });

//     expect(fetchMock).toHaveBeenCalledWith(
//       `${API_BASE}/users/${mockUserId}/skills`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${mockToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ skills: mockSkills }),
//       }
//     );
//   });

//   it("should handle invalid user ID error", async () => {
//     const errorMessage = "ID không hợp lệ";
//     fetchMock.mockResponseOnce(
//       JSON.stringify({
//         message: errorMessage,
//       }),
//       { status: 400 }
//     );

//     await expect(
//       addSkillsToUser("invalid-id", mockSkills, mockToken)
//     ).rejects.toThrow(
//       `HTTP error! status: 400, message: ${JSON.stringify({
//         message: errorMessage,
//       })}`
//     );
//   });

//   it("should handle user not found error", async () => {
//     const errorMessage = "People dùng không tồn tại";
//     fetchMock.mockResponseOnce(
//       JSON.stringify({
//         message: errorMessage,
//       }),
//       { status: 404 }
//     );

//     await expect(
//       addSkillsToUser("nonexistent-user", mockSkills, mockToken)
//     ).rejects.toThrow(
//       `HTTP error! status: 404, message: ${JSON.stringify({
//         message: errorMessage,
//       })}`
//     );
//   });

//   it("should handle invalid skills format error", async () => {
//     const errorMessage = "Skills must be an array";
//     fetchMock.mockResponseOnce(
//       JSON.stringify({
//         message: errorMessage,
//       }),
//       { status: 400 }
//     );

//     await expect(
//       addSkillsToUser(mockUserId, "not-an-array" as any, mockToken)
//     ).rejects.toThrow(
//       `HTTP error! status: 400, message: ${JSON.stringify({
//         message: errorMessage,
//       })}`
//     );
//   });

//   it("should handle network errors", async () => {
//     fetchMock.mockReject(new Error("Network error"));

//     await expect(
//       addSkillsToUser(mockUserId, mockSkills, mockToken)
//     ).rejects.toThrow("Add skills failed: Network error");
//   });
// });
