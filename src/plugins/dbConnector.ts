import fastifyMongodb from "@fastify/mongodb";
import { FastifyInstance } from "fastify";

const dbConnector = async (app: FastifyInstance) => {
  try {
    // app.register(require("@fastify/mongodb"), {
    //   forceClose: true,
    //   database: "fastify",
    //   url: "mongodb://localhost:27017/fastify",
    // });
    app.register(fastifyMongodb, {
      forceClose: true,
      database: "fastify",
      url: "mongodb://localhost:27017/fastify",
    });
    app.log.info("MongoDB connected...");
    return app;
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

export default dbConnector;
