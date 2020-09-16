import React, { useState, useCallback, useMemo, useEffect } from "react";
import useConnectPartyGoers from "hooks/useConnectPartyGoers";
import { useSelector } from "hooks/useSelector";
import { BURN_START_UTC_SECONDS } from "settings";
import { IS_BURN } from "secrets";
import { PartyTitle } from "../PartyMap/components";
import UserList from "components/molecules/UserList";
import { CampRoomData } from "types/CampRoomData";
import CountDown from "components/molecules/CountDown";
import { Map } from "./components/Map";
import { RoomList } from "./components/RoomList";
import { RoomModal } from "./components/RoomModal";
import { CampVenue } from "types/CampVenue";
import ChatDrawer from "components/organisms/ChatDrawer";
import SparkleFairiesPopUp from "components/molecules/SparkleFairiesPopUp/SparkleFairiesPopUp";
import { peopleAttending, peopleByLastSeenIn } from "utils/venue";
import { useParams } from "react-router-dom";
import { InfoDrawer } from "components/molecules/InfoDrawer/InfoDrawer";
import { Modal } from "react-bootstrap";
import { SchedulePageModal } from "components/organisms/SchedulePageModal/SchedulePageModal";
import { useUser } from "hooks/useUser";
import { useLocationUpdateEffect } from "utils/useLocationUpdateEffect";

import "./Camp.scss";

const Camp: React.FC = () => {
  useConnectPartyGoers();
  const { user } = useUser();
  const { venueId } = useParams();
  useLocationUpdateEffect(user, venueId);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<CampRoomData>();
  const [showEventSchedule, setShowEventSchedule] = useState(false);

  const { partygoers, venue } = useSelector((state) => ({
    venue: state.firestore.ordered.currentVenue?.[0] as CampVenue,
    partygoers: state.firestore.ordered.partygoers,
  }));

  const usersInCamp = useMemo(
    () => venue && peopleAttending(peopleByLastSeenIn(partygoers), venue),
    [partygoers, venue]
  );

  const attendances = usersInCamp
    ? usersInCamp.reduce<Record<string, number>>((acc, value) => {
        acc[value.lastSeenIn] = (acc[value.lastSeenIn] || 0) + 1;
        return acc;
      }, {})
    : {};

  const modalHidden = useCallback(() => {
    setIsRoomModalOpen(false);
  }, []);

  const { roomTitle } = useParams();
  useEffect(() => {
    if (roomTitle) {
      const campRoom = venue?.rooms.find((room) => room.title === roomTitle);
      if (campRoom) {
        setSelectedRoom(campRoom);
        setIsRoomModalOpen(true);
      }
    }
  }, [roomTitle, setIsRoomModalOpen, setSelectedRoom, venue]);

  return (
    <div
      className="camp-container"
      style={{ marginLeft: 100, marginRight: 100 }}
    >
      <div className="small-right-margin">
        <PartyTitle
          startUtcSeconds={BURN_START_UTC_SECONDS}
          withCountDown={false}
        />
      </div>
      {usersInCamp && (
        <div className="col">
          <UserList
            users={usersInCamp}
            imageSize={50}
            disableSeeAll={false}
            isCamp={true}
          />
        </div>
      )}
      <div className="col">
        <div className="starting-indication">
          {venue.description?.text}{" "}
          {venue.description?.program_url && (
            <a
              href={venue.description.program_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Event Program here
            </a>
          )}
        </div>
        <CountDown startUtcSeconds={BURN_START_UTC_SECONDS} />
      </div>
      <div className="row">
        <Map
          venue={venue}
          attendances={attendances}
          setSelectedRoom={setSelectedRoom}
          setIsRoomModalOpen={setIsRoomModalOpen}
        />
      </div>
      <div className="row">
        <div className="col">
          <RoomList
            rooms={venue.rooms}
            attendances={attendances}
            setSelectedRoom={setSelectedRoom}
            setIsRoomModalOpen={setIsRoomModalOpen}
          />
        </div>
      </div>
      <RoomModal
        show={isRoomModalOpen}
        room={selectedRoom}
        onHide={modalHidden}
      />
      <div className="chat-pop-up" style={{ zIndex: 100 }}>
        <ChatDrawer
          roomName={venue.name}
          title={`${venue.name} Chat`}
          chatInputPlaceholder="Chat"
        />
      </div>
      {IS_BURN && (
        <div className="sparkle-fairies">
          <SparkleFairiesPopUp setShowEventSchedule={setShowEventSchedule} />
        </div>
      )}
      <div className="info-drawer-camp">
        <InfoDrawer venue={venue} />
      </div>
      <Modal
        show={showEventSchedule}
        onHide={() => setShowEventSchedule(false)}
        dialogClassName="custom-dialog"
      >
        <Modal.Body>
          <SchedulePageModal />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Camp;
