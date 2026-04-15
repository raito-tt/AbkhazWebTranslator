document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
            if (target === 'settings') loadSettings();
        });
    });
    
    // Добавляем обработку Enter для всех полей ввода
    const directInput = document.getElementById('direct-num');
    const ordInput = document.getElementById('ord-num');
    const revInput = document.getElementById('rev-text');
    
    if (directInput) {
        directInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') translateDirect();
        });
    }
    
    if (ordInput) {
        ordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') translateOrdinal();
        });
    }
    
    if (revInput) {
        revInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') translateReverse();
        });
    }
});

const AbkhazNumberConverter = {
    ANIMATE_1_19: {},
    INANIMATE_1_19: {},
    TWENTIES: {},
    HUNDREDS: {},
    THOUSANDS: {},
    WORD_TO_VALUE: {},
    ORDINAL_EXCEPTIONS: {},
    
    init() {
        this.ANIMATE_1_19 = {
            "1": "аӡәык", "2": "ҩыџьа", "3": "хҩык", "4": "ԥшьҩык",
            "5": "хәҩык", "6": "фҩык", "7": "быжьҩык", "8": "ааҩык",
            "9": "жәҩык", "10": "жәаҩык", "11": "жәеизаҩык", "12": "жәаҩаҩык",
            "13": "жәахаҩык", "14": "жәиԥшьҩык", "15": "жәохәҩык",
            "16": "жәафҩык", "17": "жәибжьҩык", "18": "жәааҩык", "19": "зеижәҩык"
        };
        
        this.INANIMATE_1_19 = {
            "1": "акы", "2": "ҩба", "3": "хԥа", "4": "ԥшьба",
            "5": "хәба", "6": "фба", "7": "быжьба", "8": "ааба",
            "9": "жәба", "10": "жәаба", "11": "жәеиза", "12": "жәаҩа",
            "13": "жәаха", "14": "жәиԥшь", "15": "жәохә",
            "16": "жәаф", "17": "жәибжь", "18": "жәаа", "19": "зеижә"
        };
        
        this.TWENTIES = {
            "20": "ҩажәа", "30": "ҩажәи жәаба", "40": "ҩынҩажәа",
            "50": "ҩажәи ҩажәи жәаба", "60": "хынҩажәа",
            "70": "хынҩажәи жәаба", "80": "ԥшьынҩажәа",
            "90": "ԥшьынҩажәи жәаба"
        };
        
        this.HUNDREDS = {
            "100": "шәкы", "200": "ҩышә", "300": "хышә", "400": "ԥшьышә",
            "500": "хәышә", "600": "фышә", "700": "быжьшәы", "800": "аашәы", "900": "жәшәы"
        };
        
        this.THOUSANDS = {
            "1000": "зқьы", "2000": "ҩ-нызқь", "3000": "х-нызқь", "4000": "ԥшь-нызқь",
            "5000": "хә-нызқь", "6000": "ф-нызқь", "7000": "быжь-нызқь",
            "8000": "аа-нызқь", "9000": "жә-нызқь"
        };
        
        this.ORDINAL_EXCEPTIONS = {
            "1": "актәи",
            "2": "аҩбатәи",
            "3": "ахҧатәи",
            "4": "аԥшьбатәи",
            "5": "ахәбатәи",
            "6": "афбатәи",
            "7": "абыжьбатәи",
            "8": "аабатәи",
            "9": "ажәбатәи",
            "10": "ажәабатәи"
        };
        
        this.buildWordToValue();
    },
    
    buildWordToValue() {
        this.WORD_TO_VALUE = {};
        
        for (let [val, word] of Object.entries(this.INANIMATE_1_19)) {
            this.WORD_TO_VALUE[word] = parseInt(val);
        }
        for (let [val, word] of Object.entries(this.ANIMATE_1_19)) {
            this.WORD_TO_VALUE[word] = parseInt(val);
        }
        for (let [val, word] of Object.entries(this.TWENTIES)) {
            this.WORD_TO_VALUE[word] = parseInt(val);
        }
        for (let [val, word] of Object.entries(this.HUNDREDS)) {
            this.WORD_TO_VALUE[word] = parseInt(val);
        }
        for (let [val, word] of Object.entries(this.THOUSANDS)) {
            this.WORD_TO_VALUE[word] = parseInt(val);
        }
        
        for (let [val, word] of Object.entries(this.THOUSANDS)) {
            if (word.endsWith("ы")) {
                this.WORD_TO_VALUE[word.slice(0, -1) + "и"] = parseInt(val);
            } else if (word.endsWith("ь")) {
                this.WORD_TO_VALUE[word + "и"] = parseInt(val);
            }
        }
        
        for (let [val, word] of Object.entries(this.HUNDREDS)) {
            if (word === "шәкы") {
                this.WORD_TO_VALUE["шәи"] = 100;
            } else if (word.endsWith("ы")) {
                this.WORD_TO_VALUE[word.slice(0, -1) + "и"] = parseInt(val);
            } else if (word.endsWith("ә")) {
                this.WORD_TO_VALUE[word + "и"] = parseInt(val);
            }
        }
        
        for (let [val, word] of Object.entries(this.TWENTIES)) {
            if (word.endsWith("а")) {
                this.WORD_TO_VALUE[word.slice(0, -1) + "и"] = parseInt(val);
            }
        }
        
        for (let [val, word] of Object.entries(this.INANIMATE_1_19)) {
            if (word.endsWith("а")) {
                this.WORD_TO_VALUE[word.slice(0, -1) + "и"] = parseInt(val);
            }
        }
        
        this.WORD_TO_VALUE["нызык"] = 1000;
        this.WORD_TO_VALUE["хы"] = 1000;
        this.WORD_TO_VALUE["нызқь"] = 1000;
        this.WORD_TO_VALUE["нызқьи"] = 1000;
    },
    
    _translatePositive(n, animate) {
        if (n === 0) return "";
        
        let parts = [];
        
        const thousands = Math.floor(n / 1000);
        let rem = n % 1000;
        
        if (thousands > 0) {
            let thousandWord = null;
            
            if (this.THOUSANDS[thousands * 1000]) {
                thousandWord = this.THOUSANDS[thousands * 1000];
            } else {
                const thousandsPart = this._translatePositive(thousands, false);
                thousandWord = thousandsPart + " нызқь";
            }
            
            if (rem > 0) {
                if (thousandWord.endsWith("ы")) {
                    thousandWord = thousandWord.slice(0, -1) + "и";
                } else if (thousandWord.endsWith("ь")) {
                    thousandWord = thousandWord + "и";
                }
            }
            
            parts.push(thousandWord);
        }
        
        const hundreds = Math.floor(rem / 100);
        rem = rem % 100;
        
        if (hundreds > 0) {
            let hundredWord = this.HUNDREDS[hundreds * 100];
            if (hundredWord) {
                if (rem > 0) {
                    if (hundreds === 1) {
                        hundredWord = "шәи";
                    } else {
                        if (hundredWord.endsWith("ә")) {
                            hundredWord = hundredWord + "и";
                        } else if (hundredWord.endsWith("ы")) {
                            hundredWord = hundredWord.slice(0, -1) + "и";
                        }
                    }
                }
                parts.push(hundredWord);
            }
        }
        
        if (rem > 0) {
            if (rem < 20) {
                parts.push(animate ? this.ANIMATE_1_19[rem] : this.INANIMATE_1_19[rem]);
            } else {
                const twenties = Math.floor(rem / 20) * 20;
                const units = rem % 20;
                let twentiesWord = this.TWENTIES[twenties];
                
                if (!twentiesWord) {
                    parts.push(rem.toString());
                } else if (units === 0) {
                    parts.push(twentiesWord);
                } else {
                    const unitWord = animate ? this.ANIMATE_1_19[units] : this.INANIMATE_1_19[units];
                    let twentiesConj = twentiesWord;
                    if (twentiesConj.endsWith("а")) {
                        twentiesConj = twentiesConj.slice(0, -1) + "и";
                    }
                    parts.push(`${twentiesConj} ${unitWord}`);
                }
            }
        }
        
        return parts.join(" ");
    },
    
    _makeOrdinal(words, originalNumber) {
        if (!words || words === "") return words;
        
        // Проверка исключений для чисел 1-10
        if (originalNumber >= 1 && originalNumber <= 10) {
            return this.ORDINAL_EXCEPTIONS[originalNumber.toString()];
        }
        
        // Для составных чисел
        let parts = words.split(" ");
        
        // Обрабатываем каждую часть, убирая "а" в начале если нужно
        for (let i = 0; i < parts.length; i++) {
            let word = parts[i];
            
            if (i > 0 && word.startsWith("а")) {
                word = word.slice(1);
                parts[i] = word;
            }
        }
        
        // Обрабатываем последнее слово
        let lastWord = parts[parts.length - 1];
        
        if (lastWord.endsWith("ы")) {
            lastWord = lastWord.slice(0, -1);
        } else if (lastWord.endsWith("а")) {
            lastWord = lastWord.slice(0, -1);
        }
        
        parts[parts.length - 1] = lastWord + "тәи";
        
        if (!parts[0].startsWith("а")) {
            parts[0] = "а" + parts[0];
        }
        
        let result = parts.join(" ");
        
        // Специальная обработка для тысяч: заменяем "тәи" на "и" для тысячных долей
        result = result.replace(/нызқьтәи/g, "нызқьи");
        result = result.replace(/зқьтәи/g, "зқьи");
        
        return result;
    },
    
    numberToWords(n, options = { animate: false, ordinal: false }) {
        if (n === 0) return options.ordinal ? "нулевой" : "нуль";
        if (n < 0 || n > 999999) return "Число вне диапазона (0-999999)";
        
        let result = this._translatePositive(n, options.animate);
        
        if (options.ordinal && result) {
            result = this._makeOrdinal(result, n);
        }
        
        return result;
    },
    
    wordsToNumber(text) {
        text = text.toLowerCase().trim();
        
        text = text.replace(/тәи$/g, "");
        text = text.replace(/^а/g, "");
        
        const compoundPatterns = [
            { pattern: "ҩажәи жәаба", value: 30 },
            { pattern: "ҩажәи ҩажәи жәаба", value: 50 },
            { pattern: "хынҩажәи жәаба", value: 70 },
            { pattern: "ԥшьынҩажәи жәаба", value: 90 }
        ];
        
        let processedText = text;
        for (let { pattern, value } of compoundPatterns) {
            while (processedText.includes(pattern)) {
                processedText = processedText.replace(pattern, value.toString());
            }
        }
        
        const words = processedText.split(/\s+/);
        
        let total = 0;
        let current = 0;
        
        for (let i = 0; i < words.length; i++) {
            let w = words[i];
            let val = null;
            
            if (this.WORD_TO_VALUE[w]) {
                val = this.WORD_TO_VALUE[w];
            }
            else if (w.endsWith("и")) {
                let baseForm = w.slice(0, -1);
                if (this.WORD_TO_VALUE[baseForm]) {
                    val = this.WORD_TO_VALUE[baseForm];
                } else if (this.WORD_TO_VALUE[baseForm + "а"]) {
                    val = this.WORD_TO_VALUE[baseForm + "а"];
                } else if (this.WORD_TO_VALUE[baseForm + "ы"]) {
                    val = this.WORD_TO_VALUE[baseForm + "ы"];
                }
            }
            else if (w.endsWith("ы")) {
                let baseForm = w.slice(0, -1) + "а";
                if (this.WORD_TO_VALUE[baseForm]) {
                    val = this.WORD_TO_VALUE[baseForm];
                }
            }
            
            if (val === null) {
                const num = parseInt(w);
                if (!isNaN(num)) {
                    val = num;
                } else {
                    throw new Error(`Неизвестное слово: ${w}`);
                }
            }
            
            if (val === 1000) {
                if (current === 0) {
                    current = 1000;
                } else {
                    current *= 1000;
                }
                total += current;
                current = 0;
            } else {
                current += val;
            }
        }
        
        total += current;
        return total;
    },
    
    parseToNumber(text) {
        try {
            const result = this.wordsToNumber(text);
            if (isNaN(result) || result === undefined) {
                return "Не удалось распознать число";
            }
            return result;
        } catch (e) {
            return e.message;
        }
    },
    
    updateSettings(settings) {
        if (settings.ANIMATE_1_19) this.ANIMATE_1_19 = settings.ANIMATE_1_19;
        if (settings.INANIMATE_1_19) this.INANIMATE_1_19 = settings.INANIMATE_1_19;
        if (settings.TWENTIES) this.TWENTIES = settings.TWENTIES;
        if (settings.HUNDREDS) this.HUNDREDS = settings.HUNDREDS;
        if (settings.THOUSANDS) this.THOUSANDS = settings.THOUSANDS;
        if (settings.ORDINAL_EXCEPTIONS) this.ORDINAL_EXCEPTIONS = settings.ORDINAL_EXCEPTIONS;
        
        this.buildWordToValue();
        
        localStorage.setItem('abkhaz_settings', JSON.stringify({
            ANIMATE_1_19: this.ANIMATE_1_19,
            INANIMATE_1_19: this.INANIMATE_1_19,
            TWENTIES: this.TWENTIES,
            HUNDREDS: this.HUNDREDS,
            THOUSANDS: this.THOUSANDS,
            ORDINAL_EXCEPTIONS: this.ORDINAL_EXCEPTIONS
        }));
    },
    
    loadSettings() {
        const saved = localStorage.getItem('abkhaz_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.updateSettings(settings);
            } catch(e) {
                console.error('Ошибка загрузки настроек:', e);
            }
        }
    }
};

