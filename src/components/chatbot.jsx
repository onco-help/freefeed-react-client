import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Markdown from 'react-markdown';
import { getChatbotMessages, sendChatbotMessage } from '../redux/action-creators';
import ErrorBoundary from './error-boundary';

function withLayout(Component) {
  const wrapper = (props) => (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline" role="heading">
          Roadmap
        </div>
        <div className="box-body">
          <Component {...props} />
        </div>
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
  wrapper.displayName = `Layout(${Component.displayName || Component.name || 'unnamed'})`;
  return wrapper;
}

export default withLayout(function RoadmapChatbot() {
  const dispatch = useDispatch();
  const chatbotMessages = useSelector((state) => state.chatbotMessages);
  const lastMessage = useSelector((state) =>
    state.chatbotMessages.length > 0 ? state.chatbotMessages[state.chatbotMessages.length - 1] : {},
  );
  const buttons = useSelector(() => (lastMessage.Buttons ? JSON.parse(lastMessage.Buttons) : []));
  const status = useSelector((state) => state.appTokens.chatbotMessagesStatus || {});
  const [value, setValue] = useState('');

  useEffect(() => void dispatch(getChatbotMessages()), [dispatch]);

  const sendInput = (v) => {
    if (!v) {
      return;
    }

    dispatch(sendChatbotMessage(v));
    dispatch(getChatbotMessages());
    setValue('');

    window.scrollTo(0, document.body.scrollHeight);
  };

  const clickButton = useCallback((buttonEvent) => {
    sendInput(buttonEvent.target.innerText);
  });

  const clickSend = useCallback(() => {
    sendInput(value);
  });

  const changeInput = useCallback((e) => {
    setValue(e.target.value);
  });

  const resetChatbot = useCallback(() => {
    fetch('/chatbot/reset', { method: 'POST' })
      .then((response) => response.json())
      .then(() => {
        dispatch(getChatbotMessages());
        return {};
      })
      .catch((error) => {
        console.error('Error resetting chatbot:', error);
      });
  });

  if (status.loading || status.initial) {
    return <p>Loading...</p>;
  }

  if (status.error) {
    return <div className="alert alert-danger">Can not load tokens: {status.errorText}</div>;
  }

  if (!chatbotMessages || chatbotMessages.length === 0) {
    return <p>No messages</p>;
  }

  setTimeout(() => {
    document.querySelectorAll('.discussion')[0].scrollTo({ top: 1000000 });
  }, 100);

  return (
    <div className="roadmap">
      <div className="discussion">
        {chatbotMessages.map((msg, idx) => (
          <div key={idx} className={`bubble ${msg.Author == 'bot' ? 'sender' : 'recipient'}`}>
            <Markdown>{msg.Message}</Markdown>
          </div>
        ))}

        {buttons.length > 0 ? (
          <div className="button-options">
            {buttons.map((button, idx) => (
              <button key={idx} className="btn btn-sm btn-info" onClick={clickButton}>
                {button}
              </button>
            ))}
          </div>
        ) : (
          <div className="input-area">
            <input
              type="text"
              className="form-control"
              value={value}
              onChange={changeInput}
              placeholder="Type your message..."
            />
            <button className="btn btn-sm btn-info" onClick={clickSend}>
              Send
            </button>
          </div>
        )}

        <div className="reset-button">
          <button className="btn btn-sm btn-warning" onClick={resetChatbot}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
});
