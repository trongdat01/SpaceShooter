//board
let tileSize = 32;
let rows = 20;
let columns = 32;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

// Thêm biến âm thanh cho đạn của tàu
let shipBulletSound;
let shipBulletSoundPool = []; // Pool âm thanh để quản lý hiệu suất
const MAX_SOUND_POOL_SIZE = 5; // Giảm kích thước pool để tránh quá tải
let lastSoundPlayed = 0; // Dùng để hạn chế tần số phát âm thanh

// Thêm biến để quản lý thời gian giữa các lần bắn
let shootCooldown = 0;
let shootCooldownTime = 15; // Thời gian chờ giữa các lần bắn (tính theo frame)

//aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 0.5;

//bullets
let bulletArray = [];
let bulletVelocityY = -10;

//buff
let buff = null;
let buffVelocityY = 2;
let buffActive = false;
let buffExists = false;
let buffType = null;

// Thêm biến buff riêng cho shipAI
let buffAI = null;
let buffAIVelocityY = 2;
let buffAIActive = false;
let buffAIExists = false;
let buffAIType = null;

let score = 0;
let gameOver = false;

//player stats
let lives = 3;
let shield = 100;
let shieldRegenRate = 0.1;
let isShieldActive = false;

//explosion effects
let explosions = [];
let explosionFrames = 5;
let explosionDuration = 10;

//different alien types
let alienTypes = {
    normal: { health: 1, points: 100, img: "./alien.png", shootRate: 0 },
    shooter: { health: 2, points: 200, img: "./alien-magenta.png", shootRate: 0.002 },
    tank: { health: 3, points: 300, img: "./alien-yellow.png", shootRate: 0 }
};

//alien bullets
let alienBullets = [];
let alienBulletVelocityY = 5;

// Background stars
let stars = [];
let starSpeed = 3;

//game stats
let level = 1;
let experiencePoints = 0;
let experienceToNextLevel = 1000;
let permanentBulletCount = 1; // Số lượng đạn cơ bản
let gameMode = "single"; // "single" or "versus"

//power ups
let powerUpTypes = {
    shield: {
        color: "blue",
        duration: 8000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback vẽ shield nếu không tải được hình ảnh
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
                context.fill();
                context.strokeStyle = "white";
                context.lineWidth = 2;
                context.stroke();

                // Vẽ biểu tượng shield
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 4);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.lineTo(x + width / 2, y + height * 3 / 4);
                context.lineTo(x + width / 4, y + height / 2);
                context.closePath();
                context.strokeStyle = "white";
                context.stroke();
            }
        }
    },
    rapidFire: {
        color: "red",
        duration: 10000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 4);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.lineTo(x + width / 2, y + height / 2);
                context.lineTo(x + width * 3 / 4, y + height * 3 / 4);
                context.strokeStyle = "yellow";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    piercingShot: {
        color: "purple",
        duration: 12000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width / 4, y + height / 2);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.moveTo(x + width * 2 / 3, y + height / 3);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.lineTo(x + width * 2 / 3, y + height * 2 / 3);
                context.strokeStyle = "white";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    bomb: {
        color: "orange",
        duration: 0,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
                context.fill();
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 4);
                context.lineTo(x + width / 2, y + height * 3 / 4);
                context.moveTo(x + width / 4, y + height / 2);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.strokeStyle = "black";
                context.lineWidth = 3;
                context.stroke();
            }
        }
    },
    multiShot: {
        color: "green",
        duration: 8000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                for (let i = 0; i < 3; i++) {
                    context.beginPath();
                    context.moveTo(x + width * (i + 1) / 4, y + height * 3 / 4);
                    context.lineTo(x + width * (i + 1) / 4, y + height / 4);
                    context.lineTo(x + width * (i + 0.7) / 4, y + height / 3);
                    context.moveTo(x + width * (i + 1) / 4, y + height / 4);
                    context.lineTo(x + width * (i + 1.3) / 4, y + height / 3);
                    context.strokeStyle = "white";
                    context.lineWidth = 2;
                    context.stroke();
                }
            }
        }
    },
    permanentBulletUp: {
        color: "cyan",
        duration: 0, // Vĩnh viễn
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.fillStyle = "white";
                context.font = "20px courier";
                context.fillText("+1", x + width / 4, y + height * 2 / 3);
                context.fillStyle = "yellow";
                context.fillRect(x + width / 4, y + height / 4, width / 2, height / 3);
            }
        }
    },
    slowAliens: {
        color: "lightblue",
        duration: 15000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.arc(x + width / 2, y + height / 2, width / 3, 0, Math.PI * 2);
                context.strokeStyle = "white";
                context.lineWidth = 2;
                context.stroke();
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 2);
                context.lineTo(x + width / 2, y + height / 3);
                context.strokeStyle = "white";
                context.stroke();
            }
        }
    }
};

// Power-up riêng cho AI
let powerUpAITypes = {
    shield: {
        color: "blue",
        duration: 8000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback vẽ shield nếu không tải được hình ảnh
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
                context.fill();
                context.strokeStyle = "red"; // Màu đỏ để phân biệt với buff người chơi
                context.lineWidth = 2;
                context.stroke();

                // Vẽ biểu tượng shield
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 4);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.lineTo(x + width / 2, y + height * 3 / 4);
                context.lineTo(x + width / 4, y + height / 2);
                context.closePath();
                context.strokeStyle = "red";
                context.stroke();
            }
        }
    },
    rapidFire: {
        color: "red",
        duration: 10000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 4);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.lineTo(x + width / 2, y + height / 2);
                context.lineTo(x + width * 3 / 4, y + height * 3 / 4);
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    piercingShot: {
        color: "purple",
        duration: 12000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width / 4, y + height / 2);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.moveTo(x + width * 2 / 3, y + height / 3);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.lineTo(x + width * 2 / 3, y + height * 2 / 3);
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    bomb: {
        color: "orange",
        duration: 0,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
                context.fill();
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 4);
                context.lineTo(x + width / 2, y + height * 3 / 4);
                context.moveTo(x + width / 4, y + height / 2);
                context.lineTo(x + width * 3 / 4, y + height / 2);
                context.strokeStyle = "red";
                context.lineWidth = 3;
                context.stroke();
            }
        }
    },
    multiShot: {
        color: "green",
        duration: 8000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                for (let i = 0; i < 3; i++) {
                    context.beginPath();
                    context.moveTo(x + width * (i + 1) / 4, y + height * 3 / 4);
                    context.lineTo(x + width * (i + 1) / 4, y + height / 4);
                    context.lineTo(x + width * (i + 0.7) / 4, y + height / 3);
                    context.moveTo(x + width * (i + 1) / 4, y + height / 4);
                    context.lineTo(x + width * (i + 1.3) / 4, y + height / 3);
                    context.strokeStyle = "red";
                    context.lineWidth = 2;
                    context.stroke();
                }
            }
        }
    },
    permanentBulletUp: {
        color: "cyan",
        duration: 0, // Vĩnh viễn
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.fillStyle = "red";
                context.font = "20px courier";
                context.fillText("+1", x + width / 4, y + height * 2 / 3);
                context.fillStyle = "red";
                context.fillRect(x + width / 4, y + height / 4, width / 2, height / 3);
            }
        }
    },
    slowAliens: {
        color: "lightblue",
        duration: 15000,
        img: null,
        draw: function (context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.arc(x + width / 2, y + height / 2, width / 3, 0, Math.PI * 2);
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();
                context.beginPath();
                context.moveTo(x + width / 2, y + height / 2);
                context.lineTo(x + width / 2, y + height / 3);
                context.strokeStyle = "red";
                context.stroke();
            }
        }
    }
};

// AI ship
let aiShip = {
    x: shipX + boardWidth / 3,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
    active: false,
    score: 0,
    lives: 3,
    shield: 100,
    isShieldActive: false,
    bulletCount: 1,
    difficulty: "medium", // "easy", "medium", "hard"
    shootCooldown: 0,
    moveDirection: 1
};

let aiShipImg;
let aiEnabled = false;
let difficultySettings = {
    easy: {
        shootInterval: 30,
        moveSpeed: 3,
        reactionTime: 0.9,
        accuracy: 0.9
    },
    medium: {
        shootInterval: 25,
        moveSpeed: 3,
        reactionTime: 0.95,
        accuracy: 0.95,
        predictiveAiming: true
    },
    hard: {
        shootInterval: 20,
        moveSpeed: 4,
        reactionTime: 1,
        accuracy: 1,
        predictiveAiming: true,
        seekPowerUps: true
    }
};

let aiBulletArray = [];

// Thêm biến playerName 
let playerName = "Player";

// Thêm biến mới để theo dõi trạng thái versus
let versusResult = null; // Giá trị: "win", "lose", hoặc null

// Thêm biến để theo dõi cách kết thúc game trong chế độ single player
let singlePlayerResult = null; // Giá trị: "win", "lose", hoặc null

// Sửa hàm showPlayerNameDialog để gọi đến showGameModeSelection từ file gamemode.js
function showPlayerNameDialog() {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "name-modal-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Tạo hộp thoại
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "black";
    dialog.style.border = "2px solid white";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "10px";
    dialog.style.width = "300px";
    dialog.style.fontFamily = "courier";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";

    // Tiêu đề
    let title = document.createElement("h2");
    title.textContent = "SPACE SHOOTER";
    title.style.color = "#00ff00";
    title.style.marginBottom = "20px";
    dialog.appendChild(title);

    // Hướng dẫn
    let instructions = document.createElement("p");
    instructions.textContent = "Nhập tên của bạn:";
    dialog.appendChild(instructions);

    // Ô nhập liệu
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Tên của bạn";
    nameInput.maxLength = 10;
    nameInput.style.width = "90%";
    nameInput.style.padding = "8px";
    nameInput.style.margin = "10px 0";
    nameInput.style.backgroundColor = "black";
    nameInput.style.color = "white";
    nameInput.style.border = "1px solid #00ff00";
    dialog.appendChild(nameInput);

    // Nút bắt đầu
    let startButton = document.createElement("button");
    startButton.textContent = "BẮT ĐẦU CHƠI";
    startButton.style.backgroundColor = "#00ff00";
    startButton.style.color = "black";
    startButton.style.border = "none";
    startButton.style.padding = "10px 20px";
    startButton.style.marginTop = "10px";
    startButton.style.cursor = "pointer";
    startButton.style.width = "90%";
    startButton.style.fontFamily = "courier";
    startButton.style.fontWeight = "bold";
    dialog.appendChild(startButton);

    // Nút xem điểm cao thay vì hiển thị điểm cao trực tiếp
    let highScoresButton = document.createElement("button");
    highScoresButton.textContent = "ĐIỂM CAO NHẤT";
    highScoresButton.style.backgroundColor = "#f0c808"; // Màu vàng
    highScoresButton.style.color = "black";
    highScoresButton.style.border = "none";
    highScoresButton.style.padding = "10px 20px";
    highScoresButton.style.marginTop = "10px";
    highScoresButton.style.cursor = "pointer";
    highScoresButton.style.width = "90%";
    highScoresButton.style.fontFamily = "courier";
    highScoresButton.style.fontWeight = "bold";
    dialog.appendChild(highScoresButton);

    // Thêm nút hướng dẫn
    let instructionsButton = document.createElement("button");
    instructionsButton.textContent = "HƯỚNG DẪN";
    instructionsButton.style.backgroundColor = "#4CAF50"; // Màu xanh lá
    instructionsButton.style.color = "black";
    instructionsButton.style.border = "none";
    instructionsButton.style.padding = "10px 20px";
    instructionsButton.style.marginTop = "10px";
    instructionsButton.style.cursor = "pointer";
    instructionsButton.style.width = "90%";
    instructionsButton.style.fontFamily = "courier";
    instructionsButton.style.fontWeight = "bold";
    dialog.appendChild(instructionsButton);

    // Thêm sự kiện
    nameInput.focus();
    startButton.onclick = function () {
        if (nameInput.value.trim() !== "") {
            playerName = nameInput.value.trim();
        }
        document.body.removeChild(modalBackdrop);

        // Thay vì resetGame() ngay, chuyển sang màn hình chọn chế độ chơi
        // Gọi hàm từ gamemode.js
        showGameModeSelection();
    };

    highScoresButton.onclick = function () {
        document.body.removeChild(modalBackdrop);
        showHighScoresScreen();
    };

    // Thêm sự kiện cho nút hướng dẫn
    instructionsButton.onclick = function () {
        document.body.removeChild(modalBackdrop);
        showInstructionsScreen();
    };

    nameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            startButton.click();
        }
    });

    // Thêm vào DOM
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
}

// Khởi tạo highScores
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

