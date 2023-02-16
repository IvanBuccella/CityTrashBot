# City Trash Bot

Recyclable, general waste, food, paper, glass... "What should I take out today?", "When Is the glass trash collected?" Feel free to ask CityTrashBot!

CityTrashBot is a Telegram bot created to stay up to date on waste disposal in your area.

Just interact with it via text or audio message, and immediately receive a detailed answer to all your questions! Just make sure to be mindful with your words…it might take offence!

With CityTrashBot it's possible to receive daily waste disposal email notifications based on your preference so it can keep you up to date on what’s going on with waste disposal in your area!

CityTrashBot has the following features:

- find out the type of waste to take out for collection in a specific city and day of the week;
- find out the day of waste collection of a specific type of waste in a specific city;
- schedule email alerts to receive every day at a specified time about waste collection for a specified city;
- train the bot to keep you updated based on your preferences.

## Architecture

The bot has been created using several [Azure](https://azure.microsoft.com) services, in particular:

- [LUIS](https://www.luis.ai), an AI based cognitive service, to implement language understanding;
- [Bot Service](https://azure.microsoft.com/en-us/products/bot-services), to build the bot;
- [Web App Service](https://azure.microsoft.com/en-us/products/app-service/web/), to implement the bot business logic;
- [Functions](https://azure.microsoft.com/en-us/products/functions/), to read/write the stored data and manage the notifications system;
- [Content Moderator](https://azure.microsoft.com/en-us/products/cognitive-services/content-moderator), to moderate the audio and text messages received from the bot;
- [Speech Service](https://azure.microsoft.com/en-us/products/cognitive-services/speech-services/), to allow the bot to receive and send audio messages;
- [Cosmos DB](https://azure.microsoft.com/en-us/products/cosmos-db/), to store the bot data into collections;
- [Service Bus](https://azure.microsoft.com/en-us/products/service-bus/), to allow communication between the different functions;
- [Communication Services & Email Communication Service](https://azure.microsoft.com/en-us/products/communication-services/), to deliver the emails to the bot users.

The picture below shows the bot architecture and the different services interaction:

![Alt text](deliverables/images/architecture.png?raw=true "Bot Architecture")

## Tutorial

This tutorial shows how to take advantage of the [Microsoft Bot Framework](https://dev.botframework.com/) and other [Azure](https://azure.microsoft.com) services to develop a bot to automate some functionalities of interest.

This tutorial also shows how to locally run the bot, and how to deploy it in Azure.

- **[Prerequisites](#prerequisites)**
- **[Repository](#repository)**
- **[Run the bot locally](#run-the-bot-locally)**
- **[Deploy the bot on Azure](#deploy-the-bot-on-azure)**

### Prerequisites

- If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free/?WT.mc_id=A261C142F) before you begin;
- [Visual Studio Code](https://www.visualstudio.com/downloads) or your favorite IDE, if you want to edit the bot code;
- Knowledge of [Node.js](https://nodejs.org), [restify](http://restify.com/) and asynchronous programming in JavaScript;
- [NVM Node Version Manager](https://github.com/nvm-sh/nvm)
- [Azure CLI](https://docs.microsoft.com/it-it/cli/azure/install-azure-cli);
- The [Bot Framework SDK](https://github.com/microsoft/botbuilder-js) for JavaScript;
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator);
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local);
- [Azurite emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio);
- [Azure Speech SDK](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstarts/setup-platform?pivots=programming-language-javascript) for JavaScript.

### Repository

Clone the repository:

```sh
$ git clone https://github.com/IvanBuccella/CityTrashBot
```

### Run the bot locally

#### Environment Variables

- Move into the `app` folder, and create your own environment variables `.env` file by using the `.env-sample` file.
- Move into the `functions` folder, and create your own settings variables `local.settings.json` file by using the `local.settings.sample.json` file.

#### Install required Modules

Move into the `app` folder, and install all the required packages:

```sh
$ cd app
$ nvm use
$ npm install
```

Move into the `functions` folder, and install all the required packages:

```sh
$ cd functions
$ nvm use
$ npm install
```

#### Run

Since the Azurite emulator is required for running locally the Azure functions, you need to start it:

```sh
$ cd functions
$ azurite --silent --location azurite
```

Now, run the functions:

```sh
$ cd functions
$ nvm use
$ func start
```

And then, run the app:

```sh
$ cd app
$ nvm use
$ npm start
```

#### Connect to the local bot

You can connect to the bot using Bot Framework Emulator:

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter the Bot URL `http://{your hostname}:3978/api/messages`

### Deploy the bot on Azure

#### Create the Azure Resources

##### Resource Group

Create a new resource group named `city-trash-bot-resource-group` as described [here](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal#create-resource-groups).

###### Web App

Create a new Azure Web App Service resource named `city-trash-bot-app` as described [here](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=linux&pivots=development-environment-azure-portal#create-azure-resources) to get the `botEndpoint`.

###### Bot Service

- Create a new Azure Bot Service resource named `city-trash-bot` as described [here](https://learn.microsoft.com/en-us/composer/quickstart-create-bot-with-azure#create-an-azure-bot-resource), to get the `MicrosoftAppType`, `MicrosoftAppId` and `MicrosoftAppTenantId`.
- Connect the bot resource to Telegram as described [here](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-telegram?view=azure-bot-service-4.0#configure-telegram-in-the-azure-portal).

###### Service Bus

- Create a new Azure Service Bus resource named `city-trash-bot-service-bus` as described [here](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-portal#create-a-namespace-in-the-azure-portal), to get the `SERVICE_BUS_CONNECTION` string.
- Create a new Azure Service Bus Queue resource named `named city-trash-bot-queue` as described [here](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-portal#create-a-queue-in-the-azure-portal).

###### Azure Cosmos DB for MongoDB

- Create a new Azure Cosmos DB for MongoDB resource named `city-trash-bot-db` as described [here](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-portal#create-account), to get the `DATABASE_URL` (connection string), `DATABASE_NAME`.
- Create a new MongoDB collection named `alert`, to get the `DATABASE_ALERT_COLLECTION`.
- Create a new MongoDB collection named `conferiment`, to get the `DATABASE_CONFERIMENT_COLLECTION`.

###### Function App

Create a new Function App resource named `city-trash-bot-functions` as described [here](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node#publish-the-project-to-azure).

###### LUIS Service

- Create a new LUIS resource named `city-trash-bot-luis` as described [here](https://learn.microsoft.com/en-us/azure/cognitive-services/luis/how-to/sign-in#create-new-app-in-luis-using-portal), to get the `LuisAPIHostName`, `LuisAppId`, `LuisAPIKey`.
- Create a new conversation app named `city-trash-bot` by importing the `app/cognitiveModels/city-trash-bot.json` file.

###### Communication Service

- Create a new Communication Service resource named `city-trash-bot-communication-service` as described [here](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/create-communication-resource?tabs=windows&pivots=platform-azp#create-azure-communication-services-resource), to get the `COMMUNICATION_SERVICES_CONNECTION` string.
- Create a new Email Communication Service resource nnamed `city-trash-bot-email-communication-service` as described [here](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/create-email-communication-resource#create-the-email-communications-service-resource-using-portal);
- Create a new Email Communication Services Domain resource as described [here](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/add-azure-managed-domains), to get the `SENDER_EMAIL_ADDRESS`.

###### Speech service

Create a new [Speech Service](https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices) resource named `city-trash-bot-speech-services` in the Azure portal to get the resource `SPEECH_KEY` and `SPEECH_REGION`.

###### Content moderator

Create a new [Content moderator](https://portal.azure.com/#create/Microsoft.CognitiveServicesContentModerator) resource named `city-trash-bot-content-moderator` in the Azure portal to get `CONTENT_MODERATOR_ENDPOINT` (connection string) and `CONTENT_MODERATOR_SUBSCRIPTION_KEY`.

#### Environment Variables

- Move into the `app` folder, and set your own `template-parameters.json` file by editing the `template-parameters-sample.json` file.
- Move into the `app` folder, and set your own environment variables on the Azure Portal for the `Web App` service by using the `.env-sample` file.
- Move into the `functions` folder, and set your own environment variables on the Azure Portal for the `Function App` service by using the `local.settings.sample.json` file.

#### Deploy the Web App service

Zip your app code and then deploy to Azure:

```sh
$ cd app
$ zip -r build.zip . -x ".env" -x "template-parameters.json" -x "template.json" -x "package-lock.json" -x "*.nvmrc" -x "cognitiveModels"
$ az webapp deployment source config-zip --resource-group "city-trash-bot-resource-group" --name "city-trash-bot-app" --src "build.zip"
```

#### Deploy the Function App service

```sh
$ cd functions
$ func azure functionapp publish "city-trash-bot-functions"
```

#### Deploy the Bot service

```sh
$ cd app
$ az deployment group create --resource-group "city-trash-bot-resource-group" --template-file template.json --parameters @template-parameters.json
```

## Contributing

This project welcomes contributions and suggestions. If you use this code, please cite this repository.
