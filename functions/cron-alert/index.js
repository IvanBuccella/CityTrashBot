const { Database } = require("../resources/database");

module.exports = async function (context, myTimer) {
  var date = new Date();

  const result = await Database.getInstance().getAllAlerts({
    time:
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0"),
  });

  if (result == undefined || result.length == 0) return;

  context.bindings.sendEmailMessage = [];

  result.forEach((element) => {
    context.bindings.sendEmailMessage.push(element);
  });
};
