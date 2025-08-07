import axios from "axios";
import {
  fetchPhasesByCampaignId,
  fetchTasksByVolunteer,
  reviewPeerTaskApi,
  submitTaskApi,
} from "../apis/task";
import { createTask } from "../apis/staff";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe("fetchPhasesByCampaignId - campaignId boundaries & partitions", () => {
//   const token = "fake-token";
//   const mockResponse = { phases: [{ id: "1", name: "Phase 1" }] };

//   beforeEach(() => {
//     mockedAxios.get.mockClear();
//   });

//   it("✅ Valid Boundary: campaignId = 'a'", async () => {
//     mockedAxios.get.mockResolvedValue({ data: mockResponse });

//     const result = await fetchPhasesByCampaignId("a", token);

//     expect(mockedAxios.get).toHaveBeenCalledWith(
//       "http://localhost:4000/task/a/campaign",
//       { headers: { Authorization: "Bearer fake-token" } }
//     );
//     expect(result).toEqual(mockResponse);
//   });

//   it("❌ Invalid Boundary: campaignId = '' (empty string)", async () => {
//     await expect(fetchPhasesByCampaignId("", token)).rejects.toThrow(
//       "Invalid campaignId: must be a non-empty string"
//     );
//   });

//   it("❌ Invalid Partition: campaignId = null", async () => {
//     // @ts-expect-error: intentional invalid input
//     await expect(fetchPhasesByCampaignId(null, token)).rejects.toThrow(
//       "Invalid campaignId: must be a non-empty string"
//     );
//   });

//   it("❌ Invalid Partition: campaignId = undefined", async () => {
//     // @ts-expect-error: intentional invalid input
//     await expect(fetchPhasesByCampaignId(undefined, token)).rejects.toThrow(
//       "Invalid campaignId: must be a non-empty string"
//     );
//   });

//   it("❌ Invalid Partition: campaignId = 123 (number)", async () => {
//     // @ts-expect-error: intentional invalid input
//     await expect(fetchPhasesByCampaignId(123, token)).rejects.toThrow(
//       "Invalid campaignId: must be a non-empty string"
//     );
//   });

//   it("❌ Invalid Partition: campaignId = {} (object)", async () => {
//     // @ts-expect-error: intentional invalid input
//     await expect(fetchPhasesByCampaignId({}, token)).rejects.toThrow(
//       "Invalid campaignId: must be a non-empty string"
//     );
//   });
// });

// describe("submitTaskApi", () => {
//   const mockTaskId = "123";
//   const mockContent = "Test content";
//   const mockImages = [new File(["test"], "test.jpg", { type: "image/jpeg" })];
//   const mockToken = "test-token";

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should submit task successfully", async () => {
//     // Mock successful response
//     const mockResponse = {
//       data: {
//         _id: mockTaskId,
//         submission: {
//           content: mockContent,
//           images: ["image1.jpg", "image2.jpg"],
//           submittedAt: new Date().toISOString(),
//           submittedBy: "user123",
//         },
//         status: "submitted",
//       },
//     };

//     mockedAxios.post.mockResolvedValue(mockResponse);

//     // Call the function
//     const result = await submitTaskApi(
//       mockTaskId,
//       mockContent,
//       mockImages,
//       mockToken
//     );

//     // Verify the result
//     expect(result).toEqual(mockResponse.data);

//     // Verify axios was called with correct parameters
//     expect(mockedAxios.post).toHaveBeenCalledWith(
//       `http://localhost:4000/task/${mockTaskId}/submit`,
//       expect.any(FormData),
//       {
//         headers: {
//           Authorization: `Bearer ${mockToken}`,
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     // Verify FormData was constructed correctly
//     const formData = mockedAxios.post.mock.calls[0][1] as FormData;
//     expect(formData.get("content")).toBe(mockContent);
//     // Note: FormData's entries for files can't be easily checked in Jest
//   });

//   it("should handle 404 error (task not found)", async () => {
//     // Mock error response
//     const mockError = {
//       response: {
//         status: 404,
//         data: { message: "Task không tồn tại" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     // Call and verify the error
//     await expect(
//       submitTaskApi(mockTaskId, mockContent, mockImages, mockToken)
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle 400 error (task already submitted)", async () => {
//     // Mock error response
//     const mockError = {
//       response: {
//         status: 400,
//         data: { message: "Task đã được leader nộp" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     // Call and verify the error
//     await expect(
//       submitTaskApi(mockTaskId, mockContent, mockImages, mockToken)
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle 403 error (not leader)", async () => {
//     // Mock error response
//     const mockError = {
//       response: {
//         status: 403,
//         data: { message: "Chỉ leader được phép nộp task" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     // Call and verify the error
//     await expect(
//       submitTaskApi(mockTaskId, mockContent, mockImages, mockToken)
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle network error", async () => {
//     // Mock network error
//     const mockError = new Error("Network Error");
//     mockedAxios.post.mockRejectedValue(mockError);

//     // Call and verify the error
//     await expect(
//       submitTaskApi(mockTaskId, mockContent, mockImages, mockToken)
//     ).rejects.toEqual(mockError);
//   });
// });

// describe("reviewPeerTaskApi", () => {
//   const mockTaskId = "task123";
//   const mockRevieweeId = "user456";
//   const mockScore = 8;
//   const mockComment = "Good job!";
//   const mockToken = "test-token";
//   const mockReviewerId = "user789";

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should submit peer review successfully", async () => {
//     // Mock successful response
//     const mockResponse = {
//       data: {
//         _id: mockTaskId,
//         peerReviews: [
//           {
//             reviewer: mockReviewerId,
//             reviewee: mockRevieweeId,
//             score: mockScore,
//             comment: mockComment,
//           },
//         ],
//       },
//     };

//     mockedAxios.post.mockResolvedValue(mockResponse);

//     // Call the function
//     const result = await reviewPeerTaskApi(
//       mockTaskId,
//       mockRevieweeId,
//       mockScore,
//       mockComment,
//       mockToken
//     );

//     // Verify the result
//     expect(result).toEqual(mockResponse.data);

//     // Verify axios was called with correct parameters
//     expect(mockedAxios.post).toHaveBeenCalledWith(
//       `http://localhost:4000/task/${mockTaskId}/peer-review/${mockRevieweeId}`,
//       { score: mockScore, comment: mockComment },
//       {
//         headers: {
//           Authorization: `Bearer ${mockToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   });

//   it("should handle 404 error (task not found)", async () => {
//     const mockError = {
//       response: {
//         status: 404,
//         data: { message: "Task không tồn tại" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     await expect(
//       reviewPeerTaskApi(
//         mockTaskId,
//         mockRevieweeId,
//         mockScore,
//         mockComment,
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle 400 error (self-review attempt)", async () => {
//     const mockError = {
//       response: {
//         status: 400,
//         data: { message: "Không thể tự review bản thân" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     await expect(
//       reviewPeerTaskApi(
//         mockTaskId,
//         mockRevieweeId,
//         mockScore,
//         mockComment,
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle 400 error (duplicate review)", async () => {
//     const mockError = {
//       response: {
//         status: 400,
//         data: { message: "Bạn đã review người này rồi" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     await expect(
//       reviewPeerTaskApi(
//         mockTaskId,
//         mockRevieweeId,
//         mockScore,
//         mockComment,
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle network error", async () => {
//     const mockError = new Error("Network Error");
//     mockedAxios.post.mockRejectedValue(mockError);

//     await expect(
//       reviewPeerTaskApi(
//         mockTaskId,
//         mockRevieweeId,
//         mockScore,
//         mockComment,
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });

