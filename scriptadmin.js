import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, onSnapshot, query, orderBy, limit, deleteDoc, doc, where, getDocs, getDoc, setDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCamv42dxGHJEqXMqVIPcOeWGNdM5p7X2E",
    authDomain: "lontong-mm.firebaseapp.com",
    projectId: "lontong-mm",
    storageBucket: "lontong-mm.firebasestorage.app",
    messagingSenderId: "628261457290",
    appId: "1:628261457290:web:8cbd5262f3cc3deb30cc73",
    measurementId: "G-GBN3GE3QKN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.log('Persistence failed: Browser not supported');
    }
});

// --- 2. GLOBAL VARIABLES ---
const AUTH_HASH = "MTIzNDU2";
let HARGA = { lontong_jual: 11000, lontong_setor: 10000, telur_jual: 3000, telur_modal: 1900, bakwan_jual: 1000, bakwan_setor: 0, kerupuk_jual: 1000 };
let globalData = [];
let orderList = [];
let detailEditingIndex = -1;
let chartInstance = null;
let unsubscribeRealtime = null;
let currentSort = { column: 'date', direction: 'desc' };
let isLogoutProcess = false;
let currentDetailData = null;

// Cache DOM Elements
const dom = {
    qtyL: document.getElementById('qtyLontong'),
    qtyT: document.getElementById('qtyTelur'),
    qtyB: document.getElementById('qtyBakwan'),
    editId: document.getElementById('editId'),
    tableDesktop: document.getElementById('tableBodyDesktop'),
    listMobile: document.getElementById('dataListMobile'),
    dateInput: document.getElementById('dateInput'),
    filterStart: document.getElementById('filterStartDate'),
    filterEnd: document.getElementById('filterEndDate'),
    custName: document.getElementById('custName')
};

const modalAnalisis = new bootstrap.Modal(document.getElementById('modalAnalisis'));
const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
const modalHarga = new bootstrap.Modal(document.getElementById('modalHarga'));
const univModalEl = document.getElementById('universalModal');
const univModal = new bootstrap.Modal(univModalEl);

// --- 3. TRANSLATION & LOCALIZATION ---
const translations = {
    id: {
        login_desc: "Masukkan kode akses Anda", btn_login: "MASUK", err_login: "Kode Salah!", nav_logout: "Keluar", nav_input: "Input", nav_report: "Laporan", nav_history: "Riwayat", title_form: "Form Transaksi", btn_cancel_edit: "Batal Edit", lbl_date: "TANGGAL", lbl_item_order: "ITEM PESANAN", btn_cancel_change: "Batal Ubah", lbl_customer_name: "NAMA PELANGGAN", ph_customer_name: "Ketik nama atau pilih langganan...", lbl_main_menu: "Menu Utama", lbl_topping: "Topping", lbl_fried: "Gorengan", lbl_total_item: "Total Harga Item:", btn_add_cart: "MASUKKAN KE KERANJANG", lbl_sibling_share: "Setor Saudara", lbl_net_profit: "Profit Bersih", btn_save_data: "SIMPAN DATA", btn_copy_report: "Salin Laporan Harian", lbl_total_omset: "Total Omset", lbl_my_profit: "Profit Saya", title_chart: "Grafik Performa", msg_date_error: "Tanggal Filter Terbalik!", title_top_customer: "Top 5 Pelanggan Setia", title_history: "Riwayat Transaksi (100 Hari Terakhir)", th_date: "Tanggal", th_details: "Rincian (L/T/B)", th_omset: "Omset", th_share: "Setor", th_profit: "Profit", th_action: "Aksi", modal_detail_title: "Rincian Pembeli", modal_price_title: "Pengaturan Harga", msg_price_info: "Perubahan harga akan berlaku untuk transaksi baru.", lbl_price_sell: "Harga Jual", lbl_price_share: "Setor Saudara", lbl_price_capital: "Modal", btn_cancel: "Batal", btn_save_changes: "Simpan Perubahan", toast_saved: "Berhasil disimpan!", msg_confirm_logout: "Keluar dari panel admin?", msg_confirm_delete: "Hapus?", msg_data_empty: "Data Kosong! Isi minimal 1 penjualan.", msg_name_required: "Nama pembeli wajib diisi!", msg_confirm_nav: "Data perubahan belum disimpan. Pindah menu akan membatalkan edit. Lanjutkan?", msg_edit_first: "Selesaikan edit dulu!", msg_data_saved: "Data transaksi berhasil disimpan!", msg_report_copied: "Laporan disalin! Silakan paste di WA.", msg_copy_failed: "Gagal menyalin text.", msg_no_data_download: "Tidak ada data untuk diunduh.", msg_data_not_found: "Data tidak ditemukan pada tanggal tersebut.", lbl_today: "HARI INI", lbl_sort_by: "URUTKAN BERDASARKAN:"
    },
    en: {
        login_desc: "Please enter access code", btn_login: "LOGIN", err_login: "Wrong Code!", nav_logout: "Logout", nav_input: "Input", nav_report: "Report", nav_history: "History", title_form: "Transaction Form", btn_cancel_edit: "Cancel Edit", lbl_date: "DATE", lbl_item_order: "ORDER ITEMS", btn_cancel_change: "Cancel Change", lbl_customer_name: "CUSTOMER NAME", ph_customer_name: "Type name or select...", lbl_main_menu: "Main Menu", lbl_topping: "Topping", lbl_fried: "Fried Sides", lbl_total_item: "Item Subtotal:", btn_add_cart: "ADD TO CART", lbl_sibling_share: "Sibling Share", lbl_net_profit: "Net Profit", btn_save_data: "SAVE DATA", btn_copy_report: "Copy Daily Report", lbl_total_omset: "Total Revenue", lbl_my_profit: "My Profit", title_chart: "Performance Chart", msg_date_error: "Invalid Date Range!", title_top_customer: "Top 5 Loyal Customers", title_history: "Transaction History (Last 100 Days)", th_date: "Date", th_details: "Details (L/E/B)", th_omset: "Revenue", th_share: "Share", th_profit: "Profit", th_action: "Action", modal_detail_title: "Buyer Details", modal_price_title: "Price Settings", msg_price_info: "Price changes will apply to new transactions.", lbl_price_sell: "Selling Price", lbl_price_share: "Sibling Share", lbl_price_capital: "Cost (Modal)", btn_cancel: "Cancel", btn_save_changes: "Save Changes", toast_saved: "Saved successfully!", msg_confirm_logout: "Logout from admin panel?", msg_confirm_delete: "Delete?", msg_data_empty: "Empty Data! Add at least 1 sale.", msg_name_required: "Customer name is required!", msg_confirm_nav: "Unsaved changes. Switching menu will cancel edit. Continue?", msg_edit_first: "Finish editing first!", msg_data_saved: "Transaction data saved successfully!", msg_report_copied: "Report copied! Please paste in WA.", msg_copy_failed: "Failed to copy text.", msg_no_data_download: "No data to download.", msg_data_not_found: "No data found on selected dates.", lbl_today: "TODAY", lbl_sort_by: "SORT BY:"
    }
};

