# Huong di moi: i+1 theo cum nghia va vai tro cum

Ngay tao: 2026-06-11

## Trang thai

Day la huong thiet ke moi cua du an de tiep tuc thao luan truoc khi trien khai.
Tai lieu nay ghi lai quyet dinh san pham da thong nhat trong phien thao luan:
nguoi hoc khong hoc bang nhieu dang bai tap khac nhau, ma hoc bang mot hanh vi
cot loi duy nhat: nhin y tieng Viet va tu viet hoac tu noi dap an tieng Anh.

Huong nay thay the cach nghi "tang do kho task" bang cach nghi "lam chu tung
cum nghia, hieu vai tro cua cum, roi ghep cac cum da lam chu thanh y dai hon".

## Muc tieu

Muc tieu cua app khong chi la giup nguoi hoc chep lai dung cau tieng Anh trong
bai bao. App phai giup nguoi hoc nhin cau tieng Anh nhu mot dong y nghia duoc
xay tu cac don vi nho co vai tro ro rang.

Nguoi hoc can cam thay rang moi ngay minh dang:

- so huu them mot vai cum co nghia;
- hieu cum do dung de tra loi cau hoi nao trong cau;
- biet ghep cum do voi cac cum khac de dien dat mot y lon hon;
- tien gan hon toi viec tu viet hoac tu noi lai dung cau goc.

## Nguyen tac khong doi

- Chi co mot dang bai cot loi: tieng Viet -> nguoi hoc tu viet hoac tu noi tieng Anh doc lap.
- Khong them dang dien khuyet, chon dap an, keo tha, ghep the, hoac goi y truc tiep trong o tra loi.
- Speech-to-text neu co chi la cach nhap nhap; nguoi hoc van duoc sua truoc khi nop va app khong cham phat am.
- Ket qua cuoi van phai bam sat van ban tieng Anh goc cua khoa hoc, khong cham theo y tu do.
- IPA, audio va giai thich chi la lop ho tro, khong bien thanh bai cham diem rieng.

## Don vi hoc trung tam: cum nghia

Cum nghia khong phai chi la mot doan chu cat ra cho ngan. Cum nghia la mot don
vi chuan cua y. Moi cum phai co nghia ro va dai dien cho mot vai tro nao do
trong cau.

Moi cum nghia can co it nhat cac thuoc tinh sau:

- `english`: cum tieng Anh can so huu.
- `vietnamese`: y tieng Viet tuong ung.
- `roleQuestion`: cau hoi vai tro ma cum nay tra loi, vi du `Ai?`, `Dang lam gi?`, `Ket qua gi?`.
- `roleMeaning`: giai thich ngan ve vai tro cua cum trong dong y.
- `chunkType`: loai cum noi bo, vi du `entity`, `action-frame`, `action-object`, `result`, `linker`, `description`.
- `prerequisites`: cac buoc nho can hoc truoc de di toi cum nay.
- `compositionTargets`: cac cum hoac y dai hon ma cum nay se tham gia ghep vao.

## Vai tro cum

App can phan loai va gan vai tro cho cum bang ngon ngu gan voi nguoi moi hoc,
khong can goi ten ngu phap kho. Vai tro la cau noi giua tu vung va ngu phap.

Bo vai tro nen bat dau bang cac nhan gan voi y nghia:

- `Ai? / Cai gi?`: chu the, doi tuong, hoac cai dang duoc noi toi.
- `Dang lam gi?`: hanh dong dang dien ra, y dinh, hoac khung hanh dong.
- `Lam gi?`: hanh dong chinh.
- `Lam voi cai gi?`: doi tuong bi tac dong hoac phan hanh dong huong toi.
- `Ket qua gi? / Tro nen the nao?`: ket qua, muc tieu, hoac trang thai dat toi.
- `La gi? / Co dac diem gi?`: nhan dinh, dinh danh, hoac dac diem.
- `Khi nao? / O dau? / Bang cach nao? / Vi sao?`: hoan canh bo sung cho y chinh.
- `Quan he giua hai y?`: tu noi, doi lap, bo sung, nguyen nhan, ket qua.

Trong UI, app co the hien ngan gon vai tro cua cum tren man huong dan. Tuy nhien
man bai tap van giu nguyen: nguoi hoc nhin tieng Viet va tu viet/noi tieng Anh.

## Hai tang i+1

Huong moi dung hai tang i+1 long vao nhau.

### Tang 1: i+1 ben trong tung cum

Moi cum co mot qua trinh rieng de nguoi hoc di tu thanh phan nho len cum nghia
hoan chinh. Moi buoc van la mot lan viet/noi doc lap.

Vi du `many cities`:

- `thanh pho` -> `city`
- `cac thanh pho` -> `cities`
- `nhieu thanh pho` -> `many cities`

Vai tro cua cum hoan chinh:

- `many cities`
- Nghia: nhieu thanh pho
- Vai tro: `Ai? / Chu the cua hanh dong`

Vi du `are trying to`:

- `co gang` -> `try`
- `dang co gang` -> `are trying`
- `dang co gang lam` -> `are trying to`

Vai tro cua cum hoan chinh:

- `are trying to`
- Nghia: dang co gang lam
- Vai tro: `Dang lam gi? / Khung y dinh hanh dong`

Vi du `more sustainable`:

- `ben vung` -> `sustainable`
- `ben vung hon` -> `more sustainable`

Vai tro cua cum hoan chinh:

- `more sustainable`
- Nghia: ben vung hon
- Vai tro: `Ket qua gi? / Tro nen the nao?`

### Tang 2: i+1 giua cac cum

