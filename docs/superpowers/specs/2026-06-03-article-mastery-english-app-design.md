# Ý tưởng ứng dụng học tiếng Anh theo mục tiêu thành thạo một bài báo

Ngày tạo: 2026-06-03

## Cập nhật công nghệ ngày 2026-06-08

Webapp được chốt chuyển hoàn toàn sang **HTML, CSS và JavaScript thuần**, không dùng React hoặc bất kỳ framework JavaScript nào. Website không dùng bundler, không có bước build và không cần cài package để chạy.

Cấu trúc kỹ thuật của bản hiện tại:

- `index.html`: cấu trúc màn hình học;
- `styles.css`: toàn bộ giao diện;
- `js/article.mjs`: học liệu và thứ tự nhiệm vụ;
- `js/guidance.mjs`: nội dung hướng dẫn trước từng nhiệm vụ;
- `js/lesson-flow.mjs`: trạng thái hướng dẫn, bài tập, chờ âm thanh và học lại;
- `js/learning.mjs`: chuẩn hóa và chấm câu trả lời;
- `js/speech.mjs`: phát âm tiếng Anh và cơ chế dự phòng;
- `js/app.mjs`: trạng thái, lưu tiến độ và tương tác DOM.

Mục tiêu triển khai là GitHub Pages. Vì vậy mọi stylesheet, script và module phải dùng đường dẫn tương đối, không giả định website nằm ở `/`, để app vẫn chạy khi được xuất bản dưới đường dẫn `/<tên-repository>/`.

## Cập nhật MVP tối giản ngày 2026-06-05

Để giảm tải cho người mất gốc và giúp người học tập trung vào dòng học chính,
MVP hiện tại **không dùng bài tập nhập IPA**. Tuy nhiên, màn hướng dẫn vẫn hiển
thị IPA Anh-Mỹ dạng rộng, đơn giản của mọi từ mới, gồm cả từ riêng lẻ và từ
liên kết, đồng thời phát âm bằng giọng Anh-Mỹ. IPA dùng để người học nhìn và
đọc theo, không được chấm điểm; app không dùng ký hiệu ngữ âm hẹp gây rối.

Dòng học hiện tại tập trung vào nhập tiếng Anh tự do, không dùng bài chọn đáp án hoặc điền khuyết. Người học đi từ từ đối tượng/danh từ, sang cụm từ, câu, đoạn và cuối cùng thành thạo bài báo bằng đọc hiểu và viết/dịch ngược đúng nội dung bài gốc.

## Cập nhật nhịp hướng dẫn trước bài tập ngày 2026-06-08

Người mất gốc không bị yêu cầu tự tạo ra một đơn vị tiếng Anh mà họ chưa từng
được giới thiệu. Mỗi bước i+1 hiện dùng một dòng chảy gồm:

1. Màn hướng dẫn giới thiệu từ/cụm/câu tiếng Anh, nghĩa tiếng Việt, quan hệ với
   kiến thức trước đó khi cần và âm thanh mẫu.
2. Người học nhấn Enter để sang bài tập nhìn nghĩa tiếng Việt và nhập tiếng Anh.
3. Khi nộp, app phát âm đáp án tiếng Anh dù câu trả lời đúng hay sai.
4. Nếu đúng, app chờ âm thanh kết thúc rồi mới mở màn hướng dẫn của bước i+1.
5. Nếu sai, app hiện đáp án và vị trí sai nhưng không tăng tiến độ. Enter lần
   nữa đưa người học về màn hướng dẫn của chính đơn vị vừa sai; sau đó phải làm
   lại cho đến khi đúng.

Ví dụ đầu dòng học:

- `city`: giới thiệu nghĩa `thành phố`, cho nghe từ rồi mới yêu cầu nhập.
- `cities`: giải thích đây là số nhiều của `city`, nghĩa là `các thành phố`.
- `many cities`: giới thiệu `many = nhiều`, sau đó ghép với `cities` đã học.

Phiên bản hiện tại ưu tiên file âm thanh tĩnh trong `assets/audio` cho từng
nhiệm vụ học. Nếu file âm thanh không phát được, app mới fallback sang giọng đọc
tiếng Anh của trình duyệt. Đây là âm thanh mẫu hỗ trợ học, không được mô tả là
bản ghi Oxford chính thức. Nếu cả hai cách phát đều không khả dụng, app dùng
một khoảng chờ dự phòng để dòng học không bị kẹt hoặc bỏ qua phản hồi.

Người học có thể bấm `Reset khóa học` để xóa tiến độ đã lưu của bài hiện tại và
quay về mốc học đầu tiên. Nút này chỉ dùng khi người học chủ động muốn học lại
từ đầu, không phải cơ chế ôn tập tự động.

## Cập nhật speech-to-text hỗ trợ nhập nháp ngày 2026-06-10

App có thể thêm nút `Nói thử` ở màn bài tập để người học nói câu trả lời và để
trình duyệt điền transcript nháp vào ô nhập. Đây là tính năng hỗ trợ nhập, không
phải bài kiểm tra nói hoặc chấm phát âm.

Nguyên tắc đã chốt:

- Speech-to-text chỉ hoạt động trước khi người học nộp đáp án.
- Khi có transcript, app hiện `Máy nghe được: ...` và tự điền transcript vào ô
  trả lời.
- Người học luôn được sửa transcript bằng tay trước khi bấm `Kiểm tra`.
- App không tự nộp bài sau khi nghe được giọng nói.
- Điểm, tiến độ và vòng luyện xen kẽ vẫn chỉ thay đổi sau khi người học tự nộp
  đáp án và `evaluateAnswer()` chấm kết quả.
- Nếu trình duyệt không hỗ trợ nhận diện giọng nói hoặc người học không cấp
  quyền micro, app giữ nguyên luồng gõ tay.
- Vì Web Speech API không hỗ trợ đều trên mọi trình duyệt và có thể dùng dịch vụ
  nhận diện từ xa, tính năng này phải được xem là tùy chọn.

Thiết kế chi tiết được ghi tại:
`docs/superpowers/specs/2026-06-10-speech-to-text-draft-input-design.md`.

## Cập nhật vòng luyện xen kẽ ngày 2026-06-08

Luật `đúng một lần thì qua` không còn là mục tiêu thiết kế lâu dài. Nó chỉ phù
hợp cho bản mẫu đơn giản, nhưng chưa đủ để đánh giá người học đã thành thạo.

Thiết kế mới dùng **vòng luyện xen kẽ trong từng câu**, lấy cảm hứng từ luyện
gõ 10 ngón. Khi câu có nhiều đơn vị cần học, app sẽ lặp xen kẽ các đơn vị đó
cho đến khi đủ bằng chứng thành thạo, thay vì cho qua vĩnh viễn sau một lần
nhập đúng.

Một đơn vị được xem là thành thạo trong cụm luyện hiện tại khi đạt đủ:

- đúng ít nhất 2 lần;
- có ít nhất 1 lần đúng liên tiếp;
- có ít nhất 1 lần đúng sau khi đã bị xen bởi đơn vị khác.

Nếu người học sai, app phát đáp án, chỉ lỗi, rồi Enter lần nữa đưa về màn hướng
dẫn của chính đơn vị sai. Người học phải luyện lại đơn vị đó. App không hạ độ
khó, không chuyển sang dạng chọn đáp án và không lặp lại toàn bộ bài cũ nếu
chưa có bằng chứng cần thiết.

Quy tắc chi tiết được ghi tại:
`docs/superpowers/specs/2026-06-08-interleaved-mastery-loop-design.md`.

## Cập nhật quy tắc tầng từ đơn ngày 2026-06-08

Tầng từ đơn được xác định theo **hình thức từ trong tiếng Anh hiện đại**, không phân tách từ theo nguồn gốc hoặc cấu tạo lịch sử.

