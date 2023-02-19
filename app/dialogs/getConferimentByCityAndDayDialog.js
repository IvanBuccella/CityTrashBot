// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const {
  TimexProperty,
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");
const {
  ConfirmPrompt,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { InputHints, MessageFactory, ActivityTypes } = require("botbuilder");
const axios = require("axios");
const { Validator } = require("../resources/validator");
const {
  CityTrashBotSpeechRecognizer,
} = require("../recognizers/speechRecognizer");
const {
  CityTrashBotContentModerator,
} = require("../recognizers/contentModerator");
const CONFIRM_PROMPT = "confirmPrompt";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

class GetConferimentByCityAndDayDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "getConferimentByCityAndDayDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.cityStep.bind(this),
          this.dayStep.bind(this),
          this.resultStep.bind(this),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async cityStep(stepContext) {
    const data = stepContext.options;

    if (!data.city) {
      const messageText = 'Let me know the city, or type "quit" to exit.';
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.city);
  }

  async dayStep(stepContext) {
    const data = stepContext.options;

    if (await CityTrashBotContentModerator.isOffensive(stepContext.result)) {
      return await stepContext.replaceDialog(
        "getConferimentByCityAndDayDialog",
        data
      );
    }
    data.city = stepContext.result;

    if (!data.day) {
      const messageText = 'Let me know when, or type "quit" to exit.';
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.day);
  }

  async resultStep(stepContext) {
    const data = stepContext.options;
    if (
      (await CityTrashBotContentModerator.isOffensive(stepContext.result)) ||
      !Validator.isValidDay(stepContext.result)
    ) {
      return await stepContext.replaceDialog(
        "getConferimentByCityAndDayDialog",
        data
      );
    }
    data.day = stepContext.result;
    const result = await axios({
      method: "post",
      url: process.env.FUNCTION_GET_CONFERIMENT_ENDPOINT,
      data: data,
    });
    let msg;
    let msgToSpeech;
    if (result.data) {
      msg = `You have to take the "${result.data}" out in "${data.city}" on "${data.day}".`;
      msgToSpeech = `You have to take the "${result.data} out`;
    } else {
      msg = `I'm sorry, I don't know :( But you can train me!`;
      msgToSpeech = `Sorry, I don't know`;
    }
    let message = {
      text: msg,
      type: ActivityTypes.Message,
    };
    let audioFile = await CityTrashBotSpeechRecognizer.generateAudio(
      msgToSpeech
    );
    if (audioFile != null) {
      message.attachments = [
        {
          name: Date.now() + ".wav",
          contentType: "audio/wav",
          contentUrl: `data:audio/wav;base64,${audioFile}`,
        },
      ];
    }
    await stepContext.context.sendActivity(message);
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.GetConferimentByCityAndDayDialog =
  GetConferimentByCityAndDayDialog;
