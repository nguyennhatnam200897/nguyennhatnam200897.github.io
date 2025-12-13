    // --- 1. CẤU HÌNH ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const TILE_SIZE = 32; // Mỗi ô đất là 32x32 pixel
    const COLS = 20;
    const ROWS = 15;

    // --- 2. DỮ LIỆU (STATE) ---
    
    // Tạo bản đồ mẫu (0: Cỏ, 1: Đất nâu)
    // Tạo mảng 2 chiều mặc định toàn số 0
    let map = [];
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            row.push(0); 
        }
        map.push(row);
    }

    // Nhân vật
    const player = {
        x: 100,
        y: 100,
        width: 24,
        height: 24,
        speed: 4,
        color: 'red'
    };

    // Quản lý phím bấm (để di chuyển mượt)
    const keys = {};

    // --- 3. INPUT HANDLE (XỬ LÝ ĐẦU VÀO) ---
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        
        // Cơ chế cuốc đất (Nhấn Space)
        if (e.code === 'Space') {
            interact();
        }
    });
    window.addEventListener('keyup', (e) => keys[e.code] = false);

    // Hàm tương tác với đất
    function interact() {
        // Tính xem tâm nhân vật đang đứng ở ô (col, row) nào
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;

        const col = Math.floor(centerX / TILE_SIZE);
        const row = Math.floor(centerY / TILE_SIZE);

        // Kiểm tra giới hạn bản đồ
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            // Logic: Nếu là cỏ (0) thì biến thành đất (1), và ngược lại
            if (map[row][col] === 0) {
                map[row][col] = 1;
                console.log("Đã cuốc đất!");
            } else if (map[row][col] === 1) {
                map[row][col] = 0; // Lấp đất lại
            }
        }
    }

    // --- 4. UPDATE (TÍNH TOÁN LOGIC) ---
    function update() {
        // Di chuyển
        if (keys['ArrowUp'] || keys['KeyW']) player.y -= player.speed;
        if (keys['ArrowDown'] || keys['KeyS']) player.y += player.speed;
        if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
        if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;

        // Giới hạn không cho chạy ra khỏi màn hình
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
        if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
    }

    // --- 5. DRAW (VẼ HÌNH) ---
    function draw() {
        // Xóa màn hình cũ
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Vẽ bản đồ (Duyệt qua mảng 2 chiều)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let tileVal = map[r][c];
                
                // Chọn màu dựa trên giá trị
                if (tileVal === 0) ctx.fillStyle = '#66bb6a'; // Xanh lá (Cỏ)
                else if (tileVal === 1) ctx.fillStyle = '#8d6e63'; // Nâu (Đất)
                
                // Vẽ ô vuông
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                // Vẽ viền mờ để dễ nhìn lưới
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // 2. Vẽ nhân vật
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // 3. (Tùy chọn) Vẽ khung chọn để biết đang nhắm vào ô nào
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        const col = Math.floor(centerX / TILE_SIZE);
        const row = Math.floor(centerY / TILE_SIZE);
        
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // --- 6. GAME LOOP (VÒNG LẶP CHÍNH) ---
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop); // Gọi lại hàm này vào khung hình tiếp theo
    }

    // Bắt đầu game
    gameLoop();