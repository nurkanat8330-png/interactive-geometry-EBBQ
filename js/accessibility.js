/**
 * ИНТЕРАКТИВТІ ГЕОМЕТРИЯ: ЕРЕКШЕ БІЛІМ БЕРУ ҚАЖЕТТІЛІКТЕРІ (ЕББҚ) БАСҚАРУ МОДУЛІ
 * 1. Көру қабілеті (Қаріп өлшемі, Жоғары контраст, Қазақша мәтінді дауыстау)
 * 2. Зейін және когнитивтік қолдау (Оқу сызғышы / Reading Ruler, Анимацияны 0.5x баяулату)
 * 3. Моторикалық басқару (Пернетақта навигациясы, Үлкейтілген сенсорлық батырмалар)
 * 4. Дислексия режимі (Арнайы қаріп, әріп және жоларалық интервалды кеңейту)
 */

const Accessibility = {
    settings: {
        fontSize: "normal",     // 'normal' | 'large' | 'xlarge'
        highContrast: false,    // true | false
        dyslexiaFont: false,    // true | false
        readingRuler: false,    // true | false
        bigTargets: false,      // true | false
        animSpeed: 1.0,         // 1.0 | 0.5 | 0.0
        speechRate: 0.95,       // 0.8 - 1.2
        selectedVoice: "daulet" // 'daulet' (kk-KZ-DauletNeural) | 'aigul' (kk-KZ-AigulNeural)
    },

    isSpeaking: false,
    synth: window.speechSynthesis || null,
    currentUtterance: null,
    rulerEl: null,
    voices: [],
    hasKazakhVoice: false,
    speechQueue: [],
    speechChunkIndex: 0,

    init() {
        this.loadSettings();
        this.createRulerElement();
        this.initVoices();
        this.bindEvents();
        this.applyAll();
        console.log("ЕББҚ (Accessibility) модулі сәтті іске қосылды.");
    },

    initVoices() {
        if (!this.synth) return;
        const update = () => {
            const list = this.synth.getVoices();
            if (list && list.length > 0) {
                this.voices = list;
                this.hasKazakhVoice = list.some(v => {
                    const str = (v.name + " " + (v.voiceURI || "") + " " + (v.lang || "")).toLowerCase();
                    return str.includes("daulet") || str.includes("aigul") || str.includes("kk") || str.includes("kaz");
                });
                this.updateVoiceStatusUI();
            }
        };
        update();
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = update;
        }
        setTimeout(update, 250);
        setTimeout(update, 750);
        setTimeout(update, 1500);
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem("geo_accessibility_settings");
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            } else {
                // Ескі шрифт режимі болса, соны көшіріп алу
                const oldFont = localStorage.getItem("geo_font_mode");
                if (oldFont) {
                    this.settings.fontSize = oldFont;
                }
            }
        } catch (e) {
            console.warn("ЕББҚ параметрлерін жүктеу қатесі:", e);
        }
    },

    saveSettings() {
        try {
            localStorage.setItem("geo_accessibility_settings", JSON.stringify(this.settings));
            localStorage.setItem("geo_font_mode", this.settings.fontSize);
        } catch (e) {
            console.warn("ЕББҚ параметрлерін сақтау қатесі:", e);
        }
    },

    applyAll() {
        this.applyFontSize(this.settings.fontSize, false);
        this.applyHighContrast(this.settings.highContrast, false);
        this.applyDyslexiaFont(this.settings.dyslexiaFont, false);
        this.applyReadingRuler(this.settings.readingRuler, false);
        this.applyBigTargets(this.settings.bigTargets, false);
        this.applyAnimSpeed(this.settings.animSpeed, false);
        this.updateModalControls();
    },

    // ==========================================
    // 1. КӨРУ ҚАБІЛЕТІ (ҚАРІП, КОНТРАСТ, ДАУЫСТАУ)
    // ==========================================
    cycleFontSize() {
        const next = this.settings.fontSize === "normal" ? "large" : (this.settings.fontSize === "large" ? "xlarge" : "normal");
        this.setFontSize(next);
    },

    setFontSize(mode) {
        this.settings.fontSize = mode;
        this.saveSettings();
        this.applyFontSize(mode, true);
    },

    applyFontSize(mode, notify = true) {
        const html = document.documentElement;
        html.classList.remove("accessibility-large", "accessibility-xlarge");

        if (mode === "large") {
            html.classList.add("accessibility-large");
        } else if (mode === "xlarge") {
            html.classList.add("accessibility-xlarge");
        }

        // Батырма индикаторларын жаңарту
        const badge = document.getElementById("header-font-badge");
        if (badge) {
            badge.textContent = mode === "normal" ? "A" : (mode === "large" ? "A+" : "A++");
        }
        this.updateModalControls();
    },

    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.saveSettings();
        this.applyHighContrast(this.settings.highContrast, true);
    },

    applyHighContrast(active) {
        const html = document.documentElement;
        if (active) {
            html.classList.add("high-contrast");
        } else {
            html.classList.remove("high-contrast");
        }
        this.updateModalControls();
    },

    // ==========================================
    // 2. ДЫБЫСТАП ОҚУ (TEXT-TO-SPEECH)
    // ==========================================
    setVoice(voiceKey) {
        this.settings.selectedVoice = voiceKey;
        this.saveSettings();
        this.updateModalControls();
        if (this.isSpeaking) {
            this.speakCurrentTopic();
        }
    },

    /**
     * Математикалық LaTeX және формулаларды табиғи қазақ тіліне аудару
     */
    translateMathFormulaToKazakh(formula) {
        if (!formula) return "";
        let f = formula.trim();

        // 1. Арнайы танымал формулалар
        f = f.replace(/c\^2\s*=\s*a\^2\s*\+\s*b\^2/gi, " цэ квадраты тең а квадраты қосу бэ квадраты ");
        f = f.replace(/d\^2\s*=\s*a\^2\s*\+\s*b\^2\s*\+\s*c\^2/gi, " дэ квадраты тең а квадраты қосу бэ квадраты қосу цэ квадраты ");
        f = f.replace(/d_?1\^2\s*\+\s*d_?2\^2\s*=\s*2\s*\(\s*a\^2\s*\+\s*b\^2\s*\)/gi, " д бір квадраты қосу д екі квадраты тең екі көбейту жақшада а квадраты қосу бэ квадраты ");
        f = f.replace(/V\s*=\s*a\s*\\cdot\s*b\s*\\cdot\s*c|V\s*=\s*abc/gi, " вэ тең а көбейту бэ көбейту цэ ");

        // 2. Бөлшектерді (\frac{A}{B}) қазақша оқу
        f = f.replace(/\\frac\{1\}\{2\}/g, " екіден бір ")
             .replace(/\\frac\{1\}\{3\}/g, " үштен бір ")
             .replace(/\\frac\{1\}\{4\}/g, " төрттен бір ")
             .replace(/\\frac\{2\}\{3\}/g, " үштен екі ")
             .replace(/\\frac\{3\}\{4\}/g, " төрттен үш ")
             .replace(/\\frac\{a\^3\\sqrt\{2\}\}\{12\}/g, " а кубы түбір астында екі бөлінген он екі ")
             .replace(/\\frac\{a\\sqrt\{2\}\}\{2\}/g, " а түбір астында екі бөлінген екі ")
             .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, " $1 бөлінген $2 ");

        // 3. Түбірлер (\sqrt)
        f = f.replace(/\\sqrt\[3\]\{([^}]+)\}/g, " үшінші дәрежелі түбір астында $1 ")
             .replace(/\\sqrt\{3\}/g, " түбір астында үш ")
             .replace(/\\sqrt\{2\}/g, " түбір астында екі ")
             .replace(/\\sqrt\{([^}]+)\}/g, " түбір астында $1 ");

        // 4. Градустар және бұрыштар
        f = f.replace(/180\s*\^?\\circ/g, " жүз сексен градус ")
             .replace(/90\s*\^?\\circ/g, " тоқсан градус ")
             .replace(/60\s*\^?\\circ/g, " алпыс градус ")
             .replace(/45\s*\^?\\circ/g, " қырық бес градус ")
             .replace(/30\s*\^?\\circ/g, " отыз градус ")
             .replace(/360\s*\^?\\circ/g, " үш жүз алпыс градус ")
             .replace(/\^?\\circ/g, " градус ");

        // 5. Дәрежелер (^)
        f = f.replace(/\^2/g, " квадраты ")
             .replace(/\^\{2\}/g, " квадраты ")
             .replace(/\^3/g, " кубы ")
             .replace(/\^\{3\}/g, " кубы ")
             .replace(/\^\{([^}]+)\}/g, " $1 дәрежесі ")
             .replace(/\^([0-9a-zA-Z]+)/g, " $1 дәрежесі ");

        // 6. Индекстер (_)
        f = f.replace(/_\{тол(ық)?\}/gi, " толық ")
             .replace(/_\{бүйір\}/gi, " бүйір ")
             .replace(/_\{таб(ан)?\}/gi, " табан ")
             .replace(/_\{қима\}/gi, " қима ")
             .replace(/_\{([^}]+)\}/g, " $1 ")
             .replace(/_([0-9a-zA-Z]+)/g, " $1 ");

        // 7. Тригонометриялық функциялар
        f = f.replace(/\\sin\b/g, " синус ")
             .replace(/\\cos\b/g, " косинус ")
             .replace(/\\tan\b|\\tg\b/g, " тангенс ")
             .replace(/\\cot\b|\\ctg\b/g, " котангенс ");

        // 8. Геометриялық белгілер мен логика
        f = f.replace(/\\triangle\s*([A-Za-z]+)/g, " $1 үшбұрышы ")
             .replace(/\\triangle/g, " үшбұрыш ")
             .replace(/\\angle\s*([A-Za-z0-9]+)/g, " $1 бұрышы ")
             .replace(/\\angle/g, " бұрыш ")
             .replace(/\\parallel/g, " параллель ")
             .replace(/\\perp/g, " перпендикуляр ")
             .replace(/\\cap/g, " қиылысу ")
             .replace(/\\cup/g, " бірігу ")
             .replace(/\\in/g, " тиісті ")
             .replace(/\\notin/g, " тиісті емес ")
             .replace(/\\subset/g, " ішкі жиыны ")
             .replace(/\\Rightarrow/g, " осыдан шығады ")
             .replace(/\\Leftrightarrow/g, " пара-пар ");

        // 9. Грек әріптері
        f = f.replace(/\\alpha\b/g, " альфа ")
             .replace(/\\beta\b/g, " бета ")
             .replace(/\\gamma\b/g, " гамма ")
             .replace(/\\varphi\b|\\phi\b/g, " фи ")
             .replace(/\\pi\b/g, " пи ")
             .replace(/\\lambda\b/g, " лямбда ")
             .replace(/\\delta\b/g, " дельта ");

        // 10. Арифметикалық және математикалық амалдар
        f = f.replace(/\\cdot/g, " көбейту ")
             .replace(/\\times/g, " көбейту ")
             .replace(/\\neq/g, " тең емес ")
             .replace(/\\approx/g, " жуықтап тең ")
             .replace(/\\le\b|\\leq\b/g, " кіші немесе тең ")
             .replace(/\\ge\b|\\geq\b/g, " үлкен немесе тең ")
             .replace(/\\pm/g, " плюс минус ");

        // Қалған бэкслештерді алып тастау
        f = f.replace(/\\[a-zA-Z]+/g, " ");

        // Қарапайым математикалық таңбалар
        f = f.replace(/=/g, " тең ")
             .replace(/\+/g, " қосу ")
             .replace(/>/g, " үлкен ")
             .replace(/</g, " кіші ")
             .replace(/\*/g, " көбейту ");

        // Кесінділерді қазақша дыбыстау
        f = f.replace(/AA1/gi, " А А бір ")
             .replace(/BB1/gi, " Бэ Бэ бір ")
             .replace(/CC1/gi, " Цэ Цэ бір ")
             .replace(/DD1/gi, " Дэ Дэ бір ")
             .replace(/A1/gi, " А бір ")
             .replace(/B1/gi, " Бэ бір ")
             .replace(/C1/gi, " Цэ бір ")
             .replace(/D1/gi, " Дэ бір ")
             .replace(/ABCD/gi, " А Бэ Цэ Дэ ")
             .replace(/AB/gi, " А Бэ ")
             .replace(/BC/gi, " Бэ Цэ ")
             .replace(/CD/gi, " Цэ Дэ ")
             .replace(/AD/gi, " А Дэ ")
             .replace(/AC/gi, " А Цэ ")
             .replace(/BD/gi, " Бэ Дэ ");

        // Жекелеген негізгі латын әріптерін қазақша оқу
        const letterMap = {
            'A': ' А ', 'B': ' Бэ ', 'C': ' Цэ ', 'D': ' Дэ ', 'E': ' Е ',
            'F': ' Эф ', 'H': ' Аш ', 'K': ' Ка ', 'M': ' Эм ', 'N': ' Эн ',
            'O': ' О ', 'P': ' Пэ ', 'R': ' Эр ', 'S': ' Эс ', 'V': ' Вэ ',
            'a': ' а ', 'b': ' бэ ', 'c': ' цэ ', 'd': ' дэ ', 'h': ' аш ',
            'r': ' эр ', 'x': ' икс ', 'y': ' игрек ', 'z': ' зет '
        };

        for (const [letter, sound] of Object.entries(letterMap)) {
            const re = new RegExp(`\\b${letter}\\b`, 'g');
            f = f.replace(re, sound);
        }

        f = f.replace(/\(/g, " жақшада ").replace(/\)/g, " жақша жабылды ");
        return f;
    },

    extractMathTextFromDOM(el) {
        if (!el) return "";
        const clone = el.cloneNode(true);
        const katexNodes = clone.querySelectorAll(".katex");
        katexNodes.forEach(kn => {
            const ann = kn.querySelector('annotation[encoding="application/x-tex"]');
            if (ann && ann.textContent) {
                const textNode = document.createTextNode(" $" + ann.textContent.trim() + "$ ");
                kn.parentNode.replaceChild(textNode, kn);
            }
        });
        return clone.textContent || "";
    },

    speakCurrentTopic() {
        if (!this.synth) {
            alert("Бұл браузерде дауыстап оқу (SpeechSynthesis) қолдау көрсетілмейді.");
            return;
        }

        if (this.isSpeaking) {
            this.stopSpeech();
            return;
        }

        // 1. Таза мәтінді формулалармен жинау
        let textToRead = "";

        if (typeof App !== "undefined" && App.currentTopic) {
            const t = App.currentTopic;
            textToRead += "Тақырып: " + t.title + ".\n\n";
            if (t.shortDesc) {
                textToRead += t.shortDesc + ".\n\n";
            }
            if (t.theory) {
                textToRead += "Тақырып түсіндірмесі: " + t.theory + ".\n\n";
            }
            if (t.definitions && t.definitions.length > 0) {
                textToRead += "Анықтамалар: " + t.definitions.map(d => d.term + ". " + d.content).join(".\n\n") + ".\n\n";
            }
            if (t.properties && t.properties.length > 0) {
                textToRead += "Қасиеттері мен теоремалары: " + t.properties.join(".\n\n") + ".\n\n";
            }
        } else {
            const titleEl = document.getElementById("topic-title");
            const theoryEl = document.getElementById("topic-theory-content");
            const defsEl = document.getElementById("topic-definitions-container");
            const propsEl = document.getElementById("topic-properties-container");

            if (titleEl && titleEl.textContent) {
                textToRead += "Тақырып: " + titleEl.textContent.trim() + ".\n\n";
            }
            if (theoryEl) {
                textToRead += "Түсіндірме: " + this.extractMathTextFromDOM(theoryEl) + ".\n\n";
            }
            if (defsEl) {
                textToRead += "Анықтамалар: " + this.extractMathTextFromDOM(defsEl) + ".\n\n";
            }
            if (propsEl) {
                textToRead += "Қасиеттері: " + this.extractMathTextFromDOM(propsEl) + ".\n\n";
            }
        }

        if (!textToRead.trim()) {
            textToRead = "Дара Геометрия оқу кешені. 7-ден 10-сыныпқа дейінгі толық инклюзивті планиметрия мен стереометрия курсы.";
        }

        // 2. Қазақ тіліндегі дауыстарды табу
        const voices = this.voices && this.voices.length > 0 ? this.voices : this.synth.getVoices();
        const selected = this.settings.selectedVoice || "daulet";
        let targetVoice = null;

        if (selected === "daulet") {
            targetVoice = voices.find(v => {
                const n = (v.name + " " + (v.voiceURI || "")).toLowerCase();
                return n.includes("daulet") || n.includes("дәулет");
            });
            if (!targetVoice) {
                targetVoice = voices.find(v => {
                    const l = (v.lang || "").toLowerCase();
                    const n = v.name.toLowerCase();
                    return (l.includes("kk") || l.includes("kaz")) && (n.includes("male") || !n.includes("female"));
                });
            }
        } else {
            targetVoice = voices.find(v => {
                const n = (v.name + " " + (v.voiceURI || "")).toLowerCase();
                return n.includes("aigul") || n.includes("айгүл");
            });
            if (!targetVoice) {
                targetVoice = voices.find(v => {
                    const l = (v.lang || "").toLowerCase();
                    const n = v.name.toLowerCase();
                    return (l.includes("kk") || l.includes("kaz")) && n.includes("female");
                });
            }
        }

        if (!targetVoice) {
            targetVoice = voices.find(v => {
                const l = (v.lang || "").toLowerCase();
                return l.includes("kk") || l.includes("kaz");
            });
        }

        const isRealKazakhVoice = !!targetVoice;

        // 3. Формулаларды қазақша оқып, мәтінді реттеу
        const fullCleanedText = this.cleanMathTextForSpeech(textToRead, !isRealKazakhVoice);

        // 4. Сөйлемдерге бөліп оқу
        const rawSentences = fullCleanedText.split(/(?<=[.!?])\s+/);
        this.speechQueue = [];
        let currentChunk = "";

        for (const s of rawSentences) {
            if (!s.trim()) continue;
            if ((currentChunk + " " + s).length < 180) {
                currentChunk = (currentChunk ? currentChunk + " " : "") + s.trim();
            } else {
                if (currentChunk) this.speechQueue.push(currentChunk);
                currentChunk = s.trim();
            }
        }
        if (currentChunk) {
            this.speechQueue.push(currentChunk);
        }

        if (this.speechQueue.length === 0) {
            this.speechQueue = [fullCleanedText];
        }

        this.speechChunkIndex = 0;
        this.synth.cancel();
        this.isSpeaking = true;
        this.updateSpeakButtons(true);

        const voicePitch = selected === "daulet" ? 0.94 : 1.10;
        const voiceRate = selected === "daulet" ? (this.settings.speechRate || 0.90) : (this.settings.speechRate || 0.95);
        const voiceLang = targetVoice?.lang || "kk-KZ";

        this.playSpeechChunks(targetVoice, voiceLang, voicePitch, voiceRate);
    },

    playSpeechChunks(targetVoice, lang, pitch, rate) {
        if (!this.isSpeaking || this.speechChunkIndex >= this.speechQueue.length) {
            this.stopSpeech();
            return;
        }

        const text = this.speechQueue[this.speechChunkIndex];
        const utterance = new SpeechSynthesisUtterance(text);

        if (targetVoice) {
            utterance.voice = targetVoice;
        }
        utterance.lang = lang;
        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onend = () => {
            if (!this.isSpeaking) return;
            this.speechChunkIndex++;
            if (this.speechChunkIndex < this.speechQueue.length) {
                this.playSpeechChunks(targetVoice, lang, pitch, rate);
            } else {
                this.stopSpeech();
            }
        };

        utterance.onerror = (e) => {
            console.warn("TTS chunk error:", e);
            if (!this.isSpeaking) return;
            this.speechChunkIndex++;
            if (this.speechChunkIndex < this.speechQueue.length) {
                this.playSpeechChunks(targetVoice, lang, pitch, rate);
            } else {
                this.stopSpeech();
            }
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    },

    stopSpeech() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.speechQueue = [];
        this.speechChunkIndex = 0;
        this.isSpeaking = false;
        this.updateSpeakButtons(false);
    },

    /**
     * Мәтінді дауыстап оқу үшін барынша табиғи сөйлемге келтіру:
     * - Алдымен барлық LaTeX / KaTeX формулаларын қазақ сөздеріне айналдырады
     * - Тыныс белгілері мен артық кодтарды сүзіп, таза адам сөйлеміне келтіреді
     */
    cleanMathTextForSpeech(text, isFallback = false) {
        if (!text) return "";

        let clean = text;

        // 1. Дисплейлік ($$...$$) және қатарлық ($...$) формулаларды қазақ сөздеріне айналдыру
        clean = clean.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
            return " Формуласы: " + this.translateMathFormulaToKazakh(formula) + ". ";
        });

        clean = clean.replace(/\$([^\$\n\r]+?)\$/g, (match, formula) => {
            return " " + this.translateMathFormulaToKazakh(formula) + " ";
        });

        // 2. HTML блок тегтерін нүктемен ажырату
        clean = clean.replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, ". ");
        clean = clean.replace(/<br\s*\/?>/gi, ". ");
        clean = clean.replace(/<[^>]*>/g, " ");

        // 3. Бөлім тақырыптары мен техникалық маркерлерді тазарту
        clean = clean.replace(/1\.\s*Тақырып түсіндірмесі[^\n\.]*/gi, "Тақырып түсіндірмесі. ");
        clean = clean.replace(/\d+\.\d+\.?/g, " ");
        clean = clean.replace(/[•❖✓✨📖💡→←★▲■▶]/g, " ");

        // 4. Артық тыныс белгілерін тазарту (TTS "жақша", "дефис" деп айтпауы үшін)
        clean = clean.replace(/[«»""''`’“”]/g, " ");
        clean = clean.replace(/[\/\\]/g, " ");
        clean = clean.replace(/[#@%&*_~|]/g, " ");
        clean = clean.replace(/[\u2013\u2014\u2212\-]/g, " ");
        clean = clean.replace(/[:;]/g, ", ");
        clean = clean.replace(/[\(\[\{]/g, ", ");
        clean = clean.replace(/[\)\]\}]/g, ", ");

        // Нүктелерді реттеу
        clean = clean.replace(/\.{2,}/g, ". ");
        clean = clean.replace(/[!?]/g, ". ");
        clean = clean.replace(/,(\s*,)+/g, ", ");
        clean = clean.replace(/,\s*\./g, ". ");

        // 5. Қажет болса, fallback транслитерация
        if (isFallback) {
            clean = clean
                .replace(/Ә/g, "Э").replace(/ә/g, "э")
                .replace(/І/g, "И").replace(/і/g, "и")
                .replace(/Ң/g, "Нг").replace(/ң/g, "нг")
                .replace(/Ғ/g, "Г").replace(/ғ/g, "г")
                .replace(/Ү/g, "У").replace(/ү/g, "у")
                .replace(/Ұ/g, "У").replace(/ұ/g, "у")
                .replace(/Қ/g, "К").replace(/қ/g, "к")
                .replace(/Ө/g, "О").replace(/ө/g, "о")
                .replace(/Һ/g, "Х").replace(/һ/g, "х");
        }

        clean = clean.replace(/\s+/g, " ").trim();

        return clean;
    },

    updateSpeakButtons(active) {
        const btns = document.querySelectorAll(".accessibility-speak-btn");
        btns.forEach(btn => {
            if (active) {
                btn.innerHTML = `<span>⏹</span> <span>Тоқтату</span>`;
                btn.classList.add("bg-rose-600", "text-white", "animate-pulse");
                btn.classList.remove("bg-sky-600", "text-sky-100");
            } else {
                btn.innerHTML = `<span>🔊</span> <span>Дыбыстап оқу</span>`;
                btn.classList.remove("bg-rose-600", "text-white", "animate-pulse");
                btn.classList.add("bg-sky-600", "text-sky-100");
            }
        });
    },

    // ==========================================
    // 3. ЗЕЙІН ЖӘНЕ КОГНИТИВТІК (ОҚУ СЫЗҒЫШЫ, АНИМАЦИЯ)
    // ==========================================
    createRulerElement() {
        if (document.getElementById("reading-ruler")) {
            this.rulerEl = document.getElementById("reading-ruler");
            return;
        }
        const ruler = document.createElement("div");
        ruler.id = "reading-ruler";
        ruler.className = "reading-ruler-overlay hidden";
        document.body.appendChild(ruler);
        this.rulerEl = ruler;
    },

    toggleReadingRuler() {
        this.settings.readingRuler = !this.settings.readingRuler;
        this.saveSettings();
        this.applyReadingRuler(this.settings.readingRuler, true);
    },

    applyReadingRuler(active) {
        if (!this.rulerEl) this.createRulerElement();
        if (active) {
            this.rulerEl.classList.remove("hidden");
        } else {
            this.rulerEl.classList.add("hidden");
        }
        this.updateModalControls();
    },

    setAnimSpeed(speed) {
        this.settings.animSpeed = speed;
        this.saveSettings();
        this.applyAnimSpeed(speed, true);
    },

    applyAnimSpeed(speed) {
        if (typeof GeoAnimations !== "undefined" && GeoAnimations.setSpeed) {
            GeoAnimations.setSpeed(speed);
        }
        this.updateModalControls();
    },

    // ==========================================
    // 4. ДИСЛЕКСИЯ ЖӘНЕ МОТОРИКА (ШРИФТ, ҮЛКЕН ТҮЙМЕЛЕР)
    // ==========================================
    toggleDyslexia() {
        this.settings.dyslexiaFont = !this.settings.dyslexiaFont;
        this.saveSettings();
        this.applyDyslexiaFont(this.settings.dyslexiaFont, true);
    },

    applyDyslexiaFont(active) {
        const html = document.documentElement;
        if (active) {
            html.classList.add("dyslexia-mode");
        } else {
            html.classList.remove("dyslexia-mode");
        }
        this.updateModalControls();
    },

    toggleBigTargets() {
        this.settings.bigTargets = !this.settings.bigTargets;
        this.saveSettings();
        this.applyBigTargets(this.settings.bigTargets, true);
    },

    applyBigTargets(active) {
        const html = document.documentElement;
        if (active) {
            html.classList.add("big-targets-mode");
        } else {
            html.classList.remove("big-targets-mode");
        }
        this.updateModalControls();
    },

    // ==========================================
    // ОҚИҒАЛАРДЫ БАҚЫЛАУ (EVENT LISTENERS & SHORTCUTS)
    // ==========================================
    bindEvents() {
        // Оқу сызғышының тышқан/саусақ соңынан еруі
        window.addEventListener("mousemove", (e) => {
            if (this.settings.readingRuler && this.rulerEl) {
                this.rulerEl.style.top = `${e.clientY - 26}px`;
            }
        });

        window.addEventListener("touchmove", (e) => {
            if (this.settings.readingRuler && this.rulerEl && e.touches.length > 0) {
                this.rulerEl.style.top = `${e.touches[0].clientY - 26}px`;
            }
        }, { passive: true });

        // Пернетақта шорткаттары (Alt+A, Alt+S, Alt+R, Alt+C, Escape)
        window.addEventListener("keydown", (e) => {
            if (e.altKey && (e.key === "a" || e.key === "A" || e.key === "ф" || e.key === "Ф")) {
                e.preventDefault();
                this.toggleModal();
            } else if (e.altKey && (e.key === "s" || e.key === "S" || e.key === "ы" || e.key === "Ы")) {
                e.preventDefault();
                this.speakCurrentTopic();
            } else if (e.altKey && (e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К")) {
                e.preventDefault();
                this.toggleReadingRuler();
            } else if (e.altKey && (e.key === "c" || e.key === "C" || e.key === "с" || e.key === "С")) {
                e.preventDefault();
                this.toggleHighContrast();
            } else if (e.key === "Escape") {
                this.closeModal();
                if (this.isSpeaking) this.stopSpeech();
            }
        });
    },

    // ==========================================
    // МОДАЛДЫ ТЕРЕЗЕНІ БАСҚАРУ ЖӘНЕ СИНХРОНДАУ
    // ==========================================
    toggleModal() {
        const modal = document.getElementById("accessibility-modal");
        if (modal && !modal.classList.contains("hidden")) {
            this.closeModal();
        } else {
            this.openModal();
        }
    },

    openModal() {
        const modal = document.getElementById("accessibility-modal");
        if (modal) {
            modal.classList.remove("hidden");
            this.updateModalControls();
            document.body.style.overflow = "hidden";
        }
    },

    closeModal() {
        const modal = document.getElementById("accessibility-modal");
        if (modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
    },

    resetAll() {
        this.stopSpeech();
        this.settings = {
            fontSize: "normal",
            highContrast: false,
            dyslexiaFont: false,
            readingRuler: false,
            bigTargets: false,
            animSpeed: 1.0,
            speechRate: 0.95,
            selectedVoice: "daulet"
        };
        this.saveSettings();
        this.applyAll();
    },

    updateModalControls() {
        // 1. Шрифт түймелері
        const fNormal = document.getElementById("acc-font-normal");
        const fLarge = document.getElementById("acc-font-large");
        const fXlarge = document.getElementById("acc-font-xlarge");
        if (fNormal && fLarge && fXlarge) {
            [fNormal, fLarge, fXlarge].forEach(el => el.classList.remove("ring-2", "ring-sky-400", "bg-sky-600", "text-white"));
            if (this.settings.fontSize === "normal") fNormal.classList.add("ring-2", "ring-sky-400", "bg-sky-600", "text-white");
            if (this.settings.fontSize === "large") fLarge.classList.add("ring-2", "ring-sky-400", "bg-sky-600", "text-white");
            if (this.settings.fontSize === "xlarge") fXlarge.classList.add("ring-2", "ring-sky-400", "bg-sky-600", "text-white");
        }

        // 2. Жоғары контраст қосқышы
        const togContrast = document.getElementById("acc-toggle-contrast");
        if (togContrast) togContrast.checked = this.settings.highContrast;

        // 3. Дислексия қосқышы
        const togDyslexia = document.getElementById("acc-toggle-dyslexia");
        if (togDyslexia) togDyslexia.checked = this.settings.dyslexiaFont;

        // 4. Оқу сызғышы қосқышы
        const togRuler = document.getElementById("acc-toggle-ruler");
        if (togRuler) togRuler.checked = this.settings.readingRuler;

        // 5. Үлкен түймелер қосқышы
        const togBigTargets = document.getElementById("acc-toggle-bigtargets");
        if (togBigTargets) togBigTargets.checked = this.settings.bigTargets;

        // 6. Анимация жылдамдығы
        const spNormal = document.getElementById("acc-speed-1");
        const spHalf = document.getElementById("acc-speed-05");
        const spPause = document.getElementById("acc-speed-0");
        if (spNormal && spHalf && spPause) {
            [spNormal, spHalf, spPause].forEach(el => el.classList.remove("ring-2", "ring-emerald-400", "bg-emerald-600", "text-white"));
            if (this.settings.animSpeed === 1.0) spNormal.classList.add("ring-2", "ring-emerald-400", "bg-emerald-600", "text-white");
            if (this.settings.animSpeed === 0.5) spHalf.classList.add("ring-2", "ring-emerald-400", "bg-emerald-600", "text-white");
            if (this.settings.animSpeed === 0.0) spPause.classList.add("ring-2", "ring-emerald-400", "bg-emerald-600", "text-white");
        }

        // 7. Диктор дауысын таңдау (Дәулет / Айгүл)
        const vDaulet = document.getElementById("acc-voice-daulet");
        const vAigul = document.getElementById("acc-voice-aigul");
        if (vDaulet && vAigul) {
            [vDaulet, vAigul].forEach(el => {
                el.classList.remove("ring-2", "ring-sky-400", "bg-sky-950/60", "border-sky-500/80");
                el.classList.add("bg-slate-900/90", "border-slate-800");
            });
            if ((this.settings.selectedVoice || "daulet") === "daulet") {
                vDaulet.classList.add("ring-2", "ring-sky-400", "bg-sky-950/60", "border-sky-500/80");
                vDaulet.classList.remove("border-slate-800", "bg-slate-900/90");
            } else {
                vAigul.classList.add("ring-2", "ring-sky-400", "bg-sky-950/60", "border-sky-500/80");
                vAigul.classList.remove("border-slate-800", "bg-slate-900/90");
            }
        }

        this.updateVoiceStatusUI();
    },

    updateVoiceStatusUI() {
        const statusEl = document.getElementById("acc-voice-status");
        if (!statusEl) return;
        if (this.hasKazakhVoice) {
            statusEl.innerHTML = `
                <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="font-medium">Құрылғыңызда қазақша нейродауыс (kk-KZ) сәтті белсендірілген.</span>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed space-y-1.5">
                    <div class="font-bold flex items-center gap-1.5 text-amber-300">
                        <span>ℹ️</span> <span>Таза қазақша «Дәулет» диктор дауысын қосу жолы:</span>
                    </div>
                    <div class="text-slate-300">
                        Бұл сайтты <strong>Microsoft Edge</strong> браузерінен ашсаңыз, ресми <strong>Microsoft Daulet Online (Natural)</strong> дауысы автоматты түрде қосылады. Немесе Windows баптауынан қазақ тілінің «Речь/Сөйлеу» пакетін қосыңыз.
                    </div>
                </div>
            `;
        }
    }
};

// Автоматты іске қосу
if (typeof window !== "undefined") {
    window.Accessibility = Accessibility;
}
