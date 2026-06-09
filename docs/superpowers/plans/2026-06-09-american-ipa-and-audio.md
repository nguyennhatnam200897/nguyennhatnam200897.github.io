# American IPA And Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị IPA Anh-Mỹ đơn giản cho mọi từ mới trong màn hướng dẫn và
chuyển toàn bộ âm thanh của khóa học sang giọng Mỹ.

**Architecture:** Tạo `js/pronunciation.mjs` làm nguồn dữ liệu phát âm duy nhất
cho 115 dạng từ xuất hiện trong bài. `guidance.mjs` theo dõi các dạng từ đã được
giới thiệu để xác định từ mới và tạo IPA toàn đơn vị; `app.mjs` chỉ chịu trách
nhiệm hiển thị dữ liệu đã tạo. Âm thanh tĩnh được tái tạo bằng giọng
`Microsoft Zira Desktop` (`en-US`), còn Web Speech API dùng `en-US` làm dự
phòng.

**Tech Stack:** HTML, CSS, JavaScript modules, Node test runner, PowerShell
`System.Speech`, Web Speech API.

**Repository note:** Thư mục hiện tại không có metadata Git, vì vậy các bước
commit được thay bằng checkpoint chạy test và kiểm tra file.

---

### Task 1: Nguồn dữ liệu IPA Anh-Mỹ

**Files:**
- Create: `js/pronunciation.mjs`
- Modify: `tests/learning.test.mjs`

- [ ] **Step 1: Viết test thất bại cho độ phủ IPA**

Thêm các kiểm tra:

```js
import {
  buildPronunciation,
  getAmericanIpa,
} from "../js/pronunciation.mjs";

test("provides simple American IPA for every word form in the article", () => {
  const missing = [
    ...new Set(
      tasks.flatMap(
        (task) => task.answer.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []
      )
    ),
  ].filter((word) => !getAmericanIpa(word));

  assert.deepEqual(missing, []);
  assert.equal(getAmericanIpa("city"), "/ˈsɪti/");
  assert.equal(getAmericanIpa("go"), null);
});

test("builds full IPA and identifies only newly introduced word forms", () => {
  assert.deepEqual(buildPronunciation("daily life", new Set(["life"])), {
    full: "/ˈdeɪli laɪf/",
    newWords: [{ term: "daily", ipa: "/ˈdeɪli/" }],
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```powershell
node --test .\tests\learning.test.mjs
```

Expected: FAIL vì `js/pronunciation.mjs` chưa tồn tại.

- [ ] **Step 3: Tạo module phát âm**

Module xuất:

```js
export const AMERICAN_IPA = {
  city: "/ˈsɪti/",
  cities: "/ˈsɪtiz/",
  many: "/ˈmɛni/",
  life: "/laɪf/",
  daily: "/ˈdeɪli/",
  make: "/meɪk/",
  sustainable: "/səˈsteɪnəbəl/",
  more: "/mɔr/",
  are: "/ɑr/",
  trying: "/ˈtraɪɪŋ/",
  to: "/tu/",
  change: "/tʃeɪndʒ/",
  changes: "/ˈtʃeɪndʒɪz/",
  effective: "/ɪˈfɛktɪv/",
  the: "/ðə/",
  most: "/moʊst/",
  dramatic: "/drəˈmætɪk/",
  least: "/list/",
  often: "/ˈɔfən/",
  but: "/bʌt/",
  neighborhood: "/ˈneɪbərhʊd/",
  one: "/wʌn/",
  in: "/ɪn/",
  council: "/ˈkaʊnsəl/",
  local: "/ˈloʊkəl/",
  lot: "/lɑt/",
  parking: "/ˈpɑrkɪŋ/",
  a: "/ə/",
  garden: "/ˈɡɑrdən/",
  turned: "/tɝnd/",
  into: "/ˈɪntu/",
  empty: "/ˈɛmpti/",
  an: "/ən/",
  public: "/ˈpʌblɪk/",
  small: "/smɔl/",
  resident: "/ˈrɛzɪdənt/",
  residents: "/ˈrɛzɪdənts/",
  some: "/sʌm/",
  project: "/ˈprɑdʒɛkt/",
  space: "/speɪs/",
  spaces: "/ˈspeɪsɪz/",
  noise: "/nɔɪz/",
  would: "/wʊd/",
  reduce: "/rɪˈdus/",
  attract: "/əˈtrækt/",
  and: "/ænd/",
  complained: "/kəmˈpleɪnd/",
  that: "/ðæt/",
  at: "/æt/",
  first: "/fɝst/",
  month: "/mʌnθ/",
  months: "/mʌnθs/",
  few: "/fju/",
  within: "/wɪˈðɪn/",
  place: "/pleɪs/",
  quiet: "/ˈkwaɪət/",
  became: "/bɪˈkeɪm/",
  child: "/tʃaɪld/",
  children: "/ˈtʃɪldrən/",
  play: "/pleɪ/",
  could: "/kʊd/",
  person: "/ˈpɝsən/",
  people: "/ˈpipəl/",
  older: "/ˈoʊldər/",
  meet: "/mit/",
  worker: "/ˈwɝkər/",
  workers: "/ˈwɝkərz/",
  office: "/ˈɔfɪs/",
  rest: "/rɛst/",
  break: "/breɪk/",
  breaks: "/breɪks/",
  lunch: "/lʌntʃ/",
  during: "/ˈdʊrɪŋ/",
  where: "/wɛr/",
  however: "/haʊˈɛvər/",
  shop: "/ʃɑp/",
  shops: "/ʃɑps/",
  nearby: "/ˌnɪrˈbaɪ/",
  bag: "/bæɡ/",
  bags: "/bæɡz/",
  plastic: "/ˈplæstɪk/",
  fewer: "/ˈfjuər/",
  use: "/juz/",
  bin: "/bɪn/",
  bins: "/bɪnz/",
  recycling: "/riˈsaɪklɪŋ/",
  door: "/dɔr/",
  doors: "/dɔrz/",
  their: "/ðɛr/",
  outside: "/ˌaʊtˈsaɪd/",
  encouraged: "/ɪnˈkɝɪdʒd/",
  also: "/ˈɔlsoʊ/",
  problem: "/ˈprɑbləm/",
  environmental: "/ɪnˌvaɪrənˈmɛntəl/",
  every: "/ˈɛvri/",
  did: "/dɪd/",
  not: "/nɑt/",
  solve: "/sɑlv/",
  shared: "/ʃɛrd/",
  thought: "/θɔt/",
  about: "/əˈbaʊt/",
  how: "/haʊ/",
  it: "/ɪt/",
  changed: "/tʃeɪndʒd/",
  although: "/ɔlˈðoʊ/",
  simple: "/ˈsɪmpəl/",
  habit: "/ˈhæbɪt/",
  habits: "/ˈhæbɪts/",
  can: "/kæn/",
  influence: "/ˈɪnfluəns/",
  belongs: "/bɪˈlɔŋz/",
  them: "/ðɛm/",
  feel: "/fil/",
  when: "/wɛn/",
  showed: "/ʃoʊd/",
};
```

Thêm bộ tách token và hàm dựng dữ liệu:

```js
export function tokenizeEnglish(text) {
  return text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
}

export function getAmericanIpa(word) {
  return AMERICAN_IPA[word.toLowerCase()] ?? null;
}

function stripSlashes(ipa) {
  return ipa.slice(1, -1);
}