- Tầng này **chỉ gồm danh từ/đối tượng**. Không đưa động từ, tính từ, trạng từ, giới từ, liên từ hoặc từ hạn định vào tầng đầu, dù chúng được viết liền thành một từ.
- Một danh từ được viết liền thành một từ và có thể mang nghĩa độc lập trong ngữ cảnh bài báo thì thuộc tầng từ đơn. Ví dụ: `city`, `life`, `change`, `neighborhood`, `council`, `garden`, `resident`, `project`, `noise`, `child`, `shop`.
- Các từ như `try`, `empty`, `public`, `however` không thuộc tầng từ đơn. Chúng chỉ được giới thiệu khi người học chuẩn bị dùng chúng để mở rộng một đối tượng thành cụm hoặc câu.
- Một đơn vị gồm từ hai từ viết tách trở lên không được đặt vào tầng từ đơn, dù toàn bộ đơn vị biểu thị một đối tượng. Ví dụ: `daily life`, `parking lot`, `office worker`, `plastic bag`, `recycling bin`, `environmental problem`, `shared space`, `daily habit`.
- Với đơn vị nhiều từ, người học phải học từ đơn làm neo trước, sau đó mới kết hợp thành từ ghép hoặc cụm từ theo i+1. Ví dụ: `life` -> `daily life`.
- Danh từ phải được học ở dạng gốc số ít trước khi học dạng số nhiều xuất hiện trong bài. Không đưa thẳng dạng số nhiều vào tầng đầu. Ví dụ: `city` -> `cities`, `resident` -> `residents`, `child` -> `children`.
- Bước từ số ít sang số nhiều là một bước i+1 riêng. Người học cần hiểu cả thay đổi hình thức và thay đổi ý nghĩa: `city` là một thành phố, còn `cities` là nhiều thành phố.
- Quy tắc này áp dụng cả với số nhiều thông thường, biến đổi chính tả và bất quy tắc. App không được giả định người mất gốc tự suy ra `cities` từ `city` hoặc `children` từ `child`.
- Bài số nhiều vẫn dùng đúng cơ chế nhập tự do của app: màn hình hiển thị nghĩa số nhiều bằng tiếng Việt, chẳng hạn `các thành phố` hoặc `nhiều thành phố`, và người học phải nhập `cities`.
- Bài số nhiều không mở thành một bài giảng ngữ pháp dài riêng biệt. Người học nhận ra sự thay đổi qua chuỗi có ngữ cảnh: `thành phố` -> `city`; `các thành phố` -> `cities`; `nhiều thành phố` -> `many cities`.
- Nếu người học nhập dạng số ít ở lượt số nhiều, đây là lỗi nội dung và không được cho qua. App hiện dạng đúng rồi yêu cầu nhập lại ngay.
- Khi gặp một từ ghép hoặc cụm nhiều từ, app không được tách máy móc thành mọi từ thành phần. Chỉ học riêng một thành phần nếu nó có nghĩa độc lập, giữ được nghĩa liên quan trong cụm và thực sự hữu ích làm nền cho bước i+1.
- Thành phần không có nghĩa độc lập phù hợp trong ngữ cảnh không cần có bài riêng. Nó được giới thiệu trực tiếp khi người học học từ ghép/cụm hoàn chỉnh.
- Ví dụ với `parking lot`, app có thể dùng `lot` theo nghĩa `bãi/khu đất` làm neo rồi mở rộng thành `parking lot` -> `bãi đỗ xe`; không bắt buộc tạo một bài riêng cho `parking` nếu việc tách đó không giúp người học hiểu đối tượng trong bài.
- Mục tiêu của việc tách là xây nghĩa từng bước, không phải buộc người học thuộc mọi token xuất hiện trong cụm.
- Với cụm gồm thuộc tính/chất liệu + đối tượng, người học phải học danh từ/đối tượng làm neo trước. Thành phần bổ nghĩa chỉ được giới thiệu ở bước mở rộng ngay sau đó.
- Ví dụ: `bag` -> `plastic bag`. `bag` thuộc tầng đối tượng; `plastic` không học riêng ở tầng đầu mà xuất hiện khi người học tạo đối tượng đầy đủ `plastic bag`.
- Quy tắc này áp dụng cả khi thành phần bổ nghĩa về mặt từ loại là tính từ hoặc là một danh từ đang được dùng để bổ nghĩa cho danh từ khác. Việc xếp tầng dựa trên vai trò của từ trong cụm đang học.
- Với một cụm danh từ đầy đủ, thứ tự mặc định là: **danh từ gốc -> danh từ có thành phần bổ nghĩa -> cụm danh từ có mạo từ/từ hạn định/số lượng**.
- Ví dụ: `council` -> `local council` -> `the local council`; `garden` -> `public garden` -> `a public garden`; `project` -> `local project` -> `a local project`.
- Không đưa thẳng `the local council`, `a public garden` hoặc cụm tương tự cho người mất gốc khi các thành phần nhỏ hơn chưa được học.
- Mỗi lượt chỉ thêm một lớp ý nghĩa hoặc chức năng ngữ pháp. Nếu cụm còn có số nhiều, số lượng hoặc nhiều thuộc tính, app tiếp tục tách thành các bước i+1 phù hợp thay vì gộp tất cả vào một lượt.
- Quy tắc này áp dụng thống nhất cho mọi cụm danh từ trong bài báo, nhưng chỉ tạo những bước thực sự cần thiết để đi tới đúng cụm xuất hiện trong văn bản.
- Khi một đối tượng có nhiều thành phần bổ nghĩa, thứ tự học không bắt buộc đi từ trái sang phải theo mặt chữ tiếng Anh. App ưu tiên thêm trước thành phần tạo ra nghĩa nền rõ ràng và giúp người học hình dung đối tượng tốt nhất.
- Sau khi từng lớp nghĩa đã rõ, lượt cuối phải đưa các thành phần về đúng trật tự tiếng Anh trong cụm của bài gốc. Như vậy, thứ tự **học nghĩa** có thể khác thứ tự **sắp xếp từ trong output cuối**.
- Ví dụ với `a small public garden`, có thể đi theo `garden` -> `public garden` -> `small public garden` -> `a small public garden`, vì `public` giúp xác định loại khu vườn trước, còn `small` bổ sung kích thước sau.
- Tiêu chí chọn thành phần bổ nghĩa tiếp theo: liên quan trực tiếp nhất tới bản chất/loại của đối tượng; cần thiết nhất để phân biệt đối tượng trong bài; và chỉ làm độ khó tăng thêm một bước nhỏ.
- Sau khi các cụm danh từ cần thiết đã được học, app mới dùng động từ để tạo hành động hoặc quan hệ giữa các đối tượng. Tất cả đối tượng tham gia quan hệ phải được học và đủ điểm trước.
- Không tạo một bước bị cụt nghĩa chỉ để giới thiệu động từ, chẳng hạn `the local council turned`. Vì `turned ... into ...` cần đối tượng nguồn và đối tượng kết quả, app phải đợi đến khi người học đã biết các cụm tối thiểu cần cho một quan hệ có nghĩa: `the local council`, `a parking lot` và `a garden`.
- Khi đủ điều kiện, app tạo câu quan hệ cơ bản: `the local council turned a parking lot into a garden`. Câu này là khung nghĩa giúp người học nhìn rõ chủ thể, đối tượng nguồn, quan hệ `turned ... into ...` và đối tượng kết quả.
- Động từ hoặc cụm động từ mới được giới thiệu ngay trong quan hệ hoàn chỉnh, không trở thành một flashcard rời ở tầng đầu. Ý nghĩa của `turned ... into ...` được hiểu qua toàn bộ tình huống: một đối tượng được biến thành một đối tượng khác.
- Sau câu cơ bản, app tiếp tục mở rộng từng vị trí trong câu. Mỗi cụm mở rộng phải được học và đủ điểm riêng trước khi được thay vào khung câu.
- Ví dụ: học `parking lot` -> `empty parking lot` -> `an empty parking lot`, rồi mở rộng câu thành `the local council turned an empty parking lot into a garden`.
- Tiếp theo, học `garden` -> `public garden` -> `small public garden` -> `a small public garden`, rồi mở rộng câu thành `the local council turned an empty parking lot into a small public garden`.
- Như vậy, i+1 hoạt động ở hai cấp: bên trong từng cụm và ở cấp câu. Ở cấp câu, mỗi lượt chỉ thay một vị trí bằng một cụm giàu thông tin hơn mà người học đã thành thạo.
- Giáo án được triển khai lần lượt theo từng câu của bài báo, không học trước toàn bộ danh từ/đối tượng của cả bài. Mỗi câu tạo thành một chu kỳ học nhỏ hoàn chỉnh.
- Chu kỳ của một câu gồm: học các đối tượng mới cần cho câu; xây từng cụm theo i+1; tạo câu cơ bản có nghĩa; mở rộng từng vị trí; rồi tái tạo đúng câu gốc.
- Chỉ khi người học đã hoàn thiện câu hiện tại, dòng học mới chuyển sang câu tiếp theo. Cách này giúp mọi từ và cụm mới được sử dụng ngay trong ngữ cảnh, thay vì trở thành một danh sách dài chưa có quan hệ.
- Kiến thức đã đủ điểm ở câu trước được xem là nền sẵn có cho câu sau. App không tạo lại bài riêng cho đơn vị đó; nếu người học quên, lỗi sẽ xuất hiện tự nhiên khi họ dùng nó trong câu mới và app mới xử lý ngay tại đó.
- Với câu phức, app có thể tách thành các mệnh đề để học riêng nếu mỗi mệnh đề giữ được một ý nghĩa tương đối độc lập và việc tách không làm sai nghĩa câu gốc.
- Không tách câu chỉ vì câu dài hoặc có nhiều dấu phẩy. Ranh giới tách phải dựa trên cấu trúc nghĩa: mỗi phần phải có một thông tin hoặc quan hệ mà người học có thể hiểu và tái tạo riêng.
- Mỗi mệnh đề được xây theo cùng chu kỳ i+1 như một câu nhỏ: đối tượng -> cụm -> quan hệ/câu cơ bản -> mở rộng -> mệnh đề hoàn chỉnh.
- Sau khi các mệnh đề đã đủ điểm, app mới giới thiệu từ nối hoặc quan hệ giữa chúng, rồi yêu cầu người học ghép lại đúng câu gốc.
- Ví dụ với cấu trúc `mệnh đề A, but mệnh đề B`: học mệnh đề A; học mệnh đề B; học chức năng đối lập của `but`; sau đó ghép `A, but B`.
- Nếu một phần phụ thuộc không thể đứng riêng mà vẫn giữ ý nghĩa đúng, nó không được tách thành một bài độc lập giả tạo. Phần đó phải được học cùng mệnh đề chủ hoặc trong một khung nghĩa đủ hoàn chỉnh.
- Với mệnh đề quan hệ, app tìm mệnh đề lõi có nghĩa ở bên trong và xây mệnh đề lõi đó trước. Sau đó mới thêm từ quan hệ để biến mệnh đề thành phần bổ nghĩa cho một danh từ.
- Ví dụ: `child` -> `children` -> `children play` -> `children could play` -> `where children could play`.
- Sau khi `where children could play` đã đủ điểm, app mới gắn nó vào danh từ đã học: `a quiet place` -> `a quiet place where children could play`.
- Modal, thì hoặc sắc thái của hành động được thêm trước từ quan hệ nếu làm như vậy giúp mỗi bước chỉ tăng một lớp nghĩa. Trong ví dụ này, `could` được học trong `children could play` trước khi thêm `where`.
- Nếu mệnh đề quan hệ chứa nhiều nhánh song song, app có thể hoàn thiện từng nhánh lõi riêng rồi mới ghép chúng vào cùng danh từ theo thứ tự của câu gốc.
- Với cấu trúc liệt kê/song song, mỗi nhánh phải được hoàn thiện và đủ điểm riêng trước khi ghép. Các nhánh cần giữ cùng vai trò ngữ pháp trong câu.
- App ghép hai nhánh đầu trước, sau đó thêm từng nhánh tiếp theo bằng từ nối và trật tự của bài gốc. Ví dụ: `children could play`; `older people could meet`; ghép thành `children could play, older people could meet`; sau đó thêm `and office workers could rest`.
- Từ nối `and` chỉ được đưa vào ở bước thêm nhánh cuối nếu đó là hình thức của câu gốc. Dấu phẩy và dấu câu được chỉ ra nhưng không chặn qua theo luật output đã chốt.
- Khi cả chuỗi song song đã đủ điểm, app mới gắn chuỗi đó vào từ quan hệ hoặc danh từ mà nó bổ nghĩa, chẳng hạn `where children could play, older people could meet, and office workers could rest`.
- Trạng ngữ thời gian, địa điểm, cách thức hoặc nguyên nhân cũng được xây như một khối i+1 độc lập trước khi gắn vào mệnh đề.
- Với trạng ngữ có giới từ, app hoàn thiện danh từ/cụm danh từ trước rồi mới thêm giới từ để tạo quan hệ. Ví dụ: `break` -> `breaks` -> `lunch breaks` -> `during lunch breaks`.
- Sau khi khối trạng ngữ đủ điểm, app mới gắn nó vào mệnh đề đã có nghĩa: `office workers could rest` -> `office workers could rest during lunch breaks`.
- Không đưa thẳng giới từ cùng một cụm danh từ mới chưa học trong một lượt. Giới từ là một lớp chức năng ngữ pháp riêng, cần xuất hiện sau phần bổ ngữ của nó.
- Với cụm có từ chỉ lượng hoặc so sánh số lượng, app hoàn thiện danh từ, dạng số và các thành phần bổ nghĩa của danh từ trước; sau đó mới thêm từ chỉ lượng.
- Ví dụ: `bag` -> `bags` -> `plastic bags` -> `fewer plastic bags`.
- Quy tắc này áp dụng tương tự cho `city` -> `cities` -> `many cities`, `resident` -> `residents` -> `some residents`, và `problem` -> `environmental problem` -> `every environmental problem`.
- Từ chỉ lượng không được thêm trước khi hình thức số ít/số nhiều cần thiết của danh từ đã rõ. Nếu từ chỉ lượng quyết định dạng số của danh từ, app vẫn xây dạng danh từ đó ở lượt ngay trước.
- Với hai hoặc nhiều hành động dùng chung một chủ thể, app hoàn thiện từng nhánh hành động riêng trước khi ghép.
- Mỗi nhánh ban đầu phải có đủ chủ thể và hành động để giữ nghĩa rõ: `shops use fewer plastic bags`; `shops place recycling bins outside their doors`.
- Sau khi hai nhánh đều đủ điểm, app có thể ghép dạng đầy đủ trước: `shops use fewer plastic bags and shops place recycling bins outside their doors`.
- Tiếp theo mới học phép lược chủ thể lặp lại để đi tới câu tự nhiên của bài gốc: `shops use fewer plastic bags and place recycling bins outside their doors`.
- Việc lược chủ thể là một bước i+1 riêng về cấu trúc, không được giả định người mất gốc tự hiểu rằng chủ thể của hành động thứ hai vẫn là `shops`.
- Với cấu trúc động từ + đối tượng + `to` + hành động, app hoàn thiện hành động của đối tượng trước, rồi mới đặt toàn bộ hành động đó vào một khung có chủ thể chính đầy đủ.
- Ví dụ, người học hoàn thiện `nearby shops use fewer plastic bags and place recycling bins outside their doors` trước.
- Sau đó app tạo quan hệ đầy đủ: `the project encouraged nearby shops to use fewer plastic bags and place recycling bins outside their doors`.
- Không tạo mảnh `encouraged nearby shops to use...` vì mảnh đó thiếu chủ thể của `encouraged`. Đơn vị mới phải đủ nghĩa để người học biết ai khuyến khích ai làm gì.
- Việc chuyển từ động từ chia theo chủ thể phụ sang động từ nguyên mẫu có `to` là một bước cấu trúc riêng: `nearby shops use...` -> `the project encouraged nearby shops to use...`. App phải thể hiện rõ rằng chủ thể của `use/place` vẫn là `nearby shops`.
- Với cấu trúc động từ báo cáo + `that` + mệnh đề nội dung, app hoàn thiện mệnh đề nội dung trước, sau đó hoàn thiện mệnh đề báo cáo có chủ thể, rồi mới ghép bằng `that`.
- Ví dụ: hoàn thiện `the project would reduce parking spaces and attract noise`; hoàn thiện `some residents complained`; sau đó ghép `some residents complained that the project would reduce parking spaces and attract noise`.
- Không học `complained that` như một mảnh rời thiếu nội dung, và không đưa thẳng toàn bộ câu khi hai mệnh đề chưa đủ điểm.
- `that` là bước i+1 thể hiện quan hệ giữa lời phàn nàn/ý nghĩ/phát biểu và nội dung của nó. App cần làm rõ mệnh đề sau `that` trả lời câu hỏi “họ phàn nàn/cho rằng điều gì?”.
- Nếu mệnh đề nội dung có nhiều vị ngữ dùng chung chủ thể và chung trợ động từ/modal, app hoàn thiện từng nhánh đầy đủ trước.
- Ví dụ: `the project would reduce parking spaces`; `the project would attract noise`.
- App ghép dạng đầy đủ: `the project would reduce parking spaces and the project would attract noise`, rồi tạo một bước lược phần lặp để đạt `the project would reduce parking spaces and attract noise`.
- Phần được lược ở nhánh sau có thể gồm cả chủ thể và modal (`the project would`), nhưng chỉ được lược sau khi người học đã hiểu hai hành động đều thuộc cùng chủ thể và cùng sắc thái `would`.
- Với mệnh đề nội dung bắt đầu bằng từ nghi vấn gián tiếp như `how`, app hoàn thiện mệnh đề lõi trước, sau đó thêm từ nghi vấn để tạo một khối nội dung, rồi mới gắn khối đó vào động từ chính.
- Ví dụ: `people thought about shared space` -> `how people thought about shared space` -> `it changed how people thought about shared space`.
- `how` trong cấu trúc này biểu thị “cách mà/cách thức”, không tạo câu hỏi trực tiếp. Trật tự từ vẫn là trật tự mệnh đề `people thought`, không đảo thành `did people think`.
- Khối `how people thought about shared space` phải đủ điểm trước khi được dùng làm bổ ngữ cho `changed`.
- Với quan hệ nhượng bộ bằng `although`, app hoàn thiện mệnh đề nhượng bộ và mệnh đề chính riêng trước, sau đó mới thêm `although` và ghép theo đúng trật tự câu gốc.
- Ví dụ: `the garden did not solve every environmental problem`; `it changed how people thought about shared space`; sau đó ghép `Although the garden did not solve every environmental problem, it changed how people thought about shared space`.
- `although` là một bước i+1 biểu thị “mặc dù A nhưng B vẫn xảy ra”. App phải làm rõ quan hệ nghĩa này, không xem `although` chỉ là một từ nối hình thức.
- Không thêm `but` vào mệnh đề chính nếu câu gốc dùng cấu trúc `although ..., ...`. Output cuối phải giữ đúng cấu trúc của bài báo.
- Với mệnh đề trạng ngữ bắt đầu bằng `when`, app hoàn thiện mệnh đề lõi trước, kể cả các mệnh đề nội dung nằm bên trong; sau đó mới thêm `when` và gắn khối hoàn cảnh vào mệnh đề chính.
- Ví dụ: `the change belongs to them` -> `people feel that the change belongs to them` -> `when people feel that the change belongs to them`.
- Sau khi khối `when` đủ điểm, app mới ghép với mệnh đề chính đã hoàn thiện: `a simple local project can influence daily habits when people feel that the change belongs to them`.
- Trong ngữ cảnh này, `when` biểu thị hoàn cảnh/thời điểm mà ảnh hưởng xảy ra. App dạy quan hệ nghĩa qua hai mệnh đề hoàn chỉnh, không học `when people feel` như một mảnh cụt.
- Sau khi từng câu trong một đoạn đã đủ điểm, app xây đoạn văn theo i+1 bằng cách dùng mỗi câu đã thành thạo như một khối hoàn chỉnh.
- App ghép câu 1 với câu 2 trước, sau đó thêm từng câu tiếp theo theo đúng thứ tự của bài gốc: `(S1 + S2)` -> `(S1 + S2 + S3)` -> tiếp tục cho đến hết đoạn.
- Không yêu cầu người học nhập toàn đoạn ngay sau khi vừa hoàn thành câu cuối. Bước nhảy từ một câu sang toàn đoạn là quá lớn nếu chưa có các lượt ghép trung gian.
- Ở cấp đoạn, mỗi lượt chỉ thêm một câu đã học. Nếu đoạn quá dài, app có thể tạo các nhóm câu nhỏ có nghĩa trước, rồi ghép các nhóm theo i+1.
- Câu đã đủ điểm không được dạy lại riêng trước khi ghép đoạn. Nếu người học sai khi tái tạo đoạn, app xử lý đúng phần sai rồi yêu cầu làm lại đơn vị ghép hiện tại.
- Mỗi nhiệm vụ phải có một **bản tiếng Việt sư phạm theo bước**. Bản này phải tự nhiên, dễ hiểu với người Việt và phản ánh chính xác đơn vị tiếng Anh đang cần tái tạo.
- Nghĩa tiếng Việt không được dịch máy móc từng chữ, nhưng cũng không được diễn đạt quá thoáng đến mức che mất lớp nghĩa vừa được thêm trong bước i+1.
- Hai lượt liên tiếp nên khác nhau chủ yếu ở đúng lớp nghĩa mới. Ví dụ: `khu vườn` -> `garden`; `khu vườn công cộng` -> `public garden`; `khu vườn công cộng nhỏ` -> `small public garden`; `một khu vườn công cộng nhỏ` -> `a small public garden`.
- Với thay đổi ngữ pháp, bản tiếng Việt phải thể hiện được sự thay đổi nếu tiếng Việt có cách biểu đạt tự nhiên: `thành phố` -> `city`; `các thành phố` -> `cities`; `nhiều thành phố` -> `many cities`.
- Với cấu trúc không có đối ứng từng chữ tự nhiên trong tiếng Việt, bản dịch ưu tiên truyền đạt đúng quan hệ nghĩa và dùng nhất quán trong cả chuỗi. Ví dụ `turned ... into ...` được thể hiện là `đã biến ... thành ...`.
- Bản tiếng Việt trung gian chỉ phục vụ đường đi tới câu gốc, không được thêm thông tin không có trong bài báo hoặc mở rộng sang kiến thức ngoài mục tiêu.
- Một lời nhắc tiếng Việt có thể có nhiều cách diễn đạt tiếng Anh đúng. App phải phân biệt **đúng tiếng Anh/đúng nghĩa** với **đúng đáp án mục tiêu của bài báo**.
- Đáp án để đủ điểm vẫn là từ, cụm, mệnh đề hoặc câu đúng như văn bản gốc đã chọn. Một cách diễn đạt khác dù tự nhiên và đúng nghĩa vẫn chưa được xem là hoàn thành lượt học nếu không khớp mục tiêu.
- Khi có thể nhận biết một câu khác vẫn đúng tiếng Anh và đúng nghĩa, phản hồi không được gọi nó là “sai tiếng Anh”. App nên nói rõ: cách viết này hợp nghĩa, nhưng bài báo dùng một cách diễn đạt khác; sau đó hiển thị đáp án mục tiêu và yêu cầu nhập lại.
- Lỗi viết hoa, dấu câu, dấu nháy hoặc khoảng trắng chỉ được nhắc nhở và không chặn qua như đã chốt. Khác từ vựng, cấu trúc hoặc trật tự từ so với đáp án mục tiêu thì chưa đủ điểm, kể cả khi câu thay thế vẫn có nghĩa.
- Việc yêu cầu khớp bài gốc nhằm giới hạn mục tiêu học và giúp người học thành thạo đúng văn bản, không nhằm phủ nhận các cách diễn đạt tiếng Anh hợp lệ khác.
- Động từ được đưa vào ở đúng dạng ngữ pháp đang xuất hiện trong bài báo. Nếu câu gốc dùng quá khứ `turned ... into ...`, bài quan hệ cũng dùng trực tiếp `turned ... into ...`.
- Không bắt buộc tạo lượt riêng `turn ... into ...` rồi mới chuyển sang `turned ... into ...`, vì điều đó thêm một bước không cần thiết đối với mục tiêu thành thạo chính bài báo. Dạng nguyên mẫu chỉ được học riêng nếu nó thực sự cần cho một đơn vị khác trong lộ trình.
- Nghĩa của thì được gắn với toàn bộ tình huống: `đã biến ... thành ...` -> `turned ... into ...`. Người học tiếp nhận hình thức quá khứ trong một quan hệ có chủ thể và các đối tượng đầy đủ, không học đuôi động từ như một mảnh rời.
- i+1 là luật bất biến cho toàn bộ giáo án, áp dụng từ từ đơn, biến thể từ, cụm danh từ, quan hệ, trạng ngữ, câu, mệnh đề đến đoạn văn. Không có tầng nào được phép nhảy qua đơn vị nền cần thiết.
- Mỗi nhiệm vụ mới phải kế thừa những phần người học đã đủ điểm và chỉ thêm một lớp nghĩa hoặc một chức năng ngữ pháp mới. Ví dụ: `neighborhood` -> `one neighborhood` -> `in one neighborhood`.
- Sau khi cụm địa điểm đã đủ điểm, app mới gắn nó vào quan hệ hoàn chỉnh đã biết: `the local council turned an empty parking lot into a small public garden` -> `In one neighborhood, the local council turned an empty parking lot into a small public garden`.
- “Một bước” được tính theo một **đơn vị nghĩa/chức năng không thể tách hợp lý**, không nhất thiết luôn là đúng một token. Cấu trúc như `turned ... into ...` được xem là một đơn vị quan hệ vì tách thành `turned` sẽ làm mất nghĩa cần học.
- Trước khi sinh một nhiệm vụ, app phải kiểm tra mọi thành phần nền của nhiệm vụ đó đã được học chưa. Nếu còn một thành phần mới chưa có bước chuẩn bị, nhiệm vụ đó là bước nhảy và phải được tách lại.
- Khi thêm một thành phần bổ nghĩa làm thay đổi mạo từ, app phải tách thay đổi về nghĩa và thay đổi về hình thức thành hai bước. Không đưa đồng thời tính từ mới và mạo từ mới trong cùng một lượt nếu có thể tách hợp lý.
- Ví dụ: `parking lot` -> `empty parking lot` -> `an empty parking lot`. Lượt đầu thêm nghĩa `trống`; lượt sau hoàn thiện cụm danh từ bằng mạo từ `an`.
- Không dùng lộ trình `a parking lot` -> `an empty parking lot` làm một bước duy nhất, vì lượt đó vừa thêm `empty` vừa đổi `a` thành `an`.
- `an empty parking lot` phải được hoàn thiện trước khi thay vào câu quan hệ cơ bản. App được phép đi từ câu cơ bản có `a parking lot` sang câu mở rộng có `an empty parking lot`, vì người học nhìn thấy rõ câu được phát triển từ đơn giản đến phức tạp.

