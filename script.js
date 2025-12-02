/* =========================================
   BAGIAN 0: INISIALISASI FIREBASE & CONFIG
   ========================================= */
const NOMOR_WA = "6289638931396";

const firebaseConfig = {
    apiKey: "AIzaSyCamv42dxGHJEqXMqVIPcOeWGNdM5p7X2E",
    authDomain: "lontong-mm.firebaseapp.com",
    projectId: "lontong-mm",
    storageBucket: "lontong-mm.firebasestorage.app",
    messagingSenderId: "628261457290",
    appId: "1:628261457290:web:8cbd5262f3cc3deb30cc73",
    measurementId: "G-GBN3GE3QKN"
};

// Init Firebase Global
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

/* =========================================
   BAGIAN 1: DATA MENU & FETCH HARGA
   ========================================= */
let cart = [];
let toppingState = {};

// Default Menu (Harga akan di-overwrite oleh Firebase)
let menuList = [
    {
        id: 1,
        nama: "Lontong Sayur",
        desc: "Sarapan ala 'Urang Awak'! Lontong lembut disiram kuah gulai nangka yang kental.",
        hargaDasar: 11000, // Default
        img: "ltsyr.webp",
        opsi: [
            { id: 'telur', nama: "Telur Rebus", harga: 3000 },
            { id: 'bakwan', nama: "Bakwan Goreng", harga: 1000 },
            { id: 'kerupuk', nama: "Kerupuk Tambahan", harga: 1000 }
        ]
    },
    {
        id: 2,
        nama: "Lontong Pical",
        desc: "Khas Minang! Lontong, mie kuning, sayuran disiram bumbu kacang pedas gurih.",
        hargaDasar: 11000, // Default
        img: "ltpcl.webp",
        opsi: [
            { id: 'telur', nama: "Telur Rebus", harga: 3000 },
            { id: 'bakwan', nama: "Bakwan Goreng", harga: 1000 },
            { id: 'kerupuk', nama: "Kerupuk Tambahan", harga: 1000 }
        ]
    }
];

// FUNGSI UTAMA: Ambil Harga -> Render Menu
function initMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return;

    // Tampilkan Loading hanya saat pertama kali (jika container kosong)
    if (!container.innerHTML.trim()) {
        container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-success" role="status"></div><p class="mt-2 text-muted small">Menghubungkan ke server...</p></div>';
    }

    // MENGGUNAKAN onSnapshot UNTUK REAL-TIME UPDATES
    db.doc("settings/harga_terkini").onSnapshot((doc) => {
        if (doc.exists) {
            const hargaDB = doc.data();

            // --- UPDATE HARGA MENU BERDASARKAN DB SECARA LIVE ---

            // Update Lontong Sayur (ID 1)
            menuList[0].hargaDasar = hargaDB.lontong_jual || 11000;
            menuList[0].opsi.find(o => o.id === 'telur').harga = hargaDB.telur_jual || 3000;
            menuList[0].opsi.find(o => o.id === 'bakwan').harga = hargaDB.bakwan_jual || 1000;
            // Pastikan kerupuk ada di list opsi sebelum update
            const opsiKerupuk1 = menuList[0].opsi.find(o => o.id === 'kerupuk');
            if (opsiKerupuk1) opsiKerupuk1.harga = hargaDB.kerupuk_jual || 1000;

            // Update Lontong Pical (ID 2)
            menuList[1].hargaDasar = hargaDB.lontong_jual || 11000;
            menuList[1].opsi.find(o => o.id === 'telur').harga = hargaDB.telur_jual || 3000;
            menuList[1].opsi.find(o => o.id === 'bakwan').harga = hargaDB.bakwan_jual || 1000;
            const opsiKerupuk2 = menuList[1].opsi.find(o => o.id === 'kerupuk');
            if (opsiKerupuk2) opsiKerupuk2.harga = hargaDB.kerupuk_jual || 1000;

            console.log("Harga diperbarui secara Real-time!");

            // RENDER ULANG TAMPILAN SETELAH DAPAT DATA BARU
            renderMenuHTML();
        }
    }, (error) => {
        console.error("Gagal mengambil update harga:", error);
    });
}

