"use strict";
var gElCanvas;
var gCtx;
var gIsTextDragable = false;
var gIsStickerDragable = false;
var gOnDownPos;
var gisFirst = true;
var gIsforSave = false;
var gSticker;
var gImageCurr;
var gUploadedImage;
var gIsUploaded = false;
var gTouchEvs = [["touchstart", "touchmove", "touchend"]];

function initMemes(id, flag = false) {
  var elCurrents = document.querySelectorAll(".current");
  elCurrents.forEach((el) => {
    el.classList.remove("current");
  });
  gIsUploaded = false;
  gElCanvas = document.getElementById("meme-canvas");
  gCtx = gElCanvas.getContext("2d");
  var elCanvasContainer = document.querySelector(".canvas-container");
  elCanvasContainer.height = elCanvasContainer.width;
  window.addEventListener("resize", resizeCanvas);
  gElCanvas.height = elCanvasContainer.offsetHeight;
  gElCanvas.width = elCanvasContainer.offsetWidth;
  if (!flag) {
    createMeme();
    setTextPos(0, gElCanvas.width / 2, gElCanvas.height / 4);
    gSticker = 0;
  } else {
    id = createSavedMeme(id);
    var meme = getMeme();
    gSticker = meme.stickers.length;
  }
  var images = getImages();
  var meme = getMeme();
  var img = new Image();
  setImg(id);
  img.src = images[meme.selectedImgId].url;
  gImageCurr = img;
  renderMeme(gElCanvas, gCtx);
  resizeCanvas();
  addListiners();
}

function renderMeme(elCanvas, ctx) {
  var meme = getMeme();
  var img;
  if (meme.selectedImgId !== -1) {
    img = new Image();
    var imgUrl = gImgs[meme.selectedImgId].url;
    img.src = imgUrl;
  } else {
    img = gUploadedImage;
  }
  ctx.drawImage(img, 0, 0, elCanvas.width, elCanvas.height);
  darwLines(ctx);
}

function darwLines(ctx) {
  var meme = getMeme();
  let count = 0;
  meme.lines.forEach((line) => {
    ctx.lineWidth = 2;
    ctx.font = line.size + "px " + line.font;
    ctx.fillStyle = line.color;
    ctx.textAlign = line.align;
    ctx.strokeStyle = "black";
    ctx.fillText(line.txt, line.pos.x, line.pos.y);
    ctx.strokeText(line.txt, line.pos.x, line.pos.y);
    ctx.fill();
    ctx.stroke();
    var metrics = getTextWidth(ctx, line);
    var width = metrics.width;
    if (count === meme.selectedLineIdx && !gIsforSave) {
      ctx.strokeStyle = "white";
      if (line.align === "center") {
        ctx.strokeRect(
          line.pos.x - width / 2 - 10,
          line.pos.y - line.size,
          width + 20,
          line.size + 10
        );
      } else if (line.align === "left") {
        ctx.strokeRect(
          line.pos.x - 10,
          line.pos.y - line.size,
          width + 20,
          line.size + 10
        );
      } else {
        ctx.strokeRect(
          line.pos.x + 10,
          line.pos.y - line.size,
          -(width + 20),
          line.size + 10
        );
      }
    }
    count++;
  });
  if (gSticker > 0) {
    count = 0;
    meme.stickers.forEach((sticker) => {
      ctx.lineWidth = 2;
      ctx.font = "30px Imapact";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.fillText(sticker.txt, sticker.pos.x, sticker.pos.y);
      ctx.strokeText(sticker.txt, sticker.pos.x, sticker.pos.y);
      ctx.fill();
      ctx.stroke();
      if (!gIsforSave && count === meme.selectedSticker) {
        ctx.strokeStyle = "white";
      }
      count++;
    });
  }
}

// function renderUploadEditor() {
//   var img = new Image();
//   img.src = "img/upload-image-1.jpeg";
//   gImage = img;
//   initUpload();
// }