// Fix high scores screen display function
function showHighScoresScreen() {
    try {
        // Tạo lớp phủ nền
        let modalBackdrop = document.createElement("div");
        modalBackdrop.id = "highscores-modal-backdrop";
        modalBackdrop.style.position = "fixed";
        modalBackdrop.style.top = "0";
        modalBackdrop.style.left = "0";
        modalBackdrop.style.width = "100%";
        modalBackdrop.style.height = "100%";
        modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        modalBackdrop.style.zIndex = "1001";
        modalBackdrop.style.display = "flex";
        modalBackdrop.style.justifyContent = "center";
        modalBackdrop.style.alignItems = "center";

        // Tạo hộp thoại
        let dialog = document.createElement("div");
        dialog.style.backgroundColor = "black";
        dialog.style.border = "2px solid #f0c808"; // Màu vàng
        dialog.style.padding = "20px";
        dialog.style.borderRadius = "10px";
        dialog.style.width = "400px";
        dialog.style.fontFamily = "courier";
        dialog.style.color = "white";
        dialog.style.textAlign = "center";

        // Tiêu đề
        let title = document.createElement("h2");
        title.textContent = "ĐIỂM CAO NHẤT";
        title.style.color = "#f0c808";
        title.style.marginBottom = "20px";
        dialog.appendChild(title);

        // Hiển thị danh sách điểm cao
        console.log("High scores before displaying:", highScores);

        // Đảm bảo highScores là một mảng hợp lệ
        if (!Array.isArray(highScores)) {
            console.log("High scores is not an array, initializing empty array");
            highScores = [];
        }

        if (highScores.length === 0) {
            let noScores = document.createElement("p");
            noScores.textContent = "Chưa có điểm nào được ghi nhận.";
            noScores.style.margin = "20px 0";
            dialog.appendChild(noScores);
        } else {
            let table = document.createElement("table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.style.marginBottom = "20px";

            // Tạo header
            let headerRow = document.createElement("tr");
            ["HẠNG", "TÊN", "ĐIỂM"].forEach(text => {
                let header = document.createElement("th");
                header.textContent = text;
                header.style.padding = "8px";
                header.style.borderBottom = "1px solid #f0c808";
                headerRow.appendChild(header);
            });
            table.appendChild(headerRow);

            // Hiển thị top 5 điểm cao
            for (let i = 0; i < highScores.length; i++) {
                if (!highScores[i] || typeof highScores[i] !== 'object') {
                    console.log("Invalid score entry at index", i, ":", highScores[i]);
                    continue;
                }

                let row = document.createElement("tr");
                row.style.backgroundColor = i % 2 === 0 ? "rgba(50, 50, 50, 0.5)" : "rgba(30, 30, 30, 0.5)";

                // Cột Hạng
                let rankCell = document.createElement("td");
                rankCell.textContent = (i + 1);
                rankCell.style.padding = "8px";
                rankCell.style.textAlign = "center";
                row.appendChild(rankCell);

                // Cột Tên
                let nameCell = document.createElement("td");
                nameCell.textContent = highScores[i].name || "Không tên";
                nameCell.style.padding = "8px";
                row.appendChild(nameCell);

                // Cột Điểm
                let scoreCell = document.createElement("td");
                scoreCell.textContent = highScores[i].score || 0;
                scoreCell.style.padding = "8px";
                scoreCell.style.textAlign = "right";
                row.appendChild(scoreCell);

                table.appendChild(row);
            }

            dialog.appendChild(table);
        }

        // Container cho các nút
        let buttonsContainer = document.createElement("div");
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.justifyContent = "space-between";
        buttonsContainer.style.gap = "15px";
        buttonsContainer.style.marginTop = "10px";

        // Nút Quay Lại
        let backButton = document.createElement("button");
        backButton.textContent = "QUAY LẠI";
        backButton.style.backgroundColor = "#00bfff"; // Màu xanh dương
        backButton.style.color = "black";
        backButton.style.border = "none";
        backButton.style.padding = "10px 0";
        backButton.style.cursor = "pointer";
        backButton.style.flex = "1";
        backButton.style.fontFamily = "courier";
        backButton.style.fontWeight = "bold";
        backButton.style.borderRadius = "5px";

        // Hiệu ứng hover cho nút Quay Lại
        backButton.onmouseover = function () {
            backButton.style.backgroundColor = "#0095dd";
        };
        backButton.onmouseout = function () {
            backButton.style.backgroundColor = "#00bfff";
        };

        // Nút Đặt Lại
        let resetButton = document.createElement("button");
        resetButton.textContent = "ĐẶT LẠI";
        resetButton.style.backgroundColor = "#ff4500"; // Màu cam đậm
        resetButton.style.color = "white";
        resetButton.style.border = "none";
        resetButton.style.padding = "10px 0";
        resetButton.style.cursor = "pointer";
        resetButton.style.flex = "1";
        resetButton.style.fontFamily = "courier";
        resetButton.style.fontWeight = "bold";
        resetButton.style.borderRadius = "5px";

        // Hiệu ứng hover cho nút Đặt Lại
        resetButton.onmouseover = function () {
            resetButton.style.backgroundColor = "#cc3700";
        };
        resetButton.onmouseout = function () {
            resetButton.style.backgroundColor = "#ff4500";
        };

        // Thêm sự kiện cho nút Quay Lại
        backButton.onclick = function () {
            document.body.removeChild(modalBackdrop);
            showPlayerNameDialog();
        };

        // Thêm sự kiện cho nút Đặt Lại
        resetButton.onclick = function () {
            showConfirmDialog("Bạn có chắc chắn muốn đặt lại tất cả điểm cao nhất không?", function () {
                // Xóa tất cả điểm cao
                highScores = [];
                localStorage.removeItem("highScores");
                console.log("Đã đặt lại tất cả điểm cao");

                // Hiển thị lại màn hình điểm cao
                document.body.removeChild(modalBackdrop);
                showHighScoresScreen();
            });
        };

        // Thêm các nút vào container
        buttonsContainer.appendChild(backButton);
        buttonsContainer.appendChild(resetButton);

        // Thêm container vào dialog
        dialog.appendChild(buttonsContainer);

        // Thêm vào DOM
        modalBackdrop.appendChild(dialog);
        document.body.appendChild(modalBackdrop);
        console.log("High scores screen displayed successfully");
    } catch (error) {
        console.error("Error displaying high scores:", error);
        // Fallback khi có lỗi hiển thị
        alert("Không thể hiển thị điểm cao. Lỗi: " + error.message);
        showPlayerNameDialog(); // Quay lại màn hình nhập tên
    }
}

function createStars() {
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * boardWidth,
            y: Math.random() * boardHeight,
            size: Math.random() * 3,
            speed: 1 + Math.random() * 2
        });
    }
}

function drawBackground() {
    // Vẽ nền đen
    context.fillStyle = "black";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Vẽ các ngôi sao
    stars.forEach(star => {
        context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();

        // Di chuyển sao xuống dưới
        star.y += star.speed;

        // Nếu sao đi ra khỏi màn hình phía dưới, đặt lại vị trí ở trên
        if (star.y > boardHeight) {
            star.y = 0;
            star.x = Math.random() * boardWidth;
        }
    });
}

// Boss và laze
let boss = null;
let bossWidth = tileSize * 4;
let bossHeight = tileSize * 4;
let bossHealth = 50;
let bossMaxHealth = 50;
let bossVelocityX = 2;
let bossLasers = [];
let bossLaserWidth = tileSize * 2;
let bossLaserTimer = 0;
let bossLaserInterval = 300; // 5 seconds (60 frames per second * 5)
let bossLaserCount = 2; // Bắt đầu với 2 đường laser
let isBossFight = false;
let bossDefeated = false;

// Thêm hàm loadInstructionImages trước hàm window.onload
// Thêm hình ảnh cho phần hướng dẫn
function loadInstructionImages() {
    try {
        // Tải hình ảnh cho tàu
        const shipInstrImg = new Image();
        shipInstrImg.src = "./ship.png";
        window.shipInstructionImg = shipInstrImg;

        // Tải hình ảnh cho alien
        const alienInstrImg = new Image();
        alienInstrImg.src = "./alien.png";
        window.alienInstructionImg = alienInstrImg;

        // Tải hình ảnh cho boss
        const bossInstrImg = new Image();
        bossInstrImg.src = "./boss.png";
        window.bossInstructionImg = bossInstrImg;

        // Tải hình ảnh buff cho phần hướng dẫn
        const buffTypes = [
            'shield',
            'rapidFire',
            'piercingShot',
            'multiShot',
            'bomb',
            'permanentBulletUp',
            'slowAliens'
        ];

        window.instructionBuffImages = {};

        buffTypes.forEach(type => {
            const img = new Image();
            img.src = `./buffship/${type}.png`;

            img.onload = function () {
                console.log(`Loaded instruction buff image: ${type}`);
                window.instructionBuffImages[type] = img;
            };

            img.onerror = function () {
                console.error(`Failed to load instruction buff image: ${type}`);

                // Thử lại với tên file viết thường
                const retryImg = new Image();
                retryImg.src = `./buffship/${type.toLowerCase()}.png`;

                retryImg.onload = function () {
                    console.log(`Loaded instruction buff image (lowercase): ${type}`);
                    window.instructionBuffImages[type] = retryImg;
                };

                retryImg.onerror = function () {
                    console.error(`Failed to load instruction buff image with all attempts: ${type}`);
                };
            };
        });

        console.log("Loaded instruction images");
    } catch (error) {
        console.error("Error loading instruction images:", error);
    }
}

