// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require("botbuilder");
const {
  CityTrashBotSpeechRecognizer,
} = require("../recognizers/speechRecognizer");
const ffmpeg = require("../resources/ffmpeg");
const fs = require("fs");

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
        try {
          const response = await fetch(fileURL);
          if (response.body) {
            let filename = "SpeechTotextTempFile.wav";
            fs.appendFile(filename, "", function (err) {});
            ffmpeg(response.body).output(filename).format("wav").save(filename);
            let text = await CityTrashBotSpeechRecognizer.recognizeAudio(
              fs.readFileSync(filename)
            );
            if (text == null) return;
            context.activity.text = text;
          }
        } catch (error) {
          console.log(error);
        }
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
