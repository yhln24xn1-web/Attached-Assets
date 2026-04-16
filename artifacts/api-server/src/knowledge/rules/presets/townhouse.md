# PRESET: NHÀ PHỐ (Townhouse)

## Định nghĩa
Nhà liền kề trên lô đất hẹp (3–8m chiều ngang), xây nhiều tầng để tối ưu diện tích sàn, phổ biến tại đô thị Việt Nam.

---

## 1. Thông số lô đất điển hình

| Thông số | Nhỏ | Trung bình | Lớn |
|---|---|---|---|
| Chiều ngang (m) | 3–4.5 | 4.5–6 | 6–9 |
| Chiều sâu (m) | 10–15 | 15–25 | 20–40 |
| Diện tích (m²) | 40–75 | 80–180 | 150–350 |
| Số tầng phổ biến | 2–3 | 3–4 | 3–5 |

---

## 2. Giật lùi mặc định

```
front:  4.5m  (bắt buộc theo quy hoạch đô thị)
rear:   2.0m  (tối thiểu)
left:   0m    (lô liền kề — tường chung)
right:  0m    (lô liền kề — tường chung)
```

**Trường hợp lô góc:** left hoặc right = 1.5–2.0m

---

## 3. Quy tắc phân tầng điển hình

### Lô 3–4.5m × 15m (nhà phố nhỏ)
```
Tầng 1:  Sảnh + Garage (nếu có) + Bếp + WC phụ
Tầng 2:  Phòng khách + Bàn ăn + Ban công mặt tiền
Tầng 3:  2 Phòng ngủ + 1–2 WC
Tầng 4+: Phòng ngủ chính (master) + Sân thượng
```

### Lô 5–6m × 20m (nhà phố trung bình)
```
Tầng 1:  Sảnh + Garage + Phòng khách + Bếp + WC khách
Tầng 2:  Phòng sinh hoạt + Bàn ăn + Ban công
Tầng 3:  2–3 Phòng ngủ + 2 WC
Tầng 4+: Phòng ngủ chính + WC riêng + Sân thượng
```

---

## 4. Thông số kỹ thuật chuẩn

| Thông số | Giá trị |
|---|---|
| Chiều cao tầng | 3.2–3.6m |
| Độ cao thông thủy tối thiểu | 2.7m |
| Độ dày sàn bê tông | 120–150mm |
| Tường ngoài | 200mm gạch + 30mm vữa |
| Tường ngăn | 100–120mm gạch rỗng |
| Mái bằng chống thấm | 4 lớp (bê tông + xốp + chống thấm + gạch) |

---

## 5. Ràng buộc thiết kế

```
coveragePct  ≤ 75%
FAR          ≤ 4.0
minLotWidth  ≥ 3m (để có thể xây được)
stairType    = "L" hoặc "U" (không dùng thẳng nếu lô < 5m sâu)
garage       = optional (bắt buộc nếu lotWidth ≥ 4.5m và khách yêu cầu)
altarRoom    = thường đặt tầng 2 hoặc tầng 1 phía sau
```

---

## 6. Đơn giá tham khảo (2025)

| Phân khúc | Đơn giá (tr/m²) | Đặc điểm |
|---|---|---|
| Tiết kiệm | 4.0–5.0 | Hoàn thiện cơ bản, nội thất đơn giản |
| Trung cấp | 5.5–7.0 | Gạch cao cấp, cửa nhôm kính |
| Cao cấp | 7.5–10 | Đá ốp lát, hệ thống smarthome |

---

## 7. Phong cách nội thất phù hợp

Thứ tự ưu tiên: **Modern > Minimalist > Industrial > Indochine > Scandinavian**

Không khuyến nghị: Tropical (thiếu không gian sân vườn)
