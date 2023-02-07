const { Database } = require("../resources/database");

module.exports = async function (context, req) {
  context.res = {
    body: 0,
  };
  if (!req.body) return;
  if (!req.body.city || !req.body.day || !req.body.type) return;

  const result = await Database.getInstance().insertConferiment(req.body);

  if (result === false) {
    return;
  }

  context.res = {
    body: 1,
  };

  return;
};
