import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req, reply) => {
      const { tripId } = req.params;

      // Works like a join query
      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      if (trip.is_confirmed) {
        // Se a viagem já tiver sido confirmada
        return reply.redirect(`http://localhost:3000/trips/${tripId}`); // Redirecionar para o front end
      }

      // Atualizar status do participante para confirmado
      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true },
      });

      // Enviar e-mail para que os participantes confirmem
      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      // Método all aguarda várias promises terminarem. Vou enviar uma array de promises
      // O map cria uma array e vou criar promises com async
      await Promise.all(
        trip.participants.map(async (participant) => {
          const confirmationLink = `https://localhost:3333/trips/${trip.id}/confirm/${participant.id}}`;

          const message = await mail.sendMail({
            from: {
              name: "Equipe plann.er",
              address: "contato@plann.er",
            },
            to: participant.email,
            subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
            html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate} até ${formattedEndDate}</strong></p>
            <p></p>
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink}">Confirmar viagem</a>
            </p>
            <p></p>
            <p>Caso você não saiba do que se trata esse e-mail ou não poderá estar presente, apenas ignore esse e-mail.</p>
          </div>
        `.trim(),
          });

          console.log(nodemailer.getTestMessageUrl(message));
        })
      );

      return reply.redirect(`http://localhost:3000/trips/${tripId}`); // Redirecionar para o front end
    }
  );
}
