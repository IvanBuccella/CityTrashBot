const { MongoClient } = require("mongodb");
const isValidTime = (str) => /^[01][0-9]:[0-5][0-9]$/.test(str);
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
const types = ["recyclable", "glass", "generalwaste", "paper", "food"];
const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

class Database {
  static _instance;

  constructor() {
    this.client = new MongoClient(
      process.env.DATABASE_URL + "?authMechanism=DEFAULT",
      {
        useUnifiedTopology: true,
      }
    );
  }

  async getConferiment(params) {
    params.city = this.validateInputCity(params.city);
    params.day = this.validateInputDay(params.day);
    params.type = this.validateInputType(params.type);
    try {
      if (
        params.city == undefined ||
        params.day == undefined ||
        params.type == undefined
      ) {
        return null;
      }
      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .find({ city: params.city, day: params.day, type: params.type })
        .toArray();
    } finally {
      await this.client.close();
    }
  }

  async getConferimentType(params) {
    params.city = this.validateInputCity(params.city);
    params.day = this.validateInputDay(params.day);
    try {
      if (params.day == undefined || params.city == undefined) {
        return null;
      }
      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .find({ city: params.city, day: params.day })
        .toArray();
    } finally {
      await this.client.close();
    }
  }

  async getConferimentDay(params) {
    params.city = this.validateInputCity(params.city);
    params.type = this.validateInputType(params.type);
    try {
      if (params.city == undefined || params.type == undefined) {
        return null;
      }
      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .find({ city: params.city, type: params.type })
        .toArray();
    } finally {
      await this.client.close();
    }
  }

  async insertConferiment(params) {
    params.city = this.validateInputCity(params.city);
    params.day = this.validateInputDay(params.day);
    params.type = this.validateInputType(params.type);
    try {
      if (
        params.day == undefined ||
        params.city == undefined ||
        params.type == undefined
      ) {
        return false;
      }
      const found = await this.getConferiment(params);
      await this.client.connect();
      if (found && found.length > 0) return false;
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .insertOne({ city: params.city, day: params.day, type: params.type });
    } finally {
      await this.client.close();
    }
  }

  async getAlert(params) {
    params.city = this.validateInputCity(params.city);
    params.email = this.validateInputEmail(params.email);
    params.time = this.validateInputTime(params.time);
    try {
      if (
        params.city == undefined ||
        params.email == undefined ||
        params.time == undefined
      ) {
        return null;
      }
      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_ALERT_COLLECTION)
        .findOne({ city: params.city, email: params.email, time: params.time });
    } finally {
      await this.client.close();
    }
  }

  async insertAlertSchedule(params) {
    params.city = this.validateInputCity(params.city);
    params.email = this.validateInputEmail(params.email);
    params.time = this.validateInputTime(params.time);
    try {
      if (
        params.city == undefined ||
        params.email == undefined ||
        params.time == undefined
      ) {
        return false;
      }
      const found = await this.getAlert(params);
      await this.client.connect();
      if (found) return false;
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_ALERT_COLLECTION)
        .insertOne({
          city: params.city,
          email: params.email,
          time: params.time,
        });
    } finally {
      await this.client.close();
    }
  }

  async getAllAlerts(params) {
    params.time = this.validateInputTime(params.time);
    try {
      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_ALERT_COLLECTION)
        .find(params)
        .toArray({
          time: params.time,
        });
    } finally {
      await this.client.close();
    }
  }

  validateInputTime(inputTime) {
    if (inputTime === undefined) return undefined;
    inputTime = inputTime.toLowerCase().replace(/\s+/g, "");
    if (inputTime.length == 0) return undefined;
    if (!isValidTime(inputTime)) return undefined;
    return inputTime;
  }

  validateInputEmail(inputEmail) {
    if (inputEmail === undefined) return undefined;
    inputEmail = inputEmail.toLowerCase().replace(/\s+/g, "");
    if (inputEmail.length == 0) return undefined;
    if (!isValidEmail(inputEmail)) return undefined;
    return inputEmail;
  }

  validateInputType(inputType) {
    if (inputType === undefined) return undefined;
    inputType = inputType.toLowerCase().replace(/\s+/g, "");
    inputType = inputType.replace("-", "");
    if (inputType.length == 0) return undefined;
    if (!types.includes(inputType)) return undefined;
    return inputType;
  }

  validateInputCity(inputCity) {
    if (inputCity === undefined) return undefined;
    inputCity = inputCity.toLowerCase().replace(/\s+/g, "");
    if (inputCity.length == 0) return undefined;
    return inputCity;
  }

  validateInputDay(inputDay) {
    if (inputDay === undefined) return undefined;
    inputDay = inputDay.toLowerCase().replace(/\s+/g, "");
    if (inputDay.length == 0) return undefined;
    const today = new Date().getDay();
    if (inputDay == "yesterday") {
      return weekdays[today - 1];
    } else if (inputDay == "today") {
      return weekdays[today];
    } else if (inputDay == "tomorrow") {
      return weekdays[today + 1];
    }
    if (!weekdays.includes(inputDay)) return undefined;
    return inputDay;
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new Database();
    return this._instance;
  }
}

module.exports.Database = Database;
