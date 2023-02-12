const axios = require("axios");
const { InputHints } = require("botbuilder");
/*
https://learn.microsoft.com/en-us/azure/cognitive-services/content-moderator/text-moderation-api#classification
- Category1: refers to potential presence of language that may be considered sexually explicit or adult in certain situations.
- Category2 refers to potential presence of language that may be considered sexually suggestive or mature in certain situations.
- Category3 refers to potential presence of language that may be considered offensive in certain situations.
*/
class CityTrashBotContentModerator {
  static async isOffensive(text) {
    if (text == undefined || text.length == 0) return false;
    const result = await axios({
      method: "post",
      url: process.env.CONTENT_MODERATOR_ENDPOINT,
      data: text,
      params: { classify: true },
      headers: {
        "Content-Type": "text/plain",
        "Ocp-Apim-Subscription-Key ":
          process.env.CONTENT_MODERATOR_SUBSCRIPTION_KEY,
      },
    }).catch(function (e) {
      return false;
    });
    if (
      !result ||
      !result.data ||
      !result.data.Classification ||
      !result.data.Classification.ReviewRecommended
    )
      return false;
    throw new Error(
      JSON.stringify({
        isOffensive: true,
      })
    );
  }
}
module.exports.CityTrashBotContentModerator = CityTrashBotContentModerator;
