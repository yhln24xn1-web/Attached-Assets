import { z } from "zod";

export const basicInfoSchema = z.object({
  projectName: z
    .string()
    .min(3, "Tên dự án tối thiểu 3 ký tự")
    .max(100, "Tên dự án tối đa 100 ký tự"),
  lotWidth: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(3, "Chiều rộng tối thiểu 3m")
    .max(20, "Chiều rộng tối đa 20m"),
  lotLength: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(5, "Chiều dài tối thiểu 5m")
    .max(60, "Chiều dài tối đa 60m"),
  floors: z.coerce
    .number()
    .int()
    .min(1, "Vui lòng chọn số tầng")
    .max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  bedrooms: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .int()
    .min(0, "Số phòng ngủ không âm")
    .max(20, "Tối đa 20 phòng ngủ"),
  bathrooms: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .int()
    .min(1, "Tối thiểu 1 phòng tắm")
    .max(20, "Tối đa 20 phòng tắm"),
  budget: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(100, "Ngân sách tối thiểu 100 triệu")
    .max(50000, "Ngân sách tối đa 50,000 triệu"),
});
