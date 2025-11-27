const NOMOR_WA = "6289638931396";
let cart = [];
let toppingState = {};

// --- DATA MENU ---
const menuList = [
    {
        id: 1,
        nama: "Lontong Sayur",
        desc: "Sarapan ala 'Urang Awak'! Lontong lembut disiram kuah gulai nangka yang kental.",
        hargaDasar: 11000,
        img: "ltsyr.webp",
        opsi: [
            { nama: "Telur Rebus", harga: 3000 },
            { nama: "Bakwan Goreng", harga: 1000 },
            { nama: "Kerupuk Tambahan", harga: 1000 }
        ]
    },
    {
        id: 2,
        nama: "Lontong Pical",
        desc: "Khas Minang! Lontong, mie kuning, sayuran disiram bumbu kacang pedas gurih.",
        hargaDasar: 11000,
        img: "ltpcl.webp",
        opsi: [
            { nama: "Telur Rebus", harga: 3000 },
            { nama: "Bakwan Goreng", harga: 1000 },
            { nama: "Kerupuk Tambahan", harga: 1000 }
        ]
    }
];

// 1. RENDER MENU UTAMA
const container = document.getElementById('menuContainer');

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

// 2. FUNGSI UBAH QTY TOPPING
function changeToppingQty(menuId, optIdx, change) {
    const key = `${menuId}-${optIdx}`;
    let current = toppingState[key] || 0;
    let newVal = current + change;
    if (newVal < 0) newVal = 0;
    if (newVal > 20) newVal = 20;

    toppingState[key] = newVal;
    document.getElementById(`tqty-${menuId}-${optIdx}`).innerText = newVal;
    updatePriceDisplay(menuId);
}

// 3. UPDATE TAMPILAN HARGA MENU
function updatePriceDisplay(menuId) {
    const menu = menuList.find(m => m.id === menuId);
    let total = menu.hargaDasar;
    menu.opsi.forEach((opt, idx) => {
        const qty = toppingState[`${menuId}-${idx}`];
        total += (opt.harga * qty);
    });
    document.getElementById(`price-display-${menuId}`).innerText = 'Rp ' + total.toLocaleString('id-ID');
}

// 4. TAMBAH KE KERANJANG
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
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function resetToppingInputs(menuId) {
    const menu = menuList.find(m => m.id === menuId);
    menu.opsi.forEach((opt, idx) => {
        toppingState[`${menuId}-${idx}`] = 0;
        document.getElementById(`tqty-${menuId}-${idx}`).innerText = "0";
    });
    updatePriceDisplay(menuId);
}

// 5. UPDATE TOMBOL FLOATING
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

