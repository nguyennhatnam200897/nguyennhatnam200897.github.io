# Kịch bản học mẫu cho một đoạn văn B2

Ngày tạo: 2026-06-04

## Giáo án hiện hành

Chuỗi nhiệm vụ i+1 đã được xây lại đầy đủ ngày 2026-06-08 tại:

`docs/superpowers/specs/2026-06-08-b2-i-plus-one-curriculum.md`

File mới là giáo án hiện hành và khớp trực tiếp với dữ liệu webapp trong `js/article.mjs`. Các phần cũ phía dưới được giữ làm lịch sử phát triển ý tưởng; nếu có điểm khác nhau, ưu tiên file giáo án ngày 2026-06-08.

## Cập nhật MVP tối giản ngày 2026-06-05

Theo quyết định mới nhất, kịch bản mẫu cho bản webapp hiện tại **không còn dùng bài tập IPA**. Những mục cũ nói về nghe âm, nhập IPA hoặc bridge word mở bằng IPA được giữ như lịch sử thảo luận/gợi ý cho giai đoạn sau, nhưng không áp dụng cho MVP tối giản.

Luồng học hiện tại bắt đầu thẳng từ bài nhập tiếng Anh: người học nhìn nghĩa tiếng Việt của từ đối tượng, cụm, câu hoặc đoạn rồi nhập lại đúng tiếng Anh của bài gốc. IPA/phát âm có thể quay lại sau khi phần đọc và viết đã ổn định.

## Cập nhật phân tầng từ vựng ngày 2026-06-08

Tầng đầu chỉ học **danh từ/đối tượng** được viết liền thành một từ tiếng Anh và có nghĩa độc lập trong ngữ cảnh. `neighborhood` vẫn là từ đơn vì được viết liền, là danh từ và hoạt động như một đối tượng độc lập.

Động từ, tính từ, trạng từ và từ nối không được học riêng ở tầng đầu. Ví dụ `try`, `empty`, `public` và `however` chỉ được đưa vào khi chuẩn bị tạo cụm hoặc câu có chứa chúng.

Các đơn vị nhiều từ như `daily life`, `parking lot`, `office worker`, `plastic bag`, `recycling bin`, `environmental problem`, `shared space` và `daily habit` phải được chuyển sang tầng từ ghép/cụm từ. Từ đơn làm neo phải xuất hiện trước, chẳng hạn `life` -> `daily life`.

Danh từ trong bài phải đi từ dạng gốc số ít đến dạng số nhiều, không được mở đầu bằng dạng số nhiều. Ví dụ trong câu đầu, lộ trình đúng là `city` -> `cities` -> `many cities`, không phải học thẳng `cities` hoặc `many cities`. Với dạng bất quy tắc cũng phải tách bước, ví dụ `child` -> `children`.

Lượt số nhiều hiển thị nghĩa tiếng Việt và yêu cầu nhập dạng tiếng Anh:

1. `thành phố` -> `city`
2. `các thành phố` -> `cities`
3. `nhiều thành phố` -> `many cities`

Nếu ở bước 2 người học nhập `city`, app xem đây là lỗi nội dung, hiện `cities` và bắt nhập lại ngay.

Không phải mọi từ ghép/cụm đều phải tách thành tất cả từ thành phần. Chỉ thành phần có nghĩa độc lập và còn giữ nghĩa liên quan trong cụm mới cần được học riêng.

Ví dụ với `parking lot`, lộ trình có thể là:

1. `bãi/khu đất` -> `lot`
2. `bãi đỗ xe` -> `parking lot`

Không tạo bài riêng cho `parking` nếu việc học nó độc lập không giúp người học hiểu đối tượng `parking lot` trong bài. Nguyên tắc là tách để xây nghĩa theo i+1, không tách chỉ vì cụm có nhiều từ.

Với `plastic bag`, lộ trình đúng là:

1. `túi` -> `bag`
2. `túi nhựa` -> `plastic bag`

`plastic` không thuộc tầng đối tượng ban đầu. Nó được giới thiệu ở bước mở rộng như thuộc tính/chất liệu của `bag`, rồi người học nhập cả cụm hoàn chỉnh.

Quy tắc mở rộng cụm danh từ được áp dụng tương tự cho toàn bộ bài:

- `council` -> `local council` -> `the local council`
- `garden` -> `public garden` -> `a public garden` -> `a small public garden`
- `project` -> `local project` -> `a local project` -> `a simple local project`
- `shop` -> `shops` -> `nearby shops`

Thứ tự mặc định là danh từ gốc trước, sau đó thêm thuộc tính, rồi mới thêm mạo từ, từ hạn định hoặc số lượng. Mỗi lượt chỉ thêm một lớp mới theo i+1 và cuối cùng phải đi tới đúng cụm được dùng trong bài gốc.

Khi có nhiều thành phần bổ nghĩa, thứ tự học dựa trên cách xây nghĩa tự nhiên, không bắt buộc đi từ trái sang phải theo mặt chữ. Ví dụ:

1. `garden` -> khu vườn
2. `public garden` -> khu vườn công cộng
3. `small public garden` -> khu vườn công cộng nhỏ
4. `a small public garden` -> một khu vườn công cộng nhỏ

Ở lượt cuối, người học vẫn phải nhập đúng trật tự tiếng Anh trong bài gốc.

Trước khi tạo câu quan hệ cơ bản của câu 2, người học phải hoàn thành ba cụm tối thiểu:

