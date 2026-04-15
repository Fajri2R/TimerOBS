const form = document.getElementById('settings-form');
const modeInput = document.getElementById('mode');
const formatInput = document.getElementById('format');
const timeInput = document.getElementById('time');
const timeHint = document.getElementById('time-hint');
const endMessageInput = document.getElementById('end_message');
const fontInput = document.getElementById('font');
const fontDropdown = document.getElementById('font-dropdown');
const fontSizeInput = document.getElementById('font_size');
const fontSizeRange = document.getElementById('font_size_range');
const bgColorInput = document.getElementById('bg_color');
const bgColorTextInput = document.getElementById('bg_color_text');
const textColorInput = document.getElementById('text_color');
const textColorTextInput = document.getElementById('text_color_text');
const circleColorInput = document.getElementById('circle_color');
const circleColorTextInput = document.getElementById('circle_color_text');
const titleColorInput = document.getElementById('title_color');
const titleColorTextInput = document.getElementById('title_color_text');
const titleStyleInput = document.getElementById('title_style');
const titleFontSizeInput = document.getElementById('title_font_size');
const titleFontSizeRange = document.getElementById('title_font_size_range');
const timeAnimationInput = document.getElementById('time_animation');
const timeAnimationHint = document.getElementById('time-animation-hint');
const transparentInput = document.getElementById('transparent');
const showLabelsInput = document.getElementById('show_labels');
const labelPositionInput = document.getElementById('label_position');
const labelsSettings = document.getElementById('labels-settings');
const showTitlesInput = document.getElementById('show_titles');
const titleTopInput = document.getElementById('title_top');
const titleBottomInput = document.getElementById('title_bottom');
const titlesSettings = document.getElementById('titles-settings');
const timerStyleInput = document.getElementById('timer_style');
const previewFrame = document.getElementById('preview-frame');
const previewStage = document.getElementById('preview-stage');
const generatedUrl = document.getElementById('generated-url');
const statusBadge = document.getElementById('status-badge');
const statusMessage = document.getElementById('status-message');
const openOutputButton = document.getElementById('open-output');
const copyUrlButton = document.getElementById('copy-url');
const resetSettingsButton = document.getElementById('reset-settings');
const refreshPreviewButton = document.getElementById('refresh-preview');
const draftState = document.getElementById('draft-state');
const presetButtons = document.querySelectorAll('.preset-chip');
const styleButtons = document.querySelectorAll('.style-option');
const fontPickButtons = document.querySelectorAll('.font-pick');

const toggleInputs = [
  document.getElementById('bold'),
  document.getElementById('italic'),
  document.getElementById('underline'),
  document.getElementById('stroke'),
  document.getElementById('shadow'),
];

const titleToggleInputs = [
  document.getElementById('title_bold'),
  document.getElementById('title_italic'),
  document.getElementById('title_underline'),
];

const fontSuggestions = [
  'Bebas Neue',
  'Anton',
  'Rajdhani',
  'Orbitron',
  'Oswald',
  'Teko',
  'Space Grotesk',
  'Inter',
  'Barlow Condensed',
  'Barlow Semi Condensed',
  'Exo 2',
  'Audiowide',
  'Chakra Petch',
  'Kanit',
  'League Spartan',
  'Titillium Web',
  'Russo One',
  'Archivo Black',
  'Sora',
  'Outfit',
  'Manrope',
  'Poppins',
  'Montserrat',
  'Plus Jakarta Sans',
  'Rubik',
  'Work Sans',
  'Roboto',
  'Open Sans',
  'Lato',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'DM Sans',
  'Prompt',
  'Urbanist',
  'IBM Plex Sans',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
];

const formatGuides = {
  'hh:mm:ss': {
    placeholder: 'Contoh: 00:10:00',
    message: 'Format HH:mm:ss cocok untuk countdown intro, break, dan durasi yang lebih panjang.',
  },
  'hh:mm:ss:ms': {
    placeholder: 'Contoh: 00:00:10:25',
    message: 'Format HH:mm:ss:ms menampilkan centisecond di dua digit terakhir, cocok untuk race atau esports timer.',
  },
  'mm:ss': {
    placeholder: 'Contoh: 10:00',
    message: 'Format mm:ss cocok untuk round timer, pick/ban, atau countdown singkat.',
  },
  ss: {
    placeholder: 'Contoh: 600',
    message: 'Format ss menampilkan total detik tanpa pemisah, cocok untuk layout yang sangat minimal.',
  },
};

