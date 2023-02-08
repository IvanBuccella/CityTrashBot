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
const { Validator } = require("../resources/validator");

const CONFIRM_PROMPT = "confirmPrompt";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

class AddConferimentDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "addConferimentDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.cityStep.bind(this),
          this.dayStep.bind(this),
          this.typeStep.bind(this),
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

  async dayStep(stepContext) {
    const data = stepContext.options;

    data.city = stepContext.result;

    if (!data.day) {
      const messageText = "Let me know when.";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.day);
  }

  async typeStep(stepContext) {
    const data = stepContext.options;

    if (!Validator.isValidDay(stepContext.result)) {
      return await stepContext.replaceDialog("addConferimentDialog", data);
    }
    data.day = stepContext.result;

    if (!data.type) {
      const messageText =
        "Let me know the type (Dry, Glass, Multi-Material, Paper, Wet).";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(data.type);
  }

  async confirmStep(stepContext) {
    const data = stepContext.options;

    if (!Validator.isValidType(stepContext.result)) {
      return await stepContext.replaceDialog("addConferimentDialog", data);
    }
    data.type = stepContext.result;

    const messageText = `Please confirm, you said that the "${data.type}" in "${data.city}" is put out the door on "${data.day}". Is this correct?`;
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
        url: process.env.FUNCTION_ADD_CONFERIMENT_ENDPOINT,
        data: data,
      });
      let msg = "";
      if (result.data == 0) {
        msg = `Thank you, but I already knew :)`;
      } else {
        msg = `Thank you! I have stored your info.`;
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

module.exports.AddConferimentDialog = AddConferimentDialog;