1. `council` -> `local council` -> `the local council`
2. `lot` -> `parking lot` -> `a parking lot`
3. `garden` -> `a garden`

Sau đó app tạo khung câu cơ bản:

`the local council turned a parking lot into a garden`

Không tạo bước cụt `the local council turned`. Câu cơ bản phải có đủ chủ thể, đối tượng nguồn và đối tượng kết quả để `turned ... into ...` mang nghĩa hoàn chỉnh.

Sau khi có khung câu cơ bản, app mở rộng từng vị trí:

1. Học riêng `parking lot` -> `empty parking lot` -> `an empty parking lot`.
2. Thay vào khung: `the local council turned an empty parking lot into a garden`.
3. Học riêng `garden` -> `public garden` -> `small public garden` -> `a small public garden`.
4. Thay vào khung: `the local council turned an empty parking lot into a small public garden`.

Cụm mở rộng phải đủ điểm trước khi được đưa vào câu. Mỗi lượt mở rộng câu chỉ thay một vị trí đã biết, giúp người học quan sát trực tiếp câu đơn giản phát triển thành câu chi tiết hơn.

Toàn bộ đoạn văn được học lần lượt theo từng câu. App không yêu cầu người học học hết danh từ của cả bảy câu trước khi bắt đầu ghép câu.

Với mỗi câu:

1. Mở các danh từ/đối tượng mới.
2. Xây từng cụm danh từ cần thiết theo i+1.
3. Tạo câu cơ bản có nghĩa đầy đủ.
4. Mở rộng từng vị trí bằng các cụm đã đủ điểm.
5. Tái tạo đúng câu gốc.
6. Chuyển sang câu tiếp theo.

Đơn vị đã thành thạo ở câu trước được dùng lại trực tiếp ở câu sau, không tạo bài học lặp lại. Chỉ khi người học dùng sai, app mới cho sửa và làm lại phần sai ngay.

Với câu phức, app được phép tách thành các mệnh đề có ý nghĩa tương đối độc lập. Mỗi mệnh đề được hoàn thiện riêng theo i+1, sau đó mới ghép bằng từ nối của câu gốc.

Ví dụ câu 1 có thể chia thành:

1. `Many cities are trying to make daily life more sustainable.`
2. `The most effective changes are often the least dramatic.`
3. Ghép quan hệ đối lập bằng `but`:
   `Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.`

Không tách một cụm phụ thuộc thành bài riêng nếu phần đó không còn giữ được ý nghĩa đúng khi đứng độc lập. Tiêu chí tách là ý nghĩa và cấu trúc mệnh đề, không phải độ dài hay dấu câu.

Mệnh đề quan hệ được xây từ mệnh đề lõi:

1. `trẻ em` -> `child`
2. `những đứa trẻ/trẻ em` -> `children`
3. `trẻ em chơi` -> `children play`
4. `trẻ em có thể chơi` -> `children could play`
5. `nơi trẻ em có thể chơi` -> `where children could play`
6. `một nơi yên tĩnh nơi trẻ em có thể chơi` -> `a quiet place where children could play`

`where` chỉ được thêm sau khi `children could play` đã là một mệnh đề lõi có nghĩa và đã đủ điểm.

Ba nhánh song song trong câu 4 được học riêng:

1. `children could play`
2. `older people could meet`
3. `office workers could rest during lunch breaks`

Sau đó ghép theo i+1:

1. `children could play, older people could meet`
2. `children could play, older people could meet, and office workers could rest during lunch breaks`
3. `where children could play, older people could meet, and office workers could rest during lunch breaks`

Mỗi nhánh phải đủ điểm trước khi được đưa vào chuỗi. `and` được thêm khi ghép nhánh cuối theo đúng cấu trúc của câu gốc.

Trạng ngữ thời gian của nhánh thứ ba được xây riêng:

1. `giờ nghỉ` -> `break`
2. `các giờ nghỉ` -> `breaks`
3. `giờ nghỉ trưa` -> `lunch breaks`
4. `trong giờ nghỉ trưa` -> `during lunch breaks`
5. `nhân viên văn phòng có thể nghỉ ngơi` -> `office workers could rest`
6. `nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa` -> `office workers could rest during lunch breaks`

`during lunch breaks` phải đủ điểm trước khi được gắn vào mệnh đề hành động.

Cụm so sánh số lượng được xây theo thứ tự:

1. `túi` -> `bag`
2. `các túi` -> `bags`
3. `túi nhựa` -> `plastic bags`
4. `ít túi nhựa hơn` -> `fewer plastic bags`

Tương tự:

- `city` -> `cities` -> `many cities`
- `resident` -> `residents` -> `some residents`
- `problem` -> `environmental problem` -> `every environmental problem`

Danh từ và dạng số của nó luôn được hoàn thiện trước khi thêm từ chỉ lượng.

Hai hành động dùng chung chủ thể `shops` được học riêng:

1. `các cửa hàng sử dụng ít túi nhựa hơn` -> `shops use fewer plastic bags`
2. `các cửa hàng đặt các thùng tái chế bên ngoài cửa hàng của họ` -> `shops place recycling bins outside their doors`

Sau đó ghép theo i+1:

1. `shops use fewer plastic bags and shops place recycling bins outside their doors`
2. `shops use fewer plastic bags and place recycling bins outside their doors`

Lượt thứ hai dạy phép lược chủ thể `shops` ở nhánh sau. Người học không phải tự suy ra điều này khi chưa được xây qua dạng đầy đủ.

