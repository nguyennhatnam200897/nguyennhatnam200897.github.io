# Thiết kế dữ liệu course cho i+1 theo cụm nghĩa

Ngày tạo: 2026-06-12

## Trạng thái

Tài liệu này thiết kế dạng dữ liệu cần có để triển khai hướng i+1 theo cụm
nghĩa trong course thử nghiệm Gentle i+1. Đây là bước nối giữa kịch bản học mẫu
và triển khai code thật.

Tài liệu này chưa thay đổi code, chưa sửa course hiện tại, và chưa thay đổi
luồng học của người dùng. Mục tiêu là chốt hợp đồng dữ liệu trước để khi triển
khai, app có thể đọc được các cụm nghĩa, vai trò cụm, đường i+1 bên trong cụm,
các lượt ghép cụm, và quan hệ repair khi người học sai.

## Mục tiêu

Dữ liệu mới phải biểu diễn được những điều sau:

- mỗi câu được học như một dòng ý gồm nhiều cụm nghĩa;
- mỗi cụm có `Khi nào cần?` và `Mục đích là gì?`;
- mỗi cụm có đường i+1 riêng để người học đi từ mảnh nhỏ tới cụm hoàn chỉnh;
- sau khi cụm được sở hữu, app có thể ghép các cụm thành ý dài hơn;
- khi người học sai trong ý dài, app biết lỗi thuộc cụm nào để repair đúng chỗ;
- toàn bộ vẫn dùng một dạng bài: tiếng Việt -> người học tự viết hoặc tự nói tiếng Anh độc lập.

## Phạm vi

Áp dụng trước cho course thử nghiệm:

```text
small-public-garden-gentle-i1
```

Không sửa trực tiếp các course hiện tại. Course gốc `small-public-garden` giữ
vai trò đối chứng.

## Nguyên tắc dữ liệu

1. Cụm là đơn vị của ý, không phải mảnh chữ cắt máy móc.
2. Dữ liệu phải tách rõ hai tầng:
   - i+1 bên trong từng cụm;
   - i+1 khi ghép các cụm thành ý dài hơn.
3. Dữ liệu hướng dẫn người học phải dùng tiếng Việt có dấu.
4. Các khóa kỹ thuật dùng tiếng Anh ổn định để code dễ đọc.
5. Đáp án cuối vẫn bám sát câu tiếng Anh gốc.
6. Không thêm dạng bài mới qua dữ liệu. Mọi `prompt` vẫn dẫn tới một `answer` độc lập.

## Cấu trúc đề xuất ở cấp course

Course thử nghiệm nên có thêm `meaningChunkProfile` và `meaningChunkLessons`.

Ví dụ cấp cao:

```json
{
  "id": "small-public-garden-gentle-i1",
  "practiceProfile": "meaning-chunk-i-plus-one",
  "meaningChunkProfile": {
    "version": 1,
    "scriptSpec": "docs/superpowers/specs/2026-06-12-sentence-1-meaning-chunk-learning-script.md",
    "masteryRule": {
      "minCorrect": 2,
      "requiresInterleavedCorrect": true,
      "requiresUseInLongerMeaning": true
    }
  },
  "meaningChunkLessons": []
}
```

Ý nghĩa:

- `practiceProfile`: báo cho app biết course này dùng hướng cụm nghĩa.
- `meaningChunkProfile.version`: phiên bản dữ liệu để sau này nâng cấp không phá course cũ.
- `scriptSpec`: đường dẫn tài liệu thiết kế liên quan, chỉ để truy vết.
- `masteryRule`: quy tắc sở hữu cụm đã chốt.
- `meaningChunkLessons`: danh sách kịch bản học theo từng câu hoặc cụm câu.

## Cấu trúc một lesson theo câu

Mỗi câu nên có một object riêng trong `meaningChunkLessons`.

```json
{
  "id": "S1-meaning-chunks",
  "sentenceId": "S1",
  "source": {
    "english": "Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.",
    "vietnamese": "Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất."
  },
  "overview": {},
  "chunks": [],
  "compositionTasks": [],
  "repairRules": []
}
```

Ý nghĩa:

