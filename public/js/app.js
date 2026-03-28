/*
Vanilla JS: state management, API calls, DOM rendering, event handlers.
 */


const API_BASE = '';

// ── State ──
const state = {
    members: [],
    totalMembers: 0,
    query: '',
    yearFilter: '',
    yearFilterLte: false,
    sortField: 'name',
    sortOrder: 'asc',
    selectedMember: null,
    isLoading: false,
    error: null,
};

// ── DOM References ──
const dom = {
    searchInput: document.getElementById('searchInput'),
    yearFilter: document.getElementById('yearFilter'),
    sortButtons: document.getElementById('sortButtons'),
    resetBtn: document.getElementById('resetBtn'),
    memberList: document.getElementById('memberList'),
    resultsInfo: document.getElementById('resultsInfo'),
    memberCountBadge: document.getElementById('memberCountBadge'),
    errorBanner: document.getElementById('errorBanner'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    emptyState: document.getElementById('emptyState'),
    detailPanel: document.getElementById('detailPanel'),
    detailOverlay: document.getElementById('detailOverlay'),
    detailClose: document.getElementById('detailClose'),
    detailAvatar: document.getElementById('detailAvatar'),
    detailName: document.getElementById('detailName'),
    detailCompany: document.getElementById('detailCompany'),
    detailFields: document.getElementById('detailFields'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarContent: document.getElementById('sidebarContent'),
};

// ── Avatar Colors ──
const avatarColors = ['avatar-violet', 'avatar-blue', 'avatar-cyan', 'avatar-purple'];

function getAvatarColor(id) {
    return avatarColors[(id - 1) % avatarColors.length];
}

function getInitials(firstName, lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

// ── Debounce ──
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ── API Calls ──
async function fetchMembers() {
    state.isLoading = true;
    state.error = null;
    showLoading();
    hideError();

    try {
        let url;
        if (state.query.trim()) {
            url = `${API_BASE}/api/members/search?query=${encodeURIComponent(state.query.trim())}`;
        } else {
            url = `${API_BASE}/api/members`;
        }

        // Add year filter
        if (state.yearFilter) {
            url += `${url.includes('?') ? '&' : '?'}year=${state.yearFilter}`;
            if (state.yearFilterLte) {
                url += '&year_lte=1';
            }
        }

        // Add sorting
        url += `${url.includes('?') ? '&' : '?'}sort=${state.sortField}&order=${state.sortOrder}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error (${response.status})`);
        }

        const data = await response.json();
        state.members = data.data;
        state.isLoading = false;

        // Capture total count from unfiltered initial load
        if (!state.query.trim() && !state.yearFilter && state.totalMembers === 0) {
            state.totalMembers = data.total;
            dom.memberCountBadge.textContent = `${state.totalMembers} Members`;
        }

        renderMembers();
        updateResultsInfo();
    } catch (err) {
        state.isLoading = false;
        state.error = err.message || 'Unable to connect to the server.';
        showError(state.error);
    }
}

async function fetchMemberDetail(id) {
    try {
        const response = await fetch(`${API_BASE}/api/members/${id}`);
        if (!response.ok) {
            throw new Error('Member not found');
        }
        const data = await response.json();
        return data.data;
    } catch (err) {
        showError('Failed to load member details.');
        return null;
    }
}

// ── Rendering ──
function renderMembers() {
    dom.memberList.innerHTML = '';

    if (state.members.length === 0) {
        dom.emptyState.classList.remove('hidden');
        return;
    }

    dom.emptyState.classList.add('hidden');

    state.members.forEach(member => {
        const row = document.createElement('div');
        row.className = 'member-row';
        row.setAttribute('data-id', member.id);
        row.innerHTML = `
            <div class="avatar ${getAvatarColor(member.id)}">${getInitials(member.firstName, member.lastName)}</div>
            <div class="member-info">
                <div class="member-name">${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)}</div>
                <div class="member-company">${escapeHtml(member.company)}</div>
            </div>
            <div class="member-meta">
                <div class="member-year">Since ${member.memberSince}</div>
                <div class="member-email">${escapeHtml(member.email)}</div>
            </div>
            <button class="view-detail-btn">View &#8594;</button>
        `;
        row.addEventListener('click', () => showDetail(member.id));
        dom.memberList.appendChild(row);
    });
}

function showLoading() {
    dom.memberList.innerHTML = '';
    dom.emptyState.classList.add('hidden');

    for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-row';
        skeleton.innerHTML = `
            <div class="skel skel-avatar"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                <div class="skel skel-line" style="width:${35 + Math.random() * 25}%;"></div>
                <div class="skel skel-line" style="width:${20 + Math.random() * 15}%;height:9px;"></div>
            </div>
            <div class="skel skel-line" style="width:60px;height:28px;border-radius:8px;"></div>
        `;
        dom.memberList.appendChild(skeleton);
    }
}

function updateResultsInfo() {
    const count = state.members.length;
    const total = state.totalMembers;

    if (state.query.trim()) {
        dom.resultsInfo.innerHTML = `Showing <strong>${count}</strong> of ${total} members matching <span class="query-highlight">"${escapeHtml(state.query.trim())}"</span>`;
    } else if (state.yearFilter) {
        dom.resultsInfo.innerHTML = `Showing <strong>${count}</strong> members since <strong>${state.yearFilter}</strong>`;
    } else {
        dom.resultsInfo.innerHTML = `Showing all <strong>${count}</strong> members`;
    }
}

