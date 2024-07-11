import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InviteGuestsModal } from "./invite-guests-modal";
import { ConfirmTripModal } from "./confirm-trip-modal";
import { DestinationAndDateStep } from "./steps/destination-and-date-step";
import { InviteGuestsStep } from "./steps/invite-guests-step";
import { api } from "../../lib/axios";
import { DateRange } from "react-day-picker";

export function CreateTripPage() {
  const navigate = useNavigate();

  const [isGuestsInputOpen, setIsGuestsInputOpen] = useState(false);
  const [isGuestsModalOpen, setIsGuestsModalOpen] = useState(false);
  const [isConfirmTripModalOpen, setIsConfirmTripModalOpen] = useState(false);
  const [emailsToInvite, setEmailsToInvite] = useState([
    "marcoscapella@outlook.com",
  ]);

  //Informations I need to send to the back end.
  //For each component where the user will input data, I'll send a setter function to update the state.
  const [destination, setDestination] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [eventStartAndEndDates, setEventStartAndEndDates] = useState<
    DateRange | undefined
  >();

  function openGuestsInput() {
    setIsGuestsInputOpen(true);
  }

  function closeGuestsInput() {
    setIsGuestsInputOpen(false);
  }

  function openGuestsModal() {
    setIsGuestsModalOpen(true);
  }

  function closeGuestsModal() {
    setIsGuestsModalOpen(false);
  }

  function openConfirmTripModal() {
    setIsConfirmTripModalOpen(true);
  }

  function closeConfirmTripModal() {
    setIsConfirmTripModalOpen(false);
  }

  function addNewEmailToInvite(event: FormEvent<HTMLFormElement>) {
    // Prevent the form from submitting
    event.preventDefault();

    // Get the email from the form
    const data = new FormData(event.currentTarget);
    const email = data.get("email")?.toString();

    // If the email is empty, do nothing
    if (!email) return;

    // If the email is already in the list of emails to invite, do nothing
    if (emailsToInvite.includes(email)) {
      return;
    }

    // Add the email to the list of emails to invite
    setEmailsToInvite([...emailsToInvite, email]);

    // Reset the form, so it'll be blank again
    event.currentTarget.reset();
  }

  function removeEmailFromInvite(emailToRemove: string) {
    // I create a new list of emails to invite, excluding the email I want to remove
    const newEmailList = emailsToInvite.filter(
      (invited) => invited !== emailToRemove
    );
    // I update the state with the new list of emails to invite
    setEmailsToInvite(newEmailList);
  }

  //Where we connect o the back end
  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log(destination);
    console.log(eventStartAndEndDates);
    console.log(emailsToInvite);
    console.log(ownerName);
    console.log(ownerEmail);

    if (!destination) {
      return;
    }

    if (!eventStartAndEndDates?.from || !eventStartAndEndDates?.to) {
      return;
    }

    if (emailsToInvite.length === 0) {
      return;
    }

    if (!ownerEmail || !ownerName) {
      return;
    }

    const response = await api.post("/trips", {
      destination,
      starts_at: eventStartAndEndDates.from,
      ends_at: eventStartAndEndDates.to,
      emails_to_invite: emailsToInvite,
      owner_name: ownerName,
      owner_email: ownerEmail,
    });

    const { tripId } = response.data;

    console.log(`Trip created sucessfully! Id: ${tripId}`);

    navigate(`/trips/${tripId}`);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-pattern bg-no-repeat bg-center">
      <div className="max-w-3xl w-full px-6 text-center space-y-10">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.svg" alt="Plann.er" />
          <p className="text-zinc-300 text-lg">
            Convide seus amigos e planeje sua próxima viagem!
          </p>
        </div>

        <div className="space-y-4">
          <DestinationAndDateStep
            isGuestsInputOpen={isGuestsInputOpen}
            openGuestsInput={openGuestsInput}
            closeGuestsInput={closeGuestsInput}
            setDestination={setDestination}
            setEventStartAndEndDates={setEventStartAndEndDates}
            eventStartAndEndDates={eventStartAndEndDates}
          />

          {isGuestsInputOpen && (
            <InviteGuestsStep
              openGuestsModal={openGuestsModal}
              openConfirmTripModal={openConfirmTripModal}
              emailsToInvite={emailsToInvite}
            />
          )}
        </div>

        <p className="text-sm text-zinc-500">
          Ao planejar sua viagem pela plann.er você automaticamente concorda{" "}
          <br /> com nossos{" "}
          <a className="text-zinc-300 underline" href="#">
            termos de uso
          </a>{" "}
          e{" "}
          <a className="text-zinc-300 underline" href="#">
            políticas de privacidade
          </a>
          .
        </p>
      </div>

      {isGuestsModalOpen && (
        <InviteGuestsModal
          emailsToInvite={emailsToInvite}
          addNewEmailToInvite={addNewEmailToInvite}
          removeEmailFromInvite={removeEmailFromInvite}
          closeGuestsModal={closeGuestsModal}
        />
      )}

      {isConfirmTripModalOpen && (
        <ConfirmTripModal
          closeConfirmTripModal={closeConfirmTripModal}
          createTrip={createTrip}
          setOwnerName={setOwnerName}
          setOwnerEmail={setOwnerEmail}
        />
      )}
    </div>
  );
}
