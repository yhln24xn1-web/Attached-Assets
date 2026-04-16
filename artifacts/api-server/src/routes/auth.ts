import { Router } from "express";
import { createSession, destroySession, getSession } from "../lib/session";
import { createUser, toPublicUser, verifyCredentials } from "../lib/users";

const router = Router();

router.post("/login", (req, res) => {
  const { phone, password } = req.body as { phone?: string; password?: string };

  if (!phone || !password) {
    res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    return;
  }

  const user = verifyCredentials(phone, password);
  if (!user) {
    res.status(401).json({ message: "Số điện thoại hoặc mật khẩu không đúng" });
    return;
  }

  const pub = toPublicUser(user);
  createSession(res, pub);

  res.json({ success: true, user: pub });
});

router.post("/register", (req, res) => {
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

  try {
    const user = createUser({
      fullName,
      phone,
      email: email ?? "",
      password,
    });
    const pub = toPublicUser(user);
    createSession(res, pub);
    res.status(201).json({ success: true, user: pub });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Đăng ký thất bại";
    res.status(409).json({ message: msg });
  }
});

router.post("/logout", (req, res) => {
  destroySession(req, res);
  res.json({ success: true });
});

router.get("/me", (req, res) => {
  const user = getSession(req);
  if (!user) {
    res.status(401).json({ message: "Chưa đăng nhập" });
    return;
  }
  res.json({ user });
});

export default router;
