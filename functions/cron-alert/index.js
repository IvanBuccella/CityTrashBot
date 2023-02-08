const { Database } = require("../resources/database");

module.exports = async function (context, myTimer) {
  const hours = new Date()
    .getHours()
    .toLocaleString("en-US", {
      timeZone: "Europe/Rome",
    })
    .padStart(2, "0");
  const minutes = new Date()
    .getMinutes()
    .toLocaleString("en-US", {
      timeZone: "Europe/Rome",
    })
    .padStart(2, "0");
  const result = await Database.getInstance().getAllAlerts({
    time: hours + ":" + minutes,
  });

  if (result == undefined || result.length == 0) return;

  context.bindings.sendEmailMessage = [];

  result.forEach((element) => {
    context.bindings.sendEmailMessage.push(element);
  });
};
