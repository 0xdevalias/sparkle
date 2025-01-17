import React from "react";
import { useFirebase } from "react-redux-firebase";
import { useHistory } from "react-router-dom";
import { useAsyncFn } from "react-use";

import { generateAttendeeSpaceLandingUrl } from "utils/url";

import { useSpaceParams } from "hooks/spaces/useSpaceParams";
import { useUser } from "hooks/useUser";

import { ButtonNG } from "components/atoms/ButtonNG";
import { SparkleLogo } from "components/atoms/SparkleLogo";

import SHAPE_DENIED from "assets/images/access-forbidden.svg";

import "./Forbidden.scss";

export const Forbidden: React.FC = ({ children }) => {
  const { user } = useUser();
  const firebase = useFirebase();
  const history = useHistory();
  const { worldSlug, spaceSlug } = useSpaceParams();

  const [{ loading }, logout] = useAsyncFn(async () => {
    await firebase.auth().signOut();
    history.push(
      spaceSlug ? generateAttendeeSpaceLandingUrl(worldSlug, spaceSlug) : "/"
    );
  }, [firebase, history, worldSlug, spaceSlug]);

  return (
    <div className="Forbidden">
      <div className="Forbidden__message-container">
        <SparkleLogo className="Forbidden__logo" />
        <img
          className="Forbidden__denied-shape"
          alt="shape indicating denied access"
          src={SHAPE_DENIED}
        />
        <p className="Forbidden__title">Access Denied</p>
        <p>
          Oops. You cannot access this. Please log in with your enabled Sparkle
          account.
        </p>
        <p>
          If you don’t have an Account, please contact your event organiser.
        </p>
        {user && (
          <ButtonNG
            className="Forbidden__switch-button"
            variant="primary"
            loading={loading}
            disabled={loading}
            onClick={logout}
          >
            Log Out
          </ButtonNG>
        )}
      </div>
    </div>
  );
};