export function buildPronunciation(term, knownWords = new Set()) {
  const words = tokenizeEnglish(term);
  const newWords = [...new Set(words)]
    .filter((word) => !knownWords.has(word))
    .map((word) => ({ term: word, ipa: getAmericanIpa(word) }));
  const full = words
    .map(getAmericanIpa)
    .filter(Boolean)
    .map(stripSlashes)
    .join(" ");

  return {
    full: full ? `/${full}/` : "",
    newWords,
  };
}
```

- [ ] **Step 4: Chạy test**

Run:

```powershell
node --test .\tests\learning.test.mjs
```

Expected: PASS và không còn dạng từ nào thiếu IPA.

---

### Task 2: Gắn IPA vào từng màn hướng dẫn

**Files:**
- Modify: `js/guidance.mjs`
- Modify: `tests/learning.test.mjs`

- [ ] **Step 1: Viết test thất bại cho từ mới**

```js
test("guidance shows American IPA for the full unit and only its new words", () => {
  assert.deepEqual(tasks[0].guide.pronunciation, {
    full: "/ˈsɪti/",
    newWords: [{ term: "city", ipa: "/ˈsɪti/" }],
  });

  assert.deepEqual(tasks[2].guide.pronunciation, {
    full: "/ˈmɛni ˈsɪtiz/",
    newWords: [{ term: "many", ipa: "/ˈmɛni/" }],
  });

  assert.deepEqual(tasks[4].guide.pronunciation, {
    full: "/ˈdeɪli laɪf/",
    newWords: [{ term: "daily", ipa: "/ˈdeɪli/" }],
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```powershell
node --test .\tests\learning.test.mjs
```

Expected: FAIL vì `guide.pronunciation` chưa tồn tại.

- [ ] **Step 3: Theo dõi dạng từ đã giới thiệu**

Sửa `attachGuidance()` để duy trì `knownWords` theo thứ tự giáo án:

```js
import {
  buildPronunciation,
  tokenizeEnglish,
} from "./pronunciation.mjs";

export function attachGuidance(tasks) {
  const knownWords = new Set();

  return tasks.map((task, index) => {
    const guide = createGuidance(task, tasks[index - 1]);
    const pronunciation = buildPronunciation(guide.term, knownWords);

    tokenizeEnglish(guide.term).forEach((word) => knownWords.add(word));

    return {
      ...task,
      guide: { ...guide, pronunciation },
    };
  });
}
```

Các dạng biến đổi như `city` và `cities` là hai dạng từ riêng, vì vậy `cities`
vẫn được đánh dấu mới ở bước số nhiều.

- [ ] **Step 4: Chạy test**

Run:

```powershell
node --test .\tests\learning.test.mjs
```

Expected: PASS.

---

### Task 3: Hiển thị IPA tối giản

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Viết test HTML/JS thất bại**

```js
assert.match(html, /id="guide-ipa"/);
assert.match(html, /id="guide-new-words"/);
assert.match(appSource, /renderPronunciation/);
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```powershell
node --test .\tests\static-site.test.mjs
```

Expected: FAIL vì hai vùng IPA chưa tồn tại.

- [ ] **Step 3: Thêm vùng hiển thị**

Đặt ngay sau `#guide-meaning`:

```html
<p id="guide-ipa" class="guideIpa"></p>
<div id="guide-new-words" class="guideNewWords" hidden></div>
```

- [ ] **Step 4: Render dữ liệu IPA**

Trong `app.mjs`, thêm phần tử DOM và hàm:

```js
function renderPronunciation(pronunciation) {
  elements.guideIpa.textContent = pronunciation.full;
  elements.guideNewWords.replaceChildren();

  const showNewWords =
    pronunciation.newWords.length > 0 &&
    !(pronunciation.newWords.length === 1 &&
      pronunciation.newWords[0].ipa === pronunciation.full);

  elements.guideNewWords.hidden = !showNewWords;

  if (!showNewWords) {
    return;
  }

  pronunciation.newWords.forEach(({ term, ipa }) => {
    const row = document.createElement("p");
    const word = document.createElement("strong");
    const phonetic = document.createElement("span");
    word.textContent = term;
    phonetic.textContent = ipa;
    row.append(word, phonetic);
    elements.guideNewWords.append(row);
  });
}
```

Gọi `renderPronunciation(task.guide.pronunciation)` trong `renderGuide()`.

- [ ] **Step 5: Style nhẹ, không cạnh tranh với từ chính**

```css
.guideIpa {
  color: var(--muted);
  font-family: "Segoe UI", sans-serif;
  font-size: 20px;
  line-height: 1.4;
  margin: 8px 0 0;
}

.guideNewWords {
  border-left: 2px solid var(--line);
  margin-top: 22px;
  padding-left: 14px;
}

.guideNewWords p {
  display: flex;
  gap: 10px;
  margin: 6px 0;
}

.guideNewWords span {
  color: var(--muted);
}
```

- [ ] **Step 6: Chạy test**

Run:

```powershell
node --test .\tests\static-site.test.mjs .\tests\learning.test.mjs
```

Expected: PASS.

---

### Task 4: Đổi giọng dự phòng sang Anh-Mỹ

**Files:**
- Modify: `js/speech.mjs`
- Modify: `tests/speech.test.mjs`

- [ ] **Step 1: Đổi test sang ưu tiên Mỹ**

```js
test("speaks English with a preferred American voice and ends once", () => {
  const americanVoice = { lang: "en-US", name: "US voice" };
  const { environment, spoken, timers } = createSpeechEnvironment({
    voices: [{ lang: "en-GB", name: "British voice" }, americanVoice],
  });
  const player = createSpeechPlayer(environment);
  let endCount = 0;

  player.speak("city", {
    onEnd() {
      endCount += 1;
    },
  });

  assert.equal(spoken[0].lang, "en-US");
  assert.equal(spoken[0].voice, americanVoice);
  spoken[0].onend();
  timers[0].callback();
  assert.equal(endCount, 1);
});
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```powershell
node --test .\tests\speech.test.mjs
```

Expected: FAIL vì code hiện ưu tiên `en-GB`.

- [ ] **Step 3: Sửa voice selector**

```js
function selectEnglishVoice(synthesis) {
  const voices = synthesis.getVoices?.() ?? [];

  return (
    voices.find((voice) => voice.lang?.toLowerCase() === "en-us") ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ??
    null
  );
}
```

Đổi `utterance.lang` thành `"en-US"`.

- [ ] **Step 4: Chạy test**

Run:

```powershell
node --test .\tests\speech.test.mjs
```

Expected: PASS.

---

### Task 5: Tạo lại file WAV bằng Microsoft Zira

**Files:**
- Create: `tools/generate-american-audio.ps1`
- Replace: `assets/audio/*.wav`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Tạo script sinh âm thanh**

Script phải:

1. gọi Node để lấy `{ id, answer }` từ `buildLessonTasks()`;
2. khởi tạo `System.Speech.Synthesis.SpeechSynthesizer`;
3. chọn chính xác `Microsoft Zira Desktop`;
4. xác nhận culture của voice là `en-US`;
5. ghi đè `assets/audio/<task-id>.wav`;
6. đặt tốc độ chậm vừa phải cho người mới.

Phần lõi:

```powershell
Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voiceName = "Microsoft Zira Desktop"
$synth.SelectVoice($voiceName)

if ($synth.Voice.Culture.Name -ne "en-US") {
  throw "Voice $voiceName is not en-US."
}

$synth.Rate = -2
$synth.Volume = 100

foreach ($task in $tasks) {
  $output = Join-Path $audioDirectory "$($task.id).wav"
  $synth.SetOutputToWaveFile($output)
  $synth.Speak([string]$task.answer)
  $synth.SetOutputToNull()
}
```

- [ ] **Step 2: Chạy script**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\generate-american-audio.ps1
```

Expected: tạo đủ 138 file WAV và in tên voice `Microsoft Zira Desktop (en-US)`.

- [ ] **Step 3: Mở rộng test tài sản**

Ngoài kiểm tra file tồn tại, đọc 12 byte đầu và xác nhận WAV hợp lệ:

```js
const header = await readFile(assetPath);
assert.equal(header.subarray(0, 4).toString("ascii"), "RIFF");
assert.equal(header.subarray(8, 12).toString("ascii"), "WAVE");
```

- [ ] **Step 4: Chạy test tài sản**

Run:

```powershell
node --test .\tests\static-site.test.mjs
```

Expected: PASS, đủ 138 file WAV hợp lệ.

---

### Task 6: Xác minh toàn bộ và kiểm tra giao diện

**Files:**
- Verify only

- [ ] **Step 1: Chạy toàn bộ test**

Run:

```powershell
node --test .\tests\learning.test.mjs .\tests\lesson-flow.test.mjs .\tests\speech.test.mjs .\tests\mastery.test.mjs .\tests\static-site.test.mjs
```

Expected: tất cả test PASS.

- [ ] **Step 2: Kiểm tra server**

Mở:

```text
http://127.0.0.1:8000/learn_english/
```

Xác nhận:

- `city` hiện `/ˈsɪti/`;
- không có `/t̮/`;
- `many cities` hiện từ mới `many /ˈmɛni/` và IPA toàn cụm;
- `daily life` hiện từ mới `daily /ˈdeɪli/` và IPA toàn cụm;
- âm thanh tự phát và nút nghe lại dùng giọng Mỹ;
- IPA không xuất hiện như một bài tập;
- giao diện không tràn hoặc chồng lấn ở desktop và 390 x 800.

- [ ] **Step 3: Kiểm tra console**

Expected: không có lỗi hoặc cảnh báo liên quan đến module IPA, file WAV hoặc DOM
mới.
