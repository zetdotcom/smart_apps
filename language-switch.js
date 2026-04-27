(() => {
    const STORAGE_KEY = "smart-apps-language";
    const CACHE_KEY = "smart-apps-language-cache-v1";
    const SOURCE_LANG = "en";
    const SUPPORTED_LANGS = new Set(["en", "pl"]);
    const SKIP_TAGS = new Set([
        "SCRIPT",
        "STYLE",
        "NOSCRIPT",
        "TEXTAREA",
        "IFRAME",
        "SVG",
        "CANVAS",
    ]);
    const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
    const TEXT_FILTER = /[A-Za-z\u00C0-\u024F]/;
    const originalTextNodes = new WeakMap();
    const originalAttributes = new WeakMap();
    const originalDocumentTitle = document.title;
    const chartOriginals = new WeakMap();
    let cache = loadCache();
    let currentLang = normalizeLanguage(
        localStorage.getItem(STORAGE_KEY) ||
            document.documentElement.lang ||
            navigator.language,
    );
    let switchRoot = null;
    let isApplyingLanguage = false;
    let observer = null;
    let observerTimer = null;
    const observerRoots = new Set();

    function loadCache() {
        try {
            return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
        } catch {
            return {};
        }
    }

    function saveCache() {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch {
            // Ignore storage quota failures.
        }
    }

    function normalizeLanguage(value) {
        const lang = String(value || SOURCE_LANG).toLowerCase();
        return lang.startsWith("pl") ? "pl" : SOURCE_LANG;
    }

    function createSwitch() {
        if (document.querySelector("[data-language-switch-root]")) {
            return;
        }

        switchRoot = document.createElement("div");
        switchRoot.className = "language-switch notranslate";
        switchRoot.dataset.languageSwitchRoot = "true";
        switchRoot.setAttribute("translate", "no");
        switchRoot.innerHTML = `
            <span class="language-switch__label">LANG</span>
            <button type="button" class="language-switch__button" data-lang="en">EN</button>
            <button type="button" class="language-switch__button" data-lang="pl">PL</button>
        `;

        switchRoot.addEventListener("click", async (event) => {
            const button = event.target.closest("[data-lang]");

            if (!button) {
                return;
            }

            const nextLang = normalizeLanguage(button.dataset.lang);

            if (nextLang === currentLang || isApplyingLanguage) {
                return;
            }

            await applyLanguage(nextLang);
        });

        document.body.appendChild(switchRoot);
        updateSwitchState();
    }

    function updateSwitchState() {
        if (!switchRoot) {
            return;
        }

        switchRoot.dataset.busy = String(isApplyingLanguage);

        switchRoot.querySelectorAll("[data-lang]").forEach((button) => {
            button.classList.toggle(
                "is-active",
                normalizeLanguage(button.dataset.lang) === currentLang,
            );
        });
    }

    function shouldTranslateTextNode(node) {
        if (!node || !node.parentElement) {
            return false;
        }

        const parent = node.parentElement;

        if (
            SKIP_TAGS.has(parent.tagName) ||
            parent.closest("[data-language-switch-root]")
        ) {
            return false;
        }

        const value = getOriginalNodeText(node);
        return Boolean(value && value.trim() && TEXT_FILTER.test(value));
    }

    function getOriginalNodeText(node) {
        if (!originalTextNodes.has(node)) {
            originalTextNodes.set(node, node.nodeValue);
        }

        return originalTextNodes.get(node) || "";
    }

    function getOriginalAttribute(element, attribute) {
        let record = originalAttributes.get(element);

        if (!record) {
            record = {};
            originalAttributes.set(element, record);
        }

        if (!(attribute in record)) {
            record[attribute] = element.getAttribute(attribute) || "";
        }

        return record[attribute];
    }

    function collectTextNodes(root = document.body) {
        const nodes = [];
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    return shouldTranslateTextNode(node)
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                },
            },
        );

        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }

        return nodes;
    }

    function collectAttributeEntries(root = document.body) {
        const entries = [];

        if (!(root instanceof Element) && root !== document.body) {
            return entries;
        }

        const elements = [];

        if (root === document.body) {
            elements.push(document.body);
        } else if (root instanceof Element) {
            elements.push(root);
        }

        const selector = ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
        elements.forEach((element) => {
            if (
                element.matches?.(selector) &&
                !element.closest("[data-language-switch-root]")
            ) {
                entries.push(...collectElementAttributes(element));
            }

            element.querySelectorAll?.(selector).forEach((child) => {
                if (!child.closest("[data-language-switch-root]")) {
                    entries.push(...collectElementAttributes(child));
                }
            });
        });

        return entries;
    }

    function collectElementAttributes(element) {
        return ATTRIBUTES.flatMap((attribute) => {
            const original = getOriginalAttribute(element, attribute);

            if (!original.trim() || !TEXT_FILTER.test(original)) {
                return [];
            }

            return [{ element, attribute, original }];
        });
    }

    function ensureChartOriginals(chart) {
        if (chartOriginals.has(chart)) {
            return chartOriginals.get(chart);
        }

        const snapshot = {
            labels: Array.isArray(chart.data?.labels)
                ? chart.data.labels.map((label) => label)
                : null,
            datasetLabels: Array.isArray(chart.data?.datasets)
                ? chart.data.datasets.map((dataset) => dataset.label)
                : null,
            options: {
                title: chart.options?.plugins?.title?.text,
                legend: chart.options?.plugins?.legend?.title?.text,
                scales: {},
            },
        };

        const scales = chart.options?.scales || {};
        Object.keys(scales).forEach((key) => {
            snapshot.options.scales[key] = {
                title: scales[key]?.title?.text,
            };
        });

        chartOriginals.set(chart, snapshot);
        return snapshot;
    }

    function collectChartEntries() {
        if (!window.Chart?.instances) {
            return [];
        }

        const charts = Object.values(window.Chart.instances);
        const entries = [];

        charts.forEach((chart) => {
            const originals = ensureChartOriginals(chart);

            if (Array.isArray(originals.labels) && Array.isArray(chart.data?.labels)) {
                originals.labels.forEach((label, index) => {
                    if (typeof label === "string" && label.trim()) {
                        entries.push({
                            type: "chart-label",
                            chart,
                            index,
                            original: label,
                        });
                    }
                });
            }

            if (
                Array.isArray(originals.datasetLabels) &&
                Array.isArray(chart.data?.datasets)
            ) {
                originals.datasetLabels.forEach((label, index) => {
                    if (typeof label === "string" && label.trim()) {
                        entries.push({
                            type: "chart-dataset-label",
                            chart,
                            index,
                            original: label,
                        });
                    }
                });
            }

            const title = originals.options.title;
            if (typeof title === "string" && title.trim()) {
                entries.push({ type: "chart-title", chart, original: title });
            }

            const legend = originals.options.legend;
            if (typeof legend === "string" && legend.trim()) {
                entries.push({ type: "chart-legend", chart, original: legend });
            }

            Object.entries(originals.options.scales).forEach(([key, scale]) => {
                if (typeof scale.title === "string" && scale.title.trim()) {
                    entries.push({
                        type: "chart-scale-title",
                        chart,
                        key,
                        original: scale.title,
                    });
                }
            });
        });

        return entries;
    }

    function restoreEnglish(root = document.body) {
        collectTextNodes(root).forEach((node) => {
            node.nodeValue = getOriginalNodeText(node);
        });

        collectAttributeEntries(root).forEach(({ element, attribute, original }) => {
            element.setAttribute(attribute, original);
        });

        document.title = originalDocumentTitle;
        document.documentElement.lang = SOURCE_LANG;
        restoreCharts();
    }

    function restoreCharts() {
        if (!window.Chart?.instances) {
            return;
        }

        Object.values(window.Chart.instances).forEach((chart) => {
            const originals = ensureChartOriginals(chart);

            if (Array.isArray(originals.labels) && Array.isArray(chart.data?.labels)) {
                chart.data.labels = originals.labels.map((label) => label);
            }

            if (
                Array.isArray(originals.datasetLabels) &&
                Array.isArray(chart.data?.datasets)
            ) {
                chart.data.datasets.forEach((dataset, index) => {
                    dataset.label = originals.datasetLabels[index];
                });
            }

            if (chart.options?.plugins?.title) {
                chart.options.plugins.title.text = originals.options.title;
            }

            if (chart.options?.plugins?.legend?.title) {
                chart.options.plugins.legend.title.text = originals.options.legend;
            }

            Object.entries(originals.options.scales).forEach(([key, scale]) => {
                if (chart.options?.scales?.[key]?.title) {
                    chart.options.scales[key].title.text = scale.title;
                }
            });

            chart.update();
        });
    }

    async function translateStrings(strings, targetLang) {
        if (targetLang === SOURCE_LANG) {
            return new Map(strings.map((value) => [value, value]));
        }

        cache[targetLang] = cache[targetLang] || {};
        const results = new Map();
        const uncached = [];

        strings.forEach((value) => {
            const cachedValue = cache[targetLang][value];

            if (cachedValue) {
                results.set(value, cachedValue);
            } else {
                uncached.push(value);
            }
        });

        const batches = [];
        let batch = [];
        let batchLength = 0;

        uncached.forEach((value) => {
            const nextLength = batchLength + value.length;

            if (batch.length && nextLength > 2500) {
                batches.push(batch);
                batch = [];
                batchLength = 0;
            }

            batch.push(value);
            batchLength += value.length;
        });

        if (batch.length) {
            batches.push(batch);
        }

        for (const group of batches) {
            const translatedGroup = await requestBatchTranslation(group, targetLang);

            group.forEach((original, index) => {
                const translated = translatedGroup[index] || original;
                cache[targetLang][original] = translated;
                results.set(original, translated);
            });
        }

        saveCache();
        return results;
    }

    async function requestBatchTranslation(strings, targetLang) {
        const delimiter = "\n__SMART_APPS_LANG_SPLIT__\n";
        const joined = strings.join(delimiter);

        try {
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`,
            );

            if (!response.ok) {
                throw new Error(`Translation request failed: ${response.status}`);
            }

            const data = await response.json();
            const translated = Array.isArray(data?.[0])
                ? data[0].map((part) => part[0]).join("")
                : joined;
            const split = translated.split("__SMART_APPS_LANG_SPLIT__");

            if (split.length === strings.length) {
                return split.map((value) => value.replace(/^\n|\n$/g, ""));
            }
        } catch (error) {
            console.warn("Language switch translation failed", error);
        }

        return Promise.all(strings.map((value) => requestSingleTranslation(value, targetLang)));
    }

    async function requestSingleTranslation(value, targetLang) {
        try {
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(value)}`,
            );

            if (!response.ok) {
                throw new Error(`Translation request failed: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data?.[0])
                ? data[0].map((part) => part[0]).join("")
                : value;
        } catch (error) {
            console.warn("Language switch translation failed", error);
            return value;
        }
    }

    async function translateRoot(root, targetLang) {
        const textNodes = collectTextNodes(root);
        const attributeEntries = collectAttributeEntries(root);
        const chartEntries = root === document.body ? collectChartEntries() : [];
        const originals = new Set([
            ...textNodes.map((node) => getOriginalNodeText(node)),
            ...attributeEntries.map((entry) => entry.original),
            ...chartEntries.map((entry) => entry.original),
            originalDocumentTitle,
        ]);
        const translations = await translateStrings(
            Array.from(originals).filter((value) => value && value.trim()),
            targetLang,
        );

        textNodes.forEach((node) => {
            const original = getOriginalNodeText(node);
            node.nodeValue = translations.get(original) || original;
        });

        attributeEntries.forEach(({ element, attribute, original }) => {
            element.setAttribute(attribute, translations.get(original) || original);
        });

        if (root === document.body) {
            chartEntries.forEach((entry) => {
                const translated = translations.get(entry.original) || entry.original;

                if (entry.type === "chart-label") {
                    entry.chart.data.labels[entry.index] = translated;
                }

                if (entry.type === "chart-dataset-label") {
                    entry.chart.data.datasets[entry.index].label = translated;
                }

                if (entry.type === "chart-title" && entry.chart.options?.plugins?.title) {
                    entry.chart.options.plugins.title.text = translated;
                }

                if (
                    entry.type === "chart-legend" &&
                    entry.chart.options?.plugins?.legend?.title
                ) {
                    entry.chart.options.plugins.legend.title.text = translated;
                }

                if (
                    entry.type === "chart-scale-title" &&
                    entry.chart.options?.scales?.[entry.key]?.title
                ) {
                    entry.chart.options.scales[entry.key].title.text = translated;
                }
            });

            if (window.Chart?.instances) {
                Object.values(window.Chart.instances).forEach((chart) => chart.update());
            }

            document.title = translations.get(originalDocumentTitle) || originalDocumentTitle;
        }

        document.documentElement.lang = targetLang;
    }

    async function applyLanguage(nextLang, root = document.body) {
        const targetLang = normalizeLanguage(nextLang);
        isApplyingLanguage = true;
        updateSwitchState();

        try {
            if (targetLang === SOURCE_LANG) {
                restoreEnglish(root);
            } else {
                await translateRoot(root, targetLang);
            }

            currentLang = targetLang;
            localStorage.setItem(STORAGE_KEY, currentLang);
        } finally {
            isApplyingLanguage = false;
            updateSwitchState();
        }
    }

    function setupObserver() {
        if (observer) {
            return;
        }

        observer = new MutationObserver((mutations) => {
            if (isApplyingLanguage || currentLang === SOURCE_LANG) {
                return;
            }

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                        observerRoots.add(node.parentElement);
                    }

                    if (node.nodeType === Node.ELEMENT_NODE) {
                        observerRoots.add(node);
                    }
                });
            });

            clearTimeout(observerTimer);
            observerTimer = window.setTimeout(async () => {
                const roots = Array.from(observerRoots);
                observerRoots.clear();

                for (const root of roots) {
                    await applyLanguage(currentLang, root);
                }
            }, 150);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    function boot() {
        if (!document.body || !SUPPORTED_LANGS.has(currentLang)) {
            currentLang = SOURCE_LANG;
        }

        createSwitch();
        setupObserver();

        if (currentLang !== SOURCE_LANG) {
            applyLanguage(currentLang);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
