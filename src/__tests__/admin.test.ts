/**
 * @jest-environment jsdom
 */

import { usersService, User } from"../apis/admin";
import { CreateManagerData, CreateStaffData ,ImportStaffData  } from '../apis/admin';
import {certificateService} from"../apis/certificate"

global.fetch = jest.fn();

// const mockManagerData: CreateManagerData = {


//   fullName: "Lê Phạm Tài Linh",
//   email: "tlinh@example.com",
//   password: "securePass123",
//   phone: "0123456789",
//   date_of_birth: "2003-01-01",
//   communeId: "Kỳ Anh ",
// };

// describe("usersService.createManager", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Tạo manager thành công", async () => {
//     const mockResponseData = {
//       data: {
//         _id: "user123",
//         ...mockManagerData,
//       },
//     };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponseData,
//     } as Response);

//     const result = await usersService.createManager(mockManagerData);

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users/manager",
//       expect.objectContaining({
//         method: "POST",
//         body: JSON.stringify(mockManagerData),
//       })
//     );

//     expect(result).toEqual({
//   _id: "user123",
//   id: "user123",
//   ...mockManagerData,
// });
//   });

//   it("Không tạo được manager nếu thiếu fullName", async () => {
//     const data = { ...mockManagerData, fullName: "" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Full name is required",
//       status: 400,
//     } as Response);

//     await expect(usersService.createManager(data)).rejects.toThrow("Server error: 400 - Full name is required");
//   });

//   it("Không tạo được manager nếu thiếu email", async () => {
//     const data = { ...mockManagerData, email: "" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Email is required",
//       status: 400,
//     } as Response);

//     await expect(usersService.createManager(data)).rejects.toThrow("Server error: 400 - Email is required");
//   });

//   it("Không tạo được manager nếu thiếu mật khẩu", async () => {
//     const data = { ...mockManagerData, password: "" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Password is required",
//       status: 400,
//     } as Response);

//     await expect(usersService.createManager(data)).rejects.toThrow("Server error: 400 - Password is required");
//   });

//   it("Server trả về lỗi bất kỳ khác", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Internal Server Error",
//       status: 500,
//     } as Response);

//     await expect(usersService.createManager(mockManagerData)).rejects.toThrow("Server error: 500 - Internal Server Error");
//   });
// });

// CreateStaff
// global.fetch = jest.fn(); // Mock global fetch

// const mockStaffData: CreateStaffData = {
//   fullName: "Nguyễn Văn An",
//   email: "an@example.com",
//   password: "securePass456",
//   phone: "0987654321",
//   date_of_birth: "1995-05-20",
// };

// describe("usersService.createStaff", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Tạo staff thành công", async () => {
//     const mockResponseData = {
//       data: {
//         _id: "staff001",
//         ...mockStaffData,
//       },
//     };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponseData,
//     } as Response);

//     const result = await usersService.createStaff(mockStaffData);

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users/create-organization",
//       expect.objectContaining({
//         method: "POST",
//         body: JSON.stringify(mockStaffData),
//       })
//     );

//     expect(result).toEqual({
//       _id: "staff001",
//       id: "staff001",
//       ...mockStaffData,
//     });
//   });

//   it("Không tạo được staff nếu thiếu fullName", async () => {
//     const data = { ...mockStaffData, fullName: "" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Full name is required",
//       status: 400,
//     } as Response);

//     await expect(usersService.createStaff(data)).rejects.toThrow(
//       "Server error: 400 - Full name is required"
//     );
//   });

//   it("Không tạo được staff nếu thiếu email", async () => {
//     const data = { ...mockStaffData, email: "" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Email is required",
//       status: 400,
//     } as Response);

//     await expect(usersService.createStaff(data)).rejects.toThrow(
//       "Server error: 400 - Email is required"
//     );
//   });

//   it("Không tạo được staff nếu thiếu mật khẩu", async () => {
//     const data = { ...mockStaffData, password: "" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Password is required",
//       status: 400,
//     } as Response);

//     await expect(usersService.createStaff(data)).rejects.toThrow(
//       "Server error: 400 - Password is required"
//     );
//   });

//   it("Xử lý lỗi khi server trả lỗi không xác định", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Something went wrong",
//       status: 500,
//     } as Response);

//     await expect(usersService.createStaff(mockStaffData)).rejects.toThrow(
//       "Server error: 500 - Something went wrong"
//     );
//   });
// });

//ImportStaffData
// global.fetch = jest.fn();

// const mockFile = new File(["fake content"], "staffs.xlsx", {
//   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// });

