/* global CONFIG */
import { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import PaginatedView from './paginated-view';
import Feed from './feed';
import { SignInLink } from './sign-in-link';

class UserFeed extends Component {
  render() {
    if (this.props.feedIsLoading) {
      // Nothing to show while feed is loading
      return false;
    }

    const {
      viewUser,
      authenticated,
      location: { query },
    } = this.props;
    const isBlocked = viewUser.blocked;
    const isPrivate = viewUser.isPrivate === '1' && !viewUser.subscribed && !viewUser.isItMe;
    const possiblyBlocked =
      viewUser.type === 'user' &&
      viewUser.isPrivate === '0' &&
      (!('offset' in query) || query.offset === '0');

    const emptyFeedMessage = possiblyBlocked && (
      <p>
        Perhaps <b>{viewUser.screenName}</b> has not written any posts yet
        {authenticated ? ' or they have blocked you' : ''}.
      </p>
    );

    if (viewUser.isGone) {
      return (
        <div className="box-body">
          <p className="alert alert-warning">
            <b>{viewUser.screenName}</b> account has been deleted. This page still exists as a stub
            for the username, but this {viewUser.type} is not in OncoHelp anymore.
          </p>
        </div>
      );
    }

    if (isBlocked) {
      return (
        <div className="box-body">
          <p>
            You have blocked <b>{viewUser.screenName}</b>, so all of their posts and comments are
            invisible to you.
          </p>
        </div>
      );
    }

    if (isPrivate) {
      return (
        <div className="box-body">
          <p>
            <b>{viewUser.screenName}</b> has a private feed.
          </p>
          {!authenticated && (
            <p>
              <Link to="/signup">Sign up</Link> (or <SignInLink>sign in</SignInLink>) and request a
              subscription to see posts from <b>{viewUser.screenName}</b>.
            </p>
          )}
        </div>
      );
    } else if (viewUser.isProtected === '1' && !authenticated) {
      return (
        <div className="box-body">
          <p>
            <b>{viewUser.screenName}</b> has a protected feed. It is only visible to{' '}
            {CONFIG.siteTitle} users.
          </p>
          <p>
            <Link to="/signup">Sign up</Link> or <SignInLink>sign in</SignInLink> to see posts from{' '}
            <b>{viewUser.screenName}</b>.
          </p>
        </div>
      );
    }

    return (
      <PaginatedView {...this.props}>
        <Feed {...this.props} emptyFeedMessage={emptyFeedMessage} />
      </PaginatedView>
    );
  }
}

function select(state) {
  return {
    feedIsLoading: state.routeLoadingState,
    authenticated: state.authenticated,
  };
}

export default connect(select)(UserFeed);
