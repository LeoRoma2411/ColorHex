const imageInput = document.getElementById('image-input');
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const colorList = document.getElementById('color-list');
const addedColors = new Set();
const hoverPreview = document.getElementById('hover-preview');
const hoverSwatch = hoverPreview.querySelector('.swatch');
const hoverHex = hoverPreview.querySelector('span');
const exportBtn = document.getElementById('export-btn');
const exportPaletteBtn = document.getElementById('export-palette-btn');

let imgLoaded = false;

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const containerWidth = canvas.parentElement.clientWidth;
            const scale = Math.min(1, containerWidth / img.width);

            canvas.width = img.width;
            canvas.height = img.height;

            canvas.style.width = (img.width * scale) + 'px';
            canvas.style.height = (img.height * scale) + 'px';

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            imgLoaded = true;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

function getCursorPos(evt) {
    let clientX, clientY;
    if (evt.touches && evt.touches.length) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const xInCanvas = clientX - rect.left;
    const yInCanvas = clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x = Math.floor(xInCanvas * scaleX);
    let y = Math.floor(yInCanvas * scaleY);
    x = Math.min(Math.max(x, 0), canvas.width - 1);
    y = Math.min(Math.max(y, 0), canvas.height - 1);
    return {
        x,
        y,
        clientX,
        clientY
    };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function updateHoverPreview(evt) {
    if (!imgLoaded) {
        hoverPreview.style.display = 'none';
        return;
    }
    const {
        x,
        y,
        clientX,
        clientY
    } = getCursorPos(evt);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    hoverSwatch.style.backgroundColor = hex;
    hoverHex.textContent = hex;

    let left = clientX + 15;
    let top = clientY + 15;
    const previewRect = hoverPreview.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + previewRect.width > viewportWidth) {
        left = clientX - previewRect.width - 15;
    }
    if (top + previewRect.height > viewportHeight) {
        top = clientY - previewRect.height - 15;
    }

    hoverPreview.style.left = left + 'px';
    hoverPreview.style.top = top + 'px';
    hoverPreview.style.display = 'flex';
}

function hideHoverPreview() {
    hoverPreview.style.display = 'none';
}

function addColorBox(hex) {
    if (addedColors.has(hex)) return;
    addedColors.add(hex);

    const div = document.createElement('div');
    div.className = 'color-box';
    div.innerHTML = `
                <div class="swatch" style="background: ${hex}"></div>
                <span>${hex}</span>
                <span class="remove-btn" title="Rimuovi colore">&times;</span>
            `;
    div.querySelector('.remove-btn').addEventListener('click', () => {
        addedColors.delete(hex);
        colorList.removeChild(div);
    });
    colorList.appendChild(div);
}

canvas.addEventListener('mousemove', updateHoverPreview);
canvas.addEventListener('mouseleave', hideHoverPreview);
canvas.addEventListener('click', (evt) => {
    if (!imgLoaded) return;
    const {
        x,
        y
    } = getCursorPos(evt);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    addColorBox(hex);
});

canvas.addEventListener('touchmove', (evt) => {
    evt.preventDefault();
    updateHoverPreview(evt);
}, {
    passive: false
});
canvas.addEventListener('touchend', (evt) => {
    evt.preventDefault();
    if (!imgLoaded) return;
    const touch = evt.changedTouches[0];
    if (!touch) return;

    const rect = canvas.getBoundingClientRect();
    const xInCanvas = touch.clientX - rect.left;
    const yInCanvas = touch.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x = Math.floor(xInCanvas * scaleX);
    let y = Math.floor(yInCanvas * scaleY);
    x = Math.min(Math.max(x, 0), canvas.width - 1);
    y = Math.min(Math.max(y, 0), canvas.height - 1);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    addColorBox(hex);
    hideHoverPreview();
}, {
    passive: false
});

canvas.addEventListener('touchcancel', hideHoverPreview);

const sliders = {
    red: document.getElementById('red'),
    green: document.getElementById('green'),
    blue: document.getElementById('blue'),
};
const sliderValues = {
    red: document.getElementById('val-red'),
    green: document.getElementById('val-green'),
    blue: document.getElementById('val-blue'),
};
const customSwatch = document.getElementById('custom-swatch');
const customHex = document.getElementById('custom-hex');
const addCustomBtn = document.getElementById('add-custom-color');

function updateCustomColor() {
    const r = parseInt(sliders.red.value);
    const g = parseInt(sliders.green.value);
    const b = parseInt(sliders.blue.value);
    sliderValues.red.textContent = r;
    sliderValues.green.textContent = g;
    sliderValues.blue.textContent = b;
    const hex = rgbToHex(r, g, b);
    customSwatch.style.backgroundColor = hex;
    customHex.textContent = hex;
}

Object.values(sliders).forEach(slider => {
    slider.addEventListener('input', updateCustomColor);
});

addCustomBtn.addEventListener('click', () => {
    const hex = customHex.textContent;
    addColorBox(hex);
});

updateCustomColor();

function visualizzaToast(messaggio) {
    const toastEl = document.getElementById('color-toast');
    toastEl.querySelector('.toast-body').textContent = messaggio;
    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();
}

exportBtn.addEventListener('click', () => {
    if (addedColors.size === 0) {
        visualizzaToast('Nessun colore selezionato da esportare.');
        return;
    }
    const lines = Array.from(addedColors).join('\n');
    const blob = new Blob([lines], {
        type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colori_selezionati.txt';
    a.click();
    URL.revokeObjectURL(url);
});

function exportPaletteAsPng() {
    if (addedColors.size === 0) {
        visualizzaToast('Nessun colore selezionato da esportare.');
        return;
    }

    const paletteColors = Array.from(addedColors);
    const boxWidth = 100;
    const boxHeight = 50;
    const totalHeight = paletteColors.length * boxHeight;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = boxWidth;
    exportCanvas.height = totalHeight;
    const exportCtx = exportCanvas.getContext('2d');

    paletteColors.forEach((color, index) => {
        const yPos = index * boxHeight;
        exportCtx.fillStyle = color;
        exportCtx.fillRect(0, yPos, boxWidth, boxHeight);

        // Add hex code text
        exportCtx.fillStyle = '#000'; // Set text color to black
        exportCtx.font = '14px Arial'; // Set font
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.fillText(color, boxWidth / 2, yPos + (boxHeight / 2));
    });


    const dataURL = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'palette_colori.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

exportPaletteBtn.addEventListener('click', exportPaletteAsPng);