## 1. Tóm tắt ý tưởng

Ứng dụng này không bắt đầu bằng một giáo trình tiếng Anh tổng quát. Ứng dụng bắt đầu bằng một mục tiêu cụ thể hơn: **người học chọn một bài báo có sẵn trong hệ thống và học đến khi thành thạo toàn bộ tiếng Anh xuất hiện trong bài báo đó**.

Người học có thể bắt đầu từ con số 0. Họ không cần học hết một lộ trình A1, A2, B1 trước khi được đọc bài báo. Thay vào đó, mỗi bài báo được biến thành một khóa học nhỏ, trong đó ứng dụng dẫn người học đi từ đơn vị dễ hiểu nhất đến đơn vị khó hơn:

1. Đối tượng, danh từ, khái niệm có thể hình dung được.
2. Thuộc tính của đối tượng.
3. Cụm từ đơn giản.
4. Cụm từ phức tạp.
5. Hành động và mối quan hệ giữa các đối tượng.
6. Câu đơn.
7. Câu mở rộng.
8. Câu phức.
9. Đoạn văn.
10. Toàn bộ bài báo.

Mục tiêu tâm lý của sản phẩm là giúp người học không bị áp lực bởi mục tiêu "giỏi tiếng Anh". Thay vào đó, họ có một mục tiêu ngắn, rõ và có thể đo được: **hôm nay tôi sẽ chinh phục bài báo này**.

## 2. Định nghĩa sản phẩm

### 2.1. Bài báo là khóa học

