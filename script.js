// ============================================
// KONSTANTA DAN VARIABEL GLOBAL
// ============================================
const STORAGE_KEY = 'studentRegistrations';
const COURSES_LIST = [
    { id: 'matkul1', name: 'Algoritma dan Pemrograman', credits: 3 },
    { id: 'matkul2', name: 'Struktur Data', credits: 3 },
    { id: 'matkul3', name: 'Basis Data', credits: 3 },
    { id: 'matkul4', name: 'Pemrograman Web', credits: 3 },
    { id: 'matkul5', name: 'Jaringan Komputer', credits: 3 },
    { id: 'matkul6', name: 'Sistem Operasi', credits: 3 },
    { id: 'matkul7', name: 'Kalkulus', credits: 4 },
    { id: 'matkul8', name: 'Matematika Diskrit', credits: 3 },
    { id: 'matkul9', name: 'Statistika', credits: 3 },
    { id: 'matkul10', name: 'Bahasa Inggris', credits: 2 }
];

// Referensi elemen DOM
const studentForm = document.getElementById('studentForm');
const resultCard = document.getElementById('result-card');
const registrationForm = document.getElementById('registration-form');
const historyPanel = document.getElementById('history-panel');
const resetBtn = document.getElementById('resetBtn');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const newRegistrationBtn = document.getElementById('newRegistrationBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const coursesContainer = document.getElementById('coursesContainer');
const totalRegistrationsEl = document.getElementById('totalRegistrations');
const popularProgramEl = document.getElementById('popularProgram');
const totalSavedEl = document.getElementById('total-saved');
const historyList = document.getElementById('historyList');

// Data registrasi
let registrations = [];

// ============================================
// FUNGSI INISIALISASI
// ============================================

/**
 * Inisialisasi aplikasi saat halaman dimuat
 */
function initApp() {
    // Generate checkbox mata kuliah
    generateCoursesCheckboxes();
    
    // Muat data dari localStorage
    loadRegistrations();
    
    // Update UI dengan data yang dimuat
    updateHistoryStats();
    updateFooterStats();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Aplikasi Pendaftaran Mahasiswa Baru v2.0 telah diinisialisasi');
}

/**
 * Generate checkbox untuk mata kuliah
 */
function generateCoursesCheckboxes() {
    coursesContainer.innerHTML = '';
    
    COURSES_LIST.forEach(course => {
        const checkboxId = `course-${course.id}`;
        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox-option';
        checkbox.innerHTML = `
            <input type="checkbox" id="${checkboxId}" name="courses" value="${course.name}">
            <label for="${checkboxId}">${course.name} (${course.credits} SKS)</label>
        `;
        coursesContainer.appendChild(checkbox);
        
        // Tambahkan event listener untuk styling
        const checkboxInput = checkbox.querySelector('input');
        checkboxInput.addEventListener('change', function() {
            if (this.checked) {
                checkbox.classList.add('selected');
            } else {
                checkbox.classList.remove('selected');
            }
            
            // Hapus error jika ada
            clearError(document.getElementById('coursesError'));
        });
    });
}

/**
 * Setup semua event listeners
 */
function setupEventListeners() {
    // Form submission
    studentForm.addEventListener('submit', handleFormSubmit);
    
    // Tombol-tombol
    resetBtn.addEventListener('click', handleResetForm);
    showHistoryBtn.addEventListener('click', showHistoryPanel);
    closeHistoryBtn.addEventListener('click', hideHistoryPanel);
    newRegistrationBtn.addEventListener('click', showRegistrationForm);
    viewHistoryBtn.addEventListener('click', showHistoryPanel);
    clearHistoryBtn.addEventListener('click', handleClearHistory);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Validasi real-time
    setupRealTimeValidation();
    
    // Klik di luar history panel untuk menutup
    document.addEventListener('click', function(e) {
        if (historyPanel.style.display === 'block' && 
            !historyPanel.contains(e.target) && 
            e.target.id !== 'showHistoryBtn' && 
            e.target.id !== 'viewHistoryBtn') {
            hideHistoryPanel();
        }
    });
}

/**
 * Setup validasi real-time untuk form
 */
function setupRealTimeValidation() {
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        // Hapus error saat user mulai mengetik
        input.addEventListener('input', function() {
            if (this.type !== 'checkbox' && this.type !== 'radio') {
                clearError(this);
            }
        });
        
        // Validasi saat user keluar dari input field (blur)
        if (input.type !== 'checkbox' && input.type !== 'radio') {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        }
    });
}