let currentLang = localStorage.getItem('appLang') || 'id';
function getTrans(key) { return translations[currentLang][key] || key; }

window.updateLanguageUI = () => {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    const labelText = currentLang.toUpperCase();
    const desktopLabel = document.getElementById('desktopLangLabel');
    const mobileLabel = document.getElementById('mobileLangLabel');
    if (desktopLabel) desktopLabel.innerText = labelText;
    if (mobileLabel) mobileLabel.innerText = labelText;
}

window.toggleLanguage = () => {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    localStorage.setItem('appLang', currentLang);
    window.updateLanguageUI();
    renderDashboard(globalData);
}

// --- 4. AUTHENTICATION ---
const overlay = document.getElementById('loginOverlay');
const passInput = document.getElementById('passcodeInput');
const errorMsg = document.getElementById('loginError');

window.checkLogin = () => {
    const input = passInput.value;
    if (input && btoa(input) === AUTH_HASH) {
        sessionStorage.setItem("isLoggedIn", "true");
        overlay.style.transition = "opacity 0.5s";
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 500);
    } else {
        errorMsg.classList.remove('d-none');
        passInput.classList.add('is-invalid');
        passInput.value = '';
        passInput.focus();
    }
}

if (sessionStorage.getItem("isLoggedIn")) { overlay.remove(); }
if (passInput) { passInput.addEventListener("keypress", function (event) { if (event.key === "Enter") { window.checkLogin(); } }); }

window.logoutAdmin = () => {
    showUniversalConfirm(
        'danger', 'Keluar Admin?', 'Anda harus memasukkan kode PIN lagi nanti.', 'Ya, Keluar',
        () => {
            isLogoutProcess = true;
            orderList = [];
            sessionStorage.removeItem("isLoggedIn");
            window.location.reload();
        }
    );
}

// --- 5. UNIVERSAL MODAL LOGIC ---
let onConfirmAction = null;
window.showUniversalConfirm = (type, title, message, confirmText, callback) => {
    const icon = document.getElementById('univModalIcon');
    const iconBg = document.getElementById('univModalIconBg');
    const btn = document.getElementById('btnUnivConfirm');

    document.getElementById('univModalTitle').innerText = title;
    document.getElementById('univModalBody').innerText = message;
    btn.innerHTML = confirmText;

    iconBg.className = '';
    btn.className = 'btn fw-bold rounded-pill py-2 shadow-sm';
    btn.classList.remove('btn-danger', 'btn-warning', 'btn-primary');

    if (type === 'danger') {
        iconBg.style.background = '#fef2f2';
        icon.className = 'bi bi-exclamation-triangle-fill text-danger';
        btn.classList.add('btn-danger');
    } else if (type === 'warning') {
        iconBg.style.background = '#fffbeb';
        icon.className = 'bi bi-question-circle-fill text-warning';
        btn.classList.add('btn-warning', 'text-dark');
    } else {
        iconBg.style.background = '#eff6ff';
        icon.className = 'bi bi-info-circle-fill text-primary';
        btn.classList.add('btn-primary');
    }

    onConfirmAction = callback;
    univModal.show();
}

document.getElementById('btnUnivConfirm').addEventListener('click', () => {
    if (onConfirmAction) onConfirmAction();
    univModal.hide();
});

