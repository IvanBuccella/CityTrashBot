# City Trash Bot

Dry, Multi-material, Wet, Paper, Glass... "What should I put out the door today?", "When should I put the glass out the door?" Feel free to ask CityTrashBot!
CityTrashBot is a Telegram bot to stay up to date on waste disposal in your municipality.
It will be enough to interact with it, via text or audio message, and immediately receive a detailed answer; but, please, be moderate with your words, it might take offense.
Furthermore, it's possible to receive daily waste disposal email notifications based on your preferences agreed with CityTrashBot, and you can train it about waste disposal in a certain municipality.

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

## Tutorial Structure

- **[Installation](#installation)**
  - **[Prerequisites](#prerequisites)**
  - **[Repository](#repository)**
  - **[Environment variables](#environment-variables)**
  - **[Install required Modules](#install-required-modules)**
  - **[Run the bot locally](#run-the-bot-locally)**
  - **[Deploy the bot to Azure](#deploy-the-bot-to-azure)**

## Installation

### Prerequisites

- If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free/?WT.mc_id=A261C142F) before you begin.

- [Visual Studio Code](https://www.visualstudio.com/downloads) or your favorite IDE, if you want to edit the bot code.
- Knowledge of [restify](http://restify.com/) and asynchronous programming in JavaScript
- [Node.js](https://nodejs.org)
- [Azure CLI](https://docs.microsoft.com/it-it/cli/azure/install-azure-cli)
- [Microsoft Bot Framework Tools](https://github.com/Microsoft/botbuilder-tools)
- The [Bot Framework SDK](https://github.com/microsoft/botbuilder-js) for JavaScript
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator)
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure Speech SDK](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstarts/setup-platform?pivots=programming-language-javascript) for JavaScript

### Repository

Clone the repository:

```sh
$ git clone https://github.com/IvanBuccella/CityTrashBot
```

### Environment Variables

- If you run the bot locally, create your own environment variables `app/.env` file by using the `.env-sample` file.
- Set your own `template-parameters.json` file by editing the `template-parameters-sample.json` file.
- Set your own applications settings (environment variables) on the Azure Portal.

### Install required Modules

Install all the required packages:

```sh
$ cd functions
$ npm install
$ cd app
$ npm install
```

### Run the bot locally

```sh
$ cd functions
$ func start
$ cd app
$ npm start
```

And then connect to the bot using Bot Framework Emulator:

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

### Deploy the bot to Azure

#### Deploy the functions

```sh
$ cd functions
$ func azure functionapp publish "<function-app-name>"
```

#### Deploy the app service

Zip your app code and then deploy to Azure:

```sh
$ cd app
$ az webapp deployment source config-zip --resource-group "<resource-group-name>" --name "<name-of-web-app>" --src "<project-zip-path>"
```

#### Deploy the bot service

```sh
$ cd app
$ az deployment group create --resource-group "<resource-group-name>" --template-file template.json --parameters @template-parameters.json
```