// Thêm hàm showInstructionsScreen vì hàm này cũng được gọi trong showPlayerNameDialog nhưng chưa được định nghĩa
function showInstructionsScreen() {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "instructions-modal-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Tạo hộp thoại
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "black";
    dialog.style.border = "2px solid #4CAF50"; // Khung màu xanh lá
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "10px";
    dialog.style.width = "600px";
    dialog.style.maxHeight = "80vh";
    dialog.style.overflowY = "auto";
    dialog.style.fontFamily = "courier";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";

    // Tiêu đề
    let title = document.createElement("h2");
    title.textContent = "HƯỚNG DẪN SPACE SHOOTER";
    title.style.color = "#4CAF50"; // Màu xanh lá
    title.style.marginBottom = "20px";
    dialog.appendChild(title);

    // Nội dung hướng dẫn
    let content = document.createElement("div");
    content.style.textAlign = "left";
    content.style.marginBottom = "20px";

    // Phần điều khiển
    let controlsTitle = document.createElement("h3");
    controlsTitle.textContent = "ĐIỀU KHIỂN";
    controlsTitle.style.color = "#f0c808"; // Màu vàng
    controlsTitle.style.borderBottom = "1px solid #f0c808";
    controlsTitle.style.paddingBottom = "5px";
    content.appendChild(controlsTitle);

    let controlsList = document.createElement("ul");
    controlsList.style.listStyleType = "none";
    controlsList.style.padding = "0 10px";

    let controls = [
        "Mũi tên TRÁI: Di chuyển tàu sang trái",
        "Mũi tên PHẢI: Di chuyển tàu sang phải",
        "SPACE: Bắn đạn",
        "R: Khởi động lại khi game over",
        "ENTER: Khởi động lại khi game over hoặc thắng"
    ];

    controls.forEach(control => {
        let item = document.createElement("li");
        item.textContent = control;
        item.style.margin = "10px 0";
        controlsList.appendChild(item);
    });

    content.appendChild(controlsList);

    // Phần chế độ chơi
    let modesTitle = document.createElement("h3");
    modesTitle.textContent = "CHẾ ĐỘ CHƠI";
    modesTitle.style.color = "#f0c808";
    modesTitle.style.borderBottom = "1px solid #f0c808";
    modesTitle.style.paddingBottom = "5px";
    modesTitle.style.marginTop = "20px";
    content.appendChild(modesTitle);

    let modesList = document.createElement("ul");
    modesList.style.listStyleType = "none";
    modesList.style.padding = "0 10px";

    let modes = [
        "Single Player: Chơi đơn, tiêu diệt alien và boss",
        "Versus AI: Chơi cùng AI, cạnh tranh điểm số"
    ];

    modes.forEach(mode => {
        let item = document.createElement("li");
        item.textContent = mode;
        item.style.margin = "10px 0";
        modesList.appendChild(item);
    });

    content.appendChild(modesList);

    // Phần power-ups
    let powerUpsTitle = document.createElement("h3");
    powerUpsTitle.textContent = "POWER-UPS";
    powerUpsTitle.style.color = "#f0c808";
    powerUpsTitle.style.borderBottom = "1px solid #f0c808";
    powerUpsTitle.style.paddingBottom = "5px";
    powerUpsTitle.style.marginTop = "20px";
    content.appendChild(powerUpsTitle);

    // Tạo bảng power-ups với hình ảnh
    let powerUpsTable = document.createElement("table");
    powerUpsTable.style.width = "100%";
    powerUpsTable.style.borderCollapse = "collapse";
    powerUpsTable.style.marginTop = "10px";

    // Tạo header cho bảng - bỏ cột màu sắc
    let tableHeader = document.createElement("tr");
    ["HÌNH ẢNH", "TÊN", "HIỆU ỨNG"].forEach(headerText => {
        let header = document.createElement("th");
        header.textContent = headerText;
        header.style.padding = "8px";
        header.style.borderBottom = "1px solid #555";
        header.style.textAlign = "left";
        tableHeader.appendChild(header);
    });
    powerUpsTable.appendChild(tableHeader);

    // Danh sách power-ups với hình ảnh và hiệu ứng chi tiết
    let powerUpsList = [
        {
            name: "Shield",
            effect: "Tạo lá chắn bảo vệ tàu khỏi đạn trong 8 giây",
            imgSrc: "./buffship/shield.png"
        },
        {
            name: "Rapid Fire",
            effect: "Tăng gấp đôi tốc độ đạn trong 10 giây",
            imgSrc: "./buffship/rapidFire.png"
        },
        {
            name: "Piercing Shot",
            effect: "Đạn xuyên qua nhiều alien trong 12 giây",
            imgSrc: "./buffship/piercingShot.png"
        },
        {
            name: "Multi Shot",
            effect: "Bắn cùng lúc 3 hướng khác nhau trong 8 giây",
            imgSrc: "./buffship/multiShot.png"
        },
        {
            name: "Bomb",
            effect: "Phá hủy tất cả alien có trên màn hình ngay lập tức",
            imgSrc: "./buffship/bomb.png"
        },
        {
            name: "Bullet Up",
            effect: "Tăng vĩnh viễn số lượng đạn bắn ra mỗi lần",
            imgSrc: "./buffship/permanentBulletUp.png"
        },
        {
            name: "Slow Aliens",
            effect: "Làm chậm di chuyển của alien trong 15 giây",
            imgSrc: "./buffship/slowAliens.png"
        }
    ];

    powerUpsList.forEach((powerUp, index) => {
        let row = document.createElement("tr");
        row.style.backgroundColor = index % 2 === 0 ? "rgba(50, 50, 50, 0.5)" : "rgba(30, 30, 30, 0.5)";
        // Cell cho hình ảnh
        let imgCell = document.createElement("td");
        imgCell.style.padding = "8px";
        imgCell.style.borderBottom = "1px solid #333";
        imgCell.style.width = "64px";

        // Tạo hình ảnh
        let img = document.createElement("img");
        img.src = powerUp.imgSrc;
        img.alt = powerUp.name;
        img.style.width = "32px";
        img.style.height = "32px";
        img.style.display = "block";
        img.style.margin = "0 auto";

        // Xử lý lỗi khi tải hình ảnh
        img.onerror = function () {
            this.onerror = null;
            this.src = powerUp.imgSrc.toLowerCase(); // Thử lại với tên file viết thường

            // Nếu vẫn lỗi, hiển thị placeholder
            this.onerror = function () {
                let placeholder = document.createElement("div");
                placeholder.style.width = "32px";
                placeholder.style.height = "32px";

                // Sử dụng các màu tương ứng với từng loại buff cho placeholder
                switch (powerUp.name) {
                    case "Shield": placeholder.style.backgroundColor = "blue"; break;
                    case "Rapid Fire": placeholder.style.backgroundColor = "red"; break;
                    case "Piercing Shot": placeholder.style.backgroundColor = "purple"; break;
                    case "Multi Shot": placeholder.style.backgroundColor = "green"; break;
                    case "Bomb": placeholder.style.backgroundColor = "orange"; break;
                    case "Bullet Up": placeholder.style.backgroundColor = "cyan"; break;
                    case "Slow Aliens": placeholder.style.backgroundColor = "lightblue"; break;
                    default: placeholder.style.backgroundColor = "gray";
                }

                placeholder.style.margin = "0 auto";
                placeholder.style.borderRadius = "4px";
                placeholder.style.border = "1px solid white";

                imgCell.innerHTML = "";
                imgCell.appendChild(placeholder);
            };
        };

        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Cells cho tên và hiệu ứng (bỏ cột màu sắc)
        ["name", "effect"].forEach(prop => {
            let cell = document.createElement("td");
            cell.textContent = powerUp[prop];
            cell.style.padding = "8px";
            cell.style.borderBottom = "1px solid #333";

            // Điều chỉnh style cho cột hiệu ứng
            if (prop === "effect") {
                cell.style.width = "70%"; // Tăng độ rộng cho cột hiệu ứng
            }

            row.appendChild(cell);
        });

        powerUpsTable.appendChild(row);
    });

    content.appendChild(powerUpsTable);

    // Thêm lưu ý về power-up
    let powerUpNote = document.createElement("p");
    powerUpNote.innerHTML = "<strong>Lưu ý:</strong> Các power-up sẽ rơi xuống khi bạn tiêu diệt alien. Hãy di chuyển tàu để bắt chúng!";
    powerUpNote.style.marginTop = "10px";
    powerUpNote.style.padding = "0 10px";
    powerUpNote.style.fontStyle = "italic";
    powerUpNote.style.color = "#f0c808";
    content.appendChild(powerUpNote);

    // Phần boss fight
    let bossTitle = document.createElement("h3");
    bossTitle.textContent = "BOSS FIGHT";
    bossTitle.style.color = "#f0c808";
    bossTitle.style.borderBottom = "1px solid #f0c808";
    bossTitle.style.paddingBottom = "5px";
    bossTitle.style.marginTop = "20px";
    content.appendChild(bossTitle);

    let bossInfo = document.createElement("p");
    bossInfo.innerHTML = "Khi tiêu diệt đủ số lượng alien, bạn sẽ phải đối mặt với BOSS.<br>BOSS sẽ bắn các tia laser rất mạnh. Hãy né tránh chúng và bắn vào BOSS để giành chiến thắng!";
    bossInfo.style.lineHeight = "1.5";
    bossInfo.style.padding = "0 10px";
    content.appendChild(bossInfo);

    // Phần mẹo
    let tipsTitle = document.createElement("h3");
    tipsTitle.textContent = "MẸO CHƠI";
    tipsTitle.style.color = "#f0c808";
    tipsTitle.style.borderBottom = "1px solid #f0c808";
    tipsTitle.style.paddingBottom = "5px";
    tipsTitle.style.marginTop = "20px";
    content.appendChild(tipsTitle);

    let tipsList = document.createElement("ul");
    tipsList.style.listStyleType = "none";
    tipsList.style.padding = "0 10px";

    let tips = [
        "Ưu tiên tiêu diệt alien loại bắn đạn (màu hồng) trước",
        "Thu thập power-up Bullet Up để tăng sức mạnh vĩnh viễn",
        "Shield rất có giá trị khi đối đầu với boss",
        "Trong chế độ versus, hãy cạnh tranh điểm số với AI"
    ];

    tips.forEach(tip => {
        let item = document.createElement("li");
        item.textContent = "👉 " + tip;
        item.style.margin = "10px 0";
        tipsList.appendChild(item);
    });

    content.appendChild(tipsList);

    dialog.appendChild(content);

    // Nút Quay Lại
    let backButton = document.createElement("button");
    backButton.textContent = "QUAY LẠI";
    backButton.style.backgroundColor = "#00bfff"; // Màu xanh dương
    backButton.style.color = "black";
    backButton.style.border = "none";
    backButton.style.padding = "10px 20px";
    backButton.style.marginTop = "20px";
    backButton.style.cursor = "pointer";
    backButton.style.width = "90%";
    backButton.style.fontFamily = "courier";
    backButton.style.fontWeight = "bold";
    dialog.appendChild(backButton);

    // Thêm sự kiện
    backButton.onclick = function () {
        document.body.removeChild(modalBackdrop);
        showPlayerNameDialog();
    };

    // Thêm vào DOM
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
}

// Thêm hàm flashWarning cho boss lasers
function flashWarning() {
    // Hiệu ứng nhấp nháy cảnh báo khi boss sắp bắn laser
    let warningFlash = document.createElement("div");
    warningFlash.style.position = "fixed";
    warningFlash.style.top = "0";
    warningFlash.style.left = "0";
    warningFlash.style.width = "100%";
    warningFlash.style.height = "100%";
    warningFlash.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
    warningFlash.style.zIndex = "1000";
    warningFlash.style.pointerEvents = "none"; // Cho phép click qua flash
    document.body.appendChild(warningFlash);

    // Hiển thị text cảnh báo
    let warningText = document.createElement("div");
    warningText.textContent = "CẢNH BÁO! LASER SẮP BẮN!";
    warningText.style.position = "fixed";
    warningText.style.top = "50%";
    warningText.style.left = "50%";
    warningText.style.transform = "translate(-50%, -50%)";
    warningText.style.color = "red";
    warningText.style.fontFamily = "courier";
    warningText.style.fontSize = "30px";
    warningText.style.fontWeight = "bold";
    warningText.style.textAlign = "center";
    warningText.style.textShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
    warningFlash.appendChild(warningText);

    // Nhấp nháy và xóa sau một khoảng thời gian
    let opacity = 1;
    let fadeInterval = setInterval(() => {
        opacity = opacity === 1 ? 0.5 : 1;
        warningFlash.style.opacity = opacity;
    }, 200);

    setTimeout(() => {
        clearInterval(fadeInterval);
        document.body.removeChild(warningFlash);
    }, 2000);

    // Thêm debug info vào console
    if (aiEnabled) {
        console.log("AI status check - active:", aiShip.active,
            "difficulty:", aiShip.difficulty,
            "position:", aiShip.x, aiShip.y);
    }
}

// Thêm function hiển thị hộp thoại xác nhận tùy chỉnh
function showConfirmDialog(message, onConfirm, onCancel) {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "confirm-modal-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Tạo hộp thoại
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "black";
    dialog.style.border = "2px solid #ff4500"; // Màu cam đậm giống nút restart
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "10px";
    dialog.style.width = "350px";
    dialog.style.fontFamily = "courier";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";
    dialog.style.boxShadow = "0 0 20px rgba(255, 69, 0, 0.4)";

    // Biểu tượng cảnh báo
    let warningIcon = document.createElement("div");
    warningIcon.innerHTML = "⚠️";
    warningIcon.style.fontSize = "40px";
    warningIcon.style.marginBottom = "15px";
    dialog.appendChild(warningIcon);

    // Thông điệp xác nhận
    let messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.fontSize = "18px";
    messageElement.style.marginBottom = "20px";
    dialog.appendChild(messageElement);

    // Container cho các nút
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.gap = "15px";

    // Nút "Có"
    let confirmButton = document.createElement("button");
    confirmButton.textContent = "Có";
    confirmButton.style.flex = "1";
    confirmButton.style.backgroundColor = "#4CAF50"; // Màu xanh lá
    confirmButton.style.color = "white";
    confirmButton.style.border = "none";
    confirmButton.style.padding = "10px 15px";
    confirmButton.style.borderRadius = "5px";
    confirmButton.style.cursor = "pointer";
    confirmButton.style.fontFamily = "courier";
    confirmButton.style.fontWeight = "bold";
    confirmButton.style.fontSize = "16px";

    // Hiệu ứng hover cho nút Có
    confirmButton.onmouseover = function () {
        confirmButton.style.backgroundColor = "#45a049";
    };
    confirmButton.onmouseout = function () {
        confirmButton.style.backgroundColor = "#4CAF50";
    };

    confirmButton.onclick = function () {
        document.body.removeChild(modalBackdrop);
        if (onConfirm) onConfirm();
    };
    buttonContainer.appendChild(confirmButton);

    // Nút "Không"
    let cancelButton = document.createElement("button");
    cancelButton.textContent = "Không";
    cancelButton.style.flex = "1";
    cancelButton.style.backgroundColor = "#f44336"; // Màu đỏ
    cancelButton.style.color = "white";
    cancelButton.style.border = "none";
    cancelButton.style.padding = "10px 15px";
    cancelButton.style.borderRadius = "5px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontFamily = "courier";
    cancelButton.style.fontWeight = "bold";
    cancelButton.style.fontSize = "16px";

    // Hiệu ứng hover cho nút Không
    cancelButton.onmouseover = function () {
        cancelButton.style.backgroundColor = "#da190b";
    };
    cancelButton.onmouseout = function () {
        cancelButton.style.backgroundColor = "#f44336";
    };

    cancelButton.onclick = function () {
        document.body.removeChild(modalBackdrop);
        if (onCancel) onCancel();
    };
    buttonContainer.appendChild(cancelButton);

    dialog.appendChild(buttonContainer);
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
}

