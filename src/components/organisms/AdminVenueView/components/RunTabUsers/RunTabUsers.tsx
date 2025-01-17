import React from "react";
import { useAsync } from "react-use";

import { ALWAYS_EMPTY_ARRAY } from "settings";

import { getUserRef } from "api/profile";

import { User } from "types/User";
import { AnyVenue } from "types/venues";

import { WithId, withId } from "utils/id";

import { useShowHide } from "hooks/useShowHide";

import { VenueOwnersModal } from "pages/Admin/VenueOwnersModal";

import { RunTabUserInfo } from "components/organisms/AdminVenueView/components/RunTabUserInfo";

import { ButtonNG } from "components/atoms/ButtonNG";

import "./RunTabUsers.scss";

interface RunTabSidebarProps {
  venue?: WithId<AnyVenue>;
}

export const RunTabUsers: React.FC<RunTabSidebarProps> = ({ venue }) => {
  const {
    isShown: isShownInviteAdminModal,
    show: showInviteAdminModal,
    hide: hideInviteAdminModal,
  } = useShowHide();

  const owners = venue?.owners ?? ALWAYS_EMPTY_ARRAY;

  const { value: admins = ALWAYS_EMPTY_ARRAY } = useAsync(
    async () =>
      Promise.all(owners.map((owner) => getUserRef(owner).get())).then((docs) =>
        docs.map((doc) => withId(doc.data() as User, doc.id))
      ),
    [owners]
  );

  if (!venue) {
    return null;
  }

  return (
    <div className="RunTabUsers">
      <div className="RunTabUsers__row RunTabUsers__manage">
        <span className="RunTabUsers__info">
          {admins.length} admin{admins.length !== 1 && "s"} online
        </span>
        <ButtonNG onClick={showInviteAdminModal}>Invite admin</ButtonNG>
      </div>
      <VenueOwnersModal
        visible={isShownInviteAdminModal}
        onHide={hideInviteAdminModal}
        venue={venue}
      />
      {admins.map((user) => (
        <RunTabUserInfo key={user.id} user={user} />
      ))}
    </div>
  );
};