let previewTimeoutId = 0;
let previewLoadTimeoutId = 0;
let draftPersistTimeoutId = 0;
let latestValidUrl = '';
let activeFontIndex = -1;
let lastDraftSnapshot = '';

const STORAGE_KEY = 'timerobs_builder_state_v4';
const DEFAULT_SETTINGS = {
  mode: 'countdown',
  format: 'hh:mm:ss',
  time: '00:10:00',
  end_message: "Time's Up!",
  font: 'Space Grotesk',
  font_size: '88',
  bg_color: '#081120',
  text_color: '#F8FAFC',
  circle_color: '#F8FAFC',
  title_color: '#FDBA74',
  title_style: 'default',
  title_font_size: '20',
  time_animation: 'none',
  transparent: false,
  show_labels: false,
  label_position: 'bottom',
  show_titles: false,
  title_top: 'Starting Soon',
  title_bottom: 'Get ready on stream',
  timer_style: 'plain',
  bold: true,
  italic: false,
  underline: false,
  stroke: false,
  shadow: true,
  title_bold: true,
  title_italic: false,
  title_underline: false,
};

function debouncePreviewUpdate() {
  window.clearTimeout(previewTimeoutId);
  previewTimeoutId = window.setTimeout(updatePreview, 160);
}

function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.min(Math.max(numericValue, min), max);
}

