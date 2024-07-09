import { browserHistory } from 'react-router';

function Dev() {
  browserHistory.push('/ffdev');
  return (
    <div className="box">
      <div className="box-header-timeline" />
      <div className="box-body">
        <h3>Help us build OncoHelp</h3>

        <p>
          We are looking for volunteers to help us build OncoHelp, an open-source social network,
          replacement of FriendFeed.com.
        </p>

        <p>
          We{' '}
          <a href="https://freefeed.net/ffdev/" target="_blank">
            need help
          </a>{' '}
          with both development and testing.
        </p>

        <p>
          OncoHelp is open-source:{' '}
          <a href="https://github.com/OncoHelp/" target="_blank">
            https://github.com/OncoHelp/
          </a>
        </p>

        <p>
          The{' '}
          <a href="https://github.com/OncoHelp/freefeed-server" target="_blank">
            backend
          </a>{' '}
          is built with Node.js and PostgreSQL.
        </p>

        <p>
          The{' '}
          <a href="https://github.com/OncoHelp/freefeed-react-client" target="_blank">
            frontend
          </a>{' '}
          is built with React.
        </p>

        <p>
          <b>
            <a href="https://freefeed.net/ffdev/" target="_blank">
              Join
            </a>
          </b>{' '}
          our team of volunteers!
        </p>
      </div>
    </div>
  );
}

export default Dev;
