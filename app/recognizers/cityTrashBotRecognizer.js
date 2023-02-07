// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require("botbuilder-ai");

class CityTrashBotRecognizer {
  constructor(config) {
    const luisIsConfigured =
      config && config.applicationId && config.endpointKey && config.endpoint;
    if (luisIsConfigured) {
      // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
      // More details can be found in https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/luis-migration-api-v3
      const recognizerOptions = {
        apiVersion: "v3",
      };

      this.recognizer = new LuisRecognizer(config, recognizerOptions);
    }
  }

  get isConfigured() {
    return this.recognizer !== undefined;
  }

  /**
   * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
   * @param {TurnContext} context
   */
  async executeLuisQuery(context) {
    return await this.recognizer.recognize(context);
  }

  getCity(result) {
    let value;
    if (result.entities.$instance.City) {
      value = result.entities.$instance.City[0].text;
    }
    return value;
  }

  getDay(result) {
    let value;
    if (result.entities.$instance.Day) {
      value = result.entities.$instance.Day[0].text;
    }
    return value;
  }

  getType(result) {
    let value;
    if (result.entities.$instance.Type) {
      value = result.entities.$instance.Type[0].text;
    }
    return value;
  }

  getEmail(result) {
    let value;
    if (result.entities.$instance.Email) {
      value = result.entities.$instance.Email[0].text;
    }
    return value;
  }

  getTime(result) {
    let value;
    if (result.entities.$instance.Time) {
      value = result.entities.$instance.Time[0].text;
    }
    return value;
  }
}

module.exports.CityTrashBotRecognizer = CityTrashBotRecognizer;
