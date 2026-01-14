import { createRoot, createEffect, onCleanup } from 'solid-js';

// --- CẤU HÌNH & CACHE ---
const loadedChunks = new Map(); // Cache JS đã tải

// --- PHẦN 1: NANO-LOADER ENGINE (Tối ưu UX) ---

// 1. Observer cho Lazy Load (data-on="visible")
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            observer.unobserve(el); // Chỉ tải 1 lần
            fetchAndSwap(el);
        }
    });
}, { rootMargin: "100px" }); // Tải trước khi user cuộn tới 100px

// 2. Xử lý Hover (data-on="hover") - Có Delay chống Spam
function setupHover(el) {
    if (el.__hoverInit) return;
    el.__hoverInit = true;

    let timer;
    const DELAY_MS = 200; // 200ms là chuẩn vàng cho UX

    const onEnter = () => {
        // Chuột vào -> Đếm ngược
        timer = setTimeout(() => {
            cleanup(); // Xóa sự kiện ngay để không bao giờ chạy lại
            fetchAndSwap(el);
        }, DELAY_MS);
    };

    const onLeave = () => {
        // Chuột ra sớm -> Hủy
        clearTimeout(timer);
    };

    const cleanup = () => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
}

// 3. Xử lý Tương tác Tức thì (Click/Tap/Enter)
// Dùng 'pointerdown' để bắt cả Chuột & Ngón tay ngay khi chạm vào
if (typeof document !== 'undefined') {
    
    const handleInteraction = (e) => {
        // Chỉ nhận: Chuột trái (pointerType mouse/touch) hoặc Phím Enter/Space
        const isPointer = e.type === 'pointerdown' && e.isPrimary && e.button === 0;
        const isKey = e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ');

        if (!isPointer && !isKey) return;

        // Tìm phần tử kích hoạt
        const trigger = e.target.closest('[data-on="click"][data-src]');
        if (!trigger) return;

        // LOCK: Nếu đang tải thì chặn luôn
        if (trigger.__isLoading) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }

        // Bắt đầu tải
        trigger.__isLoading = true;
        
        // Ngăn hành vi mặc định (quan trọng cho touch để không kích hoạt click giả)
        // Nhưng cẩn thận với thẻ <a> nếu muốn giữ link
        if (trigger.tagName !== 'A') {
             // e.preventDefault(); // Uncomment nếu muốn chặn focus
        }

        fetchAndSwap(trigger).finally(() => {
            // Mở khóa sau 500ms (đủ để sự kiện click native trôi qua)
            setTimeout(() => trigger.__isLoading = false, 500);
        });
    };

    // 'pointerdown' nhanh hơn 'click' ~100-300ms trên mobile
    document.addEventListener('pointerdown', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    // Vẫn cần lắng nghe 'click' để chặn hành vi mặc định nếu lỡ nó lọt qua
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-on="click"][data-src]');
        if (trigger) {
            // Nếu đã xử lý ở pointerdown, chặn click để không bị duplicate logic (nếu có)
            // Hoặc chặn thẻ <a> chuyển trang
             e.preventDefault(); 
        }
    });
}

// 4. Hàm điều phối khởi tạo Loader
function initLoader(root) {
    // Visible
    root.querySelectorAll('[data-on="visible"]').forEach(el => observer.observe(el));
    // Hover
    root.querySelectorAll('[data-on="hover"]').forEach(el => setupHover(el));
}

// 5. Logic Tải & Tráo đổi nội dung (Core)
async function fetchAndSwap(el) {
    const url = el.dataset.src;
    const targetSelector = el.dataset.target;
    
    // Nếu có target -> Lấy target. Không thì lấy chính nó.
    const targetEl = targetSelector ? document.querySelector(targetSelector) : el;

    if (!targetEl) {
        console.warn(`⚠️ Target not found: ${targetSelector}`);
        return;
    }

    try {
        // Feedback UI: Thêm class loading vào nơi sắp hiển thị
        targetEl.classList.add('animate-pulse', 'opacity-60', 'pointer-events-none');
        
        // Gọi Server
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        // Swap HTML
        targetEl.innerHTML = html;
        
        // Đệ quy: Quét component & loader trong nội dung mới
        hydrate(targetEl); 

    } catch (err) {
        console.error('Fetch error:', err);
        // Có thể hiện thông báo lỗi lên UI nếu muốn
    } finally {
        // Dọn dẹp class loading
        targetEl.classList.remove('animate-pulse', 'opacity-60', 'pointer-events-none');
    }
}


// --- PHẦN 2: COMPONENT HYDRATION ENGINE ---

// Helper: Quét DOM tìm data-r cực nhanh
function collectRefs(root) {
    const refs = {};
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;
    while (node) {
        if (node.hasAttribute('data-r')) refs[node.getAttribute('data-r')] = node;
        // Skip nested components (Tối ưu hiệu năng)
        if (node !== root && node.hasAttribute('data-cmp')) {
            // Nhảy qua toàn bộ cây con của component lồng nhau này
            // walker.nextSibling() đôi khi null nếu là node cuối, nên cứ để loop tự chạy cũng ổn với cây nông
        }
        node = walker.nextNode();
    }
    return refs;
}

// Main Function
export async function hydrate(container = document) {
    const components = container.querySelectorAll('[data-cmp]');

    for (const el of components) {
        if (el.__hydrated) continue;

        const cmpName = el.dataset.cmp;
        // console.log(`🔌 Hydrating: ${cmpName}`);

        try {
            // 1. Lazy Load JS Chunk
            if (!loadedChunks.has(cmpName)) {
                // Vite dynamic import
                const mod = await import(`../chunks/${cmpName}.js`);
                loadedChunks.set(cmpName, mod.default);
            }
            
            // 2. Setup
            const componentLogic = loadedChunks.get(cmpName);
            const refs = collectRefs(el);

            // 3. Run SolidJS Root
            el.__dispose = createRoot((dispose) => {
                componentLogic(refs, { createEffect, onCleanup });
                return dispose;
            });

            el.__hydrated = true;
        } catch (err) {
            console.error(`❌ Hydrate fail: ${cmpName}`, err);
        }
    }

    // QUAN TRỌNG: Kích hoạt Nano-Loader cho nội dung vừa render
    initLoader(container);
}

// Tự động chạy khi load trang
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => hydrate());
}