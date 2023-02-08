const { Database } = require("../resources/database");

module.exports = async function (context, req) {
  if (!req.body) return;
  if (!req.body.city || !req.body.day) return;

  const result = await Database.getInstance().getConferiment(req.body);
  if (!result || result.length == 0) return;

  let type = "";
  result.forEach(function callback(element, index) {
    if (index > 0) {
      type += ", ";
    }
    type += element.type;
  });

  context.res = {
    body: type,
  };

  return;
};