Sau khi hành động của `shops` đã hoàn thiện:

`nearby shops use fewer plastic bags and place recycling bins outside their doors`

app mới ghép vào khung có chủ thể chính:

`the project encouraged nearby shops to use fewer plastic bags and place recycling bins outside their doors`

Không tạo bài `encouraged nearby shops to use...` vì thiếu chủ thể của `encouraged`. Lượt ghép phải giúp người học hiểu đầy đủ: dự án khuyến khích các cửa hàng thực hiện hai hành động.

Câu có `that` được xây từ hai mệnh đề hoàn chỉnh:

1. `the project would reduce parking spaces and attract noise`
2. `some residents complained`
3. `some residents complained that the project would reduce parking spaces and attract noise`

Mệnh đề sau `that` được học trước vì nó là nội dung cụ thể của lời phàn nàn. `that` chỉ được thêm khi cả mệnh đề báo cáo và mệnh đề nội dung đã đủ điểm.

Mệnh đề nội dung được xây từ hai nhánh chung chủ thể và modal:

1. `the project would reduce parking spaces`
2. `the project would attract noise`
3. `the project would reduce parking spaces and the project would attract noise`
4. `the project would reduce parking spaces and attract noise`

Lượt cuối lược phần lặp `the project would` ở nhánh thứ hai. Sau khi mệnh đề này đủ điểm, nó mới được ghép vào `some residents complained that...`.

Mệnh đề nội dung với `how` được xây như sau:

1. `mọi người nghĩ về không gian chung` -> `people thought about shared space`
2. `cách mọi người nghĩ về không gian chung` -> `how people thought about shared space`
3. `nó đã thay đổi cách mọi người nghĩ về không gian chung` -> `it changed how people thought about shared space`

`how` tạo nội dung chỉ cách thức, không phải câu hỏi trực tiếp; vì vậy không đảo trật tự chủ ngữ và động từ.

Câu có `although` được xây từ hai mệnh đề hoàn chỉnh:

1. `the garden did not solve every environmental problem`
2. `it changed how people thought about shared space`
3. `Although the garden did not solve every environmental problem, it changed how people thought about shared space.`

`although` được thêm ở lượt ghép để thể hiện quan hệ nhượng bộ. Không thêm `but` vào mệnh đề chính vì câu gốc không dùng `although ... but ...`.

Mệnh đề với `when` được xây từ trong ra ngoài:

1. `sự thay đổi đó thuộc về họ` -> `the change belongs to them`
2. `mọi người cảm thấy rằng sự thay đổi đó thuộc về họ` -> `people feel that the change belongs to them`
3. `khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ` -> `when people feel that the change belongs to them`
4. `một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ` -> `a simple local project can influence daily habits when people feel that the change belongs to them`

Khối `when` phải đủ điểm trước khi được gắn vào mệnh đề chính.

Sau khi các câu đã hoàn thành, đoạn văn được ghép từng bước:

1. `S1 + S2`
2. `S1 + S2 + S3`
3. `S1 + S2 + S3 + S4`
4. Tiếp tục thêm từng câu theo thứ tự bài gốc cho đến hết đoạn.

Mỗi lượt chỉ thêm một câu đã thành thạo. App không chuyển trực tiếp từ câu cuối sang yêu cầu nhập toàn đoạn.

Mỗi lượt trung gian dùng một bản tiếng Việt sư phạm tự nhiên nhưng bám sát lớp nghĩa vừa được thêm:

1. `khu vườn` -> `garden`
2. `khu vườn công cộng` -> `public garden`
3. `khu vườn công cộng nhỏ` -> `small public garden`
4. `một khu vườn công cộng nhỏ` -> `a small public garden`

Hai lời nhắc liên tiếp chỉ nên khác nhau chủ yếu ở thành phần mới. Bản tiếng Việt không dịch cứng từng chữ, không thêm ý ngoài bài và phải dẫn được người học tới đúng tiếng Anh của văn bản gốc.

Nếu người học nhập một cách diễn đạt khác vẫn đúng tiếng Anh và đúng nghĩa, app phản hồi theo hướng:

> Cách viết của bạn hợp nghĩa, nhưng bài gốc dùng: `...`

Sau đó người học phải nhập lại đúng dạng của bài báo mới đủ điểm. App không gọi một cách diễn đạt hợp lệ là “sai tiếng Anh”; nó chỉ xác định rằng đáp án đó chưa khớp mục tiêu văn bản.

Lỗi hình thức như viết hoa và dấu câu không chặn qua. Khác từ vựng, cấu trúc hoặc trật tự từ của bài gốc thì phải làm lại.

Động từ được dùng trực tiếp ở dạng quá khứ của bài gốc:

`đã biến ... thành ...` -> `turned ... into ...`

Không thêm lượt `turn ... into ...` trước `turned ... into ...`, trừ khi dạng nguyên mẫu đó thực sự xuất hiện và cần được dùng ở một đơn vị khác trong chính bài báo.

i+1 áp dụng cho mọi thành phần của câu, kể cả trạng ngữ địa điểm:

1. `khu dân cư` -> `neighborhood`
2. `một khu dân cư` -> `one neighborhood`
3. `ở một khu dân cư` -> `in one neighborhood`
4. `hội đồng địa phương đã biến một bãi đỗ xe thành một khu vườn` -> `the local council turned a parking lot into a garden`
5. `hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn` -> `the local council turned an empty parking lot into a garden`
6. `hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ` -> `the local council turned an empty parking lot into a small public garden`
7. `Ở một khu dân cư, hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ.` -> `In one neighborhood, the local council turned an empty parking lot into a small public garden.`