//   it("should validate score range (server-side)", async () => {
//     const mockError = {
//       response: {
//         status: 400,
//         data: { message: "Score must be between 1 and 10" },
//       },
//     };
//     mockedAxios.post.mockRejectedValue(mockError);

//     await expect(
//       reviewPeerTaskApi(
//         mockTaskId,
//         mockRevieweeId,
//         11, // Invalid score
//         mockComment,
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });
// });

// describe("fetchTasksByVolunteer", () => {
//   const mockUserId = "user123";
//   const mockYear = 2023;
//   const mockMonth = 11;
//   const mockToken = "test-token";
//   const mockTasks = [
//     {
//       _id: "task1",
//       title: "Task 1",
//       description: "Description 1",
//       status: "pending",
//       phaseDayDate: "2023-11-15T00:00:00.000Z",
//       phaseName: "Phase 1",
//       campaignName: "Campaign 1",
//       campaignId: "campaign1",
//     },
//     {
//       _id: "task2",
//       title: "Task 2",
//       description: "Description 2",
//       status: "completed",
//       phaseDayDate: "2023-11-20T00:00:00.000Z",
//       phaseName: "Phase 2",
//       campaignName: "Campaign 1",
//       campaignId: "campaign1",
//     },
//   ];

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should fetch tasks by volunteer successfully", async () => {
//     // Mock successful response
//     mockedAxios.get.mockResolvedValue({ data: mockTasks });

