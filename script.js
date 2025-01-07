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

// Apply styles
document.body.style.backgroundColor = transparent ? 'transparent' : bgColor;
document.body.style.color = textColor;
document.getElementById('timer').style.fontFamily = font;

// Parse initial time
let totalSeconds = parseTimeInput(timeInput);

// Timer display logic
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  if (format === 'hh:mm:ss') {
    return { hrs, mins, secs };
  } else if (format === 'mm:ss') {
    return { hrs: '', mins, secs };
  } else if (format === 'ss') {
    return { hrs: '', mins: '', secs };
  }
}

// Parse time input
function parseTimeInput(input) {
  if (input === '0') return 0;

  const parts = input.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parseInt(input, 10);
  }
  return 0;
}

// Update timer display
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

// Start timer
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

// Display custom end message
function displayEndMessage() {
  const timerElement = document.getElementById('timer');
  timerElement.innerHTML = `<span>${endMessage}</span>`;
}

startTimer();