// --- 6. CORE APP LOGIC ---
window.showToast = (message, type = 'success') => {
    const toastEl = document.getElementById('liveToast');
    const msgEl = document.getElementById('toastMessage');
    msgEl.innerText = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

async function setupHarga() {
    try {
        const docRef = doc(db, "settings", "harga_terkini");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { HARGA = docSnap.data(); } else { await setDoc(docRef, HARGA); }
        updateSubtotalPreview();
    } catch (e) { console.error("Gagal memuat harga:", e); }
}

window.bukaModalHarga = () => {
    document.getElementById('set_lontong_jual').value = HARGA.lontong_jual;
    document.getElementById('set_lontong_setor').value = HARGA.lontong_setor;
    document.getElementById('set_telur_jual').value = HARGA.telur_jual;
    document.getElementById('set_telur_modal').value = HARGA.telur_modal;
    document.getElementById('set_bakwan_jual').value = HARGA.bakwan_jual;
    document.getElementById('set_bakwan_setor').value = HARGA.bakwan_setor;
    document.getElementById('set_kerupuk_jual').value = HARGA.kerupuk_jual || 1000;
    modalHarga.show();
}

window.simpanHarga = async () => {
    modalHarga.hide();
    showUniversalConfirm(
        'info', 'Simpan Harga Baru?', 'Harga baru ini akan berlaku untuk semua transaksi selanjutnya.', 'Simpan Perubahan',
        async () => {
            const newHarga = {
                lontong_jual: parseInt(document.getElementById('set_lontong_jual').value) || 0,
                lontong_setor: parseInt(document.getElementById('set_lontong_setor').value) || 0,
                telur_jual: parseInt(document.getElementById('set_telur_jual').value) || 0,
                telur_modal: parseInt(document.getElementById('set_telur_modal').value) || 0,
                bakwan_jual: parseInt(document.getElementById('set_bakwan_jual').value) || 0,
                bakwan_setor: parseInt(document.getElementById('set_bakwan_setor').value) || 0,
                kerupuk_jual: parseInt(document.getElementById('set_kerupuk_jual').value) || 0
            };
            try {
                await setDoc(doc(db, "settings", "harga_terkini"), newHarga);
                HARGA = newHarga;
                updateSubtotalPreview();
                showToast(getTrans('toast_saved'), "success");
            } catch (error) {
                showToast("Gagal menyimpan: " + error.message, "danger");
                modalHarga.show();
            }
        }
    );
    univModalEl.addEventListener('hidden.bs.modal', function onHidden() {
        if (!onConfirmAction) modalHarga.show();
        univModalEl.removeEventListener('hidden.bs.modal', onHidden);
    }, { once: true });
}

// --- 7. NAVIGATION LOGIC ---
let pendingTargetId = null;
let pendingElement = null;

window.switchMobileMenu = (e, el, targetId) => {
    if (e) e.preventDefault();
    if (targetId !== 'input' && orderList.length > 0) {
        pendingTargetId = targetId;
        pendingElement = el;
        showUniversalConfirm(
            'warning', 'Belum Disimpan!', 'Pesanan yang sedang diketik akan hilang. Lanjut?', 'Buang & Pindah',
            () => {
                resetFormMode();
                lakukanPerpindahanMenu(pendingElement, pendingTargetId);
            }
        );
        return;
    }
    lakukanPerpindahanMenu(el, targetId);
}

function lakukanPerpindahanMenu(el, targetId) {
    document.querySelectorAll('.nav-item-mobile').forEach(item => item.classList.remove('active'));

    if (el) el.classList.add('active');
    else {
        if (targetId === 'input') document.querySelector('.nav-item-mobile[onclick*="input"]').classList.add('active');
        if (targetId === 'stats') document.querySelector('.nav-item-mobile[onclick*="stats"]').classList.add('active');
        if (targetId === 'history') document.querySelector('.nav-item-mobile[onclick*="history"]').classList.add('active');
    }

    ['section-form', 'section-stats', 'section-history'].forEach(sec => {
        const elem = document.getElementById(sec);
        elem.classList.remove('mobile-active-view');
        elem.classList.add('mobile-hidden-view');
    });

    let target;
    if (targetId === 'input') target = document.getElementById('section-form');
    else if (targetId === 'stats') target = document.getElementById('section-stats');
    else if (targetId === 'history') target = document.getElementById('section-history');

    if (target) {
        target.classList.remove('mobile-hidden-view');
        target.classList.add('mobile-active-view');
    }

    if (targetId === 'input' && !dom.editId.value) setFormDateToToday();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('beforeunload', function (e) {
    if (orderList.length > 0 && !isLogoutProcess) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

window.addEventListener('popstate', function (event) {
    if (orderList.length > 0) {
        if (confirm(getTrans('msg_confirm_nav'))) history.back();
        else history.pushState({ status: 'editing' }, null, '');
    }
});

function updateHistoryTrap() {
    if (orderList.length > 0) {
        if (!history.state || history.state.status !== 'editing') history.pushState({ status: 'editing' }, null, '');
    }
}

// --- 8. UI UPDATES ---
const inputNama = document.getElementById('custName');
const suggestBox = document.getElementById('suggestionList');

inputNama.addEventListener('input', function () {
    const val = this.value.toLowerCase();
    const btnClear = document.getElementById('btnClearName');
    if (val.length > 0) btnClear.style.display = 'block';
    else btnClear.style.display = 'none';

    suggestBox.innerHTML = '';
    if (!val) { suggestBox.style.display = 'none'; return; }

    const matches = (window.allCustomerNames || []).filter(n =>
        n.toLowerCase().includes(val) && n.toLowerCase() !== 'x'
    );

    if (matches.length > 0) {
        suggestBox.style.display = 'block';
        matches.slice(0, 5).forEach(name => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = name.replace(new RegExp(val, "gi"), (match) => `<b>${match}</b>`);
            item.onclick = () => pilihNama(name);
            suggestBox.appendChild(item);
        });
    } else { suggestBox.style.display = 'none'; }

    if (val.length > 2 && window.cekStatusPelangganLokal(val)) {
        inputNama.classList.add('border-success');
    } else {
        inputNama.classList.remove('border-success');
    }
});

document.addEventListener('click', function (e) {
    if (e.target !== inputNama && e.target !== suggestBox) suggestBox.style.display = 'none';
});

window.pilihNama = (nama) => {
    inputNama.value = nama;
    suggestBox.style.display = 'none';
    document.getElementById('btnClearName').style.display = 'block';
}

window.clearNameInput = () => {
    const inputNama = document.getElementById('custName');
    inputNama.value = '';
    inputNama.focus();
    inputNama.classList.remove('border-success');
    document.getElementById('suggestionList').style.display = 'none';
    document.getElementById('btnClearName').style.display = 'none';
}

window.ubahJumlah = (inputId, change) => {
    const input = document.getElementById(inputId);
    let val = parseInt(input.value) || 0;
    let newVal = val + change;
    if (newVal < 0) newVal = 0;
    input.value = newVal;
    if (navigator.vibrate) navigator.vibrate(40);
    updateSubtotalPreview();
}

function updateSubtotalPreview() {
    const cL = Math.max(0, parseInt(document.getElementById('custLontong').value) || 0);
    const cT = Math.max(0, parseInt(document.getElementById('custTelur').value) || 0);
    const cB = Math.max(0, parseInt(document.getElementById('custBakwan').value) || 0);
    const total = (cL * HARGA.lontong_jual) + (cT * HARGA.telur_jual) + (cB * HARGA.bakwan_jual);
    document.getElementById('previewSubtotal').innerText = 'Rp ' + total.toLocaleString('id-ID');
}

['custLontong', 'custTelur', 'custBakwan'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateSubtotalPreview);
});

// --- 9. STICKY ACTION BAR LOGIC ---
window.updateStickyBar = () => {
    const bar = document.getElementById('stickySaveBar');

    if (orderList.length > 0) {
        bar.style.display = 'block';
        document.body.classList.add('has-sticky-bar');

        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) bottomNav.style.display = 'none';

        const totalL = document.getElementById('qtyLontong').value || 0;
        const totalT = document.getElementById('qtyTelur').value || 0;
        const totalB = document.getElementById('qtyBakwan').value || 0;

        const omset = document.getElementById('previewOmset').innerText;
        const profit = document.getElementById('previewUntung').innerText;
        const setor = document.getElementById('previewSetor').innerText;

        document.getElementById('stkL').innerText = totalL;
        document.getElementById('stkT').innerText = totalT;
        document.getElementById('stkB').innerText = totalB;

        document.getElementById('stickyTotal').innerText = omset;
        document.getElementById('stkProfit').innerText = profit;

        const elSetor = document.getElementById('stkSetor');
        if (elSetor) elSetor.innerText = setor;

    } else {
        bar.style.display = 'none';
        document.body.classList.remove('has-sticky-bar');

        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) bottomNav.style.display = 'flex';
    }
}

window.triggerSimpan = () => {
    const form = document.getElementById('salesForm');
    form.dispatchEvent(new Event('submit'));
}

window.batalkanSemuaTransaksi = () => {
    showUniversalConfirm(
        'danger',
        'Batalkan Transaksi?',
        'Semua item di keranjang akan dihapus. Form akan di-reset.',
        'Ya, Hapus Semua',
        () => {
            dom.editId.value = '';
            document.getElementById('salesForm').reset();
            orderList = [];
            batalEditPesanan();
            renderOrderList();
            setFormDateToToday();
            showToast("Transaksi dibatalkan", "warning");
        }
    );
}

// --- 10. SALES LOGIC ---
function setFormDateToToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dom.dateInput.value = `${year}-${month}-${day}`;
}

function normalizeDate(d) {
    if (!d) return "";
    if (typeof d === 'string') {
        if (d.includes('T')) return d.split('T')[0];
        return d;
    }
    if (d.toDate) return d.toDate().toISOString().split('T')[0];
    return new Date(d).toISOString().split('T')[0];
}

window.cekStatusPelangganLokal = (namaInput) => {
    if (!namaInput) return false;
    const cleanInput = namaInput.trim().toLowerCase();
    if (cleanInput === 'x' || cleanInput === 'hamba allah') return true;
    const count = (window.customerCounts && window.customerCounts[cleanInput]) || 0;
    return count <= 1;
}