//     // Call the function
//     const result = await fetchTasksByVolunteer(
//       mockUserId,
//       mockYear,
//       mockMonth,
//       mockToken
//     );

//     // Verify the result
//     expect(result).toEqual(mockTasks);

//     // Verify axios was called with correct parameters
//     expect(mockedAxios.get).toHaveBeenCalledWith(
//       `http://localhost:4000/task/${mockUserId}/volunteer`,
//       {
//         params: { year: mockYear, month: mockMonth },
//         headers: {
//           Authorization: `Bearer ${mockToken}`,
//         },
//       }
//     );
//   });

//   it("should handle empty result", async () => {
//     mockedAxios.get.mockResolvedValue({ data: [] });

//     const result = await fetchTasksByVolunteer(
//       mockUserId,
//       mockYear,
//       mockMonth,
//       mockToken
//     );
//     expect(result).toEqual([]);
//   });

//   it("should handle 404 error (user not found)", async () => {
//     const mockError = {
//       response: {
//         status: 404,
//         data: { message: "User not found" },
//       },
//     };
//     mockedAxios.get.mockRejectedValue(mockError);

//     await expect(
//       fetchTasksByVolunteer(mockUserId, mockYear, mockMonth, mockToken)
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle invalid month parameter", async () => {
//     const mockError = {
//       response: {
//         status: 400,
//         data: { message: "Invalid month value" },
//       },
//     };
//     mockedAxios.get.mockRejectedValue(mockError);

//     await expect(
//       fetchTasksByVolunteer(
//         mockUserId,
//         mockYear,
//         13, // Invalid month
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle network error", async () => {
//     const mockError = new Error("Network Error");
//     mockedAxios.get.mockRejectedValue(mockError);

//     await expect(
//       fetchTasksByVolunteer(mockUserId, mockYear, mockMonth, mockToken)
//     ).rejects.toEqual(mockError);
//   });

//   it("should handle invalid user ID format", async () => {
//     const mockError = {
//       response: {
//         status: 400,
//         data: { message: "Invalid userId format" },
//       },
//     };
//     mockedAxios.get.mockRejectedValue(mockError);

//     await expect(
//       fetchTasksByVolunteer(
//         "invalid-user-id", // Invalid ID
//         mockYear,
//         mockMonth,
//         mockToken
//       )
//     ).rejects.toEqual(mockError);
//   });
// });