// const mockData: ImportStaffData = {
//   file: mockFile,
//   role: "staff",
// };

// describe("usersService.importStaff", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Import staff thành công", async () => {
//     const mockResponse = {
//       successCount: 2,
//       failed: [
//         { email: "invalid1@example.com", reason: "Email already exists" },
//       ],
//     };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponse,
//     } as Response);

//     const result = await usersService.importStaff(mockData);

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users/import-staffs",
//       expect.objectContaining({
//         method: "POST",
//         body: expect.any(FormData),
//       })
//     );

//     expect(result).toEqual(mockResponse);
//   });

//   it("Import thất bại do server lỗi", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Invalid file format",
//       status: 400,
//     } as Response);

//     await expect(usersService.importStaff(mockData)).rejects.toThrow(
//       "Server error: 400 - Invalid file format"
//     );
//   });
// });

//DisableUser
// global.fetch = jest.fn();

// describe("usersService.disableUser", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Vô hiệu hoá user thành công", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//     } as Response);

//     await expect(usersService.disableUser("user123")).resolves.toBeUndefined();

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users/user123/disable",
//       expect.objectContaining({
//         method: "PATCH",
//         headers: expect.objectContaining({
//           "Content-Type": "application/json",
//         }),
//       })
//     );
//   });

//   it("Vô hiệu hoá user thất bại với lỗi từ server", async () => {
//     const mockError = { message: "User not found" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       json: async () => mockError,
//     } as Response);

//     await expect(usersService.disableUser("invalidId")).rejects.toThrow(
//       "User not found"
//     );
//   });

//   it("Vô hiệu hoá user thất bại và không có message từ server", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       json: async () => ({}),
//     } as Response);

//     await expect(usersService.disableUser("anyId")).rejects.toThrow(
//       "Failed to disable user"
//     );
//   });
// });

//enableUser
// global.fetch = jest.fn();

// describe("usersService.enableUser", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Kích hoạt user thành công", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//     } as Response);

//     await expect(usersService.enableUser("user123")).resolves.toBeUndefined();

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users/user123/enable",
//       expect.objectContaining({
//         method: "PATCH",
//         headers: expect.objectContaining({
//           "Content-Type": "application/json",
//         }),
//       })
//     );
//   });

//   it("Kích hoạt user thất bại với message từ server", async () => {
//     const mockError = { message: "User not found" };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       json: async () => mockError,
//     } as Response);

//     await expect(usersService.enableUser("invalidId")).rejects.toThrow(
//       "User not found"
//     );
//   });

//   it("Kích hoạt user thất bại và không có message từ server", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       json: async () => ({}),
//     } as Response);

//     await expect(usersService.enableUser("anyId")).rejects.toThrow(
//       "Failed to enable user"
//     );
//   });
// });

//getAllCommunes
// global.fetch = jest.fn();

// describe("usersService.getAllCommunes", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Lấy danh sách communes thành công", async () => {
//     const mockResponse = [
//       {
//         _id: "c1",
//         name: "Phường 1",
//         district: "Quận 1",
//         province: "TP.HCM",
//       },
//       {
//         id: "c2",
//         name: "Xã 2",
//         district: "Huyện A",
//         province: "Tỉnh B",
//       },
//     ];

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponse,
//     } as Response);

//     const result = await usersService.getAllCommunes();

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users/commune",
//       expect.objectContaining({
//         method: "GET",
//         headers: expect.objectContaining({
//           "Content-Type": "application/json",
//         }),
//       })
//     );

//     expect(result).toEqual([
//       {
//         id: "c1",
//         name: "Phường 1",
//         district: "Quận 1",
//         province: "TP.HCM",
//       },
//       {
//         id: "c2",
//         name: "Xã 2",
//         district: "Huyện A",
//         province: "Tỉnh B",
//       },
//     ]);
//   });

//   it("Lỗi khi không lấy được communes", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//     } as Response);

//     await expect(usersService.getAllCommunes()).rejects.toThrow(
//       "Failed to fetch communes"
//     );
//   });
// });

// global.fetch = jest.fn();

// describe("usersService.getAllUsers", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Lấy danh sách users thành công không có filters", async () => {
//     const mockResponse = {
//       data: [
//         {
//           _id: "u1",
//           fullName: "Nguyễn Văn A",
//           email: "a@example.com",
//           date_of_birth: "2000-01-01",
//           status: "inactive",
//         },
//         {
//           id: "u2",
//           fullName: "Trần Thị B",
//           email: "b@example.com",
//           // thiếu date_of_birth và status
//         },
//       ],
//     };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponse,
//     } as Response);

