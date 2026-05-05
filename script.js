// Initialize data from Google Sheet or LocalStorage
const defaultData = [
    { month: "2025/04", startDate: "2025/4/3", endDate: "2025/4/4", organizer: "", location: "北車地下街", participants: "麗", stallCount: 1, totalAmount: 2400, amountPerStall: 2400, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2025/04", startDate: "2025/4/5", endDate: "2025/4/6", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 1, totalAmount: 2400, amountPerStall: 2400, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2025/04", startDate: "2025/4/26", endDate: "2025/4/26", organizer: "", location: "龍山寺", participants: "麗", stallCount: 1, totalAmount: 1800, amountPerStall: 1800, isPaid: true, payer: "牛", isCleared: true, remarks: "" },
    { month: "2025/04", startDate: "2025/4/27", endDate: "2025/4/27", organizer: "", location: "龍山寺", participants: "麗+牛", stallCount: 1, totalAmount: 1800, amountPerStall: 1800, isPaid: true, payer: "牛", isCleared: true, remarks: "" },
    { month: "2025/05", startDate: "2025/5/10", endDate: "2025/5/11", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 4800, amountPerStall: 2400, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2025/06", startDate: "2025/6/14", endDate: "2025/6/15", organizer: "", location: "龍山寺", participants: "麗+牛", stallCount: 1, totalAmount: 1800, amountPerStall: 1800, isPaid: true, payer: "牛", isCleared: true, remarks: "" },
    { month: "2025/06", startDate: "2025/6/21", endDate: "2025/6/22", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 0, amountPerStall: 0, isPaid: true, payer: "麗", isCleared: true, remarks: "已取消並退款" },
    { month: "2025/07", startDate: "2025/7/12", endDate: "2025/7/13", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 4800, amountPerStall: 2400, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2025/07", startDate: "2025/7/19", endDate: "2025/7/20", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 4800, amountPerStall: 2400, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2025/08", startDate: "2025/8/9", endDate: "2025/8/10", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: null, amountPerStall: 0, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2025/10", startDate: "2025/10/4", endDate: "2025/10/6", organizer: "", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 7800, amountPerStall: 3900, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/01", startDate: "2026/1/3", endDate: "2026/1/3", organizer: "", location: "龍山寺", participants: "麗+牛", stallCount: 2, totalAmount: 2000, amountPerStall: 1000, isPaid: true, payer: "牛", isCleared: true, remarks: "" },
    { month: "2026/01", startDate: "2026/1/10", endDate: "2026/1/11", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 5160, amountPerStall: 2580, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/01", startDate: "2026/1/24", endDate: "2026/1/25", organizer: "再約市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 5600, amountPerStall: 2800, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/02", startDate: "2026/2/14", endDate: "2026/2/14", organizer: "方舟市集", location: "北車地下街", participants: "麗", stallCount: 1, totalAmount: 1500, amountPerStall: 1500, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/02", startDate: "2026/2/21", endDate: "2026/2/22", organizer: "再約市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 5600, amountPerStall: 2800, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/02", startDate: "2026/2/27", endDate: "2026/2/28", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 6000, amountPerStall: 3000, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/03", startDate: "2026/3/7", endDate: "2026/3/8", organizer: "方舟市集", location: "華山", participants: "麗+牛", stallCount: 2, totalAmount: 7500, amountPerStall: 3750, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/03", startDate: "2026/3/21", endDate: "2026/3/22", organizer: "再約市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 5600, amountPerStall: 2800, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/03", startDate: "2026/3/28", endDate: "2026/3/29", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 3, totalAmount: 7740, amountPerStall: 2580, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/04", startDate: "2026/4/3", endDate: "2026/4/6", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 10320, amountPerStall: 5160, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/04", startDate: "2026/4/25", endDate: "2026/4/26", organizer: "方舟市集", location: "松菸", participants: "麗", stallCount: 2, totalAmount: 8900, amountPerStall: 4450, isPaid: true, payer: "麗", isCleared: true, remarks: "" },
    { month: "2026/05", startDate: "2026/5/1", endDate: "2026/5/3", organizer: "方舟市集", location: "華山", participants: "麗+牛", stallCount: 2, totalAmount: 21600, amountPerStall: 10800, isPaid: true, payer: "麗", isCleared: null, remarks: "" },
    { month: "2026/05", startDate: "2026/5/9", endDate: "2026/5/10", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 5480, amountPerStall: 2740, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/05", startDate: "2026/5/16", endDate: "2026/5/17", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 7500, amountPerStall: 3750, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/05", startDate: "2026/5/23", endDate: "2026/5/24", organizer: "再約市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 5600, amountPerStall: 2800, isPaid: true, payer: "牛", isCleared: false, remarks: "" },
    { month: "2026/06", startDate: "2026/6/13", endDate: "2026/6/14", organizer: "方舟市集", location: "華山", participants: "麗+牛", stallCount: 2, totalAmount: 7500, amountPerStall: 3750, isPaid: true, payer: "麗", isCleared: false, remarks: "取消" },
    { month: "2026/06", startDate: "2026/6/19", endDate: "2026/6/21", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 3, totalAmount: 8040, amountPerStall: 2680, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/06", startDate: "2026/6/27", endDate: "2026/6/28", organizer: "再約市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: null, amountPerStall: 0, isPaid: false, payer: "麗", isCleared: false, remarks: "取消" },
    { month: "2026/06", startDate: "2026/6/27", endDate: "2026/6/28", organizer: "方舟市集", location: "松菸", participants: "麗+牛", stallCount: 3, totalAmount: 16140, amountPerStall: 5380, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/07", startDate: "2026/7/10", endDate: "2026/7/12", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 7960, amountPerStall: 3980, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/07", startDate: "2026/7/17", endDate: "2026/7/19", organizer: "方舟市集", location: "華山", participants: "麗+牛", stallCount: 2, totalAmount: 9700, amountPerStall: 4850, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/07", startDate: "2026/7/25", endDate: "2026/7/26", organizer: "再約市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: null, amountPerStall: 0, isPaid: false, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/08", startDate: "2026/8/1", endDate: "2026/8/2", organizer: "方舟市集", location: "北車地下街", participants: "麗+牛", stallCount: 2, totalAmount: 9700, amountPerStall: 4850, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/08", startDate: "2026/8/21", endDate: "2026/8/23", organizer: "方舟市集", location: "華山", participants: "麗+牛", stallCount: 2, totalAmount: 9700, amountPerStall: 4850, isPaid: true, payer: "麗", isCleared: false, remarks: "" },
    { month: "2026/10", startDate: "2026/10/8", endDate: "2026/10/11", organizer: "方舟市集", location: "華山", participants: "麗+牛", stallCount: 2, totalAmount: 27000, amountPerStall: 13500, isPaid: false, payer: "麗", isCleared: false, remarks: "" }
];

let marketData = JSON.parse(localStorage.getItem('marketData')) || defaultData;
let editingIndex = -1; // -1 means adding new, otherwise editing
let sortAscending = true;

// DOM Elements
const tableBody = document.getElementById('tableBody');
const noResults = document.getElementById('noResults');
const dataTable = document.getElementById('dataTable');

const addModal = document.getElementById('addModal');
const modalTitle = document.getElementById('modalTitle');
const addBtn = document.getElementById('addBtn');
const sortBtn = document.getElementById('sortBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const addForm = document.getElementById('addForm');

const searchBtn = document.getElementById('searchBtn');

// Filter Selects
const filterMonth = document.getElementById('filterMonth');
const filterOrganizer = document.getElementById('filterOrganizer');
const filterLocation = document.getElementById('filterLocation');
const filterParticipants = document.getElementById('filterParticipants');

// Format Boolean to Clickable Toggle Icon
function formatToggleIcon(val, index, field) {
    let icon = val ? `<i class="fa-solid fa-check" style="color: #10b981; font-size: 1.25rem;"></i>` 
                   : `<i class="fa-solid fa-xmark" style="color: #ef4444; font-size: 1.25rem;"></i>`;
    return `<div class="status-toggle" onclick="window.toggleStatus(${index}, '${field}')">${icon}</div>`;
}

// Format participants/payer names into styled badges
function formatBadges(val) {
    if (!val) return '';
    const parts = val.split('+');
    let html = '<div class="badge-container">';
    parts.forEach(part => {
        let p = part.trim();
        if (p === '麗') {
            html += `<span class="badge-li">麗</span>`;
        } else if (p === '牛') {
            html += `<span class="badge-niu">牛</span>`;
        } else if (p) {
            html += `<span class="badge-default">${p}</span>`;
        }
    });
    html += '</div>';
    return html;
}

// Format Organizer into styled badges
function formatOrganizer(val) {
    if (!val) return '';
    if (val.includes('方舟')) {
        return `<span class="badge-ark">${val}</span>`;
    } else if (val.includes('再約')) {
        return `<span class="badge-zaiyue">${val}</span>`;
    }
    return `<span class="badge-default">${val}</span>`;
}

// Populate Filters dynamically from data
function populateFilters() {
    const months = new Set();
    const organizers = new Set();
    const locations = new Set();
    const participants = new Set();

    marketData.forEach(row => {
        if (row.month) months.add(row.month);
        if (row.organizer) organizers.add(row.organizer);
        if (row.location) locations.add(row.location);
        if (row.participants) participants.add(row.participants);
    });

    // Helper to add options
    const addOptions = (selectElem, set, reverse = false) => {
        const firstOption = selectElem.options[0];
        selectElem.innerHTML = '';
        selectElem.appendChild(firstOption);
        
        let arr = Array.from(set).sort();
        if (reverse) arr.reverse();
        
        arr.forEach(val => {
            if (!val) return;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            selectElem.appendChild(opt);
        });
    };

    addOptions(filterMonth, months, true); // Reverse sort for months
    addOptions(filterOrganizer, organizers);
    addOptions(filterLocation, locations);
    addOptions(filterParticipants, participants);
}

// Apply filters
function getFilteredData() {
    const fMonth = filterMonth.value;
    const fOrg = filterOrganizer.value;
    const fLoc = filterLocation.value;
    const fPart = filterParticipants.value;

    return marketData.filter(row => {
        const mMatch = !fMonth || row.month === fMonth;
        const oMatch = !fOrg || row.organizer === fOrg;
        const lMatch = !fLoc || row.location === fLoc;
        const pMatch = !fPart || row.participants === fPart;
        return mMatch && oMatch && lMatch && pMatch;
    });
}

// Sort Data
function sortData() {
    sortAscending = !sortAscending;
    marketData.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return sortAscending ? dateA - dateB : dateB - dateA;
    });
    
    // Update button icon
    const icon = sortBtn.querySelector('i');
    if (sortAscending) {
        icon.className = 'fa-solid fa-sort-up';
    } else {
        icon.className = 'fa-solid fa-sort-down';
    }
    
    // Save order
    localStorage.setItem('marketData', JSON.stringify(marketData));
    updateView();
}

// Render Table
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        dataTable.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    dataTable.classList.remove('hidden');
    noResults.classList.add('hidden');

    data.forEach((row, filteredIndex) => {
        // Find actual index in marketData for edit/delete
        const actualIndex = marketData.indexOf(row);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.month || ''}</td>
            <td>${row.startDate || ''}</td>
            <td>${row.endDate || ''}</td>
            <td>${formatOrganizer(row.organizer)}</td>
            <td>${row.location || ''}</td>
            <td>${formatBadges(row.participants)}</td>
            <td>${row.stallCount || ''}</td>
            <td>${row.totalAmount !== null ? row.totalAmount : ''}</td>
            <td>${row.amountPerStall !== null ? row.amountPerStall : ''}</td>
            <td style="text-align: center;">${formatToggleIcon(row.isPaid, actualIndex, 'isPaid')}</td>
            <td>${formatBadges(row.payer)}</td>
            <td style="text-align: center;">${formatToggleIcon(row.isCleared, actualIndex, 'isCleared')}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="window.openEditModal(${actualIndex})" title="編輯">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="window.deleteRecord(${actualIndex})" title="刪除">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
            <td>${row.remarks || ''}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Update View
function updateView() {
    renderTable(getFilteredData());
}

// Event Listeners for Actions
if (searchBtn) searchBtn.addEventListener('click', updateView);
sortBtn.addEventListener('click', sortData);

// Format date to YYYY-MM-DD for input[type="date"]
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

// Modal toggle functions
function openModal(isEdit = false, index = -1) {
    editingIndex = index;
    if (isEdit) {
        modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 編輯擺攤紀錄';
        const row = marketData[index];
        document.getElementById('month').value = row.month || '';
        document.getElementById('startDate').value = formatDateForInput(row.startDate);
        document.getElementById('endDate').value = formatDateForInput(row.endDate);
        document.getElementById('organizer').value = row.organizer || '';
        document.getElementById('location').value = row.location || '';
        document.getElementById('participants').value = row.participants || '';
        document.getElementById('stallCount').value = row.stallCount || 1;
        document.getElementById('totalAmount').value = row.totalAmount || 0;
        document.getElementById('payer').value = row.payer || '';
        document.getElementById('remarks').value = row.remarks || '';
    } else {
        modalTitle.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> 新增擺攤紀錄';
        addForm.reset();
    }
    
    addModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    addModal.classList.remove('active');
    document.body.style.overflow = '';
    addForm.reset();
    editingIndex = -1;
}

addBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
        closeModal();
    }
});

