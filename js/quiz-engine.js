/**
 * 3 ДЕҢГЕЙЛІ ТЕСТ ЖҮЙЕСІ ЖӘНЕ ҚАТЕНІ ИНТЕЛЛЕКТУАЛДЫ ТАЛДАУ
 * Әр деңгей 5 сұрақтан тұрады. Қате болса толық педагогикалық түсіндірме береді.
 */

const QuizEngine = {
    currentTopic: null,
    currentLevel: "levelA", // "levelA" | "levelB" | "levelC"
    currentIndex: 0,
    userAnswers: {},
    isAnswered: false,

    init(topic) {
        this.currentTopic = topic;
        this.currentLevel = "levelA";
        this.currentIndex = 0;
        this.userAnswers = {};
        this.isAnswered = false;
        this.render();
    },

    setLevel(levelKey) {
        this.currentLevel = levelKey;
        this.currentIndex = 0;
        this.userAnswers = {};
        this.isAnswered = false;
        this.render();
    },

    render() {
        const container = document.getElementById("quiz-container");
        if (!container || !this.currentTopic) return;

        const questions = this.currentTopic.quiz[this.currentLevel] || [];
        const total = questions.length;
        const q = questions[this.currentIndex];

        if (!q) {
            container.innerHTML = `<div class="p-6 text-center text-slate-400">Сұрақтар табылмады.</div>`;
            return;
        }

        const levelTitles = {
            levelA: { title: "А деңгейі — Базалық білім", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
            levelB: { title: "В деңгейі — Қолдану және алгоритм", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
            levelC: { title: "С деңгейі — Күрделі және PISA", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40" }
        };

        const currentBadge = levelTitles[this.currentLevel];
        const isSelected = this.userAnswers[this.currentIndex] !== undefined;
        const selectedIdx = this.userAnswers[this.currentIndex];

        let html = `
            <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-700/80 shadow-xl">
                <!-- Деңгей таңдау батырмалары -->
                <div class="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                        <span class="text-xs uppercase font-bold tracking-wider text-slate-400">Деңгейлер:</span>
                        <button onclick="QuizEngine.setLevel('levelA')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.currentLevel === 'levelA' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                            А деңгейі (Базалық)
                        </button>
                        <button onclick="QuizEngine.setLevel('levelB')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.currentLevel === 'levelB' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                            В деңгейі (Орташа)
                        </button>
                        <button onclick="QuizEngine.setLevel('levelC')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${this.currentLevel === 'levelC' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                            С деңгейі (PISA / Күрделі)
                        </button>
                    </div>

                    <div class="text-xs font-semibold px-3 py-1 rounded-full border ${currentBadge.badge}">
                        ${currentBadge.title} • ${this.currentIndex + 1} / ${total} сұрақ
                    </div>
                </div>

                <!-- Сұрақ барысы (прогресс) -->
                <div class="w-full bg-slate-800 h-2 rounded-full my-4 overflow-hidden">
                    <div class="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300" style="width: ${((this.currentIndex + 1) / total) * 100}%"></div>
                </div>

                <!-- Сұрақ мәтіні -->
                <div class="my-5">
                    <div class="flex items-start gap-3">
                        <span class="flex-shrink-0 w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold flex items-center justify-center text-sm">
                            ${this.currentIndex + 1}
                        </span>
                        <h3 class="text-lg md:text-xl font-semibold text-slate-100 leading-snug">
                            ${q.question}
                        </h3>
                    </div>
                </div>

                <!-- Жауап нұсқалары -->
                <div class="space-y-3 my-6">
        `;

        q.options.forEach((opt, idx) => {
            let btnClass = "bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200";
            let iconHtml = `<span class="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-300 flex items-center justify-center font-bold text-xs uppercase">${['A', 'B', 'C', 'D'][idx]}</span>`;

            if (isSelected) {
                if (idx === q.correct) {
                    btnClass = "bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold shadow-md shadow-emerald-950/50";
                    iconHtml = `<span class="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">✓</span>`;
                } else if (idx === selectedIdx) {
                    btnClass = "bg-rose-950/70 border-rose-500 text-rose-200 font-semibold shadow-md shadow-rose-950/50";
                    iconHtml = `<span class="w-7 h-7 rounded-lg bg-rose-500 text-slate-950 flex items-center justify-center font-bold text-xs">✕</span>`;
                } else {
                    btnClass = "bg-slate-900/60 border-slate-800 text-slate-500 opacity-60";
                }
            }

            html += `
                <button onclick="QuizEngine.selectAnswer(${idx})" ${isSelected ? 'disabled' : ''} 
                    class="w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 group ${btnClass}">
                    ${iconHtml}
                    <span class="text-sm md:text-base flex-1">${opt}</span>
                </button>
            `;
        });

        html += `</div>`;

        // Қателік немесе дұрыс түсіндірме блогы
        if (isSelected) {
            const isCorrect = selectedIdx === q.correct;
            html += `
                <div class="mt-5 p-5 rounded-xl border ${isCorrect ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200' : 'bg-rose-950/40 border-rose-600/60 text-rose-200'} animate-fade-in">
                    <div class="flex items-center gap-2 mb-2 font-bold text-base">
                        ${isCorrect 
                            ? '<span class="text-emerald-400">🎉 Дұрыс жауап! Өте жақсы!</span>' 
                            : '<span class="text-rose-400">⚠️ Қате жауап! Қатені түзету және түсіндірме:</span>'}
                    </div>
                    <div class="text-sm leading-relaxed text-slate-300">
                        ${q.explanation}
                    </div>
                </div>
            `;
        }

        // Төменгі навигация
        html += `
            <div class="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
                <button onclick="QuizEngine.prevQuestion()" ${this.currentIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:bg-slate-800 text-slate-300"'} 
                    class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
                    ← Алдыңғы сұрақ
                </button>

                <div class="flex items-center gap-2">
                    ${this.currentIndex < total - 1 ? `
                        <button onclick="QuizEngine.nextQuestion()" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/30 flex items-center gap-2 transition">
                            Келесі сұрақ →
                        </button>
                    ` : `
                        <button onclick="QuizEngine.finishLevel()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition">
                            Деңгейді аяқтау 🏆
                        </button>
                    `}
                </div>
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
    },

    selectAnswer(idx) {
        if (this.userAnswers[this.currentIndex] !== undefined) return;
        this.userAnswers[this.currentIndex] = idx;

        const q = this.currentTopic.quiz[this.currentLevel][this.currentIndex];
        const isCorrect = idx === q.correct;

        // Дыбыстық кері байланыс
        this.playSound(isCorrect);

        // Диагностиканы жаңарту
        if (window.Diagnostics) {
            Diagnostics.recordAnswer(this.currentTopic.id, this.currentLevel, this.currentIndex, isCorrect);
        }

        this.render();
    },

    nextQuestion() {
        const total = this.currentTopic.quiz[this.currentLevel].length;
        if (this.currentIndex < total - 1) {
            this.currentIndex++;
            this.render();
        }
    },

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
        }
    },

    finishLevel() {
        const questions = this.currentTopic.quiz[this.currentLevel];
        let correctCount = 0;
        questions.forEach((q, i) => {
            if (this.userAnswers[i] === q.correct) correctCount++;
        });

        const percent = Math.round((correctCount / questions.length) * 100);
        const container = document.getElementById("quiz-container");

        let levelNext = this.currentLevel === "levelA" ? "levelB" : this.currentLevel === "levelB" ? "levelC" : null;

        container.innerHTML = `
            <div class="bg-slate-900 rounded-2xl p-8 border border-slate-700 text-center max-w-lg mx-auto shadow-2xl animate-fade-in">
                <div class="w-20 h-20 mx-auto rounded-3xl ${percent >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'} flex items-center justify-center text-4xl mb-4">
                    ${percent >= 80 ? '🌟' : '📚'}
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">Деңгей аяқталды!</h3>
                <p class="text-slate-400 text-sm mb-6">
                    Сіз 5 сұрақтың <strong>${correctCount}</strong> сұрағына дұрыс жауап бердіңіз (${percent}%).
                </p>

                <div class="space-y-3">
                    <button onclick="QuizEngine.setLevel('${this.currentLevel}')" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm transition">
                        Қайта тапсыру 🔄
                    </button>
                    ${levelNext ? `
                        <button onclick="QuizEngine.setLevel('${levelNext}')" class="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-500/30 transition">
                            Келесі деңгейге өту →
                        </button>
                    ` : `
                        <div class="p-3 bg-purple-950/40 border border-purple-600/40 rounded-xl text-purple-300 text-xs font-semibold">
                            Құттықтаймыз! Барлық 3 деңгей толық орындалды!
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    playSound(isCorrect) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            if (isCorrect) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } else {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }
        } catch (e) {
            // Audio error silently ignored
        }
    }
};
