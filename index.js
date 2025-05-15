import { init, uiReady, lifecycle, ShakaPlayer } from "senza-sdk";
import { iso6393To1 } from "iso-639-3"
import "./styles.css"

const transform = (lang) => iso6393To1[lang] ?? lang

const TEST_VIDEOS = {
  AngelOne: {
    url: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
    audioLang: "fr",
    subsLang: "en",
    // general info. not used in this app
    audioLanguages: ["es", "de", "en", "fr", "it"],
    subsLanguages: ["en"], // supported in local player but not in remote since subs are wvtt
  },
  Sintel: {
    url: "https://d3aebn8jgh8nvm.cloudfront.net/from-mediaconvert/Sintel-sub/default.mpd",
    audioLang: "eng",
    subsLang: "fra",
    // general info. not used in this app
    audioLanguages: ["eng", "por"],
    subsLanguages: ["nl", "fra", "eng"]
  },
  Clock: {
    url: "https://d3aebn8jgh8nvm.cloudfront.net/test/testpic_2s/default.mpd",
    audioLang: "en",
    subsLang: "en",
    // general info. not used in this app
    audioLanguages: ["en"],
    subsLanguages: ["en", "se", "qb", "no"],
  }
}

const TEST_VIDEO = TEST_VIDEOS.Sintel

let player;
let audioLangs, textLangs, selectedTextIndex, selectedAudioIndex;
const preferredAudioLanguage = TEST_VIDEO.audioLang
const preferredTextLanguage = TEST_VIDEO.subsLang
window.addEventListener("load", async () => {
  try {
    await init();
    player = new ShakaPlayer();
    await player.attach(video);
    player.configure({
      preferredAudioLanguage,
      preferredTextLanguage,
    })
    player.setTextTrackVisibility(true);
    await player.load(TEST_VIDEO.url);
    await video.play();

    lifecycle.addEventListener("onstatechange", () => {
      updateIndexes()
      updateBanner()
    })

    setTimeout(() => {

      updateBanner()
    }, 2000)
    uiReady();
  } catch (error) {
    console.error(error);
  }
});

const updateIndexes = () => {
  audioLangs = player.getAudioLanguages();
  textLangs = player.getTextLanguages();
  /**
   * this is a hack. we are relaying on the fact that we know (!) the languages in the MPD. 
   * what we need to do is use the getVariants to find the selected tracks.
   */
  selectedAudioIndex = audioLangs.indexOf(transform(TEST_VIDEO.audioLang));
  selectedTextIndex = textLangs.indexOf(transform(TEST_VIDEO.subsLang));
  console.log("UPDATE INDEXES", audioLangs, textLangs, selectedAudioIndex, selectedTextIndex);
}

document.addEventListener("keydown", async function (event) {
  switch (event.key) {
    case "Enter": await toggleBackground(); break;
    // case "Escape": video.currentTime += 10; // not working!!
    case "ArrowUp": await video.play(); break;
    case "ArrowDown": await video.pause(); break;
    case "ArrowLeft": changeTextLang(1); break;
    case "ArrowRight": changeAudioLang(1); break;
    default: return;
  }
  event.preventDefault();
});

async function toggleBackground() {
  if (lifecycle.state == lifecycle.UiState.BACKGROUND) {
    await lifecycle.moveToForeground();
  } else {
    // console.log("Setting audio language before moving to background");
    // player.selectAudioLanguage(audioLangs[selectedAudioIndex]);
    await lifecycle.moveToBackground();
  }
}

function changeAudioLang(delta) {
  if (selectedAudioIndex === undefined || audioLangs === undefined) {
    console.warn("cannot change audio lang. ", selectedAudioIndex, audioLangs);
    return
  }
  selectedAudioIndex = (selectedAudioIndex + delta + audioLangs.length) % audioLangs.length;
  player.selectAudioLanguage(audioLangs[selectedAudioIndex]);
  updateBanner();
}

function changeTextLang(delta) {
  if (selectedTextIndex === undefined || textLangs === undefined) {
    console.warn("cannot change text lang. ", selectedTextIndex, textLangs);
    return
  }
  selectedTextIndex = (selectedTextIndex + delta + textLangs.length) % textLangs.length;
  player.selectTextLanguage(textLangs[selectedTextIndex]);
  updateBanner();
}

function updateBanner() {
  document.getElementById("banner").innerHTML =
    `audio: ${audioLangs[selectedAudioIndex] ?? "n/a"}<br>` +
    `text: ${textLangs[selectedTextIndex] ?? "n/a"}`
}
