const app = require("./src/app");
const connectDB = require("./src/config/database");
const env = require("./src/config/env");

(async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Auth Service running on port ${env.port}`);
  });
})();

