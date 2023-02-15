# City Trash Bot

Dry, Multi-material, Wet, Paper, Glass... "What should I put out the door today?", "When should I put the glass out the door?" Feel free to ask CityTrashBot!

CityTrashBot is a Telegram bot to stay up to date on waste disposal in your municipality.

It will be enough to interact with it, via text or audio message, and immediately receive a detailed answer; but, please, be moderate with your words, it might take offense.

Furthermore, it's possible to receive daily waste disposal email notifications based on your preferences agreed with CityTrashBot, and you can train it about waste disposal in a certain municipality.

CityTrashBot provides the following features:

- obtain the type of waste disposal in a specific city and day of the week;
- obtain the day of waste disposal of a specific type of waste in a specific city;
- add the schedule of an email alert to receive every day at a specified time about waste disposal for a specified city;
- train the bot, by adding waste disposal of a specific type of waste in a city for a specific day;

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

The figure below shows the bot architecture and the different services interaction:

![Alt text](deliverables/images/architecture.png?raw=true "Bot Architecture")

## Tutorial

This tutorial aims to show how it is possible to take advantage of the [Microsoft Bot Framework](https://dev.botframework.com/) and other [Azure](https://azure.microsoft.com) services to develop a bot to automate some functionalities of interest.

This tutorial also shows how to locally run the bot, and how to deploy it Azure.

- **[Prerequisites](#prerequisites)**
- **[Repository](#repository)**
- **[Run the bot locally](#run-the-bot-locally)**
- **[Deploy the bot on Azure](#deploy-the-bot-on-azure)**

### Prerequisites

- If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free/?WT.mc_id=A261C142F) before you begin;
- [Visual Studio Code](https://www.visualstudio.com/downloads) or your favorite IDE, if you want to edit the bot code;
- Knowledge of [Node.js](https://nodejs.org), [restify](http://restify.com/) and asynchronous programming in JavaScript;
- [Azure CLI](https://docs.microsoft.com/it-it/cli/azure/install-azure-cli);
- The [Bot Framework SDK](https://github.com/microsoft/botbuilder-js) for JavaScript;
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator);
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local);
- [Azurite emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio);
- [Azure Speech SDK](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstarts/setup-platform?pivots=programming-language-javascript) for JavaScript;

### Repository

Clone the repository:

```sh
$ git clone https://github.com/IvanBuccella/CityTrashBot
```

### Run the bot locally

#### Environment Variables

Move into the `app` folder, and create your own environment variables `.env` file by using the `.env-sample` file.
Move into the `functions` folder, and create your own settings variables `local.settings.json` file by using the `local.settings.sample.json` file.

#### Install required Modules

Move into the `app` folder, and install all the required packages:

```sh
$ cd app
$ npm install
```

Move into the `functions` folder, and install all the required packages:

$ cd functions
$ npm install

#### Run

Since the Azurite emulator is required for running locally the Azure functions, you need to start it:

```sh
$ cd functions
$ azurite --silent --location azurite
```

Now, run the functions:

```sh
$ cd functions
$ func start
```

And then, run the app:

```sh
$ cd app
$ npm start
```

#### Connect to the local bot

You can connect to the bot using Bot Framework Emulator:

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter the Bot URL `http://{your hostname}:3978/api/messages`

### Deploy the bot on Azure

#### Environment Variables

- Move into the `app` folder, and set your own `template-parameters.json` file by editing the `template-parameters-sample.json` file.
- Move into the `app` folder, and set your own environment variables on the Azure Portal for the `Web App` service by using the `.env-sample` file.
- Move into the `functions` folder, and set your own environment variables on the Azure Portal for the `Function App` service by using the `local.settings.sample.json` file.

#### Deploy the Web App service

Zip your app code and then deploy to Azure:

```sh
$ cd app
$ zip -r build.zip . -x ".env" -x "template-parameters.json" -x "template.json" -x "package-lock.json" -x "*.nvmrc"
$ az webapp deployment source config-zip --resource-group "<resource-group-name>" --name "<name-of-web-app>" --src "build.zip"
```

#### Deploy the Function App service

```sh
$ cd functions
$ func azure functionapp publish "<function-app-name>"
```

#### Deploy the Bot service

```sh
$ cd app
$ az deployment group create --resource-group "<resource-group-name>" --template-file template.json --parameters @template-parameters.json
```

## Contributing

This project welcomes contributions and suggestions. If you use this code, please cite this repository.