function sanitizeFontName(value) {
  return value.replace(/[<>"]/g, '').trim().slice(0, 80) || DEFAULT_SETTINGS.font;
}

function formatMillisecondsForInput(totalMilliseconds, formatValue) {
  const safeMilliseconds = Math.max(totalMilliseconds, 0);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const centiseconds = Math.floor((safeMilliseconds % 1000) / 10);

  if (formatValue === 'ss') {
    return String(totalSeconds);
  }

  if (formatValue === 'mm:ss') {
    return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  if (formatValue === 'hh:mm:ss:ms') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getReadyMessage() {
  return transparentInput.checked
    ? 'Preview transparan aktif. Checkerboard hanya ada di viewer, bukan di overlay output.'
    : 'Preview aktif. Overlay siap dibuka atau disalin URL-nya.';
}

function parseTimeInput(value) {
  const rawValue = value.trim();

  if (!rawValue) {
    return { isValid: false, message: 'Masukkan waktu awal terlebih dahulu.' };
  }

  if (!/^\d+(?::\d+){0,3}$/.test(rawValue)) {
    return {
      isValid: false,
      message: 'Gunakan angka dengan pemisah titik dua, misalnya 00:10:00 atau 00:00:10:25.',
    };
  }

  const parts = rawValue.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) {
    return { isValid: false, message: 'Nilai waktu hanya boleh berisi angka.' };
  }

  if (parts.length === 4) {
    const [hours, minutes, seconds, centiseconds] = parts;
    if (minutes > 59 || seconds > 59 || centiseconds > 99) {
      return {
        isValid: false,
        message: 'Pada format HH:mm:ss:ms, menit/detik maksimal 59 dan ms maksimal 99.',
      };
    }

    return {
      isValid: true,
      totalMilliseconds:
        ((hours * 3600 + minutes * 60 + seconds) * 1000) + centiseconds * 10,
    };
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (minutes > 59 || seconds > 59) {
      return {
        isValid: false,
        message: 'Pada format HH:mm:ss, menit dan detik harus berada di rentang 0-59.',
      };
    }

    return {
      isValid: true,
      totalMilliseconds: (hours * 3600 + minutes * 60 + seconds) * 1000,
    };
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (seconds > 59) {
      return {
        isValid: false,
        message: 'Pada format mm:ss, detik harus berada di rentang 0-59.',
      };
    }

    return {
      isValid: true,
      totalMilliseconds: (minutes * 60 + seconds) * 1000,
    };
  }

  return {
    isValid: true,
    totalMilliseconds: parts[0] * 1000,
  };
}

function normalizeHexColor(value, fallback) {
  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : fallback;
}

function setStatus(kind, message) {
  statusBadge.className = `badge-pill ${kind}`;
  if (kind === 'good') {
    statusBadge.textContent = 'Ready';
  } else if (kind === 'warn') {
    statusBadge.textContent = 'Needs fix';
  } else {
    statusBadge.textContent = 'Checking';
  }

  statusMessage.textContent = message;
}

function setTimeFieldState(isValid, message) {
  const wrapper = timeInput.closest('.field');
  wrapper.classList.toggle('is-invalid', !isValid);
  timeInput.setAttribute('aria-invalid', isValid ? 'false' : 'true');
  timeHint.textContent = message;
}

function setDraftState(message) {
  draftState.textContent = message;
}

function setPreviewState(kind) {
  previewStage.dataset.previewState = kind;
}

function markPreviewLoading() {
  window.clearTimeout(previewLoadTimeoutId);
  setPreviewState('loading');
  setStatus('neutral', 'Merender preview terbaru...');
  previewLoadTimeoutId = window.setTimeout(() => {
    if (previewStage.dataset.previewState === 'loading') {
      setPreviewState('error');
      setStatus(
        'warn',
        'Preview belum merespons. Coba Refresh preview atau buka overlay langsung di tab baru.',
      );
    }
  }, 4000);
}

function markPreviewReady() {
  window.clearTimeout(previewLoadTimeoutId);
  setPreviewState('ready');
  setStatus('good', getReadyMessage());
}

function markPreviewError(message) {
  window.clearTimeout(previewLoadTimeoutId);
  setPreviewState('error');
  setStatus('warn', message);
}

function captureFormState() {
  return {
    mode: modeInput.value,
    format: formatInput.value,
    time: timeInput.value.trim(),
    end_message: endMessageInput.value,
    font: sanitizeFontName(fontInput.value),
    font_size: String(clampNumber(fontSizeInput.value, 20, 180, 88)),
    bg_color: normalizeHexColor(bgColorTextInput.value, DEFAULT_SETTINGS.bg_color),
    text_color: normalizeHexColor(textColorTextInput.value, DEFAULT_SETTINGS.text_color),
    circle_color: normalizeHexColor(circleColorTextInput.value, DEFAULT_SETTINGS.circle_color),
    title_color: normalizeHexColor(titleColorTextInput.value, DEFAULT_SETTINGS.title_color),
    title_style: titleStyleInput.value,
    title_font_size: String(clampNumber(titleFontSizeInput.value, 14, 72, 20)),
    time_animation: timeAnimationInput.value,
    transparent: transparentInput.checked,
    show_labels: showLabelsInput.checked,
    label_position: labelPositionInput.value,
    show_titles: showTitlesInput.checked,
    title_top: titleTopInput.value.trim().slice(0, 80),
    title_bottom: titleBottomInput.value.trim().slice(0, 80),
    timer_style: timerStyleInput.value,
    bold: document.getElementById('bold').checked,
    italic: document.getElementById('italic').checked,
    underline: document.getElementById('underline').checked,
    stroke: document.getElementById('stroke').checked,
    shadow: document.getElementById('shadow').checked,
    title_bold: document.getElementById('title_bold').checked,
    title_italic: document.getElementById('title_italic').checked,
    title_underline: document.getElementById('title_underline').checked,
  };
}

function persistDraft() {
  try {
    const nextSnapshot = JSON.stringify(captureFormState());
    if (nextSnapshot === lastDraftSnapshot) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, nextSnapshot);
    lastDraftSnapshot = nextSnapshot;
    setDraftState('Draft tersimpan otomatis di browser ini.');
  } catch (error) {
    setDraftState('Draft tidak bisa disimpan di browser ini.');
    console.error('Failed to persist builder draft:', error);
  }
}

function scheduleDraftPersist() {
  window.clearTimeout(draftPersistTimeoutId);
  draftPersistTimeoutId = window.setTimeout(persistDraft, 220);
}

function applySettings(settings) {
  modeInput.value = settings.mode;
  formatInput.value = settings.format;
  timeInput.value = settings.time;
  endMessageInput.value = settings.end_message;
  fontInput.value = sanitizeFontName(settings.font);
  fontSizeInput.value = String(clampNumber(settings.font_size, 20, 180, 88));
  fontSizeRange.value = fontSizeInput.value;
  bgColorInput.value = normalizeHexColor(settings.bg_color, DEFAULT_SETTINGS.bg_color);
  bgColorTextInput.value = bgColorInput.value;
  textColorInput.value = normalizeHexColor(settings.text_color, DEFAULT_SETTINGS.text_color);
  textColorTextInput.value = textColorInput.value;
  circleColorInput.value = normalizeHexColor(settings.circle_color, DEFAULT_SETTINGS.circle_color);
  circleColorTextInput.value = circleColorInput.value;
  titleColorInput.value = normalizeHexColor(settings.title_color, DEFAULT_SETTINGS.title_color);
  titleColorTextInput.value = titleColorInput.value;
  titleStyleInput.value = settings.title_style;
  titleFontSizeInput.value = String(clampNumber(settings.title_font_size, 14, 72, 20));
  titleFontSizeRange.value = titleFontSizeInput.value;
  timeAnimationInput.value = settings.time_animation;
  transparentInput.checked = Boolean(settings.transparent);
  showLabelsInput.checked = Boolean(settings.show_labels);
  labelPositionInput.value = settings.label_position;
  showTitlesInput.checked = Boolean(settings.show_titles);
  titleTopInput.value = settings.title_top;
  titleBottomInput.value = settings.title_bottom;
  document.getElementById('bold').checked = Boolean(settings.bold);
  document.getElementById('italic').checked = Boolean(settings.italic);
  document.getElementById('underline').checked = Boolean(settings.underline);
  document.getElementById('stroke').checked = Boolean(settings.stroke);
  document.getElementById('shadow').checked = Boolean(settings.shadow);
  document.getElementById('title_bold').checked = Boolean(settings.title_bold);
  document.getElementById('title_italic').checked = Boolean(settings.title_italic);
  document.getElementById('title_underline').checked = Boolean(settings.title_underline);
  applyStyleSelection(settings.timer_style);
}

function restoreDraft() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      setDraftState('Draft tersimpan otomatis di browser ini.');
      return;
    }

    const savedSettings = JSON.parse(rawValue);
    lastDraftSnapshot = JSON.stringify({ ...DEFAULT_SETTINGS, ...savedSettings });
    applySettings({ ...DEFAULT_SETTINGS, ...savedSettings });
    setDraftState('Draft terakhir berhasil dipulihkan.');
  } catch (error) {
    setDraftState('Draft sebelumnya rusak dan dilewati.');
    console.error('Failed to restore builder draft:', error);
  }
}