Mỗi lượt chỉ thêm một lớp nghĩa hoặc chức năng. Một cấu trúc nhiều từ nhưng không thể tách mà vẫn giữ đúng nghĩa, như `turned ... into ...`, được xem là một đơn vị i+1 hoàn chỉnh.

Việc mở rộng `parking lot` bằng `empty` phải tách riêng:

1. `bãi đỗ xe` -> `parking lot`
2. `bãi đỗ xe trống` -> `empty parking lot`
3. `một bãi đỗ xe trống` -> `an empty parking lot`

Không dùng `a parking lot` -> `an empty parking lot` trong một lượt, vì bước đó đồng thời thêm thuộc tính `empty` và đổi mạo từ `a` thành `an`.

## 1. Mục tiêu của kịch bản

Tài liệu này xây dựng một kịch bản học mẫu theo phương pháp đã chốt cho app học tiếng Anh:

- người học bắt đầu từ đối tượng/danh từ;
- từ chuyển tiếp (`bridge_word`) chỉ xuất hiện khi chuẩn bị tạo cụm/câu;
- từ riêng lẻ và `bridge_word` đều có bài nghe âm + nhìn nghĩa/vai trò tiếng Việt -> nhập IPA;
- bài tập chính là nhập tự do;
- sai thì hiện đáp án, chỉ lỗi, nhập lại ngay đến khi đúng;
- qua là qua, không chủ động chen bài cũ nếu không có lỗi;
- dòng học đi theo i+1: từ -> cụm -> câu -> đoạn -> bài;
- hoàn thành MVP khi người học đọc hiểu và dịch ngược đúng từng đoạn.

Đây là một mẫu học liệu để kiểm tra xem phương pháp có vận hành được với một đoạn văn trình độ B2 hay không.

## 2. Đoạn văn B2 gốc

**Topic:** Urban life and small environmental projects

**Level target:** B2

**Original passage:**

> Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic. In one neighborhood, the local council turned an empty parking lot into a small public garden. At first, some residents complained that the project would reduce parking spaces and attract noise. However, within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks. The project also encouraged nearby shops to use fewer plastic bags and to place recycling bins outside their doors. Although the garden did not solve every environmental problem, it changed how people thought about shared space. It showed that a simple local project can influence daily habits when people feel that the change belongs to them.

## 3. Bản tiếng Việt sư phạm

Bản tiếng Việt dưới đây dịch sát bài gốc nhưng vẫn giữ văn phong tiếng Việt tự nhiên. Nó được dùng làm đầu vào để người học dịch ngược về đúng tiếng Anh của bài gốc.

| ID | English sentence | Vietnamese pedagogical version |
| --- | --- | --- |
| S1 | Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic. | Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất. |
| S2 | In one neighborhood, the local council turned an empty parking lot into a small public garden. | Ở một khu dân cư, hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ. |
| S3 | At first, some residents complained that the project would reduce parking spaces and attract noise. | Ban đầu, một số cư dân phàn nàn rằng dự án này sẽ làm giảm chỗ đỗ xe và thu hút tiếng ồn. |
| S4 | However, within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks. | Tuy nhiên, chỉ trong vài tháng, khu vườn đã trở thành một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa. |
| S5 | The project also encouraged nearby shops to use fewer plastic bags and to place recycling bins outside their doors. | Dự án này cũng khuyến khích các cửa hàng gần đó sử dụng ít túi nhựa hơn và đặt các thùng tái chế bên ngoài cửa hàng của họ. |
| S6 | Although the garden did not solve every environmental problem, it changed how people thought about shared space. | Mặc dù khu vườn không giải quyết mọi vấn đề môi trường, nó đã thay đổi cách mọi người nghĩ về không gian chung. |
| S7 | It showed that a simple local project can influence daily habits when people feel that the change belongs to them. | Nó cho thấy rằng một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ. |

## 4. Mục tiêu hoàn thành đoạn văn

Người học được xem là hoàn thành đoạn văn này trong MVP khi:

1. Đọc hiểu được toàn bộ đoạn tiếng Anh.
2. Với từng từ đối tượng, làm lượt IPA trước: nhìn từ tiếng Anh, nhìn nghĩa tiếng Việt, nghe âm thanh tự động và nhập đúng IPA.
3. Sau khi IPA đúng, nhập đúng từ đối tượng chính từ nghĩa tiếng Việt.
4. Với `bridge_word`, nhìn từ tiếng Anh, nhìn nghĩa/vai trò tiếng Việt, nghe âm thanh tự động và nhập đúng IPA trước khi dùng từ đó trong cụm/câu.
5. Nhập đúng các cụm trọng tâm.
6. Nhập đúng từng câu từ bản tiếng Việt sư phạm.
7. Nhập đúng toàn đoạn theo từng câu hoặc từng cụm câu đã chia.
8. Lỗi viết hoa, dấu câu, dấu phẩy, dấu nháy không chặn hoàn thành, nhưng app phải chỉ ra.

Trong MVP, không bắt buộc người học nhập toàn bộ đoạn văn một lượt duy nhất. Nếu tất cả câu/đoạn nhỏ đã đủ điểm, đoạn được xem là hoàn thành. Nhập toàn đoạn một lượt có thể là chặng nâng cao.

