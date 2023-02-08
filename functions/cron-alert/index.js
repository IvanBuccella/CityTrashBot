const { Database } = require("../resources/database");

module.exports = async function (context, myTimer) {
  const time = new Intl.DateTimeFormat([], {
    hour12: false,
    hour: "numeric",
    minute: "numeric",
  }).format(new Date());
  const result = await Database.getInstance().getAllAlerts({
    time: time,
  });
  if (result == undefined || result.length == 0) return;

  context.bindings.sendEmailMessage = [];

  result.forEach((element) => {
    context.bindings.sendEmailMessage.push(element);
  });
};
