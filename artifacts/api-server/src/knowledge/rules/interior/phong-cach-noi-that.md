# PHONG CÁCH NỘI THẤT — Đặc trưng & Quy tắc phối hợp

## 1. Danh sách phong cách hỗ trợ

### 1.1 Modern (Hiện đại)
- **Màu sắc:** Trắng, xám, đen, beige trung tính
- **Vật liệu:** Kính, inox, bê tông, gỗ công nghiệp
- **Đặc trưng:** Đường nét thẳng, nội thất tích hợp, không gian mở
- **Phù hợp:** Nhà phố, căn hộ đô thị, văn phòng
- **Trần:** Thạch cao phẳng, đèn âm trần
- **id:** `modern`

### 1.2 Minimalist (Tối giản)
- **Màu sắc:** Trắng + 1 tone accent duy nhất, palette < 3 màu
- **Vật liệu:** Gỗ sáng, đá mờ, vải thiên nhiên
- **Đặc trưng:** "Less is more" — loại bỏ mọi chi tiết thừa
- **Phù hợp:** Studio, nhà cấp 4, không gian nhỏ
- **Lưu ý:** Hệ thống lưu trữ ẩn là bắt buộc
- **id:** `minimalist`

### 1.3 Scandinavian (Bắc Âu)
- **Màu sắc:** Trắng, kem, xanh nhạt, nude, gỗ sáng tự nhiên
- **Vật liệu:** Gỗ sồi, lanh, len, đất nung
- **Đặc trưng:** Ấm cúng (hygge), ánh sáng tự nhiên tối đa
- **Phù hợp:** Nhà gia đình, phòng trẻ em
- **Cây xanh:** Gần bắt buộc — cây nhỏ để bàn hoặc treo
- **id:** `scandinavian`

### 1.4 Industrial (Công nghiệp)
- **Màu sắc:** Xám xi măng, đen, nâu đỏ gạch, đồng/đồng rỉ
- **Vật liệu:** Thép thô, gạch trần, bê tông lộ, gỗ tái chế
- **Đặc trưng:** Trần cao lộ ống nước/kết cấu, đèn Edison
- **Phù hợp:** Loft, café, văn phòng creative, nhà phố tầng cao
- **Trần:** Tối thiểu 3.0m để đủ hiệu ứng
- **id:** `industrial`

### 1.5 Indochine (Đông Dương)
- **Màu sắc:** Vàng ochre, xanh dương đậm, đỏ đất, trắng thuộc địa
- **Vật liệu:** Gỗ tự nhiên tối màu, gạch bông, mây tre, lụa
- **Đặc trưng:** Kết hợp Pháp thuộc địa + Á Đông, hành lang rộng
- **Phù hợp:** Biệt thự, nhà phố lịch sử, resort
- **Bắt buộc:** Cửa chớp gỗ, lưới cửa sổ hoa văn, quạt trần
- **id:** `indochine`

### 1.6 Neoclassic (Tân cổ điển)
- **Màu sắc:** Trắng ngà, vàng gold, xám bạch kim, xanh hoàng gia
- **Vật liệu:** Đá hoa cương, gỗ sơn trắng, vải nhung/gấm, mạ vàng
- **Đặc trưng:** Đường cong, gờ chỉ, cột pilaster, đèn chùm
- **Phù hợp:** Biệt thự lớn, nhà phố cao cấp, sảnh đại sảnh
- **Trần:** Phải có gờ chỉ, tối thiểu 3.3m
- **id:** `neoclassic`

### 1.7 Tropical (Nhiệt đới)
- **Màu sắc:** Xanh lá cây, nâu gỗ, cam san hô, kem cát
- **Vật liệu:** Gỗ tự nhiên, đá tự nhiên thô, tre, lá cọ
- **Đặc trưng:** Hòa hợp trong-ngoài, cây xanh nhiều, giếng trời
- **Phù hợp:** Biệt thự sân vườn, nhà cấp 4 vùng ven
- **Bắt buộc:** Mái nhô rộng, thông gió tự nhiên, hồ/nước
- **id:** `tropical`

