// Các chức năng liên quan đến màn hình chọn chế độ chơi

/**
 * Hiển thị màn hình chọn chế độ chơi với giao diện đẹp
 */
function showGameModeSelection() {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "game-mode-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Thêm hiệu ứng ánh sáng không gian
    let spaceEffect = document.createElement("div");
    spaceEffect.style.position = "absolute";
    spaceEffect.style.width = "100%";
    spaceEffect.style.height = "100%";
    spaceEffect.style.background = "radial-gradient(circle at center, rgba(15, 30, 60, 0.6) 0%, rgba(0, 0, 0, 0.8) 70%)";
    spaceEffect.style.zIndex = "-1";
    modalBackdrop.appendChild(spaceEffect);

    // Thêm hiệu ứng các ngôi sao lấp lánh
    for (let i = 0; i < 50; i++) {
        let star = document.createElement("div");
        star.style.position = "absolute";
        star.style.width = Math.random() * 3 + "px";
        star.style.height = star.style.width;
        star.style.backgroundColor = "white";
        star.style.borderRadius = "50%";
        star.style.top = Math.random() * 100 + "%";
        star.style.left = Math.random() * 100 + "%";
        star.style.opacity = Math.random() * 0.8 + 0.2;
        star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite alternate`;
        modalBackdrop.appendChild(star);
    }

    // Tạo hiệu ứng nhấp nháy CSS và thêm vào document head
    let styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes twinkle {
        0% { opacity: 0.2; }
        100% { opacity: 1; box-shadow: 0 0 8px 1px white; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes glow {
        0% { box-shadow: 0 0 5px rgba(0, 136, 255, 0.5); }
        100% { box-shadow: 0 0 20px rgba(0, 136, 255, 0.8); }
      }
      @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);

    // Tạo hộp thoại với thiết kế hiện đại hơn
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "rgba(10, 15, 30, 0.9)";
    dialog.style.border = "2px solid rgba(0, 136, 255, 0.7)";
    dialog.style.borderRadius = "15px";
    dialog.style.padding = "35px";
    dialog.style.width = "550px";
    dialog.style.maxWidth = "90%";
    dialog.style.fontFamily = "'Courier New', courier, monospace";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";
    dialog.style.backdropFilter = "blur(10px)";
    dialog.style.boxShadow = "0 0 30px rgba(0, 136, 255, 0.4)";
    dialog.style.animation = "glow 2s infinite alternate, slideDown 0.5s forwards";
    dialog.style.overflow = "hidden";
    dialog.style.position = "relative";

    // Thêm hiệu ứng viền phát sáng
    let glowBorder = document.createElement("div");
    glowBorder.style.position = "absolute";
    glowBorder.style.top = "0";
    glowBorder.style.left = "0";
    glowBorder.style.right = "0";
    glowBorder.style.bottom = "0";
    glowBorder.style.border = "2px solid rgba(0, 136, 255, 0.7)";
    glowBorder.style.borderRadius = "15px";
    glowBorder.style.boxShadow = "inset 0 0 15px rgba(0, 136, 255, 0.5)";
    glowBorder.style.pointerEvents = "none";
    dialog.appendChild(glowBorder);

    // Tiêu đề với hiệu ứng ánh sáng
    let title = document.createElement("h2");
    title.textContent = "CHỌN CHẾ ĐỘ CHƠI";
    title.style.color = "#0088ff";
    title.style.marginBottom = "30px";
    title.style.fontSize = "32px";
    title.style.fontWeight = "bold";
    title.style.textShadow = "0 0 10px rgba(0, 136, 255, 0.8)";
    title.style.letterSpacing = "2px";
    title.style.textTransform = "uppercase";
    title.style.position = "relative";
    title.style.display = "inline-block";
    dialog.appendChild(title);

    // Thêm đường underline phát sáng dưới tiêu đề
    let underline = document.createElement("div");
    underline.style.width = "80%";
    underline.style.height = "3px";
    underline.style.margin = "-20px auto 30px";
    underline.style.background = "linear-gradient(to right, transparent, #0088ff, transparent)";
    underline.style.boxShadow = "0 0 10px #0088ff";
    dialog.appendChild(underline);

    // Tạo container cho các nút chế độ
    let modesContainer = document.createElement("div");
    modesContainer.style.display = "flex";
    modesContainer.style.flexDirection = "column";
    modesContainer.style.gap = "25px";
    modesContainer.style.marginBottom = "30px";

    // Tạo nút chế độ Single Player với hiệu ứng nổi bật
    let singlePlayerButton = createModeButton(
        "SINGLE PLAYER",
        "Chơi một mình, đánh bại các alien và boss",
        "./ship.png",
        "#00ff00"
    );
    singlePlayerButton.onclick = function () {
        playSelectSound();
        gameMode = "single";
        aiEnabled = false;
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    modesContainer.appendChild(singlePlayerButton);

    // Tạo container cho các nút chế độ Versus AI với hiệu ứng ánh sáng
    let versusContainer = document.createElement("div");
    versusContainer.style.display = "flex";
    versusContainer.style.flexDirection = "column";
    versusContainer.style.gap = "15px";
    versusContainer.style.marginBottom = "10px";
    versusContainer.style.background = "rgba(40, 10, 30, 0.4)";
    versusContainer.style.padding = "20px";
    versusContainer.style.borderRadius = "10px";
    versusContainer.style.border = "1px solid rgba(255, 51, 102, 0.3)";
    versusContainer.style.boxShadow = "0 0 20px rgba(255, 51, 102, 0.2)";
    versusContainer.style.animation = "pulse 3s infinite";

    // Tiêu đề Versus AI với hiệu ứng phát sáng
    let versusTitle = document.createElement("h3");
    versusTitle.textContent = "VERSUS AI";
    versusTitle.style.color = "#ff3366";
    versusTitle.style.marginBottom = "10px";
    versusTitle.style.marginTop = "0";
    versusTitle.style.fontSize = "24px";
    versusTitle.style.fontWeight = "bold";
    versusTitle.style.textShadow = "0 0 8px rgba(255, 51, 102, 0.8)";
    versusContainer.appendChild(versusTitle);

    // Mô tả chế độ Versus AI với định dạng tốt hơn
    let versusDesc = document.createElement("p");
    versusDesc.textContent = "Cạnh tranh với AI, người nào đạt điểm số cao hơn sẽ thắng";
    versusDesc.style.fontSize = "14px";
    versusDesc.style.margin = "0 0 15px 0";
    versusDesc.style.color = "#eee";
    versusDesc.style.lineHeight = "1.4";
    versusContainer.appendChild(versusDesc);

    // Tạo container cho các nút độ khó với bố cục cải thiện
    let difficultyContainer = document.createElement("div");
    difficultyContainer.style.display = "flex";
    difficultyContainer.style.justifyContent = "center";
    difficultyContainer.style.gap = "15px";
    difficultyContainer.style.margin = "5px 0";

    // Các nút độ khó với hiệu ứng phát sáng tương ứng
    let easyButton = createDifficultyButton("DỄ", "#32CD32");
    easyButton.onclick = function () {
        playSelectSound();
        gameMode = "versus";
        aiEnabled = true;
        aiShip.difficulty = "easy";
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    difficultyContainer.appendChild(easyButton);

    let mediumButton = createDifficultyButton("TRUNG BÌNH", "#FFA500");
    mediumButton.onclick = function () {
        playSelectSound();
        gameMode = "versus";
        aiEnabled = true;
        aiShip.difficulty = "medium";
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    difficultyContainer.appendChild(mediumButton);

    let hardButton = createDifficultyButton("KHÓ", "#FF4500");
    hardButton.onclick = function () {
        playSelectSound();
        gameMode = "versus";
        aiEnabled = true;
        aiShip.difficulty = "hard";
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    difficultyContainer.appendChild(hardButton);

    versusContainer.appendChild(difficultyContainer);
    modesContainer.appendChild(versusContainer);

    dialog.appendChild(modesContainer);

    // Nút Quay Lại với hiệu ứng đẹp hơn
    let backButton = document.createElement("button");
    backButton.textContent = "QUAY LẠI";
    backButton.style.backgroundColor = "rgba(60, 60, 70, 0.7)";
    backButton.style.color = "white";
    backButton.style.border = "1px solid rgba(255, 255, 255, 0.3)";
    backButton.style.padding = "12px 25px";
    backButton.style.marginTop = "20px";
    backButton.style.cursor = "pointer";
    backButton.style.width = "180px";
    backButton.style.fontFamily = "'Courier New', courier, monospace";
    backButton.style.fontWeight = "bold";
    backButton.style.fontSize = "16px";
    backButton.style.borderRadius = "30px";
    backButton.style.margin = "0 auto";
    backButton.style.display = "block";
    backButton.style.transition = "all 0.3s ease";
    backButton.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";
    backButton.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)";

    // Hiệu ứng hover cải thiện
    backButton.onmouseover = function () {
        backButton.style.backgroundColor = "rgba(80, 80, 90, 0.9)";
        backButton.style.transform = "translateY(-2px)";
        backButton.style.boxShadow = "0 7px 10px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)";
        playHoverSound();
    };
    backButton.onmouseout = function () {
        backButton.style.backgroundColor = "rgba(60, 60, 70, 0.7)";
        backButton.style.transform = "translateY(0)";
        backButton.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)";
    };
    backButton.onmousedown = function () {
        backButton.style.transform = "translateY(1px)";
    };
    backButton.onmouseup = function () {
        backButton.style.transform = "translateY(-2px)";
    };

    backButton.onclick = function () {
        playSelectSound();
        document.body.removeChild(modalBackdrop);
        document.head.removeChild(styleEl);
        showPlayerNameDialog();
    };

    dialog.appendChild(backButton);

    // Thêm hiệu ứng trang trí góc cho dialog
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(position => {
        let corner = document.createElement('div');
        corner.style.position = 'absolute';

        if (position === 'top-left') {
            corner.style.top = '0';
            corner.style.left = '0';
            corner.style.borderTop = '3px solid #0088ff';
            corner.style.borderLeft = '3px solid #0088ff';
            corner.style.borderTopLeftRadius = '13px';
        } else if (position === 'top-right') {
            corner.style.top = '0';
            corner.style.right = '0';
            corner.style.borderTop = '3px solid #0088ff';
            corner.style.borderRight = '3px solid #0088ff';
            corner.style.borderTopRightRadius = '13px';
        } else if (position === 'bottom-left') {
            corner.style.bottom = '0';
            corner.style.left = '0';
            corner.style.borderBottom = '3px solid #0088ff';
            corner.style.borderLeft = '3px solid #0088ff';
            corner.style.borderBottomLeftRadius = '13px';
        } else {
            corner.style.bottom = '0';
            corner.style.right = '0';
            corner.style.borderBottom = '3px solid #0088ff';
            corner.style.borderRight = '3px solid #0088ff';
            corner.style.borderBottomRightRadius = '13px';
        }

        corner.style.width = '20px';
        corner.style.height = '20px';
        corner.style.boxShadow = '0 0 10px rgba(0, 136, 255, 0.8)';
        dialog.appendChild(corner);
    });

    // Thêm vào DOM
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);

    // Tạo hiệu ứng âm thanh khi hiển thị
    playOpenSound();
}

/**
 * Tạo nút chế độ chơi với hiệu ứng hover nâng cao
 */
function createModeButton(title, description, iconSrc, color) {
    let button = document.createElement("div");
    button.style.backgroundColor = "rgba(15, 20, 35, 0.8)";
    button.style.border = `2px solid ${color}`;
    button.style.borderRadius = "12px";
    button.style.padding = "20px";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.cursor = "pointer";
    button.style.transition = "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)";
    button.style.position = "relative";
    button.style.overflow = "hidden";

    // Thêm hiệu ứng phát sáng cho viền
    button.style.boxShadow = `0 0 15px rgba(${color === "#00ff00" ? "0, 255, 0" : "255, 51, 102"}, 0.2)`;

    // Thêm hiệu ứng gradient nhẹ
    button.style.background = color === "#00ff00"
        ? "linear-gradient(145deg, rgba(15, 35, 20, 0.9), rgba(15, 20, 35, 0.8))"
        : "linear-gradient(145deg, rgba(35, 15, 25, 0.9), rgba(15, 20, 35, 0.8))";

    // Hiệu ứng hover nâng cao
    button.onmouseover = function () {
        button.style.backgroundColor = "rgba(30, 40, 60, 0.9)";
        button.style.transform = "translateY(-4px) scale(1.02)";
        button.style.boxShadow = `0 10px 20px rgba(${color === "#00ff00" ? "0, 255, 0" : "255, 51, 102"}, 0.4)`;
        playHoverSound();
    };
    button.onmouseout = function () {
        button.style.backgroundColor = color === "#00ff00"
            ? "linear-gradient(145deg, rgba(15, 35, 20, 0.9), rgba(15, 20, 35, 0.8))"
            : "linear-gradient(145deg, rgba(35, 15, 25, 0.9), rgba(15, 20, 35, 0.8))";
        button.style.transform = "translateY(0) scale(1)";
        button.style.boxShadow = `0 0 15px rgba(${color === "#00ff00" ? "0, 255, 0" : "255, 51, 102"}, 0.2)`;
    };
    button.onmousedown = function () {
        button.style.transform = "translateY(-2px) scale(0.98)";
    };
    button.onmouseup = function () {
        button.style.transform = "translateY(-4px) scale(1.02)";
    };

    // Container cho icon với hiệu ứng đặc biệt
    let iconContainer = document.createElement("div");
    iconContainer.style.width = "64px";
    iconContainer.style.height = "64px";
    iconContainer.style.borderRadius = "50%";
    iconContainer.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    iconContainer.style.display = "flex";
    iconContainer.style.justifyContent = "center";
    iconContainer.style.alignItems = "center";
    iconContainer.style.marginRight = "20px";
    iconContainer.style.border = `1px solid ${color}`;
    iconContainer.style.boxShadow = `0 0 10px ${color}`;
    iconContainer.style.flexShrink = "0";

    // Icon
    let icon = document.createElement("img");
    icon.src = iconSrc;
    icon.style.width = "42px";
    icon.style.height = "42px";
    icon.style.filter = "drop-shadow(0 0 3px white)";

    // Xử lý lỗi khi tải hình ảnh
    icon.onerror = function () {
        // Tạo fallback icon đẹp hơn
        let fallbackIcon = document.createElement("div");
        fallbackIcon.style.width = "42px";
        fallbackIcon.style.height = "42px";
        fallbackIcon.style.backgroundColor = color;
        fallbackIcon.style.borderRadius = "8px";
        fallbackIcon.style.display = "flex";
        fallbackIcon.style.justifyContent = "center";
        fallbackIcon.style.alignItems = "center";
        fallbackIcon.style.color = "white";
        fallbackIcon.style.fontWeight = "bold";
        fallbackIcon.style.fontSize = "24px";
        fallbackIcon.style.textShadow = "0 0 5px rgba(0, 0, 0, 0.5)";
        fallbackIcon.style.boxShadow = "inset 0 0 10px rgba(255, 255, 255, 0.3)";
        fallbackIcon.textContent = title.charAt(0);
        iconContainer.replaceChild(fallbackIcon, icon);
    };

    iconContainer.appendChild(icon);
    button.appendChild(iconContainer);

    // Container cho text với kiểu dáng cải tiến
    let textContainer = document.createElement("div");
    textContainer.style.textAlign = "left";
    textContainer.style.flexGrow = "1";

    // Tiêu đề với hiệu ứng text shadow
    let titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.margin = "0 0 8px 0";
    titleElement.style.color = color;
    titleElement.style.fontSize = "20px";
    titleElement.style.fontWeight = "bold";
    titleElement.style.textShadow = `0 0 8px rgba(${color === "#00ff00" ? "0, 255, 0" : "255, 51, 102"}, 0.7)`;
    textContainer.appendChild(titleElement);

    // Mô tả với màu sắc và font cải tiến
    let descElement = document.createElement("p");
    descElement.textContent = description;
    descElement.style.margin = "0";
    descElement.style.fontSize = "15px";
    descElement.style.color = "#ddd";
    descElement.style.lineHeight = "1.4";
    textContainer.appendChild(descElement);

    button.appendChild(textContainer);

    // Thêm biểu tượng mũi tên sang phải
    let arrowContainer = document.createElement("div");
    arrowContainer.style.marginLeft = "15px";
    arrowContainer.style.opacity = "0.7";
    arrowContainer.style.transition = "all 0.3s";

    let arrow = document.createElement("div");
    arrow.innerHTML = "&#10095;"; // Unicode arrow character
    arrow.style.fontSize = "20px";
    arrow.style.color = color;
    arrow.style.textShadow = `0 0 5px ${color}`;
    arrowContainer.appendChild(arrow);

    button.appendChild(arrowContainer);

    // Hiệu ứng hover cho mũi tên
    button.addEventListener("mouseover", function () {
        arrowContainer.style.transform = "translateX(5px)";
        arrowContainer.style.opacity = "1";
    });

    button.addEventListener("mouseout", function () {
        arrowContainer.style.transform = "translateX(0)";
        arrowContainer.style.opacity = "0.7";
    });

    return button;
}

/**
 * Tạo nút độ khó với hiệu ứng hover cải tiến
 */
function createDifficultyButton(text, color) {
    let button = document.createElement("button");
    button.textContent = text;
    button.style.backgroundColor = "rgba(30, 30, 35, 0.7)";
    button.style.color = "white";
    button.style.border = `2px solid ${color}`;
    button.style.borderRadius = "30px";
    button.style.padding = "10px 20px";
    button.style.cursor = "pointer";
    button.style.fontFamily = "'Courier New', courier, monospace";
    button.style.fontWeight = "bold";
    button.style.fontSize = "14px";
    button.style.flex = "1";
    button.style.transition = "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)";
    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.style.minWidth = "100px";
    button.style.boxShadow = `0 0 10px rgba(${colorToRgb(color)}, 0.3)`;
    button.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";

    // Hiệu ứng hover cải tiến
    button.onmouseover = function () {
        button.style.backgroundColor = color;
        button.style.color = "black";
        button.style.transform = "scale(1.08)";
        button.style.boxShadow = `0 0 15px ${color}`;
        playHoverSound();
    };
    button.onmouseout = function () {
        button.style.backgroundColor = "rgba(30, 30, 35, 0.7)";
        button.style.color = "white";
        button.style.transform = "scale(1)";
        button.style.boxShadow = `0 0 10px rgba(${colorToRgb(color)}, 0.3)`;
    };
    button.onmousedown = function () {
        button.style.transform = "scale(0.95)";
    };
    button.onmouseup = function () {
        button.style.transform = "scale(1.08)";
    };

    return button;
}

/**
 * Hàm chuyển đổi mã màu hex sang RGB để sử dụng trong các hiệu ứng
 */
function colorToRgb(hex) {
    // Loại bỏ ký tự #
    hex = hex.replace('#', '');

    // Chuyển đổi thành RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}

/**
 * Hiệu ứng âm thanh
 */
function playHoverSound() {
    try {
        // Tạo âm thanh nhẹ khi hover
        let hoverSound = new Audio();
        hoverSound.volume = 0.2;

        // Kiểm tra xem trình duyệt có hỗ trợ AudioContext không
        if (window.AudioContext || window.webkitAudioContext) {
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let oscillator = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1800, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        }
    } catch (e) {
        // Bỏ qua lỗi âm thanh nếu có
        console.log("Sound effect not supported", e);
    }
}

function playSelectSound() {
    try {
        // Tạo âm thanh khi chọn
        if (window.AudioContext || window.webkitAudioContext) {
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let oscillator = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(900, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.log("Sound effect not supported", e);
    }
}

function playOpenSound() {
    try {
        // Tạo âm thanh khi mở dialog
        if (window.AudioContext || window.webkitAudioContext) {
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let oscillator = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {
        console.log("Sound effect not supported", e);
    }
}

// Export hàm để sử dụng từ space.js
window.showGameModeSelection = showGameModeSelection;
window.createModeButton = createModeButton;
window.createDifficultyButton = createDifficultyButton;