AbkhazNumberConverter.init();
AbkhazNumberConverter.loadSettings();

function updateResult(boxId, textId, result, isError = false) {
    const box = document.getElementById(boxId);
    const textEl = document.getElementById(textId);
    
    textEl.textContent = result;
    box.classList.add('highlight');
    textEl.style.color = isError ? '#f43f5e' : '#60a5fa';
    
    setTimeout(() => {
        box.classList.remove('highlight');
    }, 500);
}

function translateDirect() {
    const numInput = document.getElementById('direct-num').value;
    const animate = document.getElementById('direct-animate').checked;
    
    if (numInput === "") {
        updateResult('direct-result-box', 'direct-result', 'Введите число', true);
        return;
    }
    
    const num = parseInt(numInput);
    if (isNaN(num) || num < 0 || num > 999999) {
        updateResult('direct-result-box', 'direct-result', 'Число должно быть от 0 до 999 999', true);
        return;
    }
    
    const result = AbkhazNumberConverter.numberToWords(num, { animate: animate, ordinal: false });
    updateResult('direct-result-box', 'direct-result', result);
}

function translateOrdinal() {
    const numInput = document.getElementById('ord-num').value;
    
    if (numInput === "") {
        updateResult('ord-result-box', 'ord-result', 'Введите число', true);
        return;
    }
    
    const num = parseInt(numInput);
    if (isNaN(num) || num < 0 || num > 999999) {
        updateResult('ord-result-box', 'ord-result', 'Число должно быть от 0 до 999 999', true);
        return;
    }
    
    const result = AbkhazNumberConverter.numberToWords(num, { animate: false, ordinal: true });
    updateResult('ord-result-box', 'ord-result', result);
}