Mỗi bài báo trong ứng dụng là một khóa học riêng. Bài báo không chỉ là văn bản để đọc, mà là một bộ học liệu được chuẩn bị sẵn, gồm:

- văn bản gốc;
- bản dịch/ý nghĩa tiếng Việt theo ngữ cảnh;
- danh sách đối tượng/danh từ trong bài;
- danh sách cụm từ;
- danh sách câu;
- phân tích cấu trúc câu;
- các điểm ngữ pháp xuất hiện trong bài;
- bài tập theo từng tầng;
- chuỗi chứng minh thành thạo;
- dữ liệu để đồng bộ với hồ sơ người học.

Ban đầu, ứng dụng nên ưu tiên **bài báo có sẵn và được biên soạn bài bản**, không nên để người dùng đưa bất kỳ bài báo nào vào ngay. Lý do: để dạy người mất gốc hiểu thật sự, mỗi bài cần được tách lớp, viết giải thích, tạo bài tập và đặt tiêu chí thành thạo rất cẩn thận.

### 2.2. Mỗi bài báo có thể bắt đầu từ con số 0

Với mỗi bài báo riêng lẻ, hệ thống phải có khả năng dạy từ đầu như thể người học chưa biết gì. Tuy nhiên, ứng dụng vẫn lưu lại kiến thức người học đã thành thạo ở các bài trước.

Ví dụ:

- Nếu người học đã thành thạo từ `student` ở bài trước, bài mới không bắt học lại từ đầu.
- Nếu bài mới dùng `student` theo nghĩa quen thuộc, app chỉ kiểm tra nhanh.
- Nếu bài mới dùng một nghĩa mới hoặc trong cụm mới, app chỉ dạy phần mới đó.

Như vậy, mỗi bài báo vẫn độc lập, nhưng qua nhiều bài, năng lực của người học được tích lũy.

### 2.3. Phạm vi bản đầu: đọc là input, viết là output

Về dài hạn, học một ngôn ngữ cần đủ bốn kỹ năng: đọc, nghe, nói và viết. Tuy nhiên, để xây dựng bản đầu đơn giản, nhanh và kiểm soát được chất lượng, app sẽ tập trung vào hai kỹ năng đại diện:

- **Đọc** đại diện cho input: người học nhìn văn bản tiếng Anh và hiểu được từ, cụm, câu, đoạn và toàn bài.
- **Viết/dịch ngược chính xác** đại diện cho output: người học nhìn bản tiếng Việt và viết lại đúng tiếng Anh của bài báo gốc.

IPA vẫn là một phần quan trọng, nhưng vai trò chính trong bản đầu là giúp người học biết cách đọc thầm, phát âm trong đầu và tránh ghi nhớ mặt chữ sai âm. App có thể cho nghe mẫu phát âm nếu có, nhưng nghe hiểu và nói thành tiếng chưa phải mục tiêu chính của MVP.

Vì vậy, trong bản đầu, một bài báo được xem là hoàn thành khi người học:

1. Đọc hiểu được bài báo tiếng Anh gốc.
2. Viết/dịch ngược được từ bản tiếng Việt sang đúng tiếng Anh của bài báo gốc, theo từng tầng từ cụm ngắn đến toàn bài.

Nghe và nói sẽ được phát triển ở giai đoạn sau, khi phương pháp đọc và viết đã vững.

## 3. Nguyên lý cốt lõi

### 3.1. Học theo khả năng tự tạo nghĩa, không học theo thứ tự xuất hiện

Không nên lấy bài báo ra, gặp từ nào thì dạy từ đó. Thứ tự xuất hiện trong bài không phải lúc nào cũng phù hợp với người mất gốc.

Thứ tự đúng hơn là: **đơn vị nào có thể tạo nghĩa độc lập hơn thì học trước; đơn vị nào chỉ có nghĩa khi nằm trong cụm/câu thì học sau**.

Ví dụ:

- `student`, `school`, `problem`, `city` có thể học sớm vì người học có thể hình dung đối tượng.
- `new`, `serious`, `quickly`, `because`, `although` không nên dạy quá sớm theo kiểu từ rời rạc.
- `improve`, `affect`, `introduce` không nên là neo đầu tiên, vì động từ cần chủ thể, đối tượng và tình huống mới có nghĩa đầy đủ.

### 3.2. Danh từ/đối tượng là neo cơ bản nhất

Với người học mất gốc, neo đầu tiên nên là **đối tượng**.

Lý do:

- Nhận thức của người mới thường bắt đầu bằng câu hỏi: "Ai/cái gì đang được nói tới?"
- Danh từ giúp người học tạo bản đồ về thế giới trong bài báo.
- Động từ thường cần ngữ cảnh: ai làm, làm gì, tác động vào cái gì.
- Tính từ và trạng từ thường chỉ có ý nghĩa rõ khi bổ nghĩa cho một đối tượng hoặc hành động đã biết.

Trục học cơ bản:

**Đối tượng -> thuộc tính của đối tượng -> hành động/liên hệ giữa đối tượng -> cụm nghĩa -> câu -> đoạn -> bài báo**

Ở tầng từ riêng lẻ, app không học toàn bộ từ trong bài. Tầng này tập trung vào **đối tượng**: danh từ, người, vật, địa điểm, tổ chức, khái niệm chính. Các loại từ khác như động từ, tính từ, trạng từ, giới từ hoặc liên từ chỉ nên xuất hiện khi chúng chuẩn bị được dùng để mở rộng đối tượng thành cụm hoặc câu.

Khi cần mở rộng, app có thể giới thiệu một từ mới ngay trước khi dùng nó. Ví dụ trước khi học `students learn English`, app có thể cho người học gặp từ mới `learn`, nhưng không dạy `learn` như một từ đứng lẻ lâu dài. Từ chuyển tiếp này vẫn cần có bài IPA riêng để người học biết cách đọc chuẩn: nghe âm, nhìn nghĩa/vai trò tiếng Việt và nhập IPA. Ngay sau đó, app gắn `learn` với các đối tượng đã biết như `students` và `English` để tạo thành một cụm/câu có nghĩa.

### 3.3. Không có từ vựng mồ côi

Mỗi từ mới phải được học trong một lý do và một tình huống rõ ràng.

Ứng dụng không nên chỉ hiện:

> policy = chính sách

Mà nên giải thích:

> Trong bài này, `policy` là một quy định hoặc kế hoạch do một cơ quan, trường học, công ty hoặc chính phủ đưa ra để xử lý một vấn đề. Từ này xuất hiện vì bài báo đang nói về cách một tổ chức thay đổi cách hành động của mình.

Mỗi từ mới cần trả lời được:

- Nó chỉ cái gì?
- Nó xuất hiện trong bài để phục vụ ý nào?
- Nó được dùng trong tình huống nào?
- Nghĩa trong bài là nghĩa nào?
- Khi nào người học có thể gặp lại nó?
- Nó kết hợp với những từ nào trong bài?

### 3.4. i+1: Mỗi bước chỉ tăng một độ khó nhỏ

Người học không nên nhảy từ "biết một danh từ" sang "đọc câu phức". Mỗi bước chỉ nên thêm một lớp mới vào cái đã biết.

Ví dụ:

1. `problem`
2. `serious problem`
3. `a serious problem`
4. `a serious problem in the city`
5. `Pollution is a serious problem in the city.`
6. `Pollution is a serious problem in the city because many people use cars every day.`

Mỗi dòng ở trên chỉ khó hơn dòng trước một chút. Đó là cảm giác phát triển dần dần mà app cần tạo ra.

### 3.5. Thành thạo trước khi mở tầng tiếp theo

Người học không chỉ "xem xong" là qua. Họ phải chứng minh mình đã nắm được đơn vị học bằng cách tự nhập lại được đơn vị đó.

Để giữ sản phẩm đơn giản và tăng ghi nhớ chủ động, dạng bài chính trong MVP là **nhập tự do**. App không nên dùng chọn đáp án, ghép thẻ, điền khuyết hoặc gợi ý chữ cái như hình thức luyện chính.

Độ khó được điều chỉnh bằng kích thước đơn vị cần nhập, không phải bằng cách đổi sang dạng bài dễ hơn:

1. Nhập một danh từ/đối tượng.
2. Nhập một cụm ngắn.
3. Nhập một cụm dài hơn.
4. Nhập một câu đơn.
5. Nhập một câu mở rộng.
6. Nhập một câu phức.
7. Nhập một đoạn.
8. Nhập/dịch ngược toàn bài.

Luật đủ điểm để qua trong MVP: **đúng một lượt hoàn chỉnh thì qua; sai thì sửa ngay đến khi đúng; sau đó app dùng đơn vị đó trong bước i+1 tiếp theo**.

Với từ riêng lẻ, app nên đưa lượt nhập IPA lên trước lượt nhập tiếng Anh. Người học nhìn từ tiếng Anh, nhìn nghĩa tiếng Việt, nghe âm thanh mẫu được phát tự động và nhập IPA của từ đó. Sau khi IPA đúng, app mới yêu cầu người học nhìn nghĩa tiếng Việt và nhập lại từ tiếng Anh. Nếu sai ở lượt IPA hoặc lượt nhập tiếng Anh, app hiển thị đáp án đúng, chỉ ra phần sai và cho nhập lại ngay lượt đó. Bài này giúp người học gắn mặt chữ, nghĩa và âm chuẩn trước khi phải tự nhớ lại từ tiếng Anh.

Vì IPA có nhiều ký hiệu người mới không gõ được bằng bàn phím thường, app cần có cơ chế nhập IPA trực tiếp trong giao diện. Bản tối thiểu nên có một bàn phím IPA nhỏ nằm cạnh hoặc dưới ô nhập, chia thành các nhóm theo Oxford: dấu trọng âm/độ dài, phụ âm, nguyên âm và âm đôi. Bàn phím này cần bao phủ các ký hiệu trong Oxford Learner's Dictionaries, gồm hệ English/Academic và các ký hiệu Oxford American đang dùng trong dữ liệu bài học như `oʊ`, `ər`, `ɪr`, `ɛr`, `ɑr`, `ɔr`, `ʊr`. Người học vẫn có thể tự gõ hoặc dán IPA nếu muốn.

### 3.6. Học là một dòng chảy có tiến hóa và thoái hóa

App không nên thiết kế theo kiểu tách cứng "bài học" và "bài kiểm tra". Người học không cần cảm thấy mình đang học xong một phần rồi bị đưa sang một phòng thi riêng.

Thay vào đó, toàn bộ trải nghiệm nên là một dòng chảy liên tục. Mỗi lần người học nhập lại một từ, cụm, câu, đoạn hoặc dịch ngược đều vừa là học, vừa là bằng chứng để app đánh giá mức độ thành thạo.

Mỗi đơn vị kiến thức như một danh từ, cụm từ, cấu trúc câu hoặc câu gốc sẽ có trạng thái động:

- **chưa gặp**;
- **đang học**;
- **đang quen**;
- **gần thành thạo**;
- **thành thạo**;
- **cần học lại**.

Khi người học trả lời đúng đủ nhiều lần và dùng đúng đơn vị đó trong đơn vị lớn hơn, đơn vị đó sẽ **tiến hóa** lên mức cao hơn. App có thể mặc định xem người học đã học được từ/cụm/câu đó và dùng nó làm nền cho bước tiếp theo.

Khi người học trả lời sai, đặc biệt là sai lặp lại hoặc sai sau khi đã từng đúng, đơn vị đó sẽ **thoái hóa** xuống mức thấp hơn. App không phạt người học và cũng không đổi sang dạng bài dễ hơn. App hiển thị đáp án đúng, chỉ ra người học sai ở đâu, rồi cho người học làm lại ngay chính lượt nhập đó cho đến khi nhập đúng.

Nguyên tắc là: sai bài nào thì làm lại đúng bài đó ngay. Ví dụ, nếu người học dịch ngược sai cụm `new policy`, app hiển thị `new policy`, chỉ ra lỗi, rồi yêu cầu người học nhập lại `new policy` ngay. Nếu người học sai một câu, app chỉ ra phần sai trong câu và cho nhập lại chính câu đó ngay. Khi đã đúng, dòng học tiếp tục tiến lên i+1.