describe("createTask", () => {
  const mockPhaseDayId = "phaseDay123";
  const mockPayload = {
    title: "Test Task",
    description: "Test Description",
    leaderId: "leader123",
    assignedUsers: ["user1", "user2"],
    phaseDayDate: new Date("2023-11-15"),
  };

  const mockResponseData = {
    _id: "task123",
    phaseDayId: mockPhaseDayId,
    title: mockPayload.title,
    description: mockPayload.description,
    leaderId: mockPayload.leaderId,
    assignedUsers: mockPayload.assignedUsers.map((userId) => ({ userId })),
    status: "in_progress",
    updatedAt: new Date().toISOString(),
    campaignId: undefined,
    peerReviews: [],
    staffReview: undefined,
  };

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(() => JSON.stringify({ token: "test-token" })),
  };

  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockReset();
    localStorageMock.getItem.mockClear();
  });

  it("should create a task successfully", async () => {
    // Mock successful response
    mockedAxios.post.mockResolvedValue({ data: { data: mockResponseData } });

    // Call the function
    const result = await createTask(mockPhaseDayId, mockPayload);

    // Verify the result
    expect(result).toEqual({
      _id: mockResponseData._id,
      phaseDayId: mockResponseData.phaseDayId,
      title: mockResponseData.title,
      description: mockResponseData.description,
      leaderId: mockResponseData.leaderId,
      assignedUsers: mockResponseData.assignedUsers,
      status: mockResponseData.status,
      updatedAt: expect.any(Date),
      campaignId: undefined,
      peerReviews: [],
      staffReview: undefined,
    });

    // Verify axios was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:4000/task/create/${mockPhaseDayId}`,
      {
        title: mockPayload.title,
        description: mockPayload.description,
        leaderId: mockPayload.leaderId,
        assignedUsers: mockPayload.assignedUsers.map((userId) => ({ userId })),
      },
      {
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("should create task without optional fields", async () => {
    const minimalPayload = {
      title: "Minimal Task",
      description: "Minimal Description",
      leaderId: "leader123",
    };

    const minimalResponse = {
      ...mockResponseData,
      title: minimalPayload.title,
      description: minimalPayload.description,
      assignedUsers: [],
    };

    mockedAxios.post.mockResolvedValue({ data: { data: minimalResponse } });

    const result = await createTask(mockPhaseDayId, minimalPayload);

    expect(result).toEqual({
      _id: minimalResponse._id,
      phaseDayId: minimalResponse.phaseDayId,
      title: minimalResponse.title,
      description: minimalResponse.description,
      leaderId: minimalResponse.leaderId,
      assignedUsers: [],
      status: minimalResponse.status,
      updatedAt: expect.any(Date),
      campaignId: undefined,
      peerReviews: [],
      staffReview: undefined,
    });
  });

  it("should handle invalid phaseDayId", async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { message: "ID phaseDay không hợp lệ" },
      },
    });

    await expect(createTask("invalid-id", mockPayload)).rejects.toThrow(
      "Failed to create task"
    );
  });

  it("should handle phaseDay not found", async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Không tìm thấy phaseDay" },
      },
    });

    await expect(
      createTask("nonExistentPhaseDay", mockPayload)
    ).rejects.toThrow("Failed to create task");
  });

  it("should handle network error", async () => {
    const networkError = new Error("Network Error");
    mockedAxios.post.mockRejectedValue(networkError);

    await expect(createTask(mockPhaseDayId, mockPayload)).rejects.toThrow(
      "Failed to create task"
    );
  });

  it("should handle missing required fields", async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { message: "Missing required fields" },
      },
    });

    await expect(
      createTask(mockPhaseDayId, {
        ...mockPayload,
        title: "string",
      })
    ).rejects.toThrow("Failed to create task");
  });

  it("should properly transform updatedAt date in response", async () => {
    const fixedDate = new Date("2023-11-15T00:00:00.000Z");
    const responseWithDates = {
      ...mockResponseData,
      updatedAt: fixedDate.toISOString(),
    };

    mockedAxios.post.mockResolvedValue({ data: { data: responseWithDates } });

    const result = await createTask(mockPhaseDayId, mockPayload);

    expect(result.updatedAt).toEqual(fixedDate);
  });
});
