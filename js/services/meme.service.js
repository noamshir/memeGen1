"use strict";
var gKeywordSearchCountMap = { funny: 0, cat: 0, baby: 0, celebs: 0 };
var gImgs = [
  { id: 0, url: "img/meme-images/1.jpg", keywords: ["celebs", "funny"] },
  { id: 1, url: "img/meme-images/2.jpg", keywords: ["animals", "cute"] },
  { id: 2, url: "img/meme-images/3.jpg", keywords: ["animals", "baby"] },
  { id: 3, url: "img/meme-images/4.jpg", keywords: ["animal", "cute"] },
  { id: 4, url: "img/meme-images/5.jpg", keywords: ["baby", "funny"] },
  { id: 5, url: "img/meme-images/6.jpg", keywords: ["celebs", "funny"] },
  { id: 6, url: "img/meme-images/7.jpg", keywords: ["baby", "funny", "cute"] },
  { id: 7, url: "img/meme-images/8.jpg", keywords: ["celebs", "funny"] },
  { id: 8, url: "img/meme-images/9.jpg", keywords: ["baby", "funny"] },
  { id: 9, url: "img/meme-images/10.jpg", keywords: ["celebs", "funny"] },
  { id: 10, url: "img/meme-images/11.jpg", keywords: ["celebs", "funny"] },
  { id: 11, url: "img/meme-images/12.jpg", keywords: ["celebs", "funny"] },
  { id: 12, url: "img/meme-images/13.jpg", keywords: ["celebs"] },
  { id: 13, url: "img/meme-images/14.jpg", keywords: ["celebs"] },
  { id: 14, url: "img/meme-images/15.jpg", keywords: ["celebs"] },
  { id: 15, url: "img/meme-images/16.jpg", keywords: ["celebs", "funny"] },
  { id: 16, url: "img/meme-images/17.jpg", keywords: ["celeb"] },
  { id: 17, url: "img/meme-images/18.jpg", keywords: ["cute", "funny"] },
];
var gMeme;
var gMemes;
var DB = "memesDB";
createSavedMemes();

function createSavedMemes() {
  var memes = loadFromStorage(DB);
  gMemes = memes;
}

function getImages() {
  return gImgs;
}

function getMeme() {
  return gMeme;
}

function createMeme() {
  gMeme = {
    selectedImgId: 0,
    selectedLineIdx: 0,
    selectedSticker: 0,
    lines: [
      {
        txt: "Enter Text",
        size: 30,
        align: "center",
        color: "white",
        pos: { x: 0, y: 0 },
        font: "Impact",
      },
    ],
    stickers: [
      {
        txt: "",
        pos: { x: 0, y: 0 },
      },
    ],
  };
}

function setMemeStickers(sticker, id, x, y) {
  if (id === 0) gMeme.stickers = [];
  var sticker = {
    txt: sticker,
    pos: { x, y },
  };
  gMeme.stickers.push(sticker);
  gMeme.selectedSticker = id;
}

function createSavedMeme(id) {
  gMeme = gMemes[id].meme;
  return gMeme.selectedImgId;
}

function isTextClicked(clickedPos, ctx) {
  var pos;
  let count = 0;
  let flag = false;
  gMeme.lines.forEach((line) => {
    var metrics = getTextWidth(ctx, line);
    var width = metrics.width;
    pos = line.pos;

    if (
      line.align === "center" &&
      clickedPos.x <= pos.x + width / 2 + 10 &&
      clickedPos.x >= pos.x - width / 2 - 10 &&
      clickedPos.y <= pos.y + 10 &&
      clickedPos.y >= pos.y - line.size - 10
    ) {
      gMeme.selectedLineIdx = count;
      var elLineText = document.getElementById("line-text");
      elLineText.value = line.txt;
      flag = true;
      return;
    } else if (
      line.align === "left" &&
      clickedPos.x <= pos.x + width + 10 &&
      clickedPos.x >= pos.x - 10 &&
      clickedPos.y <= pos.y + 10 &&
      clickedPos.y >= pos.y - line.size - 10
    ) {
      gMeme.selectedLineIdx = count;
      var elLineText = document.getElementById("line-text");
      elLineText.value = line.txt;
      flag = true;
      return;
    } else if (
      line.align === "right" &&
      clickedPos.x <= pos.x + 10 &&
      clickedPos.x >= pos.x - width - 20 &&
      clickedPos.y <= pos.y + 10 &&
      clickedPos.y >= pos.y - line.size - 10
    ) {
      gMeme.selectedLineIdx = count;
      var elLineText = document.getElementById("line-text");
      elLineText.value = line.txt;
      flag = true;
      return;
    }
    count++;
  });
  return flag;
}