Như vậy, "hoàn thành bài báo" không nhất thiết phải đến từ một bài kiểm tra tách biệt. Nó là trạng thái xuất hiện khi hệ thống đã có đủ bằng chứng rằng người học đọc hiểu và dịch ngược chính xác các phần cần thiết của bài báo.

### 3.7. Thành thạo phải có đủ input, output và bằng chứng duy trì tự nhiên

Một đơn vị kiến thức không được xem là thành thạo chỉ vì người học trả lời đúng vài lần liên tiếp. App cần phân biệt giữa "vừa làm đúng", "đã hiểu", "đã dùng được" và "đã đủ vững để đi tiếp".

Nguyên tắc chốt: **một đơn vị chỉ được xem là thành thạo khi có đủ ba nhóm bằng chứng**:

1. **Input**: người học nhận ra và hiểu đơn vị đó khi đọc tiếng Anh.
2. **Output**: người học viết/dịch ngược được đơn vị đó từ tiếng Việt sang đúng tiếng Anh của bài báo gốc.
3. **Duy trì tự nhiên**: người học tiếp tục dùng đúng đơn vị đó khi nó xuất hiện trong đơn vị lớn hơn như cụm, câu, đoạn hoặc bài báo mới.

Ví dụ, với cụm `new policy`, người học chưa được xem là thành thạo nếu chỉ nhìn cụm này và hiểu nghĩa "chính sách mới". Đó mới là input. Để thành thạo, người học còn cần nhìn "chính sách mới" và viết đúng `new policy`, rồi tiếp tục dùng đúng cụm đó khi cụm được đưa vào câu lớn hơn như `The school introduced a new policy.`

Như vậy, trạng thái thành thạo không dựa vào số lần đúng máy móc, mà dựa vào chất lượng bằng chứng. Một lần nhập tự do đúng có giá trị mạnh hơn nhiều lần chỉ nhận ra đáp án khi nhìn thấy.

App không chủ động chen bài cũ vào dòng học chỉ để ôn lại nếu người học đã đủ điểm. **Qua là qua**. Dòng học tiếp tục tiến lên theo i+1: từ -> cụm -> câu -> đoạn -> toàn bài.

Nếu người học đã quên, điều đó sẽ lộ ra khi đơn vị cũ xuất hiện tự nhiên trong một cụm/câu/đoạn mới và người học nhập sai. Khi đó app mới quay lại sửa đúng phần sai, ngay lập tức, rồi tiếp tục dòng học.

## 4. Cơ sở khoa học

Phương pháp này nên dựa trên các nguyên lý đã được sử dụng rộng rãi trong giáo dục và học ngôn ngữ.

### 4.1. Giảm tải nhận thức

Người mất gốc không thể xử lý cùng lúc mặt chữ, phát âm, nghĩa, ngữ pháp, cấu trúc câu và ý bài. Theo lý thuyết tải nhận thức, khi một nhiệm vụ quá phức tạp, trí nhớ làm việc bị quá tải và việc học kém hiệu quả.

Vì vậy, app cần tách bài báo thành các đơn vị nhỏ: đối tượng, thuộc tính, cụm từ, câu, đoạn. Người học chỉ tập trung vào một loại khó khăn mỗi lần.

### 4.2. Vùng phát triển gần và scaffolding

Người học học tốt nhất khi bài học nằm ngay trên mức họ đã biết một chút. Trong app này, scaffolding không nên hiểu là đưa nhiều dạng gợi ý như chọn đáp án, kéo thả hoặc điền khuyết. Scaffolding nên đến từ việc chia nhỏ đơn vị nhập: từ riêng, cụm ngắn, cụm dài, câu đơn, câu phức, đoạn và toàn bài.

Ví dụ với một câu khó:

1. Người học nhập các danh từ/đối tượng trong câu.
2. Người học nhập các cụm ngắn trong câu.
3. Người học nhập các cụm dài hơn.
4. Người học nhập câu hoàn chỉnh.
5. Nếu sai, app hiện đáp án, chỉ ra phần sai và cho nhập lại ngay đúng lượt đó.

### 4.3. Mastery learning

Mỗi tầng học phải có tiêu chí qua bài rõ ràng. Người học có thể tốn thời gian khác nhau, nhưng kết quả cần đạt là: nắm chắc đơn vị học trước khi sang đơn vị mới.

Điều này phù hợp với ý tưởng mastery learning: tiến độ có thể cá nhân hóa, nhưng mức độ thành thạo thì phải được định nghĩa rõ.

### 4.4. Retrieval practice

Người học nhớ lâu hơn khi phải chủ động lấy thông tin từ trí nhớ, thay vì chỉ đọc lại đáp án hoặc nhận ra đáp án trong danh sách lựa chọn. Vì vậy, bài tập trong MVP nên ưu tiên nhập tự do:

- nhập từ tiếng Anh khi thấy nghĩa tiếng Việt;
- nhập IPA nếu đang luyện IPA;
- nhập cụm tiếng Anh khi thấy cụm tiếng Việt;
- nhập câu tiếng Anh khi thấy câu tiếng Việt;
- nhập đoạn tiếng Anh khi thấy đoạn tiếng Việt;
- dịch ngược toàn bài theo bản tiếng Việt sư phạm.

Các dạng chọn đáp án, ghép thẻ hoặc điền khuyết không nên là hình thức luyện chính, vì chúng dễ tạo cảm giác quen thuộc giả mà không bảo đảm người học tự gọi lại được kiến thức.

### 4.5. Ôn lại theo lỗi phát sinh

Trong phiên bản này, app không chủ động chen kiến thức cũ vào bài mới chỉ để ôn lại nếu người học đã được xem là đủ điểm. Dòng học phải giữ cảm giác phát triển i+1, đi từ đơn vị nhỏ đến đơn vị lớn hơn.

Kiến thức cũ chỉ quay lại khi có lý do tự nhiên:

- nó là thành phần cần dùng trong một cụm/câu/đoạn mới;
- người học nhập sai đơn vị đó hoặc sai phần có chứa đơn vị đó;
- người học gặp lại đơn vị đó ở bài báo khác.

Nếu người học sai, app cho làm lại ngay phần sai. Nếu người học đúng, app tiếp tục đưa họ tiến lên đơn vị i+1 tiếp theo. Như vậy, ôn lại không phải một luồng riêng, mà là cơ chế sửa lỗi phát sinh trong dòng học.

## 5. Lộ trình học chi tiết cho một bài báo

### Tầng 0. Nhìn đích đến

Mục tiêu của tầng này là giảm sợ hãi.

Người học thấy:

- tiêu đề bài báo;
- chủ đề bài báo;
- tóm tắt tiếng Việt rất ngắn;
- lời hứa học tập: "Sau khóa này, bạn sẽ đọc hiểu, giải thích và tóm tắt được bài báo này."

Người học không bị yêu cầu đọc hiểu toàn bài ngay.

### Tầng 1. Bản đồ đối tượng

App trích ra các danh từ/đối tượng quan trọng nhất trong bài.

Tầng này không phải danh sách tất cả từ vựng trong bài. Nó chỉ là bản đồ các đối tượng làm neo nghĩa. Những từ không phải đối tượng, như hành động, tính chất, trạng thái, giới từ hoặc liên từ, sẽ được đưa vào sau khi người học cần chúng để tạo cụm/câu.

Ưu tiên:

1. Đối tượng cụ thể: người, vật, địa điểm, tổ chức.
2. Đối tượng trừu tượng gần gũi: vấn đề, kế hoạch, thay đổi, kết quả.
3. Khái niệm trừu tượng/chuyên ngành: chính sách, nền kinh tế, khí hậu, quyền riêng tư.

Ví dụ trong một bài về giáo dục:

- `student`
- `school`
- `teacher`
- `education`
- `policy`
- `problem`
- `result`

Mỗi đối tượng được biến thành một "thẻ đối tượng".

Nội dung thẻ:

- từ tiếng Anh;
- phát âm;
- IPA;
- nghĩa tiếng Việt trong bài;
- giải thích đời thường;
- ví dụ hình dung;
- câu trong bài có chứa từ đó;
- độ khó;
- trạng thái thành thạo.

### Tầng 2. Học đối tượng riêng lẻ

Người học học từng đối tượng, nhưng không học như từ điển khô.

Ở tầng này, app chưa cần dạy rời các động từ hoặc tính từ chưa gắn với đối tượng. Nếu một từ mới không tự đứng làm đối tượng, app nên chờ đến tầng cụm/câu để đưa vào.

Chu trình một đối tượng:

1. Xem nghĩa tiếng Việt đời thường.
2. Xem tình huống trong bài.
3. Xem từ tiếng Anh, IPA và cách đọc nếu cần.
4. Nhập lại từ tiếng Anh từ nghĩa tiếng Việt.
5. Nghe âm và nhìn nghĩa tiếng Việt.
6. Nhập lại IPA của từ.
7. Nếu sai, app hiện đáp án đúng và chỉ rõ phần sai.
8. Nếu sai, app cho nhập lại ngay đúng yêu cầu đó.
9. Khi nhập đúng đủ ổn định, từ đó được đưa vào cụm rất ngắn.

Tiêu chí qua:

- nhận ra từ khi đọc;
- đọc được từ ở mức chấp nhận;
- biết nghĩa trong ngữ cảnh bài;
- biết đây là người, vật, địa điểm, tổ chức hay khái niệm;
- nhập lại đúng từ tiếng Anh khi thấy nghĩa tiếng Việt;
- nghe âm, nhìn nghĩa tiếng Việt và nhập đúng IPA của từ;
- không nhầm với đối tượng gần nghĩa khác trong cùng bài.

### Tầng 3. Thuộc tính của đối tượng

Sau khi có đối tượng, app mới đưa vào tính từ, số lượng, mức độ, tính chất.

Ví dụ:

1. `problem`
2. `serious problem`
3. `a serious problem`
4. `many serious problems`

Người học không học `serious` như một từ rời ngay từ đầu. Họ học nó vì nó làm thay đổi ý nghĩa của `problem`.

Nội dung cần dạy:

- từ nào là đối tượng chính;
- từ nào đang bổ nghĩa;
- bổ nghĩa làm đối tượng thay đổi như thế nào;
- cụm này trong bài đang nói về tình huống nào.

Tiêu chí qua:

- chỉ ra được danh từ chính trong cụm;
- hiểu tính từ/từ bổ nghĩa làm thay đổi nghĩa ra sao;
- dịch cụm sang tiếng Việt tự nhiên;
- nhập lại đúng cụm từ tiếng Anh khi thấy nghĩa tiếng Việt.

### Tầng 4. Cụm danh từ và cụm giới từ đơn giản

Khi người học đã quen với đối tượng và thuộc tính, app dạy các cụm ngắn.

Ví dụ:

- `new policy`
- `many students`
- `in the city`
- `at school`
- `the main problem`
- `a change in education`

Ở tầng này, người học bắt đầu gặp các từ chức năng như `a`, `the`, `in`, `at`, `of`, nhưng app không dạy bằng lý thuyết dài. App giải thích bằng vai trò:

- `a`: một đối tượng chưa xác định cụ thể;
- `the`: đối tượng đã xác định hoặc đã được nói tới;
- `in`: nằm trong một không gian, lĩnh vực hoặc bối cảnh;
- `of`: tạo quan hệ sở hữu, thành phần hoặc liên quan.

Tiêu chí qua:

- hiểu nghĩa cả cụm;
- biết từ nào là trung tâm;
- biết các từ nhỏ có tác dụng gì trong cụm;
- không dịch máy móc từng từ theo thứ tự tiếng Anh.

### Tầng 5. Hành động và mối quan hệ

Động từ được đưa vào sau khi người học đã có đối tượng.

Nguyên tắc: **không dạy động từ như một từ đứng một mình**, mà dạy động từ trong mối quan hệ:

**Ai/cái gì -> làm gì -> với ai/cái gì**

Trước khi học một cụm/câu có hành động mới, app có thể cho người học gặp nhanh từ hành động đó: nghĩa tiếng Việt, cách đọc, vai trò trong bài. Từ hành động này vẫn phải có lượt IPA: nghe âm, nhìn nghĩa/vai trò tiếng Việt và nhập IPA. Nhưng bước này chỉ là cầu nối. Ngay sau đó, người học phải dùng hành động đó để nhập một cụm/câu gắn với đối tượng đã học.

