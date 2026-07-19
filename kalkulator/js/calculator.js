// =============================================
// CALCULATOR ENGINE
// =============================================

// Elemen DOM
const layar = document.getElementById('layar');
const proses = document.getElementById('proses');
let infoProses = '';

/**
 * Input nilai ke layar kalkulator
 * @param {string} nilai - Angka atau operator
 */
function inputTombol(nilai) {
    const lastChar = layar.innerText.slice(-1);
    const operators = ['+', '-', '*', '/'];

    if (layar.innerText === '0' && !isNaN(nilai) && nilai !== '.') {
        layar.innerText = nilai;
    } else if (operators.includes(lastChar) && operators.includes(nilai)) {
        return; // Mencegah operator ganda
    } else {
        layar.innerText += nilai;
    }
    infoProses += nilai;
    proses.innerText = infoProses;
}

/**
 * Hapus semua input
 */
function hapusSemua() {
    layar.innerText = '0';
    proses.innerText = '';
    infoProses = '';
}

/**
 * Hapus satu karakter terakhir
 */
function hapusSatu() {
    if (layar.innerText.length > 1) {
        layar.innerText = layar.innerText.slice(0, -1);
        infoProses = infoProses.slice(0, -1);
        proses.innerText = infoProses;
    } else {
        layar.innerText = '0';
        proses.innerText = '';
        infoProses = '';
    }
}

/**
 * Fungsi hitung (hanya menampilkan modal - tidak menghitung)
 * Diganti dengan modal paket sebagai monetisasi
 */
function hitungJawaban() {
    if (infoProses.trim() !== '') {
        bukaModalPaket(); // Fungsi dari modal.js
    }
}