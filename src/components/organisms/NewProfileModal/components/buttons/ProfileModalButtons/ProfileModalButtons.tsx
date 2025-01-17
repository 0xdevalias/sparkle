import React from "react";
import classNames from "classnames";

import { User } from "types/User";

import { WithId } from "utils/id";

import { useIsCurrentUser } from "hooks/useIsCurrentUser";

import { ButtonNG } from "components/atoms/ButtonNG";

import "./ProfileModalButtons.scss";

export interface ProfileModalButtonsProps {
  onClick: () => void;
  user: WithId<User>;
}

export const ProfileModalButtons: React.FC<ProfileModalButtonsProps> = ({
  onClick,
  user,
}) => {
  const isCurrentUser = useIsCurrentUser(user.id);

  return (
    <ButtonNG
      // @debt until temporarily disable is online functionality
      variant={!isCurrentUser ? "primary" : "secondary"}
      className={classNames("ProfileModalButtons", {
        // @debt until temporarily disable is online functionality
        // "ProfileModalButtons--online": !isCurrentUser && isOnline,
      })}
      onClick={onClick}
    >
      {isCurrentUser ? "Log out" : "Send message"}
    </ButtonNG>
  );
};