## 5. Bản đồ đối tượng

Tầng từ riêng lẻ chỉ lấy đối tượng/danh từ làm neo nghĩa. Không học mọi từ trong bài ngay từ đầu.

Trong mỗi đối tượng, lượt IPA đi trước lượt nhập tiếng Anh. Màn hình IPA hiển thị từ tiếng Anh, nghĩa tiếng Việt và tự phát âm thanh mẫu; người học nhập IPA bằng bàn phím thường hoặc bàn phím IPA của app. Khi IPA đúng, app mới chuyển sang lượt nhìn nghĩa tiếng Việt và nhập từ tiếng Anh.

| ID | Object word | IPA | Nghĩa tiếng Việt | Vai trò trong đoạn |
| --- | --- | --- | --- | --- |
| O1 | city | /ˈsɪti/ | thành phố | nơi các thay đổi bền vững đang diễn ra |
| O2 | daily life | /ˌdeɪli ˈlaɪf/ | đời sống hằng ngày | thứ các thành phố muốn làm bền vững hơn |
| O3 | change | /tʃeɪndʒ/ | sự thay đổi | điều có thể hiệu quả dù không quá ấn tượng |
| O4 | neighborhood | /ˈneɪbərhʊd/ | khu dân cư | nơi dự án khu vườn diễn ra |
| O5 | council | /ˈkaʊnsəl/ | hội đồng | cơ quan địa phương thực hiện thay đổi |
| O6 | parking lot | /ˈpɑːrkɪŋ lɑːt/ | bãi đỗ xe | nơi được biến thành khu vườn |
| O7 | garden | /ˈɡɑːrdən/ | khu vườn | dự án trung tâm của đoạn |
| O8 | resident | /ˈrezɪdənt/ | cư dân | người ban đầu phản đối dự án |
| O9 | project | /ˈprɑːdʒekt/ | dự án | việc biến bãi đỗ xe thành khu vườn |
| O10 | parking space | /ˈpɑːrkɪŋ speɪs/ | chỗ đỗ xe | thứ cư dân lo sẽ bị giảm |
| O11 | noise | /nɔɪz/ | tiếng ồn | thứ cư dân lo sẽ bị thu hút |
| O12 | child | /tʃaɪld/ | trẻ em | nhóm dùng khu vườn để chơi |
| O13 | office worker | /ˈɑːfɪs ˈwɜːrkər/ | nhân viên văn phòng | nhóm dùng khu vườn để nghỉ trưa |
| O14 | shop | /ʃɑːp/ | cửa hàng | nơi thay đổi thói quen dùng đồ nhựa |
| O15 | plastic bag | /ˈplæstɪk bæɡ/ | túi nhựa | thứ các cửa hàng dùng ít hơn |
| O16 | recycling bin | /riːˈsaɪklɪŋ bɪn/ | thùng tái chế | thứ các cửa hàng đặt bên ngoài |
| O17 | environmental problem | /ɪnˌvaɪrənˈmentəl ˈprɑːbləm/ | vấn đề môi trường | thứ khu vườn không giải quyết hết |
| O18 | shared space | /ʃerd speɪs/ | không gian chung | cách con người nghĩ về nơi dùng chung |
| O19 | daily habit | /ˌdeɪli ˈhæbɪt/ | thói quen hằng ngày | thứ dự án có thể ảnh hưởng |

## 6. Bridge words

`bridge_word` không học rời lâu dài như đối tượng. Nó xuất hiện ngay trước khi tạo cụm/câu và phải được gắn vào đối tượng đã học. Tuy nhiên, mỗi bridge word vẫn có bài IPA.

| ID | Bridge word | IPA | Nghĩa/vai trò tiếng Việt | Dùng trong |
| --- | --- | --- | --- | --- |
| B1 | try | /traɪ/ | cố gắng làm gì | `cities are trying to make...` |
| B2 | sustainable | /səˈsteɪnəbəl/ | bền vững | `more sustainable` |
| B3 | effective | /ɪˈfektɪv/ | hiệu quả | `effective changes` |
| B4 | dramatic | /drəˈmætɪk/ | gây ấn tượng mạnh, lớn lao | `least dramatic` |
| B5 | turn into | /tɜːrn ˈɪntuː/ | biến thành | `turned an empty parking lot into...` |
| B6 | empty | /ˈempti/ | trống | `empty parking lot` |
| B7 | public | /ˈpʌblɪk/ | công cộng | `public garden` |
| B8 | complain | /kəmˈpleɪn/ | phàn nàn | `residents complained` |
| B9 | reduce | /rɪˈduːs/ | làm giảm | `reduce parking spaces` |
| B10 | attract | /əˈtrækt/ | thu hút | `attract noise` |
| B11 | however | /haʊˈevər/ | tuy nhiên | mở đầu câu tương phản |
| B12 | within | /wɪˈðɪn/ | trong vòng | `within a few months` |
| B13 | encourage | /ɪnˈkɜːrɪdʒ/ | khuyến khích | `encouraged nearby shops` |
| B14 | nearby | /ˌnɪrˈbaɪ/ | gần đó | `nearby shops` |
| B15 | fewer | /ˈfjuːər/ | ít hơn | `fewer plastic bags` |
| B16 | place | /pleɪs/ | đặt | `place recycling bins` |
| B17 | outside | /ˌaʊtˈsaɪd/ | bên ngoài | `outside their doors` |
| B18 | although | /ɔːlˈðoʊ/ | mặc dù | mở đầu mệnh đề tương phản |
| B19 | solve | /sɑːlv/ | giải quyết | `solve every environmental problem` |
| B20 | influence | /ˈɪnfluəns/ | ảnh hưởng | `influence daily habits` |
| B21 | belong to | /bɪˈlɔːŋ tə/ | thuộc về | `belongs to them` |

