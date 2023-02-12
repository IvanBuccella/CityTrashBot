module.exports = {
  promisifyManyArgs: function (f, manyArgs = false) {
    return function (...args) {
      return new Promise((resolve, reject) => {
        function callback(err, ...results) {
          // our custom callback for f
          if (err) {
            reject(err);
          } else {
            // resolve with all callback results if manyArgs is specified
            resolve(manyArgs ? results : results[0]);
          }
        }

        args.push(callback);

        f.call(this, ...args);
      });
    };
  },
};