// FUNGSI RENDER HTML
function renderMenuHTML() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = ''; // Clear loading

    menuList.forEach(item => {
        let opsiHTML = '';
        if (item.opsi && item.opsi.length > 0) {
            opsiHTML += '<div class="mt-3 mb-3 bg-white border rounded p-2">';
            opsiHTML += '<p class="small fw-bold text-success mb-2"><i class="bi bi-basket2"></i> Mau tambah topping?</p>';

            item.opsi.forEach((opt, idx) => {
                const hargaStr = opt.harga > 0 ? `+Rp${opt.harga.toLocaleString('id-ID')}` : 'Gratis';
                toppingState[`${item.id}-${idx}`] = 0;

                opsiHTML += `
            <div class="topping-row">
                <div class="d-flex flex-column lh-1">
                    <span class="small fw-semibold text-dark">${opt.nama}</span>
                    <span class="text-muted" style="font-size:0.75rem">${hargaStr}</span>
                </div>
                <div class="topping-qty-control">
                    <button class="btn-topping-qty" onclick="changeToppingQty(${item.id}, ${idx}, -1)">-</button>
                    <span class="display-topping-qty" id="tqty-${item.id}-${idx}">0</span>
                    <button class="btn-topping-qty" onclick="changeToppingQty(${item.id}, ${idx}, 1)">+</button>
                </div>
            </div>`;
            });
            opsiHTML += '</div>';
        }

        const cardHTML = `
    <div class="col-md-6">
        <div class="menu-card d-flex flex-column">
            <div class="position-relative">
                <img src="${item.img}" onerror="this.src='https://via.placeholder.com/600x400?text=Lontong+MM'" class="menu-img w-100" alt="${item.nama}">
                <div class="position-absolute bottom-0 start-0 w-100 p-3" 
                     style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);">
                    <h4 class="text-white fw-bold m-0 text-shadow">${item.nama}</h4>
                </div>
            </div>
            <div class="p-4 flex-grow-1 d-flex flex-column">
                <div class="menu-desc-box">${item.desc}</div>
                ${opsiHTML}
                <div class="mt-auto pt-3 border-top">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <small class="text-muted d-block" style="font-size:0.7rem">Estimasi Total</small>
                            <span class="fs-5 fw-bold text-success" id="price-display-${item.id}">
                                Rp ${item.hargaDasar.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                    <button onclick="addToCart(${item.id})" class="btn-add">
                        <i class="bi bi-plus-lg me-1"></i> Masukkan Keranjang
                    </button>
                </div>
            </div>
        </div>
    </div>`;
        container.innerHTML += cardHTML;
    });
}

// Jalankan saat script dimuat
initMenu();


/* =========================================
   BAGIAN 2: LOGIKA KERANJANG (CART)
   ========================================= */

function changeToppingQty(menuId, optIdx, change) {
    const key = `${menuId}-${optIdx}`;
    let current = toppingState[key] || 0;
    let newVal = current + change;
    if (newVal < 0) newVal = 0;
    if (newVal > 20) newVal = 20;

    toppingState[key] = newVal;
    const el = document.getElementById(`tqty-${menuId}-${optIdx}`);
    if (el) el.innerText = newVal;
    updatePriceDisplay(menuId);
}

function updatePriceDisplay(menuId) {
    const menu = menuList.find(m => m.id === menuId);
    let total = menu.hargaDasar;
    menu.opsi.forEach((opt, idx) => {
        const qty = toppingState[`${menuId}-${idx}`];
        total += (opt.harga * qty);
    });
    const el = document.getElementById(`price-display-${menuId}`);
    if (el) el.innerText = 'Rp ' + total.toLocaleString('id-ID');
}

