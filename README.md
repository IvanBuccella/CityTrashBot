# City Trash Bot

Dry, Multi-material, Wet, Paper, Glass? What should I put out the door today? Feel free to ask CityTrashBot!
CityTrashBot is the bot to stay up to date on waste disposal in your municipality.
It will be enough to interact with him and immediately receive a detailed answer.
Furthermore, you will be able to receive push notifications based on your preferences agreed with CityTrashBot, you can write or talk to him but, please, don't be bad, he can be hurt.

This bot has been created using [Bot Framework](https://dev.botframework.com) and uses [LUIS](https://www.luis.ai), an AI based cognitive service, to implement language understanding.

## Tutorial Structure

- **[Installation](#installation)**
  - **[Prerequisites](#prerequisites)**
  - **[Repository](#repository)**
  - **[Environment variables](#environment-variables)**
  - **[Install required Modules](#install-required-modules)**
  - **[Run the bot](#run-the-bot)**

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

### Repository

Clone the repository:

```sh
$ git clone https://github.com/IvanBuccella/CityTrashBot
```

### Environment Variables

Set your own environment variables by using the `.env-sample` file. You can just duplicate and rename it in `.env`.
Set your own template parameters by editing the `template-parameters.json` file.

### Install required Modules

Install all the required packages:

```sh
$ npm install
```

### Run The Bot

#### Run the bot locally

```sh
$ npm start
```

And then connect to the bot using Bot Framework Emulator:

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

#### Deploy the bot to Azure

```sh
$ az deployment group create --resource-group `your resource group name` --template-file template.json --parameters @template-parameters.json
```