Ví dụ:

- `students learn English`
- `schools change policies`
- `the policy affects students`
- `people need clean water`

Lúc này, động từ có nghĩa rõ vì đã có chủ thể và đối tượng.

Nội dung cần dạy:

- ai/cái gì thực hiện hành động;
- hành động là gì;
- hành động tác động đến ai/cái gì;
- động từ này trong bài có nghĩa nào;
- động từ có đi với tân ngữ hay không.

Tiêu chí qua:

- xác định được chủ thể;
- xác định được động từ chính;
- xác định được đối tượng bị tác động nếu có;
- nhập lại đúng cụm/câu ngắn có động từ trong đúng ngữ cảnh.

### Tầng 6. Câu đơn

Người học bắt đầu học câu có cấu trúc rõ.

Mẫu cần dạy:

- `A is B.`
- `A has B.`
- `A does B.`
- `A changes B.`
- `A needs B.`

Ví dụ:

- `The school has a new policy.`
- `Many students need help.`
- `The city has a serious problem.`

Cách phân tích câu:

1. Ai/cái gì đang được nói tới?
2. Từ nào là động từ chính?
3. Câu này nói điều gì về đối tượng?
4. Có thông tin phụ nào không?

Tiêu chí qua:

- đọc được câu;
- hiểu nghĩa câu;
- tách được chủ ngữ, động từ, tân ngữ/bổ ngữ;
- viết lại hoặc diễn giải ý câu bằng tiếng Việt đơn giản;
- sắp xếp được các mảnh thành câu đúng.

### Tầng 7. Câu mở rộng

Từ câu đơn, app thêm dần thông tin về:

- nơi chốn;
- thời gian;
- lý do;
- mục đích;
- kết quả;
- đối tượng liên quan.

Ví dụ:

1. `Students learn English.`
2. `Many students learn English online.`
3. `Many students learn English online because they need better jobs.`

Mỗi lần chỉ thêm một lớp mới, để người học cảm thấy mình đang mở rộng cái đã biết.

Tiêu chí qua:

- nhận ra phần lõi của câu;
- nhận ra thông tin được thêm vào;
- hiểu từ nối hoặc cụm nối có tác dụng gì;
- rút gọn câu dài về ý cơ bản.

### Tầng 8. Câu phức và ngữ pháp trong bài

Ngữ pháp chỉ được dạy khi nó xuất hiện trong bài và người học đã có đủ nền tảng để hiểu.

Ví dụ:

- thì hiện tại đơn;
- thì quá khứ đơn;
- bị động;
- mệnh đề quan hệ;
- `because`, `although`, `while`, `if`;
- câu có cụm danh từ dài;
- câu có nhiều mệnh đề.

Nguyên tắc dạy ngữ pháp:

- không dạy một chương lý thuyết lớn;
- chỉ dạy mẫu đang xuất hiện trong bài;
- dùng câu trong bài làm ví dụ trung tâm;
- giải thích bằng tiếng Việt đời thường;
- cho người học thao tác trên câu thật.

Tiêu chí qua:

- hiểu mẫu ngữ pháp trong câu thật;
- giải thích được nó làm thay đổi nghĩa như thế nào;
- nhận ra mẫu đó khi gặp lại trong câu khác;
- sửa hoặc hoàn thành câu có cùng mẫu.

### Tầng 9. Hiểu từng câu trong bài báo

Mỗi câu trong bài được đưa vào chu trình:

1. Đọc câu.
2. Đối chiếu IPA/phát âm của các từ quan trọng nếu cần.
3. Tách cụm.
4. Tìm đối tượng chính.
5. Tìm hành động/liên hệ chính.
6. Tìm thông tin phụ.
7. Hiểu nghĩa tự nhiên bằng tiếng Việt.
8. Trả lời một câu hỏi nhỏ về câu.
9. Viết lại ý câu bằng tiếng Việt.
10. Dịch ngược từ tiếng Việt sang tiếng Anh bằng nhập tự do.

Tiêu chí qua:

- hiểu từng câu quan trọng;
- không bị lạc trong câu dài;
- biết câu đó đóng vai trò gì trong đoạn;
- có thể giải thích câu bằng ngôn ngữ của mình.

### Tầng 10. Hiểu từng đoạn

Khi đã hiểu câu, app chuyển sang đoạn.

Nội dung cần dạy:

- câu nào là ý chính;
- câu nào giải thích;
- câu nào đưa ví dụ;
- câu nào nêu nguyên nhân;
- câu nào nêu kết quả;
- đại từ như `it`, `they`, `this` đang thay cho cái gì;
- đoạn này liên kết với đoạn trước như thế nào.

Tiêu chí qua:

- tóm tắt được đoạn bằng tiếng Việt;
- viết được ý chính của đoạn;
- trả lời câu hỏi đọc hiểu;
- viết/giải thích được vì sao các câu trong đoạn đi cùng nhau.

### Tầng 11. Thành thạo toàn bài báo

Đây là tầng tổng hợp.

Người học cần làm được:

- đọc lại toàn bài với ít hoặc không cần xem đáp án;
- hiểu ý chính toàn bài;
- hiểu các chi tiết quan trọng;
- giải thích các từ/cụm/ngữ pháp quan trọng;
- trả lời câu hỏi về nội dung;
- tóm tắt bài bằng tiếng Việt;
- viết lại nội dung bài bằng tiếng Anh đơn giản;
- dịch ngược từ bản tiếng Việt sang tiếng Anh theo từng phần;
- nhận ra những kiến thức đã học khi gặp lại ở bài mới.

## 6. Định nghĩa "thành thạo bài báo"

Thành thạo bài báo không có nghĩa là người học đã giỏi toàn bộ tiếng Anh. Nó có nghĩa là với bài báo đó, người học đạt được cả hai chiều học ngôn ngữ ở phạm vi bản đầu:

1. **Input qua đọc**: đọc hiểu được bài báo tiếng Anh gốc.
2. **Output qua viết**: viết/dịch ngược được nội dung bài báo từ tiếng Việt sang đúng tiếng Anh của bài báo gốc.

Nghe và nói là hai kỹ năng quan trọng, nhưng chưa phải tiêu chí hoàn thành trong MVP. IPA được dùng để hỗ trợ đọc đúng, phát âm trong đầu và tạo nền cho nghe/nói ở giai đoạn sau.

### 6.1. Thành thạo input: đọc hiểu bài báo gốc

Người học được xem là đạt input khi họ có thể:

- đọc lại toàn bài với ít hoặc không cần xem đáp án;
- hiểu các đối tượng/danh từ, khái niệm chính trong bài;
- hiểu các cụm từ quan trọng và không dịch máy móc từng từ;
- hiểu và phân tích được các câu chính;
- hiểu những mẫu ngữ pháp xuất hiện trong bài;
- hiểu ý chính, ý phụ và logic của từng đoạn;
- trả lời đúng các câu hỏi đọc hiểu;
- tóm tắt được bài bằng tiếng Việt.

### 6.2. Thành thạo output: viết/dịch ngược sang tiếng Anh

Người học được xem là đạt output khi nhìn bản tiếng Việt của bài và viết lại được **đúng tiếng Anh của bài báo gốc** theo các mức tăng dần:

1. Viết lại các danh từ/đối tượng chính.
2. Viết lại các cụm từ ngắn.
3. Viết lại các cụm từ phức tạp.
4. Viết lại câu đơn.
5. Viết lại câu mở rộng.
6. Viết lại câu phức.
7. Viết lại từng đoạn.
8. Dịch ngược toàn bài đúng theo bài báo gốc, như một chặng chinh phục nâng cao.

Output trong app này không phải là viết tiếng Anh tự do. Mục tiêu là **tái tạo chính xác bài báo đã học**. Lý do là để thu hẹp phạm vi, giảm áp lực cho người học và giúp tiêu chí hoàn thành rõ ràng: học bài báo nào thì dịch ngược đúng bài báo đó.

Trong quá trình luyện tập, app không nên dùng nhiều dạng bài như chọn đáp án, ghép thẻ, điền khuyết hoặc gợi ý chữ cái. Một dạng bài cốt lõi là **nhập tự do**. Độ khó tăng dần theo độ dài và độ phức tạp của đơn vị cần nhập:

- nhập một từ;
- nhập một cụm ngắn;
- nhập một cụm dài;
- nhập một câu;
- nhập từng đoạn;
- dịch ngược toàn bài.

Mốc chứng minh hoàn thành cuối cùng phải hướng tới kết quả giống bài báo gốc. Nếu người học viết một câu đúng ý nhưng khác từ/cấu trúc của bài gốc, app có thể ghi nhận là hiểu nghĩa, nhưng chưa tính là hoàn thành output của bài báo đó.

Khi người học nhập sai, app hiển thị đáp án đúng, chỉ ra phần sai và cho nhập lại ngay đúng lượt đó. App không cần hạ độ khó bằng bài chọn, bài ghép, bài điền khuyết hoặc gợi ý.

Khi chấm output, "giống bài báo gốc" tập trung vào từ vựng, trật tự từ, cấu trúc câu, chia động từ, mạo từ, giới từ, số ít/số nhiều và các cụm trọng tâm. Các lỗi hình thức như viết hoa, dấu chấm, dấu phẩy, dấu nháy hoặc dấu câu tương tự không nên chặn trạng thái hoàn thành. App chỉ cần chỉ rõ các lỗi đó để người học biết và sửa dần.

### 6.3. Bản tiếng Việt dùng để dịch ngược

Vì output yêu cầu người học dịch ngược đúng bài báo gốc, bản tiếng Việt dùng trong app phải được biên soạn rất cẩn thận. Bản tiếng Việt này không được quá tự do, nhưng cũng không được dịch thô đến mức người Việt đọc vào không hiểu.

Nguyên tắc là: **dịch sát bài gốc nhưng vẫn đúng văn phong tiếng Việt**.

Bản tiếng Việt dùng để dịch ngược cần đạt các tiêu chí:

- sát nghĩa với câu tiếng Anh gốc;
- không thêm ý mới;
- không bỏ ý quan trọng;
- không phóng tác hoặc tóm tắt quá xa;
- giữ rõ quan hệ logic như nguyên nhân, kết quả, tương phản, mục đích;
- giữ đủ dấu vết của các đối tượng, cụm từ và cấu trúc trọng tâm để người học có thể dịch ngược về đúng câu gốc;
- vẫn là tiếng Việt tự nhiên, dễ hiểu, không phải bản dịch từng chữ cứng nhắc.

Một câu tiếng Anh gốc không bắt buộc lúc nào cũng phải tương ứng với đúng một câu tiếng Việt. Nếu câu tiếng Anh quá dài hoặc quá nặng với người mất gốc, bản tiếng Việt có thể được tách thành hai hoặc nhiều câu ngắn hơn, miễn là:

- việc tách câu không làm thay đổi ý nghĩa;
- không làm mất quan hệ logic giữa các phần;
- mỗi phần tách ra vẫn giữ đúng ý nghĩa của phần tương ứng trong câu gốc;
- khi ghép các phần tiếng Việt lại, người học vẫn có thể dịch ngược về đúng câu tiếng Anh ban đầu;
- app hiển thị rõ các phần tiếng Việt đó cùng thuộc về một câu tiếng Anh gốc.

Ví dụ, nếu câu gốc là:

> The school introduced a new policy to help students improve their English skills.

Bản tiếng Việt nên là:

> Nhà trường đã đưa ra một chính sách mới để giúp học sinh cải thiện kỹ năng tiếng Anh của mình.

Bản này sát với câu gốc, giữ được các mảnh quan trọng như `school`, `introduced`, `new policy`, `to help students`, `improve their English skills`, nhưng vẫn là tiếng Việt dễ hiểu.

Không nên viết quá tự do như:

> Nhà trường đã có một thay đổi nhằm hỗ trợ việc học tiếng Anh của học sinh.

Câu này đúng ý chung, nhưng làm mất quá nhiều dấu vết của bài gốc, khiến người học khó dịch ngược chính xác.

Không nên viết quá thô như:

> Trường đã giới thiệu một mới chính sách để giúp học sinh cải thiện của họ tiếng Anh kỹ năng.

