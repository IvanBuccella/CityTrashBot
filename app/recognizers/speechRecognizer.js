const sdk = require("microsoft-cognitiveservices-speech-sdk");
const readline = require("readline");
const { promisifyManyArgs } = require("../resources/promisify");
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.SPEECH_KEY,
  process.env.SPEECH_REGION
);

class CityTrashBotSpeechRecognizer {
  static async generateAudio(text) {
    let ret = null;

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(
      "textToSpeechTempFile.wav"
    );
    speechConfig.speechSynthesisVoiceName =
      process.env.SPEECH_SYNTHESIS_VOICE_NAME;
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.close();

    const speakTextAsync = promisifyManyArgs(
      synthesizer.speakTextAsync.bind(synthesizer),
      true
    );

    ret = await speakTextAsync(text).catch((result) => {
      if (
        result.reason != undefined &&
        result.reason === sdk.ResultReason.SynthesizingAudioCompleted
      ) {
        return Buffer.from(result.audioData).toString("base64");
      }
      return null;
    });

    synthesizer.close();
    synthesizer = null;

    return ret;
  }

  static async recognizeAudio(audioBuffer) {
    let text = null;
    let audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
    let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    const recognizeOnceAsync = promisifyManyArgs(
      speechRecognizer.recognizeOnceAsync.bind(speechRecognizer),
      true
    );
    text = await recognizeOnceAsync().catch((result) => {
      if (
        result.reason != undefined &&
        result.reason === sdk.ResultReason.RecognizedSpeech
      ) {
        return result.text;
      }
      return null;
    });
    speechRecognizer.close();
    return text;
  }
}
module.exports.CityTrashBotSpeechRecognizer = CityTrashBotSpeechRecognizer;
