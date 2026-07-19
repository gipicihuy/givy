// =============================================
// MODAL MANAGEMENT
// =============================================

// Data paket terpilih
let paketTerpilih = {
    nama: 'Paket Populer',
    harga: 30000
};

/**
 * Buka modal pilihan paket
 */
function bukaModalPaket() {
    document.getElementById('modalPaket').classList.add('on');
}

/**
 * Buka modal konfirmasi
 */
function bukaModalKonfirmasi() {
    tutupModal('modalPaket');
    document.getElementById('modalKonfirmasi').classList.add('on');
    
    // Update data konfirmasi
    document.getElementById('confirm-paket').textContent = paketTerpilih.nama;
    document.getElementById('confirm-harga').textContent = 'Rp ' + paketTerpilih.harga.toLocaleString();
}

/**
 * Buka modal informasi (miskin)
 */
function bukaModalMiskin() {
    tutupModal('modalPaket');
    document.getElementById('modalMiskin').classList.add('on');
}

/**
 * Buka modal keluar
 */
function bukaModalKeluar() {
    tutupModal('modalMiskin');
    document.getElementById('modalKeluar').classList.add('on');
}

/**
 * Tutup modal berdasarkan ID
 * @param {string} id - ID elemen modal
 */
function tutupModal(id) {
    document.getElementById(id).classList.remove('on');
}

/**
 * Pilih paket langganan
 * @param {HTMLElement} el - Elemen yang diklik
 * @param {string} nama - Nama paket
 * @param {number} harga - Harga paket
 */
function pilihPaket(el, nama, harga) {
    document.querySelectorAll('.paket-item').forEach(item => {
        item.classList.remove('active');
    });
    el.classList.add('active');
    paketTerpilih = { nama: nama, harga: harga };
}

/**
 * Kirim pesanan via WhatsApp
 */
function kirimPesanWA() {
    const nomor = '6285196287445';
    const pesan = `Halo Admin,%0A%0ASaya ingin melakukan pemesanan paket *${paketTerpilih.nama}* dengan harga *Rp ${paketTerpilih.harga.toLocaleString()}*.%0A%0ABerikut detail pemesanan saya:%0A📦 Paket: ${paketTerpilih.nama}%0A💰 Harga: Rp ${paketTerpilih.harga.toLocaleString()}%0A%0AMohon informasi lebih lanjut mengenai proses pembayaran dan aktivasi. Terima kasih.`;
    const url = `https://wa.me/${nomor}?text=${pesan}`;
    
    // Tutup semua modal
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('on'));
    
    // Buka WhatsApp di tab baru
    window.open(url, '_blank');
}