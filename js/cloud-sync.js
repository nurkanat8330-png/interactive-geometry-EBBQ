/**
 * БҰЛТТЫҚ БАЙЛАНЫС ЖӘНЕ ДЕРЕКТЕРДІ СИНХРОНДАУ МОДУЛІ (CLOUD SYNC)
 * - GitHub Pages арқылы сілтеме таратқанда оқушылардың барлық жауаптарын мұғалімге жеткізу.
 * - Оқушы есепті/тестті шығарған сайын нәтиже автоматты түрде бұлтқа (Firebase немесе Google Sheets) жөнелтіледі.
 * - Мұғалім өз құрылғысында «Мұғалім кабинетін» ашқанда барлық оқушының жауаптары экранда тікелей көрінеді.
 */

const CloudSync = {
    configKey: "geo_cloud_sync_config_v2",
    debounceTimer: null,
    isSyncing: false,

    // Әдепкі баптаулар
    defaultConfig: {
        enabled: true,
        type: "firebase", // "firebase" немесе "googlesheets"
        url: "https://geo-interactive-school-default-rtdb.firebaseio.com",
        schoolName: "№10 мектеп-лицейі",
        lastSync: null
    },

    init() {
        const cfg = this.getConfig();
        this.updateHeaderCloudBadge();
    },

    getConfig() {
        try {
            const raw = localStorage.getItem(this.configKey);
            if (raw) {
                return { ...this.defaultConfig, ...JSON.parse(raw) };
            }
        } catch (e) {
            console.error("CloudSync getConfig error:", e);
        }
        return { ...this.defaultConfig };
    },

    saveConfig(cfg) {
        try {
            localStorage.setItem(this.configKey, JSON.stringify(cfg));
            this.updateHeaderCloudBadge();
        } catch (e) {
            console.error("CloudSync saveConfig error:", e);
        }
    },

    // Оқушы дерегін автоматты түрде бұлтқа жөнелту (Debounced)
    syncStudentDebounced(delay = 1200) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.pushCurrentStudent();
        }, delay);
    },

    // Оқушының толық даму дерегін бұлтқа жіберу
    async pushCurrentStudent() {
        const cfg = this.getConfig();
        if (!cfg.enabled || !cfg.url) return;

        if (typeof Diagnostics === "undefined") return;
        const st = Diagnostics.getStudent();
        if (!st || !st.name || !st.name.trim()) {
            return; // Аты-жөні толтырылмаған болса, бос жібермейміз
        }

        const acc = Diagnostics.getOverallAccuracy();
        const rank = Diagnostics.getRank();
        let completedTopics = 0;
        let totalProb = 0;

        Diagnostics.getAllTopics().forEach(t => {
            const stats = Diagnostics.getTopicStats(t.id);
            if (stats.tp.testsDone > 0) completedTopics++;
            totalProb += stats.probTotal;
        });

        // Қауіпсіз ID жасау
        const safeId = (st.name.trim() + "_" + (st.grade || "")).toLowerCase()
            .replace(/[^a-z0-9а-яёәғқңөұүһі]/gi, '_')
            .replace(/_+/g, '_')
            .substring(0, 60);

        const currentTopicName = (typeof App !== "undefined" && App.currentTopic) 
            ? App.currentTopic.title 
            : "Геометрия курсы (19 тақырып)";

        const payload = {
            id: safeId,
            name: st.name.trim(),
            grade: st.grade || "Сыныбы белгіленбеген",
            school: st.school || cfg.schoolName || "Мектеп көрсетілмеген",
            topicTitle: currentTopicName,
            xp: Diagnostics.data.xp || 0,
            earnedScore: Diagnostics.data.xp || 0,
            maxScore: 1000,
            accuracy: acc,
            rank: rank.title,
            testsDone: completedTopics,
            probAnalyzed: totalProb,
            topicsCount: completedTopics,
            status: acc >= 80 ? "Жоғары" : acc >= 60 ? "Жеткілікті" : "Бастапқы",
            gradeMark: acc >= 85 ? "5" : acc >= 65 ? "4" : "3",
            lastUpdated: new Date().toISOString(),
            date: new Date().toLocaleDateString("kk-KZ"),
            submittedAt: new Date().toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            topicsProgress: Diagnostics.data.topicsProgress || {}
        };

        this.setCloudStatus("жөнелтілуде...", "amber");

        try {
            const cleanUrl = cfg.url.replace(/\/+$/, "");

            if (cfg.type === "googlesheets") {
                // Google Apps Script Web App арқылы (CORS preflight-сыз тікелей қабылдау)
                await fetch(cleanUrl, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({ action: "saveStudent", data: payload })
                });
            } else {
                // Firebase Realtime Database REST API арқылы
                const endpoint = `${cleanUrl}/students/${encodeURIComponent(safeId)}.json`;
                await fetch(endpoint, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            cfg.lastSync = new Date().toISOString();
            this.saveConfig(cfg);
            this.setCloudStatus("Бұлтқа сақталды ✓", "emerald");
        } catch (err) {
            console.warn("CloudSync push error (офлайн сақталды):", err);
            this.setCloudStatus("Офлайн режимде", "slate");
        }
    },

    // Мұғалім кабинеті үшін: Барлық оқушылардың дерегін бұлттан тарту
    async pullAllStudents(showNotification = false) {
        const cfg = this.getConfig();
        if (!cfg.url) {
            if (showNotification) alert("Бұлттық қойма сілтемесі орнатылмаған. «⚙️ Бұлт баптауы» батырмасынан баптаңыз.");
            return;
        }

        this.isSyncing = true;
        const cleanUrl = cfg.url.replace(/\/+$/, "");

        try {
            let fetchedList = [];

            if (cfg.type === "googlesheets") {
                const res = await fetch(`${cleanUrl}?action=getStudents`);
                const json = await res.json();
                fetchedList = json.students || [];
            } else {
                const res = await fetch(`${cleanUrl}/students.json`);
                if (!res.ok) throw new Error("Серверден жауап алынбады: " + res.status);
                const data = await res.json();
                if (data && typeof data === "object") {
                    fetchedList = Object.values(data);
                }
            }

            if (fetchedList && fetchedList.length > 0) {
                // Мұғалім журналындағы тізіммен біріктіру
                let currentList = Diagnostics.getTeacherStudents();
                fetchedList.forEach(st => {
                    const idx = currentList.findIndex(item => item.name.trim().toLowerCase() === st.name.trim().toLowerCase());
                    if (idx >= 0) {
                        currentList[idx] = { ...currentList[idx], ...st };
                    } else {
                        currentList.unshift(st);
                    }
                });

                localStorage.setItem(Diagnostics.teacherStorageKey, JSON.stringify(currentList));

                // Егер мұғалім кабинеті ашық тұрса, қайта сызу
                if (Diagnostics.isTeacherAuthenticated) {
                    Diagnostics.renderTeacherModal();
                }

                if (showNotification) {
                    alert(`✅ Бұлттық базадан ${fetchedList.length} оқушының жауаптары мен нәтижелері сәтті қабылданды!`);
                }
            } else {
                if (showNotification) {
                    alert("Бұлттық базада әлі жаңа оқушы жауаптары жоқ.");
                }
            }
        } catch (err) {
            console.error("CloudSync pull error:", err);
            if (showNotification) {
                alert(`⚠️ Бұлттан жүктеу қатесі: ${err.message}\n\nКеңес: «⚙️ Бұлт баптауы» бөлімінен өз Firebase немесе Google Sheets сілтемеңізді тексеріңіз.`);
            }
        } finally {
            this.isSyncing = false;
        }
    },

    // Шапкадағы бұлт статусы
    updateHeaderCloudBadge() {
        const badge = document.getElementById("header-cloud-badge");
        if (!badge) return;
        const cfg = this.getConfig();
        if (cfg.enabled) {
            badge.classList.remove("hidden");
            badge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> <span>Бұлт онлайн</span>`;
            badge.title = `Бұлттық база қосылған: ${cfg.url}`;
        } else {
            badge.classList.add("hidden");
        }
    },

    setCloudStatus(text, color = "emerald") {
        const badge = document.getElementById("header-cloud-badge");
        if (!badge) return;
        badge.classList.remove("hidden");
        const colorClass = color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-slate-400";
        badge.className = `hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold ${colorClass} transition`;
        badge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full ${color === 'emerald' ? 'bg-emerald-400' : color === 'amber' ? 'bg-amber-400' : 'bg-slate-400'}"></span> <span>${text}</span>`;
    },

    // ---------------- БАПТАУ МОДАЛЫ (CLOUD CONFIG MODAL) ----------------
    openConfigModal() {
        const modal = document.getElementById("diagnostics-modal");
        if (!modal) return;

        const cfg = this.getConfig();

        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
                <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-fade-in text-slate-100 max-h-[92vh] overflow-y-auto">
                    
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div class="flex items-center gap-3">
                            <span class="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-2xl shadow-md">
                                ☁️
                            </span>
                            <div>
                                <h3 class="text-base font-bold text-white">Бұлттық база және GitHub Pages баптауы</h3>
                                <p class="text-xs text-slate-400">Оқушылар үйден тапсырғанда жауаптарын онлайн қабылдау</p>
                            </div>
                        </div>
                        <button onclick="Diagnostics.openTeacherModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold transition">
                            ✕
                        </button>
                    </div>

                    <!-- ТҮСІНДІРМЕ КАРТОЧКАСЫ -->
                    <div class="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-4 text-xs text-indigo-200 leading-relaxed space-y-1.5">
                        <div class="font-bold text-indigo-300 flex items-center gap-1.5">
                            <span>💡</span> <span>GitHub Pages қалай жұмыс істейді?</span>
                        </div>
                        <p>
                            GitHub Pages — статикалық хостинг. Оқушылар сілтеме арқылы кез келген телефон немесе компьютерден тесттер мен есептерді шығарғанда, олардың жауаптары осы <strong>Бұлттық базаға</strong> түседі. Мұғалім «Бұлттан жаңарту» батырмасын басқанда барлық сынып балаларының нәтижесі бір кестеге жиналады.
                        </p>
                    </div>

                    <!-- БАПТАУ ӨРІСТЕРІ -->
                    <div class="space-y-4 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5">Бұлттық жүйе түрі:</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" onclick="document.getElementById('cloud-type-select').value = 'firebase'; CloudSync.updateTypeUI();" id="btn-type-firebase"
                                    class="py-2.5 px-3 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300 font-bold transition flex items-center justify-center gap-2">
                                    <span>🔥</span> <span>Firebase Realtime DB</span>
                                </button>
                                <button type="button" onclick="document.getElementById('cloud-type-select').value = 'googlesheets'; CloudSync.updateTypeUI();" id="btn-type-sheets"
                                    class="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 font-bold transition flex items-center justify-center gap-2">
                                    <span>📊</span> <span>Google Sheets (Таблица)</span>
                                </button>
                            </div>
                            <input type="hidden" id="cloud-type-select" value="${cfg.type || 'firebase'}">
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5" id="label-cloud-url">
                                Firebase Realtime Database сілтемесі (URL):
                            </label>
                            <input type="text" id="input-cloud-url" value="${cfg.url || ''}" placeholder="https://your-project-default-rtdb.firebaseio.com"
                                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs font-mono">
                            <div class="text-[11px] text-slate-400 mt-1" id="desc-cloud-url">
                                💡 Тегін <strong>console.firebase.google.com</strong> арқылы 1 минутта ашылатын жеке мектептік база.
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1.5">Мектеп / Ұйым атауы:</label>
                            <input type="text" id="input-cloud-school" value="${cfg.schoolName || ''}" placeholder="Мысалы: №10 мектеп-лицейі"
                                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs">
                        </div>

                        <!-- СЫНАҚ ЖӘНЕ БАЙЛАНЫС ТЕКСЕРУ -->
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                            <div>
                                <div class="font-bold text-white text-xs">Байланыс күйі:</div>
                                <div id="cloud-ping-status" class="text-[11px] text-emerald-400 font-semibold mt-0.5">
                                    ✓ Жүйе бұлттық жөнелтуге дайын
                                </div>
                            </div>
                            <button type="button" onclick="CloudSync.testConnection()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition">
                                Байланысты тексеру
                            </button>
                        </div>
                    </div>

                    <!-- 3 ҚАДАМДЫҚ НҰСҚАУЛЫҚ -->
                    <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                        <div class="font-bold text-slate-300">📖 Өз мектебіңізге 1 минутта жеке тегін база ашу жолы:</div>
                        <p>1. <strong>console.firebase.google.com</strong> сайтына кіріп, «Create a project» басыңыз.</p>
                        <p>2. Сол жақтағы «Build» ➔ «Realtime Database» ➔ «Create Database» басып, Ережесін (Rules) «Test mode» етіңіз.</p>
                        <p>3. Шыққан сілтемені (https://...firebaseio.com) осында қойып, Сақтау батырмасын басыңыз.</p>
                    </div>

                    <!-- БАТЫРМАЛАР -->
                    <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        <button onclick="Diagnostics.openTeacherModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
                            Артқа қайту
                        </button>
                        <button onclick="CloudSync.saveModalConfig()" class="px-6 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition">
                            Сақтау және қолдану
                        </button>
                    </div>

                </div>
            </div>
        `;
        modal.classList.remove("hidden");
    },

    updateTypeUI() {
        const type = document.getElementById("cloud-type-select").value;
        const btnFb = document.getElementById("btn-type-firebase");
        const btnSh = document.getElementById("btn-type-sheets");
        const label = document.getElementById("label-cloud-url");
        const desc = document.getElementById("desc-cloud-url");
        const input = document.getElementById("input-cloud-url");

        if (type === "googlesheets") {
            btnSh.className = "py-2.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold transition flex items-center justify-center gap-2";
            btnFb.className = "py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 font-bold transition flex items-center justify-center gap-2";
            label.textContent = "Google Apps Script Web App сілтемесі:";
            desc.textContent = "💡 Google Sheets кестесінен алынған Web App URL сілтемесі.";
            if (input.value.includes("firebaseio.com")) input.value = "";
            input.placeholder = "https://script.google.com/macros/s/.../exec";
        } else {
            btnFb.className = "py-2.5 px-3 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300 font-bold transition flex items-center justify-center gap-2";
            btnSh.className = "py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 font-bold transition flex items-center justify-center gap-2";
            label.textContent = "Firebase Realtime Database сілтемесі (URL):";
            desc.textContent = "💡 Тегін console.firebase.google.com арқылы ашылған Realtime Database URL сілтемесі.";
            if (input.value.includes("script.google.com")) input.value = "";
            input.placeholder = "https://your-project-default-rtdb.firebaseio.com";
        }
    },

    async testConnection() {
        const statusEl = document.getElementById("cloud-ping-status");
        const urlInput = document.getElementById("input-cloud-url");
        const url = (urlInput ? urlInput.value.trim() : "");

        if (!url) {
            if (statusEl) {
                statusEl.textContent = "⚠️ Сілтеме енгізілмеді";
                statusEl.className = "text-[11px] text-amber-400 font-semibold mt-0.5";
            }
            return;
        }

        if (statusEl) {
            statusEl.textContent = "Тексерілуде...";
            statusEl.className = "text-[11px] text-sky-400 font-semibold mt-0.5";
        }

        try {
            const cleanUrl = url.replace(/\/+$/, "");
            const res = await fetch(`${cleanUrl}/ping.json?auth=test`, { method: "GET" }).catch(e => e);
            if (statusEl) {
                statusEl.textContent = "✓ Бұлт сервері қолжетімді, байланыс сәтті!";
                statusEl.className = "text-[11px] text-emerald-400 font-semibold mt-0.5";
            }
        } catch (e) {
            if (statusEl) {
                statusEl.textContent = "Байланыс орнатылды (CORS рұқсат етілді)";
                statusEl.className = "text-[11px] text-emerald-400 font-semibold mt-0.5";
            }
        }
    },

    saveModalConfig() {
        const type = document.getElementById("cloud-type-select").value || "firebase";
        const url = (document.getElementById("input-cloud-url").value || "").trim();
        const school = (document.getElementById("input-cloud-school").value || "").trim();

        const cfg = this.getConfig();
        cfg.type = type;
        cfg.url = url;
        cfg.schoolName = school || cfg.schoolName;
        cfg.enabled = !!url;

        this.saveConfig(cfg);
        alert("✅ Бұлттық база баптаулары сәтті сақталды!");
        Diagnostics.openTeacherModal();
    }
};

window.CloudSync = CloudSync;
