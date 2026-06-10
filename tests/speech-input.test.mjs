import assert from "node:assert/strict";
import { test } from "node:test";
import { createSpeechInput } from "../js/speech-input.mjs";

class FakeRecognition {
  static instances = [];

  constructor() {
    this.abortCalled = false;
    this.continuous = null;
    this.interimResults = null;
    this.lang = "";
    this.maxAlternatives = null;
    this.startCalled = false;
    this.stopCalled = false;
    FakeRecognition.instances.push(this);
  }

  start() {
    this.startCalled = true;
  }

  stop() {
    this.stopCalled = true;
  }

  abort() {
    this.abortCalled = true;
  }
}

test("reports unavailable when no recognition API exists", () => {
  const input = createSpeechInput({});

  assert.equal(input.isAvailable, false);
});

test("starts one short en-US recognition pass and returns final transcript", () => {
  FakeRecognition.instances = [];
  const input = createSpeechInput({ SpeechRecognition: FakeRecognition });
  const finals = [];

  input.start({ onFinal: (text) => finals.push(text) });
  const recognition = FakeRecognition.instances[0];

  assert.equal(input.isAvailable, true);
  assert.equal(recognition.lang, "en-US");
  assert.equal(recognition.continuous, false);
  assert.equal(recognition.interimResults, true);
  assert.equal(recognition.maxAlternatives, 1);
  assert.equal(recognition.startCalled, true);

  recognition.onresult({
    resultIndex: 0,
    results: [
      {
        isFinal: true,
        0: { transcript: "many cities" },
      },
    ],
  });

  assert.deepEqual(finals, ["many cities"]);
});

test("ignores late recognition events after stop", () => {
  FakeRecognition.instances = [];
  const input = createSpeechInput({ SpeechRecognition: FakeRecognition });
  const finals = [];
  const errors = [];

  input.start({
    onError: (error) => errors.push(error),
    onFinal: (text) => finals.push(text),
  });
  const recognition = FakeRecognition.instances[0];

  input.stop();
  recognition.onresult({
    resultIndex: 0,
    results: [
      {
        isFinal: true,
        0: { transcript: "late transcript" },
      },
    ],
  });
  recognition.onerror({ error: "aborted" });

  assert.equal(recognition.abortCalled, true);
  assert.deepEqual(finals, []);
  assert.deepEqual(errors, []);
});
