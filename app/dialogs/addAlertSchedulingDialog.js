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
  CityTrashBotContentModerator,
} = require("../recognizers/contentModerator");
const {
  CityTrashBotSpeechRecognizer,
} = require("../recognizers/speechRecognizer");

const CONFIRM_PROMPT = "confirmPrompt";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

class AddAlertSchedulingDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "addAlertSchedulingDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.cityStep.bind(this),
          this.emailStep.bind(this),
          this.timeStep.bind(this),
          this.confirmStep.bind(this),
          this.resultStep.bind(this),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async cityStep(stepContext) {
    const data = stepContext.options;

    if (!data.city) {
      const messageText = "Let me know the city.";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.city);
  }

  async emailStep(stepContext) {
    const data = stepContext.options;

    if (await CityTrashBotContentModerator.isOffensive(stepContext.result)) {
      return await stepContext.replaceDialog("addAlertSchedulingDialog", data);
    }
    data.city = stepContext.result;

    if (!data.email) {
      const messageText = "Let me know the email your email address.";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.email);
  }

  async timeStep(stepContext) {
    const data = stepContext.options;

    if (
      (await CityTrashBotContentModerator.isOffensive(stepContext.result)) ||
      !Validator.isValidEmail(stepContext.result)
    ) {
      return await stepContext.replaceDialog("addAlertSchedulingDialog", data);
    }
    data.email = stepContext.result;

    if (!data.time) {
      const messageText =
        "Let me know the time. (hh:ss - 24h format - Europe/Rome timezone).";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.time);
  }

  async confirmStep(stepContext) {
    const data = stepContext.options;

    if (
      (await CityTrashBotContentModerator.isOffensive(stepContext.result)) ||
      !Validator.isValidTime(stepContext.result)
    ) {
      return await stepContext.replaceDialog("addAlertSchedulingDialog", data);
    }
    data.time = stepContext.result;

    const messageText = `Please confirm, you want to receive the alerts on the email address "${data.email}", every day at "${data.time}", for the city "${data.city}". Is this correct?`;
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
  }

  async resultStep(stepContext) {
    if (stepContext.result) {
      const data = stepContext.options;
      const result = await axios({
        method: "post",
        url: process.env.FUNCTION_ADD_ALERT_SCHEDULING_ENDPOINT,
        data: data,
      });
      let msg;
      let msgToSpeech;
      if (result.data == 0) {
        msg = `Ops, I'm sorry but I cannot schedule depending on your choices.`;
        msgToSpeech = `I cannot schedule`;
      } else {
        msg = `Thank you! I saved your schedule.`;
        msgToSpeech = `Thank youmI saved your schedule.`;
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
    }
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.AddAlertSchedulingDialog = AddAlertSchedulingDialog;
