# Thiết kế vòng luyện xen kẽ để đánh giá thành thạo

Ngày chốt: 2026-06-08

Trạng thái triển khai: đã tích hợp vào webapp ngày 2026-06-08.

## Lý do thay đổi

Luật cũ `đúng một lần thì qua` chỉ chứng minh người học vừa nhớ được đáp án ở
thời điểm đó. Nó chưa đủ để xem người học đã thành thạo, vì người mới có thể
đoán đúng, nhớ tạm thời hoặc vừa nhìn hướng dẫn xong nên nhập được.

Luật mới lấy cảm hứng từ luyện gõ 10 ngón: học một nhóm nhỏ, lặp xen kẽ nhiều
lần, chỉ mở rộng khi phản xạ đã ổn. Ví dụ kiểu `fj fj fj`, rồi `asdf asdf`,
rồi mới mở rộng tiếp.

## Nguyên tắc cốt lõi

Mỗi câu trong bài báo được chia thành các cụm luyện nhỏ. Khi trong câu có nhiều
đơn vị cùng tầng hoặc cùng giai đoạn, app không cho qua từng đơn vị chỉ sau một
lần đúng. App sẽ tạo một vòng luyện xen kẽ các đơn vị đó cho đến khi từng đơn
vị đạt tiêu chí thành thạo.

Ví dụ nếu câu đang học có hai đối tượng `city` và `life`, dòng luyện có thể là:

```text
city -> life -> city -> life -> life -> city
```

Mục tiêu không phải là lặp máy móc vô hạn, mà là tạo đủ bằng chứng rằng người
học có thể nhớ lại đúng sau khi sự chú ý đã chuyển sang đơn vị khác.

## Tiêu chí mặc định để một đơn vị được xem là thành thạo

Một đơn vị nhỏ như `city`, `cities`, `many cities`, `life`, `daily life` được
xem là thành thạo trong cụm luyện hiện tại khi đạt đủ cả ba điều kiện:

1. Trả lời đúng ít nhất **3 lần**.
2. Có ít nhất **2 lần đúng liên tiếp**.
3. Có ít nhất **1 lần đúng sau khi đã bị xen bởi đơn vị khác**.

Điều kiện thứ ba là điểm quan trọng nhất. Nó kiểm tra khả năng nhớ lại sau khi
người học đã chuyển ngữ cảnh, thay vì chỉ gõ lại ngay lập tức theo trí nhớ ngắn
hạn.

## Khi người học trả lời sai

Nếu người học sai ở một đơn vị trong vòng luyện:

- app phát đáp án tiếng Anh và hiện lỗi như hiện tại;
- Enter lần nữa đưa người học quay về màn hướng dẫn của chính đơn vị đó;
- sau hướng dẫn, người học làm lại đơn vị đó;
- điểm thành thạo của đơn vị đó bị giảm mạnh hoặc đặt lại trong cụm luyện hiện
  tại;
- các đơn vị khác trong cụm không bị xóa hoàn toàn nếu người học vẫn đang làm
  tốt chúng.

Điểm sai không làm app hạ độ khó chung hoặc chuyển sang dạng bài dễ hơn. Nó chỉ
kéo đúng đơn vị bị sai quay lại hướng dẫn và luyện lại.

## Cách mở rộng theo i+1

App chỉ mở i+1 tiếp theo khi mọi đơn vị trong cụm luyện hiện tại đã đạt tiêu chí
thành thạo.

Ví dụ trong câu 1:

1. Giới thiệu `city`.
2. Giới thiệu `life`.
3. Luyện xen kẽ `city` và `life` đến khi cả hai thành thạo.
4. Mở rộng `city -> cities`.
5. Luyện `city`, `life`, `cities` hoặc chỉ nhóm đang liên quan, tùy cấu trúc
   câu.
6. Khi ổn, mở `many cities`, rồi tiếp tục vòng luyện mới.

Như vậy i+1 vẫn được giữ, nhưng mỗi nấc i+1 không còn là một lần nhập đơn lẻ.
Mỗi nấc là một cụm luyện nhỏ có bằng chứng thành thạo.

## Cách chia cụm luyện đúng i+1

Đúng i+1 không có nghĩa là lặp một danh sách cũ thật dài, cũng không có nghĩa là
nhảy ngay từ từ đơn lên câu dài. Đúng i+1 trong app này nghĩa là: **mỗi vòng
luyện chỉ thêm một độ khó mới, rồi xen kẽ nó với vài đơn vị nền gần nhất để tạo
phản xạ**.

Quy tắc chia cụm:

1. Trước hết, tách câu thành các mảnh nghĩa có thể hiểu được.
2. Trong từng mảnh, học các danh từ/đối tượng neo trước.
3. Khi có từ hai neo trở lên, tạo vòng luyện xen kẽ để neo trở nên vững.
4. Sau đó chỉ thêm một lớp mới: số nhiều, lượng từ, bổ nghĩa, cụm, quan hệ hoặc
   mệnh đề.
5. Mỗi khi thêm lớp mới, tạo vòng luyện nhỏ gồm đơn vị mới và các đơn vị nền
   gần nhất.
6. Một vòng luyện nên có khoảng **2 đến 4 đơn vị**. Nếu nhiều hơn, người mất gốc
   dễ bị quá tải và vòng luyện mất tính i+1.
7. Không đưa một đơn vị cũ quay lại chỉ vì nó từng học trước đó. Chỉ đưa lại nếu
   nó là nền trực tiếp cho đơn vị mới, hoặc nếu người học sai khi dùng nó trong
   ngữ cảnh lớn hơn.

Ví dụ với mảnh đầu của câu 1:

```text
Many cities are trying to make daily life more sustainable
```

