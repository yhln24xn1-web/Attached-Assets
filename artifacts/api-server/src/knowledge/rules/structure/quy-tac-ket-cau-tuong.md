# QUY TẮC KẾT CẤU TƯỜNG — Tiêu chuẩn & Ràng buộc layout

## 1. Phân loại tường theo chức năng

### 1.1 Tường chịu lực (Load-bearing wall)
- **Chiều dày:** 200–220mm (gạch đặc) hoặc 175–200mm (block bê tông)
- **Vị trí:** Dọc theo trục kết cấu, đặt trên móng liên tục
- **Ràng buộc:**
  - Không được đục thông hoặc phá bỏ
  - Lỗ cửa phải có lanh tô (lintel) bê tông cốt thép
  - Lỗ cửa tối đa ≤ 50% chiều dài tường
- **Tối thiểu khoảng cách 2 lỗ:** 500mm
- **Gắn nhãn:** `type: "load_bearing"`

### 1.2 Tường ngăn (Partition wall)
- **Chiều dày:** 100–150mm (gạch rỗng, block nhẹ, tấm ALC)
- **Vị trí:** Chia phòng, không chịu lực từ sàn trên
- **Ràng buộc:**
  - Có thể tháo dỡ khi cải tạo (cần kiểm tra)
  - Không đặt tường ngăn lên dầm nhỏ hoặc sàn mỏng
- **Gắn nhãn:** `type: "partition"`

### 1.3 Tường ngoại thất (Exterior wall)
- **Chiều dày:** 200–300mm (gồm lớp hoàn thiện)
- **Yêu cầu:** Cách nhiệt, chống thấm, chống nắng
- **Hướng Tây:** Bắt buộc lớp cách nhiệt hoặc tường đôi (double wall)
- **Lớp cấu tạo điển hình:**
  ```
  Vữa ngoài 15mm + Gạch 200mm + Vữa trong 15mm + Sơn
  ```
- **Gắn nhãn:** `type: "exterior"`

### 1.4 Tường lõi cứng (Shear wall / Core wall)
- **Áp dụng:** Nhà ≥ 4 tầng, vùng gió mạnh, có tầng hầm
- **Chiều dày:** ≥ 200mm bê tông cốt thép
- **Vị trí:** 2 đầu hồi hoặc trung tâm mặt bằng
- **Gắn nhãn:** `type: "shear_wall"`

---

## 2. Kích thước lỗ cửa tiêu chuẩn

### Cửa đi
| Loại | Rộng (mm) | Cao (mm) |
|---|---|---|
| Cửa toilet/WC | 700–800 | 2000–2100 |
| Cửa phòng ngủ | 800–900 | 2100 |
| Cửa phòng khách | 900–1000 | 2100–2400 |
| Cửa chính | 1000–1200 | 2100–2400 |
| Cửa đôi | 1400–1800 | 2100–2700 |
| Cửa garage | 2400–2800 | 2200–2400 |

### Cửa sổ
| Loại | Rộng (mm) | Cao (mm) | Bậu thấp nhất |
|---|---|---|---|
| Cửa sổ nhỏ | 600–900 | 600–1000 | 900mm (từ sàn) |
| Cửa sổ phòng | 1000–1500 | 1000–1400 | 800mm |
| Cửa sổ lớn / cửa kính | 1500–2400 | 1800–2400 | ≥ 1100mm (lan can) |

---

## 3. Quy tắc đặt tường trong layout

### 3.1 Khoảng cách tối thiểu giữa các tường
- Hai tường song song: ≥ tổng chiều dày + 100mm khe hở kỹ thuật
- Tường ngăn với cột bê tông: ≥ 0 (có thể gắn vào cột)

### 3.2 Quy tắc góc vuông
- Góc tường giao nhau phải là **90°** (trừ thiết kế góc xiên chủ ý)
- Snap grid 100mm — không bố trí tường lệch < 50mm so với grid

### 3.3 Tường ẩm (phòng WC, bếp)
- **Bắt buộc chống thấm** mặt trong đến độ cao 1.8m
- Không xây tường ngăn thạch cao ướt nếu không có lớp chống thấm
- Khoảng hở thông gió: ≥ 150cm² (cửa gió hoặc lỗ thông)

---

## 4. Hệ số tường theo loại công trình

| Loại | Tỷ lệ tường / tổng diện tích sàn |
|---|---|
| Nhà phố nhỏ (≤ 5m) | 15–18% |
| Nhà phố trung bình | 12–15% |
| Biệt thự | 10–13% |
| Văn phòng mở | 8–10% |

---

## 5. Quy tắc xung đột (Conflict rules)

```
wall.thickness ∈ [100, 200, 220, 300] mm  — chỉ dùng giá trị chuẩn
load_bearing.holes ≤ 50% wallLength       — lỗ không được > 50% chiều dài
partition.onBeam == false                 — không đặt tường ngăn nặng lên dầm nhỏ
exterior.west.hasInsulation == true       — mặt Tây bắt buộc cách nhiệt
shear_wall.required if floors >= 4       — nhà ≥ 4 tầng phải có lõi cứng
```