window.onload = function () {
    try {
        board = document.getElementById("board");
        if (!board) {
            console.error("Canvas element 'board' not found!");
            return;
        }

        board.width = boardWidth;
        board.height = boardHeight;
        context = board.getContext("2d");

        if (!context) {
            console.error("Could not get 2D context from canvas!");
            return;
        }

        //load tất cả hình ảnh alien
        for (let type in alienTypes) {
            let img = new Image();
            img.src = alienTypes[type].img;
            img.onload = function () {
                console.log(`Loaded alien image: ${type}`);
                alienTypes[type].imgObject = img;
            };
            img.onerror = function () {
                console.error(`Failed to load alien image: ${type} from ${alienTypes[type].img}`);
            };
        }

        shipImg = new Image();
        shipImg.src = "./ship.png";
        shipImg.onload = function () {
            context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
        }

        aiShipImg = new Image();
        aiShipImg.src = "./shipAI.png"; // Cập nhật đường dẫn ảnh cho tàu AI
        aiShipImg.onerror = function () {
            aiShipImg.src = "./ship.png"; // Fallback nếu không có hình ảnh riêng
        };

        // Khởi tạo giá trị mặc định cho các thuộc tính của aiShip
        aiShip.bulletSpeedMultiplier = 1;
        aiShip.hasMultiShot = false;

        createStars();
        createAliens();
        setupGameMenu();

        // Tải điểm cao từ localStorage một cách an toàn và kỹ lưỡng
        try {
            console.log("Attempting to load high scores from localStorage");
            const savedScores = localStorage.getItem("highScores");
            if (savedScores) {
                console.log("Raw saved scores:", savedScores);
                try {
                    highScores = JSON.parse(savedScores);
                    console.log("Parsed high scores:", highScores);

                    // Kiểm tra xem highScores có phải là một mảng hay không
                    if (!Array.isArray(highScores)) {
                        console.warn("Loaded high scores is not an array, resetting to empty array");
                        highScores = [];
                    }

                    // Chuyển đổi định dạng cũ (chỉ số điểm) sang định dạng mới (đối tượng với tên và điểm)
                    highScores = highScores.map(item => {
                        if (typeof item === "number") {
                            return { name: "Không tên", score: item };
                        } else if (typeof item === "object" && item !== null) {
                            return item;
                        } else {
                            return { name: "Không tên", score: 0 };
                        }
                    });

                    // Lọc ra các bản ghi không hợp lệ
                    highScores = highScores.filter(item =>
                        item && typeof item === "object" && typeof item.score === "number"
                    );

                    // Sắp xếp lại theo điểm số giảm dần
                    highScores.sort((a, b) => b.score - a.score);

                    console.log("Processed high scores:", highScores);
                } catch (parseError) {
                    console.error("Error parsing high scores:", parseError);
                    highScores = [];
                }
            } else {
                console.log("No saved high scores found");
                highScores = [];
            }

            // Khởi tạo với mảng rỗng nếu không tồn tại
            if (!highScores) {
                console.log("High scores is null/undefined, initializing empty array");
                highScores = [];
            }
        } catch (e) {
            console.error("Error loading high scores:", e);
            highScores = [];
        }

        // Tải tất cả hình ảnh cho buff
        loadAllBuffImages();

        // Tải hình ảnh cho hướng dẫn
        loadInstructionImages();

        // Hiển thị hộp thoại nhập tên
        showPlayerNameDialog();

        // Khởi tạo âm thanh đạn của tàu với cách tiếp cận tối ưu hơn
        window.game_paused = false;

        // Khởi tạo pool âm thanh để giảm lag
        for (let i = 0; i < MAX_SOUND_POOL_SIZE; i++) {
            let sound = new Audio("./sounds/soundShip.mp4");
            sound.volume = 0.5;
            sound.preload = "auto"; // Đảm bảo âm thanh được tải trước
            sound.load(); // Tải âm thanh ngay lập tức
            shipBulletSoundPool.push(sound);
        }

        console.log("Game initialized successfully");

        // Vòng lặp game sẽ bắt đầu sau khi người chơi nhập tên
        requestAnimationFrame(update);
        document.addEventListener("keydown", moveShip);
        document.addEventListener("keydown", shoot);

        // Thêm xử lý khi tab/cửa sổ bị ẩn để tạm dừng game
        document.addEventListener("visibilitychange", function () {
            window.game_paused = document.hidden;
            if (!document.hidden) {
                requestAnimationFrame(update);
            }
        });

        // Khởi tạo biến boss fight
        boss = null;
        bossHealth = bossMaxHealth;
        bossLasers = [];
        bossLaserTimer = 0;
        bossLaserCount = 2;
        isBossFight = false;
        bossDefeated = false;
    } catch (error) {
        console.error("Error in initialization:", error);
        alert("Có lỗi xảy ra khi khởi tạo game. Vui lòng kiểm tra console để biết thêm chi tiết.");
    }
}


// Thêm event listener cho phím Enter để bắt đầu lại game giống với nút "Bắt đầu lại"
window.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (gameOver || bossDefeated || versusResult)) {
        // Thay thế confirm bằng hộp thoại tùy chỉnh
        showConfirmDialog("Bạn có chắc chắn muốn bắt đầu lại trò chơi?", function () {
            showPlayerNameDialog();
        });
    }
});

function setupGameMenu() {
    // Xóa menu cũ nếu đã tồn tại
    let existingMenu = document.getElementById("game-menu");
    if (existingMenu) {
        existingMenu.remove();
    }

    // Tạo menu chọn chế độ chơi và độ khó
    let menuDiv = document.createElement("div");
    menuDiv.id = "game-menu";
    menuDiv.style.position = "absolute";
    menuDiv.style.top = "10px";
    menuDiv.style.right = "10px";
    menuDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    menuDiv.style.padding = "10px";
    menuDiv.style.borderRadius = "5px";
    menuDiv.style.color = "white";
    menuDiv.style.fontFamily = "courier";
    menuDiv.style.zIndex = "1000";

    // Chọn chế độ chơi
    let modeLabel = document.createElement("div");
    modeLabel.textContent = "Game Mode:";
    menuDiv.appendChild(modeLabel);

    let modeSelect = document.createElement("select");
    modeSelect.id = "game-mode";
    modeSelect.style.margin = "5px 0";
    modeSelect.style.padding = "3px";
    modeSelect.style.width = "100%";

    let singleOption = document.createElement("option");
    singleOption.value = "single";
    singleOption.textContent = "Single Player";
    modeSelect.appendChild(singleOption);

    let versusOption = document.createElement("option");
    versusOption.value = "versus";
    versusOption.textContent = "Versus AI";
    modeSelect.appendChild(versusOption);

    menuDiv.appendChild(modeSelect);

    // Chọn độ khó
    let diffLabel = document.createElement("div");
    diffLabel.textContent = "AI Difficulty:";
    menuDiv.appendChild(diffLabel);

    let diffSelect = document.createElement("select");
    diffSelect.id = "ai-difficulty";
    diffSelect.style.margin = "5px 0";
    diffSelect.style.padding = "3px";
    diffSelect.style.width = "100%";

    let easyOption = document.createElement("option");
    easyOption.value = "easy";
    easyOption.textContent = "Easy";
    diffSelect.appendChild(easyOption);

    let mediumOption = document.createElement("option");
    mediumOption.value = "medium";
    mediumOption.textContent = "Medium";
    diffSelect.appendChild(mediumOption);

    let hardOption = document.createElement("option");
    hardOption.value = "hard";
    hardOption.textContent = "Hard";
    diffSelect.appendChild(hardOption);

    menuDiv.appendChild(diffSelect);

    // Nút áp dụng
    let applyButton = document.createElement("button");
    applyButton.textContent = "Apply";
    applyButton.style.margin = "5px 0";
    applyButton.style.padding = "5px 10px";
    applyButton.style.width = "100%";
    applyButton.style.cursor = "pointer";
    applyButton.addEventListener("click", function () {
        gameMode = modeSelect.value;
        aiShip.difficulty = diffSelect.value;
        aiEnabled = (gameMode === "versus");

        // Reset game khi thay đổi chế độ
        resetGame();

        if (aiEnabled) {
            aiShip.active = true;
            console.log("AI enabled with difficulty: " + aiShip.difficulty);
        } else {
            aiShip.active = false;
            console.log("AI disabled");
        }
    });
    menuDiv.appendChild(applyButton);

    // Thêm nút bắt đầu lại mới luôn hiển thị trong menu
    let restartGameButton = document.createElement("button");
    restartGameButton.textContent = "BẮT ĐẦU LẠI";
    restartGameButton.style.margin = "5px 0";
    restartGameButton.style.padding = "5px 10px";
    restartGameButton.style.width = "100%";
    restartGameButton.style.backgroundColor = "#ff4500";  // Màu cam đậm để nổi bật
    restartGameButton.style.color = "white";
    restartGameButton.style.border = "none";
    restartGameButton.style.borderRadius = "3px";
    restartGameButton.style.cursor = "pointer";
    restartGameButton.style.fontWeight = "bold";

    // Thêm hiệu ứng hover
    restartGameButton.onmouseover = function () {
        restartGameButton.style.backgroundColor = "#cc3700";
    };
    restartGameButton.onmouseout = function () {
        restartGameButton.style.backgroundColor = "#ff4500";
    };

    // Thêm sự kiện click
    restartGameButton.addEventListener("click", function () {
        // Thay thế confirm bằng hộp thoại tùy chỉnh
        showConfirmDialog("Bạn có chắc chắn muốn bắt đầu lại trò chơi?", function () {
            showPlayerNameDialog();
        });
    });
    menuDiv.appendChild(restartGameButton);

    // Thêm nút trợ giúp debug vào menu game
    if (window.location.search.includes('debug=true')) {
        let debugButton = document.createElement("button");
        debugButton.textContent = "Debug: Start Boss";
        debugButton.style.margin = "5px 0";
        debugButton.style.padding = "5px 10px";
        debugButton.style.width = "100%";
        debugButton.style.backgroundColor = "#ff00ff";
        debugButton.style.color = "white";
        debugButton.style.border = "none";
        debugButton.style.cursor = "pointer";

        debugButton.onclick = function () {
            console.log("Debug: Manual boss fight activation");
            alienColumns = 7; // Đủ để kích hoạt boss fight
            alienCount = 0; // Giả vờ rằng tất cả alien đã bị tiêu diệt
        };

        menuDiv.appendChild(debugButton);
    }

    document.body.appendChild(menuDiv);
}

