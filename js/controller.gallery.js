"use strict";
var gFilter = "";
var gIsGallery = true;

function init() {
  renderGallery();
  renderKeyWords();
  var elEditor = document.querySelector(".section-editor");
  if (!elEditor.classList.contains("close")) toggleSections();
  closeUploadModal();
  gIsGallery = true;
  var elCurrents = document.querySelectorAll(".current");
  elCurrents.forEach((el) => {
    el.classList.remove("current");
  });
  var elA = document.querySelector(".gallery-a");
  elA.classList.add("current");
}

function initSavedMemes() {
  gIsGallery = false;
  renderSavedMemes();
  var elEditor = document.querySelector(".section-editor");
  if (!elEditor.classList.contains("close")) toggleSections();
  closeUploadModal();
  var elCurrents = document.querySelectorAll(".current");
  elCurrents.forEach((el) => {
    el.classList.remove("current");
  });
  var elA = document.querySelector(".memes-saved-a");
  elA.classList.add("current");
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
  closeUploadModal();
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

function renderKeyWords() {
  var keyWords = getKeyWords();
  var str = "";
  let key = "";
  let value = "";
  for ([key, value] of Object.entries(keyWords)) {
    str += `<p style="font-size: ${
      3 * value
    }px;" class="key-word-${key}" onclick="onKeyWordClick('${key}')">${key}</p>`;
  }
  var elKeyWordsDiv = document.querySelector(".keyWords-div");
  elKeyWordsDiv.innerHTML = str;
}

function onKeyWordClick(word) {
  updateKeyWords(word);
  var keyWords = getKeyWords();
  var elP = document.querySelector(`.key-word-${word}`);
  elP.style.fontSize = keyWords[word] * 3 + "px";
  gFilter = word;
  var render = gIsGallery ? renderGallery : renderSavedMemes;
  render();
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
  var keyWords = getKeyWords();
  for (var key in keyWords) {
    if (key === val) {
      onKeyWordClick(key);
      return;
    }
  }
  gFilter = val;
  var func = gIsGallery ? renderGallery : renderSavedMemes;
  func();
}

function onMemeClick(id) {
  toggleSections();
  initMemes(id);
}

function onUploadPhoto() {
  var elCurrents = document.querySelectorAll(".current");
  elCurrents.forEach((el) => {
    el.classList.remove("current");
  });
  var elA = document.querySelector(".upload-photo-a");
  elA.classList.add("current");
  openEditor();
}

function openEditor() {
  var elEditor = document.querySelector(".section-editor");
  var elGallery = document.querySelector(".section-gallery");
  var elButtomHeader = document.querySelector(".header-buttom");
  var elAboutMe = document.querySelector(".about-me-layout");
  var elFooter = document.querySelector(".footer");
  var elUploadModal = document.querySelector(".upload-modal");
  if (elEditor.classList.contains("close")) {
    elEditor.classList.remove("close");
    elGallery.classList.add("close");
    elButtomHeader.classList.add("close");
    elFooter.classList.add("close");
    elAboutMe.classList.add("close");
  }
  if (elUploadModal.classList.contains("close"))
    elUploadModal.classList.remove("close");
}

function closeUploadModal() {
  var elUploadModal = document.querySelector(".upload-modal");
  elUploadModal.classList.add("close");
}

function onSavedMemeClick(id) {
  toggleSections();
  initMemes(id, true);
}

function toggleSections() {
  var elEditor = document.querySelector(".section-editor");
  if (elEditor.classList.contains("close")) {
    var elLineText = document.getElementById("line-text");
    elLineText.value = "";
    elLineText.placeHolder = "Enter Text";
  }
  elEditor.classList.toggle("close");
  var elGallery = document.querySelector(".section-gallery");
  elGallery.classList.toggle("close");
  var elButtomHeader = document.querySelector(".header-buttom");
  elButtomHeader.classList.toggle("close");
  var elFooter = document.querySelector(".footer");
  elFooter.classList.toggle("close");
  var elAboutMe = document.querySelector(".about-me-layout");
  elAboutMe.classList.toggle("close");
}

function toggleMenu() {
  document.body.classList.toggle("menu-open");
}
