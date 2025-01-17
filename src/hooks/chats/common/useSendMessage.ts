import { useCallback } from "react";
import { useFirestore } from "reactfire";
import firebase from "firebase/app";
import { noop } from "lodash";

import { CHAT_MESSAGE_TIMEOUT } from "settings";

import {
  BaseChatMessage,
  SendChatMessage,
  SendChatMessageProps,
  SendMessagePropsBase,
  SendThreadMessageProps,
} from "types/chat";

import { buildBaseMessage, ExcludeBuiltMessage } from "utils/chat";
import { waitAtLeast } from "utils/promise";

import { useUser } from "hooks/useUser";

export const useSendChatMessage = <T extends BaseChatMessage>(
  chats: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>[],
  additionalMessageFields: ExcludeBuiltMessage<T>
): SendChatMessage<SendChatMessageProps> => {
  const getCollections = useCallback(() => chats, [chats]);
  const getAdditionalFields = useCallback(() => additionalMessageFields, [
    additionalMessageFields,
  ]);

  return useSendMessage<T, SendChatMessageProps>({
    getCollections,
    getAdditionalFields,
  });
};

export const useSendThreadMessage = <T extends BaseChatMessage>(
  chats: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>[],
  spreadOnMessage: ExcludeBuiltMessage<T>
): SendChatMessage<SendThreadMessageProps> => {
  const getCollections = useCallback(() => chats, [chats]);
  const getAdditionalFields: (
    props: SendThreadMessageProps
  ) => ExcludeBuiltMessage<T> = useCallback(
    ({ threadId }) => ({ threadId, ...spreadOnMessage }),
    [spreadOnMessage]
  );

  return useSendMessage<T, SendThreadMessageProps>({
    getCollections,
    getAdditionalFields,
  });
};

export interface UseSendMessageProps<
  T extends BaseChatMessage,
  K extends SendMessagePropsBase
> {
  getCollections: (
    props: K
  ) => firebase.firestore.CollectionReference<firebase.firestore.DocumentData>[];
  getAdditionalFields: (props: K) => ExcludeBuiltMessage<T>;
  processResultingBatch?: (
    props: K,
    batch: firebase.firestore.WriteBatch
  ) => void;
}

export const useSendMessage = <
  T extends BaseChatMessage,
  K extends SendMessagePropsBase
>({
  getCollections,
  getAdditionalFields,
  processResultingBatch = noop,
}: UseSendMessageProps<T, K>): SendChatMessage<K> => {
  const { userWithId } = useUser();
  const firestore = useFirestore();

  return useCallback(
    async (props) => {
      try {
        if (!userWithId) return;

        const processedMessage = buildBaseMessage<T>(props.text, userWithId, {
          ...getAdditionalFields(props),
        });

        const batch = firestore.batch();

        const collections = getCollections(props);
        collections.forEach((ref) => batch.set(ref.doc(), processedMessage));

        processResultingBatch(props, batch);

        await waitAtLeast(CHAT_MESSAGE_TIMEOUT, batch.commit());
      } catch (e) {
        console.error(e);
      }
    },
    [
      userWithId,
      getAdditionalFields,
      firestore,
      getCollections,
      processResultingBatch,
    ]
  );
};
