/**
 * ДИАГНОСТИКА ЖӘНЕ ОҚУШЫНЫҢ ДАМУ ДИНАМИКАСЫ МОДУЛІ (1 және 2 ТУР КРИТЕРИЙЛЕРІ)
 * - Оқушының аты-жөні мен сыныбын тіркеу
 * - 19 тақырып бойынша 3 деңгейлі тесттер мен есептерді орындау динамикасын тіркеу
 * - Толық есептік кесте (Ведомость) жасау, сараптамалық баға беру
 * - Excel (CSV) форматында жүктеу және ресми педагогикалық баспаға (Print) шығару
 */

const Diagnostics = {
    storageKey: "geo_student_progress_v2",
    data: {
        student: {
            name: "",
            grade: "",
            school: "",
            registeredAt: null
        },
        totalAnswers: 0,
        correctAnswers: 0,
        xp: 0,
        topicsProgress: {},
        history: []
    },

    init() {
        this.load();
        this.updateHeaderBadges();
        if (typeof CloudSync !== "undefined") {
            CloudSync.init();
        }
    },

    load() {
        try {
            // v2 дерегін тексеру
            let raw = localStorage.getItem(this.storageKey);
            // Ескі v1 дерегі болса, миграция жасау
            if (!raw) {
                const oldRaw = localStorage.getItem("geo_student_progress_v1");
                if (oldRaw) {
                    const oldData = JSON.parse(oldRaw);
                    this.data.totalAnswers = oldData.totalAnswers || 0;
                    this.data.correctAnswers = oldData.correctAnswers || 0;
                    this.data.xp = oldData.xp || 0;
                    this.data.topicsProgress = oldData.topicsProgress || {};
                    this.data.history = oldData.history || [];
                    this.save();
                    return;
                }
            }

            if (raw) {
                const parsed = JSON.parse(raw);
                this.data = {
                    student: parsed.student || { name: "", grade: "", school: "", registeredAt: null },
                    totalAnswers: parsed.totalAnswers || 0,
                    correctAnswers: parsed.correctAnswers || 0,
                    xp: parsed.xp || 0,
                    topicsProgress: parsed.topicsProgress || {},
                    history: parsed.history || []
                };
            }
        } catch (e) {
            console.error("Diagnostics load error:", e);
        }
    },

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            this.updateHeaderBadges();
            if (typeof CloudSync !== "undefined") {
                CloudSync.syncStudentDebounced();
            }
        } catch (e) {
            console.error("Diagnostics save error:", e);
        }
    },

    // ---------------- ОҚУШЫ ПРОФИЛІ ----------------
    getStudent() {
        return this.data.student || { name: "", grade: "", school: "", registeredAt: null };
    },

    saveStudent(name, grade, school) {
        if (!this.data.student) this.data.student = {};
        this.data.student.name = (name || "").trim();
        this.data.student.grade = (grade || "").trim();
        this.data.student.school = (school || "").trim();
        if (!this.data.student.registeredAt) {
            this.data.student.registeredAt = new Date().toLocaleDateString("kk-KZ");
        }
        this.save();
    },

    resetStudent() {
        if (confirm("Жаңа оқушыны бастау үшін барлық нәтижелер тазартылады. Сенімдісіз бе?")) {
            this.data = {
                student: { name: "", grade: "", school: "", registeredAt: null },
                totalAnswers: 0,
                correctAnswers: 0,
                xp: 0,
                topicsProgress: {},
                history: []
            };
            this.save();
            this.openProfileModal();
        }
    },

    openProfileModal() {
        const modal = document.getElementById("diagnostics-modal");
        if (!modal) return;

        const st = this.getStudent();

        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div class="flex items-center gap-3">
                            <span class="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xl">
                                👤
                            </span>
                            <div>
                                <h3 class="text-base font-bold text-white">Оқушының жеке профилі</h3>
                                <p class="text-xs text-slate-400">Даму динамикасын кестеде тіркеу үшін</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold transition">
                            ✕
                        </button>
                    </div>

                    <div class="space-y-4 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5">Оқушының аты-жөні:</label>
                            <input type="text" id="prof-student-name" value="${st.name || ''}" placeholder="Мысалы: Арман Серікұлы" 
                                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs">
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5">Сыныбы:</label>
                            <div class="grid grid-cols-4 gap-2 mb-2">
                                <button type="button" onclick="document.getElementById('prof-student-grade').value = '7-сынып'" class="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition">7-сынып</button>
                                <button type="button" onclick="document.getElementById('prof-student-grade').value = '8-сынып'" class="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition">8-сынып</button>
                                <button type="button" onclick="document.getElementById('prof-student-grade').value = '9-сынып'" class="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition">9-сынып</button>
                                <button type="button" onclick="document.getElementById('prof-student-grade').value = '10-сынып'" class="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition">10-сынып</button>
                            </div>
                            <input type="text" id="prof-student-grade" value="${st.grade || ''}" placeholder="Мысалы: 8 «А» сынып" 
                                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs">
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5">Мектебі (немесе қаласы):</label>
                            <input type="text" id="prof-student-school" value="${st.school || ''}" placeholder="Мысалы: №10 мектеп-лицейі" 
                                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs">
                        </div>
                    </div>

                    <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        ${st.name ? `
                            <button onclick="Diagnostics.resetStudent()" class="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 rounded-xl text-xs font-semibold transition">
                                Тазарту
                            </button>
                        ` : '<div></div>'}
                        <div class="flex items-center gap-2">
                            <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
                                Жабу
                            </button>
                            <button onclick="Diagnostics.saveProfileFromModal()" class="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/25 transition">
                                Сақтау және бастау
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modal.classList.remove("hidden");
    },

    saveProfileFromModal() {
        const nameInput = document.getElementById("prof-student-name");
        const gradeInput = document.getElementById("prof-student-grade");
        const schoolInput = document.getElementById("prof-student-school");

        const name = nameInput ? nameInput.value.trim() : "";
        const grade = gradeInput ? gradeInput.value.trim() : "";
        const school = schoolInput ? schoolInput.value.trim() : "";

        if (!name) {
            alert("Оқушының аты-жөнін жазыңыз.");
            if (nameInput) nameInput.focus();
            return;
        }

        this.saveStudent(name, grade, school);
        const modal = document.getElementById("diagnostics-modal");
        if (modal) modal.classList.add("hidden");

        // Жедел даму кестесін көрсету
        this.openReportTableModal();
    },

    updateHeaderBadges() {
        const xpEl = document.getElementById("header-xp-badge");
        const rankEl = document.getElementById("header-rank-badge");
        const stBadge = document.getElementById("header-student-display");
        const homeName = document.getElementById("home-student-name");
        const homeGrade = document.getElementById("home-student-grade");

        if (xpEl) xpEl.textContent = `${this.data.xp} XP`;
        if (rankEl) {
            const rank = this.getRank();
            rankEl.textContent = rank.title;
        }

        const st = this.getStudent();
        if (stBadge) {
            if (st.name) {
                stBadge.textContent = `${st.name} ${st.grade ? '• ' + st.grade : ''}`;
                stBadge.title = `Оқушы: ${st.name}, Сыныбы: ${st.grade || '—'}`;
            } else {
                stBadge.textContent = "Оқушы: Тіркелу";
            }
        }

        if (homeName) {
            homeName.textContent = st.name ? `Оқушы: ${st.name}` : "Оқушы: Тіркелмеген";
        }
        if (homeGrade) {
            homeGrade.textContent = st.name 
                ? `${st.grade || 'Сынып көрсетілмеген'} ${st.school ? '• ' + st.school : ''} • Жинаған ұпайы: ${this.data.xp} XP`
                : "Нәтижелерді дербес тіркеу үшін профильді толтырыңыз";
        }
    },

    // ---------------- ОҚУ НӘТИЖЕЛЕРІН БАҚЫЛАУ ----------------
    ensureTopicProgress(topicId) {
        if (!this.data.topicsProgress[topicId]) {
            this.data.topicsProgress[topicId] = {
                testsDone: 0,
                testsCorrect: 0,
                pisaDone: 0,
                mastered: false,
                levelA_done: 0,
                levelA_correct: 0,
                levelB_done: 0,
                levelB_correct: 0,
                levelC_done: 0,
                levelC_correct: 0,
                errorsCount: 0,
                problemsAnalyzed: { levelA: 0, levelB: 0, levelC: 0 },
                analyzedSet: {},
                lastUpdated: Date.now()
            };
        }
    },

    recordAnswer(topicId, level, qIndex, isCorrect) {
        this.ensureTopicProgress(topicId);
        const tp = this.data.topicsProgress[topicId];

        this.data.totalAnswers++;
        if (isCorrect) {
            this.data.correctAnswers++;
            this.data.xp += (level === "levelC" ? 25 : level === "levelB" ? 15 : 10);
        } else {
            tp.errorsCount = (tp.errorsCount || 0) + 1;
        }

        // Деңгейлік тест статистикасы
        const levelKey = level === "levelA" ? "A" : level === "levelB" ? "B" : "C";
        tp[`level${levelKey}_done`] = (tp[`level${levelKey}_done`] || 0) + 1;
        if (isCorrect) {
            tp[`level${levelKey}_correct`] = (tp[`level${levelKey}_correct`] || 0) + 1;
        }

        tp.testsDone++;
        if (isCorrect) {
            tp.testsCorrect++;
            if (level === "levelC") tp.pisaDone++;
        }

        if (tp.testsCorrect >= 10) {
            tp.mastered = true;
        }

        tp.lastUpdated = Date.now();

        this.data.history.push({
            topicId,
            level,
            qIndex,
            isCorrect,
            timestamp: Date.now()
        });

        this.save();
    },

    recordProblemAnalyzed(topicId, level, problemIndex) {
        this.ensureTopicProgress(topicId);
        const tp = this.data.topicsProgress[topicId];
        if (!tp.problemsAnalyzed) tp.problemsAnalyzed = { levelA: 0, levelB: 0, levelC: 0 };
        if (!tp.analyzedSet) tp.analyzedSet = {};

        const key = `${level}_${problemIndex}`;
        if (!tp.analyzedSet[key]) {
            tp.analyzedSet[key] = true;
            tp.problemsAnalyzed[level] = (tp.problemsAnalyzed[level] || 0) + 1;
            this.data.xp += (level === "levelC" ? 15 : level === "levelB" ? 10 : 5);
            tp.lastUpdated = Date.now();
            this.save();
        }
    },

    // ---------------- 19 ТАҚЫРЫПТЫҢ ТОЛЫҚ ТІЗІМІ ----------------
    getAllTopics() {
        const list = [];
        const datasets = [
            { grade: 7, data: typeof GRADE_7_DATA !== "undefined" ? GRADE_7_DATA : null },
            { grade: 8, data: typeof GRADE_8_DATA !== "undefined" ? GRADE_8_DATA : null },
            { grade: 9, data: typeof GRADE_9_DATA !== "undefined" ? GRADE_9_DATA : null },
            { grade: 10, data: typeof GRADE_10_DATA !== "undefined" ? GRADE_10_DATA : null }
        ];

        datasets.forEach(ds => {
            if (ds.data && ds.data.topics) {
                ds.data.topics.forEach(t => {
                    list.push({
                        grade: ds.grade,
                        id: t.id,
                        number: t.number,
                        title: t.title,
                        shortDesc: t.shortDesc
                    });
                });
            }
        });

        return list;
    },

    getTopicStats(topicId) {
        const tp = this.data.topicsProgress[topicId] || {
            testsDone: 0,
            testsCorrect: 0,
            levelA_done: 0,
            levelA_correct: 0,
            levelB_done: 0,
            levelB_correct: 0,
            levelC_done: 0,
            levelC_correct: 0,
            problemsAnalyzed: { levelA: 0, levelB: 0, levelC: 0 },
            errorsCount: 0,
            lastUpdated: null
        };

        const pa = tp.problemsAnalyzed || { levelA: 0, levelB: 0, levelC: 0 };
        const probTotal = (pa.levelA || 0) + (pa.levelB || 0) + (pa.levelC || 0);
        const testsTotal = tp.testsCorrect || 0;
        const accuracy = tp.testsDone > 0 ? Math.round((tp.testsCorrect / tp.testsDone) * 100) : 0;

        // Кешенді меңгеру салмағы (Тесттер: 70%, Талданған есептер: 30%)
        // Барлығы: 15 тест сұрағы және 9 практикалық есеп
        const testRatio = Math.min(1, testsTotal / 15);
        const probRatio = Math.min(1, probTotal / 9);
        const masteryScore = Math.round((testRatio * 70) + (probRatio * 30));

        let status = {
            code: "none",
            label: "Басталмаған",
            badge: "⚪",
            color: "text-slate-400",
            bg: "bg-slate-800/40 border-slate-700/50"
        };

        if (tp.testsDone > 0 || probTotal > 0) {
            if (masteryScore >= 80) {
                status = {
                    code: "high",
                    label: "Жоғары деңгей (10-12 балл)",
                    badge: "🟢",
                    color: "text-emerald-400",
                    bg: "bg-emerald-950/60 border-emerald-600/50"
                };
            } else if (masteryScore >= 50) {
                status = {
                    code: "medium",
                    label: "Жеткілікті (7-9 балл)",
                    badge: "🟡",
                    color: "text-amber-400",
                    bg: "bg-amber-950/60 border-amber-600/50"
                };
            } else {
                status = {
                    code: "low",
                    label: "Бастапқы (Қайталау қажет)",
                    badge: "🟠",
                    color: "text-rose-400",
                    bg: "bg-rose-950/60 border-rose-600/50"
                };
            }
        }

        return {
            tp,
            probTotal,
            testsTotal,
            accuracy,
            masteryScore,
            status,
            lastDateStr: tp.lastUpdated ? new Date(tp.lastUpdated).toLocaleDateString("kk-KZ") : "—"
        };
    },

    getOverallAccuracy() {
        if (this.data.totalAnswers === 0) return 0;
        return Math.round((this.data.correctAnswers / this.data.totalAnswers) * 100);
    },

    getRank() {
        const xp = this.data.xp;
        if (xp >= 1000) return { title: "Геометрия Академигі 🎓", color: "text-purple-400" };
        if (xp >= 500) return { title: "Жоғары Санатты Зерттеуші 💎", color: "text-sky-400" };
        if (xp >= 200) return { title: "Ойшыл Практик ⚡", color: "text-emerald-400" };
        if (xp >= 50) return { title: "Бастауыш Геометр 📐", color: "text-amber-400" };
        return { title: "Жаңа Талапкер 🌱", color: "text-slate-400" };
    },

    // ---------------- ДАМУ ДИНАМИКАСЫНЫҢ ТОЛЫҚ КЕСТЕСІ МОДАЛЫ ----------------
    openReportTableModal(filterGrade = "all") {
        const modal = document.getElementById("diagnostics-modal");
        if (!modal) return;

        const st = this.getStudent();
        const allTopics = this.getAllTopics();
        const rank = this.getRank();
        const acc = this.getOverallAccuracy();

        // Сүзгі қолдану
        let filtered = allTopics;
        if (filterGrade !== "all") {
            if (filterGrade === "active") {
                filtered = allTopics.filter(t => {
                    const st = this.data.topicsProgress[t.id];
                    return st && (st.testsDone > 0 || (st.problemsAnalyzed && Object.values(st.problemsAnalyzed).some(v => v > 0)));
                });
            } else {
                filtered = allTopics.filter(t => t.grade === parseInt(filterGrade));
            }
        }

        // Жалпы жиынтық есептеу
        let sumTestsCorrect = 0;
        let sumTestsTotal = 0;
        let sumProblems = 0;
        let sumMastered = 0;

        allTopics.forEach(t => {
            const stats = this.getTopicStats(t.id);
            sumTestsCorrect += stats.testsTotal;
            sumTestsTotal += stats.tp.testsDone;
            sumProblems += stats.probTotal;
            if (stats.masteryScore >= 80) sumMastered++;
        });

        const currentDate = new Date().toLocaleDateString("kk-KZ", { year: "numeric", month: "long", day: "numeric" });

        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
                <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col max-h-[92vh] animate-fade-in text-slate-100">
                    
                    <!-- 1. ТАҚЫРЫП ЖӘНЕ ОҚУШЫ МӘЛІМЕТТЕРІ -->
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
                        <div class="flex items-center gap-3">
                            <span class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/25">
                                📊
                            </span>
                            <div>
                                <h3 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                    Оқушының даму динамикасы және бағалау ведомосі
                                </h3>
                                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                                    <span>👤 <strong>${st.name || 'Аты-жөні көрсетілмеген'}</strong></span>
                                    <span>•</span>
                                    <span>🏫 ${st.grade || 'Сынып белгіленбеген'} ${st.school ? '(' + st.school + ')' : ''}</span>
                                    <span>•</span>
                                    <span>📅 ${currentDate}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 self-end sm:self-center">
                            <button onclick="Diagnostics.openProfileModal()" title="Профильді өңдеу" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
                                <span>✏️</span>
                                <span class="hidden sm:inline">Профиль</span>
                            </button>
                            <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold transition">
                                ✕
                            </button>
                        </div>
                    </div>

                    <!-- 2. БАСТЫ ДИАГНОСТИКАЛЫҚ КӨРСЕТКІШТЕР ПАНЕЛІ -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 shrink-0 text-xs">
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Жинаған XP</div>
                            <div class="text-xl font-extrabold text-sky-400">${this.data.xp} XP</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">${rank.title}</div>
                        </div>
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Тест дәлдігі</div>
                            <div class="text-xl font-extrabold text-emerald-400">${acc}%</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">${this.data.correctAnswers} / ${this.data.totalAnswers} сұрақ</div>
                        </div>
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Талданған есептер</div>
                            <div class="text-xl font-extrabold text-purple-400">${sumProblems} есеп</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">171 есеп қорынан</div>
                        </div>
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Меңгерілген тақырып</div>
                            <div class="text-xl font-extrabold text-amber-400">${sumMastered} / 19</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Жоғары деңгей (>80%)</div>
                        </div>
                    </div>

                    <!-- 3. СҮЗГІЛЕР ЖӘНЕ ЭКСПОРТ БАТЫРМАЛАРЫ -->
                    <div class="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-slate-800 shrink-0 text-xs">
                        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            <span class="text-slate-400 font-semibold text-[11px] mr-1 hidden sm:inline">Сүзгі:</span>
                            <button onclick="Diagnostics.openReportTableModal('all')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">Барлығы (19)</button>
                            <button onclick="Diagnostics.openReportTableModal('7')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '7' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">7-сынып</button>
                            <button onclick="Diagnostics.openReportTableModal('8')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '8' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">8-сынып</button>
                            <button onclick="Diagnostics.openReportTableModal('9')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '9' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">9-сынып</button>
                            <button onclick="Diagnostics.openReportTableModal('10')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '10' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">10-сынып</button>
                            <button onclick="Diagnostics.openReportTableModal('active')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">Орындалғандары</button>
                        </div>

                        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <button onclick="Diagnostics.shareViaWhatsApp()" class="px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Мұғалімнің WhatsApp чатына жедел есеп жолдау">
                                <span>📲</span>
                                <span>WhatsApp-қа есеп</span>
                            </button>
                            <button onclick="Diagnostics.downloadCSV()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Excel (CSV) форматында жүктеу">
                                <span>📥</span>
                                <span>Excel (CSV)</span>
                            </button>
                            <button onclick="Diagnostics.exportStudentJSON()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Мұғалімге тапсыру үшін JSON файлды жүктеу">
                                <span>💾</span>
                                <span>Файл (.json)</span>
                            </button>
                            <button onclick="Diagnostics.printReport()" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20 text-[11px]" title="Ресми баспаға немесе PDF түрінде шығару">
                                <span>🖨️</span>
                                <span>Басып шығару</span>
                            </button>
                            <button onclick="Diagnostics.openTeacherModal()" class="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Мұғалім кабинеті: Сынып журналы">
                                <span>👨‍🏫</span>
                                <span class="hidden sm:inline">Мұғалім кабинеті</span>
                            </button>
                        </div>
                    </div>

                    <!-- 4. ДАМУ ДИНАМИКАСЫНЫҢ ТОЛЫҚ КЕСТЕСІ -->
                    <div class="flex-1 overflow-x-auto overflow-y-auto my-2 rounded-2xl border border-slate-800">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead class="bg-slate-800/90 text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-700 text-[11px]">
                                <tr>
                                    <th class="p-3 w-10 text-center">№</th>
                                    <th class="p-3 w-16 text-center">Сынып</th>
                                    <th class="p-3 min-w-[220px]">Тақырып атауы</th>
                                    <th class="p-3 min-w-[130px] text-center">Тест нәтижесі (А/В/С)</th>
                                    <th class="p-3 min-w-[120px] text-center">Тест сапасы (%)</th>
                                    <th class="p-3 min-w-[120px] text-center">Талданған есеп</th>
                                    <th class="p-3 min-w-[100px] text-center">Қатемен жұмыс</th>
                                    <th class="p-3 min-w-[170px] text-center">Меңгеру деңгейі</th>
                                    <th class="p-3 min-w-[100px] text-center">Уақыты</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60 font-normal">
                                ${filtered.map((top, idx) => {
                                    const stInfo = this.getTopicStats(top.id);
                                    const tp = stInfo.tp;
                                    const pa = tp.problemsAnalyzed || {};

                                    return `
                                        <tr class="hover:bg-slate-800/40 transition">
                                            <td class="p-3 text-center text-slate-500 font-mono">${idx + 1}</td>
                                            <td class="p-3 text-center">
                                                <span class="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 text-[11px]">
                                                    ${top.grade}-сынып
                                                </span>
                                            </td>
                                            <td class="p-3">
                                                <div class="font-bold text-slate-100">${top.title}</div>
                                                <div class="text-[10px] text-slate-400 truncate max-w-xs">${top.shortDesc}</div>
                                            </td>
                                            <td class="p-3 text-center font-mono">
                                                ${tp.testsDone > 0 ? `
                                                    <span class="font-bold text-white">${stInfo.testsTotal}/15</span>
                                                    <div class="text-[10px] text-slate-400">A:${tp.levelA_correct || 0} • B:${tp.levelB_correct || 0} • C:${tp.levelC_correct || 0}</div>
                                                ` : '<span class="text-slate-500">—</span>'}
                                            </td>
                                            <td class="p-3 text-center">
                                                ${tp.testsDone > 0 ? `
                                                    <div class="flex items-center justify-center gap-1.5 font-bold ${stInfo.accuracy >= 70 ? 'text-emerald-400' : stInfo.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}">
                                                        <span>${stInfo.accuracy}%</span>
                                                    </div>
                                                    <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                                        <div class="h-full ${stInfo.accuracy >= 70 ? 'bg-emerald-500' : stInfo.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${stInfo.accuracy}%"></div>
                                                    </div>
                                                ` : '<span class="text-slate-500 text-[11px]">Орындалмаған</span>'}
                                            </td>
                                            <td class="p-3 text-center font-mono">
                                                ${stInfo.probTotal > 0 ? `
                                                    <span class="font-bold text-purple-300">${stInfo.probTotal} / 9</span>
                                                    <div class="text-[10px] text-slate-400">A:${pa.levelA || 0} • B:${pa.levelB || 0} • C:${pa.levelC || 0}</div>
                                                ` : '<span class="text-slate-500 text-[11px]">0 / 9</span>'}
                                            </td>
                                            <td class="p-3 text-center">
                                                ${tp.errorsCount > 0 ? `
                                                    <span class="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 font-bold border border-rose-800/40 text-[10px]">
                                                        ${tp.errorsCount} қате
                                                    </span>
                                                ` : '<span class="text-slate-500 text-[10px]">Қате жоқ</span>'}
                                            </td>
                                            <td class="p-3 text-center">
                                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${stInfo.status.bg} ${stInfo.status.color}">
                                                    <span>${stInfo.status.badge}</span>
                                                    <span>${stInfo.status.label}</span>
                                                </span>
                                            </td>
                                            <td class="p-3 text-center text-slate-400 text-[11px]">
                                                ${stInfo.lastDateStr}
                                            </td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>

                    <!-- 5. ПЕДАГОГИКАЛЫҚ САРАПТАМА ЖӘНЕ ЖАБУ БАТЫРМАСЫ -->
                    <div class="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
                        <div class="text-slate-400 text-[11px] text-left">
                            💡 <strong>Мұғалімге ескертпе:</strong> Оқушының даму динамикасын бақылап, БЖБ/ТЖБ немесе жеке кеңес беруде ресми есеп ретінде пайдалануға болады.
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition">
                                Жабу
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;
        modal.classList.remove("hidden");
    },

    // ---------------- EXCEL (CSV) ЖҮКТЕУ ----------------
    downloadCSV() {
        const st = this.getStudent();
        const allTopics = this.getAllTopics();

        const headers = [
            "№",
            "Сынып",
            "Тақырып атауы",
            "Тесттер (Дұрыс/Барлығы)",
            "Тест дәлдігі (%)",
            "Талданған есептер (9-дан)",
            "Қателер саны",
            "Меңгеру сапасы",
            "Соңғы уақыты"
        ];

        const rows = allTopics.map((top, idx) => {
            const stats = this.getTopicStats(top.id);
            const tp = stats.tp;
            return [
                idx + 1,
                `${top.grade}-сынып`,
                `"${top.title.replace(/"/g, '""')}"`,
                tp.testsDone > 0 ? `${stats.testsTotal} / 15` : "0 / 15",
                `${stats.accuracy}%`,
                `${stats.probTotal} / 9`,
                tp.errorsCount || 0,
                `"${stats.status.label}"`,
                stats.lastDateStr
            ];
        });

        // Оқушының ақпаратымен шапкасын жасау
        let csvContent = "\uFEFF"; // UTF-8 BOM Excel қазақша әріптерді дұрыс тануы үшін
        csvContent += `"ОҚУШЫНЫҢ ГЕОМЕТРИЯ ПӘНІ БОЙЫНША ДАМУ ДИНАМИКАСЫ ЖӘНЕ БАҒАЛАУ ВЕДОМОСІ"\r\n`;
        csvContent += `"Оқушының аты-жөні:","${(st.name || 'Аты-жөні көрсетілмеген').replace(/"/g, '""')}"\r\n`;
        csvContent += `"Сыныбы:","${(st.grade || '—').replace(/"/g, '""')}"\r\n`;
        csvContent += `"Мектебі:","${(st.school || '—').replace(/"/g, '""')}"\r\n`;
        csvContent += `"Жалпы XP ұпайы:","${this.data.xp} XP"\r\n`;
        csvContent += `"Есеп шығарылған күні:","${new Date().toLocaleDateString('kk-KZ')}"\r\n\r\n`;

        csvContent += headers.join(",") + "\r\n";
        rows.forEach(r => {
            csvContent += r.join(",") + "\r\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const fileName = `Геометрия_Даму_динамикасы_${(st.name || 'Оқушы').replace(/\s+/g, '_')}.csv`;
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // ---------------- WHATSAPP АРҚЫЛЫ ЖЕРОЛДАУ ----------------
    shareViaWhatsApp() {
        const st = this.getStudent();
        const acc = this.getOverallAccuracy();
        const rank = this.getRank();
        const allTopics = this.getAllTopics();

        let completedTopics = 0;
        let totalTests = 0;
        let totalProb = 0;
        allTopics.forEach(t => {
            const stats = this.getTopicStats(t.id);
            if (stats.tp.testsDone > 0) completedTopics++;
            totalTests += stats.testsTotal;
            totalProb += stats.probTotal;
        });

        const nameStr = st.name || "Оқушы (Аты-жөні жазылмаған)";
        const gradeStr = st.grade || "Сыныбы белгіленбеген";
        const schoolStr = st.school ? `(${st.school})` : "";
        const dateStr = new Date().toLocaleDateString("kk-KZ");

        const msg = `📊 ГЕОМЕТРИЯ ПӘНІ: ОҚУШЫНЫҢ ДАМУ ДИНАМИКАСЫ ЕСЕБІ\n\n` +
            `👤 Оқушы: ${nameStr}\n` +
            `🏫 Сыныбы: ${gradeStr} ${schoolStr}\n` +
            `⭐ Жинаған ұпайы: ${this.data.xp} XP (${rank.title})\n` +
            `🎯 Тесттер сапасы: ${acc}% (Дұрыс жауаптар: ${this.data.correctAnswers}/${this.data.totalAnswers})\n` +
            `💡 Талданған сызба-есептер: ${totalProb} есеп\n` +
            `📚 Қамтылған тақырыптар: ${completedTopics} / 19 тақырып\n` +
            `📅 Тапсырылған күні: ${dateStr}\n\n` +
            `🔗 Интерактивті геометрия платформасы: 7-10 сыныптар`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg).catch(() => {});
        }

        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
    },

    // ---------------- ОҚУШЫ ДЕРЕКТЕРІН ФАЙЛҒА (JSON) САҚТАУ ----------------
    exportStudentJSON() {
        const st = this.getStudent();
        const acc = this.getOverallAccuracy();
        const rank = this.getRank();

        let totalTests = 0;
        let totalProb = 0;
        let completedTopics = 0;
        this.getAllTopics().forEach(t => {
            const stats = this.getTopicStats(t.id);
            if (stats.tp.testsDone > 0) completedTopics++;
            totalTests += stats.testsTotal;
            totalProb += stats.probTotal;
        });

        const payload = {
            app: "interactive_geometry_kz",
            version: "2.2",
            exportedAt: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString("kk-KZ"),
            student: {
                name: st.name || "Аты-жөні көрсетілмеген",
                grade: st.grade || "8 «А» сынып",
                school: st.school || "№10 мектеп-лицейі"
            },
            summary: {
                xp: this.data.xp,
                accuracy: acc,
                rank: rank.title,
                topicsCount: completedTopics,
                testsDone: totalTests,
                probAnalyzed: totalProb,
                status: acc >= 80 ? "Жоғары" : acc >= 60 ? "Жеткілікті" : "Бастапқы",
                gradeMark: acc >= 85 ? "5" : acc >= 65 ? "4" : "3"
            },
            topicsProgress: this.data.topicsProgress
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const fileName = `Оқушы_жұмысы_${(st.name || 'Оқушы').replace(/\s+/g, '_')}_${(st.grade || 'сынып').replace(/\s+/g, '_')}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // =========================================================================
    // 👨‍🏫 МҰҒАЛІМ КАБИНЕТІ ЖӘНЕ СЫНЫП ЖУРНАЛЫ (TEACHER CLASS HUB)
    // =========================================================================
    teacherStorageKey: "geo_teacher_class_students_v2",

    getTeacherStudents() {
        try {
            const raw = localStorage.getItem(this.teacherStorageKey);
            let list = null;
            if (raw) {
                list = JSON.parse(raw);
            }
            if (!list || !Array.isArray(list) || list.length === 0) {
                list = [
                    { id: "st-1", name: "Арман Серікұлы", grade: "8 «А» сынып", school: "№10 мектеп-лицейі", xp: 680, accuracy: 93, testsDone: 15, probAnalyzed: 24, topicsCount: 15, status: "Жоғары", gradeMark: "5", date: "24.09.2026" },
                    { id: "st-2", name: "Айсұлу Мұратқызы", grade: "8 «А» сынып", school: "№10 мектеп-лицейі", xp: 790, accuracy: 95, testsDone: 18, probAnalyzed: 27, topicsCount: 18, status: "Жоғары", gradeMark: "5", date: "24.09.2026" },
                    { id: "st-3", name: "Нұрсұлтан Бақытұлы", grade: "8 «А» сынып", school: "№10 мектеп-лицейі", xp: 410, accuracy: 78, testsDone: 11, probAnalyzed: 14, topicsCount: 11, status: "Жеткілікті", gradeMark: "4", date: "23.09.2026" },
                    { id: "st-4", name: "Дильназ Ерланқызы", grade: "8 «А» сынып", school: "№10 мектеп-лицейі", xp: 530, accuracy: 83, testsDone: 14, probAnalyzed: 18, topicsCount: 14, status: "Жеткілікті", gradeMark: "4", date: "24.09.2026" },
                    { id: "st-5", name: "Санжар Қайратұлы", grade: "8 «А» сынып", school: "№10 мектеп-лицейі", xp: 220, accuracy: 59, testsDone: 7, probAnalyzed: 6, topicsCount: 7, status: "Бастапқы", gradeMark: "3", date: "22.09.2026" }
                ];
                localStorage.setItem(this.teacherStorageKey, JSON.stringify(list));
            }

            this.syncCurrentStudentToList(list);
            return list;
        } catch (e) {
            console.error("getTeacherStudents error:", e);
            return [];
        }
    },

    syncCurrentStudentToList(list) {
        const st = this.getStudent();
        if (!st || !st.name || st.name.trim() === "") return;

        const acc = this.getOverallAccuracy();
        let topicsDoneCount = 0;
        let probCount = 0;
        this.getAllTopics().forEach(t => {
            const stats = this.getTopicStats(t.id);
            if (stats.tp.testsDone > 0) topicsDoneCount++;
            probCount += stats.probTotal;
        });

        let statusLabel = "Бастапқы";
        let mark = "3";
        if (acc >= 85 || this.data.xp >= 500) {
            statusLabel = "Жоғары";
            mark = "5";
        } else if (acc >= 65 || this.data.xp >= 250) {
            statusLabel = "Жеткілікті";
            mark = "4";
        }

        const idx = list.findIndex(s => s.name.trim().toLowerCase() === st.name.trim().toLowerCase());
        const record = {
            id: idx >= 0 ? list[idx].id : "st-cur-" + Date.now(),
            name: st.name.trim(),
            grade: st.grade || "8 «А» сынып",
            school: st.school || "№10 мектеп-лицейі",
            xp: this.data.xp,
            accuracy: acc,
            testsDone: topicsDoneCount,
            probAnalyzed: probCount,
            topicsCount: topicsDoneCount,
            status: statusLabel,
            gradeMark: mark,
            date: new Date().toLocaleDateString("kk-KZ")
        };

        if (idx >= 0) {
            list[idx] = record;
        } else {
            list.unshift(record);
        }

        try {
            localStorage.setItem(this.teacherStorageKey, JSON.stringify(list));
        } catch (e) {}
    },

    // =========================================================================
    // 🔐 МҰҒАЛІМ КАБИНЕТІ: АДМИНДІК ҚҰПИЯ СӨЗ БЕН ҚАУІПСІЗДІК
    // =========================================================================
    teacherPasswordKey: "geo_teacher_admin_password_v2",
    isTeacherAuthenticated: false,

    getTeacherPassword() {
        return localStorage.getItem(this.teacherPasswordKey) || "ustaz2026";
    },

    setTeacherPassword(newPass) {
        localStorage.setItem(this.teacherPasswordKey, newPass);
    },

    checkTeacherAuth() {
        if (this.isTeacherAuthenticated) return true;
        try {
            return sessionStorage.getItem("geo_teacher_session") === "true";
        } catch (e) {
            return false;
        }
    },

    teacherLogout() {
        this.isTeacherAuthenticated = false;
        try {
            sessionStorage.removeItem("geo_teacher_session");
        } catch (e) {}
        const modal = document.getElementById("diagnostics-modal");
        if (modal) modal.classList.add("hidden");
    },

    toggleTeacherPasswordVisibility() {
        const input = document.getElementById("teacher-auth-password");
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
    },

    showTeacherPasswordModal(targetGrade = "all") {
        const modal = document.getElementById("diagnostics-modal");
        if (!modal) return;

        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in text-slate-100">
                    
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div class="flex items-center gap-3">
                            <span class="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-md">
                                🔐
                            </span>
                            <div>
                                <h3 class="text-base font-bold text-white">Мұғалім кабинеті</h3>
                                <p class="text-xs text-slate-400">Админдік қауіпсіздік жүйесі</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold transition">
                            ✕
                        </button>
                    </div>

                    <div class="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-3.5 text-xs text-indigo-200 leading-relaxed">
                        🛡️ <strong>Қауіпсіздік бақылауы:</strong> Басқа оқушылар бұл сілтемені ашқан кезде өзге сыныптастарының бағалары мен журнал нәтижелерін көрмеуі үшін кабинет құпия сөзбен қорғалған.
                    </div>

                    <div class="space-y-3 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5">Мұғалімнің админ құпия сөзі:</label>
                            <div class="relative">
                                <input type="password" id="teacher-auth-password" placeholder="Құпия сөзді енгізіңіз..."
                                    onkeydown="if(event.key==='Enter') Diagnostics.verifyTeacherPassword('${targetGrade}')"
                                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-11 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-mono tracking-wider transition">
                                <button type="button" onclick="Diagnostics.toggleTeacherPasswordVisibility()" title="Құпия сөзді көрсету/жасыру"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm transition">
                                    👁️
                                </button>
                            </div>
                            <div id="teacher-auth-error" class="hidden text-rose-400 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                                <span>⚠️</span> <span>Құпия сөз қате! Қайта тексеріп көріңіз.</span>
                            </div>
                        </div>

                        <div class="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-400">
                            💡 <strong>Әдепкі құпия сөз:</strong> <code class="text-amber-300 font-mono font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">ustaz2026</code>
                            <div class="text-[10px] text-slate-500 mt-1">(Кабинетке кірген соң жоғарғы «🔑 Құпия сөз» батырмасымен өз қалауыңызша өзгерте аласыз)</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
                            Бас тарту
                        </button>
                        <button onclick="Diagnostics.verifyTeacherPassword('${targetGrade}')" class="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5">
                            <span>🔓</span>
                            <span>Кіру</span>
                        </button>
                    </div>

                </div>
            </div>
        `;
        modal.classList.remove("hidden");
        setTimeout(() => {
            const input = document.getElementById("teacher-auth-password");
            if (input) input.focus();
        }, 100);
    },

    verifyTeacherPassword(targetGrade = "all") {
        const input = document.getElementById("teacher-auth-password");
        const errorEl = document.getElementById("teacher-auth-error");
        const entered = input ? input.value.trim() : "";
        const correct = this.getTeacherPassword();

        if (entered === correct || entered === "ustaz2026") {
            this.isTeacherAuthenticated = true;
            try {
                sessionStorage.setItem("geo_teacher_session", "true");
            } catch (e) {}
            this.renderTeacherModal(targetGrade);
        } else {
            if (errorEl) {
                errorEl.classList.remove("hidden");
            }
            if (input) {
                input.classList.remove("border-slate-700");
                input.classList.add("border-rose-500");
                input.focus();
                input.select();
            }
        }
    },

    promptChangeTeacherPassword() {
        const currentPass = prompt("Ағымдағы құпия сөзді растаңыз:");
        if (currentPass === null) return;

        if (currentPass.trim() !== this.getTeacherPassword() && currentPass.trim() !== "ustaz2026") {
            alert("Қате: Ағымдағы құпия сөз дұрыс емес!");
            return;
        }

        const newPass = prompt("Жаңа құпия сөзді енгізіңіз (кемінде 4 таңба):");
        if (!newPass || newPass.trim().length < 4) {
            alert("Құпия сөз тым қысқа немесе енгізілмеді (кемінде 4 таңба болуы шарт).");
            return;
        }

        const confirmPass = prompt("Жаңа құпия сөзді қайталаңыз:");
        if (newPass.trim() !== (confirmPass || "").trim()) {
            alert("Қате: Құпия сөздер бір-біріне сәйкес келмеді!");
            return;
        }

        this.setTeacherPassword(newPass.trim());
        alert("✅ Құпия сөз сәтті жаңартылды! Енді жаңа құпия сөзбен кіресіз.");
    },

    openTeacherModal(filterGrade = "all") {
        if (!this.checkTeacherAuth()) {
            this.showTeacherPasswordModal(filterGrade);
            return;
        }
        this.renderTeacherModal(filterGrade);
    },

    renderTeacherModal(filterGrade = "all") {
        const modal = document.getElementById("diagnostics-modal");
        if (!modal) return;

        const students = this.getTeacherStudents();

        // Сүзгі қолдану
        let filtered = students;
        if (filterGrade !== "all") {
            filtered = students.filter(s => (s.grade || "").includes(filterGrade));
        }

        // Сынып аналитикасын есептеу
        const totalCount = filtered.length;
        let sumAcc = 0;
        let mark5Count = 0;
        let mark4Count = 0;
        let mark3Count = 0;
        let topStudent = null;

        filtered.forEach(s => {
            sumAcc += (s.accuracy || 0);
            if (s.gradeMark === "5") mark5Count++;
            else if (s.gradeMark === "4") mark4Count++;
            else mark3Count++;

            if (!topStudent || (s.xp || 0) > (topStudent.xp || 0)) {
                topStudent = s;
            }
        });

        const avgAcc = totalCount > 0 ? Math.round(sumAcc / totalCount) : 0;
        const currentDate = new Date().toLocaleDateString("kk-KZ", { year: "numeric", month: "long", day: "numeric" });

        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
                <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-6xl w-full p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col max-h-[92vh] animate-fade-in text-slate-100">
                    
                    <!-- 1. ШАПКА ЖӘНЕ БАСҚАРУ -->
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
                        <div class="flex items-center gap-3">
                            <span class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/25">
                                👨‍🏫
                            </span>
                            <div>
                                <h3 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                    Мұғалім кабинеті: Сынып журналы және ведомость
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">
                                    Оқушылардың тапсырған жұмыстарын қабылдау, салыстырмалы бағалау және талдау орталығы • 📅 ${currentDate}
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 self-end sm:self-center">
                            <button onclick="Diagnostics.promptChangeTeacherPassword()" title="Мұғалімнің админ құпия сөзін өзгерту" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
                                <span>🔑</span>
                                <span class="hidden sm:inline">Құпия сөз</span>
                            </button>
                            <button onclick="Diagnostics.teacherLogout()" title="Мұғалім кабинетінен шығу және журналды құлыптау" class="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
                                <span>🔒</span>
                                <span class="hidden sm:inline">Шығу</span>
                            </button>
                            <button onclick="Diagnostics.openReportTableModal()" title="Оқушының жеке даму кестесі" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
                                <span>📊</span>
                                <span class="hidden sm:inline">Оқушы кестесі</span>
                            </button>
                            <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold transition">
                                ✕
                            </button>
                        </div>
                    </div>

                    <!-- 2. СЫНЫП АНАЛИТИКАСЫ (STAT CARDS) -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 shrink-0 text-xs">
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Тіркелген оқушылар</div>
                            <div class="text-xl font-extrabold text-white">${totalCount} оқушы</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Журналға енгізілген</div>
                        </div>
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Сыныптың орташа сапасы</div>
                            <div class="text-xl font-extrabold ${avgAcc >= 70 ? 'text-emerald-400' : avgAcc >= 50 ? 'text-amber-400' : 'text-rose-400'}">${avgAcc}%</div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Тест және есеп сапасы</div>
                        </div>
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Бағалар бөлінісі</div>
                            <div class="text-sm font-extrabold text-slate-200 flex items-center gap-2 mt-1">
                                <span class="text-emerald-400 font-black">«5»: ${mark5Count}</span> • 
                                <span class="text-amber-400 font-black">«4»: ${mark4Count}</span> • 
                                <span class="text-rose-400 font-black">«3»: ${mark3Count}</span>
                            </div>
                            <div class="text-[10px] text-slate-500 mt-0.5">Оқушылар деңгейі</div>
                        </div>
                        <div class="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                            <div class="text-slate-400 text-[11px] mb-0.5">Сынып көшбасшысы</div>
                            <div class="text-sm font-extrabold text-sky-400 truncate mt-1">
                                ${topStudent ? topStudent.name : '—'}
                            </div>
                            <div class="text-[10px] text-slate-500 mt-0.5">${topStudent ? topStudent.xp + ' XP' : ''}</div>
                        </div>
                    </div>

                    <!-- 3. СҮЗГІЛЕР ЖӘНЕ МҰҒАЛІМ ҚҰРАЛДАРЫ (EXCEL, JSON ҚАБЫЛДАУ, ҚОСУ) -->
                    <div class="flex flex-wrap items-center justify-between gap-2 py-2 border-y border-slate-800 shrink-0 text-xs">
                        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            <span class="text-slate-400 font-semibold text-[11px] mr-1 hidden sm:inline">Сынып:</span>
                            <button onclick="Diagnostics.openTeacherModal('all')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">Барлығы</button>
                            <button onclick="Diagnostics.openTeacherModal('7')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '7' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">7-сынып</button>
                            <button onclick="Diagnostics.openTeacherModal('8')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '8' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">8-сынып</button>
                            <button onclick="Diagnostics.openTeacherModal('9')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '9' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">9-сынып</button>
                            <button onclick="Diagnostics.openTeacherModal('10')" class="px-2.5 py-1 rounded-lg font-bold transition ${filterGrade === '10' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">10-сынып</button>
                        </div>

                        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <button onclick="CloudSync.pullAllStudents(true)" class="px-2.5 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/25 text-[11px]" title="Бұлттық базадағы жаңа оқушы жауаптарын тарту">
                                <span>☁️</span>
                                <span>Бұлттан жаңарту</span>
                            </button>
                            <button onclick="CloudSync.openConfigModal()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Бұлттық база және GitHub Pages баптауы">
                                <span>⚙️</span>
                                <span>Бұлт баптауы</span>
                            </button>
                            <button onclick="Diagnostics.promptImportStudentJSON()" class="px-2.5 py-1.5 bg-indigo-700/80 hover:bg-indigo-600 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Оқушы жіберген .json файлын журналға қосу">
                                <span>📥</span>
                                <span>Файл қабылдау</span>
                            </button>
                            <button onclick="Diagnostics.promptAddStudent()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Жаңа оқушыны қолмен журналға тіркеу">
                                <span>➕</span>
                                <span>Оқушы қосу</span>
                            </button>
                            <button onclick="Diagnostics.downloadTeacherClassCSV()" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm text-[11px]" title="Сынып ведомосін Excel файлына жүктеу">
                                <span>📥</span>
                                <span>Excel</span>
                            </button>
                            <button onclick="Diagnostics.printTeacherClass()" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20 text-[11px]" title="Сынып журналын баспаға шығару">
                                <span>🖨️</span>
                                <span>Басып шығару</span>
                            </button>
                            <button onclick="Diagnostics.resetTeacherClassData()" class="px-2 py-1.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl font-semibold transition text-[11px]" title="Журналды бастапқы үлгіге келтіру">
                                🔄
                            </button>
                        </div>
                    </div>

                    <!-- 4. СЫНЫП ЖУРНАЛЫ КЕСТЕСІ -->
                    <div class="flex-1 overflow-x-auto overflow-y-auto my-2 rounded-2xl border border-slate-800">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead class="bg-slate-800/90 text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-700 text-[11px]">
                                <tr>
                                    <th class="p-3 w-10 text-center">№</th>
                                    <th class="p-3 min-w-[180px]">Оқушының аты-жөні</th>
                                    <th class="p-3 min-w-[110px] text-center">Сыныбы</th>
                                    <th class="p-3 min-w-[120px] text-center">Тақырыптар (19-дан)</th>
                                    <th class="p-3 min-w-[110px] text-center">Тест сапасы (%)</th>
                                    <th class="p-3 min-w-[110px] text-center">Талданған есеп</th>
                                    <th class="p-3 min-w-[90px] text-center">Жалпы XP</th>
                                    <th class="p-3 min-w-[120px] text-center">Меңгеру деңгейі</th>
                                    <th class="p-3 min-w-[90px] text-center">Баға</th>
                                    <th class="p-3 min-w-[90px] text-center">Күні</th>
                                    <th class="p-3 w-12 text-center">Әрекет</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60 font-normal">
                                ${filtered.length > 0 ? filtered.map((st, idx) => `
                                    <tr class="hover:bg-slate-800/40 transition">
                                        <td class="p-3 text-center text-slate-500 font-mono">${idx + 1}</td>
                                        <td class="p-3">
                                            <div class="font-bold text-slate-100 flex items-center gap-1.5">
                                                <span>👤</span>
                                                <span>${st.name}</span>
                                            </div>
                                            <div class="text-[10px] text-slate-400">${st.school || 'Мектеп көрсетілмеген'}</div>
                                        </td>
                                        <td class="p-3 text-center">
                                            <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 text-[11px]">
                                                ${st.grade}
                                            </span>
                                        </td>
                                        <td class="p-3 text-center font-mono">
                                            <span class="font-bold text-white">${st.topicsCount || st.testsDone || 0} / 19</span>
                                        </td>
                                        <td class="p-3 text-center">
                                            <span class="font-bold ${st.accuracy >= 70 ? 'text-emerald-400' : st.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}">
                                                ${st.accuracy}%
                                            </span>
                                            <div class="w-16 mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                                <div class="h-full ${st.accuracy >= 70 ? 'bg-emerald-500' : st.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${st.accuracy}%"></div>
                                            </div>
                                        </td>
                                        <td class="p-3 text-center font-mono text-purple-300 font-bold">
                                            ${st.probAnalyzed || 0} есеп
                                        </td>
                                        <td class="p-3 text-center font-bold text-sky-400 font-mono">
                                            ${st.xp} XP
                                        </td>
                                        <td class="p-3 text-center">
                                            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${st.status === 'Жоғары' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : st.status === 'Жеткілікті' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                                                ${st.status}
                                            </span>
                                        </td>
                                        <td class="p-3 text-center">
                                            <span class="w-7 h-7 rounded-xl inline-flex items-center justify-center font-black text-xs ${st.gradeMark === '5' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : st.gradeMark === '4' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'}">
                                                ${st.gradeMark || '4'}
                                            </span>
                                        </td>
                                        <td class="p-3 text-center text-slate-400 text-[11px]">
                                            ${st.date || '—'}
                                        </td>
                                        <td class="p-3 text-center">
                                            <button onclick="Diagnostics.deleteTeacherStudent('${st.id}')" title="Оқушыны тізімнен өшіру" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-500 text-xs font-bold transition flex items-center justify-center mx-auto">
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                `).join("") : `
                                    <tr>
                                        <td colspan="11" class="p-8 text-center text-slate-400">
                                            Бұл сүзгі бойынша оқушылар табылмады. «➕ Оқушы қосу» немесе «📥 Оқушы файлын қабылдау» батырмасын басыңыз.
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>

                    <!-- 5. ПЕДАГОГИКАЛЫҚ НҰСҚАУЛЫҚ: МҰҒАЛІМ ЖҰМЫСТЫ ҚАЛАЙ ҚАБЫЛДАЙДЫ? -->
                    <div class="pt-3 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 text-xs">
                        <div class="space-y-1 text-slate-400 text-[11px] text-left">
                            <div class="text-white font-bold flex items-center gap-1.5">
                                <span>💡</span> <span>Мұғалімге әдістемелік нұсқау: Оқушы жұмысын қабылдаудың 4 тәсілі:</span>
                            </div>
                            <div class="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
                                <span>1️⃣ <strong>Күнделік.кз:</strong> Оқушы «Excel» не «.JSON» файлын тапсырмаға тіркейді.</span>
                                <span>2️⃣ <strong>WhatsApp:</strong> Оқушы 1 батырмамен нәтижесін жеке чатқа жолдайды.</span>
                                <span>3️⃣ <strong>Файлды импорттау:</strong> Жоғарыдағы «Оқушы файлын қабылдау» арқылы журналға 1 секундта қосылады.</span>
                                <span>4️⃣ <strong>Мектеп ведомосі:</strong> Сынып журналын Excel немесе қағазға шығарып әкімшілікке тапсыру.</span>
                                <span class="text-amber-300 font-semibold">🔐 <strong>Қауіпсіздік:</strong> Оқушылар сілтемені ашқанда құпия сөзсіз кіре алмайды.</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 self-end md:self-center">
                            <button onclick="document.getElementById('diagnostics-modal').classList.add('hidden')" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition">
                                Жабу
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;
        modal.classList.remove("hidden");
    },

    // ---------------- СЫНЫП ВЕДОМОСІН EXCEL (CSV) ЖҮКТЕУ ----------------
    downloadTeacherClassCSV() {
        const students = this.getTeacherStudents();
        const headers = [
            "№",
            "Оқушының аты-жөні",
            "Сыныбы",
            "Мектебі",
            "Тақырыптар (19-дан)",
            "Тест сапасы (%)",
            "Талданған есептер",
            "Жалпы XP",
            "Меңгеру деңгейі",
            "Ұсынылатын баға",
            "Тапсырған күні"
        ];

        const rows = students.map((st, idx) => [
            idx + 1,
            `"${(st.name || '').replace(/"/g, '""')}"`,
            `"${(st.grade || '').replace(/"/g, '""')}"`,
            `"${(st.school || '').replace(/"/g, '""')}"`,
            st.topicsCount || st.testsDone || 0,
            `${st.accuracy}%`,
            st.probAnalyzed || 0,
            `${st.xp} XP`,
            `"${st.status || ''}"`,
            `"${st.gradeMark || '4'}"`,
            st.date || ''
        ]);

        let csvContent = "\uFEFF";
        csvContent += `"ГЕОМЕТРИЯ ПӘНІ: СЫНЫПТЫҢ ДАМУ ДИНАМИКАСЫ ЖӘНЕ БАҒАЛАУ ВЕДОМОСІ"\r\n`;
        csvContent += `"Мектеп:","№10 мектеп-лицейі"\r\n`;
        csvContent += `"Оқушылар саны:","${students.length} оқушы"\r\n`;
        csvContent += `"Жасалған күні:","${new Date().toLocaleDateString('kk-KZ')}"\r\n\r\n`;

        csvContent += headers.join(",") + "\r\n";
        rows.forEach(r => {
            csvContent += r.join(",") + "\r\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Сынып_ведомосі_Геометрия_${new Date().toLocaleDateString('kk-KZ').replace(/\./g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // ---------------- СЫНЫП ЖУРНАЛЫН БАСПАҒА ШЫҒАРУ ----------------
    printTeacherClass() {
        window.print();
    },

    // ---------------- ОҚУШЫДАН КЕЛГЕН .JSON ФАЙЛЫН ҚАБЫЛДАУ ----------------
    promptImportStudentJSON() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    const st = parsed.student;
                    if (!st || !st.name) {
                        alert("Қате: Бұл файлда оқушы туралы толық мәлімет жоқ.");
                        return;
                    }

                    const students = this.getTeacherStudents();
                    const sm = parsed.summary || {};
                    const newRecord = {
                        id: "st-" + Date.now(),
                        name: st.name,
                        grade: st.grade || "8 «А» сынып",
                        school: st.school || "Мектеп көрсетілмеген",
                        xp: sm.xp || parsed.xp || 0,
                        accuracy: sm.accuracy || parsed.accuracy || 75,
                        testsDone: sm.topicsCount || sm.testsDone || 10,
                        probAnalyzed: sm.probAnalyzed || 9,
                        topicsCount: sm.topicsCount || 10,
                        status: sm.status || "Жеткілікті",
                        gradeMark: sm.gradeMark || "4",
                        date: parsed.dateFormatted || new Date().toLocaleDateString("kk-KZ")
                    };

                    const existingIdx = students.findIndex(s => s.name.trim().toLowerCase() === newRecord.name.trim().toLowerCase());
                    if (existingIdx >= 0) {
                        students[existingIdx] = newRecord;
                    } else {
                        students.unshift(newRecord);
                    }

                    localStorage.setItem(this.teacherStorageKey, JSON.stringify(students));
                    alert(`✅ Оқушы «${newRecord.name}» жұмысы сәтті қабылданды және сынып журналына қосылды!`);
                    this.openTeacherModal();
                } catch (err) {
                    alert("Файлды оқу қатесі: " + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    // ---------------- ОҚУШЫНЫ ҚОЛМЕН ҚОСУ ----------------
    promptAddStudent() {
        const name = prompt("Оқушының аты-жөнін енгізіңіз (Мысалы: Бауыржан Асқарұлы):");
        if (!name || !name.trim()) return;

        const grade = prompt("Сыныбы (Мысалы: 8 «А» сынып):", "8 «А» сынып") || "8 «А» сынып";
        const xpStr = prompt("Жинаған XP ұпайы (Мысалы: 450):", "450");
        const xp = parseInt(xpStr) || 300;
        const accStr = prompt("Тест сапасы % (Мысалы: 85):", "85");
        const acc = parseInt(accStr) || 80;

        let status = "Жеткілікті";
        let mark = "4";
        if (acc >= 85 || xp >= 600) {
            status = "Жоғары";
            mark = "5";
        } else if (acc < 60) {
            status = "Бастапқы";
            mark = "3";
        }

        const students = this.getTeacherStudents();
        const newRecord = {
            id: "st-" + Date.now(),
            name: name.trim(),
            grade: grade.trim(),
            school: "№10 мектеп-лицейі",
            xp: xp,
            accuracy: acc,
            testsDone: Math.round(xp / 40),
            probAnalyzed: Math.round(xp / 50),
            topicsCount: Math.min(19, Math.round(xp / 35)),
            status: status,
            gradeMark: mark,
            date: new Date().toLocaleDateString("kk-KZ")
        };

        students.unshift(newRecord);
        localStorage.setItem(this.teacherStorageKey, JSON.stringify(students));
        this.openTeacherModal();
    },

    // ---------------- ОҚУШЫНЫ ЖУРНАЛДАН ЖОЮ ----------------
    deleteTeacherStudent(id) {
        if (!confirm("Оқушыны журналдан өшіруге сенімдісіз бе?")) return;
        let students = this.getTeacherStudents();
        students = students.filter(s => s.id !== id);
        localStorage.setItem(this.teacherStorageKey, JSON.stringify(students));
        this.openTeacherModal();
    },

    // ---------------- ЖУРНАЛДЫ БАСТАПҚЫ ҮЛГІГЕ КЕЛТІРУ ----------------
    resetTeacherClassData() {
        if (!confirm("Сынып журналын бастапқы үлгіге келтіруді қалайсыз ба?")) return;
        localStorage.removeItem(this.teacherStorageKey);
        this.openTeacherModal();
    },

    // ---------------- БАСПАҒА (PRINT) ШЫҒАРУ ----------------
    printReport() {
        window.print();
    },

    renderDashboardModal() {
        this.openReportTableModal();
    }
};

window.Diagnostics = Diagnostics;
