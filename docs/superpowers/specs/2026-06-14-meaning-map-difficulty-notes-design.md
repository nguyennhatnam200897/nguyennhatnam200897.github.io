# Ban do y va giai thich diem kho truoc khi go

Ngay chot: 2026-06-14

## Trang thai

Dac ta nay ghi lai huong da chot cho lan cai tien tiep theo cua course
`small-public-garden-gentle-i1`: them ban do y va lop giai thich diem kho truoc
khi nguoi hoc go dap an.

Muc tieu khong phai tao them mot dang bai tap moi. Lop moi chi giup nguoi hoc
hieu cach cau tieng Anh duoc dong goi theo cum nghia, roi van quay lai hanh vi
cot loi cua app: nhin y tieng Viet va tu viet hoac tu noi dap an tieng Anh doc
lap.

## Van de can giai quyet

Course hien tai da di theo cum nghia va co vai tro cum, nhung nguoi hoc van co
the cam thay minh dang nho chuoi chu. Mot so diem kho nhu mao tu, so nhieu,
`would`, `although`, `where`, `when`, `how`, `to use`, `to place` dang duoc
giai thich o tung cum, nhung chua tao duoc cam giac "minh thay duoc ban do cua
y nay truoc khi go".

Nguoi hoc can nhin thay:

- cau nay dang di qua nhung y nao;
- moi cum tra loi cau hoi vai tro nao;
- diem nao de sai vi tieng Anh dong goi khac tieng Viet;
- sau khi hieu, minh van tu go dap an, khong bi hoi lai nhu bai thi phu.

## Nguyen tac san pham

- Khong them cau hoi trac nghiem, dien khuyet, keo tha, chon dap an, hay bat
  nguoi hoc tra loi mot cau hoi phu truoc khi go.
- Khong tiet lo dap an day du trong man exercise.
- Man guide co the hien ro hon vi day la noi nguoi hoc duoc chuan bi truoc khi
  tu san sinh tieng Anh.
- Giai thich phai bang tieng Viet gan voi y nghia, khong day thuat ngu phap lam
  noi dung chinh.
- Giai thich sau hon o lan dau gap diem kho; cac lan sau co the nhac ngan hon.
- Tinh nang phai mo rong duoc cho bai 2, bai 3, bai 4 bang du lieu course, khong
  hard-code rieng mot cau trong UI.

## Pham vi

Trong pham vi:

- mo rong du lieu `meaningChunkLessons` de luu ban do y va ghi chu diem kho;
- render ban do y trong man overview cua tung cau;
- render ghi chu diem kho trong man guide cua final chunk va composition phu hop;
- ap dung truoc cho course `small-public-garden-gentle-i1`;
- them validation va test de khoa hanh vi doc hieu, khong quiz.

Ngoai pham vi:

- khong doi scheduler thanh thao;
- khong doi cham dap an;
- khong them audio moi neu khong co task moi;
- khong tao bai nghe moi;
- khong thay doi course goc `small-public-garden` va course nghe
  `listening-song-ngu-sample`;
- khong tao he thong sinh giai thich tu AI runtime.

## Trai nghiem nguoi hoc

### Overview cua cau

Truoc khi vao cau, overview khong chi noi "minh se hoc cau nay". No hien them
ban do y doc duoc nhu mot dong cau hoi vai tro:

```text
O dau? -> Ai thuc hien? -> Da bien cai gi? -> Thanh cai gi?
```

Moi muc trong ban do y co the co nhan tieng Viet ngan, vai tro, va cum tieng Anh
neu cum do da la muc tieu cua bai hoc. Ban do nay nam trong man overview, khong
nam trong man exercise.

### Guide cua final chunk

Khi den final chunk, guide van co `Khi nao can?`, `Muc dich la gi?`, `Vai tro
trong cau`. Them mot khoi "Diem de sai" neu cum nay co diem can giai thich.

Vi du voi `an empty parking lot`:

```text
Diem de sai:
- Tieng Viet noi "mot bai do xe trong", tieng Anh can mao tu vi "lot" la mot
  danh tu dem duoc so it.
- Dung "an" vi am dau cua "empty" la am nguyen am.
- "parking lot" la mot cum danh tu: parking mo ta loai lot, khong tach thanh
  "lot parking".
```

Nguoi hoc chi doc de hieu, bam tiep tuc, roi go dap an.