function update() {
    // Sử dụng requestAnimationFrame với throttle để tránh quá tải CPU
    if (!window.game_paused) {
        requestAnimationFrame(update);
    }

    // Giảm thời gian cooldown bắn đạn
    if (shootCooldown > 0) {
        shootCooldown--;
    }

    // Xử lý màn hình game over trong chế độ single player
    if (gameOver && !aiEnabled) {
        context.fillStyle = "black";
        context.fillRect(0, 0, boardWidth, boardHeight);

        // Vẽ các ngôi sao làm nền
        stars.forEach(star => {
            context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();

            // Di chuyển sao chậm hơn
            star.y += star.speed * 0.3;
            if (star.y > boardHeight) {
                star.y = 0;
                star.x = Math.random() * boardWidth;
            }
        });

        // Hiển thị thông báo game over
        context.fillStyle = "#ff0000"; // Màu đỏ cho thất bại
        context.font = "32px courier bold";
        context.fillText("BẠN ĐÃ BỊ TIÊU DIỆT", boardWidth / 2 - 180, boardHeight / 2 - 80);

        context.font = "16px courier";
        // Hiển thị điểm và tên người chơi
        context.fillText(playerName + ": " + score + " điểm", boardWidth / 2 - 100, boardHeight / 2 - 40);

        // Hiển thị top 5 điểm cao với kiểm tra hợp lệ
        context.fillStyle = "white";
        context.fillText("High Scores:", boardWidth / 2 - 100, boardHeight / 2);

        if (Array.isArray(highScores)) {
            for (let i = 0; i < Math.min(5, highScores.length); i++) {
                let displayText;
                if (!highScores[i]) continue;

                if (typeof highScores[i] === "number") {
                    displayText = (i + 1) + ". Không tên: " + highScores[i];
                } else if (typeof highScores[i] === "object" && highScores[i].name) {
                    displayText = (i + 1) + ". " + highScores[i].name + ": " + highScores[i].score;
                } else {
                    continue; // Bỏ qua các mục không hợp lệ
                }
                context.fillText(displayText, boardWidth / 2 - 100, boardHeight / 2 + 30 + i * 20);
            }
        }

        // Hiển thị thông báo về nút restart và phím Enter
        context.fillStyle = "yellow";
        context.fillText("Nhấn vào nút 'BẮT ĐẦU LẠI' hoặc phím Enter để chơi lại", boardWidth / 2 - 230, boardHeight / 2 + 140);

        return;
    }

    // Xử lý màn hình kết quả versus khi có kết quả
    if (aiEnabled && (versusResult || gameOver)) {
        context.fillStyle = "black";
        context.fillRect(0, 0, boardWidth, boardHeight);

        // Vẽ các ngôi sao làm nền
        stars.forEach(star => {
            context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();

            // Di chuyển sao chậm hơn
            star.y += star.speed * 0.3;
            if (star.y > boardHeight) {
                star.y = 0;
                star.x = Math.random() * boardWidth;
            }
        });

        // Hiển thị tiêu đề thắng/thua
        let resultText, resultColor;
        if (versusResult === "win") {
            resultText = "BẠN ĐÃ THẮNG";
            resultColor = "#00ff00"; // Màu xanh lá cho chiến thắng
        } else {
            resultText = "BẠN ĐÃ THUA";
            resultColor = "#ff0000"; // Màu đỏ cho thất bại
        }

        context.fillStyle = resultColor;
        context.font = "48px courier bold";
        context.textAlign = "center";
        context.fillText(resultText, boardWidth / 2, boardHeight / 2 - 80);
        context.textAlign = "start"; // Reset text align

        // Hiển thị điểm số của người chơi và AI
        context.fillStyle = "white";
        context.font = "20px courier";
        context.textAlign = "center";
        context.fillText(`${playerName}: ${score} điểm`, boardWidth / 2, boardHeight / 2);
        context.fillText(`AI: ${aiShip.score} điểm`, boardWidth / 2, boardHeight / 2 + 30);
        context.textAlign = "start"; // Reset text align

        // Hiển thị chênh lệch điểm số
        let scoreDiff = Math.abs(score - aiShip.score);
        let leadingText = score > aiShip.score ?
            `Bạn dẫn trước ${scoreDiff} điểm` :
            `AI dẫn trước ${scoreDiff} điểm`;

        if (score === aiShip.score) leadingText = "Hòa điểm";

        context.fillStyle = "#f0c808"; // Màu vàng
        context.font = "16px courier";
        context.textAlign = "center";
        context.fillText(leadingText, boardWidth / 2, boardHeight / 2 + 60);
        context.textAlign = "start"; // Reset text align

        // Hiển thị thông báo về nút restart và phím Enter
        context.fillStyle = "yellow";
        context.font = "16px courier";
        context.textAlign = "center";
        context.fillText("Nhấn vào nút 'BẮT ĐẦU LẠI' hoặc phím Enter để chơi lại", boardWidth / 2, boardHeight / 2 + 100);
        context.textAlign = "start"; // Reset text align

        // Cập nhật điểm cao nếu chưa cập nhật
        updateHighScores();

        return;
    }

    // Hiển thị màn hình victory khi boss bị đánh bại trong chế độ single player
    if (bossDefeated && !aiEnabled) {
        context.fillStyle = "black";
        context.fillRect(0, 0, boardWidth, boardHeight);

        // Vẽ các ngôi sao làm nền
        stars.forEach(star => {
            context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();

            // Di chuyển sao chậm hơn
            star.y += star.speed * 0.3;
            if (star.y > boardHeight) {
                star.y = 0;
                star.x = Math.random() * boardWidth;
            }
        });

        // Thay "VICTORY!" bằng "BẠN ĐÃ THẮNG"
        context.fillStyle = "#00ff00"; // Màu xanh lá cho chiến thắng
        context.font = "48px courier bold";
        context.textAlign = "center";
        context.fillText("BẠN ĐÃ THẮNG", boardWidth / 2, boardHeight / 2 - 50);
        context.textAlign = "start"; // Reset text align

        context.fillStyle = "white";
        context.font = "20px courier";
        context.textAlign = "center";
        context.fillText("Điểm của bạn: " + score, boardWidth / 2, boardHeight / 2);
        context.textAlign = "start"; // Reset text align

        // Hiển thị thông báo về nút restart và phím Enter
        context.fillStyle = "yellow";
        context.font = "16px courier";
        context.textAlign = "center";
        context.fillText("Nhấn vào nút 'BẮT ĐẦU LẠI' hoặc phím Enter để chơi lại", boardWidth / 2, boardHeight / 2 + 50);
        context.textAlign = "start"; // Reset text align

        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Vẽ background với hiệu ứng sao
    drawBackground();

    //vẽ tàu
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Vẽ tàu AI nếu đang ở chế độ versus
    if (aiEnabled && aiShip.active) {
        context.drawImage(aiShipImg, aiShip.x, aiShip.y, aiShip.width, aiShip.height);

        // Vẽ shield cho AI nếu active
        if (aiShip.isShieldActive) {
            context.strokeStyle = "rgba(255, 0, 0, 0.5)";
            context.lineWidth = 2;
            context.beginPath();
            context.arc(aiShip.x + aiShip.width / 2, aiShip.y + aiShip.height / 2, aiShip.width / 1.5, 0, 2 * Math.PI);
            context.stroke();
        }

        // Cập nhật AI
        updateAI();
    }

    //vẽ shield nếu active
    if (isShieldActive) {
        context.strokeStyle = "rgba(0, 255, 255, 0.5)";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(ship.x + ship.width / 2, ship.y + ship.height / 2, ship.width / 1.5, 0, 2 * Math.PI);
        context.stroke();
    }

    //hồi shield
    if (shield < 100) {
        shield = Math.min(100, shield + shieldRegenRate);
    }

    // Hồi shield cho AI
    if (aiEnabled && aiShip.shield < 100) {
        aiShip.shield = Math.min(100, aiShip.shield + shieldRegenRate);
    }

    //vẽ aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //di chuyển aliens
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }

            //vẽ alien với hình ảnh tương ứng
            context.drawImage(alien.type.imgObject, alien.x, alien.y, alien.width, alien.height);

            //alien bắn đạn
            if (alien.type.shootRate > 0 && Math.random() < alien.type.shootRate) {
                alienBullets.push({
                    x: alien.x + alien.width / 2,
                    y: alien.y + alien.height,
                    width: tileSize / 8,
                    height: tileSize / 2
                });
            }

            if (alien.y >= ship.y) {
                gameOver = true;
                singlePlayerResult = "lose";
            }
        }
    }

    // Xử lý boss fight
    if (isBossFight && boss) {
        // Di chuyển boss
        boss.x += bossVelocityX;
        if (boss.x <= 0 || boss.x + boss.width >= boardWidth) {
            bossVelocityX *= -1;
        }

        // Vẽ boss
        try {
            if (boss.img && boss.img.complete) {
                context.drawImage(boss.img, boss.x, boss.y, boss.width, boss.height);
            } else {
                // Fallback nếu hình ảnh không được tải
                context.fillStyle = "red";
                context.fillRect(boss.x, boss.y, boss.width, boss.height);
                context.fillStyle = "white";
                context.font = "20px courier";
                context.textAlign = "center";
                context.fillText("BOSS", boss.x + boss.width / 2, boss.y + boss.height / 2);
                context.textAlign = "start"; // Reset text align
            }
        } catch (e) {
            console.error("Error drawing boss:", e);
            // Fallback đơn giản
            context.fillStyle = "red";
            context.fillRect(boss.x, boss.y, boss.width, boss.height);
        }

        // Tăng bộ đếm thời gian để bắn laser
        bossLaserTimer++;
        if (bossLaserTimer >= bossLaserInterval) {
            bossLaserTimer = 0;
            createBossLasers();
        }

        // Cập nhật và vẽ các laser
        updateBossLasers();

        // Vẽ thanh máu
        drawBossHealthBar();
    }
    // Xử lý alien bình thường
    else {
        // Tạo wave mới khi hết alien
        if (alienCount == 0) {
            score += alienColumns * alienRows * 100;
            if (aiEnabled && aiShip.active) {
                aiShip.score += alienColumns * alienRows * 50;
            }

            // Sửa điều kiện bắt đầu boss fight
            if (alienColumns >= 6 || level >= 5) { // Giảm số cột xuống 6 hoặc khi đạt cấp độ 5
                console.log("Starting boss fight, alienColumns =", alienColumns, "level =", level);
                startBossFight();
            } else {
                alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
                alienRows = Math.min(alienRows + 1, rows - 4);
                alienVelocityX += alienVelocityX > 0 ? 0.5 : -0.5;
                alienArray = [];
                bulletArray = [];
                aiBulletArray = [];
                createAliens();
            }
        }
    }

    //update và vẽ đạn của người chơi
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Kiểm tra va chạm với aliens
        if (!isBossFight) {
            for (let j = 0; j < alienArray.length; j++) {
                let alien = alienArray[j];
                if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                    alien.health--;
                    if (alien.health <= 0) {
                        bullet.used = true;
                        alien.alive = false;
                        alienCount--;
                        score += alien.type.points;
                        gainExperience(alien.type.points / 10);

                        //tạo hiệu ứng nổ
                        explosions.push({
                            x: alien.x,
                            y: alien.y,
                            frame: 0,
                            duration: explosionDuration
                        });

                        if (Math.random() < 0.2 && !buffExists) spawnBuff(alien.x, alien.y);
                    }
                    if (!bullet.piercing) bullet.used = true;
                }
            }
        }
        // Kiểm tra va chạm với boss
        else if (boss && !bullet.used && detectCollision(bullet, boss)) {
            bossHealth -= 1; // Mỗi đạn gây 1 damage
            bullet.used = true;

            // Thêm 1000 điểm khi bắn trúng boss
            score += 1000;

            // Hiệu ứng nổ nhỏ khi đạn trúng boss
            explosions.push({
                x: bullet.x,
                y: bullet.y,
                frame: 0,
                duration: explosionDuration / 2,
                size: 0.5  // Kích thước nhỏ hơn
            });

            // Kiểm tra nếu boss bị tiêu diệt
            if (bossHealth <= 0) {
                // Boss bị đánh bại
                createBossExplosion(); // Tạo hiệu ứng nổ lớn

                if (aiEnabled) {
                    // Trong chế độ versus, quyết định thắng thua dựa vào điểm số
                    versusResult = (score >= aiShip.score) ? "win" : "lose";

                    // Nếu điểm bằng nhau thì người chơi thắng
                    if (score === aiShip.score) {
                        versusResult = "win";
                    }
                } else {
                    // Chế độ single player
                    score += 100000; // Cộng điểm khi đánh bại boss
                    bossDefeated = true;
                    singlePlayerResult = "win";
                }

                boss = null;
                updateHighScores();
            }
        }
    }

    // Update và vẽ đạn của AI
    if (aiEnabled) {
        for (let i = 0; i < aiBulletArray.length; i++) {
            let bullet = aiBulletArray[i];
            bullet.x += bullet.velocityX;
            bullet.y += bullet.velocityY;
            context.fillStyle = "red";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            // Kiểm tra va chạm với aliens khi không phải boss fight
            if (!isBossFight) {
                for (let j = 0; j < alienArray.length; j++) {
                    let alien = alienArray[j];
                    if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                        alien.health--;
                        if (alien.health <= 0) {
                            bullet.used = true;
                            alien.alive = false;
                            alienCount--;
                            aiShip.score += alien.type.points;

                            // Tạo hiệu ứng nổ
                            explosions.push({
                                x: alien.x,
                                y: alien.y,
                                frame: 0,
                                duration: explosionDuration
                            });

                            // Rơi buff cho AI với xác suất 20%
                            if (Math.random() < 0.2 && !buffAIExists) {
                                spawnBuff(alien.x, alien.y, true); // true = dành cho AI
                            }
                        }
                        if (!bullet.piercing) bullet.used = true;
                    }
                }
            }
            // Kiểm tra va chạm với boss
            else if (boss && !bullet.used && detectCollision(bullet, boss)) {
                bossHealth -= 1; // Mỗi đạn gây 1 damage
                bullet.used = true;

                // Thưởng điểm cho AI khi bắn trúng boss
                aiShip.score += 1000;

                // Hiệu ứng nổ nhỏ khi đạn trúng boss
                explosions.push({
                    x: bullet.x,
                    y: bullet.y,
                    frame: 0,
                    duration: explosionDuration / 2,
                    size: 0.5  // Kích thước nhỏ hơn
                });

                // Kiểm tra nếu boss bị tiêu diệt
                if (bossHealth <= 0) {
                    // Boss bị đánh bại
                    createBossExplosion(); // Tạo hiệu ứng nổ lớn

                    if (aiEnabled) {
                        // Trong chế độ versus, quyết định thắng thua dựa vào điểm số
                        versusResult = (score >= aiShip.score) ? "win" : "lose";

                        // Nếu điểm bằng nhau thì người chơi thắng
                        if (score === aiShip.score) {
                            versusResult = "win";
                        }
                    } else {
                        // Chế độ single player
                        score += 100000; // Cộng điểm khi đánh bại boss
                        bossDefeated = true;
                        singlePlayerResult = "win";
                    }

                    boss = null;
                    updateHighScores();
                }
            }
        }

        // Xóa đạn AI đã sử dụng
        while (aiBulletArray.length > 0 && (aiBulletArray[0].used || aiBulletArray[0].y < 0)) {
            aiBulletArray.shift();
        }
    }

    //update và vẽ đạn của alien
    for (let i = alienBullets.length - 1; i >= 0; i--) {
        let bullet = alienBullets[i];
        bullet.y += alienBulletVelocityY;
        context.fillStyle = "red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //kiểm tra va chạm với tàu người chơi
        if (detectCollision(bullet, ship)) {
            if (isShieldActive) {
                shield -= 20;
                if (shield <= 0) {
                    isShieldActive = false;
                }
            } else {
                lives--;
                if (lives <= 0) {
                    if (aiEnabled) {
                        // Nếu người chơi bị tiêu diệt trong chế độ versus
                        if (aiShip.lives > 0) {
                            // AI vẫn còn sống, người chơi thua
                            versusResult = "lose";
                        } else {
                            // Cả hai đã bị tiêu diệt, so sánh điểm
                            versusResult = (score >= aiShip.score) ? "win" : "lose";
                        }
                    } else {
                        // Nếu ở chế độ single player
                        gameOver = true;
                        singlePlayerResult = "lose";
                    }
                    updateHighScores();
                }
            }
            alienBullets.splice(i, 1);
        }
        // Kiểm tra va chạm với tàu AI
        else if (aiEnabled && aiShip.active && detectCollision(bullet, aiShip)) {
            if (aiShip.isShieldActive) {
                aiShip.shield -= 20;
                if (aiShip.shield <= 0) {
                    aiShip.isShieldActive = false;
                }
            } else {
                aiShip.lives--;
                if (aiShip.lives <= 0) {
                    aiShip.active = false;

                    // Nếu AI bị tiêu diệt
                    if (lives > 0) {
                        // Người chơi vẫn còn sống, người chơi thắng
                        versusResult = "win";
                    } else {
                        // Cả hai đã bị tiêu diệt, so sánh điểm
                        versusResult = (score >= aiShip.score) ? "win" : "lose";
                    }
                }
            }
            alienBullets.splice(i, 1);
        }
        else if (bullet.y > boardHeight) {
            alienBullets.splice(i, 1);
        }
    }

    //update và vẽ hiệu ứng nổ
    updateExplosions();

    //xóa đạn đã sử dụng
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    //update và vẽ power-up
    if (buff) {
        buff.y += buffVelocityY;
        powerUpTypes[buff.type].draw(context, buff.x, buff.y, buff.width, buff.height);

        // Chỉ cho phép tàu người chơi nhận buff người chơi
        if (detectCollision(ship, buff)) {
            activateBuff(ship);
        }

        if (buff.y > boardHeight) {
            buff = null;
            buffExists = false;
        }
    }

    // Vẽ và xử lý buff AI
    if (buffAI && aiEnabled) {
        buffAI.y += buffAIVelocityY;
        powerUpAITypes[buffAI.type].draw(context, buffAI.x, buffAI.y, buffAI.width, buffAI.height);

        // Chỉ cho phép AI nhận buff AI
        if (aiShip.active && detectCollision(aiShip, buffAI)) {
            activateAIBuff();
        }

        if (buffAI.y > boardHeight) {
            buffAI = null;
            buffAIExists = false;
        }
    }

    //vẽ UI
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText("Score: " + score, 5, 20);
    context.fillText("Lives: " + lives, 5, 40);
    context.fillText("Shield: " + Math.floor(shield) + "%", 5, 60);
    context.fillText("Bullets: " + permanentBulletCount, 5, 80); // Moved up from position 110

    // Hiển thị tên người chơi thay vì level và thanh kinh nghiệm
    context.fillStyle = "#00ff00"; // Màu xanh lá cho tên người chơi
    context.font = "bold 16px courier";
    context.fillText("Player: " + playerName, 5, 110); // Thêm tên người chơi ở vị trí mới

    // Vẽ thông tin AI nếu đang ở chế độ versus
    if (aiEnabled) {
        context.fillStyle = "white";
        context.fillText("AI Score: " + aiShip.score, boardWidth - 150, 20);
        context.fillText("AI Lives: " + aiShip.lives, boardWidth - 150, 40);
        context.fillText("AI Shield: " + Math.floor(aiShip.shield) + "%", boardWidth - 150, 60);
        context.fillText("AI Difficulty: " + aiShip.difficulty, boardWidth - 150, 80);

        // Hiển thị người dẫn trước
        let leadingText = "";
        if (score > aiShip.score) {
            leadingText = "Player leading: +" + (score - aiShip.score);
            context.fillStyle = "lightgreen";
        } else if (aiShip.score > score) {
            leadingText = "AI leading: +" + (aiShip.score - score);
            context.fillStyle = "pink";
        } else {
            leadingText = "Scores tied!";
            context.fillStyle = "yellow";
        }
        context.fillText(leadingText, boardWidth / 2 - 80, 20);
    } else {
        // Loại bỏ việc hiển thị điểm cao trong gameplay
        // Không hiển thị gì thay vì điểm cao
    }
}

