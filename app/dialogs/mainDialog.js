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
const {
  CityTrashBotContentModerator,
} = require("../recognizers/contentModerator.js");
const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";
const TEXT_PROMPT = "TextPrompt";

const INTENT_MENU = "menu";
const INTENT_START = "/start";

const MAIN_DIALOG = "MainDialog";
const GET_CONFERIMENT_BY_CITY_AND_DAY_DIALOG =
  "getConferimentByCityAndDayDialog";
const GET_CONFERIMENT_BY_CITY_AND_TYPE_DIALOG =
  "getConferimentByCityAndTypeDialog";
const ADD_CONFERIMENT_DIALOG = "addConferimentDialog";
const ADD_ALERT_SCHEDULING_DIALOG = "addAlertSchedulingDialog";

class MainDialog extends ComponentDialog {
  constructor(
    cityTrashBotRecognizer,
    getConferimentByCityAndDayDialog,
    getConferimentByCityAndTypeDialog,
    addConferimentDialog,
    addAlertSchedulingDialog
  ) {
    super(MAIN_DIALOG);

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
          this.loopStep.bind(this),
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
      : 'What can I help you with today? \n\n If you want to know what I can do for you write "menu" or send me an audio message.';
    const promptMessage = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepContext.prompt(TEXT_PROMPT, { prompt: promptMessage });
  }

  async menuStep(stepContext) {
    let message = stepContext.result.toLowerCase();

    await CityTrashBotContentModerator.isOffensive(message);

    if (message === INTENT_START) {
      return await stepContext.replaceDialog(MAIN_DIALOG);
    } else if (message === INTENT_MENU) {
      const reply = {
        type: ActivityTypes.Message,
      };
      const buttons = [
        {
          type: ActionTypes.ImBack,
          title: "What should I take out today?",
          value: "GetConferimentByCityAndDay",
        },
        {
          type: ActionTypes.ImBack,
          title: "When should I take out something?",
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

      await stepContext.context.sendActivity(reply);

      return await stepContext.prompt(TEXT_PROMPT, {
        prompt: "Select an option to proceed!",
      });
    } else {
      return await stepContext.next(message);
    }
  }

  async actStep(stepContext) {
    if (!this.cityTrashBotRecognizer.isConfigured) {
      return;
    }

    const option = stepContext.result.toLowerCase();

    await CityTrashBotContentModerator.isOffensive(option);

    const luisResult = await this.cityTrashBotRecognizer.executeLuisQuery(
      stepContext.context
    );
    const luisIntent = LuisRecognizer.topIntent(luisResult).toLowerCase();
    if (
      option == "getconferimentbycityandday" ||
      luisIntent == "getconferimentbycityandday"
    ) {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.day = this.cityTrashBotRecognizer.getDay(luisResult);

      return await stepContext.beginDialog(
        GET_CONFERIMENT_BY_CITY_AND_DAY_DIALOG,
        data
      );
    } else if (
      option == "getconferimentbycityandtype" ||
      luisIntent == "getconferimentbycityandtype"
    ) {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.type = this.cityTrashBotRecognizer.getType(luisResult);

      return await stepContext.beginDialog(
        GET_CONFERIMENT_BY_CITY_AND_TYPE_DIALOG,
        data
      );
    } else if (option == "addconferiment" || luisIntent == "addconferiment") {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.day = this.cityTrashBotRecognizer.getDay(luisResult);
      data.type = this.cityTrashBotRecognizer.getType(luisResult);

      return await stepContext.beginDialog(ADD_CONFERIMENT_DIALOG, data);
    } else if (
      option == "addalertscheduling" ||
      luisIntent == "addalertscheduling"
    ) {
      const data = {};

      data.city = this.cityTrashBotRecognizer.getCity(luisResult);
      data.email = this.cityTrashBotRecognizer.getEmail(luisResult);
      data.time = this.cityTrashBotRecognizer.getTime(luisResult);

      return await stepContext.beginDialog(ADD_ALERT_SCHEDULING_DIALOG, data);
    } else if (option === INTENT_START) {
      return await stepContext.replaceDialog(MAIN_DIALOG);
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
  async loopStep(stepContext) {
    // Restart the main dialog with a different message the second time around
    return await stepContext.replaceDialog(this.initialDialogId, {
      restartMsg:
        'What else can I do for you? If you want to know what I can do for you write "menu".',
    });
  }
}

module.exports.MainDialog = MainDialog;
