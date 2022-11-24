(() => {
  if (new URL(location.href).origin !== "https://www.youtube.com") return;

  let mainInterval;
  const appName = "LexusAdSkipper";
  const skipButtonVideoSelector = ".ytp-ad-skip-button";
  const skipButtonTextSelector = ".ytp-ad-overlay-close-button";
  const playerContainerSelector =
    "#player-container-outer.style-scope.ytd-watch-flexy";
  const cinematicBlurSelector = "#cinematics.ytd-watch-flexy";

  setInterval(() => {
    const playerContainerEl = document.querySelector(playerContainerSelector);

    if (!playerContainerEl) return mainInterval && clearInterval(mainInterval);

    mainInterval = setInterval(() => {
      const skipButtonVideoEl = document.querySelector(skipButtonVideoSelector);
      const skipButtonTextEl = document.querySelector(skipButtonTextSelector);
      const cinematicBlurEl = document.querySelector(cinematicBlurSelector);
      const appStatusEl = document.querySelector(
        `.${appName}StatusAppIndicator`
      );

      if (cinematicBlurEl) {
        cinematicBlurEl.style.display = "none";
      }

      if (!appStatusEl) {
        const initialTextForLoopBtn = document.querySelector(
          "video.video-stream.html5-main-video"
        ).loop
          ? "Loop - on"
          : "Loop - off";
        playerContainerEl.insertAdjacentHTML(
          "afterbegin",
          `<div style="margin-bottom: 5px;display: flex;justify-content: flex-start;align-items: center;" class="${appName}StatusAppIndicator">
            <h2 style="color: white;margin-right: 22px;">${appName}: Activated</h2>
            <button id="${appName}LoopBtn" style="cursor: pointer;margin-right: 22px;background: white;" onclick="
              ((thisEl) => {
                const videoEl = document.querySelector('video.video-stream.html5-main-video');
                if (videoEl.loop) {
                  thisEl.textContent = 'Loop - off';
                  thisEl.style.backgroundColor = 'white';
                  videoEl.loop = false;
                } else {
                  thisEl.textContent = 'Loop - on';
                  thisEl.style.backgroundColor = 'green';
                  videoEl.loop = true;
                }
              })(this)
            ">${initialTextForLoopBtn}</button>
            <button id="${appName}PictureInPlayBtn" style="cursor: pointer;background: white;" onclick="
              (async (thisEl) => {
                const videoEl = document.querySelector('video.video-stream.html5-main-video');
                await videoEl.requestPictureInPicture();
                thisEl.style.backgroundColor = 'green';
                videoEl.onleavepictureinpicture = () => {
                  thisEl.style.backgroundColor = 'white';
                }
              })(this)
            ">PictureInPlay</button>
          </div>`
        );
      } else {
        const videoEl = document.querySelector(
          "video.video-stream.html5-main-video"
        );
        const loopBtnEl = document.querySelector(
          `.${appName}StatusAppIndicator #${appName}LoopBtn`
        );
        if (videoEl && loopBtnEl) {
          if (videoEl.loop) {
            loopBtnEl.textContent = "Loop - on";
            loopBtnEl.style.backgroundColor = "green";
          } else {
            loopBtnEl.textContent = "Loop - off";
            loopBtnEl.style.backgroundColor = "white";
          }
        }
      }

      if (skipButtonVideoEl) {
        console.log(`${appName}: VideoAdSkipped`);
        skipButtonVideoEl.click();
      }

      if (skipButtonTextEl) {
        console.log(`${appName}: TextAdSkipped`);
        skipButtonTextEl.click();
      }
    }, 3000);
  }, 3000);
})();
