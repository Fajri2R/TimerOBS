const params = new URLSearchParams(window.location.search);

const overlayElement = document.getElementById('timer-overlay');
const timerValues = document.getElementById('timer-values');
const endMessageElement = document.getElementById('end-message');
const titleTopElement = document.getElementById('title-top');
const titleBottomElement = document.getElementById('title-bottom');
const circleProgress = document.getElementById('circle-progress');
const circleProgressMarker = document.getElementById('circle-progress-marker');
const barStyleShell = document.getElementById('bar-style-shell');
const barProgressFill = document.getElementById('bar-progress-fill');
const barProgressThumb = document.getElementById('bar-progress-thumb');
const ringGlow = document.getElementById('ring-glow');
const ringTail = document.getElementById('ring-tail');
const ringFill = document.getElementById('ring-fill');

const groups = {
  hours: document.getElementById('group-hours'),
  minutes: document.getElementById('group-minutes'),
  seconds: document.getElementById('group-seconds'),
  milliseconds: document.getElementById('group-milliseconds'),
};

const values = {
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  milliseconds: document.getElementById('milliseconds'),
};

const dividers = {
  hours: document.getElementById('divider-hours'),
  minutes: document.getElementById('divider-minutes'),
  milliseconds: document.getElementById('divider-milliseconds'),
};

const labelText = {
  hours: 'hours',
  minutes: 'minutes',
  seconds: 'seconds',
  milliseconds: 'ms',
};

const mode = params.get('mode') || 'countdown';
const timeInput = params.get('time') || '00:10:00';
const format = params.get('format') || 'hh:mm:ss';
const font = params.get('font') || 'Space Grotesk';
const backgroundColor = params.get('bg_color') || '#081120';
const textColor = params.get('text_color') || '#F8FAFC';
const titleColor = params.get('title_color') || '#FDBA74';
const titleFontSize = Math.max(Number(params.get('title_font_size')) || 20, 14);
const transparent = ['1', 'true', 'yes', 'on'].includes(
  (params.get('transparent') || '').toLowerCase(),
);
const endMessage = params.get('end_message') || "Time's Up!";
const fontSize = Math.max(Number(params.get('font_size')) || 88, 20);
const timerStyle = params.get('timer_style') || 'plain';
const titleStyle = params.get('title_style') || 'default';
const requestedTimeAnimation = params.get('time_animation') || 'none';
const timeAnimation =
  timerStyle === 'card'
    ? 'flip'
    : requestedTimeAnimation === 'flip'
      ? 'none'
      : requestedTimeAnimation;
const isBold = params.get('bold') !== '0';
const isItalic = params.get('italic') === '1';
const isUnderline = params.get('underline') === '1';
const isStroke = params.get('stroke') === '1';
const isShadow = params.get('shadow') !== '0';
const showLabels = params.get('show_labels') === '1';
const labelPosition = params.get('label_position') === 'top' ? 'top' : 'bottom';
const showTitles = params.get('show_titles') === '1';
const titleTop = params.get('title_top') || '';
const titleBottom = params.get('title_bottom') || '';
const isTitleBold = params.get('title_bold') !== '0';
const isTitleItalic = params.get('title_italic') === '1';
const isTitleUnderline = params.get('title_underline') === '1';
const isPreview = params.get('preview') === '1';

const visibleUnitsMap = {
  'hh:mm:ss': ['hours', 'minutes', 'seconds'],
  'hh:mm:ss:ms': ['hours', 'minutes', 'seconds', 'milliseconds'],
  'mm:ss': ['minutes', 'seconds'],
  ss: ['seconds'],
};

const visibleUnits = visibleUnitsMap[format] || visibleUnitsMap['hh:mm:ss'];
const initialMilliseconds = parseTimeInput(timeInput);
const ringRadius = 54;
const ringCircumference = 2 * Math.PI * ringRadius;
const loadedFonts = new Set();

let previewObserver = null;
let timerTickId = 0;
let previewScaleFrameId = 0;
let previewScaleTimeoutIds = [];
let activeProgressRatio = 0;
let digitMeasureElement = null;

let hasEnded = false;
ringGlow.style.strokeDasharray = `${ringCircumference}`;
ringTail.style.strokeDasharray = `${ringCircumference}`;
ringFill.style.strokeDasharray = `${ringCircumference}`;

function getProgressRatio(currentMilliseconds) {
  if (mode === 'countdown' && initialMilliseconds > 0) {
    return Math.min(
      Math.max((initialMilliseconds - currentMilliseconds) / initialMilliseconds, 0),
      1,
    );
  }

  const cycle = Math.max(initialMilliseconds || 0, 60000);
  return ((currentMilliseconds - initialMilliseconds) % cycle + cycle) % cycle / cycle;
}

