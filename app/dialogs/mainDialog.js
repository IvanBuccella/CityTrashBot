// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
  MessageFactory,
  InputHints,
  ActionTypes,
  ActivityTypes,
  CardFactory,
} = require("botbuilder");
const { LuisRecognizer } = require("botbuilder-ai");
const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");

const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";
const TEXT_PROMPT = "TextPrompt";

class MainDialog extends ComponentDialog {
  constructor(
    cityTrashBotRecognizer,
    getConferimentByCityAndDayDialog,
    getConferimentByCityAndTypeDialog,
    addConferimentDialog,
    addAlertSchedulingDialog
  ) {
    super("MainDialog");

    if (!cityTrashBotRecognizer)
      throw new Error(
        "[MainDialog]: Missing parameter 'cityTrashBotRecognizer' is required"
      );
    this.cityTrashBotRecognizer = cityTrashBotRecognizer;

    if (!getConferimentByCityAndDayDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'getConferimentByCityAndDayDialog' is required"
      );

    if (!getConferimentByCityAndTypeDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'getConferimentByCityAndTypeDialog' is required"
      );

    if (!addConferimentDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'addConferimentDialog' is required"
      );

    if (!addAlertSchedulingDialog)
      throw new Error(
        "[MainDialog]: Missing parameter 'addAlertSchedulingDialog' is required"
      );

    // Define the main dialog and its related components.
    // This is a sample "book a flight" dialog.
    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(getConferimentByCityAndDayDialog)
      .addDialog(getConferimentByCityAndTypeDialog)
      .addDialog(addConferimentDialog)
      .addDialog(addAlertSchedulingDialog)
      .addDialog(
        new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
          this.introStep.bind(this),
          this.menuStep.bind(this),
          this.actStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    this.initialDialogId = MAIN_WATERFALL_DIALOG;
  }

  /**
   * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
   * If no dialog is active, it will start the default dialog.
   * @param {*} turnContext
   * @param {*} accessor
   */
  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async introStep(stepContext) {
    if (!this.cityTrashBotRecognizer.isConfigured) {
      const messageText =
        "NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.";
      return await stepContext.context.sendActivity(
        messageText,
        null,
        InputHints.IgnoringInput
      );
    }

    const messageText = stepContext.options.restartMsg
      ? stepContext.options.restartMsg
      : 'What can I help you with today? \n\n If you want to know what I can do for you write "menu".';
    const promptMessage = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepContext.prompt(TEXT_PROMPT, { prompt: promptMessage });
  }

  async menuStep(step) {
    const message = step.result;

    if (message.toLowerCase() === "menu") {
      const reply = {
        type: ActivityTypes.Message,
      };
      const buttons = [
        {
          type: ActionTypes.ImBack,
          title: "What to put out of the door",
          value: "GetConferimentByCityAndDay",
        },
        {
          type: ActionTypes.ImBack,
          title: "When to put out of the door",
          value: "GetConferimentByCityAndType",
        },
        {
          type: ActionTypes.ImBack,
          title: "Train the bot",
          value: "AddConferiment",
        },
        {
          type: ActionTypes.ImBack,
          title: "Schedule an alert",
          value: "AddAlertScheduling",
        },
      ];

      const card = CardFactory.heroCard("", undefined, buttons, {
        text: "City Trash Bot menu",
      });

      reply.attachments = [card];

      await step.context.sendActivity(reply);

      return await step.prompt(TEXT_PROMPT, {
        prompt: "Select an option to proceed!",
      });
    } else {
      return await step.next(message);
    }
  }

  async actStep(stepContext) {
    if (!this.cityTrashBotRecognizer.isConfigured) {
      return;
    }

    const option = stepContext.result;
    const luisResult = await this.cityTrashBotRecognizer.executeLuisQuery(
      stepContext.context
    );
    const luisIntent = LuisRecognizer.topIntent(luisResult);
    if (
      option == "GetConferimentByCityAndDay" ||
      luisIntent == "GetConferimentByCityAndDay"
    ) {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.day = this.cityTrashBotRecognizer.getDay(luisResult);

      return await stepContext.beginDialog(
        "getConferimentByCityAndDayDialog",
        data
      );
    } else if (
      option == "GetConferimentByCityAndType" ||
      luisIntent == "GetConferimentByCityAndType"
    ) {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.type = this.cityTrashBotRecognizer.getType(luisResult);

      return await stepContext.beginDialog(
        "getConferimentByCityAndTypeDialog",
        data
      );
    } else if (option == "AddConferiment" || luisIntent == "AddConferiment") {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.day = this.cityTrashBotRecognizer.getDay(luisResult);
      data.type = this.cityTrashBotRecognizer.getType(luisResult);

      return await stepContext.beginDialog("addConferimentDialog", data);
    } else if (
      option == "AddAlertScheduling" ||
      luisIntent == "AddAlertScheduling"
    ) {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.email = this.cityTrashBotRecognizer.getEmail(luisResult);
      data.time = this.cityTrashBotRecognizer.getTime(luisResult);

      return await stepContext.beginDialog("addAlertSchedulingDialog", data);
    } else {
      // Catch all for unhandled intents
      const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way.`;
      await stepContext.context.sendActivity(
        didntUnderstandMessageText,
        didntUnderstandMessageText,
        InputHints.IgnoringInput
      );
    }
    return await stepContext.next();
  }

  /**
   * This is the final step in the main waterfall dialog.
   * It wraps up the sample "book a flight" interaction with a simple confirmation.
   */
  async finalStep(stepContext) {
    // Restart the main dialog with a different message the second time around
    return await stepContext.replaceDialog(this.initialDialogId, {
      restartMsg:
        'What else can I do for you? If you want to know what I can do for you write "menu".',
    });
  }
}

module.exports.MainDialog = MainDialog;
