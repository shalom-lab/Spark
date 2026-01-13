const { createApp, ref, computed, reactive, onMounted, watch, nextTick } = Vue;

// 语言字典
const I18N_DATA = {
    zh: {
        searchPlaceholder: "检索灵感火花或关键词...",
        newSnip: "新增片段",
        filter: "按类型筛选",
        allSpark: "全部灵感",
        keywords: "关键词云",
        connectRepo: "连接你的仓库",
        connectRepoHint: "在设置中填写 GitHub 令牌以开启同步。",
        configureNow: "立即配置",
        copyInsight: "复制灵感",
        themeToggle: "切换深浅色主题",
        settingsTitle: "系统设置",
        settingsSubtitle: "配置中心与本地加密",
        githubToken: "GitHub 令牌",
        repoPath: "仓库路径",
        masterPassword: "主密码 (AES 密钥)",
        masterPasswordPlaceholder: "解锁本地加密缓存的钥匙",
        saveBtn: "同步并保存配置",
        magicLink: "保命书签",
        magicLinkDesc: "将配置加密为 URL。收藏它，清空缓存后点一下即可恢复。",
        generateBookmark: "生成书签链接",
        exportDB: "导出数据库",
        exportDBDesc: "将所有灵感导出为物理 JSON 文件。",
        downloadJSON: "下载备份",
        logoutBtn: "销毁本地缓存并登出",
        catchSpark: "捕捉灵感",
        refineSpark: "提炼片段",
        fieldTitle: "标题",
        titlePlaceholder: "给片段起个名字...",
        fieldType: "类型",
        fieldBody: "正文内容",
        bodyPlaceholder: "在此粘贴代码或深度见解...",
        fieldTags: "标签 (空格分隔)",
        discard: "放弃",
        pushing: "推送中...",
        captureAction: "捕捉此 Spark",
        bookmarkReady: "书签暗号已就绪",
        bookmarkHint: "请复制下方链接，在书签栏右键选择\"添加网页\"，并粘贴至\"网址\"栏。",
        copyDismiss: "复制并关闭",
        syncSuccess: "核心同步成功",
        authFailed: "同步失败：Token 无效",
        captured: "灵感已捕获至云端",
        restored: "已通过书签恢复连接",
        decryptionFailed: "解密失败：主密码错误",
        fieldsIncomplete: "内容缺失",
        copied: "灵感已复制"
    },
    en: {
        searchPlaceholder: "Search insights or keywords...",
        newSnip: "NEW SNIP",
        filter: "Filter",
        allSpark: "All Spark",
        keywords: "Tags Cloud",
        connectRepo: "Connect Your Repo",
        connectRepoHint: "Set your GitHub token in the settings to start syncing.",
        configureNow: "CONFIGURE NOW",
        copyInsight: "COPY INSIGHT",
        themeToggle: "Toggle Theme",
        settingsTitle: "System Settings",
        settingsSubtitle: "Config & Local Encryption",
        githubToken: "GitHub Token",
        repoPath: "Repository Path",
        masterPassword: "Master Password",
        masterPasswordPlaceholder: "Unlock local cache",
        saveBtn: "Sync & Save Configuration",
        magicLink: "Magic Link",
        magicLinkDesc: "Encrypt your config into a URL bookmark for one-click recovery.",
        generateBookmark: "Generate Bookmark",
        exportDB: "Export DB",
        exportDBDesc: "Download collection as a portable JSON file.",
        downloadJSON: "Download JSON",
        logoutBtn: "Purge local cache and Logout",
        catchSpark: "Catch a Spark",
        refineSpark: "Refine Spark",
        fieldTitle: "Title",
        titlePlaceholder: "Snippet name...",
        fieldType: "Type",
        fieldBody: "Insight Body",
        bodyPlaceholder: "Paste code or insight here...",
        fieldTags: "Tags (Space separated)",
        discard: "Discard",
        pushing: "PUSHING...",
        captureAction: "CAPTURE SPARK",
        bookmarkReady: "Magic Link Ready",
        bookmarkHint: "Copy the link and save it as a browser bookmark to restore sessions.",
        copyDismiss: "COPY & DISMISS",
        syncSuccess: "SYNC SUCCESSFUL",
        authFailed: "AUTH FAILED: INVALID TOKEN",
        captured: "CAPTURED TO CLOUD",
        restored: "RESTORED VIA MAGIC LINK",
        decryptionFailed: "DECRYPTION FAILED",
        fieldsIncomplete: "FIELDS INCOMPLETE",
        copied: "COPIED TO CLIPBOARD"
    }
};