function resetToDefaults() {
  applySettings(DEFAULT_SETTINGS);
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    lastDraftSnapshot = '';
  } catch (error) {
    console.error('Failed to clear builder draft:', error);
  }
  setDraftState('Semua setting kembali ke default.');
  updateFormatGuidance();
  updateFeatureVisibility();
  syncToggleCards();
  updatePreview();
}

function syncToggleCards() {
  [...toggleInputs, ...titleToggleInputs].forEach((input) => {
    input.closest('.toggle-card')?.classList.toggle('is-active', input.checked);
  });
}

function applyStyleSelection(styleName) {
  timerStyleInput.value = styleName;
  if (styleName === 'card') {
    timeAnimationInput.value = 'flip';
  } else if (timeAnimationInput.value === 'flip') {
    timeAnimationInput.value = 'none';
  }
  styleButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.style === styleName);
  });
}

function updateFormatGuidance() {
  const guide = formatGuides[formatInput.value] || formatGuides['hh:mm:ss'];
  timeInput.placeholder = guide.placeholder;
  timeHint.textContent = guide.message;
}

function updateFeatureVisibility() {
  const isCountup = modeInput.value === 'countup';
  const isCardStyle = timerStyleInput.value === 'card';
  const endMessageField = endMessageInput.closest('.field');
  const titleFontField = titleFontSizeInput.closest('.field');
  const circleColorField = circleColorInput.closest('.field');
  const titleColorField = titleColorInput.closest('.field');
  const titleStyleField = titleStyleInput.closest('.field');
  const timeAnimationField = timeAnimationInput.closest('.field');
  const areTitlesEnabled = showTitlesInput.checked;
  const isCircleStyle = timerStyleInput.value === 'circle';

  endMessageInput.disabled = isCountup;
  endMessageField.classList.toggle('is-disabled', isCountup);

  circleColorInput.disabled = !isCircleStyle;
  circleColorTextInput.disabled = !isCircleStyle;
  circleColorField.classList.toggle('is-disabled', !isCircleStyle);

  labelsSettings.hidden = !showLabelsInput.checked;
  labelPositionInput.disabled = !showLabelsInput.checked;

  titlesSettings.hidden = !areTitlesEnabled;
  titleTopInput.disabled = !areTitlesEnabled;
  titleBottomInput.disabled = !areTitlesEnabled;
  titleFontSizeInput.disabled = !areTitlesEnabled;
  titleFontSizeRange.disabled = !areTitlesEnabled;
  titleColorInput.disabled = !areTitlesEnabled;
  titleColorTextInput.disabled = !areTitlesEnabled;
  titleStyleInput.disabled = !areTitlesEnabled;
  titleFontField.classList.toggle('is-disabled', !areTitlesEnabled);
  titleColorField.classList.toggle('is-disabled', !areTitlesEnabled);
  titleStyleField.classList.toggle('is-disabled', !areTitlesEnabled);
  titleToggleInputs.forEach((input) => {
    input.disabled = !areTitlesEnabled;
    input.closest('.toggle-card')?.classList.toggle('is-disabled', !areTitlesEnabled);
  });

  if (isCardStyle) {
    timeAnimationInput.value = 'flip';
  } else if (timeAnimationInput.value === 'flip') {
    timeAnimationInput.value = 'none';
  }

  timeAnimationInput.disabled = isCardStyle;
  timeAnimationField.classList.toggle('is-disabled', isCardStyle);
  timeAnimationHint.textContent = isCardStyle
    ? 'Style card memakai flip bawaan dan tidak bisa diganti agar efek board tetap konsisten.'
    : 'Gunakan animasi secukupnya agar timer tetap terbaca di stream.';

  previewStage.classList.toggle('is-transparent', transparentInput.checked);
}