//     const result = await usersService.getAllUsers();

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users",
//       expect.objectContaining({
//         method: "GET",
//         headers: expect.objectContaining({
//           "Content-Type": "application/json",
//         }),
//       })
//     );

//     expect(result).toEqual([
//       {
//         _id: "u1",
//         id: "u1",
//         fullName: "Nguyễn Văn A",
//         email: "a@example.com",
//         date_of_birth: "2000-01-01",
//         status: "inactive",
//       },
//       {
//         id: "u2",
//         fullName: "Trần Thị B",
//         email: "b@example.com",
//         date_of_birth: "",
//         status: "active",
//       },
//     ]);
//   });

//   it("Lấy danh sách users thành công với filters", async () => {
//     const mockResponse = {
//       data: [
//         {
//           _id: "u3",
//           fullName: "Filtered User",
//           email: "filter@example.com",
//         },
//       ],
//     };

//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponse,
//     } as Response);

//     const filters = { role: "staff", district: "Q1", province: "TPHCM" };
//     const result = await usersService.getAllUsers(filters);

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/users?role=staff&district=Q1&province=TPHCM",
//       expect.anything()
//     );

//     expect(result).toEqual([
//       {
//         _id: "u3",
//         id: "u3",
//         fullName: "Filtered User",
//         email: "filter@example.com",
//         date_of_birth: "",
//         status: "active",
//       },
//     ]);
//   });

//   it("Lỗi khi không lấy được danh sách users", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//     } as Response);

//     await expect(usersService.getAllUsers()).rejects.toThrow("Failed to fetch users");
//   });
// });

//getCategory


// describe("certificateService.getCertificatesByUser", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   const mockCertificates = [
//     {
//       _id: "cert1",
//       campaignId: {
//         _id: "camp1",
//         name: "Chiến dịch 1",
//       },
//       volunteerId: "vol1",
//       fileUrl: "https://example.com/cert1.pdf",
//       verifyCode: "VCODE123",
//       createdAt: "2024-01-01T00:00:00Z",
//     },
//     {
//       id: "cert2", // fallback từ id
//       campaignId: {
//         _id: "camp2",
//         name: "Chiến dịch 2",
//       },
//       volunteerId: "vol2",
//       fileUrl: "https://example.com/cert2.pdf",
//       verifyCode: "VCODE456",
//       createdAt: "2024-02-01T00:00:00Z",
//     },
//   ];

//   it("Lấy danh sách chứng nhận thành công", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({ result: mockCertificates }),
//     } as Response);

//     const result = await certificateService.getCertificatesByUser();

//     expect(fetch).toHaveBeenCalledWith(
//       "http://localhost:4000/certificate/user",
//       expect.objectContaining({
//         method: "GET",
//         headers: expect.any(Object),
//       })
//     );

//     expect(result).toHaveLength(2);
//     expect(result[0]).toMatchObject({
//       _id: "cert1",
//       campaignId: {
//         _id: "camp1",
//         name: "Chiến dịch 1",
//       },
//       volunteerId: "vol1",
//       fileUrl: "https://example.com/cert1.pdf",
//       verifyCode: "VCODE123",
//       createdAt: new Date("2024-01-01T00:00:00Z"),
//     });

//     expect(result[1]).toMatchObject({
//       _id: "cert2",
//       campaignId: {
//         _id: "camp2",
//         name: "Chiến dịch 2",
//       },
//       volunteerId: "vol2",
//       fileUrl: "https://example.com/cert2.pdf",
//       verifyCode: "VCODE456",
//       createdAt: new Date("2024-02-01T00:00:00Z"),
//     });
//   });

//   it("Trả về [] nếu server trả về lỗi", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
//       ok: false,
//       text: async () => "Unauthorized",
//       status: 401,
//     } as Response);

//     const result = await certificateService.getCertificatesByUser();
//     expect(result).toEqual([]);
//   });

//   it("Trả về [] nếu xảy ra lỗi mạng", async () => {
//     (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
//       new Error("Network error")
//     );

//     const result = await certificateService.getCertificatesByUser();
//     expect(result).toEqual([]);
//   });
// });

// beforeAll(() => {
//   jest.spyOn(console, "error").mockImplementation(() => {});
// });

// afterEach(() => {
//   jest.clearAllMocks();
// });
 
// describe("certificateService.getCertificatesByCampaign", () => {
//   const campaignId = "abc123";

