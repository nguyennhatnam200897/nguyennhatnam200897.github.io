# Thiết kế thành thạo từng cụm theo thứ tự

## Trạng thái

Đã chốt ngày 12/06/2026.

Đặc tả này là nguồn chuẩn mới cho cách hiển thị hướng dẫn và cách luyện thành
thạo cụm nghĩa. Nếu các tài liệu cũ yêu cầu xen kẽ hai cụm khi luyện riêng,
quy tắc trong tài liệu này được ưu tiên.

Đã áp dụng đầy đủ cho course `small-public-garden-gentle-i1` ngày 13/06/2026.
Course này dùng bảy lesson cụm nghĩa liên tục, đoạn cộng dồn đúng một lần là
qua, và repair đoạn quay về đúng câu/cụm hỏng trước khi trở lại đoạn.

## Mục tiêu

Người học hoàn thiện trọn vẹn một cụm trước khi chuyển sang cụm tiếp theo.
Tiến trình phải tạo cảm giác:

- từng bước nhỏ đang xây nên một cụm có ý nghĩa;
- người học biết rõ khi nào cụm đã hoàn chỉnh;
- người học sở hữu được cụm hiện tại trước khi gặp cụm mới;
- cụm đã sở hữu không bị hỏi lại riêng lẻ nếu người học vẫn dùng đúng nó trong
  ý dài hơn.

App vẫn chỉ sử dụng một dạng bài tập: người học tự viết hoặc nói câu trả lời
tiếng Anh độc lập. Speech-to-text chỉ hỗ trợ nhập và không tự chấm điểm.

## Phân biệt bước nhỏ và cụm hoàn chỉnh

Mỗi cụm có một chuỗi i+1 nội bộ.

Ví dụ:

```text
city -> cities -> many cities
```

### Bước nhỏ chưa tạo thành cụm

Ví dụ: `city`, `cities`, `try`, `are trying`.

Màn hướng dẫn chỉ hiển thị:

- nghĩa tiếng Việt;
- phát âm;
- giải thích ngắn bước i+1 đang thêm điều gì.

Không hiển thị:

- `Khi nào cần?`;
- `Mục đích là gì?`;
- `Vai trò trong câu`.

Các nội dung vai trò ở bước này là quá sớm vì người học chưa có một đơn vị ý
hoàn chỉnh để sử dụng.

### Cụm hoàn chỉnh

Ví dụ: `many cities`, `are trying to`, `make daily life`.

Chỉ tại bước cuối của cụm, màn hướng dẫn mới hiển thị:

1. `Khi nào cần?`
2. `Mục đích là gì?`
3. `Vai trò trong câu`

Vai trò vẫn được diễn đạt bằng câu hỏi thực tế như:

- `Ai?`
- `Đang cố làm gì?`
- `Tác động vào cái gì?`
- `Kết quả gì?`

## Nhịp học tuần tự trong một cụm

App phải hoàn thành toàn bộ cụm hiện tại trước khi mở cụm tiếp theo.

Ví dụ:

```text
city
-> cities
-> many cities
-> many cities (xác nhận lần 2)
-> chuyển sang cụm are trying to
```

Không được xen kẽ như:

```text
many cities
-> are trying to
-> many cities
```

### Cách tiến qua bước nhỏ

Mỗi bước nhỏ chỉ cần đúng một lần để mở bước i+1 kế tiếp trong cùng cụm.

- Nếu đúng, app chuyển ngay sang bước tiếp theo của chính cụm đó.
- Nếu sai, app giải thích lỗi tại bước hiện tại rồi cho người học làm lại bước
  đó.
- Sai ở một bước nhỏ không làm mất các bước nhỏ đã hoàn thành trước đó.
- Bước nhỏ không được lặp lại để tích lũy số lần đúng sau khi đã mở được bước
  kế tiếp.

## Quy tắc thành thạo cụm

Một cụm được đánh dấu `đã vững` khi:

- người học đã đi qua các bước i+1 nội bộ theo đúng thứ tự;
- người học viết hoặc nói đúng cụm hoàn chỉnh hai lần liên tiếp;
- cả hai lần đều không có gợi ý trực tiếp trong ô trả lời.

Hai lần đúng liên tiếp được tính tại bước cụm hoàn chỉnh. Các lượt đúng ở từ
đơn hoặc mảnh chưa hoàn chỉnh không thay thế hai lượt xác nhận này.

Nhịp xác nhận cụm hoàn chỉnh:

1. Đúng lần đầu: giữ nguyên cụm hiện tại và mở lượt xác nhận thứ hai.
2. Đúng lần thứ hai liên tiếp: đánh dấu cụm `đã vững`.
3. Sai trước khi đủ hai lần: sửa đúng phần hỏng và đặt lại chuỗi xác nhận của
   cụm hoàn chỉnh về `0`.

Hai lượt xác nhận diễn ra liền nhau, không chèn cụm khác hoặc bài ghép vào giữa.

Văn bản do speech-to-text điền vào ô trả lời được xem là câu trả lời do người
học tạo ra, không phải gợi ý. Người học vẫn được sửa văn bản đó trước khi nộp.