function getContrastTone(hexColor) {
  const normalized = normalizeHexColor(hexColor, '#F8FAFC');
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance >= 0.55 ? 'dark' : 'light';
}

function syncColorInputs(source, target) {
  source.addEventListener('input', () => {
    target.value = source.value.toUpperCase();
    debouncePreviewUpdate();
  });

  target.addEventListener('input', () => {
    const normalizedValue = normalizeHexColor(target.value, source.value);
    if (normalizedValue === target.value.trim().toUpperCase()) {
      source.value = normalizedValue;
    }
  });

  target.addEventListener('blur', () => {
    const normalizedValue = normalizeHexColor(target.value, source.value);
    source.value = normalizedValue;
    target.value = normalizedValue;
    debouncePreviewUpdate();
  });
}

function syncFontSizeInputs(source, target) {
  const syncValue = (value) => {
    const min = Number(source.min || target.min || 0);
    const max = Number(source.max || target.max || 999);
    const fallback = Number(source.value || target.value || min);
    const nextValue = String(clampNumber(value, min, max, fallback));
    source.value = nextValue;
    target.value = nextValue;
    debouncePreviewUpdate();
  };

  source.addEventListener('input', () => syncValue(source.value));
  target.addEventListener('input', () => syncValue(target.value));
}

function setActiveFontOption(index) {
  const options = [...fontDropdown.querySelectorAll('.dropdown-item')];
  if (!options.length) {
    activeFontIndex = -1;
    return;
  }

  activeFontIndex = Math.min(Math.max(index, 0), options.length - 1);
  options.forEach((option, optionIndex) => {
    const isActive = optionIndex === activeFontIndex;
    option.setAttribute('aria-selected', isActive ? 'true' : 'false');
    if (isActive) {
      option.scrollIntoView({ block: 'nearest' });
    }
  });
}

function closeFontDropdown() {
  fontDropdown.hidden = true;
  fontInput.setAttribute('aria-expanded', 'false');
  activeFontIndex = -1;
}