function moveShip(e) {
    if (gameOver) return;

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            //chọn loại alien ngẫu nhiên, với xác suất khác nhau
            let rand = Math.random();
            let type;
            if (rand < 0.6) {
                type = alienTypes.normal;
            } else if (rand < 0.8) {
                type = alienTypes.shooter;
            } else {
                type = alienTypes.tank;
            }

            let alien = {
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
                health: type.health,
                type: type
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

// Tối ưu hàm shoot để giảm lag khi bắn
function shoot(e) {
    if (gameOver) return;

    if (e.code == "Space") {
        // Kiểm tra xem đã hết thời gian cooldown chưa
        if (shootCooldown > 0) return;

        // Thiết lập lại thời gian cooldown
        shootCooldown = shootCooldownTime;

        // Giảm thời gian cooldown khi có buff rapidFire
        if (buffActive && buffType === "rapidFire") {
            shootCooldown = Math.floor(shootCooldownTime / 2);
        }

        // Tối ưu hóa việc phát âm thanh
        playOptimizedShootSound();

        // Tạo đạn với hiệu suất tốt hơn
        createBullets();
    }
}

// Tách việc tạo đạn ra thành hàm riêng để tối ưu
function createBullets() {
    if (buffActive && buffType === "multiShot") {
        // Khi có multiShot, bắn 3 hướng chính
        let angles = [-0.3, 0, 0.3];
        angles.forEach(mainAngle => {
            // Với mỗi hướng chính, bắn số đạn theo permanentBulletCount
            for (let i = 0; i < permanentBulletCount; i++) {
                let spreadAngle = mainAngle + (i - (permanentBulletCount - 1) / 2) * 0.15;
                let bullet = {
                    x: ship.x + shipWidth * 15 / 32,
                    y: ship.y,
                    width: tileSize / 8,
                    height: tileSize / 2,
                    used: false,
                    piercing: false,
                    velocityX: Math.sin(spreadAngle) * 10,
                    velocityY: bulletVelocityY * Math.cos(spreadAngle)
                };
                bulletArray.push(bullet);
            }
        });
    } else {
        // Bắn thường theo dạng quạt
        for (let i = 0; i < permanentBulletCount; i++) {
            let spreadAngle = (i - (permanentBulletCount - 1) / 2) * 0.15;
            let bullet = {
                x: ship.x + shipWidth * 15 / 32,
                y: ship.y,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false,
                piercing: false,
                velocityX: Math.sin(spreadAngle) * 10,
                velocityY: bulletVelocityY * Math.cos(spreadAngle)
            };
            bulletArray.push(bullet);
        }
    }
}

// Tối ưu hóa phát âm thanh để giảm thiểu lag
function playOptimizedShootSound() {
    try {
        // Hạn chế tần số phát âm thanh để giảm tải
        const now = Date.now();
        if (now - lastSoundPlayed < 50) { // 50ms để tránh quá tải âm thanh
            return;
        }
        lastSoundPlayed = now;

        // Sử dụng âm thanh từ pool nếu có
        let soundEffect;

        if (shipBulletSoundPool.length > 0) {
            // Tái sử dụng âm thanh đã tồn tại trong pool
            soundEffect = shipBulletSoundPool.find(sound => sound.paused);
            if (soundEffect) {
                soundEffect.currentTime = 0;
            }
        }

        // Nếu không có âm thanh nào trong pool, tạo mới
        if (!soundEffect) {
            if (shipBulletSoundPool.length >= MAX_SOUND_POOL_SIZE) {
                // Nếu pool đã đầy, tái sử dụng phần tử đầu tiên
                soundEffect = shipBulletSoundPool[0];
                soundEffect.currentTime = 0;
            } else {
                // Tạo mới nếu pool chưa đầy
                soundEffect = new Audio("./sounds/soundShip.mp4");
                soundEffect.volume = 0.5;
                shipBulletSoundPool.push(soundEffect);
            }
        }

        // Phát âm thanh
        const playPromise = soundEffect.play();

        // Xử lý lỗi phát âm thanh không làm ảnh hưởng tới game
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio playback failed:", error);
            });
        }
    } catch (error) {
        // Bỏ qua lỗi âm thanh để game không bị ảnh hưởng
        console.log("Sound error ignored:", error);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function spawnBuff(x, y, forAI = false) {
    // Tăng tỉ lệ rơi vật phẩm tăng đạn
    let rand = Math.random();
    let type;

    if (rand < 0.4) { // 40% cơ hội rơi vật phẩm tăng đạn
        type = "permanentBulletUp";
    } else {
        // 60% còn lại chia đều cho các vật phẩm khác
        let otherTypes = forAI ?
            Object.keys(powerUpAITypes).filter(t => t !== "permanentBulletUp") :
            Object.keys(powerUpTypes).filter(t => t !== "permanentBulletUp");
        type = otherTypes[Math.floor(Math.random() * otherTypes.length)];
    }

    if (forAI) {
        // Tạo buff cho AI
        buffAI = {
            x: x,
            y: y,
            width: tileSize,
            height: tileSize,
            type: type,
            forAI: true
        };
        buffAIExists = true;
    } else {
        // Tạo buff cho người chơi
        buff = {
            x: x,
            y: y,
            width: tileSize,
            height: tileSize,
            type: type,
            forAI: false
        };
        buffExists = true;
    }
}

function activateBuff(targetShip) {
    buffExists = false;
    buffActive = true;
    buffType = buff.type;

    // Xác định xem đây là tàu người chơi hay AI
    const isPlayerShip = (targetShip === ship);

    buff = null;

    let originalAlienVelocity = alienVelocityX; // Lưu tốc độ gốc của alien

    switch (buffType) {
        case "shield":
            if (isPlayerShip) {
                isShieldActive = true;
                shield = 100;
                setTimeout(() => {
                    isShieldActive = false;
                    if (isPlayerShip) buffActive = false;
                }, powerUpTypes.shield.duration);
            } else {
                targetShip.isShieldActive = true;
                targetShip.shield = 100;
                setTimeout(() => {
                    targetShip.isShieldActive = false;
                }, powerUpTypes.shield.duration);
            }
            break;

        case "rapidFire":
            let originalVelocity = bulletVelocityY;
            bulletVelocityY *= 2;
            // Giảm cooldown khi có buff rapidFire
            if (isPlayerShip) {
                shootCooldown = 0; // Reset cooldown để người chơi bắn ngay lập tức
            }
            setTimeout(() => {
                bulletVelocityY = originalVelocity;
                if (isPlayerShip) buffActive = false;
            }, powerUpTypes.rapidFire.duration);
            break;

        case "piercingShot":
            if (isPlayerShip) {
                bulletArray.forEach(bullet => bullet.piercing = true);
                setTimeout(() => {
                    bulletArray.forEach(bullet => bullet.piercing = false);
                    buffActive = false;
                }, powerUpTypes.piercingShot.duration);
            } else {
                aiBulletArray.forEach(bullet => bullet.piercing = true);
                setTimeout(() => {
                    aiBulletArray.forEach(bullet => bullet.piercing = false);
                }, powerUpTypes.piercingShot.duration);
            }
            break;

        case "multiShot":
            if (isPlayerShip) {
                setTimeout(() => {
                    buffActive = false;
                }, powerUpTypes.multiShot.duration);
            }
            break;

        case "bomb":
            alienArray.forEach(alien => {
                if (alien.alive) {
                    alien.alive = false;
                    alienCount--;
                    if (isPlayerShip) {
                        score += alien.type.points;
                        gainExperience(50);
                    } else {
                        targetShip.score += alien.type.points;
                    }
                    explosions.push({
                        x: alien.x,
                        y: alien.y,
                        frame: 0,
                        duration: explosionDuration
                    });
                }
            });
            if (isPlayerShip) buffActive = false;
            break;

        case "permanentBulletUp":
            if (isPlayerShip) {
                permanentBulletCount++;
                buffActive = false;
            } else {
                targetShip.bulletCount++;
            }
            break;

        case "slowAliens":
            alienVelocityX *= 0.5; // Giảm một nửa tốc độ
            setTimeout(() => {
                alienVelocityX = originalAlienVelocity;
                if (isPlayerShip) buffActive = false;
            }, powerUpTypes.slowAliens.duration);
            break;
    }
}

function activateAIBuff() {
    buffAIExists = false;
    buffAIActive = true;
    buffAIType = buffAI.type;

    let originalAlienVelocity = alienVelocityX; // Lưu tốc độ gốc của alien

    switch (buffAIType) {
        case "shield":
            aiShip.isShieldActive = true;
            aiShip.shield = 100;
            setTimeout(() => {
                aiShip.isShieldActive = false;
                buffAIActive = false;
            }, powerUpAITypes.shield.duration);
            break;

        case "rapidFire":
            aiShip.bulletSpeedMultiplier = 2;
            setTimeout(() => {
                aiShip.bulletSpeedMultiplier = 1;
                buffAIActive = false;
            }, powerUpAITypes.rapidFire.duration);
            break;

        case "piercingShot":
            aiBulletArray.forEach(bullet => bullet.piercing = true);
            setTimeout(() => {
                aiBulletArray.forEach(bullet => bullet.piercing = false);
                buffAIActive = false;
            }, powerUpAITypes.piercingShot.duration);
            break;

        case "multiShot":
            aiShip.hasMultiShot = true;
            setTimeout(() => {
                aiShip.hasMultiShot = false;
                buffAIActive = false;
            }, powerUpAITypes.multiShot.duration);
            break;

        case "bomb":
            alienArray.forEach(alien => {
                if (alien.alive) {
                    alien.alive = false;
                    alienCount--;
                    aiShip.score += alien.type.points;
                    explosions.push({
                        x: alien.x,
                        y: alien.y,
                        frame: 0,
                        duration: explosionDuration
                    });
                }
            });
            buffAIActive = false;
            break;

        case "permanentBulletUp":
            aiShip.bulletCount++;
            buffAIActive = false;
            break;

        case "slowAliens":
            alienVelocityX *= 0.5; // Giảm một nửa tốc độ
            setTimeout(() => {
                alienVelocityX = originalAlienVelocity;
                buffAIActive = false;
            }, powerUpAITypes.slowAliens.duration);
            break;
    }

    buffAI = null;
}

function updateAI() {
    const settings = difficultySettings[aiShip.difficulty];

    // Di chuyển AI
    aiShip.shootCooldown--;

    // AI tìm buff AI dựa theo độ khó
    if (buffAI && buffAIExists && aiShip.difficulty !== "easy") {
        // Chỉ ở mức độ medium và hard AI mới đi lấy buff
        // Ưu tiên đi lấy buff cao nhất
        const targetX = buffAI.x + buffAI.width / 2 - aiShip.width / 2;

        // Di chuyển tàu AI tới vị trí buff
        if (Math.abs(aiShip.x - targetX) > settings.moveSpeed) {
            if (aiShip.x < targetX) {
                aiShip.x += settings.moveSpeed * 1.5; // Tăng tốc độ di chuyển đến buff
            } else {
                aiShip.x -= settings.moveSpeed * 1.5;
            }

            // Giới hạn không cho tàu đi ra ngoài màn hình
            aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));

            // Nếu đang đi lấy buff, không thực hiện hành động khác
            return;
        }
    }

    // Xử lý trường hợp đang đánh boss
    if (isBossFight && boss) {
        // Nhắm vào boss
        const targetX = boss.x + boss.width / 2 - aiShip.width / 2;

        // Thêm độ chính xác dựa trên độ khó
        const accuracy = settings.accuracy;
        const targetWithError = targetX + (Math.random() * 2 - 1) * (1 - accuracy) * 100;

        // Di chuyển tàu AI
        if (Math.abs(aiShip.x - targetWithError) > settings.moveSpeed) {
            if (aiShip.x < targetWithError) {
                aiShip.x += settings.moveSpeed;
            } else {
                aiShip.x -= settings.moveSpeed;
            }
        }

        // Né tránh laser của boss
        avoidBossLasers(settings);

        // Giới hạn không cho tàu đi ra ngoài màn hình
        aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));

        // Bắn đạn vào boss nếu hết thời gian cooldown
        if (aiShip.shootCooldown <= 0 && Math.random() < settings.reactionTime) {
            aiShoot();
            aiShip.shootCooldown = settings.shootInterval;
        }
    }
    // Nếu không phải boss fight, sử dụng AI thông thường
    else {
        // Tìm alien gần nhất để nhắm bắn
        let targetAlien = findBestTarget(settings);

        if (targetAlien) {
            let targetX = targetAlien.x + targetAlien.width / 2 - aiShip.width / 2;

            // Dự đoán vị trí cho mức độ trung bình và khó
            if (settings.predictiveAiming) {
                const bulletTravelTime = Math.abs(targetAlien.y - aiShip.y) / Math.abs(bulletVelocityY);
                const predictedX = targetAlien.x + (alienVelocityX * bulletTravelTime);
                targetX = predictedX + targetAlien.width / 2 - aiShip.width / 2;

                // Kiểm tra xem alien có đổi hướng không
                if (predictedX + targetAlien.width >= boardWidth || predictedX <= 0) {
                    targetX = targetAlien.x + targetAlien.width / 2 - aiShip.width / 2;
                }
            }

            // Thêm độ chính xác dựa trên độ khó
            const accuracy = settings.accuracy;
            const targetWithError = targetX + (Math.random() * 2 - 1) * (1 - accuracy) * 100;

            // Di chuyển tàu AI
            if (Math.abs(aiShip.x - targetWithError) > settings.moveSpeed) {
                if (aiShip.x < targetWithError) {
                    aiShip.x += settings.moveSpeed;
                } else {
                    aiShip.x -= settings.moveSpeed;
                }
            }

            // Giới hạn không cho tàu đi ra ngoài màn hình
            aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));

            // Bắn đạn nếu hết thời gian cooldown và có xác suất bắn dựa trên độ khó
            if (aiShip.shootCooldown <= 0 && Math.random() < settings.reactionTime) {
                aiShoot();
                aiShip.shootCooldown = settings.shootInterval;
            }
        } else {
            // Nếu không có alien, di chuyển qua lại
            aiShip.x += settings.moveSpeed * aiShip.moveDirection;

            // Đổi hướng nếu chạm biên
            if (aiShip.x <= 0 || aiShip.x + aiShip.width >= boardWidth) {
                aiShip.moveDirection *= -1;
            }
        }
    }

    // Né tránh đạn của alien (nhưng ưu tiên thấp hơn di chuyển lấy buff)
    if (aiShip.difficulty !== "easy") {
        for (let i = 0; i < alienBullets.length; i++) {
            let bullet = alienBullets[i];
            // Nếu đạn đang đi xuống và gần tàu AI
            if (Math.abs(bullet.x - (aiShip.x + aiShip.width / 2)) < aiShip.width &&
                bullet.y < aiShip.y && bullet.y > aiShip.y - 100) {
                // Né sang trái hoặc phải tùy thuộc vào vị trí hiện tại
                const dodgeDirection = (aiShip.x > boardWidth / 2) ? -1 : 1;
                aiShip.x += settings.moveSpeed * dodgeDirection; // Giảm tốc độ né tránh so với ban đầu
                break;
            }
        }
    }
}

