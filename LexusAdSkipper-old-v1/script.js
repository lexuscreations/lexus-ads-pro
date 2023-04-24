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

    const elmFundTep = document.querySelectorAll(
      "div.ytp-popup.ytp-settings-menu.ytp-rounded-menu div.ytp-panel-menu > div"
    );
    if (elmFundTep && elmFundTep[0] && elmFundTep[0].style.display === "") {
      elmFundTep.forEach((el) => {
        el.childNodes.forEach((elInner) => {
          if (
            elInner.classList.contains("ytp-menuitem-label") &&
            ["Playback speed", "Ambient mode"].includes(elInner.textContent)
          ) {
            el.style.display = "none";
          }
        });
      });
    }

    mainInterval = setInterval(() => {
      const skipButtonVideoEl = document.querySelector(skipButtonVideoSelector);
      const skipButtonTextEl = document.querySelector(skipButtonTextSelector);
      const cinematicBlurEl = document.querySelector(cinematicBlurSelector);
      const appStatusEl = document.querySelector(
        `.${appName}StatusAppIndicator`
      );

      if (cinematicBlurEl) cinematicBlurEl.style.display = "none";

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
            <button id="${appName}LoopBtn" style="cursor: pointer;margin-right: 22px;background: white;transition: all 0.3s;" onclick="
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
            <button id="${appName}PictureInPlayBtn" style="cursor: pointer;background: white;margin-right: 22px;transition: all 0.3s;" onclick="
              (async (thisEl) => {
                const videoEl = document.querySelector('video.video-stream.html5-main-video');
                await videoEl.requestPictureInPicture();
                thisEl.style.backgroundColor = 'green';
                videoEl.onleavepictureinpicture = () => {
                  thisEl.style.backgroundColor = 'white';
                }
              })(this)
            ">PictureInPlay</button>
            <button id="${appName}maxVolumeBtn" style="cursor: pointer;background: white;margin-right: 22px;transition: all 0.3s;" onclick="
              (async (thisEl) => {
                const videoEl = document.querySelector('video.video-stream.html5-main-video');
                videoEl.volume = 0.9
                thisEl.textContent = 'maxedVolume';
                thisEl.style.backgroundColor = 'green';
                setTimeout(() => {
                  thisEl.textContent = 'maxVolume';
                  thisEl.style.backgroundColor = 'white';
                }, 1800);
              })(this)
            ">maxVolume</button>
            <select id="${appName}playSpeedAdjustBtn" style="cursor: pointer;background: white;transition: all 0.3s;" title="playSpeed" onchange="((thisEl) => {
              const videoEl = document.querySelector('video.video-stream.html5-main-video');
              videoEl.playbackRate = parseFloat(thisEl.value);
              sessionStorage.setItem('yt-player-playback-rate', JSON.stringify({data: thisEl.value, creation: +new Date}))
            })(this)"">
              <option value="0.10">0.10</option>
              <option value="0.25">0.25</option>
              <option value="0.5">0.5</option>
              <option value="0.75">0.75</option>
              <option value="1">1</option>
              <option value="1.25">1.25</option>
              <option value="1.5">1.5</option>
              <option value="1.75">1.75</option>
              <option value="2">2</option>
              <option value="2.5">2.5</option>
              <option value="3">3</option>
              <option value="3.5">3.5</option>
              <option value="4">4</option>
              <option value="4.5">4.5</option>
              <option value="5">5</option>
            </select>
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

      if (document.querySelector("#LexusAdSkipperplaySpeedAdjustBtn")) {
        document.querySelector("#LexusAdSkipperplaySpeedAdjustBtn").value =
          document.querySelector(
            "video.video-stream.html5-main-video"
          ).playbackRate;
      }
    }, 3000);
  }, 3000);
})();