## 7. Lượt học từ riêng lẻ

Mỗi đối tượng có hai lượt nhập bắt buộc:

1. **Nghĩa tiếng Việt -> nhập tiếng Anh**
2. **Nghe âm + nghĩa tiếng Việt -> nhập IPA**

Ví dụ lượt học cho `garden`:

| Lượt | Màn hình hiển thị | Người học nhập | Đáp án |
| --- | --- | --- | --- |
| O7-A | "khu vườn" | từ tiếng Anh | `garden` |
| O7-B | nghe /ˈɡɑːrdən/ + "khu vườn" | IPA | `/ˈɡɑːrdən/` |

Nếu người học nhập `gardern`, app phản hồi:

- Đáp án đúng: `garden`
- Sai ở phần: `gardern` có thừa `r` trước `n`
- Nhập lại ngay: "khu vườn" -> `garden`

Nếu người học nhập IPA `/ˈgɑːdən/`, app phản hồi:

- Đáp án đúng: `/ˈɡɑːrdən/`
- Sai ở phần: thiếu âm /r/ trong âm tiết đầu theo mẫu đang học
- Nhập lại ngay IPA

## 8. Lượt học bridge word

Bridge word có hai bước:

1. Nghe âm + nghĩa/vai trò tiếng Việt -> nhập IPA.
2. Dùng bridge word đó trong cụm/câu ngay sau đó.

Ví dụ với `turn into`:

| Lượt | Màn hình hiển thị | Người học nhập | Đáp án |
| --- | --- | --- | --- |
| B5-A | nghe /tɜːrn ˈɪntuː/ + "biến thành" | IPA | `/tɜːrn ˈɪntuː/` |
| P7 | "biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ" | cụm/câu tiếng Anh | `turned an empty parking lot into a small public garden` |

Bridge word không nằm lại như flashcard độc lập. Nó nhanh chóng đi vào cụm/câu.

## 9. Cụm trọng tâm

Các cụm dưới đây là đơn vị nhập tự do trước khi lên câu đầy đủ.

| ID | Vietnamese prompt | Expected English |
| --- | --- | --- |
| P1 | nhiều thành phố | `many cities` |
| P2 | đời sống hằng ngày | `daily life` |
| P3 | bền vững hơn | `more sustainable` |
| P4 | những thay đổi hiệu quả nhất | `the most effective changes` |
| P5 | những thay đổi ít gây ấn tượng mạnh nhất | `the least dramatic` |
| P6 | hội đồng địa phương | `the local council` |
| P7 | một bãi đỗ xe trống | `an empty parking lot` |
| P8 | một khu vườn công cộng nhỏ | `a small public garden` |
| P9 | một số cư dân | `some residents` |
| P10 | dự án này | `the project` |
| P11 | làm giảm chỗ đỗ xe | `reduce parking spaces` |
| P12 | thu hút tiếng ồn | `attract noise` |
| P13 | trong vài tháng | `within a few months` |
| P14 | một nơi yên tĩnh | `a quiet place` |
| P15 | nhân viên văn phòng | `office workers` |
| P16 | trong giờ nghỉ trưa | `during lunch breaks` |
| P17 | các cửa hàng gần đó | `nearby shops` |
| P18 | ít túi nhựa hơn | `fewer plastic bags` |
| P19 | các thùng tái chế | `recycling bins` |
| P20 | bên ngoài cửa hàng của họ | `outside their doors` |
| P21 | mọi vấn đề môi trường | `every environmental problem` |
| P22 | không gian chung | `shared space` |
| P23 | một dự án địa phương đơn giản | `a simple local project` |
| P24 | thói quen hằng ngày | `daily habits` |
| P25 | sự thay đổi đó thuộc về họ | `the change belongs to them` |

Luật qua: nhập đúng một lượt hoàn chỉnh thì qua. Sai thì hiện đáp án, chỉ lỗi, nhập lại ngay.

## 10. Kịch bản câu

Mỗi câu đi theo quy tắc:

1. Mở các đối tượng cần thiết.
2. Mở bridge word cần thiết bằng IPA.
3. Nhập các cụm trọng tâm.
4. Nhập câu hoàn chỉnh từ bản tiếng Việt sư phạm.
5. Nếu sai, hiện đáp án, chỉ lỗi, nhập lại ngay.
6. Khi đúng, chuyển sang câu tiếp theo.

### S1

**Vietnamese prompt:**

> Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất.

**Expected English:**

> Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.

**Prerequisite objects:**

- `city`
- `daily life`
- `change`

**Bridge words:**

- `try`
- `sustainable`
- `effective`
- `dramatic`

**Phrase path:**

1. `many cities`
2. `daily life`
3. `more sustainable`
4. `the most effective changes`
5. `the least dramatic`
6. full S1

**Possible error feedback:**

- Learner: `Many cities try to make daily life more sustainable...`
- App: thiếu cấu trúc đang học `are trying to`; đáp án là `Many cities are trying to...`
- Learner nhập lại ngay S1.

