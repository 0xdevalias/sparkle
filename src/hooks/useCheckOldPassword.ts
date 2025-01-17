import { useCallback } from "react";
import { useFirebase } from "react-redux-firebase";

import { useUser } from "hooks/useUser";

export const useCheckOldPassword = () => {
  const firebase = useFirebase();
  const { user } = useUser();
  const email = user?.email;

  return useCallback(
    async (oldPassword: string) => {
      if (!email) return;

      try {
        await firebase.auth().signInWithEmailAndPassword(email, oldPassword);
        return true;
      } catch {
        return false;
      }
    },
    [email, firebase]
  );
};
