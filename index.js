import { init, uiReady, lifecycle, ShakaPlayer } from "senza-sdk";
import { iso6393To1 } from "iso-639-3"
import "./styles.css"

// const TEST_VIDEO = "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd";
const TEST_VIDEO = "https://d3aebn8jgh8nvm.cloudfront.net/from-mediaconvert/Sintel-sub/default.mpd";

let player;
let audioLangs, textLangs, selectedTextIndex, selectedAudioIndex;
const preferredAudioLanguage = "eng"
const preferredSubtitlesLanguage = "fra"
window.addEventListener("load", async () => {
  try {
    await init();
    player = new ShakaPlayer();
    await player.attach(video);
    player.configure({
      preferredAudioLanguage,
      preferredSubtitlesLanguage,
    })
    player.setTextTrackVisibility(true);
    await player.load(TEST_VIDEO);
    await video.play();

    setTimeout(() => {
      audioLangs = player.getAudioLanguages();
      textLangs = player.getTextLanguages();
      /**
       * this is a hack. we are relaying on the fact that we know (!) the languages in the MPD. 
       * what we need to do is use the getVariants to find the selected tracks.
       */
      selectedAudioIndex = audioLangs.indexOf(iso6393To1[preferredAudioLanguage]);
      selectedTextIndex = textLangs.indexOf(iso6393To1[preferredSubtitlesLanguage]);
      console.log("INFO", audioLangs, textLangs, selectedAudioIndex, selectedTextIndex);
      updateBanner()
    }, 2000)
    uiReady();
  } catch (error) {
    console.error(error);
  }
});

document.addEventListener("keydown", async function (event) {
  switch (event.key) {
    case "Enter": await toggleBackground(); break;
    case "Escape": video.muted = !video.muted; break;
    case "ArrowUp": changeAudioLang(-1); break;
    case "ArrowDown": changeAudioLang(1); break;
    case "ArrowLeft": changeTextLang(-1); break;
    case "ArrowRight": changeTextLang(1); break;
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
    `audio: ${audioLangs[selectedAudioIndex]}<br>` +
    `text: ${textLangs[selectedTextIndex]}`
}
