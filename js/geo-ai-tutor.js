/**
 * GeoAI ТЬЮТОР — Google Gemini API-мен тікелей байланысқан ЖИ-көмекші
 * - Google Gemini (2.0 Flash / 1.5 Flash / 1.5 Pro) үлгілеріне сұраныс жолдайды
 * - Сұрақ қойғанда лезде толық, нақты және академиялық дәл жауап қайтарады
 * - KaTeX арқылы барлық математикалық формулаларды әдемі көрсетеді
 * - API кілтін жедел тексеру (Test Connection) мүмкіндігі бар
 * - API кілті болмаған немесе желі үзілген жағдайда автономды бай геометриялық білім базасы мен есептеуіш іске қосылады
 */

const GeoAITutor = {
    apiKey: (localStorage.getItem("geo_gemini_api_key") || localStorage.getItem("gemini_api_key") || "").trim(),
    isOpen: false,
    history: [
        {
            role: "assistant",
            text: "Сәлеметсіз бе! Мен — Google Gemini негізіндегі <strong>GeoAI Ұстазыңызбын</strong> 📐✨.<br>Геометрия бойынша кез келген сұрағыңызды, есеп шартын немесе теореманы жазыңыз — мен лезде қадамдық, нақты жауабын беремін!"
        }
    ],

    init() {
        this.renderWidget();
    },

    getCleanApiKey() {
        let key = (this.apiKey || "").trim();
        key = key.replace(/^["']|["']$/g, "").trim();
        return key;
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById("geo-ai-panel");
        if (panel) {
            panel.classList.toggle("hidden", !this.isOpen);
            if (this.isOpen) {
                this.renderMessages();
                setTimeout(() => {
                    const input = document.getElementById("geo-ai-input");
                    if (input) input.focus();
                }, 100);
            }
        }
    },

    renderWidget() {
        let container = document.getElementById("geo-ai-root");
        if (!container) {
            container = document.createElement("div");
            container.id = "geo-ai-root";
            document.body.appendChild(container);
        }

        const isConnected = !!this.getCleanApiKey();

        container.innerHTML = `
            <!-- Қалқымалы батырма -->
            <button onclick="GeoAITutor.toggle()" 
                class="fixed bottom-6 right-6 z-40 px-4 py-3.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center gap-2.5 font-bold text-sm transition-all transform hover:scale-105 active:scale-95 group">
                <span class="text-xl group-hover:rotate-12 transition-transform">✨</span>
                <span class="hidden sm:inline">GeoAI Көмекші</span>
                ${isConnected ? '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>' : ''}
            </button>

            <!-- Чат терезесі -->
            <div id="geo-ai-panel" class="hidden fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[450px] max-h-[640px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
                <!-- Тақырыпшасы -->
                <div class="p-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                            ✨
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                                GeoAI Ұстаз
                                <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">Gemini AI</span>
                            </h4>
                            <p class="text-[11px] text-slate-400">Интеллектуалды геометрия кеңесшісі</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="GeoAITutor.openApiKeyModal()" title="Gemini API баптау" class="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 text-xs flex items-center gap-1 bg-slate-800/60 border border-slate-700 transition">
                            <span>🔑</span>
                            <span class="hidden sm:inline text-[11px] font-semibold">${isConnected ? 'Қосулы' : 'API кілт'}</span>
                        </button>
                        <button onclick="GeoAITutor.toggle()" class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 text-xs transition">
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Gemini байланыс күйі панелі -->
                <div class="px-4 py-2 border-b text-[11px] flex items-center justify-between ${isConnected ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300' : 'bg-amber-950/40 border-amber-800/40 text-amber-300'}">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
                        <span class="truncate">${isConnected ? 'Google Gemini онлайн режимі белсенді 🚀' : 'Офлайн режим (Gemini кілті енгізілмеген)'}</span>
                    </div>
                    <button onclick="GeoAITutor.openApiKeyModal()" class="font-bold underline hover:opacity-80 shrink-0 ml-2">
                        ${isConnected ? 'Баптау' : 'Кілтті қосу'}
                    </button>
                </div>

                <!-- Жылдам сұрақтар -->
                <div class="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
                    <button onclick="GeoAITutor.quickAsk('Осы тақырыптың формулаларын толық мысалмен түсіндір')" class="flex-shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                        💡 Формулаларды көрсет
                    </button>
                    <button onclick="GeoAITutor.quickAsk('Маған есеп шығаруға қадамдық тұспал (подсказка) бер')" class="flex-shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                        🎯 Есепке тұспал
                    </button>
                    <button onclick="GeoAITutor.quickAsk('Бұл фигураның өмірдегі, ғылымдағы қолданысын айтып бер')" class="flex-shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                        🌍 Өмірдегі қолданысы
                    </button>
                </div>

                <!-- Хабарламалар аймағы -->
                <div id="geo-ai-messages" class="flex-1 p-4 overflow-y-auto space-y-3 min-h-[280px] max-h-[380px] text-xs">
                </div>

                <!-- Енгізу жолы -->
                <div class="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <input type="text" id="geo-ai-input" placeholder="Геометрия бойынша сұрағыңызды немесе есепті жазыңыз..." 
                        onkeydown="if(event.key === 'Enter') GeoAITutor.send()"
                        class="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500">
                    <button onclick="GeoAITutor.send()" class="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md transition flex-shrink-0">
                        ➤
                    </button>
                </div>
            </div>

            <!-- API кілт енгізу модалды терезесі -->
            <div id="geo-gemini-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">🔑</span>
                            <div>
                                <h3 class="text-base font-bold text-white">Google Gemini API қосу</h3>
                                <p class="text-xs text-slate-400">Нақты, терең әрі жан-жақты жауаптар үшін</p>
                            </div>
                        </div>
                        <button onclick="GeoAITutor.closeApiKeyModal()" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold transition">
                            ✕
                        </button>
                    </div>

                    <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
                        <p>
                            Google Gemini API кілті арқылы GeoAI көмекшісі <strong>күрделі геометриялық есептерді қадамдап талдап</strong>, кез келген сұраққа кідіріссіз тікелей жауап береді.
                        </p>
                        <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                            <div class="font-bold text-sky-400">Тегін кілтті қалай алуға болады?</div>
                            <ol class="list-decimal pl-4 space-y-1 text-slate-400">
                                <li><a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-sky-400 underline font-semibold">aistudio.google.com/app/apikey</a> сілтемесіне өтіңіз.</li>
                                <li>Google аккаунтыңызбен кіріп, <em>«Create API Key»</em> батырмасын басыңыз.</li>
                                <li>Шыққан кілтті көшіріп, төмендегі өріске қойыңыз.</li>
                            </ol>
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-200 mb-1">Gemini API Key (AIzaSy...):</label>
                            <input type="password" id="gemini-key-input" value="${this.getCleanApiKey()}" placeholder="AIzaSy..." 
                                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono">
                        </div>

                        <!-- Тексеру нәтижесі блогы -->
                        <div id="gemini-test-result" class="hidden"></div>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                        <button id="test-gemini-btn" onclick="GeoAITutor.testConnection()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                            <span>🔍</span>
                            <span>Тексеру (Test)</span>
                        </button>
                        
                        <div class="flex items-center gap-2">
                            ${this.getCleanApiKey() ? `
                                <button onclick="GeoAITutor.removeApiKey()" class="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 rounded-xl text-xs font-semibold transition">
                                    Өшіру
                                </button>
                            ` : ''}
                            <button onclick="GeoAITutor.closeApiKeyModal()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
                                Жабу
                            </button>
                            <button onclick="GeoAITutor.saveApiKey()" class="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/30 transition">
                                Сақтау
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    openApiKeyModal() {
        const modal = document.getElementById("geo-gemini-modal");
        if (modal) {
            modal.classList.remove("hidden");
            const input = document.getElementById("gemini-key-input");
            if (input) {
                input.value = this.getCleanApiKey();
                input.focus();
            }
            const testRes = document.getElementById("gemini-test-result");
            if (testRes) testRes.classList.add("hidden");
        }
    },

    closeApiKeyModal() {
        const modal = document.getElementById("geo-gemini-modal");
        if (modal) modal.classList.add("hidden");
    },

    async testConnection() {
        const input = document.getElementById("gemini-key-input");
        const resBox = document.getElementById("gemini-test-result");
        if (!input || !resBox) return;

        let key = input.value.trim().replace(/^["']|["']$/g, "").trim();
        if (!key) {
            resBox.className = "p-3 rounded-xl text-xs bg-amber-950/70 border border-amber-500/50 text-amber-200";
            resBox.innerHTML = "⚠️ Алдымен Gemini API кілтін жазыңыз.";
            resBox.classList.remove("hidden");
            return;
        }

        const testBtn = document.getElementById("test-gemini-btn");
        if (testBtn) {
            testBtn.disabled = true;
            testBtn.innerHTML = `<span>⏳</span> Тексерілуде...`;
        }

        resBox.className = "p-3 rounded-xl text-xs bg-slate-800 border border-slate-700 text-slate-300";
        resBox.innerHTML = "🔍 Google Gemini серверімен байланыс тексерілуде...";
        resBox.classList.remove("hidden");

        this.apiKey = key;
        window._availableGeminiModels = null;
        window._workingGeminiModel = null;

        const candidateModels = [
            { version: "v1beta", name: "gemini-2.0-flash" },
            { version: "v1beta", name: "gemini-1.5-flash" },
            { version: "v1", name: "gemini-1.5-flash" },
            { version: "v1beta", name: "gemini-2.0-flash-lite" },
            { version: "v1beta", name: "gemini-1.5-flash-8b" }
        ];

        let successModel = null;
        let lastError = "";

        for (const model of candidateModels) {
            try {
                resBox.innerHTML = `🔍 <code>${model.name} (${model.version})</code> моделі тексерілуде...`;
                const testUrl = `https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${encodeURIComponent(key)}`;
                const testRes = await fetch(testUrl, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: "Сәлем" }] }]
                    })
                });

                if (testRes.ok) {
                    const data = await testRes.json();
                    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        successModel = model;
                        break;
                    }
                } else {
                    const errData = await testRes.json().catch(() => ({}));
                    const msg = errData.error?.message || `HTTP ${testRes.status}`;
                    lastError = msg;
                    console.warn(`[${model.name}] test failed:`, msg);
                    // Егер кілт мүлдем қате болса (API_KEY_INVALID), циклды бірден тоқтату
                    if (msg.includes("API key not valid") || msg.includes("INVALID") || testRes.status === 400 && msg.includes("API key")) {
                        break;
                    }
                }
            } catch (netErr) {
                lastError = netErr.message;
                console.warn(`[${model.name}] network test error:`, netErr);
            }
        }

        if (successModel) {
            window._workingGeminiModel = successModel;
            resBox.className = "p-3 rounded-xl text-xs bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 leading-relaxed";
            resBox.innerHTML = `✅ <strong>Кілт толық жарамды және байланыс сәтті орнатылды!</strong><br>• Белсенді модель: <code class="px-1.5 py-0.5 bg-emerald-900/80 text-emerald-300 rounded font-mono">${successModel.name} (${successModel.version})</code><br>🚀 <em>«Сақтау» батырмасын басып, чатта сұрақ қоя беріңіз!</em>`;
        } else {
            let advice = "";
            const msg = lastError || "";
            if (msg.includes("API key not valid") || msg.includes("INVALID") || msg.includes("not valid")) {
                advice = "<br>💡 <strong>Кеңес:</strong> API кілт қате енгізілген. <a href='https://aistudio.google.com/app/apikey' target='_blank' class='underline text-sky-300 font-semibold'>Google AI Studio</a> сайтынан кілтті қайта көшіріп тексеріңіз.";
            } else if (msg.includes("location is not supported")) {
                advice = "<br>💡 <strong>Кеңес:</strong> Сіздің аймақта бұлтты Gemini шектеулі болуы мүмкін. Жүйе автоматты түрде офлайн ЖИ арқылы жауап бере береді.";
            } else if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
                advice = "<br>💡 <strong>Кеңес:</strong> Сұраныстар лимиті толған. Біраздан кейін қайталаңыз немесе офлайн режимде пайдаланыңыз.";
            }
            resBox.className = "p-3 rounded-xl text-xs bg-rose-950/80 border border-rose-600/70 text-rose-200 leading-relaxed";
            resBox.innerHTML = `❌ <strong>Қате:</strong> ${msg || "Gemini серверіне қосылу сәтсіз болды."}.${advice}<br><span class="text-slate-400 mt-1 inline-block">Ескерту: Офлайн сараптамалық ЖИ-Ұстаз толық жұмыс істей береді.</span>`;
        }

        if (testBtn) {
            testBtn.disabled = false;
            testBtn.innerHTML = `<span>🔍</span> Тексеру (Test)`;
        }
    },

    saveApiKey() {
        const input = document.getElementById("gemini-key-input");
        if (!input) return;

        let key = input.value.trim().replace(/^["']|["']$/g, "").trim();
        if (!key) {
            alert("API кілтті енгізіңіз немесе бас тартыңыз.");
            return;
        }

        this.apiKey = key;
        localStorage.setItem("geo_gemini_api_key", key);
        localStorage.setItem("gemini_api_key", key);
        window._cachedGeminiModel = null;
        this.closeApiKeyModal();
        this.renderWidget();
        this.toggle();

        this.history.push({
            role: "assistant",
            text: "🎉 <strong>Google Gemini моделіне сәтті қосылдыңыз!</strong><br>Енді сұрақтарыңыз Google Gemini-дің озық интеллектуалды моделі арқылы тікелей әрі өте нақты өңделеді. Сұрағыңызды қоя беріңіз!"
        });
        this.renderMessages();
    },

    removeApiKey() {
        if (confirm("Google Gemini API кілтін өшіргіңіз келе ме? Жүйе офлайн режимге ауысады.")) {
            this.apiKey = "";
            localStorage.removeItem("geo_gemini_api_key");
            localStorage.removeItem("gemini_api_key");
            window._cachedGeminiModel = null;
            this.closeApiKeyModal();
            this.renderWidget();
            this.toggle();

            this.history.push({
                role: "assistant",
                text: "ℹ️ <strong>Google Gemini кілті өшірілді.</strong> Жүйе автономды офлайн математикалық шешуші режиміне көшті."
            });
            this.renderMessages();
        }
    },

    renderMessages() {
        const box = document.getElementById("geo-ai-messages");
        if (!box) return;

        box.innerHTML = this.history.map(msg => {
            const isUser = msg.role === "user";
            return `
                <div class="flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}">
                    ${!isUser ? '<div class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs flex-shrink-0">✨</div>' : ''}
                    <div class="max-w-[90%] p-3.5 rounded-2xl ${isUser ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tl-none'} leading-relaxed space-y-1.5">
                        ${msg.text}
                    </div>
                </div>
            `;
        }).join("");

        // KaTeX математикалық формулаларын визуализациялау
        if (window.renderMathInElement) {
            renderMathInElement(box, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }

        box.scrollTop = box.scrollHeight;
    },

    quickAsk(text) {
        const input = document.getElementById("geo-ai-input");
        if (input) input.value = text;
        this.send();
    },

    async send() {
        const input = document.getElementById("geo-ai-input");
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = "";

        this.history.push({ role: "user", text });
        this.renderMessages();

        // Жауап күту индикаторы
        const isOnline = !!this.getCleanApiKey();
        this.history.push({ 
            role: "assistant", 
            text: isOnline ? "<em>Google Gemini есептеп, нақты жауап дайындауда... 📐</em>" : "<em>GeoAI Ұстаз білім қорынан нақты жауап дайындауда... 📐</em>" 
        });
        this.renderMessages();

        const responseText = await this.generateResponse(text);
        this.history.pop(); // Индикаторды алып тастау
        this.history.push({ role: "assistant", text: responseText });
        this.renderMessages();
    },

    async generateResponse(query) {
        const curTopic = (typeof App !== "undefined" && App.currentTopic) ? App.currentTopic : null;
        const curGrade = (typeof App !== "undefined" && App.currentGrade) ? App.currentGrade : null;
        const cleanKey = this.getCleanApiKey();

        // 1. Егер Gemini API кілті болса — тікелей Google Gemini арқылы шешу
        if (cleanKey) {
            try {
                const answer = await this.callGeminiAPI(query, curTopic, curGrade);
                return answer;
            } catch (err) {
                console.warn("Gemini API error, falling back to offline geometry engine:", err);
                const offlineAnswer = this.solveQueryOffline(query, curTopic, curGrade);
                const errMsg = err.message || "";
                let hintText = "Бұлтты байланыста кідіріс болғандықтан, кіріктірілген сараптамалық жауап ұсынылды.";
                if (errMsg.includes("API key not valid") || errMsg.includes("INVALID") || errMsg.includes("not valid")) {
                    hintText = "Енгізілген Gemini API кілті жарамсыз болып тұр. Жоғарыдағы <strong>«🔑 Баптау»</strong> арқылы кілтті тексеріңіз.";
                } else if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
                    hintText = "Google Gemini тегін сұраныстар шегіне жетті (лимит). Біраздан соң қайталаңыз.";
                }

                return `
                    <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-[11px] mb-2.5 leading-relaxed flex items-start gap-2">
                        <span class="text-base">💡</span>
                        <div>
                            <strong>Кіріктірілген Офлайн ЖИ-Ұстаз:</strong> ${hintText} Төменде оқу бағдарламасына сай нақты академиялық жауап берілді:
                        </div>
                    </div>
                    ${offlineAnswer}
                `;
            }
        }

        // 2. API кілті жоқ болса — автономды геометриялық шешуші
        return this.solveQueryOffline(query, curTopic, curGrade);
    },

    async callGeminiAPI(query, curTopic, curGrade) {
        const key = this.getCleanApiKey();
        if (!key) throw new Error("API кілті табылмады.");

        const candidateModels = [
            { version: "v1beta", name: "gemini-2.0-flash" },
            { version: "v1beta", name: "gemini-1.5-flash" },
            { version: "v1", name: "gemini-1.5-flash" },
            { version: "v1beta", name: "gemini-2.0-flash-lite" },
            { version: "v1beta", name: "gemini-1.5-flash-8b" }
        ];

        // Егер бұрын жұмыс істеген үлгі белгілі болса, соны алға қою
        if (window._workingGeminiModel) {
            const idx = candidateModels.findIndex(c => c.name === window._workingGeminiModel.name && c.version === window._workingGeminiModel.version);
            if (idx > 0) {
                const [w] = candidateModels.splice(idx, 1);
                candidateModels.unshift(w);
            }
        }

        const systemContext = `Сіз — Қазақстан мектеп бағдарламасына (7-10 сыныптар) сай геометрия пәнінің білікті, мейірімді, жоғары дәлдіктегі ЖИ-ұстазысыз (GeoAI Ustaz).
Қазір оқушы ${curGrade ? curGrade + '-сынып, ' : ''}${curTopic ? '«' + curTopic.title + '» тақырыбын' : 'геометрия курсын'} оқып жатыр.

ТАЛАПТАР:
1. Тек қазақ тілінде, академиялық дәлдікпен, мектеп оқушысына түсінікті етіп жауап беріңіз.
2. Егер есеп немесе сұрақ болса: ең алдымен бірден нақты қорытынды жауабын айқын белгілеп (мысалы: "Жауабы: ...") шығарыңыз. Содан соң қадам-қадаммен есептеуін, формуласын, анықтамасын немесе теоремасын көрсетіңіз.
3. Математикалық формулалар мен шамаларды міндетті түрде KaTeX-ке сай LaTeX $...$ (жолдағы) немесе $$...$$ (бөлек жолдағы) форматында жазыңыз.
4. Сайыс немесе байқау туралы ешқашан ештеңе жазбаңыз, таза геометриялық педагогикалық білім беріңіз.`;

        const body = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${systemContext}\n\nОқушы сұрағы: ${query}` }]
                }
            ]
        };

        const failedErrors = [];

        for (const cand of candidateModels) {
            try {
                const url = `https://generativelanguage.googleapis.com/${cand.version}/models/${cand.name}:generateContent?key=${encodeURIComponent(key)}`;
                const res = await fetch(url, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    const data = await res.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        window._workingGeminiModel = cand;
                        return this.formatAiText(text, cand.name);
                    }
                } else {
                    const errData = await res.json().catch(() => ({}));
                    const msg = errData.error?.message || `Сервер қатесі (${res.status})`;
                    failedErrors.push(`${cand.name}: ${msg}`);
                    console.warn(`[${cand.name}] сәтсіз:`, msg);
                    // Егер кілт жарамсыз болса, бірден қатені лақтыру
                    if (msg.includes("API key not valid") || msg.includes("INVALID") || res.status === 400 && msg.includes("API key")) {
                        throw new Error(msg);
                    }
                }
            } catch (err) {
                if (err.message && (err.message.includes("API key not valid") || err.message.includes("INVALID"))) {
                    throw err;
                }
                failedErrors.push(`${cand.name}: ${err.message}`);
                console.warn(`[${cand.name}] желі қатесі:`, err.message);
            }
        }

        throw new Error(failedErrors[0] || "Gemini серверіне қосылу сәтсіз болды.");
    },

    formatAiText(text, modelName) {
        let clean = text;
        // LaTeX форматтарын KaTeX-ке бейімдеу
        clean = clean.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
        clean = clean.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

        // Markdown форматтау
        clean = clean
            .replace(/^### (.*$)/gim, '<h5 class="font-bold text-sky-400 mt-2 mb-1">$1</h5>')
            .replace(/^## (.*$)/gim, '<h4 class="font-bold text-white mt-2 mb-1">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        return `
            <div class="space-y-1">
                <div class="text-[10px] text-sky-400 font-bold flex items-center gap-1 mb-1">
                    <span>✨ Google Gemini (${modelName})</span>
                </div>
                <div>${clean}</div>
            </div>
        `;
    },

    // ---------------- ОФЛАЙН ИНТЕЛЛЕКТУАЛДЫ ШЕШУШІ ЖӘНЕ БІЛІМ БАЗАСЫ ----------------
    solveQueryOffline(query, curTopic, curGrade) {
        const raw = query.trim();
        const q = raw.toLowerCase().replace(/[?!.,;:]/g, " ").trim();

        // 1. ОҚУ БАҒДАРЛАМАСЫНДАҒЫ БАРЛЫҚ 19 ТАҚЫРЫП ТЕСТ СҰРАҚТАРЫМЕН САЛЫСТЫРУ
        const allGrades = [];
        if (typeof GRADE_7_DATA !== "undefined") allGrades.push(GRADE_7_DATA);
        if (typeof GRADE_8_DATA !== "undefined") allGrades.push(GRADE_8_DATA);
        if (typeof GRADE_9_DATA !== "undefined") allGrades.push(GRADE_9_DATA);
        if (typeof GRADE_10_DATA !== "undefined") allGrades.push(GRADE_10_DATA);

        let bestQuizMatch = null;
        let bestQuizScore = 0;

        for (const gr of allGrades) {
            for (const top of gr.topics) {
                if (!top.quiz) continue;
                const allQuestions = [
                    ...(top.quiz.levelA || []),
                    ...(top.quiz.levelB || []),
                    ...(top.quiz.levelC || [])
                ];

                for (const qItem of allQuestions) {
                    const qItemNorm = qItem.question.toLowerCase().replace(/[?!.,;:]/g, " ").trim();

                    // Дәл сәйкестік немесе толық ішкі сөйлем
                    if (qItemNorm === q || q.includes(qItemNorm) || qItemNorm.includes(q)) {
                        bestQuizMatch = { item: qItem, topic: top, grade: gr };
                        bestQuizScore = 1.0;
                        break;
                    }

                    // Сөздер ұқсастығын есептеу
                    const qWords = q.split(/\s+/).filter(w => w.length > 2);
                    const itemWords = qItemNorm.split(/\s+/).filter(w => w.length > 2);
                    let matchCount = 0;
                    for (const w of qWords) {
                        if (itemWords.includes(w)) matchCount++;
                    }
                    const score = matchCount / Math.max(qWords.length, 1);
                    if (score > 0.55 && score > bestQuizScore) {
                        bestQuizScore = score;
                        bestQuizMatch = { item: qItem, topic: top, grade: gr };
                    }
                }
                if (bestQuizScore === 1.0) break;
            }
            if (bestQuizScore === 1.0) break;
        }

        if (bestQuizMatch && bestQuizScore >= 0.55) {
            const { item, topic, grade } = bestQuizMatch;
            const correctText = item.options[item.correct];
            const optionsHtml = item.options.map((opt, idx) => {
                const isCorrect = idx === item.correct;
                const letter = String.fromCharCode(65 + idx);
                return `<div class="p-1.5 rounded-lg ${isCorrect ? 'bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 font-bold' : 'bg-slate-800/60 text-slate-300'} flex items-center justify-between text-xs">
                    <span>${letter}. ${opt}</span>
                    ${isCorrect ? '<span class="text-emerald-400 font-bold">✓ Дұрыс жауап</span>' : ''}
                </div>`;
            }).join("");

            return `
                <div class="space-y-3">
                    <div class="p-3 bg-gradient-to-r from-sky-950 to-indigo-950 rounded-2xl border border-sky-600/50">
                        <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">🎯 Тест сұрағының нақты жауабы:</div>
                        <div class="text-sm font-extrabold text-white flex items-center gap-2">
                            <span class="text-emerald-400 text-lg">✅</span>
                            <span>${correctText}</span>
                        </div>
                    </div>

                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <div class="text-[11px] text-slate-400 pb-1 border-b border-slate-700/60 font-semibold">
                            📚 ${grade.grade}-сынып: «${topic.title}»
                        </div>
                        <div>
                            <div class="font-bold text-slate-200 text-xs mb-0.5">Сұрақ:</div>
                            <div class="text-xs text-slate-300 italic">«${item.question}»</div>
                        </div>
                        <div class="pt-1">
                            <div class="font-bold text-emerald-400 text-xs mb-1">💡 Түсіндірме және негіздеме:</div>
                            <div class="text-xs text-slate-200 leading-relaxed">${item.explanation}</div>
                        </div>
                        <div class="pt-2 border-t border-slate-700/60 space-y-1">
                            <div class="text-[10px] font-semibold text-slate-400">Тест нұсқалары:</div>
                            ${optionsHtml}
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. СЕМАНТИКАЛЫҚ ТҰРАҚТЫ ГЕОМЕТРИЯЛЫҚ ҰҒЫМДАРДЫ АНЫҚТАУ
        // А. Айқас түзулер (10-сынып)
        if (q.includes("айқас") || (q.includes("бір жазықтықта") && (q.includes("жатпайтын") || q.includes("жатпайды") || q.includes("болмайтын")))) {
            return `
                <div class="space-y-3">
                    <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                        <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Нақты қорытынды жауап:</div>
                        <div class="text-sm font-extrabold text-white flex items-center gap-2">
                            <span class="text-emerald-400 text-lg">✅</span>
                            <span>Айқас түзулер (Кеңістіктегі түзулер)</span>
                        </div>
                    </div>

                    <div class="space-y-2 text-xs text-slate-200">
                        <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5">
                            <h5 class="font-bold text-sky-400">📐 Анықтамасы:</h5>
                            <p class="leading-relaxed">
                                Кеңістікте бір жазықтықта <strong>жатпайтын</strong> және ешқашан <strong>қиылыспайтын</strong> екі түзу <strong>айқас түзулер</strong> деп аталады. Олардың ортақ нүктесі болмайды ($0$).
                            </p>
                        </div>

                        <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5">
                            <h5 class="font-bold text-amber-400">✨ Айқас түзулер белгісі (Теорема):</h5>
                            <p class="leading-relaxed">
                                Егер екі түзудің бірі берілген жазықтықта жатса, ал екінші түзу осы жазықтықты бірінші түзуге тиісті емес нүктеде қиып өтетін болса, онда бұл екі түзу — <strong>айқас түзулер</strong> болады.
                            </p>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                                <span class="text-slate-400 text-[11px]">Арасындағы бұрыш:</span><br>
                                <strong class="text-white">$0^\\circ < \\varphi \\le 90^\\circ$</strong>
                            </div>
                            <div class="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                                <span class="text-slate-400 text-[11px]">Арақашықтығы:</span><br>
                                <strong class="text-white">Ортақ перпендикуляр $d$</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Ә. Параллель түзулер
        if (q.includes("параллель түзу") || (q.includes("бір жазықтықта") && q.includes("қиылыспайтын"))) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-700/60">
                        <div class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Нақты қорытынды жауап:</div>
                        <div class="text-sm font-extrabold text-white">✅ Параллель түзулер ($a \\parallel b$)</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                        <h5 class="font-bold text-sky-400">Анықтамасы:</h5>
                        <p class="leading-relaxed">Бір жазықтықта жататын және ешқашан қиылыспайтын екі түзу <strong>параллель түзулер</strong> деп аталады.</p>
                        <p class="leading-relaxed text-slate-400 mt-2"><strong>Кеңістіктегі үшінші түзуге параллельдік теоремасы:</strong> Үшінші түзуге параллель екі түзу өзара параллель болады: $a \\parallel c \\land b \\parallel c \\Rightarrow a \\parallel b$.</p>
                    </div>
                </div>
            `;
        }

        // Б. Перпендикуляр түзулер
        if (q.includes("перпендикуляр") && (q.includes("түзу") || q.includes("бұрыш") || q.includes("анықтама"))) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-sky-950/80 rounded-2xl border border-sky-700/60">
                        <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">Нақты қорытынды жауап:</div>
                        <div class="text-sm font-extrabold text-white">✅ Перпендикуляр түзулер ($a \\perp b$)</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                        <h5 class="font-bold text-sky-400">Анықтамасы:</h5>
                        <p class="leading-relaxed">Тік бұрыш ($90^\\circ$) жасап қиылысатын екі түзу <strong>перпендикуляр түзулер</strong> деп аталады.</p>
                        <p class="leading-relaxed text-slate-400 mt-1">Түзулердің арасындағы бұрыш: $\\angle(a, b) = 90^\\circ$. Векторлық түрде: $\\vec{a} \\cdot \\vec{b} = 0$.</p>
                    </div>
                </div>
            `;
        }

        // В. Ромб және диагональдары
        if (q.includes("ромб")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                        <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Ромб анықтамасы мен қасиеттері:</div>
                        <div class="text-sm font-extrabold text-white">✅ Барлық қабырғалары тең параллелограмм — РОМБ</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <h5 class="font-bold text-sky-400">Негізгі қасиеттері мен теоремалары:</h5>
                        <ul class="list-disc pl-4 space-y-1">
                            <li><strong>Диагональдары өзара перпендикуляр:</strong> $d_1 \\perp d_2$.</li>
                            <li><strong>Диагональдары ішкі бұрыштарын қақ бөледі</strong> (биссектрисасы болады).</li>
                            <li>Диагональдары мен қабырғасы арасындағы байланыс: $4a^2 = d_1^2 + d_2^2$.</li>
                            <li><strong>Ауданы:</strong> $S = \\frac{1}{2}d_1 d_2 = ah = a^2\\sin\\alpha$.</li>
                            <li>Іштей сызылған шеңбер радиусы: $r = \\frac{h}{2} = \\frac{d_1 d_2}{4a}$.</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        // Г. Параллелограмм
        if (q.includes("параллелограмм")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-sky-950/80 rounded-2xl border border-sky-700/60">
                        <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">Параллелограмм қасиеттері:</div>
                        <div class="text-sm font-extrabold text-white">✅ Қарама-қарсы қабырғалары қос-қостан параллель төртбұрыш</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <ul class="list-disc pl-4 space-y-1">
                            <li>Қарама-қарсы қабырғалары тең: $AB = CD, BC = AD$.</li>
                            <li>Қарама-қарсы бұрыштары тең: $\\angle A = \\angle C, \\angle B = \\angle D$.</li>
                            <li>Іргелес бұрыштарының қосындысы: $\\angle A + \\angle B = 180^\\circ$.</li>
                            <li><strong>Диагональдар теңдігі:</strong> $d_1^2 + d_2^2 = 2(a^2 + b^2)$.</li>
                            <li><strong>Ауданы:</strong> $S = ah = ab\\sin\\alpha = \\frac{1}{2}d_1 d_2 \\sin\\varphi$.</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        // Ғ. Трапеция
        if (q.includes("трапеция")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-purple-950/80 rounded-2xl border border-purple-700/60">
                        <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1">Трапеция ұғымы мен формулалары:</div>
                        <div class="text-sm font-extrabold text-white">✅ Екі қабырғасы ғана параллель болатын төртбұрыш</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <ul class="list-disc pl-4 space-y-1">
                            <li>Параллель қабырғалары — <strong>табандары</strong> ($a$ және $b$), қалған екеуі — <strong>бүйір қабырғалары</strong>.</li>
                            <li><strong>Орта сызығы:</strong> табандарына параллель және олардың қосындысының жартысына тең: $m = \\frac{a + b}{2}$.</li>
                            <li><strong>Ауданы:</strong> $S = m \\cdot h = \\frac{a + b}{2}h$.</li>
                            <li>Тең бүйірлі трапецияның табанындағы бұрыштары тең және диагональдары өзара тең.</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        // Д. Шеңберге іштей/сырттай төртбұрыштар
        if (q.includes("іштей") || q.includes("сырттай") || q.includes("птолемей")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-700/60">
                        <div class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Шеңбер және төртбұрыштар:</div>
                        <div class="text-sm font-extrabold text-white">✅ Іштей және сырттай сызылған төртбұрыштардың негізгі шарты</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <div>
                            <strong class="text-sky-400">1. Шеңберге ІШТЕЙ сызылған төртбұрыш:</strong>
                            <p class="mt-0.5">Қарама-қарсы бұрыштарының қосындысы әрқашан $180^\\circ$-қа тең: $\\angle A + \\angle C = \\angle B + \\angle D = 180^\\circ$.</p>
                            <p class="text-slate-400 mt-0.5"><em>Птолемей теоремасы:</em> $d_1 d_2 = ac + bd$.</p>
                        </div>
                        <div class="pt-2 border-t border-slate-700">
                            <strong class="text-emerald-400">2. Шеңберге СЫРТТАЙ сызылған төртбұрыш:</strong>
                            <p class="mt-0.5">Қарама-қарсы қабырғаларының қосындылары өзара тең болады: $a + c = b + d$.</p>
                            <p class="text-slate-400 mt-0.5">Ауданы: $S = p \\cdot r$, мұндағы $p$ — жарты периметр, $r$ — радиус.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Е. Түзу мен шеңбер орналасуы
        if (q.includes("жанама") || q.includes("қиюшы") || (q.includes("түзу") && q.includes("шеңбер"))) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-sky-950/80 rounded-2xl border border-sky-700/60">
                        <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">Түзу мен шеңбердің өзара орналасуы:</div>
                        <div class="text-sm font-extrabold text-white">✅ Қашықтық $d$ мен радиус $R$ қатынасы</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <p><strong>1. $d > R$:</strong> Ортақ нүктесі жоқ (түзу шеңберден тыс жатыр).</p>
                        <p><strong>2. $d = R$: ЖАНАМА ТҮЗУ.</strong> Шеңбермен бір ғана ортақ нүктесі бар. Жанасу нүктесіне жүргізілген радиус жанамаға қатаң перпендикуляр: $R \\perp l$.</p>
                        <p><strong>3. $d < R$: ҚИЮШЫ ТҮЗУ.</strong> Шеңберді екі нүктеде қиып өтеді.</p>
                    </div>
                </div>
            `;
        }

        // Ж. Векторлар және скалярлық көбейтінді (9-сынып)
        if (q.includes("скаляр") || q.includes("вектор") || q.includes("коллинеар")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                        <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Векторлар және скалярлық көбейтінді:</div>
                        <div class="text-sm font-extrabold text-white">✅ Негізгі формулалар мен шарттар</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <p><strong>Скалярлық көбейтінді:</strong> $\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\varphi = x_1 x_2 + y_1 y_2$.</p>
                        <p><strong>Перпендикулярлық шарты:</strong> $\\vec{a} \\perp \\vec{b} \\iff \\vec{a} \\cdot \\vec{b} = 0 \\iff x_1 x_2 + y_1 y_2 = 0$.</p>
                        <p><strong>Коллинеарлық шарты:</strong> $\\vec{b} = k\\vec{a} \\iff \\frac{x_2}{x_1} = \\frac{y_2}{y_1}$.</p>
                        <p><strong>Вектор ұзындығы (модулі):</strong> $|\\vec{a}| = \\sqrt{x^2 + y^2}$.</p>
                        <p><strong>Векторлар арасындағы бұрыш:</strong> $\\cos\\varphi = \\frac{x_1 x_2 + y_1 y_2}{\\sqrt{x_1^2+y_1^2} \\cdot \\sqrt{x_2^2+y_2^2}}$.</p>
                    </div>
                </div>
            `;
        }

        // З. Параллелепипед (10-сынып)
        if (q.includes("параллелепипед")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-purple-950/80 rounded-2xl border border-purple-700/60">
                        <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1">10-сынып: Параллелепипед</div>
                        <div class="text-sm font-extrabold text-white">✅ Тікбұрышты параллелепипед формулалары</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <p><strong>Кеңістіктік диагональ:</strong> $d = \\sqrt{a^2 + b^2 + c^2}$ немесе $d^2 = a^2 + b^2 + c^2$.</p>
                        <p><strong>Көлемі:</strong> $V = a \\cdot b \\cdot c$.</p>
                        <p><strong>Толық бетінің ауданы:</strong> $S_{тол} = 2(ab + bc + ac)$.</p>
                        <p><strong>Бүйір бетінің ауданы:</strong> $S_{бүй} = 2c(a + b)$.</p>
                        <p class="text-slate-400">Элементтері: 6 жақ (қос-қостан тең), 8 төбе, 12 қыр.</p>
                    </div>
                </div>
            `;
        }

        // И. Тетраэдр (10-сынып)
        if (q.includes("тетраэдр")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                        <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">10-сынып: Тетраэдр</div>
                        <div class="text-sm font-extrabold text-white">✅ Дұрыс тетраэдр (қыры $a$) өлшемдері</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <p><strong>Биіктігі:</strong> $H = \\frac{a\\sqrt{6}}{3}$.</p>
                        <p><strong>Көлемі:</strong> $V = \\frac{a^3\\sqrt{2}}{12}$.</p>
                        <p><strong>Толық бетінің ауданы:</strong> $S_{тол} = a^2\\sqrt{3}$ (4 тең қабырғалы үшбұрыштан тұрады).</p>
                        <p class="text-slate-400">Элементтері: 4 жақ, 4 төбе, 6 қыр.</p>
                    </div>
                </div>
            `;
        }

        // Й. Эллипс, гипербола, парабола (8-сынып)
        if (q.includes("эллипс") || q.includes("гипербола") || q.includes("парабола") || q.includes("қисық")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-sky-950/80 rounded-2xl border border-sky-700/60">
                        <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">Екінші ретті қисықтар:</div>
                        <div class="text-sm font-extrabold text-white">✅ Канондық теңдеулері</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <p><strong>Эллипс:</strong> $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($c = \\sqrt{a^2 - b^2}$, эксцентриситет $e = \\frac{c}{a} < 1$).</p>
                        <p><strong>Гипербола:</strong> $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ ($c = \\sqrt{a^2 + b^2}$, асимптоталары $y = \\pm \\frac{b}{a}x$, $e = \\frac{c}{a} > 1$).</p>
                        <p><strong>Парабола:</strong> $y^2 = 2px$ (фокус $F(\\frac{p}{2}; 0)$, директриса $x = -\\frac{p}{2}$, $e = 1$).</p>
                    </div>
                </div>
            `;
        }

        // К. Үшбұрыштың тамаша сызықтары (медиана, биссектриса, биіктік)
        if (q.includes("медиана") || q.includes("биссектриса") || q.includes("биіктік") || q.includes("орта сызық") || q.includes("центроид")) {
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-700/60">
                        <div class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Үшбұрыштың негізгі элементтері:</div>
                        <div class="text-sm font-extrabold text-white">✅ Медиана, биссектриса, биіктік және орта сызық</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                        <p><strong>Медиана:</strong> Төбені қарама-қарсы қабырғаның ортасымен қосатын кесінді. Үш медиана центроидта қиылысып, $2:1$ қатынаста бөлінеді.</p>
                        <p><strong>Биссектриса:</strong> Бұрышты қақ бөлетін сәуле. Қарсы қабырғаны іргелес қабырғаларға пропорционал бөледі: $\\frac{a_1}{a_2} = \\frac{b}{c}$.</p>
                        <p><strong>Биіктік:</strong> Төбеден қарсы қабырғаға түсірілген перпендикуляр. Үш биіктік ортоцентрде қиылысады.</p>
                        <p><strong>Орта сызық:</strong> Екі қабырғаның ортасын қосатын кесінді. Үшінші қабырғаға параллель және жартысына тең: $m = \\frac{a}{2}$.</p>
                    </div>
                </div>
            `;
        }

        // 3. САНДЫҚ ЕСЕПТЕРДІ АВТОМАТТЫ ШЕШУ
        const nums = query.match(/-?\d+(\.\d+)?/g);
        const numbers = nums ? nums.map(Number) : [];

        // 1. Пифагор есебі
        if ((q.includes("катет") || q.includes("пифагор") || q.includes("гипотенуза") || q.includes("тік бұрышты")) && numbers.length >= 2) {
            const [n1, n2] = numbers;
            if (q.includes("гипотенуза") && (q.includes("катет") || q.includes("екінші") || q.includes("тап"))) {
                const c = Math.max(n1, n2);
                const a = Math.min(n1, n2);
                if (c > a) {
                    const b = Math.sqrt(c * c - a * a);
                    const bRound = Math.round(b * 100) / 100;
                    return `
                        <div class="space-y-2.5 text-xs text-slate-200">
                            <div class="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-700/60">
                                <div class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Пифагор есебінің нәтижесі:</div>
                                <div class="text-sm font-extrabold text-white">✅ Белгісіз катет: $b = ${bRound}$</div>
                            </div>
                            <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5">
                                <h5 class="font-bold text-sky-400">Шешу жолы:</h5>
                                <p>$$b = \\sqrt{c^2 - a^2} = \\sqrt{${c}^2 - ${a}^2} = \\sqrt{${c*c} - ${a*a}} = \\sqrt{${c*c - a*a}} \\approx ${bRound}$$</p>
                                <p class="text-slate-300 mt-1">Үшбұрыш ауданы: $S = \\frac{1}{2}ab = \\frac{1}{2} \\cdot ${a} \\cdot ${bRound} = ${(0.5 * a * bRound).toFixed(2)}$.</p>
                            </div>
                        </div>
                    `;
                }
            }
            const c = Math.sqrt(n1 * n1 + n2 * n2);
            const cRound = Math.round(c * 100) / 100;
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-700/60">
                        <div class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Пифагор есебінің нәтижесі:</div>
                        <div class="text-sm font-extrabold text-white">✅ Гипотенуза: $c = ${cRound}$</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5">
                        <h5 class="font-bold text-sky-400">Шешу жолы (Пифагор теоремасы):</h5>
                        <p>$$c = \\sqrt{a^2 + b^2} = \\sqrt{${n1}^2 + ${n2}^2} = \\sqrt{${n1*n1} + ${n2*n2}} = \\sqrt{${n1*n1 + n2*n2}} \\approx ${cRound}$$</p>
                        <p class="text-slate-300 mt-1">Үшбұрыш ауданы: $S = \\frac{1}{2}ab = \\frac{1}{2} \\cdot ${n1} \\cdot ${n2} = ${(0.5 * n1 * n2)}$.</p>
                    </div>
                </div>
            `;
        }

        // 2. Параллелепипед өлшемдері (a, b, c)
        if (q.includes("параллелепипед") && numbers.length >= 3) {
            const [a, b, c] = numbers;
            const d = Math.round(Math.sqrt(a * a + b * b + c * c) * 100) / 100;
            const V = a * b * c;
            const S = 2 * (a * b + b * c + a * c);
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-purple-950/80 rounded-2xl border border-purple-700/60">
                        <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1">Параллелепипед есептеуі ($a = ${a}, b = ${b}, c = ${c}$):</div>
                        <div class="text-sm font-extrabold text-white">✅ $d = ${d}$, $V = ${V}$, $S_{тол} = ${S}$</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5">
                        <p>• <strong>Кеңістіктік диагоналі:</strong> $d = \\sqrt{a^2 + b^2 + c^2} = \\sqrt{${a*a} + ${b*b} + ${c*c}} = \\sqrt{${a*a + b*b + c*c}} \\approx ${d}$</p>
                        <p>• <strong>Көлемі:</strong> $V = a \\cdot b \\cdot c = ${a} \\cdot ${b} \\cdot ${c} = ${V}$</p>
                        <p>• <strong>Толық бетінің ауданы:</strong> $S_{тол} = 2(ab + bc + ac) = 2(${a*b} + ${b*c} + ${a*c}) = ${S}$</p>
                    </div>
                </div>
            `;
        }

        // 3. Үшбұрыш бұрыштары
        if (q.includes("бұрыш") && numbers.length >= 2 && numbers[0] < 180 && numbers[1] < 180 && (numbers[0] + numbers[1] < 180)) {
            const [ang1, ang2] = numbers;
            const ang3 = 180 - (ang1 + ang2);
            let type = ang3 < 90 && ang1 < 90 && ang2 < 90 ? "сүйір бұрышты" : ang3 === 90 ? "тік бұрышты" : "доғал бұрышты";
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-700/60">
                        <div class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Үшбұрыш бұрыштары:</div>
                        <div class="text-sm font-extrabold text-white">✅ Үшінші бұрыш: $\\angle 3 = ${ang3}^\\circ$</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                        <p>Кез келген үшбұрыштың ішкі бұрыштарының қосындысы $180^\\circ$-қа тең:</p>
                        <p>$$\\angle 3 = 180^\\circ - (${ang1}^\\circ + ${ang2}^\\circ) = ${ang3}^\\circ$$</p>
                        <p class="text-sky-300">Үшбұрыш түрі: <strong>${type}</strong> үшбұрыш.</p>
                    </div>
                </div>
            `;
        }

        // 4. Шеңбер / дөңгелек өлшемдері (Радиус берілсе)
        if ((q.includes("радиус") || q.includes("шеңбер") || q.includes("дөңгелек")) && numbers.length === 1) {
            const R = numbers[0];
            const C = (2 * Math.PI * R).toFixed(2);
            const S = (Math.PI * R * R).toFixed(2);
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-sky-950/80 rounded-2xl border border-sky-700/60">
                        <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">Шеңбер өлшемдері ($R = ${R}$):</div>
                        <div class="text-sm font-extrabold text-white">✅ Диаметр: $D = ${2 * R}$, Ұзындығы: $C \\approx ${C}$, Аудан: $S \\approx ${S}$</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5">
                        <p>• Диаметрі: $D = 2R = ${2 * R}$</p>
                        <p>• Шеңбер ұзындығы: $C = 2\\pi R = 2 \\cdot 3.1416 \\cdot ${R} \\approx ${C}$</p>
                        <p>• Дөңгелек ауданы: $S = \\pi R^2 = 3.1416 \\cdot ${R}^2 \\approx ${S}$</p>
                    </div>
                </div>
            `;
        }

        // 5. Трапеция есептеу
        if (q.includes("трапеция") && numbers.length >= 3) {
            const [a, b, h] = numbers;
            const m = (a + b) / 2;
            const S = m * h;
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-purple-950/80 rounded-2xl border border-purple-700/60">
                        <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1">Трапеция өлшемдері ($a = ${a}, b = ${b}, h = ${h}$):</div>
                        <div class="text-sm font-extrabold text-white">✅ Орта сызығы: $m = ${m}$, Ауданы: $S = ${S}$</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                        <p>• Орта сызығы: $m = \\frac{a + b}{2} = \\frac{${a} + ${b}}{2} = ${m}$</p>
                        <p>• Ауданы: $S = m \\cdot h = ${m} \\cdot ${h} = ${S}$</p>
                    </div>
                </div>
            `;
        }

        // 6. Ромб есептеу
        if (q.includes("ромб") && numbers.length >= 2) {
            const [d1, d2] = numbers;
            const S = 0.5 * d1 * d2;
            const a = Math.round(0.5 * Math.hypot(d1, d2) * 100) / 100;
            return `
                <div class="space-y-2.5 text-xs text-slate-200">
                    <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                        <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Ромб өлшемдері ($d_1 = ${d1}, d_2 = ${d2}$):</div>
                        <div class="text-sm font-extrabold text-white">✅ Ауданы: $S = ${S}$, Қабырғасы: $a \\approx ${a}$</div>
                    </div>
                    <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                        <p>• Ауданы: $S = \\frac{1}{2} d_1 d_2 = \\frac{1}{2} \\cdot ${d1} \\cdot ${d2} = ${S}$</p>
                        <p>• Қабырғасы: $a = \\frac{1}{2}\\sqrt{d_1^2 + d_2^2} = \\frac{1}{2}\\sqrt{${d1*d1 + d2*d2}} \\approx ${a}$</p>
                        <p>• Периметрі: $P = 4a \\approx ${(4 * a).toFixed(2)}$</p>
                    </div>
                </div>
            `;
        }

        // 4. ТАҚЫРЫПҚА СӘЙКЕС КӨМЕК ЖӘНЕ ҚОЛДАНЫСТАР
        const activeTopic = curTopic || (typeof App !== "undefined" ? App.currentTopic : null);

        // А. Өмірдегі және ғылымдағы қолданысын сұрағанда (Жылдам батырма немесе сұрақ)
        if (q.includes("қолданыс") || q.includes("өмірде") || q.includes("ғылымда") || q.includes("қайда қолданылады") || q.includes("маңызы") || q.includes("пайдасы")) {
            return this.getTopicApplications(activeTopic, q);
        }

        // Ә. Формулаларды сұрағанда
        if (q.includes("формула") || q.includes("көрсет")) {
            return this.getTopicFormulas(activeTopic, q);
        }

        // Б. Тұспал немесе көмек сұрағанда
        if (q.includes("тұспал") || q.includes("көмек") || q.includes("подсказка")) {
            return this.getTopicHints(activeTopic, q);
        }

        // В. Анықтамаларды сұрағанда
        if (q.includes("анықтама")) {
            if (activeTopic && activeTopic.definitions && activeTopic.definitions.length > 0) {
                const defsText = activeTopic.definitions.map(d => `• <strong>${d.term}:</strong> ${d.content}`).join("<br><br>");
                return `
                    <div class="space-y-2.5 text-xs text-slate-200">
                        <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                            <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">Анықтамалар:</div>
                            <div class="text-sm font-extrabold text-white">«${activeTopic.title}» негізгі ұғымдары</div>
                        </div>
                        <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 leading-relaxed">
                            ${defsText}
                        </div>
                    </div>
                `;
            }
        }

        // Жалпы кеңес
        return `
            <div class="space-y-2 text-xs text-slate-200">
                <p>Сұрағыңыз қабылданды! Неғұрлым нақты жауап алу үшін:</p>
                <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5 text-[11px]">
                    <p>1. Жоғарыдағы <strong>«🔑 API кілт»</strong> батырмасы арқылы Google Gemini кілтіңізді енгізіп, <em>«Тексеру (Test)»</em> басыңыз — сонда кез келген еркін сұраққа Gemini моделі тікелей толық жауап береді.</p>
                    <p>2. Немесе жоғарыдағы жылдам батырмаларды қолданыңыз: <strong>«💡 Формулаларды көрсет»</strong>, <strong>«🎯 Есепке тұспал»</strong>, <strong>«🌍 Өмірдегі қолданысы»</strong>.</p>
                    <p>3. Немесе кез келген есепті сандарымен жазыңыз (мысалы: <em>«катеттері 9 және 12 болатын гипотенуза қандай?»</em>, <em>«ромб диагональдары 12 және 16»</em>).</p>
                </div>
            </div>
        `;
    },

    // ---------------- 19 ТАҚЫРЫП БОЙЫНША ӨМІРДЕГІ ЖӘНЕ ҒЫЛЫМДАҒЫ ҚОЛДАНЫСТАР ----------------
    getTopicApplications(topic, queryText) {
        let topicId = topic ? topic.id : "";
        const q = (queryText || "").toLowerCase();

        // Егер белсенді тақырып белгісіз болса, сұрақтан анықтау
        if (!topicId) {
            if (q.includes("ромб")) topicId = "g8_t2";
            else if (q.includes("айқас") || q.includes("кеңістік")) topicId = "g10_t1";
            else if (q.includes("трапеция")) topicId = "g8_t3";
            else if (q.includes("параллелограмм")) topicId = "g8_t1";
            else if (q.includes("пифагор") || q.includes("катет")) topicId = "g8_t5";
            else if (q.includes("параллелепипед")) topicId = "g10_t2";
            else if (q.includes("тетраэдр")) topicId = "g10_t3";
            else if (q.includes("вектор")) topicId = "g9_t1";
            else if (q.includes("шеңбер") || q.includes("дөңгелек")) topicId = "g7_t3";
            else if (q.includes("эллипс") || q.includes("парабола") || q.includes("гипербола")) topicId = "g8_t6";
            else if (q.includes("үшбұрыш")) topicId = "g7_t1";
            else topicId = "g8_t2"; // әдепкі үлгі ретінде ашық тұрған ромб
        }

        const apps = {
            "g7_t1": {
                name: "Үшбұрыштың түрлері",
                items: [
                    { title: "🏗️ Құрылыс және сәулет (Қатаңдық қасиеті)", desc: "Үшбұрыш — пішіні деформацияланбайтын жалғыз қатаң геометриялық фигура. Сондықтан көпір фермалары, кран жебелері, шатырлар мен Эйфель мұнарасы таза үшбұрышты торлардан құрастырылады." },
                    { title: "🗺️ Геодезия және GPS (Триангуляция)", desc: "Жер бетінің картасын жасау және спутниктік навигация триангуляция әдісіне негізделген — жер бедері өзара байланысқан үшбұрыштар торына бөлініп өлшенеді." },
                    { title: "🎮 3D Компьютерлік графика (Полигондар)", desc: "Заманауи анимациялық фильмдер мен компьютерлік ойындардағы кез келген күрделі кейіпкер немесе көлік мыңдаған кішкентай үшбұрыштардан (полигондардан) құралады." }
                ]
            },
            "g7_t2": {
                name: "Үшбұрыштың тамаша нүктелері",
                items: [
                    { title: "✈️ Авиация және кеме жасау (Ауырлық центрі — Центроид)", desc: "Үш медиананың қиылысу нүктесі (центроид) кез келген үшбұрыштың геометриялық масса центрі болады. Ұшақтар мен кемелердің тепе-теңдігі осы нүкте арқылы есептеледі." },
                    { title: "📡 Оптика мен телекоммуникация", desc: "Биссектриса мен биіктіктер жарық сәулесі мен дыбыс толқындарының шағылу бұрыштарын есептеуде, театрлар мен акустикалық залдарды жобалауда қолданылады." }
                ]
            },
            "g7_t3": {
                name: "Шеңбер мен дөңгелек",
                items: [
                    { title: "🚗 Көлік өркениеті (Дөңгелек және подшипник)", desc: "Дөңгелек өнертабысы үйкелісті сырғанаудан домалауға ауыстырып, энергия шығынын ондаған есе азайтты. Тісті дөңгелектер (шестернялар) арқылы қозғалыс беріледі." },
                    { title: "🛰️ Ғарыштық орбиталар", desc: "Жердің жасанды серіктерінің траекториялары шеңбер немесе дөңгелек қимасы түрінде есептеледі." },
                    { title: "🚰 Құбырлар мен туннельдер", desc: "Шеңбер пішінді құбырлар қоршаған ортаның қысымын біркелкі тарататын ең берік гидротехникалық құрылым болып табылады." }
                ]
            },
            "g7_t4": {
                name: "Тіктөртбұрыш және шаршы",
                items: [
                    { title: "🏢 Сәулет және құрылыс", desc: "Үйлердің бөлмелері, қабырғалар мен едендер тіктөртбұрыш пішіндес. Ол жазықтықты бос орын қалдырмай толық толтыруға (плитка, ламинат төсеуге) ең тиімді." },
                    { title: "📱 Дисплейлер мен пикселдер матрицасы", desc: "Смартфондар мен компьютер экрандары (16:9, 4:3) тіктөртбұрышты торға орналасқан миллиондаған пикселдерден тұрады." }
                ]
            },
            "g7_t5": {
                name: "Түзу мен шеңбер орналасуы",
                items: [
                    { title: "🛣️ Автомагистральдар мен теміржолдар", desc: "Жолдардың түзу сызықтан бұрылысқа қауіпсіз өтуі шеңберге жанама түзу арқылы жобаланады (центрге тартқыш күшті бірқалыпты ұстау үшін)." },
                    { title: "⚙️ Ременьдік берілістер", desc: "Автомобиль қозғалтқышындағы таспа (ремень) шкивке қатаң түрде жанама бойымен өтеді." }
                ]
            },
            "g7_t6": {
                name: "Екі шеңбердің өзара орналасуы",
                items: [
                    { title: "⌚ Сағат механизмдері", desc: "Механикалық сағаттардың тісті дөңгелектерінің сырттай жанасуы уақытты секундтық дәлдікпен өлшеуге мүмкіндік береді." },
                    { title: "🌑 Күн мен Айдың тұтылуын болжау", desc: "Астрономдар аспан денелерінің көлеңке шеңберлерінің қиылысуын екі шеңбер геометриясымен дәл есептейді." }
                ]
            },
            "g8_t1": {
                name: "Параллелограмм",
                items: [
                    { title: "⚖️ Физикадағы күштерді қосу (Векторлық параллелограмм)", desc: "Бір нүктеге әсер ететін екі күштің теңәсерлі күші параллелограмм ережесімен (диагоналі бойымен) есептеледі (Ньютон заңдары)." },
                    { title: "🚋 Пантографтар (Пойыз және трамвайлар)", desc: "Электр пойыздарының сымнан ток алатын жиналмалы механизмі параллелограмм түрінде жасалғандықтан, кез келген биіктікте контактіні үзбейді." }
                ]
            },
            "g8_t2": {
                name: "Ромб және оның қасиеттері",
                items: [
                    { title: "🚙 Автомобильдік ромбтық домкрат", desc: "Көлікті көтеретін ромбылық домкрат диагональдардың өзгеруі есебінен аз ғана адам күшімен 2-3 тонналық салмақты жеңіл көтереді ($4a^2 = d_1^2 + d_2^2$ қағидасы)." },
                    { title: "🛑 Жол қауіпсіздігі («Басты жол» белгісі)", desc: "«Басты жол» белгісі әдейі ромб пішінді жасалған, себебі ромб адам көзінің перифериялық көру аймағына бәрінен жылдам шалынады." },
                    { title: "🌉 Көпір фермалары мен торлары", desc: "Ромбылық болат торлар көпірлер мен мұнараларға максималды қаттылық пен беріктік береді (диагональдардың өзара перпендикулярлығы есебінен)." },
                    { title: "💎 Кристаллография мен зергерлік (Алмаз)", desc: "Табиғи алмаздың кристалдық торы ромбылық сингонияға негізделген, сондықтан ол жарықты керемет шағылыстырады." },
                    { title: "🇰🇿 Қазақ ою-өрнегі (Симметрия)", desc: "«Қошқармүйіз», «сырғалық», «тұмарша» оюлары ромбтың өзара перпендикуляр диагональдары бойынша симметрия құрады." }
                ]
            },
            "g8_t3": {
                name: "Трапеция",
                items: [
                    { title: "🌊 ГЭС бөгеттері (Плотиналар)", desc: "Су қоймаларының плотиналары трапеция қимасымен салынады, себебі су қысымы тереңдікке қарай артады (төменгі табаны кең, жоғарғысы жіңішке)." },
                    { title: "✈️ Заманауи ұшақ қанаттары", desc: "Жолаушылар лайнерлері мен дыбыстан жылдам жойғыштардың қанаттары аэродинамикалық кедергіні азайту үшін трапеция түрінде жобаланады." },
                    { title: "🌾 Суару каналдары мен арықтар", desc: "Каналдардың көлденең қимасы су ағысының жылдамдығын сақтап, жағалау опырылмауы үшін трапеция түрінде қазылады." }
                ]
            },
            "g8_t4": {
                name: "Шеңберге іштей/сырттай төртбұрыштар",
                items: [
                    { title: "🏛️ Геодезиялық күмбездер", desc: "Сәулетші Бакминстер Фуллердің күмбездері шеңберге іштей сызылған төртбұрыштар мен үшбұрыштар торынан тұрады." },
                    { title: "🚴 Велосипед рамалары", desc: "Велосипед дөңгелектері мен рамасының геометриялық үйлесімі осы қағидаға негізделген." }
                ]
            },
            "g8_t5": {
                name: "Тік бұрышты үшбұрыш және Пифагор",
                items: [
                    { title: "🛰️ GPS Навигациясы мен қашықтық", desc: "Картадағы немесе кеңістіктегі кез келген екі нүктенің қашықтығы координаталар айырымы арқылы Пифагор теоремасымен есептеледі ($d = \\sqrt{\\Delta x^2 + \\Delta y^2}$)."},
                    { title: "📐 Құрылысшылардың «Египет үшбұрышы»", desc: "3-4-5 қатынасындағы қабырғалар іргетас қалағанда мінсіз $90^\\circ$ тік бұрыш алудың ең сенімді құралы." },
                    { title: "🤖 Робототехника", desc: "Робот манипуляторының кеңістікте белгілі бір координатаға жету траекториясы тригонометрия мен Пифагор арқылы бағдарламаланады." }
                ]
            },
            "g8_t6": {
                name: "Эллипс, гипербола, парабола",
                items: [
                    { title: "📡 Парабола: Спутниктік антенналар мен фарлар", desc: "Параболалық айнаның фокусына жарық қойса, сәулелер параллель шоқ болып түзу шағылады (автокөлік фарлары). Ал ғарыштан келген әлсіз сигналдар параболалық «тарелканың» фокусына жиналып күшейеді." },
                    { title: "🪐 Эллипс: Планеталар қозғалысы (Кеплер заңы)", desc: "Күн жүйесіндегі барлық планеталар мен Жер Күнді дөңгелек емес, эллипс бойымен айналады (Күн эллипстің бір фокусында тұрады)." },
                    { title: "🏥 Эллипс медицинада (Литотрипсия)", desc: "Бүйректегі тастарды отасыз үгу аппараты эллипс пішіндес рефлектордан тұрады: бір фокуста акустикалық толқын шығарылса, ол екінші фокустағы тасқа дәл шоғырланып оны үгітеді." },
                    { title: "🏭 Гипербола: АЭС салқындату мұнаралары (Градирнялар)", desc: "Атом станцияларының алып градирнялары бірқуысты гиперболоид пішінінде салынады. Бұл пішін минималды бетон жұмсап, дауылды желге ең төзімді құрылым жасайды." }
                ]
            },
            "g9_t1": {
                name: "Вектор ұғымы және қосу",
                items: [
                    { title: "🛩️ Авиациялық навигация", desc: "Ұшақтың нақты ұшу бағыты оның өз жылдамдық векторы мен желдің жылдамдық векторының қосындысына (${\\vec{v}}_{нақты} = {\\vec{v}}_{ұшақ} + {\\vec{v}}_{жел}$) тең." },
                    { title: "🌊 Теңіз кеме қатынасы", desc: "Кеме капитандары су ағысы векторын ескеріп, курс бұрышын түзейді." }
                ]
            },
            "g9_t2": {
                name: "Векторды санға көбейту",
                items: [
                    { title: "🎮 Ойын физикасы (Game Engines)", desc: "Unity немесе Unreal Engine ойын қозғалтқыштарында кейіпкердің үдеуі, қозғалысы және салмақсыздық күйі жылдамдық векторын санға көбейту арқылы есептеледі." }
                ]
            },
            "g9_t3": {
                name: "Векторлардың скалярлық көбейтіндісі",
                items: [
                    { title: "⚡ Физикадағы механикалық жұмыс", desc: "Күштің атқаратын жұмысы күш векторы мен орын ауыстыру векторының скаляр көбейтіндісіне тең ($A = \\vec{F} \\cdot \\vec{s} = |\\vec{F}||\\vec{s}|\\cos\\alpha$). Егер күш қозғалысқа перпендикуляр болса, жұмыс $0$-ге тең." },
                    { title: "☀️ Күн электр станциялары", desc: "Күн панелінен өндірілетін токтың мөлшері күн сәулесі векторы мен панель нормалі векторының скаляр көбейтіндісіне тура пропорционал." },
                    { title: "💻 3D Компьютерлік графика (Көлеңкелер мен жарық)", desc: "Кейіпкерлер мен көліктердің бетіне жарық қалай түсетінін есептеу үшін жарық векторы мен бет нормалі скаляр көбейтіледі." }
                ]
            },
            "g9_t4": {
                name: "Векторлардың координаталары",
                items: [
                    { title: "🚁 Дрондар мен пилотсыз ұшақтар", desc: "Дронның әуедегі кез келген маневрі оның үшөлшемді координаталық жылдамдық векторы $(v_x, v_y, v_z)$ арқылы автоматты реттеледі." },
                    { title: "🗺️ Геоақпараттық жүйелер (ГИС)", desc: "Google Maps немесе Яндекс Карталардағы маршрут салу және көлік қозғалысы координаталық векторлармен жүзеге асады." }
                ]
            },
            "g10_t1": {
                name: "Кеңістіктегі түзулер (Айқас түзулер)",
                items: [
                    { title: "🛣️ Мегаполистердегі көпдеңгейлі жол айрықтары", desc: "Қазіргі қалаларда көлік кептелісін болдырмау үшін көпірлер мен төменгі жолдар бір-бірін кесіп өтпейтін АЙҚАС ТҮЗУЛЕР түрінде жобаланады (қақтығыс нүктесі болмайды)." },
                    { title: "🛰️ Ғарыштық спутниктер қауіпсіздігі", desc: "Жер орбитасында мыңдаған спутник ұшып жүр. Олардың соқтығысып қалмауы үшін траекториялары кеңістікте айқас түзулер болып есептеледі және арасындағы минималды қашықтық қадағаланады." },
                    { title: "🌉 Вантовый (аспалы) көпірлер", desc: "Астанадағы немесе Владивостоктағы алып аспалы көпірлердің болат арқандары кеңістікте айқас сызықтар жүйесін құрып, зор салмақты тең таратады." }
                ]
            },
            "g10_t2": {
                name: "Параллелепипед",
                items: [
                    { title: "🚢 Халықаралық логистика (Контейнерлер)", desc: "Дүниежүзілік сауданың 90%-ы тікбұрышты параллелепипед пішінді стандартты теңіз контейнерлерімен (TEU) тасымалданады. Бұл кемеде, пойызда және қоймада көлемді ($V=abc$) 100% бос орынсыз толтыруға мүмкіндік береді." },
                    { title: "🏙️ Заманауи сәулет және құрылыс", desc: "Тұрғын үйлер, ғимараттар мен кірпіштер параллелепипед пішінінде өндіріледі, өйткені ол құрылымдық беріктік пен ең үлкен ішкі пайдалы кеңістікті береді." }
                ]
            },
            "g10_t3": {
                name: "Тетраэдр",
                items: [
                    { title: "🔬 Химия және наноматериалдар (Метан мен Алмаз)", desc: "Метан ($CH_4$) молекуласының пішіні — мінсіз дұрыс тетраэдр. Алмаздың табиғаттағы ең қатты минерал болу себебі — көміртек атомдарының тетраэдрлік берік байланысынан." },
                    { title: "🌊 Теңіз толқын тосқауылдары (Тетраподтар)", desc: "Теңіз порттары мен жағалауларын дауыл толқындарынан қорғайтын 4 тармақты алып бетон блоктар тетраэдр геометриясына негізделген (олар аударылмайды)." }
                ]
            }
        };

        const targetData = apps[topicId] || apps["g8_t2"];
        const itemsHtml = targetData.items.map(it => `
            <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                <h5 class="font-bold text-sky-400 text-xs">${it.title}</h5>
                <p class="text-xs text-slate-200 leading-relaxed">${it.desc}</p>
            </div>
        `).join("");

        return `
            <div class="space-y-3">
                <div class="p-3 bg-gradient-to-r from-sky-950 via-indigo-950 to-purple-950 rounded-2xl border border-sky-600/50">
                    <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">🌍 Өмірдегі, техникадағы және ғылымдағы қолданысы:</div>
                    <div class="text-sm font-extrabold text-white flex items-center gap-2">
                        <span>✨</span>
                        <span>«${targetData.name}» тақырыбы бойынша</span>
                    </div>
                </div>

                <div class="space-y-2.5">
                    ${itemsHtml}
                </div>
            </div>
        `;
    },

    getTopicFormulas(topic, queryText) {
        let topicId = topic ? topic.id : "";
        const q = (queryText || "").toLowerCase();
        if (!topicId) {
            if (q.includes("ромб")) topicId = "g8_t2";
            else if (q.includes("айқас")) topicId = "g10_t1";
            else if (q.includes("трапеция")) topicId = "g8_t3";
            else if (q.includes("параллелограмм")) topicId = "g8_t1";
            else if (q.includes("пифагор")) topicId = "g8_t5";
            else if (q.includes("параллелепипед")) topicId = "g10_t2";
            else if (q.includes("тетраэдр")) topicId = "g10_t3";
            else if (q.includes("вектор")) topicId = "g9_t1";
            else if (q.includes("шеңбер")) topicId = "g7_t3";
            else if (q.includes("эллипс")) topicId = "g8_t6";
            else topicId = "g8_t2";
        }

        const formulas = {
            "g7_t1": { title: "Үшбұрыштың түрлері", content: "• Бұрыштар қосындысы: $\\angle A + \\angle B + \\angle C = 180^\\circ$<br>• Үшбұрыш теңсіздігі: $|b - c| < a < b + c$<br>• Сыртқы бұрыш: $\\angle сырт = \\angle 1 + \\angle 2$" },
            "g7_t2": { title: "Үшбұрыштың тамаша нүктелері", content: "• Орта сызық: $m = \\frac{a}{2}$ (үшінші қабырғаға параллель)<br>• Центроид медианаларды $2:1$ қатынасында бөледі<br>• Медиана ұзындығы: $m_c = \\frac{1}{2}\\sqrt{2a^2+2b^2-c^2}$" },
            "g7_t3": { title: "Шеңбер мен дөңгелек", content: "• Диаметрі: $D = 2R$<br>• Шеңбер ұзындығы: $C = 2\\pi R = \\pi D$<br>• Дөңгелек ауданы: $S = \\pi R^2$<br>• Сектор ауданы: $S_{сек} = \\frac{\\pi R^2 \\alpha}{360^\\circ}$" },
            "g7_t4": { title: "Тіктөртбұрыш және шаршы", content: "• Тіктөртбұрыш ауданы: $S = ab$, периметрі: $P = 2(a + b)$<br>• Шаршы ауданы: $S = a^2 = \\frac{d^2}{2}$, диагоналі: $d = a\\sqrt{2}$" },
            "g7_t5": { title: "Түзу мен шеңбер орналасуы", content: "• $d > R$: ортақ нүктесіз (қиылыспайды)<br>• $d = R$: жанама түзу, $R \\perp l$<br>• $d < R$: қиюшы түзу (2 ортақ нүкте)" },
            "g7_t6": { title: "Екі шеңбер орналасуы", content: "• Сырттай жанасу: $d = R_1 + R_2$<br>• Іштей жанасу: $d = |R_1 - R_2|$<br>• Қиылысу: $|R_1 - R_2| < d < R_1 + R_2$" },
            "g8_t1": { title: "Параллелограмм", content: "• Ауданы: $S = ah = ab\\sin\\alpha = \\frac{1}{2}d_1 d_2 \\sin\\varphi$<br>• Диагональдар теңдігі: $d_1^2 + d_2^2 = 2(a^2 + b^2)$" },
            "g8_t2": { title: "Ромб және оның қасиеттері", content: "• Ауданы: $S = \\frac{1}{2}d_1 d_2 = ah = a^2\\sin\\alpha$<br>• Қабырға мен диагональдар: $4a^2 = d_1^2 + d_2^2$<br>• Іштей сызылған шеңбер радиусы: $r = \\frac{h}{2} = \\frac{d_1 d_2}{4a}$<br>• Периметрі: $P = 4a$" },
            "g8_t3": { title: "Трапеция", content: "• Орта сызығы: $m = \\frac{a+b}{2}$<br>• Ауданы: $S = mh = \\frac{a+b}{2}h$" },
            "g8_t4": { title: "Шеңберге сырттай/іштей төртбұрыштар", content: "• Іштей сызылған: $\\angle A + \\angle C = 180^\\circ$, Птолемей: $d_1 d_2 = ac + bd$<br>• Сырттай сызылған: $a + c = b + d$, Ауданы: $S = pr$" },
            "g8_t5": { title: "Тік бұрышты үшбұрыш және Пифагор", content: "• Пифагор теоремасы: $a^2 + b^2 = c^2$<br>• Гипотенузаға түскен биіктік: $h_c = \\frac{ab}{c}$, $h_c^2 = a_c b_c$<br>• Ауданы: $S = \\frac{1}{2}ab = \\frac{1}{2}ch_c$" },
            "g8_t6": { title: "Эллипс, гипербола, парабола", content: "• Эллипс: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($c^2 = a^2 - b^2$, $e = c/a < 1$)<br>• Гипербола: $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ ($y = \\pm \\frac{b}{a}x$, $e > 1$)<br>• Парабола: $y^2 = 2px$ ($F(p/2; 0)$, директриса $x = -p/2$)" },
            "g9_t1": { title: "Вектор ұғымы және амалдар", content: "• Үшбұрыш ережесі: $\\vec{AB} + \\vec{BC} = \\vec{AC}$<br>• Векторларды азайту: $\\vec{a} - \\vec{b} = \\vec{a} + (-\\vec{b})$<br>• Вектор теңсіздігі: $|\\vec{a}+\\vec{b}| \\le |\\vec{a}|+|\\vec{b}|$" },
            "g9_t2": { title: "Векторды санға көбейту", content: "• Модулі: $|k\\vec{a}| = |k| \\cdot |\\vec{a}|$<br>• Коллинеарлық шарты: $\\vec{b} = k\\vec{a}$" },
            "g9_t3": { title: "Скалярлық көбейтінді", content: "• Анықтамасы: $\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\varphi = x_1 x_2 + y_1 y_2$<br>• Перпендикулярлық шарты: $\\vec{a} \\cdot \\vec{b} = 0 \\iff x_1 x_2 + y_1 y_2 = 0$<br>• Бұрыш косинусы: $\\cos\\varphi = \\frac{x_1 x_2 + y_1 y_2}{\\sqrt{x_1^2+y_1^2}\\sqrt{x_2^2+y_2^2}}$" },
            "g9_t4": { title: "Векторлардың координаталары", content: "• Вектор координатасы: $\\vec{AB} = (x_2 - x_1; y_2 - y_1)$<br>• Ұзындығы: $|\\vec{a}| = \\sqrt{x^2 + y^2}$<br>• Кесінді ортасы: $x_0 = \\frac{x_1+x_2}{2}, y_0 = \\frac{y_1+y_2}{2}$" },
            "g10_t1": { title: "Кеңістіктегі түзулер (Айқас түзулер)", content: "• Айқас түзулер бұрышы: $0^\\circ < \\varphi \\le 90^\\circ$<br>• Ортақ перпендикуляры: $d$<br>• Ортақ нүкте саны: $0$" },
            "g10_t2": { title: "Параллелепипед", content: "• Диагоналі: $d = \\sqrt{a^2 + b^2 + c^2}$ ($d^2 = a^2 + b^2 + c^2$)<br>• Көлемі: $V = abc$<br>• Толық бетінің ауданы: $S_{тол} = 2(ab + bc + ac)$<br>• Бүйір бетінің ауданы: $S_{бүй} = 2c(a + b)$" },
            "g10_t3": { title: "Тетраэдр", content: "• Дұрыс тетраэдр биіктігі: $H = \\frac{a\\sqrt{6}}{3}$<br>• Көлемі: $V = \\frac{a^3\\sqrt{2}}{12}$<br>• Толық бетінің ауданы: $S_{тол} = a^2\\sqrt{3}$" }
        };

        const target = formulas[topicId] || formulas["g8_t2"];
        return `
            <div class="space-y-2.5 text-xs text-slate-200">
                <div class="p-3 bg-sky-950/80 rounded-2xl border border-sky-700/60">
                    <div class="text-[10px] text-sky-300 font-bold uppercase tracking-wider mb-1">💡 Формулалар жинағы:</div>
                    <div class="text-sm font-extrabold text-white">«${target.title}» негізгі теңдіктері</div>
                </div>
                <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 leading-relaxed space-y-1.5">
                    ${target.content}
                </div>
            </div>
        `;
    },

    getTopicHints(topic, queryText) {
        const title = topic ? topic.title : "Есеп";
        return `
            <div class="space-y-2.5 text-xs text-slate-200">
                <div class="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/60">
                    <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">🎯 Есеп шығаруға қадамдық тұспал (Нұсқаулық):</div>
                    <div class="text-sm font-extrabold text-white">«${title}» бойынша тиімді алгоритм</div>
                </div>
                <div class="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                    <p><strong>1-қадам (Сызба мен берілгені):</strong> Фигураның сызбасын дәптерге сызып, берілген барлық белгілі өлшемдерді (қабырға, диагональ, бұрыш, радиус) сызбаға белгілеңіз.</p>
                    <p><strong>2-қадам (Қасиетін таңдау):</strong> Қай қасиет немесе теорема белгісіз шамамен байланыстырады? (Мысалы, ромбта диагональдар берілсе — $4a^2 = d_1^2 + d_2^2$ немесе $S = \\frac{1}{2}d_1 d_2$).</p>
                    <p><strong>3-қадам (Есептеу):</strong> Формулаға сандарды қойып, белгісізді анықтаңыз.</p>
                    <div class="p-2 bg-sky-950/50 rounded-xl border border-sky-800/40 text-sky-200 text-[11px]">
                        💡 <strong>Кеңес:</strong> Әр есептің астындағы <em>«Жауабын талдау»</em> батырмасын басып, толық академиялық шешу жолын салыстыра аласыз!
                    </div>
                </div>
            </div>
        `;
    }
};

window.GeoAITutor = GeoAITutor;