async function cekStatusRealtime(namaInput, tanggalInputStr) {
    const cleanName = namaInput.trim().toLowerCase();
    if (cleanName === 'x' || cleanName === 'hamba allah') return true;

    const inputDateStr = normalizeDate(tanggalInputStr);
    let minDateLocal = null;
    let foundInLocal = false;

    globalData.forEach(doc => {
        if (doc.detail_pelanggan) {
            const isExist = doc.detail_pelanggan.some(p => p.nama.trim().toLowerCase() === cleanName);
            if (isExist) {
                foundInLocal = true;
                const dStr = normalizeDate(doc.date);
                if (!minDateLocal || dStr < minDateLocal) minDateLocal = dStr;
            }
        }
    });

    if (foundInLocal && minDateLocal < inputDateStr) return false;

    try {
        const q = query(collection(db, "penjualan_detail"), where("date", "<", inputDateStr), orderBy("date", "desc"), limit(50));
        const snapshot = await getDocs(q);
        let foundInDb = false;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.detail_pelanggan) {
                if (data.detail_pelanggan.some(p => p.nama.trim().toLowerCase() === cleanName)) foundInDb = true;
            }
        });
        if (foundInDb) return false;
    } catch (e) { return true; }
    return true;
}

window.prosesPesanan = async () => {
    const btn = document.getElementById('btnAddDetail');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cek...';
    btn.disabled = true;

    const nama = document.getElementById('custName').value;
    const tgl = document.getElementById('dateInput').value;
    const cL = Math.max(0, parseInt(document.getElementById('custLontong').value) || 0);
    const cT = Math.max(0, parseInt(document.getElementById('custTelur').value) || 0);
    const cB = Math.max(0, parseInt(document.getElementById('custBakwan').value) || 0);

    if (!nama) {
        showToast(getTrans('msg_name_required'), "warning");
        btn.innerHTML = originalText; btn.disabled = false;
        return;
    }

    let statusBaru = false;
    const cleanName = nama.trim().toLowerCase();
    const existsInCart = orderList.some(item => item.nama.toLowerCase() === cleanName);

    if (existsInCart && detailEditingIndex === -1) {
        statusBaru = false;
    } else {
        statusBaru = await cekStatusRealtime(nama, tgl);
    }

    const payload = { nama, cL, cT, cB, is_new: statusBaru };

    if (detailEditingIndex === -1) {
        orderList.push(payload);
    } else {
        payload.is_new = await cekStatusRealtime(nama, tgl);
        orderList[detailEditingIndex] = payload;
        batalEditPesanan();
    }

    resetInputDetail();
    renderOrderList();
    updateHistoryTrap();
    btn.innerHTML = originalText; btn.disabled = false;
}

window.editPesananDetail = (idx) => {
    const d = orderList[idx];
    const inputNama = document.getElementById('custName');
    inputNama.value = d.nama;
    document.getElementById('custLontong').value = d.cL;
    document.getElementById('custTelur').value = d.cT;
    document.getElementById('custBakwan').value = d.cB;
    updateSubtotalPreview();
    detailEditingIndex = idx;

    document.getElementById('btnAddDetail').innerHTML = '<i class="bi bi-pencil"></i> Update';
    document.getElementById('btnAddDetail').classList.replace('btn-primary', 'btn-warning');
    document.getElementById('btnBatalEditDetail').classList.remove('d-none');

    inputNama.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputNama.focus();
}

window.batalEditPesanan = () => {
    detailEditingIndex = -1;
    resetInputDetail();
    document.getElementById('btnAddDetail').innerHTML = '<i class="bi bi-plus-lg"></i> ' + getTrans('btn_add_cart');
    document.getElementById('btnAddDetail').classList.replace('btn-warning', 'btn-primary');
    document.getElementById('btnBatalEditDetail').classList.add('d-none');
}

window.hapusPesanan = (idx) => {
    if (idx === detailEditingIndex) { showToast(getTrans('msg_edit_first'), "warning"); return; }
    orderList.splice(idx, 1);
    renderOrderList();
    if (orderList.length > 0) updateHistoryTrap();
}

function resetInputDetail() {
    document.getElementById('custName').value = '';
    document.getElementById('btnClearName').style.display = 'none';
    document.getElementById('custLontong').value = '1';
    document.getElementById('custTelur').value = '0';
    document.getElementById('custBakwan').value = '0';
    updateSubtotalPreview();
}

