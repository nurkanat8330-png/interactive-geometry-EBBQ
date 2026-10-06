/**
 * 3 ДЕҢГЕЙЛІ ЕСЕПТЕР ЖӘНЕ ЖАУАБЫН ТАЛДАУ ҚОЗҒАЛТҚЫШЫ
 * - Әр деңгей 3 есептен тұрады (барлығы 9 деңгейлік есеп).
 * - Оқушы алдымен өз жауабын арнайы жолға енгізеді.
 * - «Жауапты тексеру және талдау» батырмасын басқанда:
 *   1. Оқушының жауабы тексеріледі (дұрыс немесе салыстыру);
 *   2. Толық қадамдық математикалық талдау мен шешу жолы ашылады;
 *   3. Даму динамикасына (XP және статистика) автоматты түрде тіркеледі.
 */

const ProblemEngine = {
    currentTopic: null,
    currentLevel: "levelA",
    // topicId -> levelKey -> problemIndex -> { userAnswer, submitted, isCorrect, expanded }
    state: {},

    init(topic) {
        this.currentTopic = topic;
        this.currentLevel = "levelA";
        if (topic && !this.state[topic.id]) {
            this.state[topic.id] = {
                levelA: {},
                levelB: {},
                levelC: {}
            };
        }
        this.render();
    },

    setLevel(levelKey) {
        this.currentLevel = levelKey;
        this.render();
    },

    getProblemState(idx) {
        if (!this.currentTopic) return {};
        const tState = this.state[this.currentTopic.id];
        if (!tState) return {};
        if (!tState[this.currentLevel]) tState[this.currentLevel] = {};
        return tState[this.currentLevel][idx] || {
            userAnswer: "",
            submitted: false,
            isCorrect: false,
            expanded: false
        };
    },

    setProblemState(idx, data) {
        if (!this.currentTopic) return;
        if (!this.state[this.currentTopic.id]) {
            this.state[this.currentTopic.id] = { levelA: {}, levelB: {}, levelC: {} };
        }
        if (!this.state[this.currentTopic.id][this.currentLevel]) {
            this.state[this.currentTopic.id][this.currentLevel] = {};
        }
        const prev = this.state[this.currentTopic.id][this.currentLevel][idx] || {};
        this.state[this.currentTopic.id][this.currentLevel][idx] = {
            ...prev,
            ...data
        };
    },

    // Оқушы жауабын эталонды жауаппен ақылды салыстыру
    checkAnswerMatch(userAns, correctAns) {
        if (!userAns || !correctAns) return false;

        const clean = (str) => {
            return String(str).toLowerCase()
                .replace(/[°\^]/g, '')
                .replace(/см|м|мм|дм|км|кг|г|сек|с|мин|сағ|градус|бұрыш|және/g, ' ')
                .replace(/[.,;:()]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        const uClean = clean(userAns);
        const cClean = clean(correctAns);

        if (uClean === cClean) return true;

        // Сандарды шығарып алып салыстыру
        const extractNumbers = (str) => {
            const matches = String(str).match(/-?\d+(?:[.,]\d+)?/g);
            return matches ? matches.map(n => parseFloat(n.replace(',', '.'))) : [];
        };

        const uNums = extractNumbers(userAns);
        const cNums = extractNumbers(correctAns);

        if (uNums.length > 0 && uNums.length === cNums.length) {
            const allMatch = uNums.every((num, i) => Math.abs(num - cNums[i]) < 0.05);
            if (allMatch) return true;
        }

        // Тұтас негізгі сөз сәйкестігі
        if (cClean.includes(uClean) && uClean.length >= 2) return true;

        return false;
    },

    // Оқушы өз жауабын жібергенде орындалатын басты функция
    submitAnswer(idx) {
        const inputEl = document.getElementById(`prob-input-${idx}`);
        const userAns = inputEl ? inputEl.value.trim() : "";

        if (!userAns) {
            if (inputEl) {
                inputEl.focus();
                inputEl.classList.add("ring-2", "ring-rose-500");
                setTimeout(() => inputEl.classList.remove("ring-2", "ring-rose-500"), 1200);
            }
            alert("Алдымен өз жауабыңызды жазыңыз. Егер есепті шешуде қиналсаңыз, «Талдауды ашу» сілтемесін басыңыз.");
            return;
        }

        const problems = (this.currentTopic.problems && this.currentTopic.problems[this.currentLevel]) || [];
        const prob = problems[idx];
        if (!prob) return;

        const isMatch = this.checkAnswerMatch(userAns, prob.answer);

        this.setProblemState(idx, {
            userAnswer: userAns,
            submitted: true,
            isCorrect: isMatch,
            expanded: true
        });

        // Диагностика мен даму динамикасына тіркеу (XP қосу)
        if (this.currentTopic && typeof Diagnostics !== "undefined") {
            Diagnostics.recordProblemAnalyzed(this.currentTopic.id, this.currentLevel, idx);
        }

        this.render();
    },

    // Қиналған оқушыға тікелей талдауды ашуға мүмкіндік беру
    revealAnalysisDirectly(idx) {
        const problems = (this.currentTopic.problems && this.currentTopic.problems[this.currentLevel]) || [];
        const prob = problems[idx];
        if (!prob) return;

        this.setProblemState(idx, {
            userAnswer: "Тікелей талдау қаралды",
            submitted: true,
            isCorrect: false,
            expanded: true
        });

        if (this.currentTopic && typeof Diagnostics !== "undefined") {
            Diagnostics.recordProblemAnalyzed(this.currentTopic.id, this.currentLevel, idx);
        }

        this.render();
    },

    // Талдау блогын ашу / жабу
    toggleAnalysis(idx) {
        const pState = this.getProblemState(idx);
        this.setProblemState(idx, {
            expanded: !pState.expanded
        });
        this.render();
    },

    // Қайта шешу
    resetProblem(idx) {
        this.setProblemState(idx, {
            userAnswer: "",
            submitted: false,
            isCorrect: false,
            expanded: false
        });
        this.render();
    },

    render() {
        const container = document.getElementById("problems-container");
        if (!container || !this.currentTopic) return;

        const problems = (this.currentTopic.problems && this.currentTopic.problems[this.currentLevel]) || [];

        const levelInfo = {
            levelA: { title: "А деңгейі — Базалық алгоритмдік есептер", color: "emerald", icon: "🟢" },
            levelB: { title: "В деңгейі — Қолданбалы және талдау есептері", color: "blue", icon: "🔵" },
            levelC: { title: "С деңгейі — Шығармашылық / PISA тапсырмалары", color: "purple", icon: "🟣" }
        };

        const current = levelInfo[this.currentLevel];

        let html = `
            <div class="space-y-6">
                <!-- Деңгей таңдау панелі -->
                <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs uppercase font-bold tracking-wider text-slate-400">Есеп деңгейлері:</span>
                        <button onclick="ProblemEngine.setLevel('levelA')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.currentLevel === 'levelA' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                            А деңгейі (3 есеп)
                        </button>
                        <button onclick="ProblemEngine.setLevel('levelB')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.currentLevel === 'levelB' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                            В деңгейі (3 есеп)
                        </button>
                        <button onclick="ProblemEngine.setLevel('levelC')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.currentLevel === 'levelC' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                            С деңгейі (3 PISA есеп)
                        </button>
                    </div>

                    <div class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                        ${current.icon} ${current.title}
                    </div>
                </div>

                <!-- 3 есеп тізімі -->
                <div class="space-y-5">
        `;

        problems.forEach((prob, idx) => {
            const pState = this.getProblemState(idx);
            const isSubmitted = !!pState.submitted;
            const isExpanded = !!pState.expanded;

            html += `
                <div class="bg-slate-900 rounded-2xl border ${isSubmitted ? (pState.isCorrect ? 'border-emerald-500/40 shadow-emerald-950/20' : 'border-amber-500/40 shadow-amber-950/20') : 'border-slate-800'} overflow-hidden shadow-lg transition-all hover:border-slate-700">
                    
                    <!-- Есептің тақырыбы мен шарты -->
                    <div class="p-6">
                        <div class="flex items-center justify-between gap-3 mb-3">
                            <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                <span>№${idx + 1}</span>
                                <span>${prob.title}</span>
                            </span>
                            <span class="text-xs text-slate-400 font-mono">Қадамдық шешу бағалауы</span>
                        </div>

                        <p class="text-base text-slate-100 font-normal leading-relaxed mb-4">
                            ${prob.task}
                        </p>

                        <!-- ОҚУШЫ ЖАУАБЫН ЕНГІЗУ НЕМЕСЕ НӘТИЖЕНІ ТАЛДАУ БӨЛІМІ -->
                        ${!isSubmitted ? `
                            <div class="mt-4 pt-4 border-t border-slate-800">
                                <label class="block text-xs font-semibold text-slate-300 mb-2">
                                    ✍️ <strong>Өз жауабыңызды енгізіңіз:</strong>
                                </label>
                                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <input type="text" id="prob-input-${idx}" 
                                        placeholder="Мысалы: 32 см немесе 60°..."
                                        value="${pState.userAnswer || ''}"
                                        onkeydown="if(event.key==='Enter') ProblemEngine.submitAnswer(${idx})"
                                        class="flex-1 bg-slate-800/90 border border-slate-700 focus:border-sky-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none transition">
                                    <button onclick="ProblemEngine.submitAnswer(${idx})" 
                                        class="px-5 py-2.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 whitespace-nowrap">
                                        <span>Жауапты тексеру және талдау</span>
                                        <span class="text-sm">➔</span>
                                    </button>
                                </div>
                                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 mt-2.5 text-[11px] text-slate-400">
                                    <span>💡 Есепті алдымен дәптерге шығарып, жауабыңызды жазыңыз.</span>
                                    <button type="button" onclick="ProblemEngine.revealAnalysisDirectly(${idx})" class="text-sky-400 hover:underline hover:text-sky-300 whitespace-nowrap">
                                        Қиналсаңыз: Талдауды ашу
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div class="mt-4 pt-4 border-t border-slate-800">
                                ${pState.isCorrect ? `
                                    <div class="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                                        <div class="flex items-center gap-3">
                                            <span class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-black text-lg shrink-0">
                                                ✓
                                            </span>
                                            <div>
                                                <div class="text-xs font-bold text-emerald-400 flex flex-wrap items-center gap-2">
                                                    <span>Сіздің жауабыңыз:</span>
                                                    <span class="text-white text-sm font-extrabold font-mono bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">${pState.userAnswer}</span>
                                                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Дұрыс! 🎉 (+15 XP)</span>
                                                </div>
                                                <div class="text-[11px] text-slate-300 mt-1">Керемет! Жауабыңыз дұрыс шықты. Төменде қадамдық математикалық талдау ұсынылды.</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            <button onclick="ProblemEngine.toggleAnalysis(${idx})" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1">
                                                <span>${isExpanded ? 'Талдауды жабу ▲' : 'Талдауды көру ▼'}</span>
                                            </button>
                                            <button onclick="ProblemEngine.resetProblem(${idx})" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition" title="Қайта шешу">
                                                🔄
                                            </button>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="p-3.5 rounded-xl bg-slate-800/80 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                                        <div class="flex items-start sm:items-center gap-3">
                                            <span class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                                                ℹ️
                                            </span>
                                            <div>
                                                <div class="text-xs font-semibold text-slate-300 flex flex-wrap items-center gap-2">
                                                    <span>Сіздің жауабыңыз:</span>
                                                    <span class="text-amber-300 text-sm font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">${pState.userAnswer}</span>
                                                    <span class="text-slate-500">•</span>
                                                    <span>Эталонды жауап:</span>
                                                    <span class="text-emerald-400 text-sm font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">${prob.answer}</span>
                                                </div>
                                                <div class="text-[11px] text-slate-400 mt-1">Төмендегі қадамдық талдаумен танысып, шығару жолындағы қателікті түзетіңіз.</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            <button onclick="ProblemEngine.toggleAnalysis(${idx})" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1">
                                                <span>${isExpanded ? 'Талдауды жабу ▲' : 'Талдауды көру ▼'}</span>
                                            </button>
                                            <button onclick="ProblemEngine.resetProblem(${idx})" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition" title="Қайта шешу">
                                                🔄
                                            </button>
                                        </div>
                                    </div>
                                `}
                            </div>
                        `}
                    </div>

                    <!-- Талдау бөлігі (Оқушы жауап бергеннен кейін немесе ашылғанда) -->
                    ${isExpanded ? `
                        <div class="bg-slate-950/85 p-6 border-t border-slate-800 animate-fade-in space-y-4">
                            <!-- Дұрыс жауап жадынамасы -->
                            <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/50 flex items-center gap-3">
                                <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                                    ✓
                                </span>
                                <div>
                                    <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Қорытынды эталонды жауап:</div>
                                    <div class="text-base font-bold text-slate-100">${prob.answer}</div>
                                </div>
                            </div>

                            <!-- Қадамдық шешу жолы -->
                            <div>
                                <h4 class="text-sm font-bold text-sky-400 mb-2 flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                                    Қадамдық шешу және математикалық талдау:
                                </h4>
                                <div class="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                                    ${prob.analysis}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // KaTeX формулаларын визуализациялау
        if (window.renderMathInElement) {
            renderMathInElement(container, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    }
};

window.ProblemEngine = ProblemEngine;