// 应用主题到 HTML 元素
const applyTheme = (mode) => {
    const html = document.documentElement;
    if (mode === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
    } else {
        html.classList.remove('dark');
        html.classList.add('light');
    }
};

createApp({
    setup() {
        const currentLang = ref(localStorage.getItem('spark_lang') || 'zh');
        const themeMode = ref(localStorage.getItem('spark_theme') || 'dark');
        const currentView = ref('list');
        const snippets = ref([]);
        const loading = ref(false);
        const syncing = ref(false);
        const searchQuery = ref('');
        const selectedLang = ref('');
        const toasts = ref([]);
        const sha = ref('');
        const masterPassword = ref(localStorage.getItem('spark_master') || '');
        const bookmarkModal = reactive({ show: false, url: '' });

        const config = reactive({
            token: '',
            repo: localStorage.getItem('spark_repo') || '',
            path: 'snippets.json'
        });

        // 翻译函数
        const t = (key) => I18N_DATA[currentLang.value][key] || key;

        const toggleLang = () => {
            currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh';
            localStorage.setItem('spark_lang', currentLang.value);
        };

        const toggleTheme = () => {
            const newMode = themeMode.value === 'dark' ? 'light' : 'dark';
            themeMode.value = newMode;
            localStorage.setItem('spark_theme', newMode);
            // watch 会自动调用 applyTheme 和 updateHighlightTheme
        };

        // 更新 highlight.js 主题样式
        const updateHighlightTheme = (mode) => {
            const lightTheme = document.getElementById('hljs-light-theme');
            const darkTheme = document.getElementById('hljs-dark-theme');
            if (lightTheme && darkTheme) {
                if (mode === 'dark') {
                    lightTheme.setAttribute('media', 'none');
                    darkTheme.setAttribute('media', 'all');
                } else {
                    lightTheme.setAttribute('media', 'all');
                    darkTheme.setAttribute('media', 'none');
                }
            }
        };

        // 监听主题变化（自动同步到 DOM）
        watch(themeMode, (newMode) => {
            applyTheme(newMode);
            updateHighlightTheme(newMode);
        }, { immediate: false });

        const resetView = () => {
            currentView.value = 'list';
            searchQuery.value = '';
            selectedLang.value = '';
        };

        const decryptStoredToken = () => {
            const encrypted = localStorage.getItem('spark_token');
            if (encrypted && masterPassword.value) {
                try {
                    const bytes = CryptoJS.AES.decrypt(encrypted, masterPassword.value);
                    const res = bytes.toString(CryptoJS.enc.Utf8);
                    if (res) config.token = res;
                } catch (e) { console.error('Decryption failed'); }
            }
        };

        const modal = reactive({ show: false, mode: 'add', currentId: null });
        const form = reactive({ title: '', lang: 'JS', code: '', tagsInput: '' });

        const isReady = computed(() => !!(config.token && config.repo));
        const isConnected = computed(() => !!(config.token && config.repo));

        const langStats = computed(() => {
            const stats = {};
            snippets.value.forEach(s => { stats[s.lang] = (stats[s.lang] || 0) + 1; });
            return stats;
        });

        const allTags = computed(() => {
            const tags = new Set();
            snippets.value.forEach(s => {
                if (s.tags) s.tags.forEach(tag => tags.add(tag));
            });
            return Array.from(tags).sort();
        });

        const filteredSnippets = computed(() => {
            return snippets.value.filter(s => {
                const q = searchQuery.value.toLowerCase();
                const matchSearch = q.startsWith('#')
                    ? (s.tags && s.tags.some(t => t.toLowerCase() === q.slice(1)))
                    : (s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.tags && s.tags.some(t => t.toLowerCase().includes(q))));

                const matchLang = !selectedLang.value || s.lang === selectedLang.value;
                return matchSearch && matchLang;
            }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        });

        const notify = (msgKey, type = 'success') => {
            const id = Date.now();
            toasts.value.push({ id, msg: t(msgKey), type });
            setTimeout(() => toasts.value = toasts.value.filter(t => t.id !== id), 3500);
        };

        const toggleSettings = () => { currentView.value = currentView.value === 'list' ? 'settings' : 'list'; };

        const fetchData = async () => {
            if (!isConnected.value) return;
            loading.value = true;
            try {
                const res = await fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}`, {
                    headers: { 'Authorization': `token ${config.token}`, 'Accept': 'application/vnd.github.v3+json' }
                });
                if (!res.ok) throw new Error('Sync Failed');
                const data = await res.json();
                sha.value = data.sha;
                const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
                snippets.value = JSON.parse(decoded);
                currentView.value = 'list';
                notify('syncSuccess');
            } catch (e) { notify('authFailed', 'error'); currentView.value = 'settings'; }
            finally { loading.value = false; }
        };

        const updateRemote = async (newData) => {
            syncing.value = true;
            try {
                const contentStr = JSON.stringify(newData, null, 2);
                const base64 = btoa(unescape(encodeURIComponent(contentStr)));
                const res = await fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${config.token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: `Spark Update: ${new Date().toLocaleString()}`, content: base64, sha: sha.value })
                });
                if (!res.ok) throw new Error('Push Failed');
                const result = await res.json();
                sha.value = result.content.sha;
                snippets.value = newData;
                notify('captured');
                return true;
            } catch (e) { notify('authFailed', 'error'); return false; }
            finally { syncing.value = false; }
        };

        const saveConfig = () => {
            if (!masterPassword.value) return notify('decryptionFailed', 'error');
            const encrypted = CryptoJS.AES.encrypt(config.token, masterPassword.value).toString();
            localStorage.setItem('spark_token', encrypted);
            localStorage.setItem('spark_repo', config.repo);
            localStorage.setItem('spark_master', masterPassword.value);
            fetchData();
        };

        const logout = () => { if (confirm('彻底登出？将销毁本地所有加密缓存。')) { localStorage.clear(); window.location.reload(); } };

        const generateMagicBookmark = () => {
            if (!isReady.value) return notify('fieldsIncomplete', 'error');
            const raw = `${config.token}|${config.repo}`;
            const encrypted = masterPassword.value ? CryptoJS.AES.encrypt(raw, masterPassword.value).toString() : btoa(raw);
            const baseUrl = window.location.href.split('#')[0];
            bookmarkModal.url = `${baseUrl}#setup=${encodeURIComponent(encrypted)}`;
            bookmarkModal.show = true;
        };

        const checkUrlHash = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#setup=')) {
                const encrypted = decodeURIComponent(hash.split('=')[1]);
                let raw = '';
                try {
                    if (masterPassword.value) {
                        const bytes = CryptoJS.AES.decrypt(encrypted, masterPassword.value);
                        raw = bytes.toString(CryptoJS.enc.Utf8);
                    } else { raw = atob(encrypted); }
                    if (raw && raw.includes('|')) {
                        const [t_val, r_val] = raw.split('|');
                        config.token = t_val; config.repo = r_val;
                        saveConfig();
                        notify('restored');
                        setTimeout(() => { history.replaceState(null, document.title, window.location.pathname); }, 2000);
                    }
                } catch (e) { notify('decryptionFailed', 'error'); }
            }
        };

        const exportJSON = () => {
            const blob = new Blob([JSON.stringify(snippets.value, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `spark_backup.json`;
            a.click();
        };

        const openModal = (mode, s = null) => {
            modal.mode = mode;
            if (mode === 'edit' && s) {
                modal.currentId = s.id; form.title = s.title; form.lang = s.lang; form.code = s.code;
                form.tagsInput = s.tags ? s.tags.join(' ') : '';
            } else {
                modal.currentId = null; form.title = ''; form.lang = 'JS'; form.code = ''; form.tagsInput = '';
            }
            modal.show = true;
        };

        const saveSnippet = async () => {
            if (!form.title || !form.code) return notify('fieldsIncomplete', 'error');
            const tagList = form.tagsInput.split(/[,\s]+/).filter(t => t.trim());
            let newList;
            if (modal.mode === 'add') {
                newList = [...snippets.value, { id: Date.now().toString(), title: form.title, lang: form.lang, code: form.code, tags: tagList, createdAt: Date.now() }];
            } else {
                newList = snippets.value.map(s => s.id === modal.currentId ? { ...s, title: form.title, lang: form.lang, code: form.code, tags: tagList } : s);
            }
            if (await updateRemote(newList)) modal.show = false;
        };

        const deleteSnippet = (id) => { if (confirm('从 GitHub 永久移除？')) updateRemote(snippets.value.filter(s => s.id !== id)); };

        const copy = (txt) => {
            const el = document.createElement('textarea');
            el.value = txt; document.body.appendChild(el);
            el.select(); document.execCommand('copy');
            document.body.removeChild(el);
            notify('copied');
        };

        const getLangTagStyle = (l) => {
            const map = {
                JS: 'text-[#f7df1e] border border-[#f7df1e]/20',
                R: 'text-[#276bba] border border-[#276bba]/20',
                PYTHON: 'text-[#3776ab] border border-[#3776ab]/20',
                YAML: 'text-[#cb171e] border border-[#cb171e]/20',
                SQL: 'text-[#336791] border border-[#336791]/20',
                MD: 'text-gray-400 border border-gray-400/20',
                TEXT: 'text-gray-400 border border-gray-400/20'
            };
            return map[l.toUpperCase()] || 'text-gray-400 border border-white/5';
        };

        // 将语言代码映射到 highlight.js 支持的语言别名
        const getLanguageAlias = (lang) => {
            const langMap = {
                'JS': 'javascript',
                'PYTHON': 'python',
                'R': 'r',
                'YAML': 'yaml',
                'SQL': 'sql',
                'MD': 'markdown',
                'TEXT': 'plaintext'
            };
            return langMap[lang.toUpperCase()] || 'plaintext';
        };

        // 高亮代码
        const highlightCode = (code, lang) => {
            if (!code) return '';
            try {
                const alias = getLanguageAlias(lang);
                if (window.hljs && window.hljs.highlight) {
                    const result = window.hljs.highlight(code, { language: alias });
                    return result.value;
                }
                return code;
            } catch (e) {
                console.error('Highlight error:', e);
                return code;
            }
        };

        onMounted(() => {
            // 初始化主题
            applyTheme(themeMode.value);
            updateHighlightTheme(themeMode.value);
            decryptStoredToken(); 
            checkUrlHash();
            if (isConnected.value) fetchData();
            else if (localStorage.getItem('spark_token')) currentView.value = 'settings';
        });

        return { currentLang, themeMode, t, toggleLang, toggleTheme, resetView, currentView, config, snippets, loading, syncing, searchQuery, selectedLang, langStats, allTags, filteredSnippets, toasts, modal, form, masterPassword, bookmarkModal, saveConfig, logout, generateMagicBookmark, openModal, saveSnippet, deleteSnippet, copy, getLangTagStyle, getLanguageAlias, highlightCode, isReady, isConnected, exportJSON, toggleSettings };
    }
}).mount('#app');

