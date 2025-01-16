document.getElementById('mode').addEventListener('change', function () {
  const timeInput = document.getElementById('time');
  const endMessageInput = document.getElementById('end_message');
  timeInput.placeholder =
    this.value === 'countup'
      ? 'Start time (HH:mm:ss or 0)'
      : 'Countdown time (HH:mm:ss)';
  endMessageInput.disabled = this.value === 'countup';
});

const fontInput = document.getElementById('font');
const fontDropdown = document.getElementById('font-dropdown');

const fonts = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Merriweather',
  'Poppins',
  'Ubuntu',
  'Playfair Display',
  'Nunito',
  'Bebas Neue',
  'Arial, sans-serif',
  'Courier New, monospace',
  'Times New Roman, serif',
];

function populateDropdown(query) {
  fontDropdown.innerHTML = '';

  const filteredFonts = fonts.filter((font) =>
    font.toLowerCase().includes(query),
  );

  if (filteredFonts.length > 0) {
    filteredFonts.forEach((font) => {
      const option = document.createElement('li');
      option.classList.add('dropdown-item');
      option.textContent = font;
      option.addEventListener('click', () => {
        applyFont(font);
      });
      fontDropdown.appendChild(option);
    });
    fontDropdown.style.display = 'block';
    fontDropdown.scrollTop = 0;
  } else {
    fontDropdown.style.display = 'none';
  }
}

function applyFont(font) {
  fontInput.value = font;
  fontDropdown.style.display = 'none';

  if (!font.includes(',')) {
    const fontLink = document.createElement('link');
    fontLink.href = `https://fonts.googleapis.com/css2?family=${font.replace(
      / /g,
      '+',
    )}&display=swap`;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }

  document.body.style.fontFamily = font;
}

fontInput.addEventListener('input', async function () {
  const query = this.value.toLowerCase().trim();
  populateDropdown(query);

  if (query && !fonts.some((font) => font.toLowerCase() === query)) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCeUiBfrEYZLEyA5TtHuiW5zRncJM3U1Ls`,
      );
      const data = await response.json();
      const matchedFont = data.items.find(
        (font) => font.family.toLowerCase() === query,
      );

      if (matchedFont) {
        applyFont(matchedFont.family);
      }
    } catch (error) {
      console.error('Error fetching Google Fonts API:', error);
    }
  }
});

fontInput.addEventListener('focus', function () {
  const query = this.value.toLowerCase().trim();
  populateDropdown(query);
});

document.addEventListener('click', (event) => {
  if (
    !fontInput.contains(event.target) &&
    !fontDropdown.contains(event.target)
  ) {
    fontDropdown.style.display = 'none';
  }
});

fontDropdown.addEventListener('mousedown', (event) => {
  event.preventDefault();
});