function translateReverse() {
    const text = document.getElementById('rev-text').value;
    
    if (!text.trim()) {
        updateResult('rev-result-box', 'rev-result', 'Введите текст числительного', true);
        return;
    }
    
    const result = AbkhazNumberConverter.parseToNumber(text);
    updateResult('rev-result-box', 'rev-result', result.toString());
}

function loadSettings() {
    const area = document.getElementById('settings-json');
    const status = document.getElementById('settings-status');
    
    const currentSettings = {
        ANIMATE_1_19: AbkhazNumberConverter.ANIMATE_1_19,
        INANIMATE_1_19: AbkhazNumberConverter.INANIMATE_1_19,
        TWENTIES: AbkhazNumberConverter.TWENTIES,
        HUNDREDS: AbkhazNumberConverter.HUNDREDS,
        THOUSANDS: AbkhazNumberConverter.THOUSANDS,
        ORDINAL_EXCEPTIONS: AbkhazNumberConverter.ORDINAL_EXCEPTIONS
    };
    area.value = JSON.stringify(currentSettings, null, 4);
    status.textContent = "Текущие настройки";
    status.style.color = "#94a3b8";
    
    setTimeout(() => {
        status.textContent = "";
    }, 2000);
}

function saveSettings() {
    const area = document.getElementById('settings-json');
    const status = document.getElementById('settings-status');
    
    try {
        const jsonData = JSON.parse(area.value);
        AbkhazNumberConverter.updateSettings(jsonData);
        
        status.textContent = "Настройки успешно сохранены и применены!";
        status.style.color = "#10b981";
        
        setTimeout(() => {
            status.textContent = "";
        }, 3000);
    } catch (e) {
        status.textContent = "Ошибка: Некорректный JSON - " + e.message;
        status.style.color = "#f43f5e";
        
        setTimeout(() => {
            status.textContent = "";
        }, 3000);
    }
}

window.translateDirect = translateDirect;
window.translateOrdinal = translateOrdinal;
window.translateReverse = translateReverse;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;