- `id`: định danh kịch bản cụm nghĩa của câu.
- `sentenceId`: liên kết về câu gốc trong course.
- `source`: câu đích tiếng Anh và tiếng Việt.
- `overview`: màn định hướng trước khi học.
- `chunks`: các cụm nghĩa cần sở hữu.
- `compositionTasks`: các lượt ghép cụm thành ý dài hơn.
- `repairRules`: luật đưa lỗi trong câu dài về cụm hỏng.

## Overview của câu

`overview` mô tả pha 0: giúp người học biết mình sắp xây ý gì, chưa chấm điểm.

```json
{
  "overview": {
    "title": "Mình sẽ xây câu này từ các cụm nghĩa",
    "summary": [
      "Câu này có 2 ý.",
      "Ý 1: Nhiều thành phố đang cố làm đời sống hằng ngày bền vững hơn.",
      "Ý 2: Nhưng những thay đổi hiệu quả nhất thường lại ít gây ấn tượng mạnh nhất.",
      "Mình sẽ học từng cụm nghĩa, hiểu cụm đó dùng để làm gì, rồi ghép lại thành câu."
    ],
    "graded": false
  }
}
```

Nguyên tắc:

- `overview` không sinh bài chấm điểm.
- Nội dung phải ngắn, dễ hiểu, không biến thành bài giảng dài.

## Cấu trúc một cụm nghĩa

Mỗi cụm trong `chunks` là một đơn vị ý có vai trò.

```json
{
  "id": "S1-C01",
  "english": "many cities",
  "vietnamese": "nhiều thành phố",
  "chunkType": "entity",
  "roleQuestion": "Ai? / Cái gì?",
  "whenNeeded": "Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.",
  "roleMeaning": "Cụm này cho biết ai hoặc cái gì đang được nói tới.",
  "iPlusOneSteps": [],
  "mastery": {
    "minCorrect": 2,
    "requiresInterleavedCorrect": true,
    "requiresUseInLongerMeaning": true
  },
  "compositionTargets": ["S1-M01", "S1-M03"],
  "repairTags": ["many-cities", "plural-city"]
}
```

Ý nghĩa:

- `id`: định danh cụm.
- `english`: cụm tiếng Anh cần sở hữu.
- `vietnamese`: nghĩa tiếng Việt của cụm.
- `chunkType`: loại cụm nội bộ.
- `roleQuestion`: câu hỏi tóm gọn mục đích.
- `whenNeeded`: giải thích lúc nào cần cụm này.
- `roleMeaning`: giải thích ngắn về vai trò cụm trong dòng ý.
- `iPlusOneSteps`: các bước học bên trong cụm.
- `mastery`: quy tắc sở hữu cụm.
- `compositionTargets`: những lượt ghép mà cụm này tham gia.
- `repairTags`: nhãn để app nhận diện lỗi thuộc cụm.

## Loại cụm nội bộ

Đề xuất bộ `chunkType` ban đầu:

```text
entity          Ai? / Cái gì?
action-frame    Đang làm gì? / Đang cố làm gì?
action-object   Tác động vào cái gì?
result          Kết quả gì?
claim-subject   Cái gì đang được nhận định?
claim-link      Thường là gì? / Là gì?
description     Có đặc điểm gì?
linker          Quan hệ giữa hai ý là gì?
```

Bộ này chỉ là dữ liệu nội bộ. UI có thể không cần hiển thị `chunkType`. Người
học chỉ nhìn thấy `roleQuestion`, `whenNeeded`, và ví dụ cụ thể tại task cuối
của cụm hoàn chỉnh.

## Đường i+1 bên trong cụm

`iPlusOneSteps` biểu diễn các lượt học riêng bên trong một cụm.

Ví dụ `many cities`:

```json
{
  "id": "S1-C01",
  "english": "many cities",
  "vietnamese": "nhiều thành phố",
  "chunkType": "entity",
  "roleQuestion": "Ai? / Cái gì?",
  "whenNeeded": "Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.",
  "roleMeaning": "Cụm này cho biết ai hoặc cái gì đang được nói tới.",
  "iPlusOneSteps": [
    {
      "id": "S1-C01-STEP01",
      "prompt": "thành phố",
      "answer": "city",
      "purpose": "Tạo mỏ neo nghĩa."
    },
    {
      "id": "S1-C01-STEP02",
      "prompt": "các thành phố",
      "answer": "cities",
      "purpose": "Thêm lớp số nhiều."
    },
    {
      "id": "S1-C01-STEP03",
      "prompt": "nhiều thành phố",
      "answer": "many cities",
      "purpose": "Thêm lớp số lượng và hoàn chỉnh cụm."
    }
  ]
}
```

