const { MongoClient } = require("mongodb");

class Database {
  static _instance;

  constructor() {
    this.weekday = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    this.client = new MongoClient(
      process.env.DATABASE_URL + "?authMechanism=DEFAULT",
      {
        useUnifiedTopology: true,
      }
    );
  }

  async getConferiment(params) {
    try {
      params.day = this.formatInputDay(params.day);
      if (
        params.day == undefined ||
        params.city == undefined ||
        params.day == "" ||
        params.city == ""
      ) {
        return null;
      }
      params.day = params.day.toLowerCase();
      params.city = params.city.toLowerCase();
      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .findOne(params);
    } finally {
      await this.client.close();
    }
  }

  async insertConferiment(params) {
    try {
      params.day = this.formatInputDay(params.day);
      if (
        params.day == undefined ||
        params.city == undefined ||
        params.type == undefined ||
        params.day == "" ||
        params.city == "" ||
        params.type == ""
      ) {
        return false;
      }
      params.day = params.day.toLowerCase();
      params.city = params.city.toLowerCase();
      params.type = params.type.toLowerCase();
      const found = await this.getConferiment(params);
      await this.client.connect();
      if (found) return false;
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .insertOne(params);
    } finally {
      await this.client.close();
    }
  }

  formatInputDay(inputDay) {
    if (inputDay == "yesterday") {
      return this.weekday[new Date().getDay() - 1];
    } else if (inputDay == "today") {
      return this.weekday[new Date().getDay()];
    } else if (inputDay == "tomorrow") {
      return this.weekday[new Date().getDay() + 1];
    }
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