function selectFontOption(fontName) {
  fontInput.value = sanitizeFontName(fontName);
  closeFontDropdown();
  debouncePreviewUpdate();
}

function populateFontDropdown(query = '') {
  const normalizedQuery = query.trim().toLowerCase();
  const matchedFonts = fontSuggestions.filter((font) =>
    font.toLowerCase().includes(normalizedQuery),
  );

  fontDropdown.innerHTML = '';

  if (matchedFonts.length === 0) {
    closeFontDropdown();
    return;
  }

  matchedFonts.forEach((fontName, index) => {
    const option = document.createElement('li');
    option.className = 'dropdown-item';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    option.textContent = fontName;
    option.addEventListener('mousedown', (event) => {
      event.preventDefault();
      selectFontOption(fontName);
    });
    fontDropdown.appendChild(option);
  });

  fontDropdown.hidden = false;
  fontInput.setAttribute('aria-expanded', 'true');
  setActiveFontOption(0);
}

function normalizeTimeInputValue() {
  const parsedTime = parseTimeInput(timeInput.value);
  if (!parsedTime.isValid) {
    return false;
  }

  timeInput.value = formatMillisecondsForInput(parsedTime.totalMilliseconds, formatInput.value);
  return true;
}

function buildDisplayUrl({ preview = false } = {}) {
  const parsedTime = parseTimeInput(timeInput.value);
  if (!parsedTime.isValid) {
    return { isValid: false, message: parsedTime.message };
  }

  const fontSize = clampNumber(fontSizeInput.value, 20, 180, 88);
  const titleFontSize = clampNumber(titleFontSizeInput.value, 14, 72, 20);
  const safeFont = sanitizeFontName(fontInput.value);
  const safeEndMessage = endMessageInput.value.trim().slice(0, 120) || "Time's Up!";
  const safeTitleTop = titleTopInput.value.trim().slice(0, 80);
  const safeTitleBottom = titleBottomInput.value.trim().slice(0, 80);
  const effectiveTimeAnimation =
    timerStyleInput.value === 'card'
      ? 'flip'
      : timeAnimationInput.value === 'flip'
        ? 'none'
        : timeAnimationInput.value;

  const backgroundColor = normalizeHexColor(bgColorTextInput.value, '#081120');
  const textColor = normalizeHexColor(textColorTextInput.value, '#F8FAFC');
  const circleColor = normalizeHexColor(circleColorTextInput.value, '#F8FAFC');
  const titleColor = normalizeHexColor(titleColorTextInput.value, '#FDBA74');

  fontInput.value = safeFont;
  fontSizeInput.value = String(fontSize);
  fontSizeRange.value = String(fontSize);
  titleFontSizeInput.value = String(titleFontSize);
  titleFontSizeRange.value = String(titleFontSize);
  bgColorInput.value = backgroundColor;
  bgColorTextInput.value = backgroundColor;
  textColorInput.value = textColor;
  textColorTextInput.value = textColor;
  circleColorInput.value = circleColor;
  circleColorTextInput.value = circleColor;
  titleColorInput.value = titleColor;
  titleColorTextInput.value = titleColor;
  endMessageInput.value = safeEndMessage;
  titleTopInput.value = safeTitleTop;
  titleBottomInput.value = safeTitleBottom;

  const url = new URL('display.html', window.location.href);
  url.searchParams.set('mode', modeInput.value);
  url.searchParams.set('time', timeInput.value.trim());
  url.searchParams.set('format', formatInput.value);
  url.searchParams.set('font', safeFont);
  url.searchParams.set('font_size', String(fontSize));
  url.searchParams.set('bg_color', backgroundColor);
  url.searchParams.set('text_color', textColor);
  url.searchParams.set('circle_color', circleColor);
  url.searchParams.set('title_color', titleColor);
  url.searchParams.set('title_font_size', String(titleFontSize));
  url.searchParams.set('transparent', transparentInput.checked ? '1' : '0');
  url.searchParams.set('end_message', safeEndMessage);
  url.searchParams.set('timer_style', timerStyleInput.value);
  url.searchParams.set('title_style', titleStyleInput.value);
  url.searchParams.set('time_animation', effectiveTimeAnimation);
  url.searchParams.set('bold', document.getElementById('bold').checked ? '1' : '0');
  url.searchParams.set('italic', document.getElementById('italic').checked ? '1' : '0');
  url.searchParams.set('underline', document.getElementById('underline').checked ? '1' : '0');
  url.searchParams.set('stroke', document.getElementById('stroke').checked ? '1' : '0');
  url.searchParams.set('shadow', document.getElementById('shadow').checked ? '1' : '0');
  url.searchParams.set('show_labels', showLabelsInput.checked ? '1' : '0');
  url.searchParams.set('label_position', labelPositionInput.value);
  url.searchParams.set('show_titles', showTitlesInput.checked ? '1' : '0');
  url.searchParams.set('title_top', safeTitleTop);
  url.searchParams.set('title_bottom', safeTitleBottom);
  url.searchParams.set('title_bold', document.getElementById('title_bold').checked ? '1' : '0');
  url.searchParams.set('title_italic', document.getElementById('title_italic').checked ? '1' : '0');
  url.searchParams.set(
    'title_underline',
    document.getElementById('title_underline').checked ? '1' : '0',
  );

  if (preview) {
    url.searchParams.set('preview', '1');
  }

  return { isValid: true, url: url.toString() };
}

