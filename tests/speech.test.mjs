import test from "node:test";
import assert from "node:assert/strict";
import { createSpeechPlayer } from "../js/speech.mjs";

function createSpeechEnvironment({ voices = [] } = {}) {
  const spoken = [];
  const playedAudio = [];
  const timers = [];

  class FakeUtterance {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 1;
      this.voice = null;
      this.onend = null;
      this.onerror = null;
    }
  }

  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.currentTime = 0;
      this.onended = null;
      this.onerror = null;
      playedAudio.push(this);
    }

    pause() {
      this.paused = true;
    }

    play() {
      this.played = true;
      return Promise.resolve();
    }
  }

  const environment = {
    Audio: FakeAudio,
    SpeechSynthesisUtterance: FakeUtterance,
    speechSynthesis: {
      cancelCount: 0,
      cancel() {
        this.cancelCount += 1;
      },
      getVoices() {
        return voices;
      },
      speak(utterance) {
        spoken.push(utterance);
      },
    },
    setTimeout(callback, delay) {
      timers.push({ callback, delay });
      return timers.length;
    },
    clearTimeout() {},
  };

  return { environment, playedAudio, spoken, timers };
}

test("prefers a local audio file when one is provided", () => {
  const { environment, playedAudio, spoken, timers } = createSpeechEnvironment();
  const player = createSpeechPlayer(environment);
  let endCount = 0;

  player.speak("city", {
    audioSrc: "./assets/audio/S1-01.wav",
    onEnd() {
      endCount += 1;
    },
  });

  assert.equal(playedAudio.length, 1);
  assert.equal(playedAudio[0].src, "./assets/audio/S1-01.wav");
  assert.equal(playedAudio[0].played, true);
  assert.equal(spoken.length, 0);

  playedAudio[0].onended();
  timers[0].callback();
  assert.equal(endCount, 1);
});

test("speaks English with a preferred American voice and ends once", () => {
  const americanVoice = { lang: "en-US", name: "US voice" };
  const { environment, spoken, timers } = createSpeechEnvironment({
    voices: [{ lang: "en-GB", name: "British voice" }, americanVoice],
  });
  const player = createSpeechPlayer(environment);
  let endCount = 0;

  player.speak("city", {
    onEnd() {
      endCount += 1;
    },
  });

  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].text, "city");
  assert.equal(spoken[0].lang, "en-US");
  assert.equal(spoken[0].voice, americanVoice);
  assert.ok(spoken[0].rate < 1);

  spoken[0].onend();
  timers[0].callback();
  assert.equal(endCount, 1);
});

test("uses a fallback timer when speech synthesis is unavailable", () => {
  const timers = [];
  const player = createSpeechPlayer({
    setTimeout(callback, delay) {
      timers.push({ callback, delay });
      return timers.length;
    },
    clearTimeout() {},
  });
  let ended = false;

  player.speak("many cities", {
    onEnd() {
      ended = true;
    },
  });

  assert.equal(ended, false);
  assert.equal(timers.length, 1);
  timers[0].callback();
  assert.equal(ended, true);
});

test("waits for the fallback timer when the browser reports a speech error", () => {
  const { environment, spoken, timers } = createSpeechEnvironment();
  const player = createSpeechPlayer(environment);
  let ended = false;

  player.speak("city", {
    onEnd() {
      ended = true;
    },
  });

  spoken[0].onerror();
  assert.equal(ended, false);

  timers[0].callback();
  assert.equal(ended, true);
});
