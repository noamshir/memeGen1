"use strict";
var gElCanvas;
var gCtx;
var gIsTextDragable = false;
var gIsStickerDragable = false;
var gOnDownPos;
var gisFirst = true;
var gIsforSave = false;
var gSticker;

function initMemes(id, flag = false) {
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
  setImg(id);
  renderMeme(gElCanvas, gCtx);
  addListiners();
}

function renderMeme(elCanvas, ctx) {
  var meme = getMeme();
  var imgUrl = gImgs[meme.selectedImgId].url;
  var img = new Image();
  img.src = imgUrl;
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
        ctx.strokeRect(sticker.pos.x - 20, sticker.pos.y - 30, 40, 40);
      }
      count++;
    });
  }
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
  gIsforSave = true;
  renderMeme(gElCanvas, gCtx);
  const data = gElCanvas.toDataURL();
  saveMeme(data);
  gIsforSave = false;
  renderMeme(gElCanvas, gCtx);
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
  }
  if (!gIsTextDragable) {
    gIsStickerDragable = isStickerClicked(gOnDownPos, gCtx);
    if (gIsStickerDragable) gIsTextDragable = false;
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
}

function addListiners() {
  addCanvasMouseListeners();
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

function getEvPos(ev) {
  var pos = {
    x: ev.offsetX,
    y: ev.offsetY,
  };
  return pos;
}

function resizeCanvas() {
  var virtualCanvas = document.createElement("canvas");
  var virtualCtx = virtualCanvas.getContext("2d");
  var elCanvasContainer = document.querySelector(".canvas-container");
  elCanvasContainer.height = elCanvasContainer.offsetWidth;
  virtualCanvas.height = elCanvasContainer.offsetHeight;
  virtualCanvas.width = elCanvasContainer.offsetWidth;
  virtualCtx.drawImage(gElCanvas, 0, 0);
  gElCanvas.height = elCanvasContainer.offsetHeight;
  gElCanvas.width = elCanvasContainer.offsetWidth;
  gCtx.drawImage(virtualCanvas, 0, 0);
  renderMeme(gElCanvas, gCtx);
}