function updatePreview({ forceReload = false } = {}) {
  updateFeatureVisibility();
  previewStage.dataset.boardTone = getContrastTone(textColorTextInput.value);
  scheduleDraftPersist();

  const previewResult = buildDisplayUrl({ preview: true });
  const outputResult = buildDisplayUrl();

  if (!previewResult.isValid || !outputResult.isValid) {
    const message = previewResult.message || outputResult.message;
    latestValidUrl = '';
    generatedUrl.textContent = 'Perbaiki input agar URL bisa dibuat.';
    openOutputButton.disabled = true;
    copyUrlButton.disabled = true;
    markPreviewError(message);
    setTimeFieldState(false, message);
    return;
  }

  const nextPreviewUrl = previewResult.url;
  const nextOutputUrl = outputResult.url;

  if (forceReload || previewFrame.dataset.previewUrl !== nextPreviewUrl) {
    previewFrame.dataset.previewUrl = nextPreviewUrl;
    markPreviewLoading();
    if (forceReload) {
      previewFrame.removeAttribute('src');
      window.requestAnimationFrame(() => {
        previewFrame.src = nextPreviewUrl;
      });
    } else {
      previewFrame.src = nextPreviewUrl;
    }
  }

  latestValidUrl = nextOutputUrl;
  generatedUrl.textContent = nextOutputUrl;
  openOutputButton.disabled = false;
  copyUrlButton.disabled = false;

  if (previewStage.dataset.previewState !== 'loading') {
    markPreviewReady();
  }
  setTimeFieldState(true, formatGuides[formatInput.value].message);
}

async function copyGeneratedUrl() {
  if (!latestValidUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(latestValidUrl);
    setStatus('good', 'URL berhasil disalin. Tinggal paste ke Browser Source OBS.');
  } catch (error) {
    const fallbackInput = document.createElement('textarea');
    fallbackInput.value = latestValidUrl;
    document.body.appendChild(fallbackInput);
    fallbackInput.select();
    document.execCommand('copy');
    document.body.removeChild(fallbackInput);
    setStatus('good', 'URL berhasil disalin lewat fallback clipboard.');
    console.error('Clipboard API failed, fallback used:', error);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = buildDisplayUrl();

  if (!result.isValid) {
    updatePreview();
    return;
  }

  window.open(result.url, '_blank', 'noopener,noreferrer');
});

previewFrame.addEventListener('load', () => {
  if (
    previewFrame.dataset.previewUrl &&
    previewFrame.getAttribute('src') === previewFrame.dataset.previewUrl
  ) {
    markPreviewReady();
  }
});

previewFrame.addEventListener('error', () => {
  markPreviewError('Preview gagal dimuat. Coba Refresh preview atau buka overlay langsung.');
});

modeInput.addEventListener('change', () => {
  updateFeatureVisibility();
  debouncePreviewUpdate();
});

formatInput.addEventListener('change', () => {
  normalizeTimeInputValue();
  updateFormatGuidance();
  debouncePreviewUpdate();
});

