    (function() {
        // Комфортная цветовая тема без зависимости от локального хранилища.
        const themeToggle = document.getElementById('themeToggle');
        let activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        function applyTheme(theme) {
            activeTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            const isDark = theme === 'dark';
            themeToggle.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
            themeToggle.innerHTML = isDark
                ? '<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41"/></svg>'
                : '<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>';
        }
        applyTheme(activeTheme);
        themeToggle.addEventListener('click', () => applyTheme(activeTheme === 'dark' ? 'light' : 'dark'));

        const EVEN_SEGMENTS = [
            "КУЗНЕЦОВО - НАХОДКА","БУТЫЛИЦЫ - МУРОМ I","ВВЕДЕНСКОЕ - КУРГАН","ВИХОРЕВКА - МОРГУДОН",
            "ВОЗДВИЖЕНСКИЙ - УССУРИЙСК","ВОЙНОВКА - ТЮМЕНЬ-СЕВ","ВОЛОЧАЕВКА I - ТУНГУССКИЙ",
            "ВОЛХОВСТР I - ВОЛХОВСТР II","ВОЛХОВСТР II - МУРМ ВОРОТА","ГАЛКИНО - КУРГАН",
            "ГАТЧИНА-Т-БАЛТ - ВОЙСКОВИЦЫ","ГОГИНО - ЗНОЙНОЕ","ГОРЕЛЫЙ - СКОВОРОДИНО",
            "ГУСЕВ - НЕСТЕРОВ","ДЕМЬЯС - ОЗИНКИ","ДИВИЗИОННАЯ - УЛАН-УДЭ","ДИВОВО - РЫБНОЕ",
            "ДУБИНИНСКИЙ - УССУРИЙСК","ЕРЦЕВО - КОНОША I","КАНАЛЬНАЯ - ИМ.М.ГОРЬКОГО",
            "КАРГАЛА - ОРЕНБУРГ","КАРТАЛЫ I - ТАМЕРЛАН","КИНЕЛЬ - ТУРГЕНЕВКА","КИРИШИ - ПЧЕВЖА",
            "КОЗЕЛКИНО - БЕРЕЗОВСКИЙ","КОНОША I - КОНОША II","КОНОША I - МЕЛЕНТЬЕВСКИЙ",
            "КОТЛУБАНЬ - ГУМРАК","КОТЛЫ II - ВЕЙМАРН","КРАСНОЕ - ГУСИНО","КУВЫКТА - ТЫНДА",
            "КУЛУНДА - ЯГОТИНСКАЯ","ЛОДЕЙН ПОЛЕ - ОЛОНЕЦ","ЛОДЕЙН ПОЛЕ - ЯНЕГА",
            "ЛОКОТЬ-Э-Р(РОС) - РУБЦОВСК","ЛУЗИНО - ВХОДНАЯ","ЛЯНГАСОВО - ПОЗДИНО",
            "МАРИИНСК - РАЕВКА","МЕЖДУРЕЧЕНСК - КАРАЙ","МИЧУРИНСК-В - НИКОЛЬСКОЕ",
            "МОРОЗОВСКАЯ - ЧЕРНЫШКОВ","МУРОМ I - НАВАШИНО","НОВОСОКОЛЬНИКИ - ВОРОБЕЦКАЯ",
            "НОВОСОКОЛЬНИКИ - МАЕВО","ОЛЕНЕГОРСК - ЛАПЛАНДИЯ","ОРЕНБУРГ - МЕНОВОЙ ДВОР",
            "ПЕТРУШЕНКО - КАРБЫШЕВО I","ПЕТУХОВО - ГОРБУНОВО","ПЕТУШКИ - КОСТЕРЕВО",
            "ПИБАНЬШУР - ЧЕПЦА","ПОЛЮСТРОВО - РУЧЬИ","РЕШОТЫ - КАНИФОЛЬНАЯ","РЫБНОЕ - ДЯГИЛЕВО",
            "САМУР - ДЕРБЕНТ","СЕТИ - ТЫНДА","СЕЯТЕЛЬ - ЮНОСТЬ","СМЫШЛЯЕВКА - КИНЕЛЬ",
            "СУДА - КОШТА","СУЗЕМКА - ХОЛМЕЧИ","СЫЗРАНЬ II - СЫЗРАНЬ I","ТАГУЛ - ТАЙШЕТ",
            "ТАЙШЕТ - БАЙРОНОВКА","ТАЛЬЦЫ - ОНОХОЙ","ТАРАСИХА - СЕМЕНОВ","ТАРСКАЯ - АДРИАНОВКА",
            "ТАРСКАЯ - УРУЛЬГА","ТАШЕБА - АБАКАН","ТЕРСИ - АГРЫЗ","ТРОФИМОВСКИЙ II - ТРОФИМОВСКИЙ I",
            "ТУРМАСОВО - НИКИФОРОВКА","ТЫНДА - ШАХТАУМ","УГЛОВКА - ОКУЛОВКА","УГОЛЬНАЯ - ОКЕАНСКАЯ",
            "УРОМ - АГРЫЗ","УСТЬ-ВЫМЬ - МИКУНЬ","УТЕС - ЧУСОВСКАЯ","ФИЛАРЕТОВКА - РУЖИНО",
            "ХАБАРОВСК I - ХАБАРОВСК II","ХАРАНХОЙ - НАУШКИ","ХОБОТОВО - КОЧЕТОВКА I",
            "ХРЕБТОВАЯ - ИГИРМА","ХРУСТАЛЬНАЯ - ЕКАТЕРИН-С","ЧИК - ОБЬ","ЧУСОВСКАЯ - СКАЛЬНЫЙ",
            "ШЕРШНИ - ЧЕЛЯБИНСК-ГЛ","ШИБАНОВО - ЧУСОВСКАЯ","ЯРОСЛАВЛЬ-ГЛ - ПРИВОЛЖЬЕ"
        ];
        let records = [];
        let nextId = 1;
        let isEditing = false;
        let editRecords = [];
        let filterColumn = 'all';
        let filterValue = '';
        let groupedView = false;
        let mapWidgets = [];
        let mapWidgetId = 0;
        let selectedKeys = [];
        let allGroups = {};
        let draftSelectedKeys = new Set();
        let placementQueue = [];
        let unplacedWidgets = [];
        let mapWidth = 1400, mapHeight = 1000;
        let currentMapObjectUrl = null;
        let currentDisplayMode = 'full';
        let anchorCounter = 0;

        const dbBody = document.getElementById('dbBody');
        const rowCount = document.getElementById('rowCount');
        const filterColumnEl = document.getElementById('filterColumn');
        const filterValueEl = document.getElementById('filterValue');
        const applyFilterBtn = document.getElementById('applyFilterBtn');
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        const importBtn = document.getElementById('importBtn');
        const saveJsonBtn = document.getElementById('saveJsonBtn');
        const loadJsonBtn = document.getElementById('loadJsonBtn');
        const editBtn = document.getElementById('editBtn');
        const saveEditBtn = document.getElementById('saveEditBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const groupToggleBtn = document.getElementById('groupToggleBtn');
        const mapContainer = document.getElementById('mapContainer');
        const mapSvg = document.getElementById('mapSvg');
        const mapGroup = document.getElementById('mapGroup');
        const bgImage = document.getElementById('bgImage');
        const connectorLayer = document.getElementById('connectorLayer');
        const mapTablesContainer = document.getElementById('mapTablesContainer');
        const placementHint = document.getElementById('placementHint');
        const loadMapBtn = document.getElementById('loadMapBtn');
        const mapFileInput = document.getElementById('mapFileInput');
        const mapSourceStatus = document.getElementById('mapSourceStatus');
        const mapZoomIn = document.getElementById('mapZoomIn');
        const mapZoomOut = document.getElementById('mapZoomOut');
        const mapReset = document.getElementById('mapReset');
        const mapZoomInfo = document.getElementById('mapZoomInfo');
        const mapZoomRange = document.getElementById('mapZoomRange');
        const mapZoomPercent = document.getElementById('mapZoomPercent');
        const generateTablesBtn = document.getElementById('generateTablesBtn');
        const refreshMapBtn = document.getElementById('refreshMapBtn');
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        const exportOverlay = document.getElementById('exportOverlay');
        const exportEstimate = document.getElementById('exportEstimate');
        const exportElapsed = document.getElementById('exportElapsed');
        const exportMapStateBtn = document.getElementById('exportMapStateBtn');
        const importMapStateBtn = document.getElementById('importMapStateBtn');
        const importMapStateInput = document.getElementById('importMapStateInput');
        const periodType = document.getElementById('periodType');
        const periodYearFrom = document.getElementById('periodYearFrom');
        const periodMonthFrom = document.getElementById('periodMonthFrom');
        const periodYearTo = document.getElementById('periodYearTo');
        const periodMonthTo = document.getElementById('periodMonthTo');
        const rangeSeparator = document.getElementById('rangeSeparator');
        const modal = document.getElementById('periodModal');
        const modalYear = document.getElementById('modalYear');
        const modalMonth = document.getElementById('modalMonth');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');
        const selectModal = document.getElementById('selectSegmentsModal');
        const segmentsList = document.getElementById('segmentsList');
        const selectAllSegments = document.getElementById('selectAllSegments');
        const segmentsConfirm = document.getElementById('segmentsConfirm');
        const segmentsCancel = document.getElementById('segmentsCancel');
        const segmentSearch = document.getElementById('segmentSearch');
        const placeTableModal = document.getElementById('placeTableModal');
        const placeTableList = document.getElementById('placeTableList');
        const placeTableCancel = document.getElementById('placeTableCancel');
        const placeTableConfirm = document.getElementById('placeTableConfirm');
        const placeModeModal = document.getElementById('placeModeModal');
        const placeModeTitle = document.getElementById('placeModeTitle');
        const tabs = document.querySelectorAll('[data-tab]');
        const tabPages = {
            db: document.getElementById('tab-db'),
            map: document.getElementById('tab-map'),
            help: document.getElementById('tab-help')
        };
        let exportTimer = null;

        function storageGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
        function storageSet(key, value) { try { localStorage.setItem(key, value); } catch(e) {} }

        function loadFromStorage() {
            const stored = storageGet('records');
            if (stored) {
                try {
                    records = JSON.parse(stored);
                    records.forEach(r => { if (!r.id) r.id = nextId++; });
                    if (records.length > 0) {
                        const maxId = Math.max(...records.map(r => r.id));
                        nextId = maxId + 1;
                    }
                } catch(e) { records = []; }
            }
            saveToStorage();
            renderTable();
        }
        function saveToStorage() { storageSet('records', JSON.stringify(records)); }

        function getMonthName(num) {
            const names = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
            return names[num-1] || '';
        }

        function applyFilter() {
            filterColumn = filterColumnEl.value;
            filterValue = filterValueEl.value.trim().toLowerCase();
            renderTable();
        }
        function clearFilter() {
            filterValueEl.value = '';
            filterColumn = 'all';
            filterValue = '';
            filterColumnEl.value = 'all';
            renderTable();
        }
        function getFilteredRecords(source) {
            if (!filterValue) return source;
            return source.filter(rec => {
                if (filterColumn === 'all') {
                    const str = Object.values(rec).filter(v => v !== undefined && v !== null).join(' ').toLowerCase();
                    return str.includes(filterValue);
                } else {
                    const val = rec[filterColumn];
                    if (val === undefined || val === null) return false;
                    return String(val).toLowerCase().includes(filterValue);
                }
            });
        }

        function renderTable() {
            const source = isEditing ? editRecords : records;
            const filtered = getFilteredRecords(source);
            dbBody.innerHTML = '';
            if (filtered.length === 0) {
                dbBody.innerHTML = `<tr><td colspan="9" class="empty-msg">Нет записей.</td></tr>`;
                rowCount.textContent = records.length + ' записей';
                return;
            }
            if (groupedView) {
                const groups = {};
                filtered.forEach(rec => {
                    const key = rec.year + '-' + rec.month;
                    if (!groups[key]) {
                        groups[key] = { year: rec.year, month: rec.month, records: [] };
                    }
                    groups[key].records.push(rec);
                });
                const sortedKeys = Object.keys(groups).sort((a,b) => {
                    const [y1,m1] = a.split('-').map(Number);
                    const [y2,m2] = b.split('-').map(Number);
                    return y1 - y2 || m1 - m2;
                });
                let grandTotal = 0;
                sortedKeys.forEach(key => {
                    const g = groups[key];
                    const total = g.records.reduce((sum, r) => sum + r.count, 0);
                    grandTotal += total;
                    const trHeader = document.createElement('tr');
                    trHeader.className = 'month-header';
                    trHeader.dataset.monthKey = key;
                    trHeader.innerHTML = `<td colspan="9">
                        <span class="month-toggle">${g.year} - ${getMonthName(g.month)} (всего: ${total})</span>
                    </td>`;
                    trHeader.addEventListener('click', function() {
                        const detailRows = document.querySelectorAll(`tr[data-parent="${key}"]`);
                        const isHidden = detailRows.length > 0 && detailRows[0].classList.contains('hidden');
                        detailRows.forEach(row => row.classList.toggle('hidden', !isHidden));
                        this.querySelector('.month-toggle').classList.toggle('open', isHidden);
                    });
                    dbBody.appendChild(trHeader);
                    g.records.forEach(rec => {
                        const tr = document.createElement('tr');
                        tr.className = 'month-detail hidden';
                        tr.dataset.parent = key;
                        const fields = ['year', 'month', 'codeFrom', 'stationFrom', 'codeTo', 'stationTo', 'type', 'count'];
                        fields.forEach(field => {
                            const td = document.createElement('td');
                            const span = document.createElement('span');
                            span.className = 'text-cell';
                            let value = rec[field];
                            if (field === 'month') value = getMonthName(value);
                            else if (field === 'type') {
                                const typeMap = { 1:'1 (≤57 у.в.)',2:'2 (≤71 у.в.)',3:'3 (≤100 у.в.)',4:'4 (≤114 у.в.)',5:'5 (≤128 у.в.)',6:'6 (≥129 у.в.)' };
                                value = typeMap[value] || value;
                            }
                            span.textContent = value;
                            td.appendChild(span);
                            tr.appendChild(td);
                        });
                        const tdDel = document.createElement('td');
                        const delBtn = document.createElement('button');
                        delBtn.className = 'delete-btn';
                        delBtn.textContent = '✕';
                        delBtn.disabled = isEditing;
                        if (!isEditing) {
                            delBtn.addEventListener('click', function() {
                                if (confirm('Удалить запись?')) {
                                    const idx = records.findIndex(r => r.id === rec.id);
                                    if (idx !== -1) {
                                        records.splice(idx, 1);
                                        saveToStorage();
                                        renderTable();
                                    }
                                }
                            });
                        }
                        tdDel.appendChild(delBtn);
                        tr.appendChild(tdDel);
                        dbBody.appendChild(tr);
                    });
                });
                const trTotal = document.createElement('tr');
                trTotal.style.fontWeight = 'bold';
                trTotal.innerHTML = `<td colspan="9">Итого: ${grandTotal}</td>`;
                dbBody.appendChild(trTotal);
                rowCount.textContent = `Группировка: ${sortedKeys.length} месяцев, сумма ${grandTotal}`;
            } else {
                const sorted = [...filtered].sort((a,b) => a.year - b.year || a.month - b.month);
                sorted.forEach((rec) => {
                    const tr = document.createElement('tr');
                    const sourceArray = isEditing ? editRecords : records;
                    const origIndex = sourceArray.findIndex(r => r.id === rec.id);
                    if (origIndex === -1) return;
                    const fields = ['year', 'month', 'codeFrom', 'stationFrom', 'codeTo', 'stationTo', 'type', 'count'];
                    fields.forEach(field => {
                        const td = document.createElement('td');
                        if (isEditing) {
                            if (field === 'month') {
                                const select = document.createElement('select');
                                for (let m = 1; m <= 12; m++) {
                                    const opt = document.createElement('option');
                                    opt.value = m;
                                    opt.textContent = getMonthName(m);
                                    if (m === rec.month) opt.selected = true;
                                    select.appendChild(opt);
                                }
                                select.addEventListener('change', function() {
                                    sourceArray[origIndex].month = parseInt(this.value);
                                });
                                td.appendChild(select);
                            } else if (field === 'type') {
                                const select = document.createElement('select');
                                const typeOptions = [
                                    { value: 1, label: '1 (≤57 у.в.)' },
                                    { value: 2, label: '2 (≤71 у.в.)' },
                                    { value: 3, label: '3 (≤100 у.в.)' },
                                    { value: 4, label: '4 (≤114 у.в.)' },
                                    { value: 5, label: '5 (≤128 у.в.)' },
                                    { value: 6, label: '6 (≥129 у.в.)' }
                                ];
                                typeOptions.forEach(opt => {
                                    const option = document.createElement('option');
                                    option.value = opt.value;
                                    option.textContent = opt.label;
                                    if (opt.value === rec.type) option.selected = true;
                                    select.appendChild(option);
                                });
                                select.addEventListener('change', function() {
                                    sourceArray[origIndex].type = parseInt(this.value);
                                });
                                td.appendChild(select);
                            } else {
                                const input = document.createElement('input');
                                input.type = (field === 'year' || field === 'count') ? 'number' : 'text';
                                input.value = rec[field] !== undefined ? rec[field] : '';
                                input.addEventListener('input', function() {
                                    let val = this.value;
                                    if (field === 'year' || field === 'count') val = parseInt(val) || 0;
                                    sourceArray[origIndex][field] = val;
                                });
                                td.appendChild(input);
                            }
                        } else {
                            const span = document.createElement('span');
                            span.className = 'text-cell';
                            let value = rec[field];
                            if (field === 'month') value = getMonthName(value);
                            else if (field === 'type') {
                                const typeMap = { 1:'1 (≤57 у.в.)',2:'2 (≤71 у.в.)',3:'3 (≤100 у.в.)',4:'4 (≤114 у.в.)',5:'5 (≤128 у.в.)',6:'6 (≥129 у.в.)' };
                                value = typeMap[value] || value;
                            }
                            span.textContent = value;
                            td.appendChild(span);
                        }
                        tr.appendChild(td);
                    });
                    const tdDel = document.createElement('td');
                    const delBtn = document.createElement('button');
                    delBtn.className = 'delete-btn';
                    delBtn.textContent = '✕';
                    delBtn.disabled = isEditing;
                    if (!isEditing) {
                        delBtn.addEventListener('click', function() {
                            if (confirm('Удалить запись?')) {
                                const idx = records.findIndex(r => r.id === rec.id);
                                if (idx !== -1) {
                                    records.splice(idx, 1);
                                    saveToStorage();
                                    renderTable();
                                }
                            }
                        });
                    }
                    tdDel.appendChild(delBtn);
                    tr.appendChild(tdDel);
                    dbBody.appendChild(tr);
                });
                rowCount.textContent = records.length + ' записей';
            }
        }

        groupToggleBtn.addEventListener('click', function() {
            groupedView = !groupedView;
            this.textContent = groupedView ? 'Детали' : 'Группировка';
            renderTable();
        });

        function enableEditing() {
            if (isEditing) return;
            editRecords = JSON.parse(JSON.stringify(records));
            isEditing = true;
            updateEditButtons();
            renderTable();
        }
        function saveEditing() {
            if (!isEditing) return;
            records = JSON.parse(JSON.stringify(editRecords));
            saveToStorage();
            isEditing = false;
            editRecords = [];
            updateEditButtons();
            renderTable();
        }
        function cancelEditing() {
            if (!isEditing) return;
            isEditing = false;
            editRecords = [];
            updateEditButtons();
            renderTable();
        }
        function updateEditButtons() {
            if (isEditing) {
                editBtn.style.display = 'none';
                saveEditBtn.style.display = 'inline-block';
                cancelEditBtn.style.display = 'inline-block';
                importBtn.disabled = true;
                saveJsonBtn.disabled = true;
                loadJsonBtn.disabled = true;
                groupToggleBtn.disabled = true;
            } else {
                editBtn.style.display = 'inline-block';
                saveEditBtn.style.display = 'none';
                cancelEditBtn.style.display = 'none';
                importBtn.disabled = false;
                saveJsonBtn.disabled = false;
                loadJsonBtn.disabled = false;
                groupToggleBtn.disabled = false;
            }
        }

        let pendingExcelData = null;
        function handleExcelImport(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    let startRow = 0;
                    if (json.length > 0) {
                        const firstRow = json[0];
                        const headerStr = firstRow.join(' ').toLowerCase();
                        if (headerStr.includes('код') && headerStr.includes('станция')) startRow = 1;
                    }
                    const excelData = [];
                    for (let i = startRow; i < json.length; i++) {
                        const row = json[i];
                        if (!row || row.length < 6) continue;
                        if (row.every(cell => cell === undefined || cell === null || cell === '')) continue;
                        const codeFrom = String(row[0] || '').trim();
                        const stationFrom = String(row[1] || '').trim();
                        const codeTo = String(row[2] || '').trim();
                        const stationTo = String(row[3] || '').trim();
                        let type = parseInt(row[4]) || 1;
                        if (type < 1 || type > 6) type = 1;
                        const count = parseInt(row[5]) || 0;
                        if (codeFrom && stationFrom && codeTo && stationTo) {
                            excelData.push({ codeFrom, stationFrom, codeTo, stationTo, type, count });
                        }
                    }
                    if (excelData.length === 0) {
                        alert('Не найдено данных для импорта. Проверьте формат файла.');
                        return;
                    }
                    pendingExcelData = excelData;
                    modal.classList.add('active');
                } catch (err) {
                    alert('Ошибка при чтении Excel: ' + err.message);
                }
            };
            reader.readAsArrayBuffer(file);
        }
        modalConfirm.addEventListener('click', function() {
            const year = parseInt(modalYear.value) || 2026;
            const month = parseInt(modalMonth.value) || 1;
            if (!pendingExcelData || pendingExcelData.length === 0) {
                alert('Нет данных для импорта.');
                modal.classList.remove('active');
                return;
            }
            pendingExcelData.forEach(item => {
                records.push({
                    id: nextId++,
                    year: year,
                    month: month,
                    codeFrom: item.codeFrom,
                    stationFrom: item.stationFrom,
                    codeTo: item.codeTo,
                    stationTo: item.stationTo,
                    type: item.type,
                    count: item.count
                });
            });
            saveToStorage();
            renderTable();
            const count = pendingExcelData.length;
            pendingExcelData = null;
            modal.classList.remove('active');
            alert(`Импортировано ${count} записей.`);
        });
        modalCancel.addEventListener('click', function() {
            pendingExcelData = null;
            modal.classList.remove('active');
        });

        function saveFullState() {
            const positions = {};
            const unplaced = [];
            mapWidgets.forEach(w => {
                if (w.tableX === null || w.tableY === null) {
                    unplaced.push({
                        key: w.key,
                        anchorNx: mapWidth ? w.anchorX / mapWidth : 0,
                        anchorNy: mapHeight ? w.anchorY / mapHeight : 0,
                        number: w.number,
                        isRemote: true
                    });
                } else {
                    positions[w.key] = {
                        anchorNx: mapWidth ? w.anchorX / mapWidth : 0,
                        anchorNy: mapHeight ? w.anchorY / mapHeight : 0,
                        tableNx: mapWidth ? w.tableX / mapWidth : 0,
                        tableNy: mapHeight ? w.tableY / mapHeight : 0,
                        isRemote: !!w.isRemote,
                        number: w.number
                    };
                }
            });
            const mapState = {
                selectedKeys: selectedKeys.slice(),
                positions: positions,
                unplaced: unplaced,
                mapSize: { width: mapWidth, height: mapHeight },
                transform: {
                    tx: mapTransform.tx,
                    ty: mapTransform.ty,
                    scale: mapTransform.scale
                },
                displayMode: currentDisplayMode,
                anchorCounter: anchorCounter,
                period: {
                    type: periodType.value,
                    yearFrom: periodYearFrom.value,
                    monthFrom: periodMonthFrom.value,
                    yearTo: periodYearTo.value,
                    monthTo: periodMonthTo.value
                }
            };
            const full = {
                version: 2,
                type: 'container-train-map-project',
                savedAt: new Date().toISOString(),
                records: records,
                mapState: mapState
            };
            const json = JSON.stringify(full, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'проект_карты_' + new Date().toISOString().slice(0,10) + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function loadFullState(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    const isFullProject = Array.isArray(data.records);
                    const isLegacyMapState = Array.isArray(data.selectedKeys) && data.positions && data.transform;
                    if (!isFullProject && !isLegacyMapState) throw new Error('Неверный формат файла проекта');

                    const ms = isFullProject ? (data.mapState || {}) : data;
                    if (isFullProject) {
                        records = data.records.map((item, index) => ({
                            ...item,
                            id: Number(item.id) || index + 1
                        }));
                        nextId = records.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
                    }
                    saveToStorage();
                    renderTable();

                    if (ms.period) {
                        periodType.value = ms.period.type === 'range' ? 'range' : 'month';
                        periodYearFrom.value = ms.period.yearFrom || periodYearFrom.value;
                        periodMonthFrom.value = ms.period.monthFrom || periodMonthFrom.value;
                        periodYearTo.value = ms.period.yearTo || periodYearTo.value;
                        periodMonthTo.value = ms.period.monthTo || periodMonthTo.value;
                        periodType.dispatchEvent(new Event('change'));
                    }
                    const restoredAnchorCounter = Number(ms.anchorCounter) || 0;
                    anchorCounter = 0;
                    if (ms.transform) {
                        mapTransform.tx = Number(ms.transform.tx) || 0;
                        mapTransform.ty = Number(ms.transform.ty) || 0;
                        mapTransform.scale = Math.max(0.25, Math.min(5, Number(ms.transform.scale) || 1));
                        updateMapTransform();
                    }

                    allGroups = getAllGroups();
                    selectedKeys = Array.isArray(ms.selectedKeys)
                        ? ms.selectedKeys.filter(key => allGroups[key])
                        : [];
                    mapWidgets = [];
                    placementQueue = [];
                    unplacedWidgets = [];

                    if (selectedKeys.length > 0) {
                        if (ms.displayMode) currentDisplayMode = ms.displayMode;
                        generateMapTables(selectedKeys, currentDisplayMode);
                        placementQueue = [];
                        unplacedWidgets = [];

                        mapWidgets.forEach(w => {
                            const pos = ms.positions && ms.positions[w.key];
                            if (pos) {
                                w.anchorX = Number(pos.anchorNx) * mapWidth;
                                w.anchorY = Number(pos.anchorNy) * mapHeight;
                                w.tableX = Number(pos.tableNx) * mapWidth;
                                w.tableY = Number(pos.tableNy) * mapHeight;
                                w.isRemote = !!pos.isRemote;
                                w.number = Number(pos.number) || w.number;
                            }
                        });

                        if (Array.isArray(ms.unplaced)) {
                            ms.unplaced.forEach(u => {
                                const w = mapWidgets.find(widget => widget.key === u.key);
                                if (!w) return;
                                const anchorNx = Number.isFinite(Number(u.anchorNx))
                                    ? Number(u.anchorNx)
                                    : (Number(u.anchorX) / (ms.mapSize?.width || mapWidth));
                                const anchorNy = Number.isFinite(Number(u.anchorNy))
                                    ? Number(u.anchorNy)
                                    : (Number(u.anchorY) / (ms.mapSize?.height || mapHeight));
                                w.anchorX = Number.isFinite(anchorNx) ? anchorNx * mapWidth : w.anchorX;
                                w.anchorY = Number.isFinite(anchorNy) ? anchorNy * mapHeight : w.anchorY;
                                w.tableX = null;
                                w.tableY = null;
                                w.isRemote = true;
                                w.number = Number(u.number) || w.number;
                                unplacedWidgets.push(w);
                            });
                        }
                    }
                    anchorCounter = Math.max(
                        restoredAnchorCounter,
                        0,
                        ...mapWidgets.map(widget => Number(widget.number) || 0)
                    );

                    saveMapPositions();
                    saveMapSelection();
                    renderMapWidgets();
                    updatePlacementHint();
                    alert(isFullProject
                        ? `Проект загружен: ${records.length} записей, координаты и настройки карты восстановлены.`
                        : 'Старое состояние карты загружено. База данных оставлена без изменений.');
                } catch (err) {
                    alert('Ошибка при загрузке: ' + err.message);
                }
            };
            reader.readAsText(file);
        }

        saveJsonBtn.addEventListener('click', function() { if (!isEditing) saveFullState(); });
        loadJsonBtn.addEventListener('click', function() {
            if (isEditing) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(e) {
                if (this.files && this.files[0]) loadFullState(this.files[0]);
            };
            input.click();
        });

        importBtn.addEventListener('click', function() {
            if (isEditing) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls';
            input.onchange = function(e) {
                if (this.files && this.files[0]) handleExcelImport(this.files[0]);
            };
            input.click();
        });
        editBtn.addEventListener('click', enableEditing);
        saveEditBtn.addEventListener('click', saveEditing);
        cancelEditBtn.addEventListener('click', cancelEditing);
        applyFilterBtn.addEventListener('click', applyFilter);
        clearFilterBtn.addEventListener('click', clearFilter);
        filterValueEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') applyFilter(); });

        tabs.forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.dataset.tab;
                tabs.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                Object.keys(tabPages).forEach(key => {
                    tabPages[key].classList.toggle('active', key === tab);
                });
                if (tab === 'map') applyMapInitial();
            });
        });

        // ---------- Карта ----------
        periodType.addEventListener('change', function() {
            const isRange = this.value === 'range';
            periodYearTo.style.display = isRange ? 'inline-block' : 'none';
            periodMonthTo.style.display = isRange ? 'inline-block' : 'none';
            rangeSeparator.style.display = isRange ? 'inline' : 'none';
        });
        periodType.dispatchEvent(new Event('change'));

        function getDaysInPeriod(yearFrom, monthFrom, yearTo, monthTo) {
            let totalDays = 0;
            let currentYear = yearFrom, currentMonth = monthFrom;
            while (currentYear < yearTo || (currentYear === yearTo && currentMonth <= monthTo)) {
                totalDays += new Date(currentYear, currentMonth, 0).getDate();
                currentMonth++;
                if (currentMonth > 12) { currentMonth = 1; currentYear++; }
            }
            return totalDays;
        }

        function getPeriodData() {
            const isRange = periodType.value === 'range';
            let yearFrom = parseInt(periodYearFrom.value) || 2026;
            let monthFrom = parseInt(periodMonthFrom.value) || 1;
            let yearTo = parseInt(periodYearTo.value) || 2026;
            let monthTo = parseInt(periodMonthTo.value) || 12;
            if (!isRange) { yearTo = yearFrom; monthTo = monthFrom; }
            const result = [];
            records.forEach(rec => {
                const recYear = rec.year || 0, recMonth = rec.month || 0;
                let startOk = (recYear > yearFrom) || (recYear === yearFrom && recMonth >= monthFrom);
                let endOk = (recYear < yearTo) || (recYear === yearTo && recMonth <= monthTo);
                if (startOk && endOk) result.push(rec);
            });
            return result;
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        }
        function getAllGroups() {
            const groups = {};
            records.forEach(rec => {
                const codes = [rec.codeFrom, rec.codeTo].sort();
                const key = codes[0] + '–' + codes[1];
                if (!groups[key]) {
                    groups[key] = { key: key, station1: '', station2: '', records: [] };
                }
                groups[key].records.push(rec);
            });
            for (const key in groups) {
                const group = groups[key];
                const stations = new Set();
                group.records.forEach(r => { stations.add(r.stationFrom); stations.add(r.stationTo); });
                const arr = Array.from(stations);
                if (arr.length === 2) { group.station1 = arr[0]; group.station2 = arr[1]; }
                else if (arr.length === 1) { group.station1 = arr[0]; group.station2 = arr[0]; }
                let foundEven = null;
                const s1 = group.station1, s2 = group.station2;
                const direct1 = s1 + ' - ' + s2, direct2 = s2 + ' - ' + s1;
                if (EVEN_SEGMENTS.includes(direct1)) foundEven = { from: s1, to: s2 };
                else if (EVEN_SEGMENTS.includes(direct2)) foundEven = { from: s2, to: s1 };
                group.evenDirection = foundEven;
            }
            return groups;
        }

        function showSegmentSelector() {
            const groups = getAllGroups();
            const keys = Object.keys(groups);
            if (keys.length === 0) { alert('В базе данных нет перегонов.'); return; }
            allGroups = groups;
            draftSelectedKeys = new Set(selectedKeys);
            segmentSearch.value = '';
            renderSegmentList(groups, '');
            const allKeys = Object.keys(groups);
            selectAllSegments.checked = allKeys.every(key => draftSelectedKeys.has(key));
            selectAllSegments.onchange = function() {
                Object.keys(allGroups).forEach(key => {
                    if (this.checked) draftSelectedKeys.add(key);
                    else draftSelectedKeys.delete(key);
                });
                renderSegmentList(allGroups, segmentSearch.value);
            };
            selectModal.classList.add('active');
            setTimeout(() => segmentSearch.focus(), 100);
        }

        function renderSegmentList(groups, searchText) {
            const keys = Object.keys(groups);
            const lowerSearch = searchText.toLowerCase();
            const filteredKeys = keys.filter(key => {
                const group = groups[key];
                return (group.station1 + ' – ' + group.station2).toLowerCase().includes(lowerSearch);
            });
            let html = '';
            filteredKeys.forEach(key => {
                const group = groups[key];
                const title = group.station1 + ' – ' + group.station2;
                const checked = draftSelectedKeys.has(key) ? 'checked' : '';
                html += `<label><input type="checkbox" value="${escapeHtml(key)}" ${checked}> ${escapeHtml(title)}</label>`;
            });
            segmentsList.innerHTML = html;
            const allCheckboxes = segmentsList.querySelectorAll('input[type="checkbox"]');
            const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(cb => cb.checked);
            selectAllSegments.checked = allChecked;
            allCheckboxes.forEach(cb => {
                cb.addEventListener('change', function() {
                    if (this.checked) draftSelectedKeys.add(this.value);
                    else draftSelectedKeys.delete(this.value);
                    selectAllSegments.checked = Object.keys(allGroups).every(key => draftSelectedKeys.has(key));
                });
            });
        }

        segmentSearch.addEventListener('input', function() {
            renderSegmentList(allGroups, this.value);
        });

        function generateMapTables(selectedKeysArray, mode) {
            if (mode === undefined) mode = currentDisplayMode;
            else currentDisplayMode = mode;

            if (!selectedKeysArray || selectedKeysArray.length === 0) {
                mapWidgets = []; selectedKeys = []; placementQueue = [];
                unplacedWidgets = [];
                renderMapWidgets(); updatePlacementHint(); saveMapPositions(); saveMapSelection();
                return;
            }

            const existingKeys = mapWidgets.map(w => w.key);
            const newKeys = selectedKeysArray.filter(key => !existingKeys.includes(key));
            selectedKeysArray.forEach(key => { if (!selectedKeys.includes(key)) selectedKeys.push(key); });

            const periodData = getPeriodData();
            const periodGroups = {};
            periodData.forEach(rec => {
                const codes = [rec.codeFrom, rec.codeTo].sort();
                const key = codes[0] + '–' + codes[1];
                if (!periodGroups[key]) periodGroups[key] = { key: key, records: [] };
                periodGroups[key].records.push(rec);
            });
            const isRange = periodType.value === 'range';
            let yearFrom = parseInt(periodYearFrom.value) || 2026;
            let monthFrom = parseInt(periodMonthFrom.value) || 1;
            let yearTo = parseInt(periodYearTo.value) || 2026;
            let monthTo = parseInt(periodMonthTo.value) || 12;
            if (!isRange) { yearTo = yearFrom; monthTo = monthFrom; }
            const totalDays = getDaysInPeriod(yearFrom, monthFrom, yearTo, monthTo);
            if (totalDays === 0) { alert('Количество дней в периоде равно 0. Проверьте даты.'); return; }

            let typeGroups;
            if (mode === 'short') {
                typeGroups = [
                    { label: '≤57 у.в.', types: [1] },
                    { label: '58-75 у.в.', types: [2] },
                    { label: '76-100 у.в.', types: [3] },
                    { label: '>100 у.в.', types: [4,5,6] }
                ];
            } else {
                typeGroups = [
                    { label: '≤57 у.в.', types: [1] },
                    { label: '≤71 у.в.', types: [2] },
                    { label: '≤100 у.в.', types: [3] },
                    { label: '≤114 у.в.', types: [4] },
                    { label: '≤128 у.в.', types: [5] },
                    { label: '≥129 у.в.', types: [6] }
                ];
            }

            const newWidgets = [];
            selectedKeysArray.forEach(key => {
                const group = allGroups[key];
                if (!group) return;
                let existing = mapWidgets.find(w => w.key === key);
                let widget;
                if (existing) {
                    widget = existing;
                } else {
                    const index = mapWidgets.length + newWidgets.length;
                    const anchorX = mapWidth * (0.18 + (index % 4) * 0.2);
                    const anchorY = mapHeight * (0.35 + (Math.floor(index / 4) % 3) * 0.22);
                    widget = {
                        id: 'mapw-' + (mapWidgetId++),
                        key: key,
                        title: group.station1 + ' – ' + group.station2,
                        anchorX: anchorX,
                        anchorY: anchorY,
                        tableX: null,
                        tableY: null,
                        isRemote: false,
                        data: null,
                        number: ++anchorCounter
                    };
                    newWidgets.push(widget);
                }

                const periodGroup = periodGroups[key];
                let periodRecords = periodGroup ? periodGroup.records : [];
                let directRecords = [], reverseRecords = [];
                if (group.evenDirection) {
                    const evenFrom = group.evenDirection.from, evenTo = group.evenDirection.to;
                    periodRecords.forEach(rec => {
                        if (rec.stationFrom === evenFrom && rec.stationTo === evenTo) directRecords.push(rec);
                        else reverseRecords.push(rec);
                    });
                } else {
                    const evenFrom = group.station1, evenTo = group.station2;
                    periodRecords.forEach(rec => {
                        if (rec.stationFrom === evenFrom && rec.stationTo === evenTo) directRecords.push(rec);
                        else reverseRecords.push(rec);
                    });
                }

                const directSum = {}, reverseSum = {};
                directRecords.forEach(r => { const t = r.type; if (!directSum[t]) directSum[t] = 0; directSum[t] += r.count; });
                reverseRecords.forEach(r => { const t = r.type; if (!reverseSum[t]) reverseSum[t] = 0; reverseSum[t] += r.count; });

                const rows = typeGroups.map(g => {
                    let evenTotal = 0, oddTotal = 0;
                    g.types.forEach(t => {
                        evenTotal += directSum[t] || 0;
                        oddTotal += reverseSum[t] || 0;
                    });
                    return {
                        label: g.label,
                        types: g.types,
                        evenTotal: evenTotal,
                        evenAvg: evenTotal / totalDays,
                        oddTotal: oddTotal,
                        oddAvg: oddTotal / totalDays
                    };
                }).filter(row => row.evenTotal > 0 || row.oddTotal > 0);

                const totalEven = rows.reduce((s, r) => s + r.evenTotal, 0);
                const totalOdd = rows.reduce((s, r) => s + r.oddTotal, 0);
                const avgEven = totalEven / totalDays, avgOdd = totalOdd / totalDays;
                widget.data = { rows, totalEven, totalOdd, avgEven, avgOdd,
                    breakdown: { directRecords, reverseRecords, yearFrom, monthFrom, yearTo, monthTo, isRange } };
            });

            newWidgets.forEach(w => {
                mapWidgets.push(w);
                w.tableX = null;
                w.tableY = null;
                placementQueue.push({ key: w.key, mode: null });
            });

            loadMapPositions();
            renderMapWidgets();
            updatePlacementHint();
            saveMapPositions();
            saveMapSelection();
        }

        function saveMapPositions() {
            const pos = {};
            const unplaced = [];
            mapWidgets.forEach(w => {
                if (w.tableX === null || w.tableY === null) {
                    unplaced.push({ key: w.key, anchorX: w.anchorX, anchorY: w.anchorY, number: w.number, isRemote: true });
                } else {
                    pos[w.key] = {
                        anchorNx: Math.max(0, Math.min(1, w.anchorX / mapWidth)),
                        anchorNy: Math.max(0, Math.min(1, w.anchorY / mapHeight)),
                        tableNx: Math.max(0, Math.min(1, w.tableX / mapWidth)),
                        tableNy: Math.max(0, Math.min(1, w.tableY / mapHeight)),
                        isRemote: !!w.isRemote,
                        number: w.number
                    };
                }
            });
            storageSet('mapWidgetPositions', JSON.stringify(pos));
            storageSet('mapUnplaced', JSON.stringify(unplaced));
            storageSet('anchorCounter', String(anchorCounter));
        }

        function saveMapSelection() { storageSet('mapSelectedKeys', JSON.stringify(selectedKeys)); }

        function loadMapPositions() {
            const restoredKeys = new Set();
            const stored = storageGet('mapWidgetPositions');
            if (stored) {
                try {
                    const pos = JSON.parse(stored);
                    mapWidgets.forEach(w => {
                        if (pos[w.key]) {
                            const p = pos[w.key];
                            if (
                                Number.isFinite(p.anchorNx) &&
                                Number.isFinite(p.anchorNy) &&
                                Number.isFinite(p.tableNx) &&
                                Number.isFinite(p.tableNy)
                            ) {
                                w.anchorX = p.anchorNx * mapWidth;
                                w.anchorY = p.anchorNy * mapHeight;
                                w.tableX = p.tableNx * mapWidth;
                                w.tableY = p.tableNy * mapHeight;
                                w.isRemote = !!p.isRemote;
                                if (p.number) w.number = p.number;
                                restoredKeys.add(w.key);
                            }
                        }
                    });
                } catch(e) {}
            }
            const storedUnplaced = storageGet('mapUnplaced');
            if (storedUnplaced) {
                try {
                    const unplaced = JSON.parse(storedUnplaced);
                    unplaced.forEach(u => {
                        const w = mapWidgets.find(w => w.key === u.key);
                        if (w) {
                            w.anchorX = u.anchorX || w.anchorX;
                            w.anchorY = u.anchorY || w.anchorY;
                            w.tableX = null;
                            w.tableY = null;
                            w.isRemote = true;
                            if (u.number) w.number = u.number;
                            if (!unplacedWidgets.includes(w)) unplacedWidgets.push(w);
                            restoredKeys.add(w.key);
                        }
                    });
                } catch(e) {}
            }
            placementQueue = placementQueue.filter(item => !restoredKeys.has(item.key));
            const storedCounter = storageGet('anchorCounter');
            if (storedCounter) {
                const val = parseInt(storedCounter);
                if (!isNaN(val) && val > anchorCounter) anchorCounter = val;
            }
        }

        const detailTip = document.createElement('div');
        detailTip.className = 'monthly-tooltip';
        detailTip.setAttribute('role', 'tooltip');
        detailTip.id = 'monthlyDetail';
        detailTip.hidden = true;
        document.body.appendChild(detailTip);
        function attachBreakdown(cell, widget, types, direction) {
            const b = widget.data.breakdown;
            if (!b || !b.isRange) return;
            cell.tabIndex = 0;
            cell.classList.add('has-breakdown');
            cell.setAttribute('aria-describedby', detailTip.id);
            function show() {
                const sums = new Map();
                const source = direction === 'even' ? b.directRecords : b.reverseRecords;
                source.filter(r => types.includes(r.type)).forEach(r => {
                    const k = r.year * 12 + r.month - 1;
                    sums.set(k, (sums.get(k) || 0) + r.count);
                });
                detailTip.replaceChildren();
                const heading = document.createElement('strong');
                heading.textContent = widget.title + ' · ' + (direction === 'even' ? 'ЧЕТ' : 'НЕЧЕТ');
                detailTip.append(heading);
                const caption = document.createElement('p');
                caption.textContent = 'Месяц · поездов / в сутки';
                detailTip.append(caption);
                const peak = Math.max(0, ...sums.values());
                for (let k = b.yearFrom*12+b.monthFrom-1; k <= b.yearTo*12+b.monthTo-1; k++) {
                    const year = Math.floor(k/12), month = k%12+1, count = sums.get(k) || 0;
                    const line = document.createElement('div');
                    line.textContent = getMonthName(month) + ' ' + year + ' · ' + count + ' / ' + (count / new Date(year, month, 0).getDate()).toFixed(1);
                    if (count > 0 && count === peak) {
                        line.classList.add('peak-month');
                        line.textContent += ' ★ Максимум';
                    }
                    detailTip.append(line);
                }
                detailTip.hidden = false;
                const rect = cell.getBoundingClientRect();
                detailTip.style.left = Math.max(8, Math.min(rect.left, innerWidth-detailTip.offsetWidth-8)) + 'px';
                detailTip.style.top = Math.max(8, Math.min(rect.bottom+8, innerHeight-detailTip.offsetHeight-8)) + 'px';
            }
            cell.addEventListener('mouseenter', show);
            cell.addEventListener('focus', show);
            cell.addEventListener('mouseleave', () => detailTip.hidden = true);
            cell.addEventListener('blur', () => detailTip.hidden = true);
        }
        document.addEventListener('keydown', e => { if (e.key === 'Escape') detailTip.hidden = true; });

        function renderMapWidgets() {
            mapTablesContainer.innerHTML = '';
            connectorLayer.innerHTML = '';
            if (mapWidgets.length === 0) return;

            mapWidgets.forEach(w => {
                const anchor = document.createElement('button');
                anchor.type = 'button';
                anchor.className = 'map-anchor' + (w.isRemote ? ' remote-anchor' : '');
                anchor.id = 'anchor-' + w.id;
                anchor.setAttribute(
                    'aria-label',
                    w.isRemote ? `Точка №${w.number}, ${w.title}` : `Точка участка ${w.title}`
                );
                anchor.title = w.isRemote ? `№${w.number} — ${w.title}` : w.title;
                anchor.textContent = w.isRemote ? w.number : '';
                anchor.addEventListener('mousedown', e => startDragAnchor(e, w.id));
                anchor.addEventListener('touchstart', e => startDragAnchorTouch(e, w.id), { passive: false });
                mapTablesContainer.appendChild(anchor);
            });

            mapWidgets.forEach(w => {
                if (w.tableX === null || w.tableY === null) return;
                const div = document.createElement('div');
                div.className = 'map-table-widget';
                div.id = w.id;
                div.setAttribute('aria-label', `Участок ${w.title}, таблица №${w.number}`);
                div.title = w.title;

                if (w.isRemote) {
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'widget-title';
                    titleDiv.textContent = `№${w.number}`;
                    div.appendChild(titleDiv);
                }

                const closeBtn = document.createElement('button');
                closeBtn.className = 'close-btn';
                closeBtn.dataset.key = w.key;
                closeBtn.textContent = '✕';
                div.appendChild(closeBtn);

                const table = document.createElement('table');
                const tbody = document.createElement('tbody');
                const headRow = document.createElement('tr');
                headRow.className = 'header-row';
                headRow.innerHTML = `<td class="label-cell">КРИТЕРИЙ</td><td class="even-cell">ЧЕТ</td><td class="odd-cell">НЕЧЕТ</td>`;
                tbody.appendChild(headRow);
                w.data.rows.forEach(row => {
                    const tr = document.createElement('tr');
                    const evenText = row.evenTotal > 0 ? `${row.evenTotal} / ${row.evenAvg.toFixed(1)}` : '- / -';
                    const oddText = row.oddTotal > 0 ? `${row.oddTotal} / ${row.oddAvg.toFixed(1)}` : '- / -';
                    tr.innerHTML = `<td class="label-cell">${row.label}</td><td class="even-cell">${evenText}</td><td class="odd-cell">${oddText}</td>`;
                    attachBreakdown(tr.children[1], w, row.types, 'even');
                    attachBreakdown(tr.children[2], w, row.types, 'odd');
                    tbody.appendChild(tr);
                });
                if (w.data.rows.length === 0) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `<td class="label-cell" colspan="3">Нет данных за выбранный период</td>`;
                    tbody.appendChild(emptyRow);
                }
                const totalRow = document.createElement('tr');
                totalRow.className = 'total-row';
                totalRow.innerHTML = `<td class="label-cell"><strong>Итого</strong></td>
                                    <td class="even-cell"><strong>${w.data.totalEven} / ${w.data.avgEven.toFixed(1)}</strong></td>
                                    <td class="odd-cell"><strong>${w.data.totalOdd} / ${w.data.avgOdd.toFixed(1)}</strong></td>`;
                attachBreakdown(totalRow.children[1], w, [1,2,3,4,5,6], 'even');
                attachBreakdown(totalRow.children[2], w, [1,2,3,4,5,6], 'odd');
                tbody.appendChild(totalRow);
                table.appendChild(tbody);
                div.appendChild(table);

                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const key = this.dataset.key;
                    const idx = mapWidgets.findIndex(w => w.key === key);
                    if (idx !== -1) {
                        const ui = unplacedWidgets.findIndex(w => w.key === key);
                        if (ui !== -1) unplacedWidgets.splice(ui, 1);
                        placementQueue = placementQueue.filter(item => item.key !== key);
                        const keyIdx = selectedKeys.indexOf(key);
                        if (keyIdx !== -1) selectedKeys.splice(keyIdx, 1);
                        mapWidgets.splice(idx, 1);
                        renderMapWidgets();
                        updatePlacementHint();
                        saveMapPositions();
                        saveMapSelection();
                    }
                });

                div.addEventListener('mousedown', (e) => { if (!e.target.closest('.close-btn')) startDragWidget(e, w.id); });
                div.addEventListener('touchstart', (e) => { if (!e.target.closest('.close-btn')) startDragWidgetTouch(e, w.id); }, { passive: true });
                mapTablesContainer.appendChild(div);
            });

            requestAnimationFrame(updateWidgetScreenPositions);
        }

        function mapPointToContainer(mapX, mapY) {
            const point = mapSvg.createSVGPoint();
            point.x = mapX; point.y = mapY;
            const matrix = mapGroup.getScreenCTM();
            if (!matrix) return { x: 0, y: 0 };
            const screen = point.matrixTransform(matrix);
            const rect = mapContainer.getBoundingClientRect();
            return { x: screen.x - rect.left, y: screen.y - rect.top };
        }

        function clientPointToMap(clientX, clientY) {
            const point = mapSvg.createSVGPoint();
            point.x = clientX; point.y = clientY;
            const matrix = mapGroup.getScreenCTM();
            if (!matrix) return null;
            return point.matrixTransform(matrix.inverse());
        }

        function updateWidgetScreenPositions() {
            const rect = mapContainer.getBoundingClientRect();
            connectorLayer.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
            connectorLayer.innerHTML = '';
            mapWidgets.forEach(w => {
                const anchorPos = mapPointToContainer(w.anchorX, w.anchorY);
                const anchor = document.getElementById('anchor-' + w.id);
                if (anchor) {
                    anchor.style.left = anchorPos.x + 'px';
                    anchor.style.top = anchorPos.y + 'px';
                }
                if (w.tableX === null || w.tableY === null) return;
                const tablePos = mapPointToContainer(w.tableX, w.tableY);
                const el = document.getElementById(w.id);
                if (el) {
                    const widgetScale = Math.max(0.0625, mapTransform.scale / 4);
                    el.style.left = tablePos.x + 'px';
                    el.style.top = tablePos.y + 'px';
                    el.style.setProperty('--widget-scale', widgetScale);
                    el.style.setProperty('--tooltip-scale', 1 / widgetScale);
                }
                if (!w.isRemote) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('class', 'connector-line');
                    line.setAttribute('x1', anchorPos.x);
                    line.setAttribute('y1', anchorPos.y);
                    line.setAttribute('x2', tablePos.x);
                    line.setAttribute('y2', tablePos.y);
                    connectorLayer.appendChild(line);
                }
            });
        }

        function updatePlacementHint() {
            const queueLen = placementQueue.length;
            const unplacedLen = unplacedWidgets.length;
            if (queueLen === 0 && unplacedLen === 0) {
                placementHint.classList.remove('active');
                placementHint.textContent = '';
                mapContainer.classList.remove('placing');
                return;
            }
            let msg = '';
            if (queueLen > 0) {
                msg += `Ожидают размещения: ${queueLen} участков. Кликните на карте для размещения точки. `;
            }
            if (unplacedLen > 0) {
                msg += `Неразмещённых таблиц: ${unplacedLen}. Кликните на карте для размещения таблицы.`;
            }
            placementHint.textContent = msg;
            placementHint.classList.add('active');
            mapContainer.classList.add('placing');
        }

        function placeNextWidget(clientX, clientY) {
            if (placementQueue.length === 0) return false;
            const item = placementQueue[0];
            const widget = mapWidgets.find(w => w.key === item.key);
            if (!widget) return false;

            placeModeTitle.textContent = widget.title + ' (№' + widget.number + ')';

            const actionsDiv = placeModeModal.querySelector('.modal-actions');
            actionsDiv.innerHTML = '';

            const normalBtn = document.createElement('button');
            normalBtn.className = 'confirm';
            normalBtn.id = 'placeModeNormal';
            normalBtn.textContent = 'Выноска';
            normalBtn.style.background = '#2b6cb0';

            const remoteBtn = document.createElement('button');
            remoteBtn.className = 'confirm';
            remoteBtn.id = 'placeModeRemote';
            remoteBtn.textContent = 'Удалённая выноска';
            remoteBtn.style.background = '#e53e3e';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel';
            cancelBtn.id = 'placeModeCancel';
            cancelBtn.textContent = 'Отмена';

            actionsDiv.appendChild(normalBtn);
            actionsDiv.appendChild(remoteBtn);
            actionsDiv.appendChild(cancelBtn);

            const onNormal = function() {
                placeModeModal.classList.remove('active');
                const point = clientPointToMap(clientX, clientY);
                if (!point) return;
                widget.anchorX = Math.max(0, Math.min(mapWidth, point.x));
                widget.anchorY = Math.max(0, Math.min(mapHeight, point.y));
                widget.tableX = Math.max(0, Math.min(mapWidth, point.x + 240 / mapTransform.scale));
                widget.tableY = Math.max(0, Math.min(mapHeight, point.y - 40 / mapTransform.scale));
                widget.isRemote = false;
                placementQueue.shift();
                renderMapWidgets();
                updatePlacementHint();
                saveMapPositions();
                saveMapSelection();
            };

            const onRemote = function() {
                placeModeModal.classList.remove('active');
                const point = clientPointToMap(clientX, clientY);
                if (!point) return;
                widget.anchorX = Math.max(0, Math.min(mapWidth, point.x));
                widget.anchorY = Math.max(0, Math.min(mapHeight, point.y));
                widget.tableX = null;
                widget.tableY = null;
                widget.isRemote = true;
                placementQueue.shift();
                if (!unplacedWidgets.includes(widget)) unplacedWidgets.push(widget);
                renderMapWidgets();
                updatePlacementHint();
                saveMapPositions();
                saveMapSelection();
            };

            const onCancel = function() {
                placeModeModal.classList.remove('active');
            };

            normalBtn.addEventListener('click', onNormal);
            remoteBtn.addEventListener('click', onRemote);
            cancelBtn.addEventListener('click', onCancel);

            placeModeModal.classList.add('active');
            return true;
        }

        function showPlaceTableModal(mapX, mapY) {
            if (unplacedWidgets.length === 0) return false;
            let html = '';
            const activeUnplaced = unplacedWidgets.filter(w => mapWidgets.some(mw => mw.key === w.key));
            if (activeUnplaced.length === 0) {
                html = '<p style="color:#a0aec0;">Нет доступных точек.</p>';
                placeTableList.innerHTML = html;
                placeTableModal.classList.add('active');
                return true;
            }
            activeUnplaced.forEach((w, idx) => {
                html += `<label><input type="radio" name="placeTable" value="${escapeHtml(w.key)}"> Точка ${w.number} – ${escapeHtml(w.title)}</label>`;
            });
            placeTableList.innerHTML = html;
            placeTableModal.classList.add('active');

            const confirmHandler = function() {
                const selected = document.querySelector('input[name="placeTable"]:checked');
                if (!selected) {
                    alert('Выберите точку.');
                    return;
                }
                const key = selected.value;
                const widget = unplacedWidgets.find(w => w.key === key);
                if (!widget) {
                    alert('Точка не найдена.');
                    placeTableModal.classList.remove('active');
                    updatePlacementHint();
                    return;
                }
                if (!mapWidgets.some(w => w.key === key)) {
                    const idx = unplacedWidgets.indexOf(widget);
                    if (idx !== -1) unplacedWidgets.splice(idx, 1);
                    alert('Точка была удалена.');
                    placeTableModal.classList.remove('active');
                    updatePlacementHint();
                    return;
                }
                widget.tableX = Math.max(0, Math.min(mapWidth, mapX));
                widget.tableY = Math.max(0, Math.min(mapHeight, mapY));
                const idx = unplacedWidgets.indexOf(widget);
                if (idx !== -1) unplacedWidgets.splice(idx, 1);
                renderMapWidgets();
                updatePlacementHint();
                saveMapPositions();
                saveMapSelection();
                placeTableModal.classList.remove('active');
            };
            placeTableConfirm.addEventListener('click', confirmHandler);
            placeTableCancel.onclick = function() {
                placeTableModal.classList.remove('active');
                placeTableConfirm.removeEventListener('click', confirmHandler);
            };
            return true;
        }

        let dragData = null;
        function startDragWidget(e, id) {
            e.preventDefault(); e.stopPropagation();
            const widget = mapWidgets.find(w => w.id === id);
            if (!widget) return;
            const point = clientPointToMap(e.clientX, e.clientY);
            if (!point) return;
            const offsetX = point.x - widget.tableX, offsetY = point.y - widget.tableY;
            dragData = { id, offsetX, offsetY };
            const onMove = (ev) => {
                const p = clientPointToMap(ev.clientX, ev.clientY);
                if (!p) return;
                widget.tableX = Math.max(0, Math.min(mapWidth, p.x - dragData.offsetX));
                widget.tableY = Math.max(0, Math.min(mapHeight, p.y - dragData.offsetY));
                updateWidgetScreenPositions();
                saveMapPositions();
            };
            const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); dragData = null; };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }
        function startDragWidgetTouch(e, id) {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) return;
            const widget = mapWidgets.find(w => w.id === id);
            if (!widget) return;
            const point = clientPointToMap(touch.clientX, touch.clientY);
            if (!point) return;
            const offsetX = point.x - widget.tableX, offsetY = point.y - widget.tableY;
            dragData = { id, offsetX, offsetY };
            const onMove = (ev) => {
                ev.preventDefault();
                const t = ev.touches[0];
                if (!t) return;
                const p = clientPointToMap(t.clientX, t.clientY);
                if (!p) return;
                widget.tableX = Math.max(0, Math.min(mapWidth, p.x - dragData.offsetX));
                widget.tableY = Math.max(0, Math.min(mapHeight, p.y - dragData.offsetY));
                updateWidgetScreenPositions();
                saveMapPositions();
            };
            const onUp = () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); dragData = null; };
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp, { passive: true });
        }

        function startDragAnchor(e, id) {
            e.preventDefault(); e.stopPropagation();
            const widget = mapWidgets.find(w => w.id === id);
            if (!widget) return;
            const onMove = ev => {
                const p = clientPointToMap(ev.clientX, ev.clientY);
                if (!p) return;
                widget.anchorX = Math.max(0, Math.min(mapWidth, p.x));
                widget.anchorY = Math.max(0, Math.min(mapHeight, p.y));
                updateWidgetScreenPositions();
            };
            const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); saveMapPositions(); };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }
        function startDragAnchorTouch(e, id) {
            e.preventDefault(); e.stopPropagation();
            const widget = mapWidgets.find(w => w.id === id);
            if (!widget) return;
            const onMove = ev => {
                ev.preventDefault();
                const touch = ev.touches[0];
                if (!touch) return;
                const p = clientPointToMap(touch.clientX, touch.clientY);
                if (!p) return;
                widget.anchorX = Math.max(0, Math.min(mapWidth, p.x));
                widget.anchorY = Math.max(0, Math.min(mapHeight, p.y));
                updateWidgetScreenPositions();
            };
            const onUp = () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); saveMapPositions(); };
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp, { passive: true });
        }

        let mapTransform = { tx: 0, ty: 0, scale: 1 };
        let isMapDragging = false;
        let mapStartX = 0, mapStartY = 0, mapStartTx = 0, mapStartTy = 0;

        function updateMapTransform() {
            mapGroup.setAttribute('transform', `translate(${mapTransform.tx},${mapTransform.ty}) scale(${mapTransform.scale})`);
            mapZoomInfo.textContent = `Масштаб: ${Math.round(mapTransform.scale * 100)}%`;
            mapZoomPercent.textContent = `${Math.round(mapTransform.scale * 100)}%`;
            mapZoomRange.value = Math.round(Math.max(25, Math.min(500, mapTransform.scale * 100)));
            try { localStorage.setItem('mapTransform', JSON.stringify({ tx: mapTransform.tx, ty: mapTransform.ty, scale: mapTransform.scale })); } catch(e) {}
            requestAnimationFrame(updateWidgetScreenPositions);
        }

        function applyMapInitial() {
            const savedTransform = localStorage.getItem('mapTransform');
            if (savedTransform) {
                try {
                    const t = JSON.parse(savedTransform);
                    if (t.tx !== undefined && t.ty !== undefined && t.scale) {
                        mapTransform.tx = t.tx; mapTransform.ty = t.ty;
                        mapTransform.scale = Math.max(0.25, Math.min(5, t.scale));
                        updateMapTransform(); return;
                    }
                } catch(e) {}
            }
            mapTransform.scale = 1; mapTransform.tx = 0; mapTransform.ty = 0;
            updateMapTransform();
        }

        function clientPointToSvg(clientX, clientY) {
            const point = mapSvg.createSVGPoint();
            point.x = clientX; point.y = clientY;
            const matrix = mapSvg.getScreenCTM();
            return matrix ? point.matrixTransform(matrix.inverse()) : null;
        }

        mapSvg.addEventListener('mousedown', function(e) {
            if (placementQueue.length > 0) {
                if (placeNextWidget(e.clientX, e.clientY)) {
                    e.preventDefault(); e.stopPropagation();
                    return;
                }
            }
            if (unplacedWidgets.length > 0) {
                if (showPlaceTableModal(e.clientX, e.clientY)) {
                    e.preventDefault(); e.stopPropagation();
                    return;
                }
            }
            if (e.target.closest('.map-controls') || e.target.closest('.map-table-widget') || e.target.closest('.map-anchor')) return;
            e.preventDefault();
            const point = clientPointToSvg(e.clientX, e.clientY);
            if (!point) return;
            isMapDragging = true;
            mapStartX = point.x; mapStartY = point.y;
            mapStartTx = mapTransform.tx; mapStartTy = mapTransform.ty;
            mapContainer.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', function(e) {
            if (!isMapDragging) return;
            const point = clientPointToSvg(e.clientX, e.clientY);
            if (!point) return;
            const dx = point.x - mapStartX, dy = point.y - mapStartY;
            mapTransform.tx = mapStartTx + dx; mapTransform.ty = mapStartTy + dy;
            updateMapTransform();
        });

        window.addEventListener('mouseup', function() {
            if (isMapDragging) { isMapDragging = false; mapContainer.style.cursor = 'grab'; }
        });

        mapSvg.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.08 : 0.08;
            const point = clientPointToSvg(e.clientX, e.clientY);
            if (!point) return;
            const mouseX = point.x, mouseY = point.y;
            const oldScale = mapTransform.scale;
            let newScale = oldScale * (1 + delta);
            newScale = Math.min(Math.max(newScale, 0.25), 5);
            const factor = newScale / oldScale;
            mapTransform.tx = mouseX - (mouseX - mapTransform.tx) * factor;
            mapTransform.ty = mouseY - (mouseY - mapTransform.ty) * factor;
            mapTransform.scale = newScale;
            updateMapTransform();
        }, { passive: false });

        mapSvg.addEventListener('touchstart', function(e) {
            if (!placementQueue.length || !e.touches[0]) return;
            if (placeNextWidget(e.touches[0].clientX, e.touches[0].clientY)) {
                e.preventDefault(); e.stopPropagation();
            }
        }, { passive: false });

        mapZoomIn.addEventListener('click', function() {
            const centerX = mapWidth/2, centerY = mapHeight/2;
            const oldScale = mapTransform.scale;
            let newScale = oldScale * 1.25;
            newScale = Math.min(newScale, 5);
            const factor = newScale / oldScale;
            mapTransform.tx = centerX - (centerX - mapTransform.tx) * factor;
            mapTransform.ty = centerY - (centerY - mapTransform.ty) * factor;
            mapTransform.scale = newScale;
            updateMapTransform();
        });
        mapZoomOut.addEventListener('click', function() {
            const centerX = mapWidth/2, centerY = mapHeight/2;
            const oldScale = mapTransform.scale;
            let newScale = oldScale / 1.25;
            newScale = Math.max(newScale, 0.25);
            const factor = newScale / oldScale;
            mapTransform.tx = centerX - (centerX - mapTransform.tx) * factor;
            mapTransform.ty = centerY - (centerY - mapTransform.ty) * factor;
            mapTransform.scale = newScale;
            updateMapTransform();
        });
        mapZoomRange.addEventListener('input', function() {
            const centerX = mapWidth/2, centerY = mapHeight/2;
            const oldScale = mapTransform.scale;
            const newScale = Math.max(0.25, Math.min(5, Number(this.value) / 100));
            const factor = newScale / oldScale;
            mapTransform.tx = centerX - (centerX - mapTransform.tx) * factor;
            mapTransform.ty = centerY - (centerY - mapTransform.ty) * factor;
            mapTransform.scale = newScale;
            updateMapTransform();
        });
        mapReset.addEventListener('click', function() {
            mapTransform.scale = 1; mapTransform.tx = 0; mapTransform.ty = 0;
            updateMapTransform();
        });
        let mapResizeTimeout = null;
        window.addEventListener('resize', function() {
            clearTimeout(mapResizeTimeout);
            mapResizeTimeout = setTimeout(() => { applyMapInitial(); updateWidgetScreenPositions(); }, 200);
        });

        generateTablesBtn.addEventListener('click', showSegmentSelector);
        segmentsConfirm.addEventListener('click', function() {
            const selected = Array.from(draftSelectedKeys);
            selectedKeys = selected;
            saveMapSelection();
            selectModal.classList.remove('active');
            generateMapTables(selectedKeys, currentDisplayMode);
            renderMapWidgets();
            updatePlacementHint();
        });
        segmentsCancel.addEventListener('click', function() { selectModal.classList.remove('active'); });

        refreshMapBtn.addEventListener('click', function() {
            if (selectedKeys.length === 0) {
                alert('Сначала сформируйте таблицы.');
                return;
            }
            const choice = prompt(
                'Выберите режим отображения мини-таблиц:\n' +
                '1 — Полный список (все 6 типов)\n' +
                '2 — Сокращённый список (группировка по диапазонам)'
            );
            if (choice === null) return;
            if (choice === '1') {
                currentDisplayMode = 'full';
            } else if (choice === '2') {
                currentDisplayMode = 'short';
            } else {
                alert('Неверный ввод. Оставлен текущий режим.');
                return;
            }
            generateMapTables(selectedKeys, currentDisplayMode);
        });

        async function renderWidgetForExport(widget) {
            const canvas = document.createElement('canvas');
            const rows = [['КРИТЕРИЙ', 'ЧЕТ', 'НЕЧЕТ'], ...widget.data.rows.map(r =>
                [r.label.replaceAll('≤', '<=').replaceAll('≥', '>='), `${r.evenTotal} / ${r.evenAvg.toFixed(1)}`, `${r.oddTotal} / ${r.oddAvg.toFixed(1)}`]),
                ['Итого', `${widget.data.totalEven} / ${widget.data.avgEven.toFixed(1)}`, `${widget.data.totalOdd} / ${widget.data.avgOdd.toFixed(1)}`]];
            const ctx = canvas.getContext('2d');
            const font = 'bold 16px sans-serif';
            ctx.font = font;
            const columns = [0,1,2].map(j => Math.ceil(Math.max(92, ...rows.map(row => ctx.measureText(row[j]).width + 24))));
            const width = columns.reduce((a,b) => a+b,0);
            const rowHeight = 34, titleHeight = widget.isRemote ? 30 : 0;
            const height = rows.length * rowHeight + titleHeight;
            // Measure layout only; the PDF uses vector text and borders.
            return {width:width*3, height:height*3,
                pdfTable:{rows,columns,width,height,rowHeight,titleHeight}};
        }

        function drawVectorPdfTable(pdf, item, exportScale) {
            const t = item.widgetCanvas.pdfTable;
            const scale = item.width / t.width * exportScale;
            const originX = item.x * exportScale, originY = item.y * exportScale;
            pdf.setFont('NotoSans', 'bold');
            pdf.setFontSize(16 * scale * pdf.internal.scaleFactor);
            pdf.setFillColor(255,255,255);
            pdf.rect(originX,originY,t.width*scale,t.height*scale,'F');
            pdf.setTextColor(17,24,39);
            if (item.widget.isRemote) pdf.text('№'+item.widget.number,originX+t.width*scale/2,originY+15*scale,{align:'center',baseline:'middle'});
            t.rows.forEach((row,i) => {
                let x=0;
                row.forEach((text,j) => {
                    const y=t.titleHeight+i*t.rowHeight, w=t.columns[j];
                    const rgb=i===0 || i===t.rows.length-1 ? [226,232,240]:j===1?[255,244,237]:j===2?[238,246,255]:[255,255,255];
                    pdf.setFillColor(...rgb); pdf.setDrawColor(100,116,139); pdf.setLineWidth(.8*scale);
                    pdf.rect(originX+x*scale,originY+y*scale,w*scale,t.rowHeight*scale,'FD');
                    pdf.text(text,originX+(x+w/2)*scale,originY+(y+t.rowHeight/2)*scale,{align:'center',baseline:'middle'});
                    x+=w;
                });
            });
        }

        function exportRectsOverlap(a, b, gap) {
            return !(
                a.x + a.width + gap <= b.x ||
                b.x + b.width + gap <= a.x ||
                a.y + a.height + gap <= b.y ||
                b.y + b.height + gap <= a.y
            );
        }

        function clampExportRect(rect, mapW, mapH, margin) {
            return {
                ...rect,
                x: Math.max(margin, Math.min(mapW - margin - rect.width, rect.x)),
                y: Math.max(margin, Math.min(mapH - margin - rect.height, rect.y))
            };
        }

        function findFreeExportRect(desired, occupied, mapW, mapH, gap, margin) {
            const start = clampExportRect(desired, mapW, mapH, margin);
            const isFree = candidate => occupied.every(other =>
                !exportRectsOverlap(candidate, other, gap)
            );
            if (isFree(start)) return start;

            const radialStep = Math.max(18, Math.min(desired.width, desired.height) * 0.22);
            const maxRadius = Math.hypot(mapW, mapH);
            const anglesPerRing = 24;
            let best = start;
            let bestPenalty = Infinity;

            for (let radius = radialStep; radius <= maxRadius; radius += radialStep) {
                for (let i = 0; i < anglesPerRing; i++) {
                    const angle = (Math.PI * 2 * i / anglesPerRing) - Math.PI / 2;
                    const candidate = clampExportRect({
                        ...desired,
                        x: desired.x + Math.cos(angle) * radius,
                        y: desired.y + Math.sin(angle) * radius
                    }, mapW, mapH, margin);
                    if (isFree(candidate)) return candidate;

                    const overlapPenalty = occupied.reduce((sum, other) => {
                        const overlapW = Math.max(0,
                            Math.min(candidate.x + candidate.width, other.x + other.width) -
                            Math.max(candidate.x, other.x)
                        );
                        const overlapH = Math.max(0,
                            Math.min(candidate.y + candidate.height, other.y + other.height) -
                            Math.max(candidate.y, other.y)
                        );
                        return sum + overlapW * overlapH;
                    }, 0);
                    const distancePenalty =
                        Math.pow(candidate.x - desired.x, 2) +
                        Math.pow(candidate.y - desired.y, 2);
                    const penalty = overlapPenalty * 1000 + distancePenalty;
                    if (penalty < bestPenalty) {
                        bestPenalty = penalty;
                        best = candidate;
                    }
                }
            }
            return best;
        }

        // Limit the space occupied by tables; keep the user's map coordinates.
        function fitExportTableSizes(items, mapW, mapH) {
            const area = items.reduce((sum, item) => sum + item.width * item.height, 0);
            const largestWidth = Math.max(1, ...items.map(item => item.width));
            const largestHeight = Math.max(1, ...items.map(item => item.height));
            const sizeLimit = Math.min(1, mapW * .08 / largestWidth, mapH * .15 / largestHeight);
            const areaLimit = area > 0 ? Math.min(1, Math.sqrt(mapW * mapH * .18 / area)) : 1;
            const fit = Math.min(sizeLimit, areaLimit);
            return items.map(item => ({...item, width:item.width*fit, height:item.height*fit}));
        }

        async function prepareExportWidgetLayout(pdfWidgetScale) {
            const matrix = mapGroup.getScreenCTM();
            const mapScreenScale = matrix ? Math.hypot(matrix.a, matrix.b) : 0;
            const candidates = [];
            for (const widget of mapWidgets) {
                if (widget.tableX === null || widget.tableY === null) continue;
                const widgetCanvas = await renderWidgetForExport(widget);
                const element = document.getElementById(widget.id);
                const screenWidth = element ? element.getBoundingClientRect().width : 0;
                // Match the map preview instead of multiplying by the source image width.
                const previewWidth = screenWidth > 0 && mapScreenScale > 0
                    ? screenWidth / mapScreenScale : widgetCanvas.pdfTable.width;
                const width = previewWidth * pdfWidgetScale;
                const height = width * widgetCanvas.pdfTable.height / widgetCanvas.pdfTable.width;
                candidates.push({widget, widgetCanvas, width, height});
                exportEstimate.textContent = `Подготовлено таблиц: ${candidates.length}`;
                if (candidates.length % 20 === 0) await new Promise(resolve => setTimeout(resolve, 0));
            }
            return fitExportTableSizes(candidates, mapWidth, mapHeight).map(item => ({
                ...item,
                x:Math.max(0, Math.min(mapWidth-item.width, item.widget.tableX-item.width/2)),
                y:Math.max(0, Math.min(mapHeight-item.height, item.widget.tableY-item.height))
            }));
        }

        function estimateExportSeconds() {
            return Math.max(1, Math.ceil(mapWidgets.length / 30));
        }

        function showExportOverlay() {
            const estimatedSeconds = estimateExportSeconds();
            const startedAt = Date.now();
            exportEstimate.textContent = `Обычно около ${estimatedSeconds} сек.`;
            exportElapsed.textContent = 'Прошло: 0 сек.';
            exportOverlay.classList.add('active');
            document.body.setAttribute('aria-busy', 'true');
            clearInterval(exportTimer);
            exportTimer = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
                exportElapsed.textContent = `Прошло: ${elapsedSeconds} сек.`;
            }, 500);
        }

        function hideExportOverlay() {
            clearInterval(exportTimer);
            exportTimer = null;
            exportOverlay.classList.remove('active');
            document.body.removeAttribute('aria-busy');
        }

        function waitForOverlayPaint() {
            return new Promise(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            });
        }

        async function exportMapToPdf() {
            if (!currentMapObjectUrl) { alert('Сначала выберите подложку карты.'); return; }
            if (!window.jspdf) { alert('Модуль экспорта PDF не загрузился.'); return; }
            const oldText = exportPdfBtn.textContent;
            const themeBeforeExport = activeTheme;
            exportPdfBtn.disabled = true;
            exportPdfBtn.textContent = 'Формирование PDF…';
            showExportOverlay();
            await waitForOverlayPaint();
            applyTheme('light');
            try {
                const maxSide = 16000;
                const exportScale = Math.min(1, maxSide / Math.max(mapWidth, mapHeight), Math.sqrt(80000000 / (mapWidth * mapHeight)));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(mapWidth * exportScale));
                canvas.height = Math.max(1, Math.round(mapHeight * exportScale));
                const ctx = canvas.getContext('2d');
                ctx.scale(exportScale, exportScale);
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(0, 0, mapWidth, mapHeight);

                const image = new Image();
                image.src = currentMapObjectUrl;
                await image.decode();
                ctx.drawImage(image, 0, 0, mapWidth, mapHeight);

                const pdfWidgetScale = Number(document.getElementById('pdfTableSize').value);
                const exportWidgets = await prepareExportWidgetLayout(pdfWidgetScale);

                ctx.save();
                ctx.strokeStyle = '#e53e3e';
                ctx.lineWidth = Math.max(1, mapWidth / 1500);
                ctx.setLineDash([8, 6]);
                exportWidgets.forEach(item => {
                    const w = item.widget;
                    if (w.isRemote) return;
                    const tableConnectionX = item.x + item.width / 2;
                    const tableConnectionY = item.y + item.height - Math.min(30, item.height / 3);
                    ctx.beginPath();
                    ctx.moveTo(w.anchorX, w.anchorY);
                    ctx.lineTo(tableConnectionX, tableConnectionY);
                    ctx.stroke();
                });
                ctx.restore();

                mapWidgets.forEach(w => {
                    const pointRadius = w.isRemote
                        ? Math.max(10, mapWidth / 280)
                        : Math.max(4, mapWidth / 450);
                    const digits = String(w.number).length;
                    const numberScale = digits >= 3 ? 0.52 : (digits === 2 ? 0.64 : 0.72);
                    const numberFontSize = Math.max(6, pointRadius * numberScale);
                    ctx.beginPath();
                    ctx.fillStyle = '#e53e3e';
                    ctx.arc(w.anchorX, w.anchorY, pointRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.lineWidth = Math.max(1, mapWidth / 800);
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                    if (w.isRemote) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = `bold ${numberFontSize}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(w.number.toString(), w.anchorX, w.anchorY);
                    }
                });

                const isRange = periodType.value === 'range';
                let yearFrom = parseInt(periodYearFrom.value) || 2026;
                let monthFrom = parseInt(periodMonthFrom.value) || 1;
                let yearTo = parseInt(periodYearTo.value) || 2026;
                let monthTo = parseInt(periodMonthTo.value) || 12;
                let periodStr;
                if (isRange) {
                    if (yearFrom === yearTo) {
                        periodStr = `${getMonthName(monthFrom)}–${getMonthName(monthTo)} ${yearFrom}`;
                    } else {
                        periodStr = `${getMonthName(monthFrom)} ${yearFrom} – ${getMonthName(monthTo)} ${yearTo}`;
                    }
                } else {
                    periodStr = `${getMonthName(monthFrom)} ${yearFrom}`;
                }
                const title = `Схема исполненных размеров движения контейнерных поездов за ${periodStr} года`;
                const titleFontSize = Math.max(14, mapWidth / 50);
                ctx.font = `bold ${titleFontSize}px sans-serif`;
                ctx.fillStyle = '#1a202c';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                const padding = 20;
                ctx.fillText(title, mapWidth / 2, padding);

                const legendElement = document.getElementById('mapLegendImage');
                try {
                    const legendImage = new Image();
                    legendImage.src = legendElement.src;
                    await legendImage.decode();
                    if (legendImage.naturalWidth > 0 && legendImage.naturalHeight > 0) {
                        let legendWidth = mapWidth * 0.42;
                        let legendHeight = legendWidth * (legendImage.naturalHeight / legendImage.naturalWidth);
                        const maxLegendHeight = mapHeight * 0.20;
                        if (legendHeight > maxLegendHeight) {
                            const ratio = maxLegendHeight / legendHeight;
                            legendWidth *= ratio;
                            legendHeight *= ratio;
                        }
                        const legendX = mapWidth - padding - legendWidth;
                        const legendY = padding + titleFontSize * 1.65;
                        ctx.drawImage(legendImage, legendX, legendY, legendWidth, legendHeight);
                    }
                } catch (legendError) {
                    console.warn('Встроенная легенда недоступна. PDF создан без неё.', legendError);
                }

                const { jsPDF } = window.jspdf;
                const orientation = mapWidth >= mapHeight ? 'landscape' : 'portrait';
                const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height], hotfixes: ['px_scaling'], compress: true, putOnlyUsedFonts: true });
                pdf.addFileToVFS('NotoSans-Bold.ttf', window.POLIGON_PDF_FONT);
                pdf.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
                for (const item of exportWidgets) {
                    drawVectorPdfTable(pdf, item, exportScale);
                }
                pdf.save(`карта_${new Date().toISOString().slice(0,10)}.pdf`);
            } catch (err) {
                alert('Не удалось сформировать PDF: ' + err.message);
            } finally {
                hideExportOverlay();
                applyTheme(themeBeforeExport);
                exportPdfBtn.disabled = false;
                exportPdfBtn.textContent = oldText;
            }
        }
        exportPdfBtn.addEventListener('click', exportMapToPdf);

        function exportMapState() {
            saveFullState();
        }

        function importMapState(file) {
            loadFullState(file);
        }

        exportMapStateBtn.addEventListener('click', exportMapState);
        importMapStateBtn.addEventListener('click', function() { importMapStateInput.click(); });
        importMapStateInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) { importMapState(this.files[0]); this.value = ''; }
        });

        function openMapDatabase() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) return reject(new Error('IndexedDB недоступна'));
                const request = indexedDB.open('railMapAssets', 1);
                request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets'); };
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        async function saveMapBlob(file) {
            try {
                const db = await openMapDatabase();
                await new Promise((resolve, reject) => {
                    const tx = db.transaction('assets', 'readwrite');
                    tx.objectStore('assets').put({ blob: file, name: file.name }, 'mapBackground');
                    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
                });
                db.close();
            } catch(e) { mapSourceStatus.title = 'Автозагрузка недоступна: ' + e.message; }
        }

        async function loadSavedMapBlob() {
            try {
                const db = await openMapDatabase();
                const saved = await new Promise((resolve, reject) => {
                    const tx = db.transaction('assets', 'readonly');
                    const request = tx.objectStore('assets').get('mapBackground');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
                db.close();
                if (saved && saved.blob) setMapBackground(saved.blob, saved.name || 'Сохранённая подложка');
            } catch(e) {}
        }

        function setMapBackground(blob, name) {
            if (currentMapObjectUrl) URL.revokeObjectURL(currentMapObjectUrl);
            currentMapObjectUrl = URL.createObjectURL(blob);
            const probe = new Image();
            probe.onload = function() {
                mapWidth = this.naturalWidth || 1400; mapHeight = this.naturalHeight || 1000;
                mapSvg.setAttribute('viewBox', `0 0 ${mapWidth} ${mapHeight}`);
                bgImage.setAttribute('width', mapWidth); bgImage.setAttribute('height', mapHeight);
                bgImage.setAttribute('href', currentMapObjectUrl);
                mapSourceStatus.textContent = name;
                mapSourceStatus.title = `${name} · ${mapWidth} × ${mapHeight} px`;
                mapContainer.classList.add('has-map');
                loadMapPositions(); applyMapInitial(); renderMapWidgets();
            };
            probe.onerror = () => alert('Не удалось прочитать изображение подложки.');
            probe.src = currentMapObjectUrl;
        }

        loadMapBtn.addEventListener('click', () => mapFileInput.click());
        mapFileInput.addEventListener('change', async function() {
            const file = this.files && this.files[0];
            if (!file) return;
            setMapBackground(file, file.name);
            await saveMapBlob(file);
            this.value = '';
        });

        loadFromStorage();
        updateEditButtons();
        try {
            const storedSelection = JSON.parse(storageGet('mapSelectedKeys') || '[]');
            if (Array.isArray(storedSelection) && storedSelection.length) {
                allGroups = getAllGroups();
                selectedKeys = storedSelection.filter(key => allGroups[key]);
                generateMapTables(selectedKeys, currentDisplayMode);
            }
        } catch(e) {}
        loadSavedMapBlob();
        setTimeout(applyMapInitial, 300);
        if (!storageGet('mapWidgetPositions')) storageSet('mapWidgetPositions', JSON.stringify({}));
    })();