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
      if (
        params.day == undefined ||
        params.city == undefined ||
        params.day == "" ||
        params.city == ""
      ) {
        return null;
      }

      if (params.day == "yesterday") {
        params.day = this.weekday[new Date().getDay() - 1];
      } else if (params.day == "today") {
        params.day = this.weekday[new Date().getDay()];
      } else if (params.day == "tomorrow") {
        params.day = this.weekday[new Date().getDay() + 1];
      }

      await this.client.connect();
      return await this.client
        .db(process.env.DATABASE_NAME)
        .collection(process.env.DATABASE_CONFERIMENT_COLLECTION)
        .findOne(params);
    } finally {
      await this.client.close();
    }
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