Câu này giữ thứ tự tiếng Anh nhưng sai văn phong tiếng Việt, gây khó hiểu và làm người học học theo một bản tiếng Việt méo mó.

### 6.4. Tiêu chí hoàn thành đề xuất

Một bài báo được xem là hoàn thành khi người học đạt cả hai nhóm tiêu chí:

- 90% trở lên đối tượng/danh từ chính đạt mức thành thạo.
- 90% trở lên cụm từ quan trọng đạt mức thành thạo.
- 100% câu chính trong bài được đọc hiểu.
- 80% trở lên câu phức được phân tích đúng.
- Trả lời đúng 80% câu hỏi đọc hiểu.
- Tóm tắt bài đúng ý chính bằng tiếng Việt.
- Dịch ngược được 100% các câu/cụm trọng tâm từ tiếng Việt sang đúng tiếng Anh của bài báo gốc.
- Trong MVP, tất cả đoạn đều được dịch ngược đúng theo bài báo gốc về từ vựng, trật tự từ và cấu trúc; lỗi hình thức như viết hoa hoặc dấu câu không chặn hoàn thành nhưng phải được app chỉ ra.
- Nhập/dịch ngược toàn bài một lượt là chặng chinh phục nâng cao, không bắt buộc để hoàn thành MVP.
- Có thể đọc lại bài với số lần xem đáp án thấp hơn ngưỡng cho phép.

## 7. Cách cá nhân hóa giữa các bài báo

Ứng dụng cần có "hồ sơ kiến thức" cho mỗi người học.

Mỗi khi người học thành thạo một đơn vị, hệ thống lưu lại:

- từ/cụm/câu/mẫu ngữ pháp nào đã học;
- đã học trong bài nào;
- nghĩa nào đã học;
- IPA/phát âm đọc đúng đã đạt chưa;
- mức độ nhận biết;
- mức độ dùng lại được;
- lần cuối gặp trong dòng học;
- lần cuối làm đúng/làm sai;
- số lần sai;
- số lần đúng liên tiếp.

Khi người học chọn bài báo mới, hệ thống so sánh bản đồ kiến thức của bài mới với hồ sơ của người học.

Kết quả có thể là:

- bỏ qua đơn vị đã rất chắc;
- dùng lại đơn vị đã học nếu nó xuất hiện tự nhiên trong bài mới;
- dạy lại đơn vị từng sai nhiều;
- dạy nghĩa mới nếu từ cũ xuất hiện trong ngữ cảnh mới.

Như vậy, mỗi bài báo vẫn bắt đầu được từ con số 0, nhưng người học càng học nhiều thì lộ trình càng ngắn và thông minh.

## 8. Kiến trúc sản phẩm ở mức ý tưởng

### 8.1. Thư viện bài báo

Nơi người học chọn bài báo.

Mỗi bài cần có:

- chủ đề;
- độ khó;
- thời lượng ước tính;
- số đối tượng cần học;
- số cụm từ;
- số câu;
- điểm ngữ pháp chính;
- trạng thái: chưa học, đang học, đã thành thạo.

### 8.2. Bản đồ kiến thức của bài báo

Đây là phần quan trọng nhất.

Một bài báo cần được tách thành các đơn vị:

- `object`: đối tượng/danh từ;
- `attribute`: tính chất/thuộc tính;
- `phrase`: cụm từ;
- `relation`: mối quan hệ/hành động;
- `simple_sentence`: câu đơn;
- `expanded_sentence`: câu mở rộng;
- `complex_sentence`: câu phức;
- `grammar_pattern`: mẫu ngữ pháp;
- `paragraph_idea`: ý đoạn;
- `article_mastery`: thành thạo toàn bài.

Ngoài các đơn vị chính, có thể có nhóm `bridge_word`: từ mới chuyển tiếp. Đây là những từ chưa nên học rời ở đầu, nhưng cần giới thiệu ngay trước khi tạo cụm/câu, ví dụ động từ, tính từ, trạng từ, giới từ hoặc liên từ. `bridge_word` phải nhanh chóng được gắn vào một cụm/câu có đối tượng, không tồn tại như một flashcard rời lâu dài.

Mỗi `bridge_word` vẫn cần dữ liệu phát âm và bài nhập IPA:

- nghĩa/vai trò tiếng Việt trong cụm/câu sắp học;
- âm thanh mẫu;
- IPA;
- lượt nhập IPA: nghe âm + nhìn nghĩa/vai trò tiếng Việt -> nhập IPA;
- trạng thái IPA đã đạt hay chưa.

Mỗi đơn vị cần có quan hệ tiên quyết. Ví dụ:

- Muốn học `serious problem`, cần biết `problem`.
- Muốn học `students learn English`, cần biết `student`, `English`, và sau đó mới học `learn`.
- Muốn học câu phức có `because`, cần hiểu hai ý đơn giản trước.

### 8.3. Máy sắp xếp lộ trình

Máy này quyết định người học nên học gì tiếp theo.

Nguyên tắc:

1. Ưu tiên danh từ/đối tượng.
2. Chỉ đưa tính từ/trạng từ khi có đối tượng hoặc hành động để bổ nghĩa.
3. Chỉ đưa động từ khi có chủ thể và đối tượng/tình huống.
4. Nếu cần một từ mới để mở cụm/câu, giới thiệu nó như `bridge_word` rồi gắn ngay với đối tượng đã học.
5. Chỉ đưa câu khi các cụm chính đã sẵn sàng.
6. Chỉ đưa câu phức khi người học đã nắm câu đơn và câu mở rộng liên quan.
7. Luôn chọn đơn vị i+1: vừa khó hơn một chút, không nhảy quá xa.

### 8.4. Máy theo dõi trạng thái thành thạo

Máy này không hoạt động như một bài kiểm tra tách biệt. Nó theo dõi mọi lượt tương tác của người học để biết mỗi đơn vị kiến thức đang ở trạng thái nào và nên tiến hóa hay thoái hóa.

Nó không chỉ tính điểm đúng/sai. Nó cần biết người học đang mạnh/yếu ở đâu:

- nhớ nghĩa nhưng đọc sai âm;
- đọc hiểu được nhưng không viết/dịch ngược được;
- hiểu từ riêng nhưng không hiểu cụm;
- hiểu câu ngắn nhưng lạc trong câu dài;
- hiểu nội dung nhưng không tóm tắt được.

Khi người học đúng đủ nhiều lần và đúng trong đơn vị lớn hơn, đơn vị kiến thức sẽ tiến hóa lên trạng thái cao hơn. Khi người học sai, sai lặp lại hoặc sai sau khi đã từng đúng, đơn vị đó sẽ thoái hóa và được xử lý ngay bằng chính dạng nhập tự do của đơn vị đó.

Từ đó, hệ thống đưa lượt học sửa lỗi đúng điểm.

Thoái hóa nên dựa vào loại lỗi:

- sai hình thức như viết hoa hoặc dấu câu: chỉ nhắc, không cần quay lại bài cũ;
- sai nhẹ như thiếu mạo từ, sai số ít/số nhiều: hiện đáp án, chỉ lỗi, rồi cho nhập lại ngay cùng đơn vị;
- sai trật tự từ, sai cụm cố định, sai giới từ hoặc sai cấu trúc: hiện so sánh giữa câu người học nhập và câu đúng, rồi cho nhập lại ngay cùng đơn vị;
- sai nghĩa hoặc dùng sai từ chính: hiện lại nghĩa trong ngữ cảnh và đáp án đúng, rồi cho nhập lại ngay cùng đơn vị;
- sai lặp lại: đưa đơn vị về trạng thái "cần học lại", nhưng vẫn dùng dạng nhập tự do; app chỉ lặp lại đơn vị đó nhiều hơn trong dòng học.

Để theo dõi thông minh hơn, mỗi đơn vị kiến thức nên có bốn nhóm bằng chứng nội bộ:

- `recognition`: người học nhận ra đơn vị khi thấy tiếng Anh;
- `meaning`: người học hiểu nghĩa và vai trò của đơn vị trong ngữ cảnh bài báo;
- `production`: người học viết/dịch ngược được đơn vị từ tiếng Việt sang đúng tiếng Anh bài gốc;
- `natural_reuse`: người học dùng lại đúng đơn vị đó khi nó xuất hiện tự nhiên trong đơn vị lớn hơn hoặc bài mới.

Trong đó, `recognition` và `meaning` là phần input; `production` là phần output; `natural_reuse` chứng minh kiến thức không chỉ là trí nhớ ngắn hạn mà không cần chen bài cũ vào dòng học.

Một đơn vị được xem là đủ điểm khi input và output đạt theo luật của app. Sau đó đơn vị đó được dùng làm nền cho i+1. Nếu người học quên, họ sẽ sai khi đơn vị đó xuất hiện tự nhiên trong cụm/câu/đoạn mới; lúc đó app mới quay lại xử lý phần sai ngay.

### 8.5. Luật đủ điểm để qua

Luật tổng quát: **đúng một lượt hoàn chỉnh thì qua; sai thì sửa ngay đến khi đúng; sau đó app dùng đơn vị đó trong bước i+1 tiếp theo**.

Luật này giúp dòng học không bị đứng lại vì lặp quá nhiều, nhưng vẫn không cho người học đi tiếp khi còn sai ở lượt hiện tại.

Theo từng cấp:

1. **Từ đối tượng**: đủ điểm khi người học nhập đúng từ tiếng Anh từ nghĩa tiếng Việt, và nhập đúng IPA khi nghe âm + nhìn nghĩa tiếng Việt.
2. **Bridge word**: đủ điểm khi người học nhập đúng IPA, rồi dùng đúng bridge word đó trong cụm/câu ngay sau đó.
3. **Cụm ngắn**: đủ điểm khi người học nhìn bản tiếng Việt và nhập đúng cụm tiếng Anh.
4. **Cụm dài**: đủ điểm khi người học nhập đúng cụm hoàn chỉnh; cụm dài chỉ xuất hiện khi các mảnh chính đã đủ điểm.
5. **Câu**: đủ điểm khi người học nhập đúng câu tiếng Anh gốc từ bản tiếng Việt sư phạm, không chặn bởi lỗi hình thức như viết hoa hoặc dấu câu.
6. **Đoạn**: nên đi từ từng câu trong đoạn đến nhập toàn đoạn. Đoạn đủ điểm khi người học nhập đúng toàn đoạn một lượt.
7. **Toàn bài**: trong MVP, bài có thể hoàn thành khi tất cả đoạn đã đủ điểm. Chế độ nhập toàn bài một lượt có thể là chặng chinh phục nâng cao sau này.

Nếu một đơn vị sai, app không cho qua. App hiện đáp án, chỉ lỗi, cho nhập lại ngay. Khi đã đúng, app tiếp tục i+1.

### 8.6. Hệ thống sửa lỗi tức thì

Kiến thức đã học không được chen lại vào dòng học nếu người học đã đủ điểm và không có lỗi phát sinh.

Dòng học phải đi tới theo i+1. Khi một đơn vị đã qua, app dùng nó làm nền để tạo đơn vị lớn hơn. App chỉ quay lại đơn vị cũ khi người học sai trong lúc dùng nó.

Quy trình sửa lỗi:

1. Người học nhập sai.
2. App hiện đáp án đúng.
3. App chỉ rõ sai ở đâu.
4. Người học nhập lại ngay chính đơn vị đó.
5. Khi nhập đúng, dòng học tiếp tục sang đơn vị i+1 tiếp theo.

Nếu một lỗi lặp lại nhiều lần, app vẫn không chuyển sang dạng bài khác. App chỉ đánh dấu đơn vị đó là "cần học lại", giải thích lại ngắn gọn, rồi tiếp tục yêu cầu nhập tự do đến khi đúng.

## 9. Ví dụ minh họa một lộ trình nhỏ

Giả sử bài báo có câu:

> The school introduced a new policy to help students improve their English skills.

Người mất gốc không nên học câu này ngay. App có thể dẫn như sau:

1. Học đối tượng:
   - `school`
   - `policy`
   - `student`
   - `English`
   - `skill`

2. Học thuộc tính/cụm:
   - `new policy`
   - `English skills`

3. Học mối quan hệ:
   - `school introduced policy`
   - `help students`
   - `improve skills`

