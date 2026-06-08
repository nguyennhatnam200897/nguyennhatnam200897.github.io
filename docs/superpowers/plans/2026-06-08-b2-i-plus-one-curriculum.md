# B2 i+1 Curriculum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay giáo án phẳng bằng chuỗi học i+1 chi tiết cho toàn bộ bảy câu của bài “A Small Public Garden”.

**Architecture:** Mỗi câu có một nhóm nhiệm vụ tuần tự trong `js/article.mjs`. Nhiệm vụ đi từ danh từ/đối tượng một từ, sang biến thể số, cụm, mệnh đề, câu cơ bản, câu mở rộng và nguyên văn; sau bảy câu là các nhiệm vụ ghép đoạn cộng dồn.

**Tech Stack:** JavaScript modules thuần, Node built-in test runner, HTML/CSS/DOM API.

---

### Task 1: Khóa luật phân tầng

- [x] Kiểm thử `city -> cities -> many cities`.
- [x] Kiểm thử tầng `object` chỉ chứa đáp án một từ.
- [x] Kiểm thử không có IPA và không có nhãn lộ trình trên UI.

### Task 2: Xây chuỗi từng câu

- [x] Xây chuỗi S1 từ hai mệnh đề rồi ghép bằng `but`.
- [x] Xây S2 từ câu quan hệ cơ bản rồi mở rộng từng đối tượng.
- [x] Xây S3 với hai vị ngữ chung chủ thể/modal rồi ghép bằng `that`.
- [x] Xây S4 với trạng ngữ, mệnh đề quan hệ và ba nhánh song song.
- [x] Xây S5 với hai hành động chung chủ thể và cấu trúc `encouraged ... to ...`.
- [x] Xây S6 với `how` và quan hệ nhượng bộ `although`.
- [x] Xây S7 từ mệnh đề `that`, khối `when` và câu báo cáo.

### Task 3: Xây cấp đoạn

- [x] Ghép `S1 + S2`.
- [x] Thêm từng câu một cho tới `S1 + ... + S7`.
- [x] Kiểm thử mỗi lượt đoạn chỉ thêm một câu.

### Task 4: Bảo vệ tiến độ và xác minh

- [x] Đổi khóa tiến độ sang `article-mastery-progress-v5`.
- [x] Tạo tài liệu giáo án dễ đọc từ dữ liệu nhiệm vụ.
- [x] Kiểm tra toàn bộ test và luồng học thực tế trên trình duyệt.