Sau khi tung cum da duoc lam chu, app bat dau ghep cac cum theo vai tro de tao
thanh y dai hon. Moi buoc ghep van la mot prompt tieng Viet va mot dap an tieng
Anh doc lap.

Vi du:

- `nhieu thanh pho` -> `many cities`
- `dang co gang lam` -> `are trying to`
- `nhieu thanh pho dang co gang lam` -> `many cities are trying to`

Tiep theo:

- `lam cho doi song hang ngay` -> `make daily life`
- `ben vung hon` -> `more sustainable`
- `lam cho doi song hang ngay ben vung hon` -> `make daily life more sustainable`

Sau do ghep thanh y lon:

- `nhieu thanh pho dang co gang lam cho doi song hang ngay ben vung hon`
- `many cities are trying to make daily life more sustainable`

## Vi du cau dau bai 1

Cau dich:

`Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.`

### Cum cua ve 1

`many cities`

- Nghia: nhieu thanh pho
- Vai tro: `Ai? / Chu the`
- Qua trinh cum: `city` -> `cities` -> `many cities`

`are trying to`

- Nghia: dang co gang lam
- Vai tro: `Dang lam gi? / Khung y dinh hanh dong`
- Qua trinh cum: `try` -> `are trying` -> `are trying to`

`make daily life`

- Nghia: lam cho doi song hang ngay
- Vai tro: `Lam gi voi cai gi? / Hanh dong + doi tuong bi tac dong`
- Qua trinh cum: `life` -> `daily life` -> `make daily life`

`more sustainable`

- Nghia: ben vung hon
- Vai tro: `Ket qua gi? / Trang thai muon dat toi`
- Qua trinh cum: `sustainable` -> `more sustainable`

Ghep ve 1:

- `many cities` + `are trying to`
- `many cities are trying to`
- `make daily life` + `more sustainable`
- `make daily life more sustainable`
- `many cities are trying to make daily life more sustainable`

### Cum cua ve 2

`the most effective changes`

- Nghia: nhung thay doi hieu qua nhat
- Vai tro: `Cai gi? / Chu the cua nhan dinh`
- Qua trinh cum: `change` -> `changes` -> `effective changes` -> `the most effective changes`

`are often`

- Nghia: thuong la
- Vai tro: `Nhan dinh thuong xay ra`
- Qua trinh cum: `are` -> `are often`, neu can; hoac gioi thieu truc tiep trong y co nghia khi hoc cau.

`the least dramatic`

- Nghia: it gay an tuong manh nhat
- Vai tro: `Co dac diem gi? / Dac diem cua chu the`
- Qua trinh cum: `dramatic` -> `less dramatic` hoac `least dramatic` -> `the least dramatic`, tuy muc do can thiet.

Ghep ve 2:

- `the most effective changes`
- `the most effective changes are often`
- `the most effective changes are often the least dramatic`

### Quan he giua hai ve

`but`

- Nghia: nhung
- Vai tro: `Quan he trai chieu / Doi huong y`

Ghep cau hoan chinh:

- Ve 1: `many cities are trying to make daily life more sustainable`
- Quan he: `but`
- Ve 2: `the most effective changes are often the least dramatic`
- Cau cuoi: `Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.`

## Quy tac thanh thao

Mot cum duoc xem la da so huu khi co du bang chung:

- nguoi hoc viet/noi dung cum do it nhat 2 lan;
- co it nhat 1 lan dung sau khi da bi xen ke boi mot don vi khac;
- cum do duoc dung dung ben trong mot y dai hon.

Khi nguoi hoc da so huu mot cum, app khong hoi lai cum do rieng le neu khong can.
Cum do duoc dua vao cau dai hon va duoc cung co am tham khi nguoi hoc viet/noi
dung y dai hon.

Neu nguoi hoc sai trong mot y dai, app can xac dinh cum nao dang hong. App chi
dua cum do quay lai vong luyen noi bo bang cung mot dang viet/noi doc lap, sau
do tra nguoi hoc ve y dai dang hoc.

Vi du:

- Prompt: `nhieu thanh pho dang co gang lam cho doi song hang ngay ben vung hon`
- Nguoi hoc viet: `many city are trying to make daily life more sustainable`
- Cum hong: `many cities`
- Repair prompt: `nhieu thanh pho` -> `many cities`
- Sau khi dung, quay lai prompt dai.

## Cam giac hoc mong muon

Nguoi hoc khong nen cam thay app dang tang do kho dot ngot. Ho nen cam thay minh
dang lam chu tung cum, hieu vai tro cua no, va dung cum do de xay y lon hon.

Tien trinh nen tao cam giac:

- hom nay minh so huu them mot cum;
- minh biet cum nay tra loi cau hoi nao trong cau;
- minh ghep duoc cum moi vao cum cu;
- cau cua minh dai hon, ro y hon, va gan cau goc hon.

## Cac diem can tiep tuc ban

Nhung diem sau la noi dung can tiep tuc thao luan truoc khi trien khai:

- Bo vai tro cum nen gon toi muc nao de nguoi moi hoc khong bi ngop.
- UI nen hien vai tro cum o man huong dan truoc bai tap, sau khi tra loi, hay ca hai.
- Mot so cum chua dong nghia hoan toan, nhu `are trying to`, nen duoc goi la `cum chuc nang` hay van goi chung la `cum nghia`.
- Cach chon ranh gioi cum sao cho moi cum vua co nghia, vua du nho de hoc em ai.
- Cac quy tac repair khi mot loi trong cau dai co the thuoc nhieu cum cung luc.
- Cach ap dung huong nay truoc tien cho course thu nghiem Gentle i+1 ma khong lam thay doi cac bai hien tai.