4. Học câu đơn gần đúng:
   - `The school introduced a policy.`
   - `The policy helps students.`
   - `Students improve English skills.`

5. Nhập các câu kết hợp:
   - `The school introduced a new policy.`
   - `The policy helps students improve English skills.`

6. Quay lại câu gốc:
   - `The school introduced a new policy to help students improve their English skills.`

Lúc này câu gốc không còn đáng sợ. Nó là kết quả của những mảnh người học đã nắm dần.

## 10. Trải nghiệm học tập mong muốn

Người học nên có cảm giác:

- lúc đầu bài báo rất khó;
- nhưng app tách nó thành những mảnh nhỏ;
- mỗi ngày mình nắm được vài mảnh;
- những mảnh đó ghép lại thành cụm;
- cụm ghép lại thành câu;
- câu ghép lại thành đoạn;
- cuối cùng mình đọc được bài báo thật.

Cảm giác phát triển này là lợi thế lớn của sản phẩm.

Ứng dụng nên tránh:

- đưa quá nhiều lý thuyết ngữ pháp sớm;
- bắt học toàn bộ từ trong bài ngay từ đầu;
- bắt nhập IPA tự do quá sớm;
- dạy từ vựng tách khỏi ngữ cảnh;
- cho qua bài chỉ vì người học đã bấm "tiếp tục";
- biến bài báo thành một bài dịch máy móc.

## 11. Kế hoạch xây dựng app

### Giai đoạn 1. Xây dựng phương pháp và mẫu học liệu

Mục tiêu:

- chọn 1 đến 3 bài báo mẫu;
- phân tích thủ công thật kỹ;
- tạo bản đồ đối tượng, cụm, câu, ngữ pháp;
- viết bài tập cho từng tầng;
- kiểm tra xem lộ trình có thật sự đi từ dễ đến khó không.

Kết quả cần có:

- một bài báo được biến thành khóa học hoàn chỉnh;
- tài liệu quy tắc biên soạn bài báo;
- tiêu chí thành thạo cho mỗi tầng.

### Giai đoạn 2. MVP cho một bài báo

Tính năng tối thiểu:

- màn hình chọn bài báo;
- màn hình mục tiêu bài báo;
- học đối tượng/danh từ;
- bài tập nghe âm + nhìn nghĩa tiếng Việt -> nhập IPA cho từ riêng lẻ;
- học cụm danh từ;
- học câu đơn;
- phân tích câu gốc;
- bài tập đọc hiểu;
- bài tập viết/dịch ngược từ tiếng Việt sang đúng tiếng Anh của bài báo gốc;
- thanh tiến độ;
- chặng chinh phục cuối trong dòng học gồm đọc hiểu và dịch ngược chính xác theo bài báo gốc.

Ở giai đoạn này chưa cần tự động hóa quá nhiều và chưa cần tập trung vào nghe/nói. Quan trọng là chứng minh phương pháp đọc - viết có đúng và người học có cảm giác tiến bộ.

### Giai đoạn 3. Đồng bộ kiến thức giữa các bài

Thêm:

- hồ sơ kiến thức người học;
- bỏ qua kiến thức đã thành thạo khi không cần dạy lại;
- nhật ký lỗi và trạng thái gặp lại tự nhiên;
- gợi ý bài báo phù hợp tiếp theo;
- báo cáo "bạn đã chinh phục được những gì".

### Giai đoạn 4. Công cụ biên soạn bài báo

Khi phương pháp đúng, cần có công cụ cho người biên soạn:

- nhập bài báo;
- đánh dấu đối tượng;
- đánh dấu cụm;
- đánh dấu câu khó;
- tạo phân tích câu;
- tạo bài tập;
- xác định tiên quyết;
- xuất thành khóa học.

### Giai đoạn 5. Tự động hóa bằng AI

Sau khi đã có quy tắc biên soạn rõ, có thể dùng AI để hỗ trợ:

- gợi ý danh từ/đối tượng;
- gợi ý cụm từ;
- gợi ý IPA và nghĩa theo ngữ cảnh;
- gợi ý bài tập;
- gợi ý phân tích câu;
- tạo câu hỏi đọc hiểu.

Nhưng AI không nên là nguồn duy nhất quyết định chất lượng. Bài báo trong hệ thống cần có cơ chế kiểm duyệt, vì người mất gốc rất dễ học sai nếu nội dung giải thích sai.

## 12. Những rủi ro cần tránh

### 12.1. Quá nặng IPA

IPA hữu ích, nhưng với người mất gốc, IPA có thể trở thành một hệ ký hiệu khó khác. Vì MVP ưu tiên nhập tự do, IPA nên được dùng gọn và rõ:

- ưu tiên áp dụng bài nhập IPA cho từ riêng lẻ, gồm danh từ/đối tượng và `bridge_word`;
- bài IPA chuẩn là: nghe âm + nhìn nghĩa tiếng Việt -> nhập IPA;
- với `bridge_word`, màn hình có thể hiện nghĩa/vai trò tiếng Việt thay vì chỉ nghĩa từ điển;
- giải thích IPA bằng tiếng Việt đời thường;
- nếu nhập sai, hiện IPA đúng và chỉ ra phần sai;
- cho nhập lại lượt IPA đó ngay;
- dùng IPA để đọc thầm/đọc đúng hơn;
- không bắt nhập IPA quá nặng với cụm dài, câu hoặc đoạn trong MVP.

### 12.2. Dạy danh từ quá máy móc

Danh từ là neo đầu tiên, nhưng không được biến thành danh sách flashcard khô. Mỗi danh từ phải gắn với bối cảnh của bài báo.

### 12.3. Quá chậm vào bài gốc

Nếu chia quá nhỏ mà lâu mới quay lại bài báo, người học có thể mất cảm giác mình đang chinh phục bài báo. Vì vậy, app nên thường xuyên cho thấy:

- từ này nằm trong câu nào;
- cụm này sẽ giúp mở khóa câu nào;
- câu này nằm trong đoạn nào;
- bạn đã mở khóa bao nhiêu phần trăm bài báo.

### 12.4. Tiêu chí thành thạo quá khắt khe

Vì app yêu cầu nhập tự do và làm lại đến khi đúng, rủi ro là người học có thể thấy bị chặn quá nhiều. Cách giảm áp lực không phải là chuyển sang chọn đáp án hay điền khuyết, mà là chia nhỏ đơn vị nhập và phản hồi lỗi thật rõ.

Trạng thái vẫn nên chia mức:

- nhận biết;
- hiểu;
- gợi nhớ;
- sử dụng;
- thành thạo.

Người học có thể chưa thành thạo ngay, nhưng mỗi lượt nhập sai phải giúp họ biết sai ở đâu và vì sao. Sau đó app cho nhập lại ngay đúng đơn vị đó cho đến khi đúng.

### 12.5. Dịch ngược chính xác gây áp lực nếu đơn vị nhập quá lớn

Yêu cầu dịch ngược giống bài báo gốc là đúng với mục tiêu sản phẩm, vì nó giúp người học không phải viết tiếng Anh tự do quá rộng. Tuy nhiên, nếu bắt người mất gốc nhập cả câu dài hoặc cả đoạn quá sớm, họ sẽ dễ bị bí.

Vì vậy, dịch ngược chính xác vẫn dùng nhập tự do, nhưng phải chia theo kích thước đơn vị:

- nhập từ;
- nhập cụm ngắn;
- nhập cụm dài;
- nhập câu ngắn;
- nhập câu dài;
- nhập đoạn;
- dịch ngược toàn bài.

Như vậy, tiêu chí cuối cùng vẫn là giống bài báo gốc, nhưng con đường đi tới đó không tạo áp lực quá lớn và không làm rối trải nghiệm bằng quá nhiều dạng bài.

### 12.6. Nhập nhằng giữa "hiểu bài báo" và "giỏi tiếng Anh"

Sản phẩm phải nói rõ: hoàn thành một bài báo không có nghĩa là đã giỏi tiếng Anh toàn diện. Nhưng nó là một chiến thắng thật, có thể tích lũy thành năng lực thật qua nhiều bài.

## 13. Nguyên tắc nội dung

Mỗi đơn vị học nên viết theo giọng:

- rõ ràng;
- đời thường;
- không quá học thuật;
- ưu tiên tiếng Việt để người mất gốc hiểu;
- sau đó mới thêm tiếng Anh đơn giản;
- luôn gắn với bài báo gốc;
- bản tiếng Việt phải sát bài gốc nhưng vẫn đúng văn phong tiếng Việt.

Mẫu giải thích tốt:

> `policy` là một "chính sách/quy định/kế hoạch hành động". Trong bài này, từ này nói về cách một trường học đưa ra quy định mới để giúp học sinh. Bạn chưa cần học mọi nghĩa của `policy`; hiện tại chỉ cần nhớ: đây là một kế hoạch/quy định do một tổ chức đưa ra.

Mẫu giải thích cần tránh:

> policy: noun, a course or principle of action adopted or proposed by an organization or individual.

Mẫu thứ hai đúng về mặt từ điển, nhưng quá khó với người mất gốc.

## 14. Cấu trúc một lượt học đề xuất

Mỗi lượt học nhỏ trong dòng chảy nên có công thức:

1. Giới thiệu đơn vị học.
2. Giải thích bằng tiếng Việt đời thường.
3. Gắn với tình huống trong bài báo.
4. Cho nhìn ví dụ và nghe mẫu nếu có.
5. Yêu cầu người học nhập tự do đúng từ/cụm/câu của bài báo gốc.
6. Nếu đúng, lưu bằng chứng tiến hóa.
7. Nếu sai, hiện đáp án đúng và chỉ rõ phần sai.
8. Cho người học nhập lại ngay đúng lượt đó cho đến khi nhập đúng.
9. Lưu trạng thái.
10. Quay lại bài báo để thấy mình vừa mở khóa được gì.

## 15. Hướng phát triển xa hơn

Sau khi hệ thống chạy tốt với bài báo tiếng Anh, có thể mở rộng sang:

- bài đọc theo chủ đề;
- tin tức ngắn;
- bài học nghe có transcript;
- luyện nói lại nội dung bài;
- bài phát biểu;
- email công việc;
- tài liệu học thuật đơn giản;
- tiếng Anh chuyên ngành.

Nhưng cốt lõi vẫn giữ nguyên:

**Người học chinh phục một văn bản cụ thể, từng tầng một, từ đối tượng đến toàn bài.**

## 16. Tài liệu tham khảo nên dùng khi tiếp tục thiết kế

Các nguồn này không phải là "công thức sản phẩm" trực tiếp, nhưng là nền tảng để giải thích vì sao phương pháp nên chia nhỏ, yêu cầu người học chủ động gợi nhớ, sửa lỗi đúng điểm và chỉ tăng độ khó từng chút:

- Roediger & Karpicke, 2006, về retrieval practice/test-enhanced learning: https://pubmed.ncbi.nlm.nih.gov/16507066/
- Cepeda và cộng sự, 2006, về distributed/spaced practice: https://pubmed.ncbi.nlm.nih.gov/16719566/
- Cognitive Load Theory và instructional design: https://link.springer.com/article/10.1007/s11251-009-9110-0
- Mastery learning tổng quan thực hành: https://pmc.ncbi.nlm.nih.gov/articles/PMC10159400/
- Hu & Nation, 2000, về mật độ từ vựng chưa biết và đọc hiểu: https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2000-Hu-Density-and-comprehension.pdf

## 17. Kịch bản học mẫu đã chốt

Để kiểm tra ý tưởng trên một văn bản cụ thể, đã tạo một kịch bản học mẫu cho một đoạn văn trình độ B2:

- File: `docs/superpowers/specs/2026-06-04-b2-sample-learning-script.md`
- Chủ đề: đời sống đô thị và một dự án môi trường nhỏ.
- Mục tiêu: người học đi từ đối tượng/danh từ, sang `bridge_word`, cụm, câu, đoạn nhỏ và hoàn thành đoạn văn theo đúng luật nhập tự do, sai thì sửa ngay.
- Phạm vi: đây là mẫu học liệu để kiểm tra dòng học, luật chấm, cách chia đơn vị, cách dùng IPA và cách phản hồi lỗi trước khi xây app thật.
