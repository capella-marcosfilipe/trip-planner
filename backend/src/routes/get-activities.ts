import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { dayjs } from "../lib/dayjs";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/activities",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req) => {
      const { tripId } = req.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          activities: {
            orderBy: {
              occurs_at: "asc",
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      // Organizing trips by date

      // Retrieving the difference in days bvetween the start date and the end
      const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
        trip.starts_at,
        "days"
      );
      // Creating an array with the length for every day in the trip
      const activities = Array.from({
        length: differenceInDaysBetweenTripStartAndEnd + 1,
      }).map((_, index) => {
        // I'll map it to name it as every day of the trip
        const date = dayjs(trip.starts_at).add(index, "days");
        return {
          date: date.toDate(),
          activities: trip.activities.filter((activity) => {
            return dayjs(activity.occurs_at).isSame(date, "day");
          }),
        };
      });

      return { activities };
    }
  );
}