function findBestTarget(settings) {
    let bestTarget = null;
    let bestScore = -Infinity;

    for (let i = 0; i < alienArray.length; i++) {
        if (alienArray[i].alive) {
            const alien = alienArray[i];
            let score = 0;

            // Tính điểm dựa trên khoảng cách
            const dx = alien.x + alien.width / 2 - (aiShip.x + aiShip.width / 2);
            const dy = alien.y - aiShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            score -= distance * 0.5; // Ưu tiên alien gần hơn

            // Ưu tiên alien nguy hiểm (shooter) ở mức độ trung bình và khó
            if (settings.predictiveAiming && alien.type === alienTypes.shooter) {
                score += 300;
            }

            // Ưu tiên alien có nhiều máu ở mức độ khó
            if (settings.seekPowerUps && alien.health > 1) {
                score += alien.health * 100;
            }

            // Ưu tiên alien gần với buff (nếu có) ở mức độ khó
            if (settings.seekPowerUps && buff) {
                const distanceToBuff = Math.sqrt(
                    Math.pow(alien.x - buff.x, 2) +
                    Math.pow(alien.y - buff.y, 2)
                );
                if (distanceToBuff < 200) {
                    score += (200 - distanceToBuff);
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestTarget = alien;
            }
        }
    }

    return bestTarget;
}

function aiShoot() {
    if (!aiShip.active) return;

    try {
        // Đảm bảo aiShip.bulletSpeedMultiplier có giá trị
        if (!aiShip.bulletSpeedMultiplier) aiShip.bulletSpeedMultiplier = 1;

        // Đảm bảo aiShip.bulletCount có giá trị
        if (!aiShip.bulletCount || aiShip.bulletCount < 1) aiShip.bulletCount = 1;

        if (aiShip.hasMultiShot) {
            // Khi có multiShot, bắn 3 hướng chính
            let angles = [-0.3, 0, 0.3];
            angles.forEach(mainAngle => {
                // Với mỗi hướng chính, bắn số đạn theo aiShip.bulletCount
                for (let i = 0; i < aiShip.bulletCount; i++) {
                    let spreadAngle = mainAngle + (i - (aiShip.bulletCount - 1) / 2) * 0.15;
                    let bullet = {
                        x: aiShip.x + aiShip.width / 2,
                        y: aiShip.y,
                        width: tileSize / 8,
                        height: tileSize / 2,
                        used: false,
                        piercing: false,
                        velocityX: Math.sin(spreadAngle) * 10,
                        velocityY: bulletVelocityY * Math.cos(spreadAngle) * aiShip.bulletSpeedMultiplier
                    };
                    aiBulletArray.push(bullet);
                }
            });
        } else {
            // Bắn thường theo dạng quạt
            for (let i = 0; i < aiShip.bulletCount; i++) {
                let spreadAngle = (i - (aiShip.bulletCount - 1) / 2) * 0.15;
                let bullet = {
                    x: aiShip.x + aiShip.width / 2,
                    y: aiShip.y,
                    width: tileSize / 8,
                    height: tileSize / 2,
                    used: false,
                    piercing: false,
                    velocityX: Math.sin(spreadAngle) * 10,
                    velocityY: bulletVelocityY * Math.cos(spreadAngle) * aiShip.bulletSpeedMultiplier
                };
                aiBulletArray.push(bullet);
            }
        }
    } catch (error) {
        console.error("Error in aiShoot:", error);
    }
}

function resetAiShip() {
    aiShip.x = shipX + boardWidth / 3;
    aiShip.y = shipY;
    aiShip.lives = 3;
    aiShip.shield = 100;
    aiShip.isShieldActive = false;
    aiShip.score = 0;
    aiShip.bulletCount = 1;
    aiShip.shootCooldown = 0;
    aiShip.moveDirection = 1;
}

// Sửa lại hàm updateHighScores để chỉ cập nhật khi game kết thúc
function updateHighScores() {
    // Chỉ cập nhật điểm cao khi game thực sự kết thúc
    // Kiểm tra nếu một trong các điều kiện kết thúc game được đáp ứng
    if (!(gameOver || bossDefeated || versusResult)) {
        return; // Không làm gì nếu game chưa kết thúc
    }

    // Thêm biến tĩnh để đảm bảo hàm chỉ chạy một lần mỗi lần game kết thúc
    if (updateHighScores.hasRun) {
        return;
    }
    updateHighScores.hasRun = true;

    if (score > 0) {
        // Tạo điểm số mới với tên người chơi
        let newScore = {
            name: playerName,
            score: score
        };

        // Kiểm tra xem bảng điểm cao có tồn tại không
        if (!Array.isArray(highScores)) {
            highScores = [];
        }

        // Kiểm tra xem điểm số này đã có trong bảng xếp hạng chưa
        let isDuplicate = false;
        let playerIndex = -1;
        for (let i = 0; i < highScores.length; i++) {
            // Kiểm tra xem đối tượng có hợp lệ không
            if (typeof highScores[i] !== 'object' || !highScores[i].name) {
                continue;
            }

            // Nếu cùng tên người chơi, lưu vị trí
            if (highScores[i].name === playerName) {
                playerIndex = i;
                // Nếu điểm số cao hơn hoặc bằng điểm hiện tại, đánh dấu trùng lặp
                if (highScores[i].score >= score) {
                    isDuplicate = true;
                }
            }
        }

        // Nếu đã có tên người chơi nhưng điểm thấp hơn, cập nhật điểm mới
        if (playerIndex !== -1 && !isDuplicate) {
            highScores.splice(playerIndex, 1);
        }

        // Nếu không trùng lặp, thêm điểm mới vào danh sách
        if (!isDuplicate) {
            highScores.push(newScore);

            // Sắp xếp lại theo điểm số giảm dần
            highScores.sort((a, b) => {
                if (!a || !b || typeof a.score !== 'number' || typeof b.score !== 'number') {
                    return 0;
                }
                return b.score - a.score;
            });

            // Chỉ giữ 5 điểm cao nhất
            if (highScores.length > 5) {
                highScores = highScores.slice(0, 5);
            }

            // Lưu vào localStorage
            try {
                localStorage.setItem("highScores", JSON.stringify(highScores));
                console.log("Đã cập nhật điểm cao:", highScores);
            } catch (e) {
                console.error("Không thể lưu điểm cao:", e);
            }
        }
    }
}

// Sửa lại hàm resetGame để reset trạng thái cập nhật điểm cao
function resetGame() {
    lives = 3;
    shield = 100;
    isShieldActive = false;
    score = 0;
    gameOver = false;
    alienArray = [];
    bulletArray = [];
    aiBulletArray = [];
    alienBullets = [];
    explosions = [];
    buff = null;
    buffExists = false;
    buffActive = false;
    buffType = null;

    buffAI = null;
    buffAIExists = false;
    buffAIActive = false;
    buffAIType = null;

    alienColumns = 3;
    alienRows = 2;
    alienVelocityX = 0.5;
    ship.x = shipX;
    ship.y = shipY;

    if (aiEnabled) {
        resetAiShip();
        aiShip.active = true;
        aiShip.hasMultiShot = false;
        aiShip.bulletSpeedMultiplier = 1;
    } else {
        aiShip.active = false;
    }

    createAliens();
    level = 1;
    experiencePoints = 0;
    experienceToNextLevel = 1000;
    bulletVelocityY = -10;
    shieldRegenRate = 0.1;
    permanentBulletCount = 1;

    // Reset Boss
    boss = null;
    bossHealth = bossMaxHealth;
    bossLasers = [];
    bossLaserTimer = 0;
    bossLaserCount = 2; // Reset lại số lượng laser ban đầu
    isBossFight = false;
    bossDefeated = false;

    // Reset biến trạng thái của hàm updateHighScores
    updateHighScores.hasRun = false;

    // Reset versusResult và các biến kết quả khác
    versusResult = null;
    singlePlayerResult = null;

    shootCooldown = 0; // Reset cooldown khi bắt đầu game mới

    // Reset sound pool
    shipBulletSoundPool = [];
}

//thêm event listener cho phím R để restart game
document.addEventListener("keydown", function (e) {
    if (e.code === "KeyR" && gameOver) {
        // Hiển thị hộp thoại nhập tên khi khởi động lại sau khi game over
        showPlayerNameDialog();
    }
});

function gainExperience(points) {
    experiencePoints += points;
    if (experiencePoints >= experienceToNextLevel) {
        levelUp();
    }
}

function levelUp() {
    level++;
    experiencePoints -= experienceToNextLevel;
    experienceToNextLevel *= 1.5;

    // Tăng sức mạnh theo level
    bulletVelocityY -= 0.5;
    shieldRegenRate += 0.05;

    // Hiển thị thông báo level up nhỏ hơn và nhanh hơn
    let levelUpText = document.createElement("div");
    levelUpText.textContent = "LEVEL UP!";
    levelUpText.style.position = "absolute";
    levelUpText.style.color = "#ffff00";
    levelUpText.style.fontFamily = "courier";
    levelUpText.style.fontWeight = "bold";
    levelUpText.style.fontSize = "24px";
    levelUpText.style.top = "100px";
    levelUpText.style.left = (boardWidth / 2 - 60) + "px";
    levelUpText.style.zIndex = "1000";
    levelUpText.style.textShadow = "0 0 5px #ff0000";
    document.body.appendChild(levelUpText);

    // Xóa thông báo sau 1 giây
    setTimeout(() => {
        if (levelUpText.parentNode) {
            document.body.removeChild(levelUpText);
        }
    }, 1000);
}

// Ngăn chặn hành vi mặc định của phím Space
window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        e.preventDefault();
    }
});