Sau khi cụm được đánh dấu `đã vững`:

- app chuyển sang cụm mới;
- app không hỏi lại cụm đó riêng lẻ trong tiến trình bình thường;
- cụm tiếp tục được củng cố âm thầm khi xuất hiện trong ý dài hơn.

## Ghép các cụm thành ý dài

Chỉ mở bài ghép khi tất cả các cụm cần thiết của bài ghép ở trạng thái `đã vững`.

Ví dụ:

```text
many cities          -> đã vững
are trying to        -> đã vững

many cities are trying to
```

Nếu người học viết đúng ý dài, app tiếp tục tiến lên và không hỏi lại từng cụm.

Nếu người học viết sai, app xác định cụm hỏng và chỉ đưa cụm đó vào vòng sửa.

## Quay lại khi sai

Quy tắc sửa lỗi vẫn theo hướng tối thiểu:

- sai `many city` trong `many cities` -> quay về `cities`;
- sai phần số lượng `many` -> sửa phần tạo nên `many cities`;
- sai `are trying` trong `are trying to` -> sửa đúng bước bị thiếu;
- sai một cụm trong ý dài -> quay về cụm hoàn chỉnh đó, sửa đúng một lần, rồi
  trở lại ý dài.

Repair không làm mất trạng thái `đã vững` của các cụm khác.

Sau khi repair thành công, app không bắt người học học lại toàn bộ cụm từ đầu,
trừ khi dữ liệu lỗi cho thấy nhiều bước nền của chính cụm đó đều đang hỏng.

## Dữ liệu và scheduler

Task bước nhỏ và task cụm hoàn chỉnh tiếp tục dùng metadata
`meaningChunk.isFinalStep` để phân biệt.

Scheduler của profile `meaning-chunk-i-plus-one` phải:

1. lấy toàn bộ các bước thuộc một `meaningChunk.id`;
2. sắp chúng đúng thứ tự dữ liệu;
3. cho các bước nhỏ tiến lần lượt;
4. yêu cầu task `isFinalStep: true` đúng hai lần liên tiếp;
5. chỉ sau đó mới mở `meaningChunk.id` tiếp theo;
6. chỉ mở composition khi mọi cụm trong `usesChunks` đã vững.

Không dùng một cụm khác làm đơn vị xen kẽ để chứng minh thành thạo.

## Kiểm thử bắt buộc

### Hướng dẫn

- Task từ đơn không chứa `whenNeeded`, `roleQuestion`, `roleMeaning`.
- Task cụm hoàn chỉnh giữ đủ ba trường trên.
- UI chỉ dựng ba nội dung vai trò khi `meaningChunk.isFinalStep` là `true`.
- Composition vẫn có thể hiển thị `roleLine` trước bài tập.
- Màn exercise không hiển thị gợi ý vai trò hay đáp án.
- Nội dung do speech-to-text điền tạm không bị tính là gợi ý.

### Nhịp học

Với hai cụm:

```text
city -> cities -> many cities
try -> are trying -> are trying to
```

Chuỗi đúng phải là:

```text
city
cities
many cities
many cities
try
are trying
are trying to
are trying to
composition
```

Không được xuất hiện `are trying to` giữa hai lượt `many cities`.

- Bước nhỏ đúng một lần thì mở bước tiếp theo.
- Sai bước nhỏ chỉ lặp lại bước đó.
- Sai ở lượt xác nhận thứ hai đặt chuỗi xác nhận cụm hoàn chỉnh về `0`.

### Repair

- Lỗi ở bước nhỏ quay đúng bước nhỏ.
- Lỗi cụm trong composition quay đúng cụm.
- Repair xong trở lại composition.
- Cụm khác không bị đặt lại tiến độ.

### Đoạn cộng dồn

- Mỗi task đoạn cộng dồn đúng một lần thì qua.
- Nếu sai ở đoạn, app dùng token span để xác định câu chứa lỗi.
- App mở lại đúng task câu hoàn chỉnh đó một lần.
- Nếu câu đang repair vẫn sai ở một cụm đã học, app đi sâu thêm một cấp về đúng
  cụm hỏng, sửa cụm một lần, rồi quay lại câu.
- Sau khi câu repair đúng, app quay lại task đoạn đang học.
- Các câu và cụm không liên quan không bị xóa tiến độ.

### Hồi quy

- Course mặc định giữ nguyên cơ chế nhóm chồng lấp.
- Profile Gentle i+1 cũ ngoài course cụm nghĩa không bị thay đổi.
- Course nghe giữ nguyên quy tắc hiện có.

## Ngoài phạm vi

- Không thêm dạng chọn đáp án, điền chỗ trống hoặc kéo thả.
- Không chấm điểm phát âm.
- Không thay đổi nội dung câu 2 trở đi trong course thử nghiệm ở lần triển khai
  đầu tiên.
- Không áp dụng quy tắc mới cho các profile không phải
  `meaning-chunk-i-plus-one`.
