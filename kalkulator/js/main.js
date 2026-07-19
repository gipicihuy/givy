// =============================================
// MAIN INITIALIZATION
// =============================================

/**
 * Inisialisasi aplikasi saat DOM siap
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set default paket aktif
    const defaultPaket = document.querySelector('.paket-item.active');
    if (defaultPaket) {
        // Parse nama paket (hilangkan badge "Best" jika ada)
        let nama = defaultPaket.querySelector('.paket-name')?.innerText || 'Paket Populer';
        nama = nama.replace(' Best', '').trim();
        
        // Parse harga
        const hargaText = defaultPaket.querySelector('.paket-price')?.innerText || 'Rp 30.000';
        const harga = parseInt(hargaText.replace(/[^0-9]/g, '')) || 30000;
        
        // Update data paket terpilih
        paketTerpilih = { nama: nama, harga: harga };
    }
    
    console.log('🚀 Kalkulator Pro siap digunakan!');
    console.log('📦 Paket default:', paketTerpilih);
});

// Ekspos fungsi ke global untuk inline onclick handler
window.inputTombol = inputTombol;
window.hapusSemua = hapusSemua;
window.hapusSatu = hapusSatu;
window.hitungJawaban = hitungJawaban;
window.bukaModalPaket = bukaModalPaket;
window.bukaModalKonfirmasi = bukaModalKonfirmasi;
window.bukaModalMiskin = bukaModalMiskin;
window.bukaModalKeluar = bukaModalKeluar;
window.tutupModal = tutupModal;
window.pilihPaket = pilihPaket;
window.kirimPesanWA = kirimPesanWA;