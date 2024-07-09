/* global CONFIG */
import { encode as qsEncode } from 'querystring';
import { memo, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';

import { signedIn } from '../redux/action-creators';
import SignupForm from './signup-form';
import { CookiesWarning } from './cookies-warning';
import { useExtAuthProviders, providerTitle } from './ext-auth-helpers';
import { ExtAuthButtons, SIGN_UP } from './ext-auth-buttons';
import { useServerInfo } from './hooks/server-info';
import { SignInLink } from './sign-in-link';
import UserName from './user-name';

export default memo(function Signup() {
  const [serverInfo, serverInfoStatus] = useServerInfo();
  const withForm = !!CONFIG.registrationsLimit.emailFormIframeSrc;
  const withInviteForm = !!CONFIG.registrationsByInvite.formIframeSrc;
  const formSrc =
    CONFIG.registrationsByInvite.formIframeSrc || CONFIG.registrationsLimit.emailFormIframeSrc;

  const user = useSelector((state) => state.user || null);
  const isLoggedIn = user?.id && user?.type === 'user';
  const showSignUpForm =
    serverInfoStatus.success &&
    serverInfo.registrationOpen &&
    !serverInfo.registrationRequiresInvite;

  if (!serverInfoStatus.success) {
    return (
      <div className="box">
        <div className="box-header-timeline" role="heading" />
        <div className="box-body">
          {serverInfoStatus.loading && <p>Loading...</p>}
          {serverInfoStatus.error && (
            <p className="alert alert-danger">{serverInfoStatus.errorText}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading" />
      <div className="box-body">
        {isLoggedIn && (
          <p>
            You are already signed up as <UserName user={user}>{user.screenName}</UserName>.
          </p>
        )}
        <div className="col-md-12">
          <h2 className="p-signin-header">Sign up</h2>
          {showSignUpForm ? (
            <>
              <CookiesWarning />
              <SignupForm />
              <ExtAuthSignup />
            </>
          ) : (
            <>
              <div className="alert alert-warning" role="alert">
                {serverInfo.registrationRequiresInvite ? (
                  <>
                    <p>
                      Right now, registration is only available via invitation links from existing
                      OncoHelp users. Please ask someone you know at OncoHelp to send you such a
                      link.
                    </p>
                    {withInviteForm && (
                      <p>
                        If you don&#x2019;t know anyone,{' '}
                        <a href={formSrc} target="_blank">
                          <strong>fill out a simple form</strong>
                        </a>{' '}
                        and we&#x2019;ll review your request.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      Unfortunately we are not accepting new user registrations at this time, but we
                      plan to be open for registration shortly.
                    </p>
                    {withForm && (
                      <p>
                        Please provide your email address to be notified when {CONFIG.siteTitle} is
                        open for registration.
                      </p>
                    )}
                  </>
                )}
              </div>
              {withForm && (
                <p>
                  <iframe
                    src={formSrc}
                    width="100%"
                    height="550"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                  >
                    Loading…
                  </iframe>
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="box-footer" />
    </div>
  );
});

const ExtAuthSignup = memo(function ExtAuthSignup() {
  const dispatch = useDispatch();
  const [providers] = useExtAuthProviders();
  const result = useSelector((state) => state.extAuth.signInResult);

  // No deps: we are specifically intresting in the initial value of result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const comeWithResult = useMemo(() => !!result.status, []);

  const doSignIn = useCallback(
    () => dispatch(signedIn(result.authToken)),
    [dispatch, result.authToken],
  );

  // Do not show anything if we open this page with auth result
  // or there are no allowed providers
  if (comeWithResult || providers.length === 0) {
    return null;
  }

  return (
    <>
      <p>Or use external service profile to create {CONFIG.siteTitle} account:</p>
      <ExtAuthButtons mode={SIGN_UP} />
      {result.status === 'signed-in' && (
        <div className="alert alert-success" role="alert">
          <p>
            This {providerTitle(result.profile.provider)} account is already connected to{' '}
            <strong>@{result.user.username}</strong> {CONFIG.siteTitle} account. Is it you?
          </p>
          <p>
            <button className="btn btn-success" onClick={doSignIn}>
              Sign in and continue as <strong>@{result.user.username}</strong>
            </button>
          </p>
        </div>
      )}
      {result.status === 'continue' && (
        <div className="alert alert-success" role="alert">
          <p>Excellent! Now you can edit the form above and create a new account.</p>
        </div>
      )}
      {result.status === 'user-exists' && (
        <div className="alert alert-warning" role="alert">
          <p>There is already a {CONFIG.siteTitle} account with this email address.</p>
          <p>
            If this is you, you should <SignInLink back="/">sign in</SignInLink> with your
            username/email and password or in any other way allowed for your account.
          </p>
          <p>
            If you have forgotten your password, you can{' '}
            <Link to={`/restore?${qsEncode({ email: result.profile.email })}`}>
              reset it and set the new one
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
});
