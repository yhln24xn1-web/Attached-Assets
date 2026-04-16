import type { AuthUser } from "./session";

interface StoredUser extends AuthUser {
  password: string;
}

const USERS: StoredUser[] = [
  {
    id: "admin-001",
    phone: "0934888881",
    email: "depdecor.vn@gmail.com",
    fullName: "Admin BMT Decor",
    role: "admin",
    password: "Bao@0206",
  },
];

let nextUserId = 2;

export function findUserByPhone(phone: string): StoredUser | undefined {
  const normalized = phone.replace(/\s/g, "");
  return USERS.find((u) => u.phone.replace(/\s/g, "") === normalized);
}

export function findUserById(id: string): StoredUser | undefined {
  return USERS.find((u) => u.id === id);
}

export function createUser(data: {
  phone: string;
  email: string;
  fullName: string;
  password: string;
}): StoredUser {
  const existing = findUserByPhone(data.phone);
  if (existing) throw new Error("Số điện thoại đã được đăng ký");

  const user: StoredUser = {
    id: `user-${String(nextUserId++).padStart(3, "0")}`,
    phone: data.phone.replace(/\s/g, ""),
    email: data.email,
    fullName: data.fullName,
    role: "user",
    password: data.password,
  };
  USERS.push(user);
  return user;
}

export function verifyCredentials(
  phone: string,
  password: string
): StoredUser | null {
  const user = findUserByPhone(phone);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export function toPublicUser(user: StoredUser): AuthUser {
  const { password: _p, ...pub } = user;
  return pub;
}
