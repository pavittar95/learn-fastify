import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./plugins/user-routes";
import dbConnector from "./plugins/dbConnector";
import { FastifyMongoNestedObject, FastifyMongoObject } from "@fastify/mongodb";

declare module "fastify" {
  interface FastifyRequest {
    user: { name: string };
  }
  interface FastifyInstance {
    signJwt: () => string;
    verifyJwt: () => { name: string };
    mongo: FastifyMongoObject & FastifyMongoNestedObject;
  }
}

const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

app.addSchema({
  $id: "userSchema",
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name", "age"],
});

app.get("/", async () => {
  return { message: "world" };
});

app.get(
  "/handler",
  {
    preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
      request.log.info("before handler");
    },
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info("handler");
    return {
      message: "hello",
      user: request.user,
      jwt: app.signJwt(),
      verifyJwt: app.verifyJwt(),
    };
  }
);

app.post("/api/handler", {
  handler: async (
    request: FastifyRequest<{ Body: { name: string; age: number } }>,
    reply: FastifyReply
  ) => {
    request.log.info("handler");
    const { name, age } = request.body;
    return { name, age };
  },
});

dbConnector(app);
app.register(userRoutes, { prefix: "/api/users" });

app.decorate("signJwt", () => {
  return "signJwt";
});

app.decorate("verifyJwt", () => {
  return {
    name: "pavittar",
  };
});

app.decorateRequest("user", null);

app.addHook(
  "onRequest",
  (request: FastifyRequest, reply: FastifyReply, next) => {
    request.log.info(`Server: onRequest ${request.url}`);
    next();
  }
);

app.addHook(
  "onResponse",
  (request: FastifyRequest, reply: FastifyReply, next) => {
    request.log.info(`Server: onResponse ${reply.getResponseTime()}`);
    next();
  }
);

app.addHook(
  "preHandler",
  (request: FastifyRequest, reply: FastifyReply, next) => {
    request.log.info("Hook: preHandler");
    request.user = { name: "pavittar" };
    next();
  }
);

const init = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    app.log.info(`Received signal ${signal}`);
    app.close().then(() => {
      app.log.info("Closed out remaining connections");
      process.exit(0);
    });
  });
});

init();
