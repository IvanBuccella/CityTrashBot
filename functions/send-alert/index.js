const { Database } = require("../resources/database");
const { EmailClient } = require("@azure/communication-email");

module.exports = async function (context, sendEmailMessage) {
  sendEmailMessage.day = "today";

  const result = await Database.getInstance().getConferiment(sendEmailMessage);
  if (!result || result.length == 0) return;

  let type = "";
  result.forEach(function callback(element, index) {
    if (index > 0) {
      type += ", ";
    }
    type += element.type;
  });

  try {
    const emailMessage = {
      sender: process.env.SENDER_EMAIL_ADDRESS,
      content: {
        subject: "City Trash Bot Daily Reminder",
        plainText: `Hey! I'm here to remember that today you have to put out the door ${type} in ${sendEmailMessage.city}.`,
      },
      recipients: {
        to: [
          {
            email: sendEmailMessage.email,
          },
        ],
      },
    };
    context.log(
      await new EmailClient(
        process.env["COMMUNICATION_SERVICES_CONNECTION"]
      ).send(emailMessage)
    );
  } catch (e) {
    context.log(e);
  }
};