### S2

**Vietnamese prompt:**

> Ở một khu dân cư, hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ.

**Expected English:**

> In one neighborhood, the local council turned an empty parking lot into a small public garden.

**Prerequisite objects:**

- `neighborhood`
- `council`
- `parking lot`
- `garden`

**Bridge words:**

- `turn into`
- `empty`
- `public`

**Phrase path:**

1. `one neighborhood`
2. `the local council`
3. `an empty parking lot`
4. `a small public garden`
5. `turned an empty parking lot into a small public garden`
6. full S2

**Possible error feedback:**

- Learner: `the local council turned an empty parking lot to a small public garden`
- App: sai giới từ trong cụm `turn into`; đáp án là `turned ... into ...`
- Learner nhập lại ngay S2 hoặc phần cụm sai theo thiết kế màn hình.

### S3

**Vietnamese prompt:**

> Ban đầu, một số cư dân phàn nàn rằng dự án này sẽ làm giảm chỗ đỗ xe và thu hút tiếng ồn.

**Expected English:**

> At first, some residents complained that the project would reduce parking spaces and attract noise.

**Prerequisite objects:**

- `resident`
- `project`
- `parking space`
- `noise`

**Bridge words:**

- `complain`
- `reduce`
- `attract`

**Phrase path:**

1. `at first`
2. `some residents`
3. `the project`
4. `reduce parking spaces`
5. `attract noise`
6. full S3

**Possible error feedback:**

- Learner: `some residents complained the project would reduce...`
- App: thiếu `that` trong câu gốc. Đáp án cần `complained that the project...`
- Learner nhập lại ngay.

### S4

**Vietnamese prompt:**

> Tuy nhiên, chỉ trong vài tháng, khu vườn đã trở thành một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa.

**Expected English:**

> However, within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks.

**Prerequisite objects:**

- `garden`
- `child`
- `office worker`

**Bridge words:**

- `however`
- `within`
- `quiet`
- `become`
- `could`
- `rest`
- `during`

**Phrase path:**

1. `within a few months`
2. `a quiet place`
3. `children could play`
4. `older people could meet`
5. `office workers could rest`
6. `during lunch breaks`
7. full S4

**Possible error feedback:**

- Learner: `the garden became a quiet place which children could play`
- App: câu gốc dùng `where`, vì đang nói về một nơi. Đáp án: `a quiet place where children could play`
- Learner nhập lại ngay.

### S5

**Vietnamese prompt:**

> Dự án này cũng khuyến khích các cửa hàng gần đó sử dụng ít túi nhựa hơn và đặt các thùng tái chế bên ngoài cửa hàng của họ.

**Expected English:**

> The project also encouraged nearby shops to use fewer plastic bags and to place recycling bins outside their doors.

**Prerequisite objects:**

- `project`
- `shop`
- `plastic bag`
- `recycling bin`

**Bridge words:**

- `encourage`
- `nearby`
- `fewer`
- `place`
- `outside`

**Phrase path:**

1. `nearby shops`
2. `fewer plastic bags`
3. `recycling bins`
4. `outside their doors`
5. `encouraged nearby shops`
6. `to use fewer plastic bags`
7. `to place recycling bins outside their doors`
8. full S5

**Possible error feedback:**

- Learner: `use less plastic bags`
- App: với danh từ đếm được số nhiều `bags`, câu gốc dùng `fewer`, không dùng `less`. Đáp án: `fewer plastic bags`
- Learner nhập lại ngay.

### S6

**Vietnamese prompt:**

> Mặc dù khu vườn không giải quyết mọi vấn đề môi trường, nó đã thay đổi cách mọi người nghĩ về không gian chung.

**Expected English:**

> Although the garden did not solve every environmental problem, it changed how people thought about shared space.

**Prerequisite objects:**

- `garden`
- `environmental problem`
- `shared space`

**Bridge words:**

- `although`
- `solve`
- `change`
- `thought about`

**Phrase path:**

1. `every environmental problem`
2. `shared space`
3. `did not solve every environmental problem`
4. `changed how people thought about shared space`
5. full S6

**Possible error feedback:**

- Learner: `Although the garden did not solved...`
- App: sau `did not`, động từ trở về dạng nguyên thể. Đáp án: `did not solve`
- Learner nhập lại ngay.

### S7

**Vietnamese prompt:**

> Nó cho thấy rằng một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ.

**Expected English:**

> It showed that a simple local project can influence daily habits when people feel that the change belongs to them.

**Prerequisite objects:**

- `project`
- `daily habit`
- `change`

**Bridge words:**

- `show`
- `simple`
- `local`
- `influence`
- `feel`
- `belong to`

**Phrase path:**

1. `a simple local project`
2. `daily habits`
3. `can influence daily habits`
4. `people feel`
5. `the change belongs to them`
6. full S7

**Possible error feedback:**

- Learner: `the change belong to them`
- App: chủ ngữ `the change` là số ít, cần `belongs`. Đáp án: `the change belongs to them`
- Learner nhập lại ngay.

## 11. Kịch bản đoạn

Sau khi từng câu đủ điểm, app cho nhập đoạn theo từng cụm câu.

### Đoạn nhỏ 1: S1-S2

**Vietnamese prompt:**

> Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất. Ở một khu dân cư, hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ.

**Expected English:**

> Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic. In one neighborhood, the local council turned an empty parking lot into a small public garden.

### Đoạn nhỏ 2: S3-S4

