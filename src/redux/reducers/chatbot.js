import { CHATBOT_MESSAGES } from '../action-types';
import { fromResponse } from '../async-helpers';

export const chatbotMessages = fromResponse(
  CHATBOT_MESSAGES,
  ({ payload }) => payload.messages,
  [],
  (state) => {
    return state;
  },
);
