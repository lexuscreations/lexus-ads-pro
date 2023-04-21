const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
  REQUEST_PICTURE_IN_PLAY: "REQUEST_PICTURE_IN_PLAY",
  UPDATE_PLAY_SPEED: "UPDATE_PLAY_SPEED",
};

const $ = (selector, all = false) =>
  all ? document.querySelectorAll(selector) : document.querySelector(selector);

const sendSkippedAdData = (skippedAdData) =>
  chrome.runtime.sendMessage({
    messageType: MessageTypeEnum.SKIPPED_AD_DATA,
    skippedAdData,
  });

const requestExtensionState = () =>
  chrome.runtime.sendMessage({
    messageType: MessageTypeEnum.EXTENSION_STATE_REQUEST,
  });

const handleSkipAd = (durationType, secondsSkipped) => {
  const videoPlayer = document.getElementsByClassName("video-stream")[0];
  if (videoPlayer && videoPlayer.duration)
    videoPlayer.currentTime = videoPlayer.duration;
  const skipBtn = $(".ytp-ad-skip-button");
  if (skipBtn) skipBtn.click();
  sendSkippedAdData({ secondsSkipped, duration: durationType });
};

const handleAd = (resolve) => {
  const videoContainer = document.getElementById("movie_player");
  let isAd = false;
  if (videoContainer && videoContainer.classList)
    isAd = videoContainer.classList.contains("ad-interrupting");
  const ad_preview_text_el = $(".ytp-ad-preview-text");
  let secondsSkipped = "";
  if (ad_preview_text_el) secondsSkipped = ad_preview_text_el.innerText;

  if (isAd && secondsSkipped) {
    const arrEl = [];
    const time_duration_el = $(".ytp-time-duration");
    if (time_duration_el) arrEl.push(time_duration_el.innerText);
    const ad_text_i = document.getElementById("ad-text:i");
    if (ad_text_i) arrEl.push(ad_text_i.innerText);
    arrEl.forEach((e) => e !== "0:00" && handleSkipAd(e, secondsSkipped));
  }

  const promo_premium_banner = document.querySelector(
    ".style-scope.yt-mealbar-promo-renderer .button-container.style-scope.yt-mealbar-promo-renderer .yt-spec-button-shape-next.yt-spec-button-shape-next--text.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--size-m"
  );
  if (promo_premium_banner && promo_premium_banner.hasOwnProperty('click')) promo_premium_banner.click();

  document.hideElementsBySelectors([
    ".ytd-companion-slot-renderer",
    ".ytd-watch-next-secondary-results-renderer.sparkles-light-cta",
    ".ytd-unlimited-offer-module-renderer",
    ".ytp-ad-overlay-image",
    ".ytp-ad-text-overlay",
    ".ytd-display-ad-renderer",
    ".ytd-statement-banner-renderer",
    ".ytd-banner-promo-renderer",
    ".ytd-video-masthead-ad-v3-renderer",
    ".ytd-primetime-promo-renderer",
  ]);

  resolve();
};

const keepLooping = async () => {
  while (true)
    await new Promise((resolve) => setTimeout(() => handleAd(resolve), 100));
};

const requestPictureInPlay = async () => {
  const videoEl = $("video.video-stream.html5-main-video");
  if (!videoEl) return;
  try {
    await videoEl.requestPictureInPicture();
  } catch (error) {
    console.error(`Error enabling pictureInPlay: ${error.message}`);
  }
};

const requestUpdatePlaySpeed = (requestedSpeed) => {
  const videoEl = $("video.video-stream.html5-main-video");
  if (!videoEl) return;
  videoEl.playbackRate = parseFloat(requestedSpeed);
};

(async () => {
  Document.prototype.hideElementsBySelectors = (selectors) =>
    selectors.forEach((selector) =>
      [...$(selector, true)].forEach((el) => (el.style.display = "none"))
    );

  requestExtensionState();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request.messageType) return;
    if (request.messageType === MessageTypeEnum.UPDATE_PLAY_SPEED) {
      requestUpdatePlaySpeed(request.requestedSpeed);
    } else if (
      request.messageType === MessageTypeEnum.REQUEST_PICTURE_IN_PLAY
    ) {
      requestPictureInPlay();
    } else if (request.messageType === MessageTypeEnum.PAGE_RELOAD_REQUEST) {
      alert(
        `Youtube Ad Blocker is turned ${
          request.isExtensionEnabled ? "on" : "off"
        }. Every Youtube tab is going to be reloaded in order for the extension to work properly.`
      );
      location.reload();
    } else if (
      request.messageType === MessageTypeEnum.EXTENSION_STATE_RESPONSE &&
      request.isExtensionEnabled
    )
      keepLooping();
  });
})();
