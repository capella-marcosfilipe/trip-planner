import cors from "@fastify/cors";
import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createActivity } from "./routes/activities/create-activity";
import { getActivities } from "./routes/activities/get-activities";
import { createLink } from "./routes/links/create-link";
import { getLinks } from "./routes/links/get-links";
import { confirmParticipant } from "./routes/participants/confirm-participant";
import { getParticipant } from "./routes/participants/get-participant";
import { getParticipants } from "./routes/participants/get-participants";
import { confirmTrip } from "./routes/trips/confirm-trip";
import { createInvite } from "./routes/trips/create-invite";
import { createTrip } from "./routes/trips/create-trip";
import { getTripDetails } from "./routes/trips/get-trip-details";
import { updateTrip } from "./routes/trips/update-trip";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: "*", // Qualquer endereço front-end pode acessar a minha aplicação
});

app.register(createTrip);
app.register(updateTrip);
app.register(confirmTrip);
app.register(getTripDetails);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(getParticipant);
app.register(createInvite);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running");
});
