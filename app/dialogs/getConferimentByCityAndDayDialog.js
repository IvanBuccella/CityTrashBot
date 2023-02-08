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

  async dayStep(stepContext) {
    const data = stepContext.options;

    data.city = stepContext.result;

    if (!data.day) {
      const messageText = "When would you put out your waste?";
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
    data.day = stepContext.result;
    const result = await axios({
      method: "post",
      url: process.env.FUNCTION_GET_CONFERIMENT_ENDPOINT,
      data: data,
    });
    let msg;
    if (result.data) {
      msg = `You have to put out the ${result.data}.`;
    } else {
      msg = `Sorry, I don't know what to put out in that day.`;
    }
    await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.GetConferimentByCityAndDayDialog =
  GetConferimentByCityAndDayDialog;
