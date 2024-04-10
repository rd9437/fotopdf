const imageContainer = document.getElementById('imageContainer');
const convertButton = document.getElementById('convertButton');
const clearButton = document.getElementById('clearButton');
const pdfDownloadLink = document.getElementById('pdfDownloadLink');
let imageFiles = [];
window.jsPDF = window.jspdf.jsPDF;

// Function to render the images in the UI
const renderImages = () => {
  imageContainer.innerHTML = '';
  imageFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const imageBox = document.createElement('div');
      imageBox.classList.add('imageBox');
      imageBox.setAttribute('data-index', index);
      imageBox.innerHTML = `
        <img src="${reader.result}">
        <button class="deleteButton" data-index="${index}">&times;</button>
      `;
      imageContainer.appendChild(imageBox);
    };
  });
};

function deleteImage(index) {
  imageFiles.splice(index, 1);
  renderImages();
}

imageContainer.addEventListener('click', event => {
  if (event.target.classList.contains('deleteButton')) {
    const index = parseInt(event.target.dataset.index);
    deleteImage(index);
  }
});

// Function to handle the conversion process
const convertToPdf = () => {
  const doc = new jsPDF();
  let imagesProcessed = 0;
  const pageWidth = doc.internal.pageSize.getWidth() - 20;
  imageFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const scaleFactor = pageWidth / img.width;
        const imageHeight = img.height * scaleFactor;
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        const imageData = canvas.toDataURL('image/jpeg');
        if (index === 0) {
          doc.addImage(imageData, 'JPEG', 10, 10, pageWidth, imageHeight);
        } else {
          doc.addPage();
          doc.addImage(imageData, 'JPEG', 10, 10, pageWidth, imageHeight);
        }
        imagesProcessed++;
        if (imagesProcessed === imageFiles.length) {
          doc.save('converted.pdf');
          pdfDownloadLink.innerHTML = `<a href="${doc.output('bloburl')}">Download PDF</a>`;
        }
      };
    };
  });
};

// Add event listener to the file input element
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', e => {
  const selectedFiles = Array.from(e.target.files);
  imageFiles = imageFiles.concat(selectedFiles);
  renderImages();
});

// Add event listener to the convert button
convertButton.addEventListener('click', () => {
  convertButton.innerHTML = 'Converting...';
  convertButton.disabled = true;
  convertToPdf();
  convertButton.innerHTML = 'Convert to PDF';
  convertButton.disabled = false;
});

document.querySelector('#addImageButton').addEventListener('click', () => fileInput.click());

clearButton.addEventListener('click', () => {
  imageFiles = [];
  renderImages();
});