### 1.8 Wabi-Sabi (Nhật Bản)
- **Màu sắc:** Đất, nâu, xám tro, trắng gãy, rêu
- **Vật liệu:** Gỗ thô chưa đánh bóng, đất nung, đất sét, đá
- **Đặc trưng:** Vẻ đẹp không hoàn hảo, cũ kỹ có chủ ý, tối giản sâu
- **Phù hợp:** Nhà vườn, không gian thiền định, studio
- **Lưu ý:** Không dùng gỗ công nghiệp bóng — phải có grain tự nhiên
- **id:** `wabi_sabi`

### 1.9 Luxury Modern (Hiện đại cao cấp)
- **Màu sắc:** Đen, trắng, vàng gold, đồng, đá marble trắng
- **Vật liệu:** Đá marble, gỗ veneer, inox đen, kính cường lực
- **Đặc trưng:** Tỷ lệ cân bằng tuyệt đối, hoàn thiện cực kỳ tỉ mỉ
- **Phù hợp:** Penthouse, biệt thự 4–5 tầng, căn hộ hạng A
- **Ánh sáng:** Hệ thống ánh sáng đa lớp, đèn ledstrip ẩn bắt buộc
- **id:** `luxury_modern`

---

## 2. Ma trận tương thích (Phong cách × Loại công trình)

| Phong cách | Nhà cấp 4 | Nhà phố 2-3T | Nhà phố 4-5T | Biệt thự |
|---|:---:|:---:|:---:|:---:|
| Modern | ✅ | ✅ | ✅ | ✅ |
| Minimalist | ✅ | ✅ | ✅ | ⚠️ |
| Scandinavian | ✅ | ✅ | ⚠️ | ✅ |
| Industrial | ❌ | ✅ | ✅ | ⚠️ |
| Indochine | ⚠️ | ✅ | ✅ | ✅ |
| Neoclassic | ❌ | ⚠️ | ✅ | ✅ |
| Tropical | ✅ | ⚠️ | ❌ | ✅ |
| Wabi-Sabi | ✅ | ✅ | ⚠️ | ✅ |
| Luxury Modern | ❌ | ⚠️ | ✅ | ✅ |

✅ Phù hợp tốt | ⚠️ Phù hợp có điều kiện | ❌ Không khuyến nghị

---

## 3. Quy tắc phối màu cơ bản

- **60–30–10 rule:** 60% màu nền, 30% màu phụ, 10% màu nhấn
- **Tối đa 3 vật liệu bề mặt chính** trong 1 không gian
- **Ánh sáng:** Luôn phân 3 lớp — ambient (nền), task (làm việc), accent (trang trí)
- **Không phối > 2 phong cách mạnh** trong cùng 1 dự án

---

## 4. Mapping phong cách → kiến trúc ngoại thất

```json
{
  "modern":        ["Hiện đại mái bằng", "Hiện đại mái lệch", "Nhà phố cao tầng"],
  "minimalist":    ["Hiện đại mái bằng", "Nhà cấp 4 hiện đại"],
  "scandinavian":  ["Nhà cấp 4 sân vườn", "Biệt thự sân vườn"],
  "industrial":    ["Hiện đại công nghiệp", "Nhà phố cao tầng"],
  "indochine":     ["Phố cổ truyền thống", "Tân cổ điển mái ngói"],
  "neoclassic":    ["Tân cổ điển mái ngói", "Biệt thự tân cổ điển"],
  "tropical":      ["Nhà cấp 4 sân vườn", "Biệt thự sân vườn"],
  "wabi_sabi":     ["Nhà cấp 4 mái thái", "Nhà cấp 4 sân vườn"],
  "luxury_modern": ["Biệt thự lớn hiện đại", "Biệt thự tân cổ điển"]
}
```
