import firebase from "firebase/app";

export enum VideoChatRequestState {
  Invited = "Invited",
  Declined = "Declined",
  Accepted = "Accepted",
  Expired = "Expired",
}

export interface VideoChatRequest {
  hostUserId: string;
  hostUserLocation: string;
  invitedUserId: string;
  invitedUserLocation: string;
  state: VideoChatRequestState;
  createdAt: firebase.firestore.FieldValue;
}