//   it("trả về danh sách chứng nhận thành công", async () => {
//     const mockResponseData = {
//       result: [
//         {
//           _id: "cert1",
//           campaignId: {
//             _id: "camp123",
//             name: "Chiến dịch ABC",
//           },
//           createdAt: "2025-08-07T12:00:00Z",
//         },
//       ],
//     };

//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponseData,
//     });

//     const result = await certificateService.getCertificatesByCampaign(campaignId);

//     expect(fetch).toHaveBeenCalledWith(
//       `http://localhost:4000/certificate/campaign/${campaignId}`,
//       expect.objectContaining({
//         method: "GET",
//         headers: expect.any(Object),
//       })
//     );

//     expect(result).toEqual([
//       {
//         _id: "cert1",
//         campaignId: {
//           _id: "camp123",
//           name: "Chiến dịch ABC",
//         },
//         createdAt: new Date("2025-08-07T12:00:00Z"),
//       },
//     ]);
//   });

//   it("trả về mảng rỗng nếu response.ok là false", async () => {
//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: false,
//       status: 404,
//       text: async () => "Not Found",
//     });

//     const result = await certificateService.getCertificatesByCampaign(campaignId);

//     expect(console.error).toHaveBeenCalled();
//     expect(result).toEqual([]);
//   });

//   it("trả về mảng rỗng nếu xảy ra lỗi trong quá trình gọi API", async () => {
//     (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

//     const result = await certificateService.getCertificatesByCampaign(campaignId);

//     expect(console.error).toHaveBeenCalled();
//     expect(result).toEqual([]);
//   });

//   it("nếu campaignId trong response không có _id thì dùng id thay thế", async () => {
//     const mockResponseData = {
//       result: [
//         {
//           id: "certX",
//           campaignId: {
//             _id: "camp456",
//             name: "Chiến dịch XYZ",
//           },
//           createdAt: "2025-08-01T10:00:00Z",
//         },
//       ],
//     };

//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockResponseData,
//     });

//     const result = await certificateService.getCertificatesByCampaign(campaignId);

//     expect(result[0]._id).toBe("certX");
//   });

//   it("trả về mảng rỗng nếu result là undefined", async () => {
//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({}),
//     });

//     const result = await certificateService.getCertificatesByCampaign(campaignId);

//     expect(result).toEqual([]);
//   });
// });
//deleteCertificate
// describe("certificateService.deleteCertificate", () => {
//   const certificateId = "cert123";

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("Xoá certificate thành công (status 200)", async () => {
//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: true,
//       json: jest.fn().mockResolvedValueOnce({ success: true }),
//     });

//     await expect(certificateService.deleteCertificate(certificateId)).resolves.toBeDefined();

//     expect(fetch).toHaveBeenCalledWith(
//       `http://localhost:4000/certificate/${certificateId}`,
//       expect.objectContaining({
//         method: "DELETE",
//         headers: expect.any(Object),
//       })
//     );
//   });

//   it("Xoá certificate thất bại (status 404)", async () => {
//     (fetch as jest.Mock).mockResolvedValueOnce({
//       ok: false,
//       status: 404,
//       text: jest.fn().mockResolvedValueOnce("Not Found"),
//     });

//     await expect(certificateService.deleteCertificate(certificateId)).rejects.toThrow(
//       "Failed to delete certificate: 404 - Not Found"
//     );

//     expect(fetch).toHaveBeenCalledTimes(1);
//   });

//   it("Xoá certificate bị lỗi mạng hoặc server", async () => {
//     (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

//     await expect(certificateService.deleteCertificate(certificateId)).rejects.toThrow("Network Error");

//     expect(fetch).toHaveBeenCalledWith(
//       `http://localhost:4000/certificate/${certificateId}`,
//       expect.any(Object)
//     );
//   });
// });

describe("certificateService.downloadCertificate", () => {
  const certificateId = "abc123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("nên trả về URL khi tải thành công", async () => {
    const mockUrl = "https://example.com/certificate.pdf";

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      url: mockUrl,
    });

    const result = await certificateService.downloadCertificate(certificateId);

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:4000/certificate/${certificateId}/download`,
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Object),
      })
    );
    expect(result).toBe(mockUrl);
  });

  it("nên throw lỗi khi response không ok", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "Not Found",
    });

    await expect(
      certificateService.downloadCertificate(certificateId)
    ).rejects.toThrow("Failed to download certificate: 404 - Not Found");
  });

  it("nên throw lỗi khi fetch bị lỗi", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    await expect(
      certificateService.downloadCertificate(certificateId)
    ).rejects.toThrow("Network error");
  });
});