function addToCart(menuId) {
    const menu = menuList.find(m => m.id === menuId);
    let selectedToppings = [];
    let totalToppingPrice = 0;

    menu.opsi.forEach((opt, idx) => {
        const qty = toppingState[`${menuId}-${idx}`];
        if (qty > 0) {
            selectedToppings.push({
                nama: opt.nama,
                qty: qty,
                hargaSatuan: opt.harga,
                total: qty * opt.harga
            });
            totalToppingPrice += (qty * opt.harga);
        }
    });

    let toppingKey = selectedToppings.map(t => `${t.nama}:${t.qty}`).sort().join('-');
    const uniqueKey = `${menu.id}-${toppingKey}`;
    const hargaPerItem = menu.hargaDasar + totalToppingPrice;

    const existingItem = cart.find(item => item.uniqueKey === uniqueKey);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            uniqueKey: uniqueKey,
            menuId: menu.id,
            nama: menu.nama,
            hargaDasar: menu.hargaDasar,
            toppings: selectedToppings,
            hargaPerItem: hargaPerItem,
            qty: 1
        });
    }

    updateFloatingCartButton();
    resetToppingInputs(menuId);

    const toastEl = document.getElementById('liveToast');
    document.getElementById('toastMessage').innerText = `${menu.nama} berhasil ditambahkan!`;
    if (typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    } else {
        alert(`${menu.nama} berhasil ditambahkan!`);
    }
}

function resetToppingInputs(menuId) {
    const menu = menuList.find(m => m.id === menuId);
    menu.opsi.forEach((opt, idx) => {
        toppingState[`${menuId}-${idx}`] = 0;
        const el = document.getElementById(`tqty-${menuId}-${idx}`);
        if (el) el.innerText = "0";
    });
    updatePriceDisplay(menuId);
}

function updateFloatingCartButton() {
    const cartBar = document.getElementById('floatingCart');
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    let grandTotal = cart.reduce((sum, item) => sum + (item.hargaPerItem * item.qty), 0);

    if (cart.length > 0) {
        cartBar.style.display = 'flex';
        document.getElementById('cartCount').innerText = totalQty;
        document.getElementById('cartTotal').innerText = 'Rp ' + grandTotal.toLocaleString('id-ID');
    } else {
        cartBar.style.display = 'none';
    }
}

function renderCartListHTML() {
    const listContainer = document.getElementById('cartItemsContainer');
    const formContainer = document.getElementById('checkoutForm');
    const grandTotalEl = document.getElementById('modalGrandTotal');

    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        formContainer.style.display = 'none';
        // Tutup modal jika kosong (opsional)
        const el = document.getElementById('cartModal');
        if (typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(el);
            if (modal) modal.hide();
        }
        return;
    }

    formContainer.style.display = 'block';

    cart.forEach((item, idx) => {
        let toppingHTML = '';
        if (item.toppings.length > 0) {
            // Format topping agar rapi
            const tText = item.toppings.map(t => `${t.nama} x${t.qty}`).join(', ');
            toppingHTML = `<div class="text-muted small fst-italic mt-1" style="font-size: 0.75rem; line-height: 1.3;">+ ${tText}</div>`;
        } else {
            toppingHTML = `<div class="text-muted small mt-1" style="font-size: 0.75rem;">Tanpa Topping</div>`;
        }

        const subtotal = item.hargaPerItem * item.qty;
        grandTotal += subtotal;

        // STRUKTUR HTML BARU (LEBIH STABIL DI MOBILE)
        listContainer.innerHTML += `
        <div class="py-3 border-bottom">
            <div class="cart-item-header">
                <div class="cart-item-title">
                    <h6 class="fw-bold m-0 text-dark">${item.nama}</h6>
                    ${toppingHTML}
                </div>
                <div class="cart-item-price text-success">
                    Rp ${subtotal.toLocaleString('id-ID')}
                </div>
            </div>

            <div class="cart-item-details">
                <small class="text-secondary fw-bold">@ Rp ${item.hargaPerItem.toLocaleString('id-ID')}</small>
                
                <div class="qty-control shadow-sm">
                    <button class="qty-btn" onclick="changeCartQty(${idx}, -1)">-</button>
                    <div class="qty-display">${item.qty}</div>
                    <button class="qty-btn" onclick="changeCartQty(${idx}, 1)">+</button>
                </div>
            </div>
        </div>`;
    });

    grandTotalEl.innerText = 'Rp ' + grandTotal.toLocaleString('id-ID');
}