function renderOrderList() {
    const container = document.getElementById('listPesananContainer');
    container.innerHTML = '';
    let tL = 0, tT = 0, tB = 0;

    if (orderList.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <i class="bi bi-basket2"></i>
                <p>List Kosong</p>
            </div>`;

        dom.qtyL.value = 0;
        dom.qtyT.value = 0;
        dom.qtyB.value = 0;

        hitungEstimasi();
        updateStickyBar();
        return;
    }

    orderList.forEach((i, idx) => {
        tL += i.cL; tT += i.cT; tB += i.cB;
        const subtotal = (i.cL * HARGA.lontong_jual) + (i.cT * HARGA.telur_jual) + (i.cB * HARGA.bakwan_jual);

        let badgesHtml = '';
        if (i.cL > 0) badgesHtml += `<span class="badge-item bg-lontong">Lontong ${i.cL}</span>`;
        if (i.cT > 0) badgesHtml += `<span class="badge-item bg-telur">Telur ${i.cT}</span>`;
        if (i.cB > 0) badgesHtml += `<span class="badge-item bg-bakwan">Bakwan ${i.cB}</span>`;

        let badgeBaruHtml = i.is_new ? `<span class="badge bg-success bg-opacity-10 text-success border border-success px-2 ms-1" style="font-size:0.6rem; vertical-align: text-top;">BARU</span>` : '';

        const cardItem = `
        <div class="order-card">
            <div class="order-info">
                <div class="d-flex align-items-center">
                    <div class="order-name">${i.nama}</div>
                    ${badgeBaruHtml} 
                </div>
                <div class="order-badges">${badgesHtml}</div>
            </div>
            <div class="order-right">
                <div class="price-tag">Rp ${subtotal.toLocaleString('id-ID')}</div>
                <div class="action-btn-group">
                    <button type="button" class="btn-action-icon text-warning" onclick="editPesananDetail(${idx})" title="Edit"><i class="bi bi-pencil-square" style="font-size: 0.9rem;"></i></button>
                    <button type="button" class="btn-action-icon text-danger" onclick="hapusPesanan(${idx})" title="Hapus"><i class="bi bi-trash" style="font-size: 0.9rem;"></i></button>
                </div>
            </div>
        </div>`;
        container.innerHTML += cardItem;
    });
    dom.qtyL.value = tL; dom.qtyT.value = tT; dom.qtyB.value = tB;
    hitungEstimasi();
    updateStickyBar();
}

function hitungEstimasi() {
    let qL = parseInt(dom.qtyL.value) || 0;
    let qT = parseInt(dom.qtyT.value) || 0;
    let qB = parseInt(dom.qtyB.value) || 0;

    const omset = (qL * HARGA.lontong_jual) + (qT * HARGA.telur_jual) + (qB * HARGA.bakwan_jual);
    const setor = (qL * HARGA.lontong_setor) + (qB * HARGA.bakwan_setor);
    const untung = (omset - setor) - (qT * HARGA.telur_modal);

    document.getElementById('previewOmset').innerText = 'Rp ' + omset.toLocaleString('id-ID');
    document.getElementById('previewSetor').innerText = 'Rp ' + setor.toLocaleString('id-ID');
    document.getElementById('previewUntung').innerText = 'Rp ' + untung.toLocaleString('id-ID');
    return { qL, qT, qB, omset, setor, untung };
}

document.getElementById('salesForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSticky = document.querySelector('.btn-simpan');
    const originalText = btnSticky ? btnSticky.innerHTML : '';

    const cId = dom.editId.value, calc = hitungEstimasi();

    if (calc.qL === 0 && calc.qT === 0 && calc.qB === 0) { showToast(getTrans('msg_data_empty'), "warning"); return; }

    if (btnSticky) {
        btnSticky.disabled = true;
        btnSticky.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    }

    try {
        const payload = { date: dom.dateInput.value, lontong: calc.qL, telur: calc.qT, bakwan: calc.qB, omset: calc.omset, setor: calc.setor, untung: calc.untung, detail_pelanggan: orderList, timestamp: new Date() };

        if (cId) await updateDoc(doc(db, "penjualan_detail", cId), payload);
        else await addDoc(collection(db, "penjualan_detail"), payload);

        showToast(getTrans('msg_data_saved'), "success");
        orderList = [];
        resetFormMode();
    } catch (err) {
        showToast("Error: " + err.message, "danger");
    } finally {
        if (btnSticky) {
            btnSticky.disabled = false;
            btnSticky.innerHTML = originalText;
        }
    }
});

// --- 11. REPORTING & CHARTS ---
window.copyReport = () => {
    const d = dom.dateInput.value;
    const qL = dom.qtyL.value; const qT = dom.qtyT.value; const qB = dom.qtyB.value;
    const omset = document.getElementById('previewOmset').innerText;
    const setor = document.getElementById('previewSetor').innerText;
    const untung = document.getElementById('previewUntung').innerText;

    const text = `*LAPORAN LONTONG MM*\n📅 ${formatDate(d)}\n\n📦 *Penjualan:*\n- Lontong: ${qL} porsi\n- Telur: ${qT} butir\n- Bakwan: ${qB} biji\n\n💰 *Keuangan:*\n- Omset: ${omset}\n- Setor: ${setor}\n- *Profit Bersih: ${untung}*\n\nTerima kasih.`;

    navigator.clipboard.writeText(text)
        .then(() => showToast(getTrans('msg_report_copied'), "success"))
        .catch(err => showToast(getTrans('msg_copy_failed'), "danger"));
}

window.sortData = (column) => {
    if (currentSort.column === column) currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    else { currentSort.column = column; currentSort.direction = 'desc'; }
    updateSortIcons();

    globalData.sort((a, b) => {
        let valA = a[column]; let valB = b[column];
        if (column === 'date') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime(); }
        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    renderDashboard(globalData);
}

function updateSortIcons() {
    ['date', 'omset', 'setor', 'untung'].forEach(col => {
        const icon = document.getElementById(`icon-${col}`);
        if (icon) icon.className = 'bi bi-filter text-muted';
        const pill = document.getElementById(`pill-${col}`);
        if (pill) pill.classList.remove('active');
    });

    const activeIcon = document.getElementById(`icon-${currentSort.column}`);
    if (activeIcon) activeIcon.className = currentSort.direction === 'asc' ? 'bi bi-caret-up-fill text-dark' : 'bi bi-caret-down-fill text-dark';

    const activePill = document.getElementById(`pill-${currentSort.column}`);
    if (activePill) {
        activePill.classList.add('active');
        const arrow = currentSort.direction === 'asc' ? 'up' : 'down';
        const labelKey = { date: 'th_date', omset: 'th_omset', setor: 'th_share', untung: 'th_profit' }[currentSort.column];
        activePill.innerHTML = `${getTrans(labelKey)} <i class="bi bi-arrow-${arrow}"></i>`;
    }
}

function renderDashboard(data) {
    updateSortIcons();

    const counts = {};
    data.forEach(trx => {
        if (trx.detail_pelanggan && Array.isArray(trx.detail_pelanggan)) {
            trx.detail_pelanggan.forEach(p => {
                if (p.nama) {
                    const n = p.nama.trim().toLowerCase();
                    if (n !== 'x' && n !== 'hamba allah') {
                        counts[n] = (counts[n] || 0) + 1;
                    }
                }
            });
        }
    });
    window.customerCounts = counts;
    window.allCustomerNames = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    const chipsArea = document.getElementById('chipsArea');
    chipsArea.innerHTML = '';
    window.allCustomerNames.slice(0, 5).forEach(nameKey => {
        let displayName = nameKey.replace(/\b\w/g, l => l.toUpperCase());
        const chip = document.createElement('div');
        chip.className = 'chip-langganan';
        chip.innerHTML = `<i class="bi bi-person-fill me-1"></i>${displayName}`;
        chip.onclick = () => pilihNama(displayName);
        chipsArea.appendChild(chip);
    });

    const topListContainer = document.getElementById('topCustomersList');
    topListContainer.innerHTML = '';
    if (window.allCustomerNames.length === 0) {
        topListContainer.innerHTML = '<div class="text-center py-4 text-muted small">Belum ada data pelanggan</div>';
    } else {
        window.allCustomerNames.slice(0, 5).forEach((key, index) => {
            let displayName = key.replace(/\b\w/g, l => l.toUpperCase());
            let count = counts[key];
            let rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : (index === 2 ? 'rank-3' : 'bg-light text-muted'));
            const item = `
            <div class="list-group-item-custom">
                <div class="d-flex align-items-center">
                    <div class="rank-badge ${rankClass}">${index + 1}</div>
                    <div class="fw-bold text-dark" style="font-size:0.9rem;">${displayName}</div>
                </div>
                <div class="badge bg-light text-primary border border-primary-subtle rounded-pill px-3">${count}x Order</div>
            </div>`;
            topListContainer.innerHTML += item;
        });
    }

    let labels = [], dUntung = [], dSetor = [], gOmset = 0, gProfit = 0, gSetor = 0;
    dom.tableDesktop.innerHTML = '';
    dom.listMobile.innerHTML = '';

    data.forEach(d => { gOmset += d.omset; gProfit += d.untung; gSetor += d.setor; });
    const chartData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    chartData.forEach(d => { labels.push(formatChartDate(d.date)); dUntung.push(d.untung); dSetor.push(d.setor); });

    document.getElementById('grandOmset').innerText = 'Rp ' + gOmset.toLocaleString('id-ID');
    document.getElementById('grandSetor').innerText = 'Rp ' + gSetor.toLocaleString('id-ID');
    document.getElementById('grandProfit').innerText = 'Rp ' + gProfit.toLocaleString('id-ID');

    let dHtml = '', mHtml = '';
    data.forEach(d => {
        const json = JSON.stringify(d).replace(/"/g, '&quot;');
        const isToday = new Date(d.date).toDateString() === new Date().toDateString();
        const rowClass = isToday ? 'table-success' : '';
        const badgeHariIniDesktop = isToday ? `<span class="badge bg-success ms-2">${getTrans('lbl_today')}</span>` : '';
        const cardClass = isToday ? 'shadow border-primary' : 'shadow-sm border-0';

        dHtml += `
        <tr class="${rowClass}">
            <td class="ps-3 fw-bold">${formatDate(d.date)} ${badgeHariIniDesktop}</td>
            <td><span class="badge bg-light text-dark border">L:${d.lontong} T:${d.telur} B:${d.bakwan}</span></td>
            <td class="text-end">Rp ${d.omset.toLocaleString('id-ID')}</td>
            <td class="text-end text-warning">Rp ${d.setor.toLocaleString('id-ID')}</td>
            <td class="text-end text-success fw-bold">Rp ${d.untung.toLocaleString('id-ID')}</td>
            <td class="text-center pe-3">
                <button class="btn btn-sm btn-light text-primary border" onclick='window.lihatDetail(${json})'><i class="bi bi-eye"></i></button> 
                <button class="btn btn-sm btn-light text-warning border" onclick='window.editData(${json})'><i class="bi bi-pencil"></i></button> 
                <button class="btn btn-sm btn-light text-danger border" onclick='window.hapusData("${d.id}")'><i class="bi bi-trash"></i></button>
            </td>
        </tr>`;

        mHtml += `
        <div class="card mb-3 ${cardClass}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex flex-column">
                        ${isToday ? `<div class="badge bg-success mb-1" style="width:fit-content;">${getTrans('lbl_today')}</div>` : ''}
                        <h6 class="card-title mb-0 fw-bold"><i class="bi bi-calendar-event me-2"></i>${formatDate(d.date)}</h6>
                    </div>
                    <span class="badge bg-light text-dark border mt-1">L:${d.lontong} T:${d.telur} B:${d.bakwan}</span>
                </div>
                <div class="row g-0 mb-3 text-center bg-white rounded-3 p-2 border">
                    <div class="col-4 border-end"><div class="text-xs text-muted fw-bold">OMSET</div><div class="fw-bold">${(d.omset / 1000).toFixed(0)}k</div></div>
                    <div class="col-4 border-end"><div class="text-xs text-muted fw-bold">SETOR</div><div class="fw-bold text-warning">${(d.setor / 1000).toFixed(0)}k</div></div>
                    <div class="col-4"><div class="text-xs text-muted fw-bold">PROFIT</div><div class="fw-bold text-success">${(d.untung / 1000).toFixed(0)}k</div></div>
                </div>
                <div class="d-flex gap-2">
                     <button class="btn btn-sm btn-outline-primary flex-fill fw-bold" onclick='window.lihatDetail(${json})'>Detail</button>
                     <button class="btn btn-sm btn-outline-warning flex-fill fw-bold" onclick='window.editData(${json})'>Edit</button>
                     <button class="btn btn-sm btn-outline-danger" onclick='window.hapusData("${d.id}")'><i class="bi bi-trash"></i></button>
                </div>
            </div>
        </div>`;
    });
    dom.tableDesktop.innerHTML = dHtml || '<tr><td colspan="6" class="text-center py-3 text-muted">Belum ada data</td></tr>';
    dom.listMobile.innerHTML = mHtml;
    updateChart(labels, dUntung, dSetor);
}

function updateChart(labels, untung, setor) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Profit Saya', data: untung, backgroundColor: '#1cc88a', borderRadius: 6 }, { label: 'Setor Saudara', data: setor, backgroundColor: '#f6c23e', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, categoryPercentage: 0.8, barPercentage: 0.9, plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#f3f4f6' }, ticks: { callback: v => v / 1000 + 'k' } } } }
    });
}

window.downloadCSV = () => {
    if (globalData.length === 0) { showToast(getTrans('msg_no_data_download'), "warning"); return; }
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Lontong,Telur,Bakwan,Omset,Setor,Profit Bersih\n";
    globalData.forEach(row => { csvContent += [row.date, row.lontong, row.telur, row.bakwan, row.omset, row.setor, row.untung].join(",") + "\n"; });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `Laporan_LontongMM_${new Date().toISOString().slice(0, 10)}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

// --- 12. FIREBASE DATA LOADING & FILTERING ---
function loadLatestData() {
    if (unsubscribeRealtime) { unsubscribeRealtime(); unsubscribeRealtime = null; }
    const q = query(collection(db, "penjualan_detail"), orderBy("date", "desc"), limit(100));
    unsubscribeRealtime = onSnapshot(q, (s) => {
        globalData = [];
        s.forEach(doc => globalData.push({ id: doc.id, ...doc.data() }));
        renderDashboard(globalData);
    });
}

window.cariDataTanggal = async () => {
    const start = dom.filterStart.value; const end = dom.filterEnd.value; const msg = document.getElementById('filterMsg');
    if (!start && !end) { msg.classList.add('d-none'); loadLatestData(); return; }
    if (start && end && start > end) { msg.classList.remove('d-none'); return; } else { msg.classList.add('d-none'); }

    if (unsubscribeRealtime) { unsubscribeRealtime(); unsubscribeRealtime = null; }
    dom.tableDesktop.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary spinner-border-sm"></div> Mencari data lama...</td></tr>';

    try {
        let qConstraint = [];
        if (start) qConstraint.push(where("date", ">=", start));
        if (end) qConstraint.push(where("date", "<=", end));
        qConstraint.push(orderBy("date", "desc"));

        const q = query(collection(db, "penjualan_detail"), ...qConstraint);
        const snapshot = await getDocs(q);
        globalData = [];
        snapshot.forEach(doc => globalData.push({ id: doc.id, ...doc.data() }));

        if (globalData.length === 0) showToast(getTrans('msg_data_not_found'), "warning");
        renderDashboard(globalData);
    } catch (error) { showToast("Error: " + error.message, "danger"); }
}

dom.filterStart.addEventListener('change', window.cariDataTanggal);
dom.filterEnd.addEventListener('change', window.cariDataTanggal);
window.resetFilter = () => { dom.filterStart.value = ''; dom.filterEnd.value = ''; document.getElementById('filterMsg').classList.add('d-none'); loadLatestData(); }

// --- 13. DATA MANAGEMENT (EDIT/DELETE/DETAIL) ---
window.lihatDetail = (d) => {
    currentDetailData = d;
    const body = document.getElementById('detailModalBody');
    document.getElementById('modalDateDisplay').innerText = formatDate(d.date);
    body.innerHTML = '';

    const closeBtnHtml = `
    <div class="modal-footer-close p-3 bg-white border-top">
        <button type="button" class="btn btn-success w-100 fw-bold mb-2 shadow-sm" onclick="copyDetailReport()"><i class="bi bi-whatsapp me-2"></i>Salin Laporan ke WhatsApp</button>
        <button type="button" class="btn btn-light w-100 fw-bold text-muted border" data-bs-dismiss="modal">${getTrans('btn_cancel')}</button>
    </div>`;

    if (!d.detail_pelanggan || d.detail_pelanggan.length === 0) {
        body.innerHTML = `<div class="d-flex flex-column align-items-center justify-content-center py-5 text-muted"><i class="bi bi-inbox fs-1 opacity-25"></i><p class="small mt-2">Tidak ada data pembeli.</p></div>` + closeBtnHtml;
    } else {
        let contentHtml = `<div class="scroller-content" style="overscroll-behavior-y: contain;">`;
        d.detail_pelanggan.forEach(i => {
            let cK = i.cK || 0;
            const subtotal = (i.cL * HARGA.lontong_jual) + (i.cT * HARGA.telur_jual) + (i.cB * HARGA.bakwan_jual) + (cK * HARGA.kerupuk_jual);
            let itemBadges = '';
            if (i.cL > 0) itemBadges += `<span class="item-pill pill-l">Lontong ${i.cL}</span>`;
            if (i.cT > 0) itemBadges += `<span class="item-pill pill-t">Telur ${i.cT}</span>`;
            if (i.cB > 0) itemBadges += `<span class="item-pill pill-b">Bakwan ${i.cB}</span>`;
            if (cK > 0) itemBadges += `<span class="item-pill pill-k">Krupuk ${cK}</span>`;

            let badgeHtml = i.is_new ? `<span class="badge-baru-visual ms-2">BARU</span>` : '';

            contentHtml += `
            <div class="buyer-item">
                <div class="buyer-top-row">
                    <div class="d-flex align-items-center"><span class="buyer-name">${i.nama}</span>${badgeHtml}</div>
                    <div class="buyer-price">Rp ${subtotal.toLocaleString('id-ID')}</div>
                </div>
                <div class="item-badges-container">${itemBadges || '<span class="text-muted small">Item Lain</span>'}</div>
            </div>`;
        });
        contentHtml += `</div>
        <div class="modal-summary-footer bg-light border-top border-bottom" style="position: relative; z-index: 5;">
            <div class="row g-0">
                <div class="col-4 summary-box"><div class="summary-label">${getTrans('lbl_total_omset')}</div><div class="summary-val-dark">Rp ${d.omset.toLocaleString('id-ID')}</div></div>
                <div class="col-4 summary-box"><div class="summary-label">${getTrans('lbl_sibling_share')}</div><div class="summary-val-warn">Rp ${d.setor.toLocaleString('id-ID')}</div></div>
                <div class="col-4 summary-box"><div class="summary-label">${getTrans('lbl_net_profit')}</div><div class="summary-val-success">Rp ${d.untung.toLocaleString('id-ID')}</div></div>
            </div>
        </div>`;
        contentHtml += closeBtnHtml;
        body.innerHTML = contentHtml;
    }
    detailModal.show();
}

window.copyDetailReport = () => {
    if (!currentDetailData) return;
    const d = currentDetailData;
    const tgl = formatDate(d.date);
    const text = `*ARSIP LAPORAN LONTONG MM*\n📅 ${tgl}\n\n📦 *Penjualan:*\n- Lontong: ${d.lontong} porsi\n- Telur: ${d.telur} butir\n- Bakwan: ${d.bakwan} biji\n\n💰 *Keuangan:*\n- Omset: Rp ${d.omset.toLocaleString('id-ID')}\n- Setor: Rp ${d.setor.toLocaleString('id-ID')}\n- *Profit Bersih: Rp ${d.untung.toLocaleString('id-ID')}*\n\n(Dicetak dari Admin Panel)`;
    navigator.clipboard.writeText(text).then(() => showToast("Laporan berhasil disalin!", "success"));
}

window.editData = (d) => {
    dom.editId.value = d.id;
    dom.dateInput.value = d.date;
    orderList = d.detail_pelanggan || [];
    batalEditPesanan();
    renderOrderList();
    document.getElementById('btnCancelEdit').classList.remove('d-none');

    if (window.innerWidth < 768) {
        const navInput = document.querySelector(".nav-item-mobile.main-action");
        lakukanPerpindahanMenu(navInput, 'input');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetFormMode = () => {
    dom.editId.value = '';
    document.getElementById('salesForm').reset();
    orderList = [];
    batalEditPesanan();
    renderOrderList();
    setFormDateToToday();
    document.getElementById('btnCancelEdit').classList.add('d-none');
}

window.hapusData = async (id) => {
    showUniversalConfirm(
        'danger', 'Hapus Penjualan?', 'Data ini akan dihapus permanen. Yakin?', '<i class="bi bi-trash me-1"></i> Hapus Data',
        async () => { await deleteDoc(doc(db, "penjualan_detail", id)); }
    );
}

// --- 14. FITUR ANALISIS CERDAS AI ---
window.bukaModalAnalisis = () => {
    if (globalData.length < 2) {
        showToast("Data belum cukup untuk analisis.", "warning");
        return;
    }
    hitungPrediksiStok();
    hitungAnalisisPelanggan();
    modalAnalisis.show();
}

function hitungPrediksiStok() {
    const sortedData = [...globalData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentData = sortedData.slice(-7);

    if (recentData.length === 0) return;

    let sumL = 0, sumT = 0, sumB = 0;
    let totalWeight = 0;

    recentData.forEach((d, index) => {
        const weight = index + 1;
        sumL += (d.lontong * weight);
        sumT += (d.telur * weight);
        sumB += (d.bakwan * weight);
        totalWeight += weight;
    });

    const avgL = sumL / totalWeight;
    const avgT = sumT / totalWeight;
    const avgB = sumB / totalWeight;

    const predL = Math.ceil(avgL);
    const predT = Math.ceil(avgT);
    const predB = Math.ceil(avgB);

    const totalAvgL = sortedData.reduce((sum, d) => sum + d.lontong, 0) / sortedData.length;
    const trendIcon = predL > totalAvgL
        ? '<i class="bi bi-graph-up-arrow text-success"></i>'
        : '<i class="bi bi-graph-down-arrow text-danger"></i>';

    const container = document.getElementById('predictionRow');
    container.innerHTML = `
        <div class="col-4">
            <div class="bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25 h-100 position-relative">
                <div class="pred-title-box text-primary fw-bold text-uppercase">
                    <span>Lontong</span> ${trendIcon}
                </div>
                <div class="display-4 fw-bold text-primary">${predL}</div>
                <small class="text-muted fw-bold" style="font-size:0.6rem">Porsi</small>
            </div>
        </div>
        <div class="col-4">
            <div class="bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25 h-100">
                <div class="pred-title-box text-warning fw-bold text-uppercase">
                    <span>Telur</span>
                </div>
                <div class="display-4 fw-bold text-warning">${predT}</div>
                <small class="text-muted fw-bold" style="font-size:0.6rem">Butir</small>
            </div>
        </div>
        <div class="col-4">
            <div class="bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-25 h-100">
                <div class="pred-title-box text-secondary fw-bold text-uppercase">
                    <span>Bakwan</span>
                </div>
                <div class="display-4 fw-bold text-secondary">${predB}</div>
                <small class="text-muted fw-bold" style="font-size:0.6rem">Biji</small>
            </div>
        </div>
    `;
}

function hitungAnalisisPelanggan() {
    const customerStats = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    globalData.forEach(trx => {
        const trxDate = new Date(trx.date);
        trxDate.setHours(0, 0, 0, 0);

        if (trx.detail_pelanggan && Array.isArray(trx.detail_pelanggan)) {
            trx.detail_pelanggan.forEach(p => {
                const nama = p.nama.trim().toLowerCase();
                if (nama === 'x' || nama === 'hamba allah') return;
                const spend = (p.cL * HARGA.lontong_jual) + (p.cT * HARGA.telur_jual) + (p.cB * HARGA.bakwan_jual);
                if (!customerStats[nama]) {
                    customerStats[nama] = { realName: p.nama, visits: 0, totalSpend: 0, lastVisit: trxDate, firstVisit: trxDate };
                }
                customerStats[nama].visits += 1;
                customerStats[nama].totalSpend += spend;
                if (trxDate > customerStats[nama].lastVisit) customerStats[nama].lastVisit = trxDate;
                if (trxDate < customerStats[nama].firstVisit) customerStats[nama].firstVisit = trxDate;
            });
        }
    });

    let totalCust = 0, loyalCust = 0, lostCust = 0, newCust = 0;
    const riskList = [], sultanList = [];

    Object.values(customerStats).forEach(c => {
        totalCust++;
        const diffDays = Math.ceil(Math.abs(today - c.lastVisit) / (1000 * 60 * 60 * 24));
        if (c.visits >= 4) loyalCust++;
        if (diffDays > 7 && diffDays < 60) {
            lostCust++;
            if (c.visits >= 2) riskList.push({ name: c.realName, days: diffDays, visits: c.visits });
        }
        const diffFirst = Math.ceil(Math.abs(today - c.firstVisit) / (1000 * 60 * 60 * 24));
        if (diffFirst <= 7) newCust++;
        sultanList.push(c);
    });

    document.getElementById('statTotalCust').innerText = totalCust;
    document.getElementById('statLoyalCust').innerText = loyalCust;
    document.getElementById('statLostCust').innerText = lostCust;
    document.getElementById('statNewCust').innerText = newCust;

    sultanList.sort((a, b) => b.totalSpend - a.totalSpend);
    const listSultanEl = document.getElementById('listSultan');
    listSultanEl.innerHTML = '';

    sultanList.slice(0, 5).forEach((s, idx) => {
        const icon = idx === 0 ? '👑' : (idx === 1 ? '🥈' : '🥉');
        const badgeRank = idx < 3 ? `<span class="me-2 fs-5">${icon}</span>` : `<span class="badge bg-light text-muted border me-2">${idx + 1}</span>`;
        listSultanEl.innerHTML += `
            <div class="list-group-item d-flex justify-content-between align-items-center py-3">
                <div class="d-flex align-items-center">${badgeRank}
                    <div><div class="fw-bold text-dark">${s.realName}</div><div class="small text-muted">${s.visits}x Transaksi</div></div>
                </div>
                <div class="fw-bold text-success">Rp ${(s.totalSpend / 1000).toFixed(0)}k</div>
            </div>`;
    });

    riskList.sort((a, b) => b.visits - a.visits);
    const listRiskEl = document.getElementById('listRisk');
    listRiskEl.innerHTML = '';

    if (riskList.length === 0) listRiskEl.innerHTML = '<div class="p-4 text-center text-muted small">Semua pelanggan aktif!</div>';
    else {
        riskList.slice(0, 10).forEach(r => {
            listRiskEl.innerHTML += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div><div class="fw-bold text-dark">${r.name}</div><div class="small text-muted">Dulu beli ${r.visits}x</div></div>
                    <span class="badge bg-danger bg-opacity-10 text-danger border border-danger p-2">Absen ${r.days} Hari</span>
                </div>`;
        });
    }
}

// --- 15. HELPERS & INIT ---
function formatDate(d) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
function formatChartDate(d) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); }

loadLatestData();
setupHarga();
setFormDateToToday();
updateLanguageUI();
renderOrderList();
if (window.innerWidth < 768) window.switchMobileMenu(null, null, 'input');

PullToRefresh.init({
    mainElement: '#mainContent',
    triggerElement: 'body',
    onRefresh() {
        return new Promise((resolve) => {
            loadLatestData();
            setupHarga();
            setTimeout(() => { showToast("Data diperbarui", "success"); resolve(); }, 800);
        });
    },
    distThreshold: 70, distMax: 100,
    iconArrow: '<i class="bi bi-arrow-down"></i>',
    iconRefreshing: '<div class="spinner-border spinner-border-sm text-primary" role="status"></div>',
    shouldPullToRefresh: function () { return window.scrollY === 0 && !document.querySelector('.modal.show'); }
});


// --- FIX: SCROLL LOCK MODAL (IOS STABLE VERSION) ---
// Mengatasi masalah layar lompat/scroll sendiri saat modal ditutup

const detailModalEl = document.getElementById('detailModal');
let savedScrollPosition = 0;

if (detailModalEl) {
    // 1. Saat modal AKAN muncul
    detailModalEl.addEventListener('show.bs.modal', () => {
        // Simpan posisi scroll user saat ini
        savedScrollPosition = window.scrollY;
        
        // Kunci body dengan teknik 'Fixed' agar iOS tidak bisa scroll background
        // Teknik ini lebih ampuh daripada overflow:hidden biasa
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollPosition}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
    });

    // 2. Saat modal SUDAH tertutup
    detailModalEl.addEventListener('hidden.bs.modal', () => {
        // Lepas semua pengunci
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // KEMBALIKAN POSISI SCROLL (PENTING)
        // Ini mencegah layar lompat ke paling atas
        window.scrollTo(0, savedScrollPosition);
    });

    // 3. Tambahan: Pastikan scroll di dalam modal tetap lancar
    const scroller = detailModalEl.querySelector('.scroller-content');
    if (scroller) {
        scroller.addEventListener('touchmove', (e) => {
            e.stopPropagation(); // Biarkan scroll terjadi di dalam konten ini
        }, { passive: true });
    }
}