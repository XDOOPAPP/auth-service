const app = require("./src/app");
const connectDB = require("./src/config/database");
const env = require("./src/config/env");
const EventBus = require("./src/infra/event-bus/event-bus");
const authRoutes = require('./src/routes/auth.route');


(async () => {
  // 1. connect database
  await connectDB();

  // 2. connect event bus
  const bus = new EventBus(env.rabbitMQ_url);
  await bus.connect();

  // 3. inject bus cho app
  app.set("eventBus", bus);

  // 4. user route
  app.use("/api/v1/auth", authRoutes(app));

  // 5. start server
  app.listen(env.port, () => {
    console.log(`🚀 Auth Service running on port ${env.port}`);
  });
})();
