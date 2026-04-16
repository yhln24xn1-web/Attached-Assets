# PHÂN LOẠI CẦU THANG — Quy tắc thiết kế & kích thước chuẩn

## 1. Phân loại theo hình dạng mặt bằng

### 1.1 Thang thẳng (Straight Stair)
- Một nhịp, không đổi chiều
- **Phù hợp:** Nhà phố hẹp ≤ 4m, không gian tối giản
- **Chiều dài cần:** `stepCount × treadMm` (thường 3.5–5.5m)
- **Ưu điểm:** Đơn giản thi công, rẻ nhất
- **Nhược điểm:** Chiếm dài trục, khó layout khi lô ngắn

### 1.2 Thang L (Quarter-turn)
- Hai nhịp vuông góc, có chiếu nghỉ ở góc
- **Phù hợp:** Nhà phố 4–6m, tối ưu góc nhà
- **Chiều nghỉ tối thiểu:** 1.1 × 1.1m
- **Ưu điểm:** Linh hoạt layout, che khuất hướng leo

### 1.3 Thang U (Half-turn / Switchback)
- Hai nhịp song song, đổi chiều 180°
- **Phù hợp:** Nhà phố hẹp cần tiết kiệm chiều dài
- **Khoảng trống giữa hai nhịp:** ≥ 100mm
- **Tổng chiều rộng cần:** `(stairWidth × 2) + khoảng hở`

### 1.4 Thang xoắn / Thang tròn (Spiral / Circular)
- Xoay quanh trụ giữa hoặc cong mềm
- **Phù hợp:** Biệt thự, không gian đặc biệt, loft
- **Đường kính tối thiểu (xoắn):** 1.4m
- **Góc mỗi bậc:** 20–30° (xoắn), liên tục (tròn)
- **Hạn chế:** Không thể dùng làm thang thoát hiểm chính

### 1.5 Thang chữ Z (Multi-turn)
- Ba nhịp trở lên, dùng cho nhà 4–5 tầng
- **Lưu ý:** Mỗi chiếu nghỉ phải ≥ 1.1m

---

## 2. Kích thước bậc thang chuẩn

| Thông số | Tối thiểu | Khuyến nghị | Tối đa |
|---|---|---|---|
| Bậc đứng (riser) | 140mm | 165mm | 190mm |
| Bậc ngang (tread) | 240mm | 280mm | 320mm |
| Chiều rộng thang | 900mm | 1100mm | — |
| Chiều nghỉ tối thiểu | 1100mm | 1200mm | — |

### Công thức tiện nghi (Blondel)
```
2 × riser + tread = 600–640mm
```
Ví dụ chuẩn: 2 × 165 + 300 = 630mm ✅

---

## 3. Yêu cầu theo số tầng

| Số tầng | Loại khuyến nghị | Số bậc / tầng (≈3.3m sàn) |
|---|---|---|
| 1 → 2 | Thang L hoặc thẳng | 20 bậc |
| 2 → 3 | Thang U hoặc L | 20 bậc |
| 3 → 4 | Thang U | 20 bậc |
| 4 → 5 | Thang U hoặc Z | 20 bậc |

Công thức: `stepCount = round(floorHeightMm / riserMm)`

---

## 4. Vị trí thang trong layout

- **Nhà phố:** Đặt phía sau hoặc giữa nhà, tránh chiếm mặt tiền
- **Biệt thự:** Thang ở trung tâm hoặc sảnh chính (thang đại sảnh)
- **Văn phòng:** Gần thang máy, cách cửa thoát hiểm ≤ 30m
- **Không xếp thang dưới phòng ngủ** — ảnh hưởng âm thanh

---

## 5. Quy tắc thoát hiểm (TCVN 3890)

- Nhà ≥ 5 tầng hoặc > 300m² sàn: phải có **thang bộ thoát hiểm bao kín**
- Chiều rộng thang thoát hiểm: ≥ 1100mm
- Tường quanh thang thoát hiểm: chịu lửa ≥ 2 giờ
- Không dùng thang xoắn làm thang thoát hiểm