function showCartModal() {
    if (cart.length === 0) return;
    renderCartListHTML();
    if (typeof bootstrap !== 'undefined') {
        const myModal = new bootstrap.Modal(document.getElementById('cartModal'));
        myModal.show();
    }
}

function changeCartQty(idx, change) {
    if (cart[idx].qty + change > 0) {
        cart[idx].qty += change;
    } else {
        if (confirm("Hapus menu ini dari keranjang?")) {
            cart.splice(idx, 1);
        }
    }
    updateFloatingCartButton();
    renderCartListHTML();
}

function toggleAddress(isDelivery) {
    const section = document.getElementById('addressSection');
    section.style.display = isDelivery ? 'block' : 'none';
}

function togglePayment(isQRIS) {
    const qrisSec = document.getElementById('qrisSection');
    qrisSec.style.display = isQRIS ? 'block' : 'none';

    // Auto scroll ke QRIS biar kelihatan jika di HP
    if (isQRIS) {
        qrisSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function getGeoLocation() {
    const btn = document.getElementById('btnGetLoc');
    const status = document.getElementById('locStatus');
    const hiddenInput = document.getElementById('mapsLink');

    if (!navigator.geolocation) {
        status.style.display = 'block';
        status.innerHTML = "<span class='text-danger'>Browser tidak support GPS.</span>";
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mencari Koordinat...';
    status.style.display = 'none';

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const long = pos.coords.longitude;
            const link = `https://www.google.com/maps?q=${lat},${long}`;
            hiddenInput.value = link;

            status.style.display = 'block';
            status.className = "alert alert-success p-2 text-center small mt-2 mb-0";
            status.innerHTML = `<div class="d-flex align-items-center justify-content-center gap-2"><i class="bi bi-check-circle-fill"></i> <strong>Lokasi Berhasil Dilampirkan!</strong></div>`;

            btn.disabled = false;
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-success');
            btn.innerHTML = '<i class="bi bi-geo-alt"></i> Update Lokasi Saya';
        },
        (err) => {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-geo-alt-fill me-1"></i> Coba Lagi';
            status.style.display = 'block';
            status.className = "alert alert-danger p-2 text-center small mt-2 mb-0";
            status.innerHTML = "❌ Gagal mendeteksi lokasi. Pastikan GPS aktif.";
        }
    );
}

function processCheckout() {
    if (cart.length === 0) return;

    const name = document.getElementById('custName').value.trim();
    if (!name) {
        alert("Mohon isi 'Nama Pemesan' terlebih dahulu.");
        document.getElementById('custName').focus();
        return;
    }

    const note = document.getElementById('custNote').value.trim();

    // --- AMBIL DATA PENGIRIMAN & PEMBAYARAN ---
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;

    const address = document.getElementById('custAddress').value.trim();
    const maps = document.getElementById('mapsLink').value;

    if (deliveryType === 'delivery') {
        if (!address) {
            alert("Mohon isi 'Alamat Lengkap' agar pesanan bisa diantar.");
            document.getElementById('custAddress').focus();
            return;
        }
    }

    let message = `Halo Admin Lontong MM, saya *${name}* mau pesan:\n\n`;
    let grandTotal = 0;

    cart.forEach((item, index) => {
        let subtotal = item.hargaPerItem * item.qty;
        grandTotal += subtotal;

        let toppingStr = "";
        if (item.toppings.length > 0) {
            toppingStr = "\n   Topping: " + item.toppings.map(t => `${t.nama} (${t.qty}x)`).join(', ');
        }

        message += `${index + 1}. *${item.nama} (${item.qty} porsi)*${toppingStr}\n   Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n\n`;
    });

    if (note) {
        message += `--------------------------------\n`;
        message += `*CATATAN KHUSUS:*\n${note}\n`;
    }

    message += `--------------------------------\n`;
    message += `*TOTAL BELANJA: Rp ${grandTotal.toLocaleString('id-ID')}*\n`;

    // --- FORMAT PESAN BARU (Metode Pengiriman & Pembayaran) ---

    // 1. Pengiriman
    if (deliveryType === 'pickup') {
        message += `Metode: *AMBIL SENDIRI (PICKUP)*\n`;
    } else {
        message += `Metode: *DELIVERY (ANTAR)*\n`;
        if (address) message += `Alamat: ${address}\n`;
        if (maps) message += `Maps: ${maps}\n`;
    }

    // 2. Pembayaran (Bagian Baru)
    if (paymentType === 'qris') {
        message += `Pembayaran: *QRIS / TRANSFER* (Bukti Terlampir)\n`;
    } else {
        message += `Pembayaran: *TUNAI (COD)*\n`;
    }

    message += `--------------------------------\nMohon diproses ya kak. Terima kasih!`;

    const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}


/* =========================================
   BAGIAN 3: LAZY LOAD TESTIMONI
   ========================================= */

const testimonySection = document.querySelector('.slider-area');
const swiperWrapper = document.getElementById('swiperWrapper');

if (testimonySection && swiperWrapper) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadTestimonials(); // Panggil fungsi fetch data
            observer.disconnect();
        }
    }, { rootMargin: "200px" });

    observer.observe(testimonySection);
}