// Hàm khởi tạo boss fight
function startBossFight() {
    console.log("Boss fight initialization started");

    // Đặt cờ boss fight
    isBossFight = true;

    // Xóa tất cả alien và đạn 
    alienArray = [];
    alienBullets = [];
    alienCount = 0;

    // Tạo boss
    let bossImg = new Image();
    bossImg.src = "./boss.png";

    // Xử lý sự kiện tải hình ảnh
    bossImg.onload = function () {
        console.log("Boss image loaded successfully");
    };

    bossImg.onerror = function () {
        console.error("Failed to load boss image");

        // Tạo một canvas để vẽ boss thay thế
        let canvas = document.createElement('canvas');
        canvas.width = bossWidth;
        canvas.height = bossHeight;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, bossWidth, bossHeight);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('BOSS', bossWidth / 3, bossHeight / 2);

        // Chuyển canvas thành data URL
        bossImg.src = canvas.toDataURL();
    };

    // Khởi tạo boss với các thuộc tính
    boss = {
        x: boardWidth / 2 - bossWidth / 2,
        y: tileSize * 3,
        width: bossWidth,
        height: bossHeight,
        img: bossImg
    };

    // Thiết lập các thuộc tính khác cho boss fight
    bossHealth = bossMaxHealth;
    bossLaserTimer = 0;
    bossLaserCount = 2;
    bossLasers = [];

    // Tạo laser đầu tiên ngay lập tức
    setTimeout(createBossLasers, 2000);

    console.log("Boss fight initialized:", boss);
}

// Tạo laser của boss - sửa để bắt đầu với 2 đường laser và tăng dần
function createBossLasers() {
    console.log("Creating boss lasers");

    if (!isBossFight || !boss) {
        console.log("Cannot create lasers - no active boss fight");
        return;
    }

    // Xóa laser cũ
    bossLasers = [];

    // Tạo laser mới dựa trên bossLaserCount
    for (let i = 0; i < bossLaserCount; i++) {
        // Phân bổ vị trí laser đều trên màn hình
        let laserX;

        if (bossLaserCount > 1) {
            // Chia đều khoảng cách
            const totalWidth = boardWidth - bossLaserWidth;
            const segment = totalWidth / (bossLaserCount - 1);
            laserX = i * segment;
        } else {
            // Nếu chỉ có 1 laser, đặt ở giữa màn hình
            laserX = (boardWidth - bossLaserWidth) / 2;
        }

        // Thêm một chút ngẫu nhiên
        laserX += (Math.random() - 0.5) * 30;

        // Giới hạn trong màn hình
        laserX = Math.max(0, Math.min(boardWidth - bossLaserWidth, laserX));

        // Tạo laser mới
        bossLasers.push({
            x: laserX,
            y: 0,
            width: bossLaserWidth,
            height: tileSize,
            growing: true
        });
    }

    // Tăng số lượng laser cho lần sau
    bossLaserCount = Math.min(bossLaserCount + 1, 10); // Tối đa 10 laser

    // Hiệu ứng cảnh báo
    flashWarning();

    console.log("Created", bossLasers.length, "boss lasers");
}

// Sửa lại hàm avoidBossLasers để xử lý đúng
function avoidBossLasers(settings) {
    if (!aiShip.active || aiShip.difficulty === "easy") return;

    // Kiểm tra xem bossLasers có tồn tại và không trống
    if (!bossLasers || bossLasers.length === 0) return;

    // Né tránh laser ở độ khó medium và hard
    for (let i = 0; i < bossLasers.length; i++) {
        const laser = bossLasers[i];
        // Nếu laser sắp va chạm với AI (khoảng cách gần hơn)
        const laserCenterX = laser.x + laser.width / 2;
        const shipCenterX = aiShip.x + aiShip.width / 2;
        const distanceX = Math.abs(laserCenterX - shipCenterX);

        if (distanceX < aiShip.width * 1.2) { // Tăng phạm vi né tránh
            // Di chuyển tránh xa laser
            const moveDirection = (laserCenterX > shipCenterX) ? -1 : 1;
            aiShip.x += settings.moveSpeed * 3 * moveDirection; // Tăng tốc độ né tránh

            // Giới hạn không cho đi ra ngoài màn hình
            aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));
            console.log("AI avoiding laser at", laserCenterX, "moving", moveDirection > 0 ? "right" : "left");
            break;
        }
    }
}

// Sửa lại hàm updateBossLasers để hiển thị và hoạt động đúng
function updateBossLasers() {
    if (!bossLasers || bossLasers.length === 0) return;

    for (let i = bossLasers.length - 1; i >= 0; i--) {
        let laser = bossLasers[i];

        // Kiểm tra xem laser có hợp lệ không
        if (!laser) {
            bossLasers.splice(i, 1);
            continue;
        }

        // Nếu đang phát triển
        if (laser.growing) {
            laser.height += 10; // Tăng tốc độ phát triển

            // Nếu laser đạt đến cuối màn hình
            if (laser.height >= boardHeight) {
                // Giữ ở chiều cao tối đa trong một thời gian trước khi biến mất
                laser.growing = false;
                laser.duration = 30; // Duy trì đủ lâu để người chơi thấy
            }
        } else {
            // Giảm thời gian tồn tại
            laser.duration--;

            // Nếu hết thời gian, xóa laser
            if (laser.duration <= 0) {
                bossLasers.splice(i, 1);
                continue;
            }
        }

        // Vẽ laser với hiệu ứng gradient
        let gradient = context.createLinearGradient(0, laser.y, 0, laser.y + laser.height);
        gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 0, 0.9)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 0.8)");

        context.fillStyle = gradient;
        context.fillRect(laser.x, laser.y, laser.width, laser.height);

        // Hiệu ứng phát sáng ở giữa
        context.fillStyle = "rgba(255, 255, 255, 0.8)";
        context.fillRect(laser.x + laser.width / 4, laser.y, laser.width / 2, laser.height);

        // Kiểm tra va chạm với người chơi và AI
        if (ship && detectLaserCollision(laser, ship)) {
            if (isShieldActive) {
                shield -= 50; // Laser gây nhiều sát thương hơn
                if (shield <= 0) {
                    isShieldActive = false;
                }
            } else {
                lives--;
                if (lives <= 0) {
                    if (aiEnabled) {
                        // Nếu người chơi bị tiêu diệt trong chế độ versus
                        if (aiShip.lives > 0) {
                            // AI vẫn còn sống, người chơi thua
                            versusResult = "lose";
                        } else {
                            // Cả hai đã bị tiêu diệt, so sánh điểm
                            versusResult = (score >= aiShip.score) ? "win" : "lose";
                        }
                    } else {
                        // Nếu ở chế độ single player
                        gameOver = true;
                        singlePlayerResult = "lose";
                    }
                    updateHighScores();
                }
            }
        }

        if (aiEnabled && aiShip.active && detectLaserCollision(laser, aiShip)) {
            if (aiShip.isShieldActive) {
                aiShip.shield -= 50;
                if (aiShip.shield <= 0) {
                    aiShip.isShieldActive = false;
                }
            } else {
                aiShip.lives--;
                if (aiShip.lives <= 0) {
                    aiShip.active = false;

                    // Nếu AI bị tiêu diệt
                    if (lives > 0) {
                        // Người chơi vẫn còn sống, người chơi thắng
                        versusResult = "win";
                    } else {
                        // Cả hai đã bị tiêu diệt, so sánh điểm
                        versusResult = (score >= aiShip.score) ? "win" : "lose";
                    }
                }
            }
        }
    }
}

// Phát hiện va chạm với laser, xem xét toàn bộ độ dài của laser
function detectLaserCollision(laser, target) {
    return (
        target.x < laser.x + laser.width &&
        target.x + target.width > laser.x &&
        target.y < laser.y + laser.height &&
        target.y + target.height > laser.y
    );
}

// Vẽ thanh máu của boss
function drawBossHealthBar() {
    const barWidth = boardWidth * 0.6;
    const barHeight = 15;
    const barX = (boardWidth - barWidth) / 2;
    const barY = 20;

    // Vẽ nền của thanh máu
    context.fillStyle = "#333";
    context.fillRect(barX, barY, barWidth, barHeight);

    // Vẽ máu hiện tại
    const healthPercent = bossHealth / bossMaxHealth;
    let healthColor;

    if (healthPercent > 0.6) {
        healthColor = "#00ff00"; // Xanh lá khi máu > 60%
    } else if (healthPercent > 0.3) {
        healthColor = "#ffff00"; // Vàng khi máu > 30%
    } else {
        healthColor = "#ff0000"; // Đỏ khi máu <= 30%
    }

    context.fillStyle = healthColor;
    context.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Vẽ viền cho thanh máu
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.strokeRect(barX, barY, barWidth, barHeight);

    // Hiển thị text BOSS và máu hiện tại
    context.fillStyle = "white";
    context.font = "bold 12px courier";
    context.fillText("BOSS: " + bossHealth + "/" + bossMaxHealth, barX + barWidth / 2 - 50, barY + barHeight - 2);
}

// Tạo hiệu ứng nổ lớn khi boss bị tiêu diệt
function createBossExplosion() {
    const explosionCount = 15;

    // Tạo nhiều vụ nổ ở vị trí khác nhau trên boss
    for (let i = 0; i < explosionCount; i++) {
        setTimeout(() => {
            const offsetX = Math.random() * bossWidth;
            const offsetY = Math.random() * bossHeight;

            explosions.push({
                x: boss.x + offsetX - alienWidth / 2,
                y: boss.y + offsetY - alienHeight / 2,
                frame: 0,
                duration: explosionDuration,
                size: 1 + Math.random() * 2 // Kích thước ngẫu nhiên
            });
        }, i * 150); // Các vụ nổ xảy ra theo trình tự
    }

    // Cũng xóa tất cả laser của boss
    bossLasers = [];
}

// Chỉnh sửa hàm update explosion để hỗ trợ kích thước khác nhau
function updateExplosions() {
    // Tối ưu hóa hiệu ứng trước khi cập nhật
    optimizeEffects();

    for (let i = explosions.length - 1; i >= 0; i--) {
        let explosion = explosions[i];
        let size = explosion.size || 1; // Default size là 1 nếu không được định nghĩa

        context.fillStyle = "orange";
        context.beginPath();
        context.arc(
            explosion.x + alienWidth / 2,
            explosion.y + alienHeight / 2,
            (explosion.frame / explosionFrames) * alienWidth / 2 * size,
            0,
            2 * Math.PI
        );
        context.fill();

        explosion.duration--;
        if (explosion.duration <= 0) {
            explosion.frame++;
            explosion.duration = explosionDuration;
            if (explosion.frame >= explosionFrames) {
                explosions.splice(i, 1);
            }
        }
    }
}

// Tạo hàm optimize cho các hiệu ứng đồ họa
function optimizeEffects() {
    // Giới hạn số lượng vụ nổ hiển thị đồng thời
    if (explosions.length > 15) {
        explosions.splice(0, explosions.length - 15);
    }

    // Tối ưu hóa các hiệu ứng khác khi cần
}

// Thêm hàm để tải tất cả hình ảnh buff
function loadAllBuffImages() {
    // Danh sách các loại buff cần tải
    const buffTypes = [
        'shield',
        'rapidFire',
        'piercingShot',
        'multiShot',
        'bomb',
        'permanentBulletUp',
        'slowAliens'
    ];

    // Tải buff cho người chơi
    buffTypes.forEach(type => {
        const img = new Image();
        img.src = `./buffship/${type}.png`;

        img.onload = function () {
            console.log(`Loaded player buff image: ${type}`);
            powerUpTypes[type].img = img;
        };

        img.onerror = function () {
            console.error(`Failed to load player buff image: ${type}`);

            // Thử lại với tên file viết thường
            const retryImg = new Image();
            retryImg.src = `./buffship/${type.toLowerCase()}.png`;

            retryImg.onload = function () {
                console.log(`Loaded player buff image (lowercase): ${type}`);
                powerUpTypes[type].img = retryImg;
            };

            retryImg.onerror = function () {
                console.error(`Failed to load player buff image with all attempts: ${type}`);
            };
        };
    });

    // Tải buff cho AI
    buffTypes.forEach(type => {
        const img = new Image();
        img.src = `./buffshipAI/${type}.png`;

        img.onload = function () {
            console.log(`Loaded AI buff image: ${type}`);
            powerUpAITypes[type].img = img;
        };

        img.onerror = function () {
            console.error(`Failed to load AI buff image: ${type}`);

            // Thử lại với tên file viết thường
            const retryImg = new Image();
            retryImg.src = `./buffshipAI/${type.toLowerCase()}.png`;

            retryImg.onload = function () {
                console.log(`Loaded AI buff image (lowercase): ${type}`);
                powerUpAITypes[type].img = retryImg;
            };

            retryImg.onerror = function () {
                console.error(`Failed to load AI buff image with all attempts: ${type}`);
            };
        };
    });
}