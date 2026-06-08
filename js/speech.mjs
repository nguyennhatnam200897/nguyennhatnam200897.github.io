function fallbackDelay(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1400, Math.min(12000, 700 + wordCount * 430));
}

function selectEnglishVoice(synthesis) {
  const voices = synthesis.getVoices?.() ?? [];

  return (
    voices.find((voice) => voice.lang?.toLowerCase() === "en-gb") ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ??
    null
  );
}

export function createSpeechPlayer(environment = globalThis) {
  let sequence = 0;
  let activeAudio = null;
  let fallbackTimer = null;

  function clearFallback() {
    if (fallbackTimer !== null) {
      environment.clearTimeout?.(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function cancel() {
    sequence += 1;
    clearFallback();
    if (activeAudio) {
      activeAudio.pause?.();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    environment.speechSynthesis?.cancel?.();
  }

  function speakWithSynthesis(text, finish) {
    const synthesis = environment.speechSynthesis;
    const Utterance = environment.SpeechSynthesisUtterance;

    if (!synthesis?.speak || !Utterance) {
      return;
    }

    const utterance = new Utterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.86;
    utterance.voice = selectEnglishVoice(synthesis);
    utterance.onend = finish;
    utterance.onerror = () => {
      // Keep the fallback delay so a failed voice does not skip the feedback.
    };

    try {
      synthesis.speak(utterance);
    } catch {
      // The fallback timer keeps the lesson moving if speech fails.
    }
  }

  function speak(text, { audioSrc, onEnd } = {}) {
    cancel();

    const currentSequence = sequence;
    let finished = false;

    function finish() {
      if (finished || currentSequence !== sequence) {
        return;
      }

      finished = true;
      clearFallback();
      onEnd?.();
    }

    fallbackTimer = environment.setTimeout?.(finish, fallbackDelay(text)) ?? null;

    if (audioSrc && environment.Audio) {
      try {
        activeAudio = new environment.Audio(audioSrc);
        activeAudio.onended = finish;
        activeAudio.onerror = () => {
          if (!finished && currentSequence === sequence) {
            speakWithSynthesis(text, finish);
          }
        };

        const playResult = activeAudio.play?.();
        playResult?.catch?.(() => {
          if (!finished && currentSequence === sequence) {
            speakWithSynthesis(text, finish);
          }
        });
        return;
      } catch {
        activeAudio = null;
      }
    }

    speakWithSynthesis(text, finish);
  }

  return { cancel, speak };
}