function loadTestimonials() {
    swiperWrapper.innerHTML = '<div class="swiper-slide text-center text-muted pt-4"><div class="spinner-border text-success me-2" role="status"></div>Sedang memuat testimoni...</div>';

    // Langsung pakai 'db' karena Firebase sudah di-init di atas
    db.collection("testimonies").orderBy("tanggal", "desc").limit(15).get().then((querySnapshot) => {
        let rawData = [];
        querySnapshot.forEach((doc) => {
            rawData.push(doc.data());
        });

        if (rawData.length === 0) {
            swiperWrapper.innerHTML = '<div class="text-center w-100 p-5">Belum ada testimoni.</div>';
            return;
        }

        let htmlContent = '';
        rawData.forEach(data => {
            htmlContent += `<div class="swiper-slide">${createCardHTML(data)}</div>`;
        });

        swiperWrapper.innerHTML = htmlContent;

        // Init Swiper
        new Swiper(".mySwiper", {
            loop: true,
            spaceBetween: 20,
            centeredSlides: false,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                0: { slidesPerView: 1, spaceBetween: 10 },
                768: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 30 }
            }
        });

    }).catch((error) => {
        console.error("Gagal memuat testimoni:", error);
        swiperWrapper.innerHTML = '<div class="text-center w-100 text-danger p-5">Gagal memuat data testimoni.</div>';
    });
}

function createCardHTML(data) {
    let starsHTML = '';
    for (let i = 0; i < Math.floor(data.rating); i++) starsHTML += '<i class="bi bi-star-fill"></i>';
    if (data.rating % 1 !== 0) starsHTML += '<i class="bi bi-star-half"></i>';

    let avatarHTML = '';
    if (data.fotoURL && data.fotoURL.length > 20) {
        avatarHTML = `<img src="${data.fotoURL}" alt="${data.nama}" class="avatar-img">`;
    } else {
        const inisial = (data.nama || "User").match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase().substring(0, 2);
        avatarHTML = `<div class="avatar-circle">${inisial}</div>`;
    }

    return `
    <div class="testi-card">
        <div class="quote-icon">”</div>
        <div class="d-flex align-items-center gap-3 mb-3">
            ${avatarHTML}
            <div>
                <div class="fw-bold text-capitalize">${data.nama || "Pelanggan"}</div>
                <small class="text-muted text-capitalize" style="font-size: 0.75rem">${data.status || "Pecinta Kuliner"}</small>
            </div>
        </div>
        <div class="star-rating">${starsHTML}</div>
        <p class="text-secondary small mb-0">"${data.pesan}"</p>
    </div>
    `;
}