// ── Detail Panel ──
async function showDetail(id) {
    const member = await fetchMemberDetail(id);
    if (!member) return;

    state.selectedMember = member;
    const initials = getInitials(member.firstName, member.lastName);
    const yearsSince = new Date().getFullYear() - member.memberSince;
    const yearsLabel = yearsSince < 1 ? 'New Member' : `Active Member &mdash; ${yearsSince} year${yearsSince !== 1 ? 's' : ''}`;

    dom.detailAvatar.textContent = initials;
    dom.detailAvatar.className = `detail-avatar ${getAvatarColor(member.id)}`;
    dom.detailName.textContent = `${member.firstName} ${member.lastName}`;
    dom.detailCompany.textContent = member.company;

    dom.detailFields.innerHTML = `
        <div class="detail-field">
            <div class="detail-label">Email Address</div>
            <div class="detail-value email">${escapeHtml(member.email)}</div>
        </div>
        <div class="detail-field">
            <div class="detail-label">Member Since</div>
            <div class="detail-value">${member.memberSince}</div>
        </div>
        <div class="detail-field">
            <div class="detail-label">Full Name</div>
            <div class="detail-value">${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)}</div>
        </div>
        <div class="detail-field">
            <div class="detail-label">Company</div>
            <div class="detail-value">${escapeHtml(member.company)}</div>
        </div>
        <div class="detail-badge">
            <div class="badge-dot"></div>
            ${yearsLabel}
        </div>
    `;

    dom.detailPanel.classList.remove('hidden');
    dom.detailOverlay.classList.remove('hidden');
}

function hideDetail() {
    dom.detailPanel.classList.add('hidden');
    dom.detailOverlay.classList.add('hidden');
    state.selectedMember = null;
}

// ── Error Handling ──
function showError(message) {
    dom.errorMessage.textContent = message;
    dom.errorBanner.classList.remove('hidden');
    dom.memberList.innerHTML = '';
    dom.emptyState.classList.add('hidden');
}

function hideError() {
    dom.errorBanner.classList.add('hidden');
}

// ── Utility ──
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Event Handlers ──

// Search (debounced 300ms)
const handleSearch = debounce(() => {
    state.query = dom.searchInput.value;
    fetchMembers();
}, 300);

dom.searchInput.addEventListener('input', handleSearch);

// Year filter
dom.yearFilter.addEventListener('click', (e) => {
    const option = e.target.closest('.filter-option');
    if (!option) return;

    dom.yearFilter.querySelectorAll('.filter-option').forEach(el => el.classList.remove('active'));
    option.classList.add('active');

    state.yearFilter = option.dataset.year;
    state.yearFilterLte = option.dataset.yearlte === '1';
    fetchMembers();
});

// Sort buttons
dom.sortButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.sort-btn');
    if (!btn) return;

    const field = btn.dataset.sort;

    // Toggle order if clicking same field
    if (state.sortField === field) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortField = field;
        state.sortOrder = 'asc';
    }

    // Update button UI
    dom.sortButtons.querySelectorAll('.sort-btn').forEach(el => {
        el.classList.remove('active');
        el.textContent = el.dataset.sort.charAt(0).toUpperCase() + el.dataset.sort.slice(1);
    });
    btn.classList.add('active');
    const arrow = state.sortOrder === 'asc' ? ' \u2191' : ' \u2193';
    btn.textContent = btn.dataset.sort.charAt(0).toUpperCase() + btn.dataset.sort.slice(1) + arrow;

    fetchMembers();
});

// Reset filters
dom.resetBtn.addEventListener('click', () => {
    state.query = '';
    state.yearFilter = '';
    state.yearFilterLte = false;
    state.sortField = 'name';
    state.sortOrder = 'asc';

    dom.searchInput.value = '';
    dom.yearFilter.querySelectorAll('.filter-option').forEach(el => el.classList.remove('active'));
    dom.yearFilter.querySelector('[data-year=""]').classList.add('active');

    dom.sortButtons.querySelectorAll('.sort-btn').forEach(el => {
        el.classList.remove('active');
        el.textContent = el.dataset.sort.charAt(0).toUpperCase() + el.dataset.sort.slice(1);
    });
    const nameBtn = dom.sortButtons.querySelector('[data-sort="name"]');
    nameBtn.classList.add('active');
    nameBtn.textContent = 'Name \u2191';

    fetchMembers();
});

// Detail panel close
dom.detailClose.addEventListener('click', hideDetail);
dom.detailOverlay.addEventListener('click', hideDetail);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.selectedMember) {
        hideDetail();
    }
});

// Retry
dom.retryBtn.addEventListener('click', () => {
    hideError();
    fetchMembers();
});

// Mobile sidebar toggle
dom.sidebarToggle.addEventListener('click', () => {
    dom.sidebarContent.classList.toggle('open');
});

// ── Initialize ──
async function init() {
    await fetchMembers();
}

init();
