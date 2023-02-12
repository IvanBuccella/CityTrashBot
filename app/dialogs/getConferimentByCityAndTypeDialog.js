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
const {
  CityTrashBotContentModerator,
} = require("../recognizers/contentModerator");

const CONFIRM_PROMPT = "confirmPrompt";
const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

class GetConferimentByCityAndTypeDialog extends CancelAndHelpDialog {
  constructor(id) {
    super(id || "getConferimentByCityAndTypeDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.cityStep.bind(this),
          this.typeStep.bind(this),
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

  async typeStep(stepContext) {
    const data = stepContext.options;

    if (await CityTrashBotContentModerator.isOffensive(stepContext.result)) {
      return await stepContext.replaceDialog(
        "getConferimentByCityAndTypeDialog",
        data
      );
    }
    data.city = stepContext.result;

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

  async resultStep(stepContext) {
    const data = stepContext.options;

    if (
      (await CityTrashBotContentModerator.isOffensive(stepContext.result)) ||
      !Validator.isValidType(stepContext.result)
    ) {
      return await stepContext.replaceDialog(
        "getConferimentByCityAndTypeDialog",
        data
      );
    }
    data.type = stepContext.result;
    const result = await axios({
      method: "post",
      url: process.env.FUNCTION_GET_CONFERIMENT_ENDPOINT,
      data: data,
    });
    let msg;
    if (result.data) {
      msg = `You have to put the "${data.type}" out the door in "${data.city}" on "${result.data}".`;
    } else {
      msg = `Sorry, I don't know when to put the "${data.type}" out the door in "${data.city}" :( But you can train me!`;
    }
    await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
    return await stepContext.endDialog();
  }

  isAmbiguous(timex) {
    const timexPropery = new TimexProperty(timex);
    return !timexPropery.types.has("definite");
  }
}

module.exports.GetConferimentByCityAndTypeDialog =
  GetConferimentByCityAndTypeDialog;
