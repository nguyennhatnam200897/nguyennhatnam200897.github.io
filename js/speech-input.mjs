export function createSpeechInput(environment = globalThis) {
  const Recognition =
    environment.SpeechRecognition ?? environment.webkitSpeechRecognition;

  let activeRecognition = null;

  function clearActive(recognition) {
    if (activeRecognition === recognition) {
      activeRecognition = null;
    }
  }

  function isActive(recognition) {
    return activeRecognition === recognition;
  }

  function stop() {
    if (!activeRecognition) {
      return;
    }

    const recognition = activeRecognition;
    activeRecognition = null;
    recognition.abort?.();
  }

  function start({ onEnd, onError, onFinal, onInterim, onStart } = {}) {
    if (!Recognition) {
      onError?.("unsupported");
      return false;
    }

    stop();

    const recognition = new Recognition();
    activeRecognition = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      onStart?.();
    };
    recognition.onend = () => {
      if (!isActive(recognition)) {
        return;
      }

      clearActive(recognition);
      onEnd?.();
    };
    recognition.onerror = (event) => {
      if (!isActive(recognition)) {
        return;
      }

      clearActive(recognition);
      onError?.(event?.error ?? "unknown");
    };
    recognition.onresult = (event) => {
      if (!isActive(recognition)) {
        return;
      }

      let interim = "";
      let final = "";

      for (
        let index = event.resultIndex ?? 0;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          final += `${final ? " " : ""}${transcript}`;
        } else {
          interim += `${interim ? " " : ""}${transcript}`;
        }
      }

      if (interim) {
        onInterim?.(interim);
      }

      if (final) {
        onFinal?.(final);
      }
    };

    try {
      recognition.start();
      return true;
    } catch (error) {
      clearActive(recognition);
      onError?.(error?.name ?? "unknown");
      return false;
    }
  }

  return {
    isAvailable: Boolean(Recognition),
    start,
    stop,
  };
}
