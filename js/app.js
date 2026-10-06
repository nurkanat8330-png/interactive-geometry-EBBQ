/**
 * НЕГІЗГІ ҚОСЫМША БАҚЫЛАУШЫСЫ (APP CONTROLLER)
 * Басты бет -> Мазмұны -> Сынып таңдау -> Тақырып мазмұны -> Тақырып беті
 * Барлық кері батырмалар («Сыныптарға қайту», «Мазмұнға қайту») қатаң логикамен орнатылған.
 */

const App = {
    currentGrade: null,
    currentTopic: null,

    gradesData: {
        7: typeof GRADE_7_DATA !== "undefined" ? GRADE_7_DATA : null,
        8: typeof GRADE_8_DATA !== "undefined" ? GRADE_8_DATA : null,
        9: typeof GRADE_9_DATA !== "undefined" ? GRADE_9_DATA : null,
        10: typeof GRADE_10_DATA !== "undefined" ? GRADE_10_DATA : null
    },

    init() {
        try {
            if (typeof Accessibility !== "undefined") {
                Accessibility.init();
            }
        } catch (e) {
            console.warn("Accessibility init error:", e);
        }
        try {
            Diagnostics.init();
        } catch (e) {
            console.warn("Diagnostics init error:", e);
        }
        try {
            GeoAITutor.init();
        } catch (e) {
            console.warn("GeoAITutor init error:", e);
        }
        try {
            Diagnostics.updateHeaderBadges();
        } catch (e) {
            console.warn("Diagnostics header error:", e);
        }
        this.showHome();
    },

    // 1. ЕҢ АЛҒАШ БЕТІ: "7-10 сыныптар", астында «Мазмұны» батырмасы
    showHome() {
        this.hideAllViews();
        const view = document.getElementById("view-home");
        if (view) view.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // 2. МАЗМҰНЫН БАСҚАНДА: 7, 8, 9, 10 сынып деген бөлек 4 батырма
    showGrades() {
        this.hideAllViews();
        const view = document.getElementById("view-grades");
        if (view) view.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // 3. ӘР СЫНЫПТЫ БАСҚАНДА: сол сыныпқа сай тақырыптар тұрады, «Сыныптарға қайту» батырмасы бар
    openGrade(gradeNum) {
        this.currentGrade = gradeNum;
        if (!this.gradesData[gradeNum]) {
            if (gradeNum === 7 && typeof GRADE_7_DATA !== "undefined") this.gradesData[7] = GRADE_7_DATA;
            if (gradeNum === 8 && typeof GRADE_8_DATA !== "undefined") this.gradesData[8] = GRADE_8_DATA;
            if (gradeNum === 9 && typeof GRADE_9_DATA !== "undefined") this.gradesData[9] = GRADE_9_DATA;
            if (gradeNum === 10 && typeof GRADE_10_DATA !== "undefined") this.gradesData[10] = GRADE_10_DATA;
        }

        const gData = this.gradesData[gradeNum];
        if (!gData) {
            alert(gradeNum + "-сынып деректері жүктелуде...");
            return;
        }

        this.hideAllViews();
        const view = document.getElementById("view-grade-topics");
        if (!view) return;
        view.classList.remove("hidden");

        // Тақырыпшаны толтыру
        document.getElementById("grade-topics-title").textContent = `${gradeNum}-сынып геометриясы`;
        document.getElementById("grade-topics-desc").textContent = gData.description;

        // Тақырыптар тізімі карточкаларын жасау
        const listEl = document.getElementById("grade-topics-list");
        listEl.innerHTML = gData.topics.map(topic => {
            const tp = (Diagnostics.data && Diagnostics.data.topicsProgress && Diagnostics.data.topicsProgress[topic.id]) 
                ? Diagnostics.data.topicsProgress[topic.id] 
                : { testsCorrect: 0, mastered: false };
            return `
                <div onclick="App.openTopic('${topic.id}')" 
                    class="group bg-slate-900/90 hover:bg-slate-850 p-6 rounded-3xl border border-slate-800 hover:border-sky-500/60 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between transform hover:-translate-y-1">
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <span class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm">
                                ${topic.number}
                            </span>
                            ${tp.mastered ? `
                                <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                                    ✓ Меңгерілді
                                </span>
                            ` : `
                                <span class="text-xs text-slate-400 font-medium">
                                    15 тест • 9 есеп
                                </span>
                            `}
                        </div>
                        <h4 class="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                            ${topic.title}
                        </h4>
                        <p class="text-xs text-slate-400 leading-relaxed mb-4">
                            ${topic.shortDesc}
                        </p>
                    </div>

                    <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400">
                        <span>Оқуды бастау</span>
                        <span class="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
            `;
        }).join("");

        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // 4. ӘР ТАҚЫРЫПТЫ БАСҚАНДА: Түсіндірме, анықтама, қасиет, АНИМАЦИЯЛЫҚ СУРЕТ, 3 деңгейлі тест, 3 деңгейлі есептер
    openTopic(topicId) {
        // Деректерді динамикалық жаңарту
        if (typeof GRADE_7_DATA !== "undefined") this.gradesData[7] = GRADE_7_DATA;
        if (typeof GRADE_8_DATA !== "undefined") this.gradesData[8] = GRADE_8_DATA;
        if (typeof GRADE_9_DATA !== "undefined") this.gradesData[9] = GRADE_9_DATA;
        if (typeof GRADE_10_DATA !== "undefined") this.gradesData[10] = GRADE_10_DATA;

        let topic = null;
        let gradeNum = null;

        for (const g of [7, 8, 9, 10]) {
            const found = this.gradesData[g]?.topics.find(t => t.id === topicId);
            if (found) {
                topic = found;
                gradeNum = g;
                break;
            }
        }

        if (!topic) {
            console.warn("Тақырып табылмады:", topicId);
            return;
        }

        this.currentTopic = topic;
        this.currentGrade = gradeNum;

        this.hideAllViews();
        const view = document.getElementById("view-topic-detail");
        if (!view) return;
        view.classList.remove("hidden");

        // Жоғарғы мәліметтер
        document.getElementById("topic-breadcrumb-grade").textContent = `${gradeNum}-сынып`;
        document.getElementById("topic-title").textContent = topic.title;
        document.getElementById("topic-desc").textContent = topic.shortDesc;

        // 1. Түсіндірме
        document.getElementById("topic-theory-content").innerHTML = topic.theory || "";

        // 2. Анықтамалары
        const defsContainer = document.getElementById("topic-definitions-container");
        if (topic.definitions && topic.definitions.length > 0) {
            defsContainer.innerHTML = topic.definitions.map(d => `
                <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/90">
                    <div class="text-xs uppercase font-bold text-sky-400 tracking-wider mb-1 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        ${d.term}
                    </div>
                    <div class="text-sm text-slate-300 leading-relaxed font-normal">
                        ${d.content}
                    </div>
                </div>
            `).join("");
            document.getElementById("topic-definitions-section").classList.remove("hidden");
        } else {
            document.getElementById("topic-definitions-section").classList.add("hidden");
        }

        // 3. Қасиеттері мен теоремалары
        const propsContainer = document.getElementById("topic-properties-container");
        if (topic.properties && topic.properties.length > 0) {
            propsContainer.innerHTML = topic.properties.map(p => `
                <div class="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <span class="text-sky-400 font-bold mt-0.5">❖</span>
                    <div>${p}</div>
                </div>
            `).join("");
            document.getElementById("topic-properties-section").classList.remove("hidden");
        } else {
            document.getElementById("topic-properties-section").classList.add("hidden");
        }

        // 4. МІНДЕТТІ АНИМАЦИЯЛЫҚ СУРЕТТІ ІСКЕ ҚОСУ
        try {
            if (typeof GeoAnimations !== "undefined" && GeoAnimations.init) {
                GeoAnimations.init("topic-animation-container", topic.animationType);
            }
        } catch (e) {
            console.error("Анимация іске қосу қатесі:", e);
        }

        // 5. 3 ДЕҢГЕЙЛІ ТЕСТ ЖҰМЫСЫН ІСКЕ ҚОСУ
        try {
            if (typeof QuizEngine !== "undefined" && QuizEngine.init) {
                QuizEngine.init(topic);
            }
        } catch (e) {
            console.error("Тест жүйесі қатесі:", e);
        }

        // 6. 3 ДЕҢГЕЙЛІ ЕСЕПТЕР ЖӘНЕ ТАЛДАУДЫ ІСКЕ ҚОСУ
        try {
            if (typeof ProblemEngine !== "undefined" && ProblemEngine.init) {
                ProblemEngine.init(topic);
            }
        } catch (e) {
            console.error("Есептер жүйесі қатесі:", e);
        }

        // KaTeX математикасын форматтау
        try {
            if (window.renderMathInElement) {
                renderMathInElement(view, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false }
                    ]
                });
            }
        } catch (e) {
            console.warn("KaTeX пішімдеу қатесі:", e);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // 5. ҚАРІП ӨЛШЕМІН БАСҚАРУ (КӨЗІ НАШАР КӨРЕТІНДЕРГЕ АРНАЛҒАН РЕЖИМ)
    fontMode: "normal", // 'normal' | 'large' | 'xlarge'

    initFontMode() {
        const saved = localStorage.getItem("geo_font_mode") || "normal";
        this.applyFontMode(saved);
    },

    cycleFontMode() {
        if (typeof Accessibility !== "undefined") {
            Accessibility.cycleFontSize();
            return;
        }
        let next = "normal";
        if (this.fontMode === "normal") {
            next = "large";
        } else if (this.fontMode === "large") {
            next = "xlarge";
        } else {
            next = "normal";
        }
        this.applyFontMode(next);
    },

    applyFontMode(mode) {
        this.fontMode = mode;
        try {
            localStorage.setItem("geo_font_mode", mode);
        } catch (e) {
            console.warn("localStorage қолжетімсіз:", e);
        }

        const htmlEl = document.documentElement;
        htmlEl.classList.remove("accessibility-large", "accessibility-xlarge");

        const textEl = document.getElementById("header-font-text");
        const btnEl = document.getElementById("header-font-btn");

        if (mode === "large") {
            htmlEl.classList.add("accessibility-large");
            if (textEl) textEl.textContent = "Қаріп: A+ (Үлкен)";
            if (btnEl) {
                btnEl.classList.add("border-amber-400", "text-amber-300", "bg-amber-950/40");
                btnEl.classList.remove("border-sky-500/40", "text-sky-300", "bg-slate-800", "border-emerald-400", "text-emerald-300", "bg-emerald-950/40");
                btnEl.title = "Қаріпті үлкейту (Қазір: Үлкен A+)";
            }
        } else if (mode === "xlarge") {
            htmlEl.classList.add("accessibility-xlarge");
            if (textEl) textEl.textContent = "Қаріп: A++ (Макс)";
            if (btnEl) {
                btnEl.classList.add("border-emerald-400", "text-emerald-300", "bg-emerald-950/40");
                btnEl.classList.remove("border-sky-500/40", "text-sky-300", "bg-slate-800", "border-amber-400", "text-amber-300", "bg-amber-950/40");
                btnEl.title = "Қаріпті қалыпқа келтіру (Қазір: Ең үлкен A++)";
            }
        } else {
            if (textEl) textEl.textContent = "Қаріп: A";
            if (btnEl) {
                btnEl.classList.remove("border-amber-400", "text-amber-300", "bg-amber-950/40", "border-emerald-400", "text-emerald-300", "bg-emerald-950/40");
                btnEl.classList.add("border-sky-500/40", "text-sky-300", "bg-slate-800");
                btnEl.title = "Көзі нашар көретіндерге арналған режим (Қаріпті үлкейту)";
            }
        }
    },

    // Әр тақырып соңындағы және жоғарысындағы «Мазмұнға қайту» батырмасы
    backToGradeTopics() {
        if (this.currentGrade) {
            this.openGrade(this.currentGrade);
        } else {
            this.showGrades();
        }
    },

    // Әр сынып мазмұнындағы «Сыныптарға қайту» батырмасы
    backToGrades() {
        this.showGrades();
    },

    hideAllViews() {
        const views = [
            "view-home",
            "view-grades",
            "view-grade-topics",
            "view-topic-detail"
        ];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });
    }
};

// Терезе жүктелгенде автоматты іске қосу
window.addEventListener("DOMContentLoaded", () => {
    App.init();
});