// ============================================
// FUNGSI VALIDASI
// ============================================

/**
 * Validasi satu field berdasarkan jenisnya
 * @param {HTMLElement} field - Elemen input yang akan divalidasi
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    
    switch (fieldId) {
        case 'fullName':
            if (!value) {
                showError(field, 'Nama lengkap wajib diisi');
            } else if (value.length < 3) {
                showError(field, 'Nama terlalu pendek, minimal 3 karakter');
            } else {
                markAsValid(field);
            }
            break;
            
        case 'nim':
            const nimValidation = validateNIM(value);
            if (!nimValidation.isValid) {
                showError(field, nimValidation.message);
            } else {
                markAsValid(field);
            }
            break;
            
        case 'birthDate':
            if (!value) {
                showError(field, 'Tanggal lahir wajib diisi');
            } else {
                // Cek apakah tanggal lahir valid (tidak di masa depan)
                const birthDate = new Date(value);
                const today = new Date();
                if (birthDate > today) {
                    showError(field, 'Tanggal lahir tidak valid');
                } else {
                    markAsValid(field);
                }
            }
            break;
            
        case 'birthPlace':
            if (!value) {
                showError(field, 'Tempat lahir wajib diisi');
            } else {
                markAsValid(field);
            }
            break;
            
        case 'email':
            const emailValidation = validateEmail(value);
            if (!emailValidation.isValid) {
                showError(field, emailValidation.message);
            } else {
                markAsValid(field);
            }
            break;
            
        case 'phone':
            const phoneValidation = validatePhone(value);
            if (!phoneValidation.isValid) {
                showError(field, phoneValidation.message);
            } else {
                markAsValid(field);
            }
            break;
            
        case 'studyProgram':
        case 'semester':
            if (!value) {
                showError(field, 'Field ini wajib dipilih');
            } else {
                markAsValid(field);
            }
            break;
            
        case 'address':
            if (!value) {
                showError(field, 'Alamat lengkap wajib diisi');
            } else if (value.length < 10) {
                showError(field, 'Alamat terlalu pendek, minimal 10 karakter');
            } else {
                markAsValid(field);
            }
            break;
    }
}

/**
 * Validasi NIM: harus angka, 8-12 digit
 */
