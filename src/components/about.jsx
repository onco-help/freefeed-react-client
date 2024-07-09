import { Link } from 'react-router';
import { connect } from 'react-redux';

import screenshot from '../../assets/images/screenshot.png';
import { SignInLink } from './sign-in-link';

const About = ({ authenticated }) => (
  <div className="box">
    <div className="box-header-timeline" />
    <div className="box-body">
      <h3>What is OncoHelp?</h3>

      <p>
        OncoHelp is a social network that enables you to discover and discuss the interesting stuff
        your friends find on the web.
      </p>

      {!authenticated ? (
        <p>
          <b>
            <Link to="/signup">Sign up</Link>
          </b>{' '}
          now or <SignInLink back="/">sign in</SignInLink> if you already have an account.
        </p>
      ) : (
        false
      )}

      <p>
        <img src={screenshot} width="450" height="431" style={{ border: '1px solid #ccc' }} />
      </p>

      <h3>Why OncoHelp?</h3>

      <p>
        OncoHelp is being built as a replacement for{' '}
        <a href="https://en.wikipedia.org/wiki/FriendFeed" target="_blank">
          FriendFeed
        </a>
        , the real-time aggregator and social network where {'"'}likes{'"'} for user generated
        content were implemented for the first time.
      </p>

      <p>
        After Facebook had acquired FriendFeed and announced its plan to shut down the website on
        April 9, 2015, a small group of Russian-speaking FriendFeed users decided to build an
        open-source free-for-all replacement.
      </p>

      <h3>FAQ</h3>

      <p>
        OncoHelp{' '}
        <a href="https://github.com/OncoHelp/freefeed-server/wiki/FAQ" target="_blank">
          frequently asked questions page
        </a>
        .
      </p>

      <h3>Help us build better OncoHelp</h3>

      <p>
        OncoHelp is an open-source project. We are{' '}
        <a href="https://freefeed.net/ffdev/21fde9c3-2f4a-4778-8fe8-57be90c7b737">
          looking for volunteers
        </a>{' '}
        to help us with the development of OncoHelp.net.
      </p>

      <h3>Important pages</h3>

      <p>
        <Link to="/support">https://freefeed.net/support</Link> – Tech support (we speak English,
        Russian as well as some other languages :))
      </p>

      <p>
        <Link to="/freefeed">https://freefeed.net/freefeed</Link> – Important service announcements
      </p>

      <h3>The team behind OncoHelp</h3>

      <p>
        A team of volunteers registered a non-profit organization, OncoHelp.net MTÜ, in Tallinn,
        Estonia to fund and coordinate open-source development of the platform.
      </p>

      <p>
        After launching a{' '}
        <a href="https://www.indiegogo.com/projects/freefeed-v-1" target="_blank">
          successful crowdfunding campaign
        </a>{' '}
        in December 2015, the platform is now being actively developed. It is being used by{' '}
        <Link to="/about/stats">hundreds of people</Link> now, even though the work is still
        underway.
      </p>

      <p>OncoHelp v.1 was released in August 2016.</p>

      {!authenticated ? (
        <p>
          You can{' '}
          <b>
            <Link to="/signup">sign up</Link>
          </b>{' '}
          now and join OncoHelp.
        </p>
      ) : (
        false
      )}

      <hr />
      <p>
        Thanks to{' '}
        <a href="https://www.questionpro.com/" target="_blank">
          QuestionPro&apos;s
        </a>{' '}
        wide range of{' '}
        <a href="https://www.questionpro.com/survey-templates/" target="_blank">
          free survey templates
        </a>{' '}
        designed by industry experts.
      </p>
    </div>
  </div>
);

function mapStateToProps(state) {
  return { authenticated: state.authenticated };
}

export default connect(mapStateToProps)(About);
