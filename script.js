const urlParams = new URLSearchParams(window.location.search);

// Timer configuration
const mode = urlParams.get('mode');
const timeInput = urlParams.get('time');
const format = urlParams.get('format');
const font = urlParams.get('font');
const bgColor = urlParams.get('bg_color') || '#ffffff';
const textColor = urlParams.get('text_color') || '#000000';
const transparent = urlParams.get('transparent') === '1';
const endMessage = urlParams.get('end_message') || "Time's Up!";
const fontSize = urlParams.get('font_size') || '50'; 

// Apply styles
document.body.style.backgroundColor = transparent ? 'transparent' : bgColor;
document.body.style.color = textColor;
document.getElementById('timer').style.fontFamily = font;
document.getElementById('timer').style.fontSize = `${fontSize}px`;

// Font size input handler (optional)
const fontSizeInput = document.getElementById('fontSizeInput');
if (fontSizeInput) {
  fontSizeInput.addEventListener('input', function () {
    const size = parseFloat(this.value);
    if (!isNaN(size) && size > 0) {
      document.getElementById('timer').style.fontSize = `${size}px`;
    }
  });
}

// Parse initial time
let totalSeconds = parseTimeInput(timeInput);

// Format time
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  if (format === 'hh:mm:ss') return { hrs, mins, secs };
  if (format === 'mm:ss') return { hrs: '', mins, secs };
  if (format === 'ss') return { hrs: '', mins: '', secs };
}

// Parse input string like "01:30:00"
function parseTimeInput(input) {
  if (input === '0') return 0;

  const parts = input.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parseInt(input, 10);
  return 0;
}

// Update UI
function updateTimerDisplay() {
  const { hrs, mins, secs } = formatTime(totalSeconds);

  if (format === 'hh:mm:ss') {
    document.getElementById('hours').textContent = hrs;
    document.getElementById('minutes').textContent = mins;
    document.getElementById('seconds').textContent = secs;
    document.getElementById('divider-hours').style.display = 'inline';
    document.getElementById('divider-minutes').style.display = 'inline';
  } else if (format === 'mm:ss') {
    document.getElementById('hours').style.display = 'none';
    document.getElementById('divider-hours').style.display = 'none';
    document.getElementById('minutes').textContent = mins;
    document.getElementById('seconds').textContent = secs;
  } else if (format === 'ss') {
    document.getElementById('hours').style.display = 'none';
    document.getElementById('minutes').style.display = 'none';
    document.getElementById('divider-hours').style.display = 'none';
    document.getElementById('divider-minutes').style.display = 'none';
    document.getElementById('seconds').textContent = secs;
  }
}

// Display custom end message
function displayEndMessage() {
  document.getElementById('timer').innerHTML = `<span>${endMessage}</span>`;
}

// Start the timer
function startTimer() {
  updateTimerDisplay();
  const interval = setInterval(() => {
    if (mode === 'countup') {
      totalSeconds++;
    } else if (mode === 'countdown') {
      if (totalSeconds <= 0) {
        clearInterval(interval);
        displayEndMessage();
        return;
      }
      totalSeconds--;
    }
    updateTimerDisplay();
  }, 1000);
}

startTimer();