function parseTimeInput(value) {
  const parts = value
    .split(':')
    .map((part) => Number(part))
    .filter((part) => !Number.isNaN(part));

  if (parts.length === 4) {
    return (((parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000) + parts[3] * 10);
  }

  if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }

  if (parts.length === 2) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }

  return (parts[0] || 0) * 1000;
}

function loadFont(fontFamily) {
  const genericFonts = /^(arial|georgia|times new roman|courier new|serif|sans-serif|monospace)$/i;
  const primaryFont = fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');

  if (!primaryFont || genericFonts.test(primaryFont) || loadedFonts.has(primaryFont)) {
    return;
  }

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = `https://fonts.googleapis.com/css2?family=${primaryFont.replace(/\s+/g, '+')}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(fontLink);
  loadedFonts.add(primaryFont);
}

function applyDisplayStyles() {
  document.documentElement.style.setProperty(
    '--bg-color',
    transparent ? 'transparent' : backgroundColor,
  );
  document.documentElement.style.setProperty('--text-color', textColor);
  document.documentElement.style.setProperty('--title-color', titleColor);
  document.documentElement.style.setProperty('--title-font-size', `${titleFontSize}px`);
  document.documentElement.style.setProperty('--title-weight', isTitleBold ? '800' : '600');
  document.documentElement.style.setProperty(
    '--title-font-style',
    isTitleItalic ? 'italic' : 'normal',
  );
  document.documentElement.style.setProperty(
    '--title-decoration',
    isTitleUnderline ? 'underline' : 'none',
  );
  document.documentElement.style.setProperty('--font-family', font);
  document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
  document.documentElement.style.setProperty(
    '--value-weight',
    isBold ? '800' : '600',
  );
  document.documentElement.style.setProperty(
    '--value-style',
    isItalic ? 'italic' : 'normal',
  );
  document.documentElement.style.setProperty(
    '--value-decoration',
    isUnderline ? 'underline' : 'none',
  );
  document.documentElement.style.setProperty(
    '--stroke-size',
    isStroke ? `${Math.max(fontSize * 0.035, 1.4)}px` : '0px',
  );
  document.documentElement.style.setProperty(
    '--shadow-filter',
    isShadow ? 'drop-shadow(0 14px 22px rgba(2, 6, 23, 0.45))' : 'none',
  );

  document.body.dataset.style = timerStyle;
  document.body.dataset.titleStyle = titleStyle;
  document.body.dataset.timeAnimation = timeAnimation;
  document.body.dataset.preview = isPreview ? 'true' : 'false';
  document.body.dataset.showLabels = showLabels ? 'true' : 'false';
  document.body.dataset.labelPosition = labelPosition;
  document.body.dataset.showTitles = showTitles ? 'true' : 'false';
  document.body.dataset.underline = isUnderline ? 'true' : 'false';
  circleProgress.hidden = timerStyle !== 'circle';
  circleProgressMarker.hidden = timerStyle !== 'circle';
  barStyleShell.hidden = timerStyle !== 'bar';

  titleTopElement.textContent = titleTop;
  titleBottomElement.textContent = titleBottom;
  titleTopElement.style.display = '';
  titleBottomElement.style.display = '';

  if (showTitles && !titleTop.trim()) {
    titleTopElement.style.display = 'none';
  }

  if (showTitles && !titleBottom.trim()) {
    titleBottomElement.style.display = 'none';
  }

  if (!showTitles) {
    titleTopElement.style.display = 'none';
    titleBottomElement.style.display = 'none';
  }

  loadFont(font);
}

function renderLabels() {
  Object.entries(groups).forEach(([unit, group]) => {
    group.querySelectorAll('.segment-label').forEach((label) => {
      label.textContent = labelText[unit];
    });
  });
}

function applyUnitVisibility() {
  const visibleSet = new Set(visibleUnits);

  Object.entries(groups).forEach(([unit, group]) => {
    group.style.display = visibleSet.has(unit) ? 'flex' : 'none';
  });

  dividers.hours.style.display =
    visibleSet.has('hours') && visibleSet.has('minutes') ? 'inline-block' : 'none';
  dividers.minutes.style.display =
    visibleSet.has('minutes') && visibleSet.has('seconds') ? 'inline-block' : 'none';
  dividers.milliseconds.style.display =
    visibleSet.has('seconds') && visibleSet.has('milliseconds')
      ? 'inline-block'
      : 'none';
}

function formatTime(totalMilliseconds) {
  const safeMilliseconds = Math.max(totalMilliseconds, 0);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const centiseconds = Math.floor((safeMilliseconds % 1000) / 10);

  if (format === 'ss') {
    return {
      seconds: String(totalSeconds).padStart(2, '0'),
    };
  }

  if (format === 'mm:ss') {
    return {
      minutes: String(totalMinutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  }

  if (format === 'hh:mm:ss:ms') {
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(centiseconds).padStart(2, '0'),
    };
  }

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function updateTimerDisplay(totalMilliseconds) {
  const formatted = formatTime(totalMilliseconds);

  timerValues.hidden = false;
  endMessageElement.hidden = true;

  Object.entries(values).forEach(([unit, element]) => {
    const nextValue = formatted[unit] ?? '00';
    const previousValue = element.dataset.value || element.textContent || '00';
    if (previousValue !== nextValue) {
      renderDigitSpans(element, nextValue);
      animateDigit(element, unit, previousValue, nextValue);
      element.dataset.value = nextValue;
    } else if (!element.children.length) {
      renderDigitSpans(element, nextValue);
      element.dataset.value = nextValue;
    }
  });
}

function renderDigitSpans(element, value) {
  const digits = value.split('');

  if (element.children.length !== digits.length) {
    element.innerHTML = digits
      .map((digit) => `<span class="digit-char">${digit}</span>`)
      .join('');
  }

  [...element.children].forEach((child, index) => {
    if (typeof child._rollerFinalize === 'function') {
      child._rollerFinalize();
    }
    child.textContent = digits[index] ?? '';
    child.classList.remove('is-roller-slot', 'is-roller-up', 'is-roller-down');
    child.style.width = '';
    child.style.minWidth = '';
    child._rollerFinalize = null;
    delete child.dataset.rollerPrev;
    delete child.dataset.rollerNext;
  });
}

function getDigitMeasureElement() {
  if (digitMeasureElement) {
    return digitMeasureElement;
  }

  digitMeasureElement = document.createElement('span');
  digitMeasureElement.style.position = 'fixed';
  digitMeasureElement.style.left = '-9999px';
  digitMeasureElement.style.top = '-9999px';
  digitMeasureElement.style.visibility = 'hidden';
  digitMeasureElement.style.pointerEvents = 'none';
  digitMeasureElement.style.whiteSpace = 'nowrap';
  document.body.appendChild(digitMeasureElement);
  return digitMeasureElement;
}

function measureDigitWidth(slot, previousDigit, nextDigit) {
  const measurer = getDigitMeasureElement();
  const computed = window.getComputedStyle(slot);
  measurer.style.fontFamily = computed.fontFamily;
  measurer.style.fontSize = computed.fontSize;
  measurer.style.fontWeight = computed.fontWeight;
  measurer.style.fontStyle = computed.fontStyle;
  measurer.style.letterSpacing = computed.letterSpacing;
  measurer.style.textTransform = computed.textTransform;
  measurer.style.fontVariantNumeric = computed.fontVariantNumeric;
  measurer.style.fontFeatureSettings = computed.fontFeatureSettings;

  measurer.textContent = previousDigit;
  const previousWidth = measurer.getBoundingClientRect().width;
  measurer.textContent = nextDigit;
  const nextWidth = measurer.getBoundingClientRect().width;
  return Math.ceil(Math.max(previousWidth, nextWidth) + 4);
}

function getRollerAnimatedIndex(previousValue, nextValue) {
  const blockerDigit = mode === 'countdown' ? '0' : '9';
  const changedIndexes = previousValue
    .split('')
    .map((digit, index) => (digit !== nextValue[index] ? index : -1))
    .filter((index) => index >= 0);

  if (changedIndexes.length === 0) {
    return -1;
  }

  for (let index = previousValue.length - 1; index >= 0; index -= 1) {
    if (changedIndexes.includes(index) && previousValue[index] !== blockerDigit) {
      return index;
    }
  }

  return changedIndexes[0];
}

function runRollerAnimation(slot, previousDigit, nextDigit, direction) {
  if (typeof slot._rollerFinalize === 'function') {
    slot._rollerFinalize();
  }

  if (previousDigit === nextDigit) {
    slot.textContent = nextDigit;
    slot.classList.remove('is-roller-slot');
    slot.style.width = '';
    slot.style.minWidth = '';
    return;
  }

  const width = measureDigitWidth(slot, previousDigit, nextDigit);
  const cellsMarkup =
    direction === 'down'
      ? `
        <span class="roller-cell">${nextDigit}</span>
        <span class="roller-cell">${previousDigit}</span>
      `
      : `
        <span class="roller-cell">${previousDigit}</span>
        <span class="roller-cell">${nextDigit}</span>
      `;

  slot.classList.remove('is-roller-up', 'is-roller-down');
  slot.classList.add('is-roller-slot');
  slot.style.width = `${width}px`;
  slot.style.minWidth = `${width}px`;
  slot.innerHTML = `
    <span class="roller-viewport" aria-hidden="true">
      <span class="roller-track ${direction === 'down' ? 'roller-track-down' : 'roller-track-up'}">
        ${cellsMarkup}
      </span>
    </span>
  `;

  const track = slot.querySelector('.roller-track');
  if (!track) {
    slot.textContent = nextDigit;
    slot.classList.remove('is-roller-slot');
    slot.style.width = '';
    slot.style.minWidth = '';
    return;
  }

  const finalize = () => {
    slot.textContent = nextDigit;
    slot.classList.remove('is-roller-slot');
    slot.style.width = '';
    slot.style.minWidth = '';
    slot._rollerFinalize = null;
  };

  slot._rollerFinalize = finalize;
  track.addEventListener('animationend', finalize, { once: true });
}

function animateDigit(element, unit, previousValue, nextValue) {
  if (unit === 'milliseconds') {
    return;
  }

  if (timeAnimation === 'roller') {
    const animatedIndex = getRollerAnimatedIndex(previousValue, nextValue);
    if (animatedIndex < 0) {
      return;
    }

    const digitSpans = [...element.querySelectorAll('.digit-char')];
    const targetDigit = digitSpans[animatedIndex];
    if (!targetDigit) {
      return;
    }

    runRollerAnimation(
      targetDigit,
      previousValue[animatedIndex] ?? '',
      nextValue[animatedIndex] ?? '',
      mode === 'countdown' ? 'down' : 'up',
    );
    return;
  }

  if (timeAnimation === 'slide-up') {
    element.classList.remove('is-slide-up');
    void element.offsetWidth;
    element.classList.add('is-slide-up');
    return;
  }

  if (timeAnimation === 'slide-left') {
    element.classList.remove('is-slide-left');
    void element.offsetWidth;
    element.classList.add('is-slide-left');
    return;
  }

  if (timeAnimation === 'flip') {
    if (timerStyle === 'card') {
      const timeGroup = element.closest('.time-group');
      if (timeGroup) {
        timeGroup.classList.remove('is-flip-card');
        void timeGroup.offsetWidth;
        timeGroup.classList.add('is-flip-card');
      }
    }

    element.classList.remove('is-flip');
    void element.offsetWidth;
    element.classList.add('is-flip');
  }
}

function updateCircleMarker(progressRatio) {
  if (timerStyle !== 'circle') {
    return;
  }

  const angle = progressRatio * 360;
  circleProgressMarker.style.transform = `rotate(${angle}deg)`;
  circleProgressMarker.style.opacity = progressRatio <= 0.002 ? '0' : '1';
}

function updateProgress(currentMilliseconds) {
  const progressRatio = getProgressRatio(currentMilliseconds);
  const circleBarRatio = progressRatio;
  const circleBarLength = ringCircumference * circleBarRatio;
  activeProgressRatio = progressRatio;
  overlayElement.style.setProperty('--circle-progress-angle', `${progressRatio * 360}deg`);
  overlayElement.style.setProperty('--circle-progress-ratio', `${circleBarRatio.toFixed(4)}`);
  overlayElement.style.setProperty(
    '--circle-active-opacity',
    circleBarRatio <= 0.002 ? '0' : '1',
  );
  overlayElement.style.setProperty(
    '--circle-energy',
    `${(circleBarRatio <= 0.002 ? 0 : 0.4 + circleBarRatio * 0.6).toFixed(4)}`,
  );

  if (mode === 'countdown' && initialMilliseconds > 0) {
    const thumbPosition = Math.min(Math.max(progressRatio * 100, 2), 98);
    barProgressFill.style.width = `${progressRatio * 100}%`;
    barProgressThumb.style.left = `${thumbPosition}%`;
    ringGlow.style.strokeDasharray =
      circleBarLength <= 0.5 ? `0 ${ringCircumference}` : `${circleBarLength} ${ringCircumference}`;
    ringGlow.style.strokeDashoffset = '0';
    ringTail.style.strokeDasharray =
      circleBarLength <= 0.5 ? `0 ${ringCircumference}` : `${circleBarLength} ${ringCircumference}`;
    ringTail.style.strokeDashoffset = '0';
    ringFill.style.strokeDasharray =
      circleBarLength <= 0.5 ? `0 ${ringCircumference}` : `${circleBarLength} ${ringCircumference}`;
    ringFill.style.strokeDashoffset = '0';
    updateCircleMarker(progressRatio);
    document.body.dataset.progressMode = 'static';
    return;
  }

  const thumbPosition = Math.min(Math.max(progressRatio * 100, 2), 98);
  barProgressFill.style.width = `${progressRatio * 100}%`;
  barProgressThumb.style.left = `${thumbPosition}%`;
  ringGlow.style.strokeDasharray =
    circleBarLength <= 0.5 ? `0 ${ringCircumference}` : `${circleBarLength} ${ringCircumference}`;
  ringGlow.style.strokeDashoffset = '0';
  ringTail.style.strokeDasharray =
    circleBarLength <= 0.5 ? `0 ${ringCircumference}` : `${circleBarLength} ${ringCircumference}`;
  ringTail.style.strokeDashoffset = '0';
  ringFill.style.strokeDasharray =
    circleBarLength <= 0.5 ? `0 ${ringCircumference}` : `${circleBarLength} ${ringCircumference}`;
  ringFill.style.strokeDashoffset = '0';
  updateCircleMarker(progressRatio);
  document.body.dataset.progressMode = 'static';
}

function displayEndMessage() {
  timerValues.hidden = true;
  endMessageElement.hidden = false;
  endMessageElement.textContent = endMessage;
}

function renderFrame(totalMilliseconds) {
  if (mode === 'countdown' && totalMilliseconds <= 0) {
    updateProgress(0);
    displayEndMessage();
    return;
  }

  updateTimerDisplay(totalMilliseconds);
  updateProgress(totalMilliseconds);
}

function startTimer() {
  renderFrame(initialMilliseconds);

  if (isPreview) {
    return;
  }

  if (mode === 'countdown' && initialMilliseconds <= 0) {
    hasEnded = true;
    return;
  }

  const startedAt = performance.now();
  const cadence = format === 'hh:mm:ss:ms' ? 10 : timerStyle === 'circle' ? 33 : 100;

  const tick = () => {
    if (hasEnded) {
      return;
    }

    const elapsed = performance.now() - startedAt;
    const nextMilliseconds =
      mode === 'countup'
        ? initialMilliseconds + elapsed
        : Math.max(initialMilliseconds - elapsed, 0);

    if (mode === 'countdown' && nextMilliseconds <= 0) {
      hasEnded = true;
      renderFrame(0);
      return;
    }

    renderFrame(nextMilliseconds);
    timerTickId = window.setTimeout(tick, cadence);
  };

  tick();
}

function updatePreviewScale() {
  if (!isPreview) {
    return;
  }

  if (previewScaleFrameId) {
    window.cancelAnimationFrame(previewScaleFrameId);
  }

  overlayElement.style.transform = 'scale(1)';

  previewScaleFrameId = window.requestAnimationFrame(() => {
    const horizontalPadding = 44;
    const verticalPadding = 44;
    const availableWidth = Math.max(window.innerWidth - horizontalPadding, 120);
    const availableHeight = Math.max(window.innerHeight - verticalPadding, 120);
    const contentWidth = overlayElement.scrollWidth;
    const contentHeight = overlayElement.scrollHeight;
    const scale = Math.min(
      availableWidth / contentWidth,
      availableHeight / contentHeight,
      1,
    );

    overlayElement.style.transform = `scale(${scale})`;
    updateCircleMarker(activeProgressRatio);
    previewScaleFrameId = 0;
  });
}

function disposeOverlayRuntime() {
  if (timerTickId) {
    window.clearTimeout(timerTickId);
  }

  previewScaleTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  previewScaleTimeoutIds = [];

  if (previewScaleFrameId) {
    window.cancelAnimationFrame(previewScaleFrameId);
    previewScaleFrameId = 0;
  }

  if (previewObserver) {
    previewObserver.disconnect();
    previewObserver = null;
  }
}

applyDisplayStyles();
renderLabels();
applyUnitVisibility();
startTimer();
updatePreviewScale();

if (isPreview) {
  window.addEventListener('resize', updatePreviewScale);
  previewScaleTimeoutIds = [80, 240, 420].map((delay) =>
    window.setTimeout(updatePreviewScale, delay),
  );
  if (document.fonts?.ready) {
    document.fonts.ready.then(updatePreviewScale);
  }
  if (window.ResizeObserver) {
    previewObserver = new ResizeObserver(() => updatePreviewScale());
    previewObserver.observe(overlayElement);
  }
}

window.addEventListener('pagehide', disposeOverlayRuntime);
