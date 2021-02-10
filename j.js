function trackKeys(keys) {
    let down = Object.create(null);
    function track(event) {
      if (keys.includes(event.key)) {
        down[event.key] = event.type == "keydown";
        event.preventDefault();
      }
    }
    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);
    down.unregister = () => {
      window.removeEventListener("keydown", track);
      window.removeEventListener("keyup", track);
    }
    return down;
  }

  function runLevel(level, Display) {
    let display = new Display(document.body, level);
    let state = State.start(level);
    let ending = 1;
    return new Promise(resolve => {
      /* all of the game pausing logic has to happen
        inside the promise function because when that
        resolves the game level is over */
      let gamePaused = false;
      // function to determine if the game is paused or not
      const isGamePaused = () => gamePaused;
      /* function to alternately pause or resume the game
        when the escape key is pressed */
      const pauseOrResumeGame = (e) => {
        if (e.key == 'Escape') {
          gamePaused = !gamePaused;
        }
      };
      /* wait for the game to resume
        check resume status every 100 ms
        once resumed, the animation function is called again */
      const waitForResume = () => {
        if (isGamePaused()) {
          setTimeout(waitForResume, 100);
        } else {
          runAnimation(animate);
        }
      };
      const animate = (time) => {
        state = state.update(time, arrowKeys);
        display.setState(state);
        if (isGamePaused()) {
          // game is paused, wait for it to resume
          waitForResume();
          // return false to stop the animation
          return false;
        } else if (state.status == "playing") {
          return true;
        } else if (ending > 0) {
          ending -= time;
          return true;
        } else {
          display.clear();
          resolve(state.status);
          // stop listening for the escape key
          document.removeEventListener('keydown', pauseOrResumeGame);
          // unregister control keys
          arrowKeys.unregister();
          return false;
        }
      };
      // listen for the escape key to be pressed (to pause/resume game)
      document.addEventListener('keydown', pauseOrResumeGame);
      // register keys to control character
      let arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);
      runAnimation(animate);
    });
  }