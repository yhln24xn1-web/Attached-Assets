import { Router } from "express";

const router = Router();

router.post("/login", async (req, res) => {
  const { phone, password } = req.body as { phone?: string; password?: string };

  if (!phone || !password) {
    res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    return;
  }

  res.json({ success: true, message: "Đăng nhập thành công", user: { phone } });
});

router.post("/register", async (req, res) => {
  const { fullName, phone, email, password } = req.body as {
    fullName?: string;
    phone?: string;
    email?: string;
    password?: string;
  };

  if (!fullName || !phone || !password) {
    res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    return;
  }

  res.status(201).json({
    success: true,
    message: "Đăng ký thành công",
    user: { fullName, phone, email },
  });
});

export default router;