Nguyên tắc:

- Mỗi step vẫn là một bài viết/nói độc lập.
- `purpose` là lời giải thích cho hệ thống hoặc màn hướng dẫn, không phải đáp án.
- Step cuối của cụm thường trùng với `english` của cụm.

## Cấu trúc lượt ghép cụm

`compositionTasks` biểu diễn tầng i+1 giữa các cụm.

Ví dụ ghép vế 1:

```json
{
  "id": "S1-M03",
  "type": "composition",
  "prompt": "nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn",
  "answer": "many cities are trying to make daily life more sustainable",
  "roleLine": [
    {
      "roleQuestion": "Ai?",
      "chunkId": "S1-C01",
      "english": "many cities"
    },
    {
      "roleQuestion": "Đang cố làm gì?",
      "chunkId": "S1-C02",
      "english": "are trying to"
    },
    {
      "roleQuestion": "Tác động vào cái gì?",
      "chunkId": "S1-C03",
      "english": "make daily life"
    },
    {
      "roleQuestion": "Kết quả gì?",
      "chunkId": "S1-C04",
      "english": "more sustainable"
    }
  ],
  "usesChunks": ["S1-C01", "S1-C02", "S1-C03", "S1-C04"],
  "masteryCredit": ["S1-C01", "S1-C02", "S1-C03", "S1-C04"],
  "successMessage": "Bạn đã viết được một ý hoàn chỉnh: Ai đang cố làm gì, tác động vào cái gì, để đạt kết quả gì."
}
```

Ý nghĩa:

- `prompt`: tiếng Việt người học nhìn thấy.
- `answer`: đáp án tiếng Anh cần viết/nói.
- `roleLine`: dòng vai trò app có thể hiển thị trước lượt ghép.
- `usesChunks`: các cụm được dùng trong lượt ghép.
- `masteryCredit`: các cụm được củng cố nếu người học làm đúng lượt ghép.
- `successMessage`: ghi nhận sau khi đúng.

## Cấu trúc repair

`repairRules` mô tả cách đưa lỗi trong câu dài về cụm hỏng.

Ví dụ lỗi `many city`:

```json
{
  "id": "S1-R01",
  "appliesTo": ["S1-M03", "S1-FINAL"],
  "repairTag": "plural-city",
  "chunkId": "S1-C01",
  "detect": {
    "expected": "many cities",
    "commonWrongAnswers": ["many city"]
  },
  "repairPrompt": "nhiều thành phố",
  "repairAnswer": "many cities",
  "message": "Cụm cần sửa: nhiều thành phố."
}
```

Nguyên tắc:

- Repair luôn quay về một prompt viết/nói độc lập.
- Repair không đổi sang điền khuyết hoặc chọn đáp án.
- Sau khi repair đúng, app quay lại task dài đang học.
- Một lỗi có thể có nhiều `repairTag`; khi đó app ưu tiên cụm cụ thể nhất.

## Ví dụ dữ liệu rút gọn cho câu 1

Phần này không phải dữ liệu đầy đủ, mà là mẫu để thấy hình dạng cuối.

```json
{
  "id": "S1-meaning-chunks",
  "sentenceId": "S1",
  "chunks": [
    {
      "id": "S1-C01",
      "english": "many cities",
      "vietnamese": "nhiều thành phố",
      "chunkType": "entity",
      "roleQuestion": "Ai? / Cái gì?",
      "whenNeeded": "Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.",
      "iPlusOneSteps": [
        { "id": "S1-C01-STEP01", "prompt": "thành phố", "answer": "city" },
        { "id": "S1-C01-STEP02", "prompt": "các thành phố", "answer": "cities" },
        { "id": "S1-C01-STEP03", "prompt": "nhiều thành phố", "answer": "many cities" }
      ]
    },
    {
      "id": "S1-C02",
      "english": "are trying to",
      "vietnamese": "đang cố gắng làm",
      "chunkType": "action-frame",
      "roleQuestion": "Đang cố làm gì?",
      "whenNeeded": "Khi muốn nói ai đó đang cố gắng làm một việc, nhưng việc đó chưa chắc đã xong.",
      "iPlusOneSteps": [
        { "id": "S1-C02-STEP01", "prompt": "cố gắng", "answer": "try" },
        { "id": "S1-C02-STEP02", "prompt": "đang cố gắng", "answer": "are trying" },
        { "id": "S1-C02-STEP03", "prompt": "đang cố gắng làm", "answer": "are trying to" }
      ]
    }
  ],
  "compositionTasks": [
    {
      "id": "S1-M01",
      "prompt": "nhiều thành phố đang cố gắng làm",
      "answer": "many cities are trying to",
      "usesChunks": ["S1-C01", "S1-C02"]
    }
  ]
}
```

