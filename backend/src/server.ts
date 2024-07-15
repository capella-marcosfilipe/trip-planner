import fastify from "fastify";
import cors from "@fastify/cors";
import { createTrip } from "./routes/create-trip";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { confirmTrip } from "./routes/confirm-trip";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: "*", // Qualquer endereço front-end pode acessar a minha aplicação
});

app.register(createTrip);
app.register(confirmTrip);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running");
});
