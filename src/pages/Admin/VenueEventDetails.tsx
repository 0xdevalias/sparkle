import dayjs from "dayjs";
import React from "react";
import { VenueEvent } from "types/VenueEvent";
import { WithId } from "utils/id";
import { dateEventTimeFormat } from "utils/time";

interface Props {
  venueEvent: WithId<VenueEvent>;
  setEditedEvent: Function | undefined;
  setShowCreateEventModal: Function;
  setShowDeleteEventModal: Function;
}

const VenueEventDetails = ({
  venueEvent,
  setEditedEvent,
  setShowCreateEventModal,
  setShowDeleteEventModal,
}: Props) => {
  const startingDate = new Date(venueEvent.start_utc_seconds * 1000);
  const endingDate = new Date(
    (venueEvent.start_utc_seconds + 60 * venueEvent.duration_minutes) * 1000
  );

  return (
    <div>
      <div className="date">
        {`${dateEventTimeFormat(startingDate)}-${dateEventTimeFormat(
          endingDate
        )}
      ${dayjs(startingDate).format("dddd MMMM Do")}`}
      </div>
      <div className="event-description">
        {venueEvent.description}
        {venueEvent.descriptions?.map((description, index) => (
          <p key={index}>{description}</p>
        ))}
      </div>
      <div className="button-container">
        <div className="price-container">
          {venueEvent.price > 0 && (
            <>Individual tickets £{venueEvent.price / 100}</>
          )}
        </div>
        <div className="event-payment-button-container">
          <div>
            <button
              role="link"
              className="btn btn-primary buy-tickets-button"
              onClick={() => {
                setEditedEvent && setEditedEvent(venueEvent);
                setShowCreateEventModal(true);
              }}
            >
              Edit
            </button>
            <button
              role="link"
              className="btn btn-primary buy-tickets-button"
              onClick={() => {
                setEditedEvent && setEditedEvent(venueEvent);
                setShowDeleteEventModal(true);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueEventDetails;