## Cách sinh task học từ dữ liệu

Khi triển khai, app hoặc loader có thể sinh ra các task theo thứ tự:

1. Hiển thị `overview` của câu.
2. Với từng cụm:
   - luyện các `iPlusOneSteps` theo đúng thứ tự;
   - mỗi bước nhỏ đúng một lần thì mở bước tiếp theo trong cùng cụm;
   - nếu bước nhỏ sai, làm lại chính bước đó và không mất các bước trước;
   - chỉ task cuối của cụm hiển thị `whenNeeded`, `roleQuestion`,
     `roleMeaning`;
   - yêu cầu task cuối đúng 2 lần liên tiếp;
   - nếu task cuối sai trước khi đủ 2 lần, đặt lại chuỗi xác nhận về `0`;
   - đánh dấu cụm đã vững rồi mới chuyển sang cụm tiếp theo.
3. Mở `compositionTasks` khi các cụm cần thiết đã vững.
4. Nếu composition đúng, dùng `masteryCredit` để ghi nhận lần củng cố cho các
   cụm bên trong; không dùng lượt này để thay thế điều kiện thành thạo cụm.
5. Nếu composition sai, dùng `repairRules` để đưa người học về cụm hỏng.
6. Sau repair đúng, quay lại composition hoặc final task.

Không xen kẽ hai cụm trong giai đoạn luyện riêng. Quy tắc chi tiết được chốt tại
`2026-06-12-sequential-meaning-chunk-mastery-design.md`.

## Dữ liệu không nên làm

Không nên dùng dữ liệu mới để tạo các dạng bài sau:

- chọn đáp án;
- điền vào chỗ trống;
- kéo thả cụm;
- tự động chấm phát âm;
- gợi ý từng từ trực tiếp trong ô trả lời.

Nếu UI cần hiển thị dòng vai trò, dòng đó chỉ là hướng dẫn trước hoặc sau bài
tập. Lượt nộp bài vẫn phải là một đáp án tiếng Anh độc lập.

## Tương thích với dữ liệu hiện tại

Dữ liệu hiện tại đang có `taskGroups` với các prompt/answer tuyến tính. Hướng
mới không cần phá bỏ dữ liệu đó ngay.

Triển khai nên đi theo hướng an toàn:

- course thường tiếp tục dùng `taskGroups`;
- course thử nghiệm Gentle i+1 có thể thêm `meaningChunkLessons`;
- loader ưu tiên `meaningChunkLessons` chỉ khi `practiceProfile` là `meaning-chunk-i-plus-one`;
- nếu course không có `meaningChunkLessons`, app giữ hành vi cũ.

## Tiêu chí duyệt spec dữ liệu

Spec dữ liệu này được xem là đúng hướng nếu nó cho phép biểu diễn:

- câu đầu bài 1 theo đúng kịch bản mẫu;
- mỗi cụm có `Khi nào cần?` và `Mục đích là gì?`;
- đường i+1 riêng bên trong từng cụm;
- lượt ghép cụm thành ý dài hơn;
- repair từ lỗi trong câu dài về cụm hỏng;
- không thêm dạng bài khác ngoài viết/nói độc lập.

## Bước tiếp theo sau spec này

Sau khi spec dữ liệu được duyệt, bước tiếp theo mới là lập kế hoạch triển khai:

- thêm schema dữ liệu cho `meaningChunkLessons`;
- cập nhật course thử nghiệm Gentle i+1 với dữ liệu câu 1;
- cập nhật loader/scheduler để sinh luồng học từ dữ liệu mới;
- cập nhật UI hướng dẫn để chỉ hiện `Khi nào cần?`, `Mục đích là gì?`, và dòng
  vai trò tại task cụm hoàn chỉnh;
- thêm kiểm thử để course cũ không đổi hành vi.
