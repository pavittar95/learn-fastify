import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const userRoutes = async (app: FastifyInstance) => {
  app.get("/", async () => {
    return { message: "world" };
  });

  app.post(
    "/create",
    {
      schema: {
        body: {
          $ref: "userSchema#",
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              user: { type: "object" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { name: string; age: number };
      }>,
      reply: FastifyReply
    ) => {
      try {
        let user = await app.mongo.db
          ?.collection("users")
          .insertOne(request.body);
        return reply.code(201).send({ success: true });
      } catch (error: any) {
        return reply.code(404).send({
          success: false,
          error: error.message,
        });
      }
    }
  );
  app.log.info("user routes registered");
};

export default userRoutes;
