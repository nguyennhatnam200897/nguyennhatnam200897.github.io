# Thiết kế phần hướng dẫn trước bài tập

Ngày chốt: 2026-06-08

Trạng thái triển khai: đã tích hợp vào webapp ngày 2026-06-08.

## Mục tiêu

Người học mất gốc không bị yêu cầu tạo ra một từ hoặc cấu trúc mà họ chưa từng
được giới thiệu. Mỗi bước i+1 sẽ có một màn hướng dẫn ngắn trước khi có bài tập
nhập tiếng Anh.

## Phương án đã chọn

Ứng dụng dùng hai trạng thái nối tiếp trong cùng một dòng học:

1. `Hướng dẫn`: giới thiệu kiến thức mới và cho người học nghe tiếng Anh.
2. `Bài tập`: đưa nghĩa tiếng Việt và yêu cầu người học tự nhập tiếng Anh.

Không thêm tab, danh sách bài, màn kiểm tra riêng hoặc nhiều dạng bài tập.

## Nội dung hướng dẫn

Màn hướng dẫn chỉ giải thích phần kiến thức mới của bước hiện tại:

- `city`: hiển thị từ tiếng Anh, nghĩa `thành phố`, cách phát âm bằng giọng đọc
  tiếng Anh và nút nghe lại.
- `cities`: giải thích đây là dạng số nhiều của `city`, có nghĩa là
  `các thành phố`; cho nghe `cities`.
- `many cities`: giới thiệu `many` có nghĩa là `nhiều`, sau đó chỉ ra
  `many + cities = many cities`; cho nghe cả cụm.
- Các bước sau áp dụng cùng nguyên tắc: chỉ bổ sung đúng một lớp kiến thức i+1
  và nêu quan hệ với kiến thức đã học khi quan hệ đó giúp người mới hiểu cách
  hình thành từ, cụm hoặc câu.

Người học nhấn `Tiếp tục` hoặc Enter để sang bài tập. Âm thanh ở màn hướng dẫn
không bắt buộc phải nghe hết mới được tiếp tục.

## Luồng làm bài và âm thanh

Khi người học nhấn Enter để nộp:

- Ứng dụng luôn phát âm đáp án tiếng Anh của bước hiện tại.
- Nếu đúng, ứng dụng hiện phản hồi đúng, chờ âm thanh phát xong rồi tự chuyển
  sang màn hướng dẫn của bước i+1 tiếp theo.
- Nếu trình duyệt không phát được âm thanh, ứng dụng vẫn chuyển bước sau một
  khoảng chờ ngắn để dòng học không bị kẹt.
- Nếu sai, ứng dụng hiện đáp án và chỉ rõ vị trí sai. Ứng dụng không tự chuyển.
- Khi sai và người học nhấn Enter lần nữa, ứng dụng quay về màn hướng dẫn của
  chính kiến thức vừa sai.
- Sau hướng dẫn, người học phải làm lại cùng bài tập cho đến khi trả lời đúng.

## Phát âm

Phiên bản triển khai hiện tại ưu tiên file âm thanh tĩnh trong `assets/audio`:

- Mỗi nhiệm vụ có một file `.wav` theo `task.id`, ví dụ `S1-01.wav`.
- Màn hướng dẫn và lúc nộp bài đều phát cùng file âm thanh của đáp án tiếng Anh.
- Nếu file âm thanh không phát được, app mới fallback sang Web Speech API của
  trình duyệt.
- Có nút biểu tượng loa để nghe lại ở màn hướng dẫn.
- Khi phát một âm mới, ứng dụng dừng âm đang phát trước đó.
- Không chấm IPA và không yêu cầu người học chọn giọng.

Âm thanh hiện tại được tạo bằng giọng đọc tiếng Anh có sẵn trên Windows để phục
vụ bản mẫu. Đây là âm thanh mẫu hỗ trợ học, không được mô tả là bản ghi âm
Oxford chính thức.

## Tiến độ và lưu trạng thái

- Thanh tiến độ chỉ tăng khi bài tập được trả lời đúng.
- Việc xem hướng dẫn không được tính là hoàn thành kiến thức.
- Người học có nút `Reset khóa học` để chủ động xóa toàn bộ tiến độ của bài hiện
  tại và quay về màn hướng dẫn đầu tiên. Reset là hành động có xác nhận, không
  phải một phần của thuật toán lặp lại bài cũ.
- Sau khi tải lại trang, kiến thức chưa trả lời đúng sẽ bắt đầu lại ở màn hướng
  dẫn.
- Kiến thức đã hoàn thành không xuất hiện lại, trừ khi người học chưa hoàn tất
  dòng bài học hiện tại theo dữ liệu tiến độ đã lưu.
- Với vòng luyện xen kẽ, app có thể hiện lại bài tập của một đơn vị đã từng
  đúng trong cùng cụm học để đủ bằng chứng thành thạo. Việc hiện lại này không
  mâu thuẫn với nguyên tắc dòng chảy, vì nó chỉ xảy ra trong phạm vi cụm đang
  học và nhằm chứng minh người học nhớ được sau khi bị xen bởi đơn vị khác.

## Cấu trúc dữ liệu

Mỗi nhiệm vụ có thêm dữ liệu hướng dẫn:

- `term`: từ, cụm hoặc câu tiếng Anh cần giới thiệu.
- `meaning`: nghĩa tiếng Việt.
- `explanation`: lời giải thích ngắn bằng tiếng Việt.
- `parts`: các thành phần đã học và thành phần mới khi cần minh họa cách ghép.
- `speech`: nội dung tiếng Anh cần phát âm; mặc định dùng đáp án.

Dữ liệu hướng dẫn được sinh theo quy tắc chung và có thể ghi đè ở các bước cần
giải thích quan hệ đặc biệt như `city -> cities -> many cities`.

## Giao diện

Giữ phong cách tối giản hiện tại:

- Thanh tiến độ ở trên cùng.
- Mỗi thời điểm chỉ hiện một nội dung.
- Màn hướng dẫn dùng từ tiếng Anh làm điểm nhìn chính, nghĩa và giải thích đặt
  ngay bên dưới.
- Chỉ có hai thao tác chính: nghe lại và tiếp tục.
- Màn bài tập vẫn chỉ có đề tiếng Việt, ô nhập và nút kiểm tra.
- Bàn phím là luồng chính: Enter tiếp tục, Enter nộp, Enter quay lại hướng dẫn
  sau khi sai.

## Kiểm thử bắt buộc

- Bước đầu mở ở hướng dẫn `city`, chưa hiện ô nhập.
- Enter từ hướng dẫn chuyển sang bài tập `thành phố -> city`.
- Trả lời đúng phát `city` và chỉ chuyển sang hướng dẫn `cities` sau khi âm
  thanh kết thúc.
- Trả lời sai phát đáp án nhưng không tăng tiến độ.
- Enter lần hai sau khi sai quay về hướng dẫn cùng từ; làm lại đúng mới được
  sang bước mới.
- `cities` giải thích là số nhiều của `city`.
- `many cities` giới thiệu nghĩa của `many` trước khi yêu cầu nhập cả cụm.
- Nếu Web Speech API không khả dụng hoặc không phát sự kiện kết thúc, luồng vẫn
  tiếp tục an toàn.
- Không phát sinh lỗi giao diện trên desktop và màn hình 390 x 800.
