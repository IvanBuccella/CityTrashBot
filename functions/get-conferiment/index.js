const { Database } = require("../resources/database");

module.exports = async function (context, req) {
  if (!req.body) return;

  if (!req.body.city && (!req.body.day || !req.body.type)) return;

  let callType = 0;
  if (req.body.city && req.body.day) {
    callType = 1;
  }

  let result = {};
  if (callType == 1) {
    result = await Database.getInstance().getConferimentType(req.body);
  } else {
    result = await Database.getInstance().getConferimentDay(req.body);
  }
  if (!result || result.length == 0) return;

  let data = "";
  if (callType == 1) {
    result.forEach(function callback(element, index) {
      if (index > 0) {
        data += ", ";
      }
      data += element.type;
    });
  } else {
    result.forEach(function callback(element, index) {
      if (index > 0) {
        data += ", ";
      }
      data += element.day;
    });
  }

  context.res = {
    body: data,
  };

  return;
};