// Global functions for inline HTML event handlers
window.deleteRecord = function(index) {
    if (confirm('確定要刪除這筆紀錄嗎？')) {
        marketData.splice(index, 1);
        localStorage.setItem('marketData', JSON.stringify(marketData));
        updateView();
    }
};

window.openEditModal = function(index) {
    openModal(true, index);
};

window.toggleStatus = function(index, field) {
    if (index > -1 && index < marketData.length) {
        marketData[index][field] = !marketData[index][field];
        localStorage.setItem('marketData', JSON.stringify(marketData));
        updateView();
    }
};

// Handle form submission
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Format dates back to YYYY/M/D to match existing data loosely
    const startDt = new Date(document.getElementById('startDate').value);
    const endDt = new Date(document.getElementById('endDate').value);
    
    const fmtStart = `${startDt.getFullYear()}/${startDt.getMonth() + 1}/${startDt.getDate()}`;
    const fmtEnd = `${endDt.getFullYear()}/${endDt.getMonth() + 1}/${endDt.getDate()}`;

    const stallCount = parseInt(document.getElementById('stallCount').value) || 0;
    const totalAmount = parseInt(document.getElementById('totalAmount').value) || 0;
    const amountPerStall = stallCount > 0 ? Math.round(totalAmount / stallCount) : 0;

    const newRecord = {
        month: document.getElementById('month').value,
        startDate: fmtStart,
        endDate: fmtEnd,
        organizer: document.getElementById('organizer').value,
        location: document.getElementById('location').value,
        participants: document.getElementById('participants').value,
        stallCount: stallCount,
        totalAmount: totalAmount,
        amountPerStall: amountPerStall,
        isPaid: editingIndex > -1 ? marketData[editingIndex].isPaid : false,
        payer: document.getElementById('payer').value,
        isCleared: editingIndex > -1 ? marketData[editingIndex].isCleared : false,
        remarks: document.getElementById('remarks').value
    };
    
    if (editingIndex > -1) {
        // Update existing
        marketData[editingIndex] = newRecord;
    } else {
        // Add new
        marketData.push(newRecord);
    }
    
    // Save to localStorage
    localStorage.setItem('marketData', JSON.stringify(marketData));
    
    // Re-render table
    updateView();
    
    // Close modal
    closeModal();
});

// Initial load
populateFilters();
updateView();