function onImgInput(ev) {
  loadImageFromInput(ev, renderUpload);
}

function loadImageFromInput(ev, onImageReady) {
  var reader = new FileReader();

  reader.onload = (event) => {
    var img = new Image();
    // Render on canvas
    img.onload = onImageReady.bind(null, img);
    img.src = event.target.result;
    gUploadedImage = img;
  };
  reader.readAsDataURL(ev.target.files[0]);
}

function renderUpload() {
  initUpload();
}

function initUpload() {
  gIsUploaded = true;
  gElCanvas = document.getElementById("meme-canvas");
  gCtx = gElCanvas.getContext("2d");
  var elCanvasContainer = document.querySelector(".canvas-container");
  elCanvasContainer.height = elCanvasContainer.width;
  window.addEventListener("resize", resizeCanvas);
  gElCanvas.height = elCanvasContainer.offsetHeight;
  gElCanvas.width = elCanvasContainer.offsetWidth;
  createMeme(-1);
  closeUploadModal();
  setTextPos(0, gElCanvas.width / 2, gElCanvas.height / 4);
  renderMeme(gElCanvas, gCtx);
  resizeCanvas();
  addListiners();
}

function onLineChange(val) {
  setLineTxt(val);
  renderMeme(gElCanvas, gCtx);
}

function onColorChange(color) {
  setMemeColor(color);
  renderMeme(gElCanvas, gCtx);
}

function onSetTextAliignment(align) {
  setLineAlign(align, gElCanvas, gCtx);
  renderMeme(gElCanvas, gCtx);
}
function onSetFontStyle(value) {
  setFontStyle(value);
  renderMeme(gElCanvas, gCtx);
}

function putSticker(sticker) {
  setMemeStickers(sticker, gSticker, gElCanvas.width / 2, gElCanvas.height / 2);
  gSticker++;
  renderMeme(gElCanvas, gCtx);
}

function changeFontSize(val) {
  setFontSize(val);
  renderMeme(gElCanvas, gCtx);
}

function addLine() {
  addLineToMeme(gElCanvas);
  var elLineText = document.getElementById("line-text");
  elLineText.value = "";
  elLineText.placeHolder = "Enter Text";
  renderMeme(gElCanvas, gCtx);
}

function onDownload(elLink) {
  gIsforSave = true;
  renderMeme(gElCanvas, gCtx);
  const data = gElCanvas.toDataURL("image/png");
  elLink.href = data;
  elLink.download = "my-meme.png";
  gIsforSave = false;
  renderMeme(gElCanvas, gCtx);
}

function onSave() {
  if (!gIsUploaded) {
    gIsforSave = true;
    renderMeme(gElCanvas, gCtx);
    const data = gElCanvas.toDataURL();
    saveMeme(data);
    gIsforSave = false;
    renderMeme(gElCanvas, gCtx);
    alert("Meme saved! you can see it in the memes section.");
    return;
  }
  alert("Cannot Save an uploaded meme. try to download it for local saving");
}

function onShare() {
  const title = window.document.title;
  const url = gElCanvas.toDataURL("image/jpeg");
  if (navigator.share) {
    navigator.share({
      title: `${title}`,
      url: `${url}`,
    });
  } else {
    openFaceBookModal();
    const imgDataUrl = gElCanvas.toDataURL("image/jpeg");
    uploadImg(imgDataUrl);
  }
}

function openFaceBookModal() {
  var elModal = document.querySelector(".facebook-share-modal");
  elModal.classList.remove("close");
}

function closeModal() {
  var elModal = document.querySelector(".facebook-share-modal");
  elModal.classList.add("close");
}

function changeLine() {
  var meme = getMeme();
  if (meme.selectedLineIdx === meme.lines.length - 1) {
    setSelectedLine(0);
  } else {
    setSelectedLine(meme.selectedLineIdx + 1);
  }
  var elLineText = document.getElementById("line-text");
  meme = getMeme();
  elLineText.value = meme.lines[meme.selectedLineIdx].txt;
  renderMeme(gElCanvas, gCtx);
}

