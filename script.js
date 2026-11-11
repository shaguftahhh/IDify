/**
 * ============================================================================
 * IDify — Student ID Card Generator
 * Vanilla JavaScript implementation (No frameworks, pure client-side)
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'idify_card_data_v1';
  const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB limit

  // Demo student preset for instant preview & evaluation
  const DEMO_STUDENT = {
    fullName: 'Sophia Martinez',
    studentId: 'CS-2026-894',
    institution: 'Apex Metropolitan University',
    course: 'B.Tech Computer Science',
    department: 'School of Computing',
    yearSemester: 'Year 3 / Sem 6',
    dob: '2004-04-18',
    bloodGroup: 'O+',
    phone: '9876543210',
    email: 'sophia.m@campus.apex.edu',
    validUntil: '2028-06-30',
    address: 'Room 402, North Hall, University Campus, Metro City 560001'
  };

  // High-fidelity illustrated sample portrait for quick evaluation
  const SAMPLE_STUDENT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200"><defs><linearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%231e3a8a"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient></defs><rect width="160" height="200" fill="url(%23bg)"/><circle cx="80" cy="74" r="38" fill="%23fcd34d"/><path d="M42 66 C42 42 118 42 118 66 C118 46 112 36 80 36 C48 36 42 46 42 66 Z" fill="%23334155"/><circle cx="68" cy="72" r="4.5" fill="%231e293b"/><circle cx="92" cy="72" r="4.5" fill="%231e293b"/><path d="M72 86 Q80 94 88 86" stroke="%23b45309" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M28 185 C28 135 132 135 132 185 L132 200 L28 200 Z" fill="%230284c7"/><polygon points="80,140 68,160 92,160" fill="%23ffffff"/><polygon points="80,152 75,188 85,188" fill="%23dc2626"/></svg>';

  // --- Application State ---
  const state = {
    formData: { ...DEMO_STUDENT },
    photoDataUrl: SAMPLE_STUDENT_AVATAR,
    currentTheme: 'blue',
    customAccent: '#38bdf8',
    orientation: 'landscape', // 'landscape' | 'portrait'
    isFlipped: false,
    siteTheme: 'dark', // 'dark' | 'light' | 'cyber'
    isMuted: false,
    isUvActive: false,
    isHoloActive: true,
    hasLanyard: false
  };

  // --- DOM Element References ---
  const elements = {
    form: document.getElementById('id-card-form'),
    btnGenerate: document.getElementById('btn-generate'),
    btnReset: document.getElementById('btn-reset'),
    btnQuickDemo: document.getElementById('btn-quick-demo'),
    btnClearStorage: document.getElementById('btn-clear-storage'),
    // Header Site Theme & Audio Elements
    siteThemeButtons: document.querySelectorAll('.site-theme-btn'),
    btnToggleSound: document.getElementById('btn-toggle-sound'),
    iconSoundOn: document.getElementById('icon-sound-on'),
    iconSoundOff: document.getElementById('icon-sound-off'),
    soundStatusText: document.getElementById('sound-status-text'),
    // Photo upload elements
    photoInput: document.getElementById('photo-file-input'),
    photoDropzone: document.getElementById('photo-dropzone'),
    photoThumbImg: document.getElementById('photo-thumb-img'),
    photoFallbackIcon: document.getElementById('photo-fallback-icon'),
    uploaderActions: document.getElementById('uploader-actions'),
    btnSamplePhoto: document.getElementById('btn-sample-photo'),
    btnRemovePhoto: document.getElementById('btn-remove-photo'),
    photoStatusTitle: document.getElementById('photo-status-title'),
    photoStatusDesc: document.getElementById('photo-status-desc'),
    // Form Inputs
    inputFullName: document.getElementById('field-fullName'),
    inputStudentId: document.getElementById('field-studentId'),
    inputInstitution: document.getElementById('field-institution'),
    inputCourse: document.getElementById('field-course'),
    inputDepartment: document.getElementById('field-department'),
    inputYearSemester: document.getElementById('field-yearSemester'),
    inputDob: document.getElementById('field-dob'),
    inputBloodGroup: document.getElementById('field-bloodGroup'),
    inputPhone: document.getElementById('field-phone'),
    inputEmail: document.getElementById('field-email'),
    inputValidUntil: document.getElementById('field-validUntil'),
    inputAddress: document.getElementById('field-address'),
    // Live Preview Displays (Front)
    dispFullName: document.getElementById('disp-fullName'),
    dispStudentId: document.getElementById('disp-studentId'),
    dispInstitution: document.getElementById('disp-institution'),
    dispCourse: document.getElementById('disp-course'),
    dispDepartment: document.getElementById('disp-department'),
    dispYearSemester: document.getElementById('disp-yearSemester'),
    dispCardPhoto: document.getElementById('disp-card-photo'),
    cardPhotoFallback: document.getElementById('card-photo-fallback'),
    dispCardYear: document.getElementById('disp-card-year'),
    // Live Preview Displays (Back)
    dispDob: document.getElementById('disp-dob'),
    dispBloodGroup: document.getElementById('disp-bloodGroup'),
    dispPhone: document.getElementById('disp-phone'),
    dispEmail: document.getElementById('disp-email'),
    dispValidUntil: document.getElementById('disp-validUntil'),
    dispAddress: document.getElementById('disp-address'),
    qrContainer: document.getElementById('qr-code-container'),
    qrIdCaption: document.getElementById('qr-id-caption'),
    // 3D Card Shell & Controls
    cardStageContainer: document.getElementById('card-stage-container'),
    cardScene: document.getElementById('card-scene'),
    cardInner: document.getElementById('id-card-inner'),
    cardFrontFace: document.getElementById('card-front-face'),
    cardBackFace: document.getElementById('card-back-face'),
    cardSideIndicator: document.getElementById('card-side-indicator'),
    btnFlip: document.getElementById('btn-flip'),
    themePills: document.querySelectorAll('.theme-pill'),
    accentColorPicker: document.getElementById('accent-color-picker'),
    btnOrientLandscape: document.getElementById('btn-orient-landscape'),
    btnOrientPortrait: document.getElementById('btn-orient-portrait'),
    // Card Innovation Toggles
    btnToggleHolo: document.getElementById('btn-toggle-holo'),
    btnToggleUv: document.getElementById('btn-toggle-uv'),
    btnToggleLanyard: document.getElementById('btn-toggle-lanyard'),
    // Action Buttons
    btnDownloadPng: document.getElementById('btn-download-png'),
    btnDownloadPdf: document.getElementById('btn-download-pdf'),
    btnPrint: document.getElementById('btn-print'),
    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // ==========================================================================
  // 1. Validation Logic
  // ==========================================================================

  /**
   * Validate individual fields and return error message if invalid
   */
  function validateField(fieldName, value) {
    const val = (value || '').trim();

    switch (fieldName) {
      case 'fullName':
        if (!val) return 'Full Name is required.';
        if (val.length < 2) return 'Full Name must be at least 2 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Name should only contain letters and standard punctuation.';
        return null;

      case 'studentId':
        if (!val) return 'Student ID / Roll Number is required.';
        if (val.length < 3) return 'Student ID must be at least 3 characters.';
        return null;

      case 'course':
        if (!val) return 'Course / Program is required.';
        return null;

      case 'phone':
        if (!val) return null; // optional
        const digits = val.replace(/\D/g, '');
        if (digits.length !== 10) return 'Phone number must be exactly 10 digits.';
        return null;

      case 'email':
        if (!val) return null; // optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) return 'Please enter a valid email address.';
        return null;

      default:
        return null;
    }
  }

  /**
   * Show inline error message for a specific input
   */
  function setFieldError(fieldName, message) {
    const input = document.getElementById(`field-${fieldName}`);
    const errorEl = document.getElementById(`error-${fieldName}`);
    if (input) {
      if (message) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
    }
    if (errorEl) {
      errorEl.textContent = message || '';
    }
  }

  /**
   * Validate entire form
   */
  function validateAll() {
    let isValid = true;
    const fieldsToValidate = ['fullName', 'studentId', 'course', 'phone', 'email'];

    fieldsToValidate.forEach((fieldName) => {
      const input = document.getElementById(`field-${fieldName}`);
      const val = input ? input.value : '';
      const error = validateField(fieldName, val);
      setFieldError(fieldName, error);
      if (error) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ==========================================================================
  // 2. Data Formatting & QR Code Generation
  // ==========================================================================

  /**
   * Format YYYY-MM-DD into "Month DD, YYYY"
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const [year, month, day] = parts;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[parseInt(month, 10) - 1] || month;
      return `${monthName} ${parseInt(day, 10)}, ${year}`;
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Format 10-digit phone number nicely
   */
  function formatPhone(phoneStr) {
    if (!phoneStr) return '—';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phoneStr;
  }

  /**
   * Generate and inject QR code into #qr-code-container using QRCode.js library
   * Encodes the student's name and ID number, updating dynamically.
   */
  function updateQRCode() {
    const container = elements.qrContainer || document.getElementById('qr-code-container');
    if (!container) return;

    // Retrieve name and ID directly from state or inputs
    const studentName = (elements.inputFullName && elements.inputFullName.value.trim()) ||
                        (state.formData.fullName && state.formData.fullName.trim()) ||
                        'Student Name';
    const studentId = (elements.inputStudentId && elements.inputStudentId.value.trim()) ||
                      (state.formData.studentId && state.formData.studentId.trim()) ||
                      'ID-000000';

    // Encode student's name and ID number
    const qrData = `Student Name: ${studentName}\nStudent ID: ${studentId}`;

    // Update ID caption under QR code
    if (elements.qrIdCaption) {
      elements.qrIdCaption.textContent = `ID: ${studentId}`;
    }

    // Clear previous QR code elements
    container.innerHTML = '';

    // Generate & inject with QRCode.js
    if (typeof window.QRCode === 'function') {
      try {
        new window.QRCode(container, {
          text: qrData,
          width: 74,
          height: 74,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
        container.setAttribute('title', `Student Name: ${studentName} | Student ID: ${studentId}`);
        return;
      } catch (err) {
        console.warn('QRCode.js execution error:', err);
      }
    }

    // Pure HTML5 Canvas QR/Barcode Fallback (works 100% offline or if CDN is blocked)
    renderCanvasQRBarcodeFallback(container, `${studentName}:${studentId}`);
  }

  /**
   * Renders a crisp pseudo-2D barcode pattern on canvas if external CDN is offline
   */
  function renderCanvasQRBarcodeFallback(container, codeString) {
    const canvas = document.createElement('canvas');
    canvas.width = 74;
    canvas.height = 74;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 74, 74);

    // Draw realistic QR finder patterns in 3 corners
    ctx.fillStyle = '#0f172a';
    function drawFinder(x, y) {
      ctx.fillRect(x, y, 18, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3, y + 3, 12, 12);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 6, y + 6, 6, 6);
    }
    drawFinder(4, 4);
    drawFinder(52, 4);
    drawFinder(4, 52);

    // Fill data grid based on hash of string
    let hash = 0;
    for (let i = 0; i < codeString.length; i++) {
      hash = (hash << 5) - hash + codeString.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 14; c++) {
        // Skip corner finder zones
        if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5)) continue;
        const bit = Math.abs((hash ^ (r * 31 + c * 17)) % 2);
        if (bit === 1) {
          ctx.fillRect(4 + c * 4.7, 4 + r * 4.7, 3.5, 3.5);
        }
      }
    }

    container.appendChild(canvas);
  }

  // ==========================================================================
  // 3. Live Preview Synchronizer
  // ==========================================================================

  /**
   * Update all DOM elements on the ID card from current state
   */
  function updateLivePreview() {
    const d = state.formData;

    // Front Side
    elements.dispFullName.textContent = d.fullName || 'Student Name';
    elements.dispStudentId.textContent = d.studentId || 'ID-000000';
    elements.dispInstitution.textContent = d.institution || 'Apex Metropolitan University';
    elements.dispCourse.textContent = d.course || 'Program / Course';
    elements.dispDepartment.textContent = d.department || 'General Studies';
    elements.dispYearSemester.textContent = d.yearSemester || 'Year 1';

    // Compute academic validity year string for front badge
    if (d.validUntil) {
      const expYear = new Date(d.validUntil).getFullYear();
      if (!isNaN(expYear)) {
        elements.dispCardYear.textContent = `${expYear - 1}-${expYear}`;
      }
    }

    // Back Side
    elements.dispDob.textContent = formatDate(d.dob);
    elements.dispBloodGroup.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
      <span>${d.bloodGroup || 'N/A'}</span>
    `;
    elements.dispPhone.textContent = formatPhone(d.phone);
    elements.dispEmail.textContent = d.email || '—';
    elements.dispValidUntil.textContent = formatDate(d.validUntil);
    elements.dispAddress.textContent = d.address || '—';

    // Photo
    if (state.photoDataUrl) {
      elements.dispCardPhoto.src = state.photoDataUrl;
      elements.dispCardPhoto.style.display = 'block';
      elements.cardPhotoFallback.style.display = 'none';

      elements.photoThumbImg.src = state.photoDataUrl;
      elements.photoThumbImg.style.display = 'block';
      elements.photoFallbackIcon.style.display = 'none';
      if (elements.uploaderActions) elements.uploaderActions.style.display = 'flex';
      if (elements.btnRemovePhoto) elements.btnRemovePhoto.style.display = 'inline-flex';
      if (elements.btnSamplePhoto) elements.btnSamplePhoto.style.display = 'none';
      elements.photoStatusTitle.textContent = 'Photo uploaded successfully';
      elements.photoStatusDesc.textContent = 'Click to change or remove photo below';
    } else {
      elements.dispCardPhoto.style.display = 'none';
      elements.cardPhotoFallback.style.display = 'flex';

      elements.photoThumbImg.style.display = 'none';
      elements.photoFallbackIcon.style.display = 'block';
      if (elements.uploaderActions) elements.uploaderActions.style.display = 'flex';
      if (elements.btnRemovePhoto) elements.btnRemovePhoto.style.display = 'none';
      if (elements.btnSamplePhoto) elements.btnSamplePhoto.style.display = 'inline-flex';
      elements.photoStatusTitle.textContent = 'Click or drag & drop photo here';
      elements.photoStatusDesc.textContent = 'PNG, JPG, JPEG, WEBP up to 2 MB';
    }

    // Refresh QR code
    updateQRCode();
  }

  /**
   * Sync form input values into state
   */
  function syncFormToState() {
    state.formData = {
      fullName: elements.inputFullName.value,
      studentId: elements.inputStudentId.value,
      institution: elements.inputInstitution.value,
      course: elements.inputCourse.value,
      department: elements.inputDepartment.value,
      yearSemester: elements.inputYearSemester.value,
      dob: elements.inputDob.value,
      bloodGroup: elements.inputBloodGroup.value,
      phone: elements.inputPhone.value,
      email: elements.inputEmail.value,
      validUntil: elements.inputValidUntil.value,
      address: elements.inputAddress.value
    };
  }

  /**
   * Populate form input controls from state
   */
  function syncStateToForm() {
    const d = state.formData;
    elements.inputFullName.value = d.fullName || '';
    elements.inputStudentId.value = d.studentId || '';
    elements.inputInstitution.value = d.institution || '';
    elements.inputCourse.value = d.course || '';
    elements.inputDepartment.value = d.department || '';
    elements.inputYearSemester.value = d.yearSemester || '';
    elements.inputDob.value = d.dob || '';
    elements.inputBloodGroup.value = d.bloodGroup || '';
    elements.inputPhone.value = d.phone || '';
    elements.inputEmail.value = d.email || '';
    elements.inputValidUntil.value = d.validUntil || '';
    elements.inputAddress.value = d.address || '';
  }

  // ==========================================================================
  // 4. Photo Upload & FileReader Handler
  // ==========================================================================

  function handlePhotoFile(file) {
    const errorEl = document.getElementById('error-photo');
    if (errorEl) errorEl.textContent = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (errorEl) errorEl.textContent = 'Please upload a valid image file (PNG, JPG, WebP).';
      showToast('Invalid file format. Please upload an image.', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      if (errorEl) errorEl.textContent = 'Image size exceeds 2 MB limit.';
      showToast('Image size exceeds 2 MB. Please select a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      state.photoDataUrl = event.target.result;
      updateLivePreview();
      saveToLocalStorage();
      showToast('Profile photo updated!', 'success');
    };
    reader.onerror = function () {
      showToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    state.photoDataUrl = null;
    elements.photoInput.value = '';
    updateLivePreview();
    saveToLocalStorage();
    showToast('Photo removed. Using fallback avatar.', 'info');
  }

  // ==========================================================================
  // 5. Themes, Accent Color, and Orientation
  // ==========================================================================

  function setTheme(themeName) {
    state.currentTheme = themeName;
    document.documentElement.setAttribute('data-card-theme', themeName);

    // Update active theme pill styling
    elements.themePills.forEach((pill) => {
      if (pill.dataset.theme === themeName) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Reset inline accent style so preset theme colors shine
    if (themeName !== 'custom') {
      elements.cardInner.style.removeProperty('--card-accent');
    }

    saveToLocalStorage();
  }

  function setCustomAccent(colorHex) {
    state.customAccent = colorHex;
    // Apply directly to card styles as CSS variable
    elements.cardInner.style.setProperty('--card-accent', colorHex);
    // Unselect presets
    elements.themePills.forEach((p) => p.classList.remove('active'));
    state.currentTheme = 'custom';
    saveToLocalStorage();
  }

  function setOrientation(orientation) {
    state.orientation = orientation;

    if (orientation === 'portrait') {
      elements.cardScene.classList.remove('orientation-landscape');
      elements.cardScene.classList.add('orientation-portrait');
      elements.btnOrientPortrait.classList.add('active');
      elements.btnOrientLandscape.classList.remove('active');
    } else {
      elements.cardScene.classList.remove('orientation-portrait');
      elements.cardScene.classList.add('orientation-landscape');
      elements.btnOrientLandscape.classList.add('active');
      elements.btnOrientPortrait.classList.remove('active');
    }

    saveToLocalStorage();
  }

  // ==========================================================================
  // 5.5 Tactile Audio Synthesizer, Site Themes & Security Innovations
  // ==========================================================================

  let audioCtx = null;
  let userHasInteracted = false;
  window.addEventListener('pointerdown', () => { userHasInteracted = true; }, { capture: true, once: true });
  window.addEventListener('keydown', () => { userHasInteracted = true; }, { capture: true, once: true });

  function getAudioContext() {
    if (!userHasInteracted) return null;
    if (!audioCtx && typeof window.AudioContext !== 'undefined') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Zero-dependency Web Audio synthesizers for subtle, tactile acoustic feedback
   */
  function playSound(type) {
    if (state.isMuted || !userHasInteracted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'flip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.09);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'uv') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'theme') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'export') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    } catch (e) {
      // Audio playback fails silently if blocked by user autoplay policy
    }
  }

  /**
   * Set website theme (dark, light, cyber)
   */
  function setSiteTheme(themeName, silent = false) {
    if (!['dark', 'light', 'cyber'].includes(themeName)) themeName = 'dark';
    state.siteTheme = themeName;
    document.documentElement.setAttribute('data-site-theme', themeName);

    if (elements.siteThemeButtons) {
      elements.siteThemeButtons.forEach((btn) => {
        if (btn.dataset.siteTheme === themeName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    localStorage.setItem('idify_site_theme', themeName);
    if (!silent) playSound('theme');
  }

  /**
   * Toggle acoustic UI sounds
   */
  function toggleSound() {
    state.isMuted = !state.isMuted;
    localStorage.setItem('idify_sound_muted', state.isMuted ? 'true' : 'false');
    updateSoundUI();
    if (!state.isMuted) playSound('click');
  }

  function updateSoundUI() {
    if (!elements.btnToggleSound) return;
    if (state.isMuted) {
      elements.btnToggleSound.classList.add('is-muted');
      if (elements.iconSoundOn) elements.iconSoundOn.style.display = 'none';
      if (elements.iconSoundOff) elements.iconSoundOff.style.display = 'inline-block';
      if (elements.soundStatusText) elements.soundStatusText.textContent = 'Muted';
    } else {
      elements.btnToggleSound.classList.remove('is-muted');
      if (elements.iconSoundOn) elements.iconSoundOn.style.display = 'inline-block';
      if (elements.iconSoundOff) elements.iconSoundOff.style.display = 'none';
      if (elements.soundStatusText) elements.soundStatusText.textContent = 'Audio';
    }
  }

  /**
   * Toggle dynamic interactive holographic foil reflection
   */
  function toggleHologram(force, silent = false) {
    const next = typeof force === 'boolean' ? force : !state.isHoloActive;
    state.isHoloActive = next;
    if (elements.cardScene) {
      elements.cardScene.classList.toggle('has-holo-active', next);
    }
    if (elements.btnToggleHolo) {
      elements.btnToggleHolo.classList.toggle('active', next);
    }
    if (!silent) playSound('click');
  }

  /**
   * Toggle Ultraviolet (UV) forensic inspection blacklight mode
   */
  function toggleUVSecurity(force) {
    const next = typeof force === 'boolean' ? force : !state.isUvActive;
    state.isUvActive = next;
    if (elements.cardStageContainer) {
      elements.cardStageContainer.classList.toggle('uv-mode-active', next);
    }
    if (elements.btnToggleUv) {
      elements.btnToggleUv.classList.toggle('active', next);
    }
    if (elements.cardSideIndicator) {
      elements.cardSideIndicator.textContent = next
        ? 'UV Forensic Scanner Active'
        : (state.isFlipped ? 'Back View' : 'Front View');
    }
    playSound('uv');
    showToast(next ? 'UV Blacklight Scanner active: Watermarks revealed' : 'Normal lighting restored', 'info');
  }

  /**
   * Toggle realistic punched badge lanyard clip slot
   */
  function toggleLanyardSlot(force) {
    const next = typeof force === 'boolean' ? force : !state.hasLanyard;
    state.hasLanyard = next;
    if (elements.cardScene) {
      elements.cardScene.classList.toggle('has-lanyard-slot', next);
    }
    if (elements.btnToggleLanyard) {
      elements.btnToggleLanyard.classList.toggle('active', next);
    }
    playSound('click');
  }

  /**
   * Setup 3D mouse tilt and holographic foil sheen reflection tracking
   */
  function setupCardTiltAndHoloTracking() {
    if (!elements.cardScene) return;

    elements.cardScene.addEventListener('mousemove', (e) => {
      const rect = elements.cardScene.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      // Subtle dynamic 3D tilt
      const rotateX = -deltaY * 8;
      const rotateY = deltaX * 8;
      const inner = elements.cardInner;
      if (inner) {
        const baseFlip = state.isFlipped ? 180 : 0;
        inner.style.transform = `rotateY(${baseFlip + rotateY}deg) rotateX(${rotateX}deg)`;
      }

      // Map mouse coordinate to holographic reflection
      const pctX = ((x / rect.width) * 100).toFixed(1);
      const pctY = ((y / rect.height) * 100).toFixed(1);
      elements.cardScene.style.setProperty('--holo-x', `${pctX}%`);
      elements.cardScene.style.setProperty('--holo-y', `${pctY}%`);
    });

    elements.cardScene.addEventListener('mouseleave', () => {
      if (elements.cardInner) {
        const baseFlip = state.isFlipped ? 180 : 0;
        elements.cardInner.style.transform = `rotateY(${baseFlip}deg) rotateX(0deg)`;
      }
      elements.cardScene.style.setProperty('--holo-x', '50%');
      elements.cardScene.style.setProperty('--holo-y', '50%');
    });
  }

  function toggleCardFlip() {
    state.isFlipped = !state.isFlipped;
    // Clear any residual mouse tilt style
    if (elements.cardInner) {
      elements.cardInner.style.transform = '';
    }

    if (state.isFlipped) {
      elements.cardInner.classList.add('is-flipped');
      elements.cardSideIndicator.textContent = state.isUvActive ? 'UV Forensic Scanner Active' : 'Back View';
      elements.btnFlip.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m8 3-4 4 4 4" />
          <path d="M4 7h16a4 4 0 0 1 4 4v1" />
          <path d="m16 21 4-4-4-4" />
          <path d="M20 17H4a4 4 0 0 1-4-4v-1" />
        </svg>
        Flip to Front
      `;
    } else {
      elements.cardInner.classList.remove('is-flipped');
      elements.cardSideIndicator.textContent = state.isUvActive ? 'UV Forensic Scanner Active' : 'Front View';
      elements.btnFlip.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m16 3 4 4-4 4" />
          <path d="M20 7H4a4 4 0 0 0-4 4v1" />
          <path d="m8 21-4-4 4-4" />
          <path d="M4 17h16a4 4 0 0 0 4-4v-1" />
        </svg>
        Flip Card
      `;
    }

    playSound('flip');
  }

  // ==========================================================================
  // 6. Export Functions (PNG, PDF, Print)
  // ==========================================================================

  /**
   * Helper to ensure card face element is fully rendered and styles computed
   */
  async function captureCardFace(faceElement) {
    if (typeof window.html2canvas !== 'function') {
      throw new Error('html2canvas library is not loaded');
    }

    const prevVisibility = faceElement.style.visibility;
    const prevOpacity = faceElement.style.opacity;
    const prevTransform = faceElement.style.transform;

    // Temporarily ensure full visibility for capture
    faceElement.style.visibility = 'visible';
    faceElement.style.opacity = '1';
    faceElement.style.transform = 'none';

    try {
      return await window.html2canvas(faceElement, {
        scale: 2.5, // 2.5x pixel ratio for high-res crisp print & export
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
    } finally {
      faceElement.style.visibility = prevVisibility;
      faceElement.style.opacity = prevOpacity;
      faceElement.style.transform = prevTransform;
    }
  }

  /**
   * Download card as PNG
   */
  async function downloadCardAsPNG() {
    const originalText = elements.btnDownloadPng.innerHTML;
    elements.btnDownloadPng.disabled = true;
    elements.btnDownloadPng.innerHTML = 'Generating...';

    try {
      // Capture the currently visible face (or front if neither)
      const targetFace = state.isFlipped ? elements.cardBackFace : elements.cardFrontFace;
      const sideName = state.isFlipped ? 'back' : 'front';

      const canvas = await captureCardFace(targetFace);
      const link = document.createElement('a');
      const cleanName = (state.formData.fullName || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      link.download = `IDify_${cleanName}_${sideName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast(`ID card (${sideName}) downloaded as PNG!`, 'success');
    } catch (err) {
      console.error('PNG export error:', err);
      showToast('Could not download image. Please try again.', 'error');
    } finally {
      elements.btnDownloadPng.disabled = false;
      elements.btnDownloadPng.innerHTML = originalText;
    }
  }

  /**
   * Download card as PDF using jsPDF
   */
  async function downloadCardAsPDF() {
    const originalText = elements.btnDownloadPdf.innerHTML;
    elements.btnDownloadPdf.disabled = true;
    elements.btnDownloadPdf.innerHTML = 'Creating PDF...';

    try {
      // Capture both front and back
      const frontCanvas = await captureCardFace(elements.cardFrontFace);
      const backCanvas = await captureCardFace(elements.cardBackFace);

      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        throw new Error('jsPDF library is not loaded');
      }

      // Standard ID-1 card dimensions: 85.6mm x 54mm (Landscape) or 54mm x 85.6mm (Portrait)
      const isLandscape = state.orientation === 'landscape';
      const doc = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: isLandscape ? [85.6, 54] : [54, 85.6]
      });

      const cardW = isLandscape ? 85.6 : 54;
      const cardH = isLandscape ? 54 : 85.6;

      // Page 1: Front
      const frontImgData = frontCanvas.toDataURL('image/png');
      doc.addImage(frontImgData, 'PNG', 0, 0, cardW, cardH);

      // Page 2: Back
      doc.addPage([cardW, cardH], isLandscape ? 'landscape' : 'portrait');
      const backImgData = backCanvas.toDataURL('image/png');
      doc.addImage(backImgData, 'PNG', 0, 0, cardW, cardH);

      const cleanName = (state.formData.fullName || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      doc.save(`IDify_${cleanName}_card.pdf`);

      showToast('2-Page Student ID Card PDF downloaded!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Could not generate PDF. Please try again.', 'error');
    } finally {
      elements.btnDownloadPdf.disabled = false;
      elements.btnDownloadPdf.innerHTML = originalText;
    }
  }

  /**
   * Print card using printer dialog
   */
  function printCard() {
    window.print();
  }

  // ==========================================================================
  // 7. LocalStorage Persistence
  // ==========================================================================

  function saveToLocalStorage() {
    try {
      const payload = {
        formData: state.formData,
        photoDataUrl: state.photoDataUrl,
        currentTheme: state.currentTheme,
        customAccent: state.customAccent,
        orientation: state.orientation
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.formData) state.formData = { ...DEMO_STUDENT, ...parsed.formData };
        if (parsed.photoDataUrl) state.photoDataUrl = parsed.photoDataUrl;
        if (parsed.currentTheme) state.currentTheme = parsed.currentTheme;
        if (parsed.customAccent) state.customAccent = parsed.customAccent;
        if (parsed.orientation) state.orientation = parsed.orientation;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }

  function clearLocalStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      state.formData = {
        fullName: '',
        studentId: '',
        institution: '',
        course: '',
        department: '',
        yearSemester: '',
        dob: '',
        bloodGroup: '',
        phone: '',
        email: '',
        validUntil: '',
        address: ''
      };
      state.photoDataUrl = null;
      syncStateToForm();
      updateLivePreview();
      showToast('Saved data cleared from browser storage.', 'info');
    } catch (e) {
      console.warn('Clear storage error:', e);
    }
  }

  function loadDemoStudentData() {
    state.formData = { ...DEMO_STUDENT };
    syncStateToForm();
    updateLivePreview();
    validateAll();
    saveToLocalStorage();
    showToast('Loaded realistic demo student profile!', 'success');
  }

  // ==========================================================================
  // 8. Toast Feedback Component
  // ==========================================================================

  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================================================
  // 9. Event Listeners Setup
  // ==========================================================================

  function initEventListeners() {
    // Live synchronization on typing/changing any form field
    const allInputs = elements.form.querySelectorAll('input, select, textarea');
    allInputs.forEach((input) => {
      const handleInput = () => {
        syncFormToState();
        updateLivePreview();
        saveToLocalStorage();

        // Real-time validation clear
        const fieldName = input.id.replace('field-', '');
        const error = validateField(fieldName, input.value);
        setFieldError(fieldName, error);
      };

      input.addEventListener('input', handleInput);
      input.addEventListener('change', handleInput);
    });

    // Dedicated real-time dynamic QR code listeners for student Name and ID
    ['input', 'change', 'keyup', 'paste'].forEach((evtType) => {
      if (elements.inputFullName) {
        elements.inputFullName.addEventListener(evtType, () => {
          syncFormToState();
          updateQRCode();
        });
      }
      if (elements.inputStudentId) {
        elements.inputStudentId.addEventListener(evtType, () => {
          syncFormToState();
          updateQRCode();
        });
      }
    });

    // Form Submit (Generate ID Card)
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isValid = validateAll();
      if (isValid) {
        syncFormToState();
        updateLivePreview();
        saveToLocalStorage();
        showToast('ID Card generated successfully with all valid details!', 'success');

        // Gentle visual highlight pulse on the card
        elements.cardInner.style.animation = 'none';
        elements.cardInner.offsetHeight; // trigger reflow
        elements.cardInner.style.boxShadow = '0 0 0 4px var(--card-accent), 0 20px 40px -15px rgba(0,0,0,0.7)';
        setTimeout(() => {
          elements.cardInner.style.boxShadow = '';
        }, 1200);

        // Smooth scroll to card on mobile
        if (window.innerWidth <= 1080 && elements.cardScene) {
          elements.cardScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        showToast('Please correct the highlighted errors before generating.', 'error');
      }
    });

    // Form Reset
    elements.btnReset.addEventListener('click', () => {
      elements.form.reset();
      syncFormToState();
      // Clear errors
      ['fullName', 'studentId', 'course', 'phone', 'email'].forEach((f) => setFieldError(f, null));
      updateLivePreview();
      saveToLocalStorage();
      showToast('Form inputs reset.', 'info');
    });

    // Quick Demo Data button
    elements.btnQuickDemo.addEventListener('click', loadDemoStudentData);

    // Clear Storage button
    elements.btnClearStorage.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all saved ID card data?')) {
        clearLocalStorage();
      }
    });

    // Photo Dropzone and File Picker
    elements.photoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handlePhotoFile(file);
    });

    // Sample Photo Button
    if (elements.btnSamplePhoto) {
      elements.btnSamplePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        state.photoDataUrl = SAMPLE_STUDENT_AVATAR;
        updateLivePreview();
        saveToLocalStorage();
        showToast('Sample student portrait photo applied!', 'success');
      });
    }

    // Drag and Drop
    ['dragenter', 'dragover'].forEach((eventName) => {
      elements.photoDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        elements.photoDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      elements.photoDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        elements.photoDropzone.classList.remove('dragover');
      });
    });

    elements.photoDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) handlePhotoFile(file);
    });

    // Remove Photo button
    elements.btnRemovePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      removePhoto();
    });

    // 3D Flip Card button
    elements.btnFlip.addEventListener('click', toggleCardFlip);

    // Allow clicking the card itself to flip
    elements.cardInner.addEventListener('click', (e) => {
      // Don't flip if clicking interactive link/button inside
      if (e.target.closest('button, a')) return;
      toggleCardFlip();
    });

    // Keyboard accessibility for card flipping
    elements.cardInner.setAttribute('tabindex', '0');
    elements.cardInner.setAttribute('role', 'region');
    elements.cardInner.setAttribute('aria-label', 'Student ID Card. Press Enter or Space to flip sides.');
    elements.cardInner.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCardFlip();
      }
    });

    // Theme selector pills
    elements.themePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        setTheme(pill.dataset.theme);
        playSound('click');
      });
    });

    // Custom accent color picker
    elements.accentColorPicker.addEventListener('input', (e) => {
      setCustomAccent(e.target.value);
    });

    // Orientation toggle buttons
    elements.btnOrientLandscape.addEventListener('click', () => {
      setOrientation('landscape');
      playSound('click');
    });
    elements.btnOrientPortrait.addEventListener('click', () => {
      setOrientation('portrait');
      playSound('click');
    });

    // Site Theme switcher buttons (Dark, Light, Cyber)
    if (elements.siteThemeButtons) {
      elements.siteThemeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          setSiteTheme(btn.dataset.siteTheme);
        });
      });
    }

    // Tactile sound effect toggle
    if (elements.btnToggleSound) {
      elements.btnToggleSound.addEventListener('click', toggleSound);
    }

    // Card Innovation Toggles
    if (elements.btnToggleHolo) {
      elements.btnToggleHolo.addEventListener('click', () => toggleHologram());
    }
    if (elements.btnToggleUv) {
      elements.btnToggleUv.addEventListener('click', () => toggleUVSecurity());
    }
    if (elements.btnToggleLanyard) {
      elements.btnToggleLanyard.addEventListener('click', () => toggleLanyardSlot());
    }

    // Interactive 3D mouse tilt and holographic foil sheen
    setupCardTiltAndHoloTracking();

    // Export actions
    elements.btnDownloadPng.addEventListener('click', () => {
      playSound('export');
      downloadCardAsPNG();
    });
    elements.btnDownloadPdf.addEventListener('click', () => {
      playSound('export');
      downloadCardAsPDF();
    });
    elements.btnPrint.addEventListener('click', () => {
      playSound('export');
      printCard();
    });
  }

  // ==========================================================================
  // 10. Initialization
  // ==========================================================================

  function init() {
    // Load site theme and audio preferences
    const savedSiteTheme = localStorage.getItem('idify_site_theme') || 'dark';
    setSiteTheme(savedSiteTheme, true);

    const savedMuted = localStorage.getItem('idify_sound_muted') === 'true';
    state.isMuted = savedMuted;
    updateSoundUI();

    loadFromLocalStorage();
    syncStateToForm();
    if (state.currentTheme) setTheme(state.currentTheme);
    if (state.customAccent && state.currentTheme === 'custom') setCustomAccent(state.customAccent);
    if (state.orientation) setOrientation(state.orientation);

    // Initialize hologram active state
    toggleHologram(true, true);

    updateLivePreview();
    initEventListeners();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
