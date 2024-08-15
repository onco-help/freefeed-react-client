import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getChatbotMessages } from '../redux/action-creators';
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
  const buttons = ['Yes', 'No'];
  const status = useSelector((state) => state.appTokens.chatbotMessagesStatus || {});
  const input = '';

  useEffect(() => void dispatch(getChatbotMessages()), [dispatch]);

  if (status.loading || status.initial) {
    return <p>Loading...</p>;
  }

  if (status.error) {
    return <div className="alert alert-danger">Can not load tokens: {status.errorText}</div>;
  }

  if (!chatbotMessages || chatbotMessages.length === 0) {
    return <p>No messages</p>;
  }

  return (
    <div className="roadmap">
      <div className="discussion">
        {chatbotMessages.map((msg, idx) => (
          <div key={idx} className={`bubble ${msg.role == 'assistant' ? 'sender' : 'recipient'}`}>
            {msg.content}
          </div>
        ))}

        {buttons.length > 0 ? (
          <div className="button-options">
            {buttons.map((btn, idx) => {
              <button className="btn btn-sm btn-info" key={idx}>
                {btn}
              </button>;
            })}
          </div>
        ) : (
          ''
        )}
        <div className="input-area">
          <input
            type="text"
            className="form-control"
            value={input}
            placeholder="Type your message..."
          />
          <button className="btn btn-sm btn-info">Send</button>
        </div>
      </div>
    </div>
  );
});