function onCloseBtn() {
  gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height);
  toggleSections();
}

function onDeleteLine() {
  var flag = deleteLine();
  renderMeme(gElCanvas, gCtx);
}

function onDown(ev) {
  gOnDownPos = getEvPos(ev);
  gIsTextDragable = isTextClicked(gOnDownPos, gCtx);
  if (gIsTextDragable) {
    gIsStickerDragable = false;
    gElCanvas.style.cursor = "pointer";
  }
  if (!gIsTextDragable) {
    gIsStickerDragable = isStickerClicked(gOnDownPos, gCtx);
    if (gIsStickerDragable) {
      gIsTextDragable = false;
      gElCanvas.style.cursor = "grab";
    }
  }
  if (gIsStickerDragable || gIsTextDragable) renderMeme(gElCanvas, gCtx);
}

function onMove(ev) {
  if (!gIsTextDragable && !gIsStickerDragable) return;
  const pos = getEvPos(ev);
  const dx = pos.x - gOnDownPos.x;
  const dy = pos.y - gOnDownPos.y;
  if (gIsStickerDragable) {
    moveSticker(dx, dy);
  } else {
    moveText(dx, dy);
  }
  gOnDownPos = pos;
  renderMeme(gElCanvas, gCtx);
}

function onUp(ev) {
  gIsTextDragable = false;
  gIsStickerDragable = false;
  gElCanvas.style.cursor = "auto";
}

function addListiners() {
  addCanvasMouseListeners();
  addTouchListeners();
}

function addCanvasMouseListeners() {
  gElCanvas.addEventListener("mousedown", (event) => {
    onDown(event);
  });
  gElCanvas.addEventListener("mousemove", (event) => {
    onMove(event);
  });
  gElCanvas.addEventListener("mouseup", (event) => {
    onUp(event);
  });
}

function addTouchListeners() {
  gElCanvas.addEventListener("touchstart", (event) => {
    onDown(event);
  });
  gElCanvas.addEventListener("touchmove", (event) => {
    onMove(event);
  });
  gElCanvas.addEventListener("touchend", (event) => {
    onUp(event);
  });
}

function getEvPos(ev) {
  var pos = {
    x: ev.offsetX,
    y: ev.offsetY,
  };
  if (gTouchEvs.includes(ev.type)) {
    ev.preventDefault();
    ev = ev.changedTouches[0];
    pos = {
      x: ev.pageX - ev.target.offsetLeft,
      y: ev.pageY - ev.target.offsetTop,
    };
  }
  return pos;
}

function resizeCanvas() {
  // console.log(gImageCurr.width);
  // console.log(gImageCurr.height);
  var elGallery = document.querySelector(".section-editor");
  if (!elGallery.classList.contains("close")) {
    var virtualCanvas = document.createElement("canvas");
    var virtualCtx = virtualCanvas.getContext("2d");
    var elCanvasContainer = document.querySelector(".canvas-container");
    if (!gIsUploaded) {
      var height =
        (gImageCurr.height * elCanvasContainer.offsetWidth) / gImageCurr.width;
    } else {
      var height =
        (gUploadedImage.height * elCanvasContainer.offsetWidth) /
        gUploadedImage.width;
    }
    // elCanvasContainer.style.height = elCanvasContainer.offsetWidth + "px";
    elCanvasContainer.style.height = height + "px";
    virtualCanvas.height = elCanvasContainer.offsetHeight;
    virtualCanvas.width = elCanvasContainer.offsetWidth;
    virtualCtx.drawImage(gElCanvas, 0, 0);
    gElCanvas.height = elCanvasContainer.offsetHeight;
    gElCanvas.width = elCanvasContainer.offsetWidth;
    gCtx.drawImage(virtualCanvas, 0, 0);
    renderMeme(gElCanvas, gCtx);
  }
}
