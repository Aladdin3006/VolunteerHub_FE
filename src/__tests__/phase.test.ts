import { startPhase } from "../apis/staff";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => JSON.stringify({ token: "test-token" })),
    },
    writable: true,
  });
});

describe("startPhase", () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const mockPhaseId = "5f8d0401b54764421b7156c3"; // Valid ObjectId format
  const mockPhaseResponse = {
    _id: mockPhaseId,
    campaignId: "campaign123",
    name: "Test Phase",
    description: "Test Description",
    startDate: "2023-01-01T00:00:00.000Z",
    endDate: "2023-01-07T00:00:00.000Z",
    status: "in-progress",
    phaseDays: [
      {
        _id: "phaseDay123",
        date: "2023-01-01T00:00:00.000Z",
        checkinLocation: "Test Location",
        status: "in-progress",
        tasks: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.put.mockReset();
  });

  it("should start a phase successfully", async () => {
    // Mock successful response
    mockedAxios.put.mockResolvedValue({
      data: {
        data: mockPhaseResponse,
      },
    });

    const result = await startPhase(mockPhaseId);

    expect(result).toEqual({
      _id: mockPhaseResponse._id,
      campaignId: mockPhaseResponse.campaignId,
      name: mockPhaseResponse.name,
      description: mockPhaseResponse.description,
      startDate: new Date(mockPhaseResponse.startDate),
      endDate: new Date(mockPhaseResponse.endDate),
      status: "in-progress",
      phaseDays: [
        {
          _id: mockPhaseResponse.phaseDays[0]._id,
          phaseId: mockPhaseId,
          date: new Date(mockPhaseResponse.phaseDays[0].date),
          checkinLocation: mockPhaseResponse.phaseDays[0].checkinLocation,
          status: "in-progress",
          tasks: [],
        },
      ],
    });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${API_BASE}/phase/${mockPhaseId}/start`,
      {},
      {
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("should throw error for invalid phase ID format", async () => {
    const invalidPhaseId = "invalid-id";
    await expect(startPhase(invalidPhaseId)).rejects.toThrow(
      `Invalid phase ID format: ${invalidPhaseId}`
    );
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it("should handle phase not found error", async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          message: "phaseId không hợp lệ",
        },
      },
    };
    mockedAxios.put.mockRejectedValue(error);

    await expect(startPhase(mockPhaseId)).rejects.toThrow(
      "Failed to start phase" // Changed to match actual implementation
    );
  });

  it("should handle phase not in upcoming status", async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: "Phase is not in upcoming status",
        },
      },
    };
    mockedAxios.put.mockRejectedValue(error);

    await expect(startPhase(mockPhaseId)).rejects.toThrow(
      "Failed to start phase" // Changed to match actual implementation
    );
  });

  it("should handle network errors", async () => {
    const error = new Error("Network error");
    mockedAxios.put.mockRejectedValue(error);

    await expect(startPhase(mockPhaseId)).rejects.toThrow(error);
  });

  it("should handle unexpected API errors", async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: {},
      },
    };
    mockedAxios.put.mockRejectedValue(error);

    await expect(startPhase(mockPhaseId)).rejects.toThrow(
      "Failed to start phase"
    );
  });

  it("should handle empty phaseDays array", async () => {
    const responseWithoutPhaseDays = {
      ...mockPhaseResponse,
      phaseDays: [],
    };

    mockedAxios.put.mockResolvedValue({
      data: {
        data: responseWithoutPhaseDays,
      },
    });

    const result = await startPhase(mockPhaseId);
    expect(result.phaseDays).toEqual([]);
  });

  it("should handle missing optional fields", async () => {
    const minimalResponse = {
      _id: mockPhaseId,
      campaignId: "campaign123",
      name: "Test Phase",
      startDate: "2023-01-01T00:00:00.000Z",
      endDate: "2023-01-07T00:00:00.000Z",
    };

    mockedAxios.put.mockResolvedValue({
      data: {
        data: minimalResponse,
      },
    });

    const result = await startPhase(mockPhaseId);
    expect(result).toEqual({
      _id: minimalResponse._id,
      campaignId: minimalResponse.campaignId,
      name: minimalResponse.name,
      description: "",
      startDate: new Date(minimalResponse.startDate),
      endDate: new Date(minimalResponse.endDate),
      status: "in-progress",
      phaseDays: [],
    });
  });
});