// 6. RENDER LIST CART
function renderCartListHTML() {
    const listContainer = document.getElementById('cartItemsContainer');
    const formContainer = document.getElementById('checkoutForm');
    const grandTotalEl = document.getElementById('modalGrandTotal');

    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        formContainer.style.display = 'none';
        const el = document.getElementById('cartModal');
        const modal = bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();
        return;
    }

    formContainer.style.display = 'block';

    cart.forEach((item, idx) => {
        let toppingHTML = '';
        if (item.toppings.length > 0) {
            const tText = item.toppings.map(t => `${t.nama} x${t.qty}`).join(', ');
            toppingHTML = `<small class="text-muted d-block fst-italic" style="font-size: 0.75rem">+ ${tText}</small>`;
        } else {
            toppingHTML = `<small class="text-muted d-block" style="font-size: 0.75rem">Tanpa Topping</small>`;
        }

        const subtotal = item.hargaPerItem * item.qty;
        grandTotal += subtotal;

        listContainer.innerHTML += `
        <div class="py-3 border-bottom">
            <div class="d-flex justify-content-between mb-2">
                <div>
                    <h6 class="fw-bold m-0">${item.nama}</h6>
                    ${toppingHTML}
                </div>
                <div class="fw-bold">Rp ${subtotal.toLocaleString('id-ID')}</div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-secondary">@ Rp ${item.hargaPerItem.toLocaleString('id-ID')}</small>
                <div class="qty-control">
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
    const myModal = new bootstrap.Modal(document.getElementById('cartModal'));
    myModal.show();
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
    const type = document.querySelector('input[name="deliveryType"]:checked').value;
    const address = document.getElementById('custAddress').value.trim();
    const maps = document.getElementById('mapsLink').value;

    if (type === 'delivery') {
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

    if (type === 'pickup') {
        message += `Metode: *AMBIL SENDIRI (PICKUP)*\n`;
    } else {
        message += `Metode: *DELIVERY (ANTAR)*\n`;
        if (address) message += `Alamat: ${address}\n`;
        if (maps) message += `Maps: ${maps}\n`;
    }

    message += `--------------------------------\nMohon diproses ya kak. Terima kasih!`;

    const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCamv42dxGHJEqXMqVIPcOeWGNdM5p7X2E",
    authDomain: "lontong-mm.firebaseapp.com",
    projectId: "lontong-mm",
    storageBucket: "lontong-mm.firebasestorage.app",
    messagingSenderId: "628261457290",
    appId: "1:628261457290:web:8cbd5262f3cc3deb30cc73",
    measurementId: "G-GBN3GE3QKN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- LOAD TESTIMONI DENGAN SWIPER JS ---
const swiperWrapper = document.getElementById('swiperWrapper');

db.collection("testimonies").orderBy("tanggal", "desc").limit(15).get().then((querySnapshot) => {
    let rawData = [];

    querySnapshot.forEach((doc) => {
        rawData.push(doc.data());
    });

    if (rawData.length === 0) {
        swiperWrapper.innerHTML = '<div class="text-center w-100 p-5">Belum ada testimoni.</div>';
        return;
    }

    // Render HTML ke dalam wrapper
    let htmlContent = '';
    rawData.forEach(data => {
        htmlContent += `<div class="swiper-slide">${createCardHTML(data)}</div>`;
    });

    swiperWrapper.innerHTML = htmlContent;

    // --- INISIALISASI SWIPER ---
    new Swiper(".mySwiper", {
        loop: true,               // Agar slider berputar terus
        spaceBetween: 20,         // Jarak antar slide
        centeredSlides: false,    // Posisi slide

        // Konfigurasi Autoplay
        autoplay: {
            delay: 2500,          // Kecepatan geser (2.5 detik)
            disableOnInteraction: false, // Lanjut autoplay meski habis digeser user
        },

        // Konfigurasi Titik Navigasi
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },

        // Responsif: Jumlah slide yang muncul per layar
        breakpoints: {
            0: {
                slidesPerView: 1, // HP: 1 kartu
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2, // Tablet: 2 kartu
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3, // Laptop: 3 kartu
                spaceBetween: 30,
            }
        }
    });

}).catch((error) => {
    console.error("Gagal memuat testimoni:", error);
    swiperWrapper.innerHTML = '<div class="text-center w-100 text-danger p-5">Gagal memuat data.</div>';
});

// Fungsi Helper Membuat HTML Card
function createCardHTML(data) {
    let starsHTML = '';
    for (let i = 0; i < Math.floor(data.rating); i++) starsHTML += '<i class="bi bi-star-fill"></i>';
    if (data.rating % 1 !== 0) starsHTML += '<i class="bi bi-star-half"></i>';

    let avatarHTML = '';
    if (data.fotoURL && data.fotoURL.length > 20) {
        avatarHTML = `<img src="${data.fotoURL}" alt="${data.nama}" class="avatar-img">`;
    } else {
        const inisial = data.nama.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase().substring(0, 2);
        avatarHTML = `<div class="avatar-circle">${inisial}</div>`;
    }

    return `
    <div class="testi-card">
        <div class="quote-icon">”</div>
        <div class="d-flex align-items-center gap-3 mb-3">
            ${avatarHTML}
            <div>
                <div class="fw-bold text-capitalize">${data.nama}</div>
                <small class="text-muted text-capitalize" style="font-size: 0.75rem">${data.status}</small>
            </div>
        </div>
        <div class="star-rating">${starsHTML}</div>
        <p class="text-secondary small mb-0">"${data.pesan}"</p>
    </div>
    `;
}