### Guide cua composition

Khi ghep nhieu cum, guide hien role line nhu hien tai va co the them ghi chu ve
cach dong goi y lon.

Vi du:

```text
Ban dang ghep:
Ai phan nan? -> Ho da lam gi? -> Dieu dang lo thu nhat? -> Dieu dang lo them?

Diem de sai:
- "complained that" mo noi dung loi phan nan, nen phan sau la mot menh de.
- "would" o day la du doan/lo ngai cua cu dan, khong phai viec da xay ra.
- Cum "and attract noise" muon noi them mot he qua, nen khong lap lai "the
  project would".
```

### Man exercise

Man exercise giu nguyen tinh than hien tai:

- prompt tieng Viet;
- o nhap dap an;
- nut noi thu neu trinh duyet ho tro;
- khong hien role line, dap an, ban do y, hay diem de sai trong luc nguoi hoc
  dang go.

Neu nguoi hoc sai, app van dung rollback/repair hien co de dua ve dung cum hong.
Guide cua cum repair co the hien lai diem kho tuong ung.

## Mo hinh du lieu

Them cac truong tuy chon vao course data. UI va model phai clone/normalize cac
truong nay, nhung course khong co cac truong moi van chay binh thuong.

### `overview.meaningMap`

```json
{
  "overview": {
    "title": "Minh se xay cau nay tu cac cum nghia",
    "summary": [
      "Cau nay dat mot thay doi vao mot khu dan cu.",
      "Minh se ghep noi chon, nguoi thuc hien, vat ban dau va ket qua."
    ],
    "graded": false,
    "meaningMap": [
      {
        "label": "O dau?",
        "meaning": "trong mot khu dan cu",
        "chunkId": "S2-C01"
      },
      {
        "label": "Ai thuc hien thay doi?",
        "meaning": "hoi dong dia phuong",
        "chunkId": "S2-C02"
      }
    ]
  }
}
```

Quy tac:

- `label` bat buoc, la cau hoi vai tro ngan;
- `meaning` tuy chon, la y tieng Viet;
- `chunkId` tuy chon, tro toi chunk da co trong lesson;
- khong bat buoc hien dap an tieng Anh trong overview neu thay lam lo dap an qua
  som;
- thu tu cua `meaningMap` phai la thu tu dong y cua cau.

### `guide.difficultyNotes`

`difficultyNotes` la mang cac ghi chu doc hieu, gan vao chunk hoac composition.
Trong du lieu goc, tac gia co the dat o `chunk.difficultyNotes`,
`step.difficultyNotes`, hoac `composition.difficultyNotes`. Khi build task, cac
ghi chu nay duoc dua vao `task.guide.difficultyNotes`.

```json
{
  "difficultyNotes": [
    {
      "tag": "article",
      "title": "Vi sao dung an?",
      "body": "Dung an vi empty bat dau bang am nguyen am, va lot la mot vat dem duoc so it."
    },
    {
      "tag": "word-order",
      "title": "parking lot la mot cum",
      "body": "parking dung truoc lot de noi loai bai do xe; khong dao thanh lot parking."
    }
  ]
}
```

Quy tac:

- `title` va `body` bat buoc;
- `tag` tuy chon, dung cho test va style nhe;
- moi ghi chu chi giai thich mot diem kho;
- khong dung cau hoi yeu cau nguoi hoc tra loi;
- khong bat dau bang nhung lenh nhu "Hay chon", "Tra loi", "Dien vao".

## Tac gia hoc lieu

Khi viet bai moi, tac gia nen them ghi chu cho cac diem sau neu xuat hien:

- `article`: `a`, `an`, `the`;
- `plural`: so nhieu, bat quy tac nhu `children`;
- `modal`: `would`, `could`, `can`;
- `connector`: `but`, `however`, `although`, `that`;
- `relative-place`: `where`;
- `time-condition`: `when`;
- `content-clause`: `how`;
- `to-frame`: `to use`, `to place`, `encouraged someone to do something`;
- `word-order`: trat tu cum danh tu, tinh tu, trang tu;
- `ellipsis`: luoc chu the hoac luoc khung da duoc hieu tu phan truoc.

