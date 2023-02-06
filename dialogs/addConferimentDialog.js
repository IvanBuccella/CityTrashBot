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
const { Database } = require("../resources/database");

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

  async typeStep(stepContext) {
    const data = stepContext.options;

    data.day = stepContext.result;

    if (!data.type) {
      const messageText = "When do you put out in that day, there?";
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

    data.type = stepContext.result;

    const messageText = `Please confirm, you're telling me that you put out ${data.type} in ${data.city} on ${data.day}. Is this correct?`;
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
      const result = await Database.getInstance().insertConferiment({
        city: data.city.toLowerCase(),
        day: data.day.toLowerCase(),
        type: data.type.toLowerCase(),
      });
      let msg = "";
      if (result == true) {
        msg = `Thank you! I have saved your informations.`;
      } else {
        msg = `Thank you, but I already knew what to put out.`;
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
