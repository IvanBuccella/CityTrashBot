// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require("botbuilder");
const axios = require("axios");
const {
  CityTrashBotSpeechRecognizer,
} = require("../recognizers/speechRecognizer");

class DialogBot extends ActivityHandler {
  /**
   *
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   */
  constructor(conversationState, userState, dialog) {
    super();
    if (!conversationState)
      throw new Error(
        "[DialogBot]: Missing parameter. conversationState is required"
      );
    if (!userState)
      throw new Error("[DialogBot]: Missing parameter. userState is required");
    if (!dialog)
      throw new Error("[DialogBot]: Missing parameter. dialog is required");

    this.conversationState = conversationState;
    this.userState = userState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty("DialogState");

    this.onMessage(async (context, next) => {
      if (
        context.activity.text == undefined &&
        context.activity.attachments != undefined &&
        context.activity.attachments.length > 0 &&
        context.activity.attachments[0].contentUrl.length > 0
      ) {
        const fileURL = context.activity.attachments[0].contentUrl;
        await axios
          .get(fileURL, {
            responseType: "arraybuffer",
          })
          .then(async (result) => {
            let text = await CityTrashBotSpeechRecognizer.recognizeAudio(
              result.data
            );
            if (text == null) return;
            context.activity.text = text;
          });
      }
      await this.dialog.run(context, this.dialogState);
      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.DialogBot = DialogBot;
