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
const { InputHints, MessageFactory } = require("botbuilder");
const axios = require("axios");

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
      const messageText =
        "Which city would you know what to put out the door of?";
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

    data.city = stepContext.result;

    if (!data.email) {
      const messageText =
        "Let me know the email where you want to receive the alert everyday.";
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

    data.email = stepContext.result;

    if (!data.time) {
      const messageText =
        "Let me know at what time do you wanna receive the alert (HH:ss 24h format).";
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

    data.time = stepContext.result;

    const messageText = `Please confirm, you're telling me that you wanna receive an alert on the email address ${data.email}, every day at ${data.time}, for the city of ${data.city}. Is this correct?`;
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
      let msg = "";
      if (result.data == 0) {
        msg = `Ops, I'm sorry but I cannot schedule depending on your choices.`;
      } else {
        msg = `Thank you! I have saved your schedule.`;
      }
      await stepContext.context.sendActivity(
        msg,
        msg,
        InputHints.IgnoringInput
      );
    }
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.AddAlertSchedulingDialog = AddAlertSchedulingDialog;