Các vòng đúng i+1 có thể là:

```text
Vòng 1: city + life
Vòng 2: city + cities + life
Vòng 3: cities + many cities + life
Vòng 4: life + daily life + many cities
Vòng 5: many cities + daily life + cities make daily life sustainable
Vòng 6: câu quan hệ đơn giản -> câu mở rộng hơn
```

Trong cách chia này:

- `city` và `life` là neo danh từ đầu tiên;
- `cities` là một lớp mới từ `city`;
- `many cities` chỉ được mở sau khi `cities` đã đủ nền;
- `daily life` chỉ được mở sau khi `life` đã đủ nền;
- quan hệ như `make ... sustainable` không học rời rạc dưới dạng động từ đơn,
  mà xuất hiện trong một khung nghĩa đủ đầy:
  `cities make daily life sustainable`;
- câu dài hơn chỉ xuất hiện sau khi các cụm và quan hệ nền đã vững.

Vì vậy, i+1 được hiểu là **mở rộng có kiểm soát**: không học rời rạc quá lâu,
không nhảy lên câu quá sớm, và mỗi bước mới đều được neo bằng cái vừa thành
thạo.

## Phạm vi lặp lại

Không lặp lại toàn bộ bài cũ một cách ngẫu nhiên. Việc lặp chỉ xảy ra trong
phạm vi cụm đang học của câu hiện tại.

Khi một cụm đã thành thạo, app cho qua. Nếu sau này người học sai khi dùng lại
đơn vị đó trong cụm lớn hơn, câu phức hơn hoặc đoạn văn, app mới kéo đơn vị bị
sai quay lại hướng dẫn/luyện lại ngay tại ngữ cảnh đang học.

Quy tắc này giữ tinh thần dòng chảy:

- càng học càng phát triển;
- không chen bài cũ nếu chưa có bằng chứng người học quên;
- sai ở đâu thì học lại ở đó;
- không tạo cảm giác đang bị kiểm tra rời rạc.

## Giao diện mong muốn

Giao diện vẫn tối giản:

- chỉ hiện một bài tập hoặc một hướng dẫn tại một thời điểm;
- không thêm tab bên phải;
- có thể có nút `Reset khóa học` thật nhẹ để người học chủ động quay về mốc
  đầu, nhưng nút này không chen vào dòng bài học chính;
- không cần giải thích thuật ngữ như `đối tượng`, `cụm từ`, `mastery score` trên
  màn hình học;
- thanh tiến độ có thể phản ánh mức hoàn thành của cụm luyện, không chỉ số bước
  đã đi qua;
- người học chỉ cảm nhận rằng app đang cho luyện lại hợp lý cho đến khi đủ vững.

## Dữ liệu cần theo dõi

Mỗi đơn vị trong cụm luyện cần có trạng thái riêng:

- số lần đúng;
- số lần đúng liên tiếp;
- có từng đúng sau khi bị xen bởi đơn vị khác hay chưa;
- số lần sai trong cụm hiện tại;
- lần xuất hiện gần nhất trong vòng luyện;
- trạng thái `đang học`, `cần học lại`, hoặc `đã thành thạo trong cụm`.

Trạng thái này khác với tiến độ hoàn thành lâu dài. Một đơn vị có thể đã từng
được học ở cụm trước, nhưng khi bước vào cụm lớn hơn, app vẫn có thể yêu cầu nó
chứng minh lại trong ngữ cảnh mới nếu cần.

## Quy tắc đã chốt

Luật mặc định đã chốt:

```text
Một đơn vị được qua cụm luyện khi:
- đúng ít nhất 3 lần;
- có ít nhất 2 lần đúng liên tiếp;
- có ít nhất 1 lần đúng sau khi đã bị xen bởi đơn vị khác.
```

Đây là tiêu chí mặc định cho bản webapp tiếp theo. Sau này có thể điều chỉnh
theo độ khó của đơn vị, nhưng không thay đổi nguyên tắc: phải có lặp xen kẽ và
có bằng chứng nhớ lại sau chuyển ngữ cảnh.

## Triển khai hiện tại

Webapp hiện có module `js/mastery.mjs` chịu trách nhiệm:

- tạo các nhóm luyện 2 đến 4 đơn vị;
- ưu tiên nhóm đầu câu 1 là `city + life`;
- theo dõi số lần đúng, đúng liên tiếp và đúng sau xen kẽ;
- reset thống kê của riêng đơn vị bị sai trong nhóm hiện tại;
- chọn task kế tiếp theo trạng thái nhóm;
- tính tiến độ theo mức hoàn thành của nhóm luyện.

Luồng khởi đầu hiện tại:

```text
city hướng dẫn -> city bài tập -> life hướng dẫn -> life bài tập
-> city bài tập lại -> life bài tập lại -> ...
```

Chỉ khi cả `city` và `life` đạt đủ 3 tiêu chí thành thạo, app mới mở nhóm tiếp
theo có `cities`.

Với các course mới, các task liên tiếp trong cùng một câu được tạo thành nhóm
chồng lấp giống Bài 1:

```text
[A, B] -> [A, B, C] -> [A, B, C, D] -> [B, C, D, E]
đơn vị A -> đúng -> đơn vị B -> đúng -> xen kẽ A/B
```

Một lần trả lời đúng là đủ để giới thiệu đơn vị mới kế tiếp, đúng với nhịp của
Bài 1. Việc lặp lại diễn ra trong các nhóm chồng lấp và vòng xen kẽ; tiêu chí
thành thạo cuối cùng vẫn yêu cầu đủ số lần đúng, chuỗi đúng và đúng sau khi bị
xen bởi đơn vị khác.