**Vietnamese prompt:**

> Ban đầu, một số cư dân phàn nàn rằng dự án này sẽ làm giảm chỗ đỗ xe và thu hút tiếng ồn. Tuy nhiên, chỉ trong vài tháng, khu vườn đã trở thành một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa.

**Expected English:**

> At first, some residents complained that the project would reduce parking spaces and attract noise. However, within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks.

### Đoạn nhỏ 3: S5-S7

**Vietnamese prompt:**

> Dự án này cũng khuyến khích các cửa hàng gần đó sử dụng ít túi nhựa hơn và đặt các thùng tái chế bên ngoài cửa hàng của họ. Mặc dù khu vườn không giải quyết mọi vấn đề môi trường, nó đã thay đổi cách mọi người nghĩ về không gian chung. Nó cho thấy rằng một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ.

**Expected English:**

> The project also encouraged nearby shops to use fewer plastic bags and to place recycling bins outside their doors. Although the garden did not solve every environmental problem, it changed how people thought about shared space. It showed that a simple local project can influence daily habits when people feel that the change belongs to them.

## 12. Chặng chinh phục nâng cao

Sau khi ba đoạn nhỏ đủ điểm, app có thể mở chế độ nâng cao:

**Prompt:** toàn bộ bản tiếng Việt sư phạm.

**Expected output:** toàn bộ đoạn văn tiếng Anh gốc.

Chặng này không bắt buộc cho MVP. Nó dành cho người học muốn có cảm giác "tôi đã chinh phục toàn bài một lượt".

## 13. Luật chấm trong kịch bản này

### Chặn hoàn thành

Các lỗi sau chặn qua lượt:

- sai từ chính;
- thiếu từ trong bài gốc;
- thừa từ làm sai câu gốc;
- sai trật tự từ;
- sai mạo từ `a`, `an`, `the`;
- sai số ít/số nhiều;
- sai thì hoặc dạng động từ;
- sai giới từ;
- sai cụm cố định;
- sai IPA ở bài IPA.

### Không chặn hoàn thành nhưng phải chỉ ra

Các lỗi sau không chặn nếu nội dung, từ vựng và cấu trúc đã đúng:

- viết hoa;
- dấu chấm;
- dấu phẩy;
- dấu nháy;
- khoảng trắng thừa;
- thiếu dấu câu không làm đổi cấu trúc.

## 14. Ví dụ sửa lỗi chi tiết

### Ví dụ 1: sai bridge word

Prompt:

> Ở một khu dân cư, hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ.

Learner:

> In one neighborhood, the local council changed an empty parking lot into a small public garden.

Expected:

> In one neighborhood, the local council turned an empty parking lot into a small public garden.

Feedback:

- Ý chung gần đúng, nhưng bài gốc dùng `turned ... into ...`, không dùng `changed ... into ...`.
- Lỗi chặn qua vì output phải tái tạo đúng bài gốc.
- Nhập lại ngay câu này.

### Ví dụ 2: sai mạo từ

Learner:

> In one neighborhood, local council turned an empty parking lot into a small public garden.

Expected:

> In one neighborhood, the local council turned an empty parking lot into a small public garden.

Feedback:

- Thiếu `the` trước `local council`.
- Đây là lỗi chặn qua vì câu gốc có `the local council`.
- Nhập lại ngay câu này.

### Ví dụ 3: lỗi hình thức

Learner:

> many cities are trying to make daily life more sustainable but the most effective changes are often the least dramatic

Expected:

> Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.

Feedback:

- Nội dung và cấu trúc đúng.
- Cần chú ý viết hoa `Many`, dấu phẩy trước `but`, và dấu chấm cuối câu.
- Lỗi hình thức không chặn qua.

## 15. Tóm tắt dòng học

Một dòng học mẫu cho S2:

1. Object: "khu dân cư" -> nhập `neighborhood`
2. IPA: nghe /ˈneɪbərhʊd/ + "khu dân cư" -> nhập `/ˈneɪbərhʊd/`
3. Object: "hội đồng" -> nhập `council`
4. IPA: nghe /ˈkaʊnsəl/ + "hội đồng" -> nhập `/ˈkaʊnsəl/`
5. Object: "bãi đỗ xe" -> nhập `parking lot`
6. IPA: nghe /ˈpɑːrkɪŋ lɑːt/ + "bãi đỗ xe" -> nhập `/ˈpɑːrkɪŋ lɑːt/`
7. Object: "khu vườn" -> nhập `garden`
8. IPA: nghe /ˈɡɑːrdən/ + "khu vườn" -> nhập `/ˈɡɑːrdən/`
9. Bridge IPA: nghe /tɜːrn ˈɪntuː/ + "biến thành" -> nhập `/tɜːrn ˈɪntuː/`
10. Bridge IPA: nghe /ˈempti/ + "trống" -> nhập `/ˈempti/`
11. Bridge IPA: nghe /ˈpʌblɪk/ + "công cộng" -> nhập `/ˈpʌblɪk/`
12. Phrase: "một bãi đỗ xe trống" -> nhập `an empty parking lot`
13. Phrase: "một khu vườn công cộng nhỏ" -> nhập `a small public garden`
14. Phrase: "biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ" -> nhập `turned an empty parking lot into a small public garden`
15. Sentence: nhập toàn bộ S2
16. Khi đúng, chuyển sang S3

Đây là kiểu dòng học nên được dùng làm mẫu cho các câu còn lại.