function validateNIM(nim) {
    if (!nim.trim()) {
        return { isValid: false, message: 'NIM wajib diisi' };
    }
    
    if (!/^\d+$/.test(nim)) {
        return { isValid: false, message: 'NIM harus berupa angka' };
    }
    
    if (nim.length < 8 || nim.length > 12) {
        return { isValid: false, message: 'NIM harus 8-12 digit' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validasi Email: menggunakan regex sederhana
 */
function validateEmail(email) {
    if (!email.trim()) {
        return { isValid: false, message: 'Email wajib diisi' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Format email tidak valid' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validasi Nomor Telepon: harus angka, minimal 10 digit
 */
function validatePhone(phone) {
    if (!phone.trim()) {
        return { isValid: false, message: 'Nomor telepon wajib diisi' };
    }
    
    const cleanedPhone = phone.replace(/\D/g, '');
    
    if (!/^\d+$/.test(cleanedPhone)) {
        return { isValid: false, message: 'Nomor telepon harus berupa angka' };
    }
    
    if (cleanedPhone.length < 10) {
        return { isValid: false, message: 'Nomor telepon minimal 10 digit' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validasi mata kuliah: minimal 3 harus dipilih
 */
function validateCourses() {
    const selectedCourses = getSelectedCourses();
    
    if (selectedCourses.length < 3) {
        const coursesError = document.getElementById('coursesError');
        coursesError.textContent = `Minimal pilih 3 mata kuliah (terpilih: ${selectedCourses.length})`;
        return false;
    }
    
    // Hapus error jika valid
    const coursesError = document.getElementById('coursesError');
    coursesError.textContent = '';
    return true;
}

/**
 * Ambil daftar mata kuliah yang dipilih
 */
function getSelectedCourses() {
    const checkboxes = document.querySelectorAll('input[name="courses"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Validasi semua field form
 */
function validateForm() {
    let isValid = true;
    
    // Validasi semua field input
    const formInputs = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
    formInputs.forEach(input => {
        validateField(input);
        if (input.classList.contains('error')) {
            isValid = false;
        }
    });
    
    // Validasi radio button (jenis kelamin)
    const genderSelected = document.querySelector('input[name="gender"]:checked');
    if (!genderSelected) {
        const genderError = document.getElementById('genderError');
        genderError.textContent = 'Jenis kelamin wajib dipilih';
        isValid = false;
    } else {
        const genderError = document.getElementById('genderError');
        genderError.textContent = '';
    }
    
    // Validasi checkbox (mata kuliah)
    if (!validateCourses()) {
        isValid = false;
    }
    
    return isValid;
}

// ============================================
// FUNGSI UI HELPER
// ============================================

/**
 * Tampilkan error pada input field
 */
function showError(element, message) {
    element.classList.remove('valid');
    element.classList.add('error');
    
    const errorElement = document.getElementById(`${element.id}Error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Hapus error dari input field
 */
function clearError(element) {
    element.classList.remove('error', 'valid');
    
    const errorElement = document.getElementById(`${element.id}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Tandai input sebagai valid
 */
function markAsValid(element) {
    element.classList.remove('error');
    element.classList.add('valid');
    
    const errorElement = document.getElementById(`${element.id}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Hapus semua error dari form
 */
function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.textContent = '');
    
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(el => {
        el.classList.remove('error', 'valid');
    });
    
    // Reset styling checkbox
    const checkboxOptions = document.querySelectorAll('.checkbox-option');
    checkboxOptions.forEach(option => option.classList.remove('selected'));
}

// ============================================
// FUNGSI LOCALSTORAGE
// ============================================

/**
 * Muat data registrasi dari localStorage
 */
function loadRegistrations() {
    try {
        const dataString = localStorage.getItem(STORAGE_KEY);
        if (dataString) {
            registrations = JSON.parse(dataString);
            console.log(`Data registrasi dimuat: ${registrations.length} entri`);
        } else {
            registrations = [];
            console.log('Tidak ada data registrasi di localStorage');
        }
    } catch (error) {
        console.error('Gagal memuat data dari localStorage:', error);
        registrations = [];
    }
}

/**
 * Simpan data registrasi ke localStorage
 */
function saveRegistrations() {
    try {
        const dataString = JSON.stringify(registrations);
        localStorage.setItem(STORAGE_KEY, dataString);
        console.log(`Data registrasi disimpan: ${registrations.length} entri`);
        return true;
    } catch (error) {
        console.error('Gagal menyimpan data ke localStorage:', error);
        return false;
    }
}

/**
 * Tambah data registrasi baru
 */
function addRegistration(data) {
    // Generate ID unik dan timestamp
    const newRegistration = {
        ...data,
        id: generateRegistrationId(),
        registrationDate: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Tambah ke array registrations
    registrations.unshift(newRegistration);
    
    // Simpan ke localStorage
    const saved = saveRegistrations();
    
    if (saved) {
        // Update UI
        updateHistoryStats();
        updateFooterStats();
        return newRegistration;
    }
    
    return null;
}

/**
 * Hapus semua data registrasi
 */
function clearAllRegistrations() {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat pendaftaran?')) {
        registrations = [];
        localStorage.removeItem(STORAGE_KEY);
        
        // Update UI
        updateHistoryStats();
        updateFooterStats();
        renderHistoryList();
        
        console.log('Semua data registrasi telah dihapus');
        return true;
    }
    
    return false;
}

/**
 * Generate ID registrasi unik
 */
function generateRegistrationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `REG-${timestamp}-${random}`.toUpperCase();
}

// ============================================
// FUNGSI UI UTAMA
// ============================================

/**
 * Tampilkan kartu hasil dengan data registrasi
 */
function showResultCard(registrationData) {
    // Isi data ke elemen-elemen pada kartu hasil
    document.getElementById('result-name').textContent = registrationData.fullName;
    document.getElementById('result-nim').textContent = registrationData.nim;
    document.getElementById('result-birth').textContent = `${registrationData.birthPlace}, ${formatDate(registrationData.birthDate)}`;
    document.getElementById('result-email').textContent = registrationData.email;
    document.getElementById('result-phone').textContent = registrationData.phone;
    document.getElementById('result-program').textContent = registrationData.studyProgram;
    document.getElementById('result-semester').textContent = `Semester ${registrationData.semester}`;
    document.getElementById('result-gender').textContent = registrationData.gender;
    document.getElementById('result-courses').textContent = registrationData.courses.join(', ');
    document.getElementById('result-address').textContent = registrationData.address;
    document.getElementById('result-motivation').textContent = registrationData.motivation || '-';
    document.getElementById('registration-id').textContent = registrationData.id;
    
    // Tampilkan atau sembunyikan motivation row
    const motivationRow = document.getElementById('motivation-row');
    if (!registrationData.motivation) {
        motivationRow.style.display = 'none';
    } else {
        motivationRow.style.display = 'flex';
    }
    
    // Sembunyikan form dan tampilkan kartu hasil
    registrationForm.style.display = 'none';
    resultCard.style.display = 'block';
}

/**
 * Tampilkan form pendaftaran
 */
function showRegistrationForm() {
    registrationForm.style.display = 'block';
    resultCard.style.display = 'none';
    clearAllErrors();
    
    // Fokus ke input pertama
    document.getElementById('fullName').focus();
}

/**
 * Tampilkan panel riwayat
 */
function showHistoryPanel() {
    renderHistoryList();
    historyPanel.style.display = 'block';
}

/**
 * Sembunyikan panel riwayat
 */
function hideHistoryPanel() {
    historyPanel.style.display = 'none';
    searchInput.value = '';
}

/**
 * Render daftar riwayat pendaftaran
 */
function renderHistoryList(searchTerm = '') {
    historyList.innerHTML = '';
    
    let filteredRegistrations = registrations;
    
    // Filter berdasarkan search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredRegistrations = registrations.filter(reg => 
            reg.fullName.toLowerCase().includes(term) || 
            reg.nim.includes(term) ||
            reg.studyProgram.toLowerCase().includes(term)
        );
    }
    
    if (filteredRegistrations.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <p>${searchTerm ? 'Tidak ditemukan data yang sesuai' : 'Belum ada data pendaftaran'}</p>
            <p>Silakan isi form pendaftaran terlebih dahulu.</p>
        `;
        historyList.appendChild(emptyState);
        return;
    }
    
    filteredRegistrations.forEach(registration => {
        const historyItem = createHistoryItem(registration);
        historyList.appendChild(historyItem);
    });
}

/**
 * Buat elemen item riwayat
 */
function createHistoryItem(registration) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    // Format tanggal pendaftaran
    const date = new Date(registration.registrationDate);
    const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Ambil 3 mata kuliah pertama
    const coursesPreview = registration.courses.slice(0, 3).join(', ') + 
                         (registration.courses.length > 3 ? '...' : '');
    
    item.innerHTML = `
        <div class="history-item-header">
            <span class="history-item-id">${registration.id}</span>
            <span class="history-item-date">${formattedDate}</span>
        </div>
        <div class="history-item-name">${registration.fullName}</div>
        <div class="text-muted">${registration.nim} | ${registration.studyProgram}</div>
        <div class="history-item-details">
            <div class="history-item-detail"><strong>Email:</strong> ${registration.email}</div>
            <div class="history-item-detail"><strong>Telp:</strong> ${registration.phone}</div>
            <div class="history-item-detail"><strong>Mata Kuliah:</strong> ${coursesPreview}</div>
        </div>
    `;
    
    // Tambahkan event listener untuk melihat detail
    item.addEventListener('click', () => {
        showResultCard(registration);
        hideHistoryPanel();
    });
    
    return item;
}

/**
 * Update statistik di panel riwayat
 */
function updateHistoryStats() {
    totalRegistrationsEl.textContent = registrations.length;
    
    // Hitung program studi terpopuler
    if (registrations.length > 0) {
        const programCounts = {};
        registrations.forEach(reg => {
            programCounts[reg.studyProgram] = (programCounts[reg.studyProgram] || 0) + 1;
        });
        
        let mostPopular = '';
        let maxCount = 0;
        
        for (const [program, count] of Object.entries(programCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostPopular = program;
            }
        }
        
        popularProgramEl.textContent = mostPopular;
    } else {
        popularProgramEl.textContent = '-';
    }
}

/**
 * Update statistik di footer
 */
function updateFooterStats() {
    totalSavedEl.textContent = registrations.length;
}

/**
 * Format tanggal untuk tampilan
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle submit form
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validasi form
    if (!validateForm()) {
        // Scroll ke error pertama
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Kumpulkan data form
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        nim: document.getElementById('nim').value.trim(),
        birthDate: document.getElementById('birthDate').value,
        birthPlace: document.getElementById('birthPlace').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        studyProgram: document.getElementById('studyProgram').value,
        semester: document.getElementById('semester').value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        courses: getSelectedCourses(),
        address: document.getElementById('address').value.trim(),
        motivation: document.getElementById('motivation').value.trim() || null
    };
    
    // Tambah data registrasi
    const newRegistration = addRegistration(formData);
    
    if (newRegistration) {
        // Tampilkan kartu hasil
        showResultCard(newRegistration);
        
        // Reset form untuk pengisian berikutnya
        studentForm.reset();
        
        // Reset styling checkbox
        const checkboxOptions = document.querySelectorAll('.checkbox-option');
        checkboxOptions.forEach(option => option.classList.remove('selected'));
        
        // Tampilkan notifikasi sukses
        showNotification('Pendaftaran berhasil disimpan!', 'success');
    } else {
        showNotification('Gagal menyimpan data. Silakan coba lagi.', 'error');
    }
}

/**
 * Handle reset form
 */
function handleResetForm() {
    if (confirm('Apakah Anda yakin ingin mengosongkan form?')) {
        studentForm.reset();
        clearAllErrors();
        
        // Reset styling checkbox
        const checkboxOptions = document.querySelectorAll('.checkbox-option');
        checkboxOptions.forEach(option => option.classList.remove('selected'));
        
        // Fokus ke input pertama
        document.getElementById('fullName').focus();
        
        showNotification('Form telah direset', 'info');
    }
}

/**
 * Handle clear history
 */
function handleClearHistory() {
    const cleared = clearAllRegistrations();
    if (cleared) {
        showNotification('Semua riwayat telah dihapus', 'info');
    }
}

/**
 * Handle search
 */
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    renderHistoryList(searchTerm);
    
    if (searchTerm) {
        showNotification(`Menampilkan hasil untuk: "${searchTerm}"`, 'info');
    }
}

/**
 * Tampilkan notifikasi
 */
function showNotification(message, type = 'info') {
    // Hapus notifikasi sebelumnya
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notifikasi
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Warna berdasarkan jenis notifikasi
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#64748b';
    }
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Hapus otomatis setelah 3 detik
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Tambahkan style animasi untuk notifikasi
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// JALANKAN APLIKASI
// ============================================

// Tunggu hingga DOM selesai dimuat
document.addEventListener('DOMContentLoaded', initApp);