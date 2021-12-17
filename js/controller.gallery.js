"use strict";
var gFilter = "";
var gIsGallery = true;

function init() {
  renderGallery();
  var elEditor = document.querySelector(".section-editor");
  if (!elEditor.classList.contains("close")) toggleSections();
  gIsGallery = true;
}

function initSavedMemes() {
  gIsGallery = false;
  renderSavedMemes();
  var elEditor = document.querySelector(".section-editor");
  if (!elEditor.classList.contains("close")) toggleSections();
}

function renderSavedMemes() {
  var memes = getSavedMemes();
  let count = 0;
  document.querySelector(".section-gallery").innerHTML = "";
  if (memes) {
    const strHTMLs = memes.map((meme) => {
      count++;
      var images = getImages();
      if (!isImgByFilter(images[meme.meme.selectedImgId].keywords)) return;
      return `<div class="meme">
        <img
          class="img-meme"
          onclick="onSavedMemeClick(${count - 1})"
          src="${meme.canvas}"
          alt="meme img"
        />
      </div>`;
    });
    document.querySelector(".section-gallery").innerHTML = strHTMLs.join("");
  }
}

function renderGallery() {
  var images = getImages();
  const strHTMLs = images.map((img) => {
    if (!isImgByFilter(img.keywords)) return;
    return `<div class="meme meme${img.id}">
      <img
        class="img-meme"
        onclick="onMemeClick(${img.id})"
        src="${img.url}"
        alt="meme img"
      />
    </div>`;
  });
  document.querySelector(".section-gallery").innerHTML = strHTMLs.join("");
}

function isImgByFilter(keywords) {
  var flag = false;
  keywords.forEach((label) => {
    if (label.includes(gFilter)) {
      flag = true;
      return;
    }
  });
  return flag;
}

function onOpenColorPalette() {
  var elColor = document.querySelector(".change-color");
  elColor.click();
}

function setFilter(val) {
  gFilter = val;
  var func = gIsGallery ? renderGallery : renderSavedMemes;
  func();
}

function onMemeClick(id) {
  toggleSections();
  initMemes(id);
}

function onSavedMemeClick(id) {
  toggleSections();
  initMemes(id, true);
}

function toggleSections() {
  var elEditor = document.querySelector(".section-editor");
  elEditor.classList.toggle("close");
  var elGallery = document.querySelector(".section-gallery");
  elGallery.classList.toggle("close");
  var elButtomHeader = document.querySelector(".header-buttom");
  elButtomHeader.classList.toggle("close");
  var elLineText = document.getElementById("line-text");
  elLineText.value = "";
}

function toggleMenu() {
  document.body.classList.toggle("menu-open");
}
