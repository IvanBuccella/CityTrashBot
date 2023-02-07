const { Database } = require("../resources/database");

module.exports = async function (context, req) {
  if (!req.body) return;
  if (!req.body.city || !req.body.day) return;

  const result = await Database.getInstance().getConferiment(req.body);

  if (result == null || result.type == undefined) {
    return;
  }

  context.res = {
    body: result.type,
  };

  return;
};
