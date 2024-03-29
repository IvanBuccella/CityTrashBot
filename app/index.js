// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require("path");

// Note: Ensure you have a .env file and include LuisAppId, LuisAPIKey and LuisAPIHostName.
const ENV_FILE = path.join(__dirname, ".env");
require("dotenv").config({ path: ENV_FILE });

const restify = require("restify");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConversationState,
  createBotFrameworkAuthenticationFromConfiguration,
  InputHints,
  MemoryStorage,
  UserState,
} = require("botbuilder");

const {
  CityTrashBotRecognizer,
} = require("./recognizers/cityTrashBotRecognizer");

const { DialogAndWelcomeBot } = require("./bots/dialogAndWelcomeBot");

// This bot's main dialog.
const { MainDialog } = require("./dialogs/mainDialog");
const {
  GetConferimentByCityAndDayDialog,
} = require("./dialogs/getConferimentByCityAndDayDialog");
const {
  GetConferimentByCityAndTypeDialog,
} = require("./dialogs/getConferimentByCityAndTypeDialog");
const { AddConferimentDialog } = require("./dialogs/addConferimentDialog");
const {
  AddAlertSchedulingDialog,
} = require("./dialogs/addAlertSchedulingDialog");
const GET_CONFERIMENT_BY_CITY_AND_DAY_DIALOG =
  "getConferimentByCityAndDayDialog";
const GET_CONFERIMENT_BY_CITY_AND_TYPE_DIALOG =
  "getConferimentByCityAndTypeDialog";
const ADD_CONFERIMENT_DIALOG = "addConferimentDialog";
const ADD_ALERT_SCHEDULING_DIALOG = "addAlertSchedulingDialog";

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId,
});

const botFrameworkAuthentication =
  createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  try {
    let data = JSON.parse(error.message);
    if (data.isOffensive) {
      let message = "Please, don't be rude! You can hurt me :(";
      return await context.sendActivity(
        message,
        message,
        InputHints.ExpectingInput
      );
    }
  } catch (e) {}
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );
  // Send a message to the user
  let onTurnErrorMessage = "The bot encountered an error or bug.";
  await context.sendActivity(
    onTurnErrorMessage,
    onTurnErrorMessage,
    InputHints.ExpectingInput
  );
  onTurnErrorMessage =
    "To continue to run this bot, please fix the bot source code.";
  await context.sendActivity(
    onTurnErrorMessage,
    onTurnErrorMessage,
    InputHints.ExpectingInput
  );
  await conversationState.delete(context);
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig = {
  applicationId: LuisAppId,
  endpointKey: LuisAPIKey,
  endpoint: `https://${LuisAPIHostName}`,
};

const cityTrashBotRecognizer = new CityTrashBotRecognizer(luisConfig);

// Create the main dialog.
const getConferimentByCityAndDayDialog = new GetConferimentByCityAndDayDialog(
  GET_CONFERIMENT_BY_CITY_AND_DAY_DIALOG
);
const getConferimentByCityAndTypeDialog = new GetConferimentByCityAndTypeDialog(
  GET_CONFERIMENT_BY_CITY_AND_TYPE_DIALOG
);
const addConferimentDialog = new AddConferimentDialog(ADD_CONFERIMENT_DIALOG);
const addAlertSchedulingDialog = new AddAlertSchedulingDialog(
  ADD_ALERT_SCHEDULING_DIALOG
);
const dialog = new MainDialog(
  cityTrashBotRecognizer,
  getConferimentByCityAndDayDialog,
  getConferimentByCityAndTypeDialog,
  addConferimentDialog,
  addAlertSchedulingDialog
);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\n${server.name} listening to ${server.url}`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post("/api/messages", async (req, res) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res, (context) => bot.run(context));
});

// Listen for Upgrade requests for Streaming.
server.on("upgrade", async (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

  // Set onTurnError for the CloudAdapter created for each connection.
  streamingAdapter.onTurnError = onTurnErrorHandler;

  await streamingAdapter.process(req, socket, head, (context) =>
    bot.run(context)
  );
});