function isStickerClicked(clickedPos, ctx) {
  var pos;
  let count = 0;
  let flag = false;
  gMeme.stickers.forEach((sticker) => {
    pos = sticker.pos;
    if (
      clickedPos.x <= pos.x + 15 &&
      clickedPos.x >= pos.x - 15 &&
      clickedPos.y <= pos.y + 5 &&
      clickedPos.y >= pos.y - 25
    ) {
      flag = true;
      gMeme.selectedSticker = count;
      return;
    }
    count++;
  });
  return flag;
}

function getTextWidth(ctx, line) {
  ctx.font = `normal ${line.size}px Impact`;
  const metrics = ctx.measureText(line.txt);
  return metrics;
}

function setImg(id) {
  gMeme.selectedImgId = id;
}

function setMemeColor(color) {
  gMeme.lines[gMeme.selectedLineIdx].color = color;
}

function setLineTxt(txt) {
  var idx = gMeme.selectedLineIdx;
  gMeme.lines[idx].txt = txt;
}

function setFontStyle(style) {
  gMeme.lines.forEach((line) => {
    line.font = style;
  });
}

function setFontSize(val) {
  var fontSize = gMeme.lines[gMeme.selectedLineIdx].size;
  gMeme.lines[gMeme.selectedLineIdx].size = fontSize + val;
}

function setLineAlign(align, canvas, ctx) {
  var line = gMeme.lines[gMeme.selectedLineIdx];
  if (align === "left") {
    line.pos.x = 0;
  } else if (align === "right") {
    line.pos.x = canvas.width;
  } else {
    line.pos.x = canvas.width / 2;
  }
  line.align = align;
}

function addLineToMeme(elCanvas) {
  var lines = gMeme.lines;
  var elFont = document.getElementById("select-font");
  var font = elFont.value;
  if (lines.length === 1) {
    lines.push({
      txt: "Enter Text",
      size: 30,
      align: "center",
      color: "white",
      pos: {
        x: elCanvas.width / 2,
        y: (elCanvas.height * 3) / 4,
      },
      font: font,
    });
  } else {
    lines.push({
      txt: "Enter Text",
      size: 30,
      align: "center",
      color: "white",
      pos: {
        x: elCanvas.width / 2,
        y: elCanvas.height / 2,
      },
      font: font,
    });
  }
  gMeme.selectedLineIdx = lines.length - 1;
}

function deleteLine() {
  var elInput = document.getElementById("line-text");
  if (gMeme.lines.length === 1) {
    gMeme.lines[gMeme.selectedLineIdx].txt = "";
    elInput.value = "";
    elInput.placeHolder = "Enter Text";
    return;
  }
  gMeme.lines.splice(gMeme.selectedLineIdx, 1);
  gMeme.selectedLineIdx = 0;
  elInput.value = gMeme.lines[gMeme.selectedLineIdx].txt;
}

function setSelectedLine(idx) {
  gMeme.selectedLineIdx = idx;
}

function setTextPos(idx, x, y) {
  gMeme.lines[idx].pos.x = x;
  gMeme.lines[idx].pos.y = y;
}

function moveText(dx, dy) {
  gMeme.lines[gMeme.selectedLineIdx].pos.x += dx;
  gMeme.lines[gMeme.selectedLineIdx].pos.y += dy;
}

function moveSticker(dx, dy) {
  gMeme.stickers[gMeme.selectedSticker].pos.x += dx;
  gMeme.stickers[gMeme.selectedSticker].pos.y += dy;
}

function saveMeme(data) {
  if (!gMemes) gMemes = [];
  gMemes.push({ meme: gMeme, canvas: data });
  saveMemeToStorage();
}

function saveMemeToStorage() {
  saveToStorage(DB, gMemes);
}

function getSavedMemes() {
  return gMemes;
}
