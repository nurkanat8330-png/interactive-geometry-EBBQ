/**
 * ИНТЕРАКТИВТІ АНИМАЦИЯЛЫҚ СУРЕТТЕР МЕН СИМУЛЯТОРЛАР КЕШЕНІ (19 ТАҚЫРЫП)
 * Canvas 2D және 3D wireframe қозғалтқыштары арқылы орындалған
 */

const GeoAnimations = {
    activeAnimId: null,
    canvas: null,
    ctx: null,
    currentType: null,
    state: {},
    speedMultiplier: 1.0,

    setSpeed(speed) {
        this.speedMultiplier = speed;
    },

    init(containerId, animType) {
        if (this.activeAnimId) {
            cancelAnimationFrame(this.activeAnimId);
            this.activeAnimId = null;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = "";
        this.currentType = animType;
        this.state = {};

        // Canvas жасау
        const canvas = document.createElement("canvas");
        canvas.className = "w-full rounded-2xl shadow-inner bg-slate-900 border border-slate-700/60 block";
        canvas.width = 680;
        canvas.height = 380;
        container.appendChild(canvas);

        // Төменгі басқару панелі
        const controls = document.createElement("div");
        controls.className = "mt-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-slate-200 text-xs flex flex-wrap items-center justify-between gap-3";
        controls.id = "anim-controls-panel";
        container.appendChild(controls);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Тақырып бойынша симуляторды баптау
        this.setupAnimation(animType, controls);
    },

    setupAnimation(type, controls) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        let t = 0;

        switch (type) {
            // ================= 7-СЫНЫП =================
            case "triangle_types": {
                this.state = { mode: "scalene", angleA: 40, t: 0 };
                controls.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-sky-400">Үшбұрыш түрін таңдаңыз:</span>
                        <button class="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 rounded text-white font-medium" onclick="GeoAnimations.setTriangleMode('equilateral')">Тең қабырғалы</button>
                        <button class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-medium" onclick="GeoAnimations.setTriangleMode('isosceles')">Тең бүйірлі</button>
                        <button class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 rounded text-white font-medium" onclick="GeoAnimations.setTriangleMode('right')">Тік бұрышты</button>
                        <button class="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 rounded text-white font-medium" onclick="GeoAnimations.setTriangleMode('obtuse')">Доғал бұрышты</button>
                    </div>
                    <div id="triangle-status" class="text-xs font-mono text-cyan-300"></div>
                `;

                const loop = () => {
                    t += 0.03 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    let p1 = { x: 180, y: 300 };
                    let p2 = { x: 500, y: 300 };
                    let p3 = { x: 340, y: 100 };

                    const mode = this.state.mode || "scalene";
                    if (mode === "equilateral") {
                        p1 = { x: 200, y: 290 };
                        p2 = { x: 480, y: 290 };
                        p3 = { x: 340, y: 290 - 280 * Math.sin(Math.PI / 3) };
                    } else if (mode === "isosceles") {
                        const osc = Math.sin(t) * 20;
                        p1 = { x: 180, y: 290 };
                        p2 = { x: 500, y: 290 };
                        p3 = { x: 340, y: 90 + osc };
                    } else if (mode === "right") {
                        p1 = { x: 200, y: 290 };
                        p2 = { x: 500, y: 290 };
                        p3 = { x: 200, y: 100 };
                    } else if (mode === "obtuse") {
                        const osc = Math.sin(t) * 15;
                        p1 = { x: 260, y: 290 };
                        p2 = { x: 520, y: 290 };
                        p3 = { x: 140 + osc, y: 130 };
                    }

                    // Үшбұрышты салу
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#38bdf8";
                    ctx.stroke();

                    // Төбелері
                    this.drawPoint(ctx, p1.x, p1.y, "A (p1)", "#38bdf8");
                    this.drawPoint(ctx, p2.x, p2.y, "B (p2)", "#38bdf8");
                    this.drawPoint(ctx, p3.x, p3.y, "C (p3)", "#f43f5e");

                    // Бұрыштар мен қабырғаларды есептеу
                    const a = Math.round(Math.hypot(p2.x - p3.x, p2.y - p3.y) / 5);
                    const b = Math.round(Math.hypot(p1.x - p3.x, p1.y - p3.y) / 5);
                    const c = Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 5);

                    // Тік бұрыш белгісі
                    if (mode === "right") {
                        ctx.strokeStyle = "#fbbf24";
                        ctx.strokeRect(p1.x, p1.y - 20, 20, 20);
                    }

                    // Мәлімет жазу
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText(`a = ${a} см,  b = ${b} см,  c = ${c} см`, 20, 30);
                    ctx.fillStyle = "#38bdf8";
                    ctx.fillText(`Ішкі бұрыштар қосындысы: 180°`, 20, 52);

                    const status = document.getElementById("triangle-status");
                    if (status) {
                        status.textContent = `Күйі: ${mode.toUpperCase()} (Динамикалық қозғалыс белсенді)`;
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "triangle_elements": {
                this.state = { showMedian: true, showBisector: false, showAltitude: false, showMidsegment: false };
                controls.innerHTML = `
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-sky-400">Элементтер:</span>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked onchange="GeoAnimations.state.showMedian = this.checked"> <span class="text-emerald-400 font-semibold">Медиана (Центроид)</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" onchange="GeoAnimations.state.showBisector = this.checked"> <span class="text-cyan-400 font-semibold">Биссектриса (Инцентр)</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" onchange="GeoAnimations.state.showAltitude = this.checked"> <span class="text-rose-400 font-semibold">Биіктік (Ортоцентр)</span></label>
                        <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" onchange="GeoAnimations.state.showMidsegment = this.checked"> <span class="text-amber-400 font-semibold">Орта сызық</span></label>
                    </div>
                `;

                const loop = () => {
                    t += 0.02 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const A = { x: 140, y: 310 };
                    const B = { x: 540, y: 310 };
                    const C = { x: 300 + Math.sin(t) * 35, y: 90 };

                    // Негізгі үшбұрыш
                    ctx.beginPath();
                    ctx.moveTo(A.x, A.y);
                    ctx.lineTo(B.x, B.y);
                    ctx.lineTo(C.x, C.y);
                    ctx.closePath();
                    ctx.strokeStyle = "#94a3b8";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    // 1. Медианалар
                    if (this.state.showMedian) {
                        const mAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
                        const mBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
                        const mAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
                        const centroid = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

                        ctx.strokeStyle = "#34d399";
                        ctx.lineWidth = 2;
                        this.drawLine(ctx, C, mAB);
                        this.drawLine(ctx, A, mBC);
                        this.drawLine(ctx, B, mAC);
                        this.drawPoint(ctx, centroid.x, centroid.y, "Центроид (2:1)", "#34d399", 6);
                    }

                    // 2. Биіктіктер
                    if (this.state.showAltitude) {
                        const hC = { x: C.x, y: A.y };
                        ctx.strokeStyle = "#fb7185";
                        ctx.setLineDash([5, 4]);
                        this.drawLine(ctx, C, hC);
                        ctx.setLineDash([]);
                        this.drawPoint(ctx, hC.x, hC.y, "H", "#fb7185", 4);
                    }

                    // 3. Орта сызық
                    if (this.state.showMidsegment) {
                        const mAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
                        const mBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
                        ctx.strokeStyle = "#facc15";
                        ctx.lineWidth = 3;
                        this.drawLine(ctx, mAC, mBC);
                        ctx.fillStyle = "#facc15";
                        ctx.font = "bold 12px sans-serif";
                        ctx.fillText("Орта сызық (m = a / 2)", (mAC.x + mBC.x) / 2 - 40, mAC.y - 10);
                    }

                    this.drawPoint(ctx, A.x, A.y, "A", "#cbd5e1");
                    this.drawPoint(ctx, B.x, B.y, "B", "#cbd5e1");
                    this.drawPoint(ctx, C.x, C.y, "C", "#cbd5e1");

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "circle_elements": {
                this.state = { radius: 110, angle: 60 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Радиус (R):</span>
                        <input type="range" min="60" max="130" value="110" oninput="GeoAnimations.state.radius = +this.value">
                        <span>Сектор бұрышы (α):</span>
                        <input type="range" min="15" max="300" value="60" oninput="GeoAnimations.state.angle = +this.value">
                    </div>
                `;

                const loop = () => {
                    t += 0.02 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const R = this.state.radius;
                    const alpha = (this.state.angle * Math.PI) / 180;

                    // Дөңгелек
                    ctx.beginPath();
                    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    // Секторды бояу
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, R, 0, alpha);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
                    ctx.fill();

                    // Хорда
                    const p1 = { x: cx + R, y: cy };
                    const p2 = { x: cx + R * Math.cos(alpha), y: cy + R * Math.sin(alpha) };
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = "#f43f5e";
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    // Диаметр
                    ctx.strokeStyle = "#94a3b8";
                    ctx.setLineDash([4, 4]);
                    this.drawLine(ctx, { x: cx - R, y: cy }, { x: cx + R, y: cy });
                    ctx.setLineDash([]);

                    this.drawPoint(ctx, cx, cy, "O", "#facc15", 5);
                    this.drawPoint(ctx, p1.x, p1.y, "A", "#38bdf8", 4);
                    this.drawPoint(ctx, p2.x, p2.y, "B", "#38bdf8", 4);

                    // Мәлімет
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 13px system-ui";
                    ctx.fillText(`R = ${R} px,  α = ${this.state.angle}°`, 20, 30);
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText(`Қызыл кесінді: AB Хордасы`, 20, 52);
                    ctx.fillStyle = "#38bdf8";
                    ctx.fillText(`C = 2πR,  S = πR²`, 20, 74);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "length_area": {
                this.state = { width: 6, height: 4 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Ені (a):</span>
                        <input type="range" min="2" max="10" value="6" oninput="GeoAnimations.state.width = +this.value">
                        <span>Биіктігі (b):</span>
                        <input type="range" min="2" max="6" value="4" oninput="GeoAnimations.state.height = +this.value">
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const scale = 32;
                    const w = this.state.width;
                    const h = this.state.height;
                    const ox = 120;
                    const oy = 80;

                    // Торкөздерді салу
                    for (let i = 0; i < w; i++) {
                        for (let j = 0; j < h; j++) {
                            ctx.fillStyle = ((i + j) % 2 === 0) ? "rgba(14, 165, 233, 0.4)" : "rgba(14, 165, 233, 0.2)";
                            ctx.fillRect(ox + i * scale, oy + j * scale, scale, scale);
                            ctx.strokeStyle = "#38bdf8";
                            ctx.strokeRect(ox + i * scale, oy + j * scale, scale, scale);
                        }
                    }

                    // Диагональ арқылы үшбұрыш бөлу
                    ctx.beginPath();
                    ctx.moveTo(ox, oy);
                    ctx.lineTo(ox + w * scale, oy + h * scale);
                    ctx.strokeStyle = "#f43f5e";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Түсініктеме
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 15px system-ui";
                    ctx.fillText(`Тіктөртбұрыш: a = ${w},  b = ${h} бірлік`, 20, 30);
                    ctx.fillStyle = "#38bdf8";
                    ctx.fillText(`Ауданы: S = a · b = ${w * h} шаршы бірлік`, 20, 54);
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText(`Үшбұрыш ауданы: S = (1/2)ab = ${(w * h) / 2} шаршы бірлік`, 20, 78);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "line_circle": {
                this.state = { dist: 130, R: 90 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Центрден түзуге қашықтық (d):</span>
                        <input type="range" min="0" max="180" value="130" oninput="GeoAnimations.state.dist = +this.value">
                        <button class="px-2 py-0.5 bg-blue-600 rounded text-xs" onclick="GeoAnimations.state.dist = 90">Жанама (d = R)</button>
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const cx = 340;
                    const cy = 190;
                    const R = this.state.R;
                    const d = this.state.dist;

                    // Шеңбер
                    ctx.beginPath();
                    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Түзу
                    const lineY = cy - d;
                    ctx.beginPath();
                    ctx.moveTo(60, lineY);
                    ctx.lineTo(620, lineY);
                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Перпендикуляр қашықтық
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.setLineDash([4, 4]);
                    this.drawLine(ctx, { x: cx, y: cy }, { x: cx, y: lineY });
                    ctx.setLineDash([]);

                    this.drawPoint(ctx, cx, cy, "Центр O", "#38bdf8", 5);

                    // Күйін анықтау
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText(`R = ${R} px,  d = ${d} px`, 20, 30);

                    if (d > R) {
                        ctx.fillStyle = "#ef4444";
                        ctx.fillText(`Күйі: d > R — Ортақ нүктесі жоқ (0 нүкте)`, 20, 55);
                    } else if (d === R) {
                        ctx.fillStyle = "#10b981";
                        ctx.fillText(`Күйі: d = R — ЖАНАМА ТҮЗУ (1 ортақ нүкте, перпендикуляр)`, 20, 55);
                        this.drawPoint(ctx, cx, lineY, "Жанасу нүктесі", "#10b981", 6);
                    } else {
                        ctx.fillStyle = "#38bdf8";
                        ctx.fillText(`Күйі: d < R — ҚИЮШЫ ТҮЗУ (2 ортақ нүкте)`, 20, 55);
                        const dx = Math.sqrt(R * R - d * d);
                        this.drawPoint(ctx, cx - dx, lineY, "A", "#f43f5e", 5);
                        this.drawPoint(ctx, cx + dx, lineY, "B", "#f43f5e", 5);
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "two_circles": {
                this.state = { d: 180, R1: 75, R2: 45 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Центрлер қашықтығы (d):</span>
                        <input type="range" min="0" max="220" value="180" oninput="GeoAnimations.state.d = +this.value">
                        <button class="px-2 py-0.5 bg-sky-600 rounded text-xs" onclick="GeoAnimations.state.d = 120">Сырттай жанасу (d=R₁+R₂)</button>
                        <button class="px-2 py-0.5 bg-emerald-600 rounded text-xs" onclick="GeoAnimations.state.d = 30">Іштей жанасу (d=R₁-R₂)</button>
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const c1 = { x: 250, y: 190 };
                    const d = this.state.d;
                    const c2 = { x: 250 + d, y: 190 };
                    const R1 = this.state.R1;
                    const R2 = this.state.R2;

                    // Шеңбер 1
                    ctx.beginPath();
                    ctx.arc(c1.x, c1.y, R1, 0, 2 * Math.PI);
                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Шеңбер 2
                    ctx.beginPath();
                    ctx.arc(c2.x, c2.y, R2, 0, 2 * Math.PI);
                    ctx.strokeStyle = "#f43f5e";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    this.drawPoint(ctx, c1.x, c1.y, "O₁", "#38bdf8", 4);
                    this.drawPoint(ctx, c2.x, c2.y, "O₂", "#f43f5e", 4);

                    // Күй
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 13px system-ui";
                    ctx.fillText(`R₁ = ${R1},  R₂ = ${R2},  d = ${d}`, 20, 30);

                    let status = "";
                    let color = "#38bdf8";
                    if (d === 0) {
                        status = "Концентрлі шеңберлер (d = 0)";
                        color = "#a855f7";
                    } else if (d < Math.abs(R1 - R2)) {
                        status = "Бірі екіншісінің ішінде (ортақ нүкте жоқ)";
                        color = "#ec4899";
                    } else if (d === Math.abs(R1 - R2)) {
                        status = "Іштей жанасады (d = |R₁ - R₂|, 1 ортақ нүкте)";
                        color = "#10b981";
                    } else if (d < R1 + R2) {
                        status = "Қиылысады (|R₁ - R₂| < d < R₁ + R₂, 2 ортақ нүкте)";
                        color = "#eab308";
                    } else if (d === R1 + R2) {
                        status = "Сырттай жанасады (d = R₁ + R₂, 1 ортақ нүкте)";
                        color = "#06b6d4";
                    } else {
                        status = "Сырттай ортақ нүктесіз (d > R₁ + R₂)";
                        color = "#94a3b8";
                    }

                    ctx.fillStyle = color;
                    ctx.fillText(`Орналасуы: ${status}`, 20, 54);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            // ================= 8-СЫНЫП =================
            case "parallelogram_lab": {
                this.state = { shear: 40 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Қисаю бұрышы / ығысу:</span>
                        <input type="range" min="0" max="80" value="40" oninput="GeoAnimations.state.shear = +this.value">
                    </div>
                `;

                const loop = () => {
                    t += 0.02 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const s = this.state.shear + Math.sin(t) * 10;
                    const pA = { x: 180, y: 270 };
                    const pB = { x: 420, y: 270 };
                    const pC = { x: 420 + s, y: 130 };
                    const pD = { x: 180 + s, y: 130 };

                    ctx.beginPath();
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.lineTo(pC.x, pC.y);
                    ctx.lineTo(pD.x, pD.y);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
                    ctx.fill();
                    ctx.strokeStyle = "#818cf8";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Диагональдар
                    ctx.strokeStyle = "#fbbf24";
                    ctx.setLineDash([4, 4]);
                    this.drawLine(ctx, pA, pC);
                    this.drawLine(ctx, pB, pD);
                    ctx.setLineDash([]);

                    const mid = { x: (pA.x + pC.x) / 2, y: (pA.y + pC.y) / 2 };
                    this.drawPoint(ctx, mid.x, mid.y, "O (қақ бөлінеді)", "#fbbf24", 5);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 13px system-ui";
                    ctx.fillText("Қарсы қабырғалар тең: AB = CD,  BC = AD", 20, 30);
                    ctx.fillStyle = "#818cf8";
                    ctx.fillText("Диагональдары қиылысу нүктесінде қақ бөлінеді", 20, 52);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "rhombus_lab": {
                this.state = { d1: 180, d2: 110 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Көлденең диагональ (d₁):</span>
                        <input type="range" min="100" max="260" value="180" oninput="GeoAnimations.state.d1 = +this.value">
                        <span>Тік диагональ (d₂):</span>
                        <input type="range" min="70" max="180" value="110" oninput="GeoAnimations.state.d2 = +this.value">
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const dx = this.state.d1 / 2;
                    const dy = this.state.d2 / 2;

                    const p1 = { x: cx - dx, y: cy };
                    const p2 = { x: cx, y: cy - dy };
                    const p3 = { x: cx + dx, y: cy };
                    const p4 = { x: cx, y: cy + dy };

                    // Ромб салу
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(244, 63, 94, 0.2)";
                    ctx.fill();
                    ctx.strokeStyle = "#f43f5e";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Перпендикуляр диагональдар
                    ctx.strokeStyle = "#38bdf8";
                    this.drawLine(ctx, p1, p3);
                    this.drawLine(ctx, p2, p4);

                    // Тік бұрыш белгісі
                    ctx.strokeStyle = "#facc15";
                    ctx.strokeRect(cx, cy - 15, 15, 15);

                    const a = Math.round(Math.hypot(dx, dy));
                    const S = Math.round(0.5 * this.state.d1 * this.state.d2);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 13px system-ui";
                    ctx.fillText(`Қабырғасы: a = ${a} px (барлығы тең)`, 20, 30);
                    ctx.fillStyle = "#facc15";
                    ctx.fillText(`Диагональдары: d₁ = ${this.state.d1}, d₂ = ${this.state.d2} (90° перпендикуляр)`, 20, 52);
                    ctx.fillStyle = "#38bdf8";
                    ctx.fillText(`Ауданы: S = (1/2) · d₁ · d₂ = ${S} px²`, 20, 74);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "trapezoid_lab": {
                this.state = { a: 140, b: 280, h: 120 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Жоғарғы табан (a):</span>
                        <input type="range" min="60" max="200" value="140" oninput="GeoAnimations.state.a = +this.value">
                        <span>Төменгі табан (b):</span>
                        <input type="range" min="180" max="360" value="280" oninput="GeoAnimations.state.b = +this.value">
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const cx = canvas.width / 2;
                    const a = this.state.a;
                    const b = this.state.b;
                    const h = this.state.h;
                    const y1 = 120;
                    const y2 = 120 + h;

                    const p1 = { x: cx - a / 2, y: y1 };
                    const p2 = { x: cx + a / 2, y: y1 };
                    const p3 = { x: cx + b / 2, y: y2 };
                    const p4 = { x: cx - b / 2, y: y2 };

                    // Трапеция
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(20, 184, 166, 0.2)";
                    ctx.fill();
                    ctx.strokeStyle = "#14b8a6";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Орта сызық
                    const m1 = { x: (p1.x + p4.x) / 2, y: (y1 + y2) / 2 };
                    const m2 = { x: (p2.x + p3.x) / 2, y: (y1 + y2) / 2 };
                    ctx.strokeStyle = "#facc15";
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([6, 4]);
                    this.drawLine(ctx, m1, m2);
                    ctx.setLineDash([]);

                    // Биіктік
                    ctx.strokeStyle = "#ef4444";
                    this.drawLine(ctx, p1, { x: p1.x, y: y2 });

                    const mid = (a + b) / 2;
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 13px system-ui";
                    ctx.fillText(`Табандары: a = ${a},  b = ${b}`, 20, 30);
                    ctx.fillStyle = "#facc15";
                    ctx.fillText(`Орта сызық: m = (a + b)/2 = ${mid}`, 20, 52);
                    ctx.fillStyle = "#14b8a6";
                    ctx.fillText(`Аудан: S = m · h = ${mid * h}`, 20, 74);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "inscribed_quad": {
                this.state = { mode: "inscribed" };
                controls.innerHTML = `
                    <div class="flex items-center gap-2">
                        <button class="px-3 py-1 bg-violet-600 rounded text-white" onclick="GeoAnimations.state.mode = 'inscribed'">Шеңберге ІШТЕЙ сызылған</button>
                        <button class="px-3 py-1 bg-emerald-600 rounded text-white" onclick="GeoAnimations.state.mode = 'circumscribed'">Шеңберге СЫРТТАЙ сызылған</button>
                    </div>
                `;

                const loop = () => {
                    t += 0.02 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const R = 95;

                    ctx.beginPath();
                    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
                    ctx.strokeStyle = "#94a3b8";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    if (this.state.mode === "inscribed") {
                        // Төбелер шеңберде
                        const angs = [0.3 + Math.sin(t) * 0.1, 1.8, 3.4, 5.0];
                        const pts = angs.map(a => ({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }));

                        ctx.beginPath();
                        ctx.moveTo(pts[0].x, pts[0].y);
                        pts.forEach(p => ctx.lineTo(p.x, p.y));
                        ctx.closePath();
                        ctx.fillStyle = "rgba(139, 92, 246, 0.2)";
                        ctx.fill();
                        ctx.strokeStyle = "#a78bfa";
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        pts.forEach((p, i) => this.drawPoint(ctx, p.x, p.y, ["A", "B", "C", "D"][i], "#a78bfa", 4));

                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Іштей сызылған төртбұрыш:", 20, 30);
                        ctx.fillStyle = "#a78bfa";
                        ctx.fillText("∠A + ∠C = 180°  және  ∠B + ∠D = 180°", 20, 55);
                    } else {
                        // Сырттай сызылған ромб / төртбұрыш
                        const p1 = { x: cx - 140, y: cy };
                        const p2 = { x: cx, y: cy - 140 };
                        const p3 = { x: cx + 140, y: cy };
                        const p4 = { x: cx, y: cy + 140 };

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(p3.x, p3.y);
                        ctx.lineTo(p4.x, p4.y);
                        ctx.closePath();
                        ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
                        ctx.fill();
                        ctx.strokeStyle = "#10b981";
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Сырттай сызылған төртбұрыш:", 20, 30);
                        ctx.fillStyle = "#10b981";
                        ctx.fillText("Қарсы қабырғалар қосындысы тең: a + c = b + d", 20, 55);
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "pythagoras_proof": {
                this.state = { a: 3, b: 4 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Катет a:</span>
                        <input type="range" min="2" max="5" value="3" oninput="GeoAnimations.state.a = +this.value">
                        <span>Катет b:</span>
                        <input type="range" min="2" max="6" value="4" oninput="GeoAnimations.state.b = +this.value">
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const scale = 24;
                    const a = this.state.a * scale;
                    const b = this.state.b * scale;
                    const ox = 260;
                    const oy = 240;

                    // Үшбұрыш
                    ctx.beginPath();
                    ctx.moveTo(ox, oy);
                    ctx.lineTo(ox + b, oy);
                    ctx.lineTo(ox, oy - a);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
                    ctx.fill();
                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // a² шаршысы (сол жақта)
                    ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
                    ctx.fillRect(ox - a, oy - a, a, a);
                    ctx.strokeStyle = "#f43f5e";
                    ctx.strokeRect(ox - a, oy - a, a, a);

                    // b² шаршысы (төменде)
                    ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
                    ctx.fillRect(ox, oy, b, b);
                    ctx.strokeStyle = "#10b981";
                    ctx.strokeRect(ox, oy, b, b);

                    const cVal = Math.round(Math.hypot(this.state.a, this.state.b) * 10) / 10;

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 15px system-ui";
                    ctx.fillText(`a = ${this.state.a},  b = ${this.state.b}  ⇒  c = √(a² + b²) = ${cVal}`, 20, 30);
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText(`Қызыл шаршы: a² = ${this.state.a ** 2}`, 20, 55);
                    ctx.fillStyle = "#10b981";
                    ctx.fillText(`Жасыл шаршы: b² = ${this.state.b ** 2}`, 20, 78);
                    ctx.fillStyle = "#facc15";
                    ctx.fillText(`a² + b² = ${this.state.a ** 2 + this.state.b ** 2} = c²`, 20, 101);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "conic_sections": {
                this.state = { mode: "ellipse" };
                controls.innerHTML = `
                    <div class="flex items-center gap-2">
                        <button class="px-3 py-1 bg-sky-600 rounded text-white" onclick="GeoAnimations.state.mode = 'ellipse'">Эллипс (x²/a² + y²/b² = 1)</button>
                        <button class="px-3 py-1 bg-purple-600 rounded text-white" onclick="GeoAnimations.state.mode = 'hyperbola'">Гипербола (x²/a² - y²/b² = 1)</button>
                        <button class="px-3 py-1 bg-amber-600 rounded text-white" onclick="GeoAnimations.state.mode = 'parabola'">Парабола (y² = 2px)</button>
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;

                    // Осьтер
                    ctx.strokeStyle = "#475569";
                    this.drawLine(ctx, { x: 40, y: cy }, { x: canvas.width - 40, y: cy });
                    this.drawLine(ctx, { x: cx, y: 30 }, { x: cx, y: canvas.height - 30 });

                    const mode = this.state.mode;
                    if (mode === "ellipse") {
                        const a = 140;
                        const b = 80;
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, a, b, 0, 0, 2 * Math.PI);
                        ctx.strokeStyle = "#38bdf8";
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        const c = Math.sqrt(a * a - b * b);
                        this.drawPoint(ctx, cx - c, cy, "F₁", "#f43f5e", 4);
                        this.drawPoint(ctx, cx + c, cy, "F₂", "#f43f5e", 4);

                        ctx.fillStyle = "#38bdf8";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Эллипс: x²/a² + y²/b² = 1 (e = c/a < 1)", 20, 30);
                    } else if (mode === "hyperbola") {
                        const a = 60;
                        const b = 50;
                        ctx.strokeStyle = "#c084fc";
                        ctx.lineWidth = 3;

                        // Оң тармағы
                        ctx.beginPath();
                        for (let y = -120; y <= 120; y += 4) {
                            const x = a * Math.sqrt(1 + (y * y) / (b * b));
                            if (y === -120) ctx.moveTo(cx + x, cy + y);
                            else ctx.lineTo(cx + x, cy + y);
                        }
                        ctx.stroke();

                        // Сол тармағы
                        ctx.beginPath();
                        for (let y = -120; y <= 120; y += 4) {
                            const x = -a * Math.sqrt(1 + (y * y) / (b * b));
                            if (y === -120) ctx.moveTo(cx + x, cy + y);
                            else ctx.lineTo(cx + x, cy + y);
                        }
                        ctx.stroke();

                        ctx.fillStyle = "#c084fc";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Гипербола: x²/a² - y²/b² = 1 (e > 1)", 20, 30);
                    } else if (mode === "parabola") {
                        const p = 40;
                        ctx.strokeStyle = "#f59e0b";
                        ctx.lineWidth = 3;

                        ctx.beginPath();
                        for (let y = -140; y <= 140; y += 4) {
                            const x = (y * y) / (2 * p);
                            if (y === -140) ctx.moveTo(cx - 100 + x, cy + y);
                            else ctx.lineTo(cx - 100 + x, cy + y);
                        }
                        ctx.stroke();

                        this.drawPoint(ctx, cx - 100 + p / 2, cy, "F", "#f43f5e", 4);

                        ctx.fillStyle = "#f59e0b";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Парабола: y² = 2px (e = 1)", 20, 30);
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            // ================= 9-СЫНЫП =================
            case "vector_addition": {
                this.state = { mode: "triangle" };
                controls.innerHTML = `
                    <div class="flex items-center gap-2">
                        <button class="px-3 py-1 bg-sky-600 rounded text-white" onclick="GeoAnimations.state.mode = 'triangle'">Үшбұрыш ережесі</button>
                        <button class="px-3 py-1 bg-emerald-600 rounded text-white" onclick="GeoAnimations.state.mode = 'parallelogram'">Параллелограмм ережесі</button>
                        <button class="px-3 py-1 bg-rose-600 rounded text-white" onclick="GeoAnimations.state.mode = 'subtraction'">Азайту (a - b)</button>
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const ox = 180;
                    const oy = 230;
                    const va = { x: 180, y: -90 };
                    const vb = { x: 140, y: 50 };

                    if (this.state.mode === "triangle") {
                        this.drawArrow(ctx, ox, oy, ox + va.x, oy + va.y, "#38bdf8", "a⃗");
                        this.drawArrow(ctx, ox + va.x, oy + va.y, ox + va.x + vb.x, oy + va.y + vb.y, "#34d399", "b⃗");
                        this.drawArrow(ctx, ox, oy, ox + va.x + vb.x, oy + va.y + vb.y, "#f43f5e", "c⃗ = a⃗ + b⃗");

                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Үшбұрыш ережесі: AB⃗ + BC⃗ = AC⃗", 20, 30);
                    } else if (this.state.mode === "parallelogram") {
                        this.drawArrow(ctx, ox, oy, ox + va.x, oy + va.y, "#38bdf8", "a⃗");
                        this.drawArrow(ctx, ox, oy, ox + vb.x, oy + vb.y, "#34d399", "b⃗");

                        // Пунктир
                        ctx.strokeStyle = "#64748b";
                        ctx.setLineDash([4, 4]);
                        this.drawLine(ctx, { x: ox + va.x, y: oy + va.y }, { x: ox + va.x + vb.x, y: oy + va.y + vb.y });
                        this.drawLine(ctx, { x: ox + vb.x, y: oy + vb.y }, { x: ox + va.x + vb.x, y: oy + va.y + vb.y });
                        ctx.setLineDash([]);

                        this.drawArrow(ctx, ox, oy, ox + va.x + vb.x, oy + va.y + vb.y, "#facc15", "a⃗ + b⃗");

                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Параллелограмм ережесі: ортақ нүктеден шыққан диагональ", 20, 30);
                    } else {
                        this.drawArrow(ctx, ox, oy, ox + va.x, oy + va.y, "#38bdf8", "a⃗");
                        this.drawArrow(ctx, ox, oy, ox + vb.x, oy + vb.y, "#34d399", "b⃗");
                        this.drawArrow(ctx, ox + vb.x, oy + vb.y, ox + va.x, oy + va.y, "#f43f5e", "a⃗ - b⃗");

                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Векторларды азайту: b⃗ ұшынан a⃗ ұшына бағытталады", 20, 30);
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "vector_scalar_mult": {
                this.state = { k: 1.5 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Скаляр k (-3-тен +3-ке дейін):</span>
                        <input type="range" min="-30" max="30" value="15" oninput="GeoAnimations.state.k = +this.value / 10">
                        <span id="k-val" class="font-bold text-sky-400">k = 1.5</span>
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const ox = 320;
                    const oy = 190;
                    const baseVx = 80;
                    const baseVy = -40;
                    const k = this.state.k;

                    const kDisplay = document.getElementById("k-val");
                    if (kDisplay) kDisplay.textContent = `k = ${k}`;

                    // Бастапқы вектор
                    this.drawArrow(ctx, ox, oy, ox + baseVx, oy + baseVy, "#94a3b8", "a⃗ (негізгі)");

                    // Жаңа вектор k * a
                    const color = k > 0 ? "#10b981" : k < 0 ? "#f43f5e" : "#64748b";
                    this.drawArrow(ctx, ox, oy, ox + baseVx * k, oy + baseVy * k, color, `k·a⃗  (k=${k})`);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText(`Модулі: |k·a⃗| = |k| · |a⃗|`, 20, 30);
                    ctx.fillStyle = color;
                    ctx.fillText(k > 0 ? "k > 0: Бағыттас (↑↑)" : k < 0 ? "k < 0: Қарама-қарсы бағытталған (↑↓)" : "k = 0: Нөлдік вектор", 20, 54);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "vector_dot_product": {
                this.state = { deg: 60 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>Арасындағы бұрыш (φ):</span>
                        <input type="range" min="0" max="180" value="60" oninput="GeoAnimations.state.deg = +this.value">
                        <button class="px-2 py-0.5 bg-yellow-600 rounded text-xs" onclick="GeoAnimations.state.deg = 90">90° (Перпендикуляр)</button>
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const ox = 260;
                    const oy = 210;
                    const lenA = 140;
                    const lenB = 120;
                    const rad = (this.state.deg * Math.PI) / 180;

                    this.drawArrow(ctx, ox, oy, ox + lenA, oy, "#38bdf8", "a⃗");
                    this.drawArrow(ctx, ox, oy, ox + lenB * Math.cos(-rad), oy + lenB * Math.sin(-rad), "#34d399", "b⃗");

                    // Бұрыш доғасы
                    ctx.beginPath();
                    ctx.arc(ox, oy, 35, 0, -rad, true);
                    ctx.strokeStyle = "#facc15";
                    ctx.stroke();

                    const dot = Math.round(lenA * lenB * Math.cos(rad) / 100);
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText(`Бұрыш φ = ${this.state.deg}°,  cos(φ) = ${Math.cos(rad).toFixed(3)}`, 20, 30);

                    let status = "";
                    let col = "#10b981";
                    if (this.state.deg < 90) {
                        status = "Сүйір бұрыш ⇒ a⃗ · b⃗ > 0 (Оң)";
                        col = "#10b981";
                    } else if (this.state.deg === 90) {
                        status = "Тік бұрыш (90°) ⇒ a⃗ · b⃗ = 0 (ПЕРПЕНДИКУЛЯР)";
                        col = "#facc15";
                    } else {
                        status = "Доғал бұрыш ⇒ a⃗ · b⃗ < 0 (Теріс)";
                        col = "#f43f5e";
                    }

                    ctx.fillStyle = col;
                    ctx.fillText(`Скаляр көбейтінді мәні: ${dot}  (${status})`, 20, 54);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "vector_coordinates": {
                this.state = { x1: 2, y1: 2, x2: 7, y2: 6 };
                controls.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span>A(x₁, y₁): (2, 2)</span>
                        <span>B(x₂):</span>
                        <input type="range" min="3" max="10" value="7" oninput="GeoAnimations.state.x2 = +this.value">
                        <span>B(y₂):</span>
                        <input type="range" min="1" max="8" value="6" oninput="GeoAnimations.state.y2 = +this.value">
                    </div>
                `;

                const loop = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawGrid(ctx, canvas.width, canvas.height);

                    const scale = 28;
                    const ox = 100;
                    const oy = 280;

                    const pA = { x: ox + this.state.x1 * scale, y: oy - this.state.y1 * scale };
                    const pB = { x: ox + this.state.x2 * scale, y: oy - this.state.y2 * scale };

                    // Проекция сызықтары
                    ctx.strokeStyle = "#475569";
                    ctx.setLineDash([4, 4]);
                    this.drawLine(ctx, pA, { x: pB.x, y: pA.y });
                    this.drawLine(ctx, { x: pB.x, y: pA.y }, pB);
                    ctx.setLineDash([]);

                    // Вектор
                    this.drawArrow(ctx, pA.x, pA.y, pB.x, pB.y, "#38bdf8", "AB⃗");
                    this.drawPoint(ctx, pA.x, pA.y, `A(${this.state.x1}; ${this.state.y1})`, "#cbd5e1", 4);
                    this.drawPoint(ctx, pB.x, pB.y, `B(${this.state.x2}; ${this.state.y2})`, "#cbd5e1", 4);

                    const dx = this.state.x2 - this.state.x1;
                    const dy = this.state.y2 - this.state.y1;
                    const len = Math.hypot(dx, dy).toFixed(2);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText(`AB⃗ = (x₂ - x₁; y₂ - y₁) = (${dx}; ${dy})`, 20, 30);
                    ctx.fillStyle = "#38bdf8";
                    ctx.fillText(`Модулі: |AB⃗| = √(${dx}² + ${dy}²) = ${len}`, 20, 54);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            // ================= 10-СЫНЫП (3D АНИМАЦИЯЛАР) =================
            case "space_lines_3d": {
                this.state = { rotY: 0.6, rotX: 0.3 };
                controls.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-sky-400">3D Куб кеңістігі:</span>
                        <button class="px-2 py-1 bg-emerald-600 rounded text-xs" onclick="GeoAnimations.state.rotY += 0.2">⟲ Бұру</button>
                        <span class="text-xs text-slate-300">Жасыл: Параллель | Сары: Қиылысатын | Қызыл: Айқас түзулер</span>
                    </div>
                `;

                const loop = () => {
                    t += 0.01 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const angY = this.state.rotY + t;
                    const angX = this.state.rotX;
                    const s = 70;

                    // Куб төбелері (x, y, z)
                    const vertices = [
                        { x: -s, y: -s, z: -s },
                        { x:  s, y: -s, z: -s },
                        { x:  s, y:  s, z: -s },
                        { x: -s, y:  s, z: -s },
                        { x: -s, y: -s, z:  s },
                        { x:  s, y: -s, z:  s },
                        { x:  s, y:  s, z:  s },
                        { x: -s, y:  s, z:  s }
                    ];

                    const proj = vertices.map(v => this.project3D(v, angX, angY, canvas.width / 2, canvas.height / 2));

                    // Куб қырлары
                    const edges = [
                        [0, 1], [1, 2], [2, 3], [3, 0],
                        [4, 5], [5, 6], [6, 7], [7, 4],
                        [0, 4], [1, 5], [2, 6], [3, 7]
                    ];

                    ctx.strokeStyle = "#334155";
                    ctx.lineWidth = 1.5;
                    edges.forEach(([i, j]) => this.drawLine(ctx, proj[i], proj[j]));

                    // 1. Параллель түзулер (Жасыл)
                    ctx.strokeStyle = "#10b981";
                    ctx.lineWidth = 3.5;
                    this.drawLine(ctx, proj[0], proj[1]);
                    this.drawLine(ctx, proj[3], proj[2]);

                    // 2. Айқас түзулер (Қызыл/Магента)
                    ctx.strokeStyle = "#f43f5e";
                    ctx.lineWidth = 3.5;
                    this.drawLine(ctx, proj[0], proj[4]); // AA₁
                    this.drawLine(ctx, proj[2], proj[6]); // CC₁ немесе CD

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText("Кеңістіктегі түзулердің өзара орналасуы (3D)", 20, 30);
                    ctx.fillStyle = "#10b981";
                    ctx.fillText("• Жасыл қырлар: Параллель түзулер", 20, 52);
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText("• Қызыл қырлар: АЙҚАС ТҮЗУЛЕР (бір жазықтықта жатпайды)", 20, 74);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "parallelepiped_3d": {
                this.state = { a: 80, b: 60, c: 90, showSection: false };
                const updateParaControls = () => {
                    controls.innerHTML = `
                        <div class="flex flex-wrap items-center justify-between w-full gap-2">
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-sky-400">Өлшемдері: a=80, b=60, c=90</span>
                                <button class="px-2.5 py-1 ${this.state.showSection ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'} hover:bg-emerald-500 rounded text-xs font-bold transition" onclick="GeoAnimations.toggleParallelepipedSection()">
                                    🔷 Диагональдық қима: ${this.state.showSection ? 'Қосулы ✓' : 'Өшірулі'}
                                </button>
                            </div>
                            <span class="text-xs text-slate-400">Үздіксіз 3D проекциясы</span>
                        </div>
                    `;
                };
                updateParaControls();
                this.updateParaControls = updateParaControls;

                const loop = () => {
                    t += 0.012 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const a = this.state.a;
                    const b = this.state.b;
                    const c = this.state.c;

                    const vertices = [
                        { x: -a, y: -b, z: -c },
                        { x:  a, y: -b, z: -c },
                        { x:  a, y:  b, z: -c },
                        { x: -a, y:  b, z: -c },
                        { x: -a, y: -b, z:  c },
                        { x:  a, y: -b, z:  c },
                        { x:  a, y:  b, z:  c },
                        { x: -a, y:  b, z:  c }
                    ];

                    const proj = vertices.map(v => this.project3D(v, 0.35, t, canvas.width / 2, canvas.height / 2));

                    const edges = [
                        [0, 1], [1, 2], [2, 3], [3, 0],
                        [4, 5], [5, 6], [6, 7], [7, 4],
                        [0, 4], [1, 5], [2, 6], [3, 7]
                    ];

                    // Егер қима қосылса, алдымен қима жазықтығын бояу
                    if (this.state.showSection) {
                        ctx.save();
                        ctx.fillStyle = "rgba(16, 185, 129, 0.40)";
                        ctx.beginPath();
                        ctx.moveTo(proj[0].x, proj[0].y);
                        ctx.lineTo(proj[4].x, proj[4].y);
                        ctx.lineTo(proj[6].x, proj[6].y);
                        ctx.lineTo(proj[2].x, proj[2].y);
                        ctx.closePath();
                        ctx.fill();

                        ctx.strokeStyle = "#10b981";
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.restore();
                    }

                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 2;
                    edges.forEach(([i, j]) => this.drawLine(ctx, proj[i], proj[j]));

                    // Басты кеңістіктік диагональ (0 мен 6)
                    ctx.strokeStyle = "#f43f5e";
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    this.drawLine(ctx, proj[0], proj[6]);
                    ctx.setLineDash([]);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText("Тікбұрышты параллелепипед (3D)", 20, 30);
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText("Қызыл сызық: Басты диагональ d² = a² + b² + c²", 20, 52);
                    if (this.state.showSection) {
                        ctx.fillStyle = "#34d399";
                        ctx.fillText("Жасыл аймақ: Диагональдық қима (AA₁C₁C) — Тіктөртбұрыш, S = d_таб · c", 20, 74);
                    } else {
                        ctx.fillStyle = "#38bdf8";
                        ctx.fillText("Көлемі: V = abc,  Толық беті: S = 2(ab + bc + ac)", 20, 74);
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            case "tetrahedron_3d": {
                controls.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-amber-400">Дұрыс Тетраэдр (4 жақ, 6 қыр):</span>
                        <span class="text-xs text-slate-300">Үздіксіз 3D айналу симуляциясы</span>
                    </div>
                `;

                const loop = () => {
                    t += 0.015 * GeoAnimations.speedMultiplier;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const s = 95;
                    const vertices = [
                        { x: s, y: s, z: s },
                        { x: -s, y: -s, z: s },
                        { x: -s, y: s, z: -s },
                        { x: s, y: -s, z: -s }
                    ];

                    const proj = vertices.map(v => this.project3D(v, 0.4, t, canvas.width / 2, canvas.height / 2 + 10));

                    const edges = [
                        [0, 1], [0, 2], [0, 3],
                        [1, 2], [2, 3], [3, 1]
                    ];

                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 3;
                    edges.forEach(([i, j]) => this.drawLine(ctx, proj[i], proj[j]));

                    proj.forEach((p, idx) => {
                        this.drawPoint(ctx, p.x, p.y, ["A", "B", "C", "D"][idx], "#facc15", 5);
                    });

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 14px system-ui";
                    ctx.fillText("Дұрыс тетраэдр (Платон денесі)", 20, 30);
                    ctx.fillStyle = "#f59e0b";
                    ctx.fillText("Толық беті: S = a²√3", 20, 52);
                    ctx.fillStyle = "#38bdf8";
                    ctx.fillText("Көлемі: V = (a³√2) / 12", 20, 74);

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }

            // ================= 10-СЫНЫП: КӨПЖАҚТАРДЫҢ ЖАЗЫҚТЫҚПЕН ҚИМАЛАРЫ (3D) =================
            case "polyhedron_sections_3d": {
                this.state = {
                    mode: "diagonal", // 'diagonal' | 'triangle' | 'horizontal' | 'hexagon' | 'tetra'
                    heightVal: 0,     // -60-тан +60-қа дейін
                    autoRotate: true,
                    rotY: 0
                };

                const updateSectionControls = () => {
                    controls.innerHTML = `
                        <div class="w-full flex flex-wrap items-center justify-between gap-2">
                            <div class="flex flex-wrap items-center gap-1.5">
                                <span class="font-bold text-emerald-400 mr-1 text-xs">Қима түрі:</span>
                                <button class="px-2.5 py-1 rounded text-xs font-semibold ${this.state.mode === 'diagonal' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}" onclick="GeoAnimations.setSectionMode('diagonal')">Диагональдық</button>
                                <button class="px-2.5 py-1 rounded text-xs font-semibold ${this.state.mode === 'triangle' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}" onclick="GeoAnimations.setSectionMode('triangle')">Үшбұрышты</button>
                                <button class="px-2.5 py-1 rounded text-xs font-semibold ${this.state.mode === 'horizontal' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}" onclick="GeoAnimations.setSectionMode('horizontal')">Көлденең (Слайдер)</button>
                                <button class="px-2.5 py-1 rounded text-xs font-semibold ${this.state.mode === 'hexagon' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}" onclick="GeoAnimations.setSectionMode('hexagon')">Алтыбұрышты</button>
                                <button class="px-2.5 py-1 rounded text-xs font-semibold ${this.state.mode === 'tetra' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}" onclick="GeoAnimations.setSectionMode('tetra')">Тетраэдр қимасы</button>
                            </div>
                            <button class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold" onclick="GeoAnimations.toggleAutoRotate()">
                                ${this.state.autoRotate ? '⏸ Кідірту' : '▶ 3D Айналдыру'}
                            </button>
                        </div>
                        ${this.state.mode === 'horizontal' ? `
                            <div class="w-full flex items-center gap-3 pt-2 border-t border-slate-700/60 mt-1">
                                <span class="text-sky-300 text-xs font-medium">Қима жазықтығының орны:</span>
                                <input type="range" min="-65" max="65" value="${this.state.heightVal}" class="flex-1 accent-sky-400 cursor-pointer" oninput="GeoAnimations.setSectionHeight(this.value)">
                                <span id="section-h-val" class="font-mono text-sky-300 text-xs font-bold">${this.state.heightVal} px</span>
                            </div>
                        ` : ''}
                    `;
                };

                updateSectionControls();
                this.updateSectionControlsUI = updateSectionControls;

                let rotAngle = 0;

                const loop = () => {
                    if (this.state.autoRotate) {
                        rotAngle += 0.012 * GeoAnimations.speedMultiplier;
                    }
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const mode = this.state.mode || "diagonal";

                    if (mode === "tetra") {
                        // ТЕТРАЭДР ҚИМАСЫН СЫЗУ
                        const s = 95;
                        const vTetra = [
                            { x:  s, y:  s, z:  s }, // A (0)
                            { x: -s, y: -s, z:  s }, // B (1)
                            { x: -s, y:  s, z: -s }, // C (2)
                            { x:  s, y: -s, z: -s }  // D (3)
                        ];
                        const projT = vTetra.map(v => this.project3D(v, 0.4, rotAngle, canvas.width / 2, canvas.height / 2 + 15));

                        // Айқас қырларына (AB мен CD) параллель қима нүктелері (орталары)
                        const secPoints = [
                            { x: 0, y: s, z: 0 },   // AC ортасы (0 мен 2)
                            { x: -s, y: 0, z: 0 },  // BC ортасы (1 мен 2)
                            { x: 0, y: -s, z: 0 },  // BD ортасы (1 мен 3)
                            { x: s, y: 0, z: 0 }    // AD ортасы (0 мен 3)
                        ];
                        const projSec = secPoints.map(p => this.project3D(p, 0.4, rotAngle, canvas.width / 2, canvas.height / 2 + 15));

                        // Қима жазықтығын бояу
                        ctx.save();
                        ctx.fillStyle = "rgba(245, 158, 11, 0.45)";
                        ctx.beginPath();
                        ctx.moveTo(projSec[0].x, projSec[0].y);
                        ctx.lineTo(projSec[1].x, projSec[1].y);
                        ctx.lineTo(projSec[2].x, projSec[2].y);
                        ctx.lineTo(projSec[3].x, projSec[3].y);
                        ctx.closePath();
                        ctx.fill();

                        ctx.strokeStyle = "#f59e0b";
                        ctx.lineWidth = 3.5;
                        ctx.stroke();
                        ctx.restore();

                        // Тетраэдр қырлары
                        const tEdges = [[0,1], [0,2], [0,3], [1,2], [2,3], [3,1]];
                        ctx.strokeStyle = "#64748b";
                        ctx.lineWidth = 2;
                        tEdges.forEach(([i, j]) => this.drawLine(ctx, projT[i], projT[j]));

                        // Қима нүктелері
                        projSec.forEach((p, idx) => {
                            this.drawPoint(ctx, p.x, p.y, ["K", "L", "M", "N"][idx], "#fbbf24", 4);
                        });

                        // Ақпараттық панель
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText("Тетраэдрдің төртбұрышты қимасы (KLMN)", 20, 30);
                        ctx.fillStyle = "#f59e0b";
                        ctx.fillText("• Пішіні: Параллелограмм (орталарында — Ромб)", 20, 52);
                        ctx.fillStyle = "#38bdf8";
                        ctx.fillText("• Қасиеті: Қарама-қарсы айқас екі қырына (AB және CD) параллель", 20, 74);
                    } else {
                        // КУБ / ПАРАЛЛЕЛЕПИПЕД ҚИМАЛАРЫ
                        const s = 85;
                        const vCube = [
                            { x: -s, y: -s, z: -s }, // A  (0)
                            { x:  s, y: -s, z: -s }, // B  (1)
                            { x:  s, y:  s, z: -s }, // C  (2)
                            { x: -s, y:  s, z: -s }, // D  (3)
                            { x: -s, y: -s, z:  s }, // A₁ (4)
                            { x:  s, y: -s, z:  s }, // B₁ (5)
                            { x:  s, y:  s, z:  s }, // C₁ (6)
                            { x: -s, y:  s, z:  s }  // D₁ (7)
                        ];

                        const proj = vCube.map(v => this.project3D(v, 0.45, rotAngle, canvas.width / 2, canvas.height / 2 + 10));

                        // 1. Қима полигонын анықтау
                        let secPoly = [];
                        let secColor = "rgba(16, 185, 129, 0.45)";
                        let strokeColor = "#10b981";
                        let titleText = "";
                        let infoShape = "";
                        let infoFormula = "";

                        if (mode === "diagonal") {
                            // AA₁C₁C диагональдық қимасы (0, 4, 6, 2)
                            secPoly = [proj[0], proj[4], proj[6], proj[2]];
                            secColor = "rgba(16, 185, 129, 0.45)";
                            strokeColor = "#10b981";
                            titleText = "Кубтың диагональдық қимасы (AA₁C₁C)";
                            infoShape = "• Пішіні: Тіктөртбұрыш (қабырғалары: бүйір қыр a және диагональ a√2)";
                            infoFormula = "• Қима ауданы: S = a · d = a²√2";
                        } else if (mode === "triangle") {
                            // A₁BD үшбұрышты қимасы (4, 1, 3)
                            secPoly = [proj[4], proj[1], proj[3]];
                            secColor = "rgba(244, 63, 94, 0.45)";
                            strokeColor = "#f43f5e";
                            titleText = "Кубтың үшбұрышты қимасы (A₁BD)";
                            infoShape = "• Пішіні: Тең қабырғалы дұрыс үшбұрыш";
                            infoFormula = "• Қабырғалары — куб жақтарының диагональдары (a√2), S = (a²√3) / 2";
                        } else if (mode === "horizontal") {
                            // Табанға параллель көлденең қима (биіктігі слайдермен)
                            const h = Number(this.state.heightVal || 0);
                            const hSecVertices = [
                                { x: -s, y: -s, z: h },
                                { x:  s, y: -s, z: h },
                                { x:  s, y:  s, z: h },
                                { x: -s, y:  s, z: h }
                            ];
                            secPoly = hSecVertices.map(v => this.project3D(v, 0.45, rotAngle, canvas.width / 2, canvas.height / 2 + 10));
                            secColor = "rgba(56, 189, 248, 0.45)";
                            strokeColor = "#38bdf8";
                            titleText = "Табанға параллель көлденең қима";
                            infoShape = "• Пішіні: Табанға тең шаршы (Квадрат)";
                            infoFormula = "• Ауданы: S = a² (кез келген h биіктікте тұрақты)";
                        } else if (mode === "hexagon") {
                            // 6 қырдың ортасы арқылы өтетін алтыбұрышты қима
                            const hexVertices = [
                                { x: 0,  y: -s, z: -s }, // 0-1 ортасы
                                { x: s,  y: -s, z: 0 },  // 1-5 ортасы
                                { x: s,  y: 0,  z: s },  // 5-6 ортасы
                                { x: 0,  y: s,  z: s },  // 6-7 ортасы
                                { x: -s, y: s,  z: 0 },  // 7-3 ортасы
                                { x: -s, y: 0,  z: -s }  // 3-0 ортасы
                            ];
                            secPoly = hexVertices.map(v => this.project3D(v, 0.45, rotAngle, canvas.width / 2, canvas.height / 2 + 10));
                            secColor = "rgba(168, 85, 247, 0.45)";
                            strokeColor = "#c084fc";
                            titleText = "Кубтың дұрыс алтыбұрышты қимасы";
                            infoShape = "• Пішіні: 6 қабырғасы тең дұрыс алтыбұрыш";
                            infoFormula = "• Қабырғасы: c = a√2 / 2,  Ауданы: S = (3a²√3) / 4";
                        }

                        // Қиманы толтыру және жақтау
                        if (secPoly.length > 0) {
                            ctx.save();
                            ctx.fillStyle = secColor;
                            ctx.beginPath();
                            ctx.moveTo(secPoly[0].x, secPoly[0].y);
                            for (let i = 1; i < secPoly.length; i++) {
                                ctx.lineTo(secPoly[i].x, secPoly[i].y);
                            }
                            ctx.closePath();
                            ctx.fill();

                            ctx.strokeStyle = strokeColor;
                            ctx.lineWidth = 3.5;
                            ctx.stroke();

                            // Төбелерді нүктемен белгілеу
                            secPoly.forEach(p => {
                                ctx.fillStyle = strokeColor;
                                ctx.beginPath();
                                ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
                                ctx.fill();
                            });
                            ctx.restore();
                        }

                        // Кубтың 12 қырын сызу
                        const cubeEdges = [
                            [0, 1], [1, 2], [2, 3], [3, 0],
                            [4, 5], [5, 6], [6, 7], [7, 4],
                            [0, 4], [1, 5], [2, 6], [3, 7]
                        ];
                        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
                        ctx.lineWidth = 1.8;
                        cubeEdges.forEach(([i, j]) => this.drawLine(ctx, proj[i], proj[j]));

                        // Төбелерін белгілеу
                        const labels = ["A", "B", "C", "D", "A₁", "B₁", "C₁", "D₁"];
                        proj.forEach((p, idx) => {
                            this.drawPoint(ctx, p.x, p.y, labels[idx], "#94a3b8", 3);
                        });

                        // Ақпараттық мәтіндер
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 14px system-ui";
                        ctx.fillText(titleText, 20, 30);
                        ctx.fillStyle = strokeColor;
                        ctx.fillText(infoShape, 20, 52);
                        ctx.fillStyle = "#38bdf8";
                        ctx.fillText(infoFormula, 20, 74);
                    }

                    this.activeAnimId = requestAnimationFrame(loop);
                };
                loop();
                break;
            }
        }
    },

    setSectionMode(mode) {
        if (this.state) {
            this.state.mode = mode;
            if (this.updateSectionControlsUI) {
                this.updateSectionControlsUI();
            }
        }
    },

    setSectionHeight(val) {
        if (this.state) {
            this.state.heightVal = Number(val);
            const el = document.getElementById("section-h-val");
            if (el) el.textContent = val + " px";
        }
    },

    toggleAutoRotate() {
        if (this.state) {
            this.state.autoRotate = !this.state.autoRotate;
            if (this.updateSectionControlsUI) {
                this.updateSectionControlsUI();
            }
        }
    },

    toggleParallelepipedSection() {
        if (this.state) {
            this.state.showSection = !this.state.showSection;
            if (this.updateParaControls) {
                this.updateParaControls();
            }
        }
    },

    setTriangleMode(mode) {
        if (this.state) {
            this.state.mode = mode;
        }
    },

    // 3D проекциялау математикасы
    project3D(v, rotX, rotY, cx, cy) {
        // Y осі бойынша бұру
        let x1 = v.x * Math.cos(rotY) + v.z * Math.sin(rotY);
        let z1 = -v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
        let y1 = v.y;

        // X осі бойынша бұру
        let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);
        let x2 = x1;

        // Перспектива
        const fov = 350;
        const scale = fov / (fov + z2 + 150);
        return {
            x: cx + x2 * scale,
            y: cy + y2 * scale
        };
    },

    drawLine(ctx, p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    },

    drawArrow(ctx, x1, y1, x2, y2, color, label) {
        const headlen = 12;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        if (label) {
            ctx.fillStyle = color;
            ctx.font = "bold 13px system-ui";
            ctx.fillText(label, (x1 + x2) / 2 + 10, (y1 + y2) / 2 - 8);
        }
    },

    drawPoint(ctx, x, y, label, color = "#38bdf8", r = 4) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
        if (label) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(label, x + 8, y - 6);
        }
    },

    drawGrid(ctx, w, h) {
        ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 35) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 35) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }
};
