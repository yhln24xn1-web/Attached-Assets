# CÔNG THỨC TÍNH TOÁN — Nguồn quy tắc chuẩn

## 1. Công thức diện tích lô đất

```
siteArea = lotWidth × lotDepth                          (m²)
```

---

## 2. Công thức xây dựng sau giật lùi

```
buildableWidth = lotWidth  − leftSetback  − rightSetback − wallThickness×2
buildableDepth = lotDepth  − frontSetback − rearSetback  − wallThickness×2
buildableArea  = buildableWidth × buildableDepth         (m²)
```

**Giật lùi mặc định (nhà phố đô thị):**
| Hướng | Khoảng giật lùi |
|---|---|
| Mặt tiền (front) | 4.5m |
| Hậu (rear) | 2.0m |
| Trái/Phải (lô ≤ 4m) | 0.5m mỗi bên |
| Trái/Phải (lô > 4m) | 0m |

---

## 3. Công thức diện tích tổng hợp (BMT standard)

```
dienTichSan   = lotWidth × lotDepth
heSoMong      = dienTichSan × 0.5       (50% — phần nền móng)
heSoMai       = dienTichSan × 0.5       (50% — phần mái cơ bản)
tongDienTich  = heSoMong + (dienTichSan × floors) + heSoMai
```

**Ví dụ:** Lô 5×20, 3 tầng
```
dienTichSan  = 100m²
heSoMong     = 50m²
heSoMai      = 50m²
tongDienTich = 50 + (100×3) + 50 = 400m²
```

---

## 4. Công thức ngân sách sơ bộ

```
nganSachTrieu = tongDienTich × 6         (triệu VNĐ)
```

Đơn giá trọn gói trung bình: **6.000.000 VNĐ/m²** (cập nhật 2025)

| Phân khúc | Đơn giá |
|---|---|
| Phổ thông (economy) | 4.0–5.5 tr/m² |
| Trung cấp (standard) | 5.5–7.5 tr/m² |
| Cao cấp (premium) | 7.5–12 tr/m² |
| Luxury | > 12 tr/m² |

```
budgetLevel =
  costPerM2 < 5.5  → "economy"
  costPerM2 < 7.5  → "standard"
  costPerM2 < 12   → "premium"
  else             → "luxury"
```

---

## 5. Hệ số sử dụng đất (FAR)

```
totalUsableFloorArea = sum(allFloorAreas)
floorAreaRatio = totalUsableFloorArea / siteArea

Giới hạn theo loại công trình:
  Nhà phố:      FAR ≤ 4.0
  Biệt thự:     FAR ≤ 1.5
  Văn phòng:    FAR ≤ 5.0
```

---

## 6. Mật độ xây dựng (Coverage)

```
constructionCoverage = (groundFloorArea / siteArea) × 100   (%)

Giới hạn:
  Nhà phố đô thị:  ≤ 75%
  Biệt thự:        ≤ 40%
  Văn phòng:       ≤ 80%
```

---

## 7. Công thức phòng

```
roomArea = roomWidth × roomDepth   (m²)
```

**Diện tích phòng tối thiểu:**
| Loại phòng | Diện tích tối thiểu |
|---|---|
| Phòng ngủ chính | 10.8m² (3.0×3.6) |
| Phòng ngủ phụ | 8.1m² (2.7×3.0) |
| WC/Toilet | 1.8m² (1.2×1.5) |
| Phòng khách | 15.1m² (3.6×4.2) |
| Bếp + Bàn ăn | 7.2m² (2.4×3.0) |
| Ban công | 2.16m² (1.2×1.8) |

---

## 8. Công thức cầu thang

```
stepCount        = round(floorHeightMm / riserMm)
runLength        = stepsPerRun × treadMm / 1000         (m)
overallLength    = runLength×2 + landingWidth           (m, thang U)
comfortCheck     = 2×riser + tread ∈ [600, 640]mm       (Blondel)
```

---

## 9. Chi phí ước tính chi tiết theo hạng mục

| Hạng mục | % tổng ngân sách |
|---|---|
| Phần thô (móng + kết cấu + tường + mái) | 45–55% |
| Hoàn thiện (sơn, sàn, trần, cửa) | 25–30% |
| MEP (điện, nước, ĐHKK) | 12–18% |
| Nội thất | 10–20% |
| Dự phòng | 5–10% |

---

## 10. Scoring tài liệu tham khảo

```
referenceScore = sourceWeight + priorityWeight + interpretWeight + floorWeight

sourceWeight:
  cad_file       = 100
  current_plan   = 90
  reference_plan = 70
  site_photo     = 60
  budget_file    = 40
  video          = 30

priorityWeight:
  strict = 40 | high = 30 | medium = 20 | low = 10

interpretWeight:
  strict_source   = 30
  layout_source   = 20
  reference_only  = 0

floorWeight:
  exact floor match = 20
  all floors        = 10
  unassigned        = 0
```
