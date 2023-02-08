class Validator {
  static weekdays = [
    "yesterday",
    "today",
    "tomorrow",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  static types = ["dry", "glass", "multimaterial", "paper", "wet"];

  static isValidDay(inputDay) {
    if (inputDay === undefined) return false;
    inputDay = inputDay.toLowerCase().replace(/\s+/g, "");
    if (inputDay.length == 0) return false;
    if (!this.weekdays.includes(inputDay)) return false;
    return true;
  }

  static isValidType(inputType) {
    if (inputType === undefined) return false;
    inputType = inputType.toLowerCase().replace(/\s+/g, "");
    inputType = inputType.toLowerCase().replace("-", "");
    if (inputType.length == 0) return false;
    if (!this.types.includes(inputType)) return false;
    return true;
  }

  static isValidEmail(inputEmail) {
    if (inputEmail === undefined) return false;
    inputEmail = inputEmail.toLowerCase().replace(/\s+/g, "");
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail);
  }

  static isValidTime(inputTime) {
    if (inputTime === undefined) return false;
    inputTime = inputTime.toLowerCase().replace(/\s+/g, "");
    return /^[01][0-9]:[0-5][0-9]$/.test(inputTime);
  }
}

module.exports.Validator = Validator;
