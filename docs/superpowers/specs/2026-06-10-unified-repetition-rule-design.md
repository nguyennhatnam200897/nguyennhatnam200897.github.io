# Thiết kế quy tắc lặp thống nhất cho mọi khóa học

Ngày chốt: 2026-06-10

## Mục tiêu

Mọi khóa học hiện tại và tương lai dùng cùng một phương pháp lặp. Không còn
nhóm luyện hoặc nhịp mở task được viết riêng cho một khóa cụ thể.

## Quy tắc nhóm luyện

Trong từng câu, các task theo thứ tự `A, B, C, D, E...` được tạo thành các
nhóm chồng lấp từ hai đến bốn task:

```text
[A, B]
[A, B, C]
[A, B, C, D]
[B, C, D, E]
[C, D, E, F]
...
```

Mỗi nhóm chỉ chứa task của cùng một câu. Task đoạn cộng dồn cũng áp dụng cùng
quy tắc theo `sentenceId` của chúng.

## Nhịp giới thiệu task

- Task chưa gặp luôn mở ở màn hướng dẫn.
- Sau một lần trả lời đúng task hiện tại, app giới thiệu task chưa gặp kế tiếp
  trong nhóm.
- Khi mọi task trong nhóm đã được giới thiệu, scheduler xen kẽ các task chưa
  thành thạo và tránh đưa cùng một task hai lần liên tiếp khi còn lựa chọn khác.

## Điều kiện qua nhóm

Mỗi task trong nhóm phải đồng thời đạt:

1. Đúng ít nhất hai lần.
2. Có chuỗi đúng tối thiểu một lần.
3. Có ít nhất một lần đúng sau khi một task khác đã được trả lời.

Vì chuỗi đúng tối thiểu là một, điều kiện này được thỏa ngay khi task có một
lần đúng. Hai điều kiện có ý nghĩa quyết định là tổng số lần đúng và bằng chứng
đúng sau xen kẽ.

Nhóm chỉ hoàn thành khi mọi task trong nhóm đạt đủ ba điều kiện.

## Khi trả lời sai

- Chỉ thống kê của task sai bị đặt lại trong nhóm hiện tại.
- Số lần sai của task đó tiếp tục được ghi nhận.
- Các task khác trong nhóm giữ nguyên thống kê.
- Người học quay lại hướng dẫn và làm lại chính task vừa sai.

## Dữ liệu và tiến độ

Thuật toán nhóm không đọc cấu hình riêng từ course JSON. Tất cả course gọi cùng
`buildPracticeGroups(tasks)` và nhận cùng cách chia nhóm.

Do cấu trúc nhóm và ngưỡng thành thạo thay đổi, cả hai course hiện tại tăng
`sessionVersion`. Storage key mới khiến tiến độ cũ không được phục hồi vào
thuật toán mới.

## Kiểm thử

Kiểm thử phải chứng minh:

- Bài 1 bắt đầu bằng `[S1-01, S1-02]`, không còn nhóm thủ công
  `[S1-01, S1-04]`.
- Bài 2 bắt đầu bằng hai task đầu tiên của câu đầu và dùng cùng chuỗi nhóm
  chồng lấp.
- Một course giả lập cũng nhận đúng chuỗi nhóm chung.
- Đúng một lần mở task mới kế tiếp.
- Mỗi task đúng hai lần theo vòng xen kẽ là đủ để qua nhóm.
- Chưa có lần đúng sau xen kẽ thì chưa được qua nhóm.
- Sai chỉ đặt lại task sai.
- Cả hai course dùng phiên bản tiến độ mới.
- Toàn bộ `node --test` vượt qua.

## Tiêu chí hoàn thành

- `mastery.mjs` không còn danh sách task hoặc nhóm dành riêng cho Bài 1.
- Bài 1, Bài 2 và mọi course mới dùng cùng một thuật toán nhóm.
- Ngưỡng chung là `minCorrect: 2`, `minStreak: 1` và bắt buộc đúng sau xen kẽ.
- Tiến độ cũ của hai course không được dùng lại.