timeInput.addEventListener('input', debouncePreviewUpdate);
timeInput.addEventListener('blur', () => {
  if (normalizeTimeInputValue()) {
    updatePreview();
  }
});
endMessageInput.addEventListener('input', debouncePreviewUpdate);
labelPositionInput.addEventListener('change', debouncePreviewUpdate);
titleStyleInput.addEventListener('change', debouncePreviewUpdate);
titleFontSizeInput.addEventListener('input', debouncePreviewUpdate);
timeAnimationInput.addEventListener('change', debouncePreviewUpdate);
titleTopInput.addEventListener('input', debouncePreviewUpdate);
titleBottomInput.addEventListener('input', debouncePreviewUpdate);
transparentInput.addEventListener('change', debouncePreviewUpdate);
showLabelsInput.addEventListener('change', debouncePreviewUpdate);
showTitlesInput.addEventListener('change', debouncePreviewUpdate);
copyUrlButton.addEventListener('click', copyGeneratedUrl);
resetSettingsButton.addEventListener('click', resetToDefaults);
refreshPreviewButton.addEventListener('click', () => updatePreview({ forceReload: true }));

toggleInputs.forEach((input) => {
  input.addEventListener('change', () => {
    syncToggleCards();
    debouncePreviewUpdate();
  });
});

titleToggleInputs.forEach((input) => {
  input.addEventListener('change', () => {
    syncToggleCards();
    debouncePreviewUpdate();
  });
});

fontInput.addEventListener('input', () => {
  populateFontDropdown(fontInput.value);
  debouncePreviewUpdate();
});

fontInput.addEventListener('focus', () => populateFontDropdown(fontInput.value));
fontInput.addEventListener('blur', () => {
  fontInput.value = sanitizeFontName(fontInput.value);
});
fontInput.addEventListener('keydown', (event) => {
  const options = [...fontDropdown.querySelectorAll('.dropdown-item')];
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (fontDropdown.hidden) {
      populateFontDropdown(fontInput.value);
      return;
    }

    setActiveFontOption(activeFontIndex + 1);
    return;
  }

  if (event.key === 'ArrowUp' && !fontDropdown.hidden) {
    event.preventDefault();
    setActiveFontOption(activeFontIndex - 1);
    return;
  }

  if (event.key === 'Enter' && !fontDropdown.hidden && options[activeFontIndex]) {
    event.preventDefault();
    selectFontOption(options[activeFontIndex].textContent || DEFAULT_SETTINGS.font);
    return;
  }

  if (event.key === 'Escape' && !fontDropdown.hidden) {
    event.preventDefault();
    closeFontDropdown();
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.dropdown-shell')) {
    closeFontDropdown();
  }
});

fontDropdown.addEventListener('mousedown', (event) => {
  event.preventDefault();
});

styleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyStyleSelection(button.dataset.style || 'plain');
    debouncePreviewUpdate();
  });
});

fontPickButtons.forEach((button) => {
  button.addEventListener('click', () => {
    fontInput.value = button.dataset.font || 'Space Grotesk';
    debouncePreviewUpdate();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextTime = button.dataset.time || '00:10:00';
    timeInput.value = nextTime;

    if (nextTime.split(':').length === 4) {
      formatInput.value = 'hh:mm:ss:ms';
    }

    if (nextTime === '00:00:00') {
      modeInput.value = 'countup';
    } else if (modeInput.value !== 'countdown') {
      modeInput.value = 'countdown';
    }

    updateFormatGuidance();
    updateFeatureVisibility();
    debouncePreviewUpdate();
  });
});

syncFontSizeInputs(fontSizeInput, fontSizeRange);
syncFontSizeInputs(titleFontSizeInput, titleFontSizeRange);
syncColorInputs(bgColorInput, bgColorTextInput);
syncColorInputs(textColorInput, textColorTextInput);
syncColorInputs(circleColorInput, circleColorTextInput);
syncColorInputs(titleColorInput, titleColorTextInput);

closeFontDropdown();
restoreDraft();
applyStyleSelection(timerStyleInput.value);
syncToggleCards();
updateFormatGuidance();
updateFeatureVisibility();
updatePreview();
