const app = require("./src/app");
const connectDB = require("./config/database");
const env = require("./config/env");

(async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Auth Service running on port ${env.port}`);
  });
})();