Ghi chu phai giai thich bang cach so sanh cach nghi tieng Viet va cach tieng Anh
dong goi y. Neu mot diem kho da xuat hien nhieu lan, lan sau co the viet ngan:
"Day la cung kieu would cua loi du doan/lo ngai nhu cau truoc."

## Kien truc

### `js/meaning-chunks.mjs`

- Validate `overview.meaningMap` neu co.
- Clone `meaningMap` vao `lessonOverview`.
- Clone `difficultyNotes` tu chunk final step va composition vao `guide`.
- Giu nguyen quy tac: step nho khong co role metadata, tru khi chinh step do co
  ghi chu that su can thiet. Mac dinh chi final chunk va composition hien diem
  kho.

### `js/course-model.mjs`

- `normalizeGuide()` copy `difficultyNotes`.
- `normalizeTask()` copy `lessonOverview.meaningMap`.
- Course khong co truong moi khong bi loi.

### `js/app.mjs`

- `renderOverview()` hien them ban do y neu `lessonOverview.meaningMap` co du
  lieu.
- `renderGuide()` hien them khoi "Diem de sai" neu
  `task.guide.difficultyNotes` co du lieu.
- Khoi moi chi la noi dung doc; khong co input, khong co dap an can cham.
- `renderExercise()` khong render cac thong tin nay.

### HTML/CSS

- Them container cho meaning map trong overview va difficulty notes trong guide.
- Giao dien gon, uu tien doc nhanh tren mobile.
- Khong tao card long card; cac dong ban do y co the la list ngan hoac pill nhe
  trong vung overview/guide hien co.
- Dam bao text dai tu dong xuong dong, khong tran nut va khong che o nhap.

## Data flow

```text
course JSON
-> buildMeaningChunkTaskGroups()
-> normalizeCourse()
-> task.lessonOverview.meaningMap
-> task.guide.difficultyNotes
-> renderOverview()/renderGuide()
-> nguoi hoc doc
-> exercise van chi cham prompt -> answer
```

Khong co state mastery moi. Neu can giam lap giai thich ve sau, dung chinh noi
dung authoring ngan hon trong course data, khong can luu them dem so lan doc o
buoc dau.

## Xu ly loi

- Neu `meaningMap` thieu `label` hoac khong phai mang object hop le, course bi
  bao loi du lieu.
- Neu `difficultyNotes` thieu `title` hoac `body`, course bi bao loi du lieu.
- Neu `chunkId` trong meaning map khong ton tai trong lesson, course bi bao loi
  de tranh ban do y lech voi hoc lieu.
- Neu khong co truong moi, UI an container va app hoat dong nhu hien tai.

## Kiem thu bat buoc

### Unit/data tests

- Course `small-public-garden-gentle-i1` co `meaningMap` cho ca bay lesson.
- Moi meaning map co thu tu hop ly va `chunkId` hop le neu duoc khai bao.
- Final chunk va composition co the mang `difficultyNotes`.
- Step nho khong mac dinh nhan role metadata hay difficulty notes ngoai y muon.
- `normalizeGuide()` giu `difficultyNotes`.
- `normalizeTask()` giu `lessonOverview.meaningMap`.
- Course cu khong co truong moi van pass.

### Content tests

- Co ghi chu cho `the`, `a/an`, so nhieu, `would`, `although`, `where`, `when`,
  `how`, `to use`, `to place` trong course thu nghiem neu cac diem do xuat hien.
- Khong co `difficultyNotes` nao dung wording theo kieu quiz: "hay chon",
  "tra loi", "dien vao", "dung dap an nao".
- Prompt tieng Viet van khong tiet lo dap an tieng Anh day du.

### UI/static tests

- HTML co container cho overview meaning map va guide difficulty notes.
- `app.mjs` render difficulty notes trong guide, khong render trong exercise.
- Desktop va mobile khong chong noi dung.
- `node --test` pass.

## Tieu chi hoan thanh

Tinh nang hoan thanh khi:

1. nguoi hoc thay ban do y truoc moi cau cua course thu nghiem;
2. nguoi hoc doc duoc diem kho quan trong truoc khi go final chunk/composition;
3. khong co cau hoi phu hay scoring moi;
4. man exercise van giu tinh than tu san sinh tieng Anh;
5. du lieu moi nam trong course JSON va co schema/validation ro;
6. cac course khac khong doi hanh vi;
7. test tu dong va QA giao dien xac nhan khong hoi quy.
