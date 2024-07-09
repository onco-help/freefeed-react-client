/* global CONFIG */
import { useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useField } from 'react-final-form-hooks';
import { without, uniqWith } from 'lodash-es';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { hashtags as findHashTags } from 'social-text-tokenizer';
import ISO6391 from 'iso-639-1';
import {
  DISPLAYNAMES_DISPLAYNAME,
  DISPLAYNAMES_BOTH,
  DISPLAYNAMES_USERNAME,
  READMORE_STYLE_COMPACT,
  READMORE_STYLE_COMFORT,
  HIDDEN_AUTHOR_BANNED,
  HIDDEN_VIEWER_BANNED,
} from '../../../utils/frontend-preferences-options';
import {
  HOMEFEED_MODE_FRIENDS_ONLY,
  HOMEFEED_MODE_CLASSIC,
  HOMEFEED_MODE_FRIENDS_ALL_ACTIVITY,
} from '../../../utils/feed-options';
import { safeScrollTo } from '../../../services/unscroll';
import { Throbber } from '../../throbber';
import {
  updateActualUserPreferences,
  setNSFWVisibility,
  setBetaChannel,
  setOrbit,
  setUIScale,
  setSubmitMode,
} from '../../../redux/action-creators';
import settingsStyles from '../settings.module.scss';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { Icon } from '../../fontawesome-icons';
import { RadioInput, CheckboxInput } from '../../form-utils';
import TimeDisplay from '../../time-display';
import { doSequence } from '../../../redux/async-helpers';
import {
  criteriaToPrefs,
  HASHTAG,
  isEqual as criteriaIsEqual,
  USERNAME,
} from '../../../utils/hide-criteria';
import { useServerValue } from '../../hooks/server-info';
import { format } from '../../../utils/date-format';
import styles from './forms.module.scss';

const selectTranslationEnabled = (serverInfo) => serverInfo.textTranslation.enabled;

const allLanguages = ISO6391.getAllCodes()
  .map((code) => ({ code, name: ISO6391.getName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function AppearanceForm() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const isNSFWVisible = useSelector((state) => state.isNSFWVisible);
  const isBetaChannel = useSelector((state) => state.betaChannel);
  const isOrbitDisabled = useSelector((state) => state.isOrbitDisabled);
  const uiScale = useSelector((state) => state.uiScale);
  const submitMode = useSelector((state) => state.submitMode);
  const formStatus = useSelector((state) => state.settingsForms.displayPrefsStatus);
  const translationEnabled = useServerValue(selectTranslationEnabled, false);

  useEffect(() => {
    const { hash } = window.location;
    if (!hash) {
      return;
    }
    const anchor = decodeURIComponent(hash.slice(1));
    // eslint-disable-next-line unicorn/prefer-query-selector
    const element = document.getElementById(anchor);

    if (element) {
      const { top } = element.getBoundingClientRect();
      safeScrollTo(0, top);
    }
  }, []);

  const form = useForm(
    useMemo(
      () => ({
        initialValues: initialValues({
          ...userData,
          isNSFWVisible,
          isBetaChannel,
          isOrbitDisabled,
          uiScale,
          submitMode,
        }),
        onSubmit: onSubmit(dispatch),
      }),
      [dispatch, isNSFWVisible, userData, isBetaChannel, isOrbitDisabled, uiScale, submitMode],
    ),
  );

  const useYou = useField('useYou', form.form);
  const displayNames = useField('displayNames', form.form);
  const homeFeedMode = useField('homeFeedMode', form.form);
  const hiddenUsers = useField('hiddenUsers', form.form);
  const hiddenTags = useField('hiddenTags', form.form);
  const readMoreStyle = useField('readMoreStyle', form.form);
  const omitBubbles = useField('omitBubbles', form.form);
  const highlightComments = useField('highlightComments', form.form);
  const hideBannedComments = useField('hideBannedComments', form.form);
  const hideCommentsBansYou = useField('hideCommentsBansYou', form.form);
  const hideRepliesToBanned = useField('hideRepliesToBanned', form.form);
  const allowLinksPreview = useField('allowLinksPreview', form.form);
  const hideNSFWContent = useField('hideNSFWContent', form.form);
  const isOrbitDisabledField = useField('isOrbitDisabledField', form.form);
  const commentsTimestamps = useField('commentsTimestamps', form.form);
  const timeAmPm = useField('timeAmPm', form.form);
  const timeAbsolute = useField('timeAbsolute', form.form);
  const enableBeta = useField('enableBeta', form.form);
  const uiScaleField = useField('uiScale', form.form);
  const submitModeF = useField('submitMode', form.form);
  const hidesInNonHomeFeeds = useField('hidesInNonHomeFeeds', form.form);
  const translateToLang = useField('translateToLang', form.form);

  const isTheRightDate = format(new Date(), 'yyyy-MM-dd') === CONFIG.orbitDate;

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <section className={settingsStyles.formSection}>
        <h4 id="names">Names</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={useYou} />
              Show your own name as &ldquo;You&rdquo;
            </label>
          </div>
        </div>

        <div className="form-group">
          <p>Show other users as:</p>

          <div className="radio">
            <label>
              <RadioInput field={displayNames} value={DISPLAYNAMES_DISPLAYNAME.toString()} />
              Display name only
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={displayNames} value={DISPLAYNAMES_BOTH.toString()} />
              Display name + username
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={displayNames} value={DISPLAYNAMES_USERNAME.toString()} />
              Username only
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="home">Your Home feed</h4>

        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={homeFeedMode} value={HOMEFEED_MODE_FRIENDS_ONLY} />
              Posts written by your friends or posted to groups you are subscribed to
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={homeFeedMode} value={HOMEFEED_MODE_CLASSIC} />
              Also posts liked/commented on by your friends <em>(default setting)</em>
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={homeFeedMode} value={HOMEFEED_MODE_FRIENDS_ALL_ACTIVITY} />
              Also your friends&#x2019; activity in groups you are not subscribed to
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="hide-list">Hidden content</h4>
        <div className="form-group">
          <p>Apply posts and users hides:</p>
          <div className="form-group">
            <div className="radio">
              <label>
                <RadioInput field={hidesInNonHomeFeeds} value="0" />
                At the &ldquo;Home&rdquo; page only
              </label>
            </div>

            <div className="radio">
              <label>
                <RadioInput field={hidesInNonHomeFeeds} value="1" />
                At the &ldquo;Home&rdquo;, &ldquo;Discussions&rdquo;, &ldquo;Everything&rdquo;,
                &ldquo;Best of&hellip;&rdquo; and your friend lists pages
              </label>
            </div>
          </div>

          <div className="form-group">
            Hide posts from these users and groups in your Home feed:
            <br />
            <textarea
              className={`form-control wider-input ${styles.hiddenUsers}`}
              name="hiddenUsers"
              {...hiddenUsers.input}
            />
            <p className="help-block">Comma-separated list of usernames and group names</p>
            <p className="help-block">
              To view the “Blocked users” list, visit{' '}
              <Link to="/friends?show=blocked">this page</Link>.
            </p>
          </div>

          <div className="form-group">
            Hide posts with these hashtags in your Home feed:
            <br />
            <textarea
              className={`form-control wider-input ${styles.hiddenUsers}`}
              name="hiddenTags"
              {...hiddenTags.input}
            />
            <p className="help-block">Comma-separated list of hashtags e.g. #tag1, #tag2</p>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="nsfw">NSFW content</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideNSFWContent} />
              Hide NSFW content
            </label>
            <p className="help-block">
              <Icon icon={faExclamationTriangle} /> This setting is saved locally in your web
              browser. It can be different for each browser and each device that you use.
            </p>
            <p className="help-block">
              Hide images in posts marked with #nsfw tag (or posted to a group that has #nsfw in
              group description).
            </p>
            <p className="help-block">
              NSFW is an abbreviation of Not Safe For Work: images that the user may not wish to be
              seen looking at in a public, formal, or controlled environment, for example, nudity,
              or intense sexuality.
            </p>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="submit-key">Submitting posts and comments</h4>
        <p>How to submit post or comment forms:</p>
        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={submitModeF} value="auto" />
              Select one of the modes below automatically
              <p className="help-block">
                {CONFIG.siteTitle} detects whether you use a desktop or mobile browser. The{' '}
                <code>Enter</code> key will act as submit on desktop and will insert a new line on
                mobile. Auto-detection can be inaccurate, so feel free to select this option
                manually.
              </p>
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={submitModeF} value="ctrl+enter" />
              Mobile mode: <code>Enter</code> key adds a new line
              <p className="help-block">
                Use the form button to submit. If you prefer to use this mode on desktop, you can
                also use <code>Ctrl+Enter</code> or <code>Cmd+Enter</code> to submit a form.
              </p>
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={submitModeF} value="enter" />
              Desktop mode: <code>Enter</code> key submits a form
              <p className="help-block">
                Use <code>Shift+Enter</code> or <code>Alt+Enter</code> to add a new line.
              </p>
            </label>
          </div>
          <p className="help-block">
            <Icon icon={faExclamationTriangle} /> This setting is saved locally in your web browser.
            It can be different for each browser and each device that you use.
          </p>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="density">Display density</h4>

        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={readMoreStyle} value={READMORE_STYLE_COMPACT} />
              Compact: hides line breaks (until &quot;Expand&quot; is clicked)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={readMoreStyle} value={READMORE_STYLE_COMFORT} />
              Comfortable: displays line breaks, shows &quot;Read more&quot; for longer posts and
              comments
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="scale">Text scale</h4>

        <div className="form-group">
          <p>
            Adjust the scale of text (<strong>{uiScaleField.input.value}%</strong>):
          </p>
          <p>
            <input
              className={styles.scaleRangeInput}
              type="range"
              min="80"
              max="200"
              step="5"
              {...uiScaleField.input}
            />
          </p>
          <p>Sample text:</p>
          <p
            className={styles.scaleSample}
            style={{ fontSize: `${(14 * uiScaleField.input.value) / 100}px` }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p className="help-block">
            <Icon icon={faExclamationTriangle} /> This setting is saved locally in your web browser.
            It can be different for each browser and each device that you use.
          </p>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="comments">Comments</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={omitBubbles} />
              Omit bubbles for subsequent comments from the same author
            </label>
          </div>

          <div className="checkbox">
            <label>
              <CheckboxInput field={highlightComments} />
              Highlight comments when hovering on @username or ^ and ↑
            </label>
          </div>

          <div className="checkbox">
            <label>
              <CheckboxInput field={commentsTimestamps} />
              Show timestamps for comments
            </label>
          </div>
        </div>
        <h5>Completely hide (don&#x2019;t even show the placeholder):</h5>
        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideBannedComments} />
              Comments from users you have blocked
            </label>
          </div>
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideCommentsBansYou} />
              Comments from users who have blocked you
            </label>
          </div>
        </div>

        <h5>Show placeholders instead of:</h5>
        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideRepliesToBanned} />
              Text of replies to blocked users
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="previews">Link previews</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={allowLinksPreview} />
              Show advanced previews of links in posts (using Embedly)
              <p className="help-block">
                Link should start with http(s)://, post should have no attached files. If you
                don&#x2019;t want to have link preview, add ! before a link without spaces.
              </p>
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="time">Date and time</h4>
        <p>Display accuracy:</p>
        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={timeAbsolute} value={'0'} />
              Show relative time for the recent events (5 min ago, 3 hours ago, &hellip;)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={timeAbsolute} value={'1'} />
              Always show absolute time (
              <TimeDisplay timeStamp={Date.now()} absolute amPm={timeAmPm.input.value === '1'} />)
            </label>
          </div>
        </div>
        <p>Time format:</p>
        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={timeAmPm} value={'0'} />
              24-hour time (16:20)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={timeAmPm} value={'1'} />
              12-hour time (4:20 p.m.)
            </label>
          </div>
        </div>
      </section>

      {translationEnabled && (
        <section className={settingsStyles.formSection}>
          <h4 id="translation">Text translation</h4>
          <p>
            Choose a language to translate posts and comments into. To translate, click
            &quot;Translate&quot; in the &quot;More&quot; menu of the post/comment.
          </p>
          <p>
            <select className="form-control" {...translateToLang.input}>
              <option value="">
                Use browser language (currently{' '}
                {ISO6391.getName(navigator.language?.slice(0, 2) ?? '') || 'Unknown'})
              </option>
              {allLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </p>
        </section>
      )}

      {CONFIG.betaChannel.enabled && (
        <section className={settingsStyles.formSection}>
          <h4 id="beta">Beta version</h4>

          <div className="checkbox">
            <label>
              <CheckboxInput field={enableBeta} />
              Use the beta version of OncoHelp frontend
            </label>
            <p className="help-block">
              The beta version has the latest new features, but it may be unstable. Please use it
              only if you are ready to report bugs.
            </p>
            <p className="help-block">
              The page will be reloaded after you change this setting and submit form.
            </p>
            <p className="help-block">
              <Icon icon={faExclamationTriangle} /> This setting is saved locally in your web
              browser. It can be different for each browser and each device that you use.
            </p>
          </div>
        </section>
      )}

      {isTheRightDate && (
        <section className={settingsStyles.formSection}>
          <h4 id="orbit">👁👄👁</h4>

          <div className="checkbox">
            <label>
              <CheckboxInput field={isOrbitDisabledField} />
              Do not read other people&apos;s minds!
            </label>
          </div>
        </section>
      )}

      <div className="form-group">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={formStatus.loading || !form.dirty || form.hasValidationErrors}
        >
          {formStatus.loading ? 'Updating appearance…' : 'Update appearance'}
        </button>{' '}
        {formStatus.loading && <Throbber />}
      </div>
      {formStatus.error && (
        <p className="alert alert-danger" role="alert">
          {formStatus.errorText}
        </p>
      )}
      {formStatus.success && (
        <p className="alert alert-success" role="alert">
          Appearance updated
        </p>
      )}
    </form>
  );
}

function initialValues({
  frontendPreferences: frontend,
  preferences: backend,
  isNSFWVisible,
  isBetaChannel,
  submitMode,
  uiScale,
  isOrbitDisabled,
}) {
  return {
    useYou: frontend.displayNames.useYou,
    displayNames: frontend.displayNames.displayOption.toString(),
    homeFeedMode: frontend.homeFeedMode,
    hiddenUsers: frontend.homefeed.hideUsers.join(', '),
    hiddenTags: frontend.homefeed.hideTags.join(', '),
    readMoreStyle: frontend.readMoreStyle,
    omitBubbles: frontend.comments.omitRepeatedBubbles,
    highlightComments: frontend.comments.highlightComments,
    hideBannedComments: backend?.hideCommentsOfTypes.includes(HIDDEN_AUTHOR_BANNED),
    hideCommentsBansYou: backend?.hideCommentsOfTypes.includes(HIDDEN_VIEWER_BANNED),
    hideRepliesToBanned: frontend.comments.hideRepliesToBanned,
    allowLinksPreview: frontend.allowLinksPreview,
    hideNSFWContent: !isNSFWVisible,
    commentsTimestamps: frontend.comments.showTimestamps,
    timeAmPm: frontend.timeDisplay.amPm ? '1' : '0',
    timeAbsolute: frontend.timeDisplay.absolute ? '1' : '0',
    enableBeta: isBetaChannel,
    isOrbitDisabledField: isOrbitDisabled,
    useCtrlEnter: frontend.submitByEnter ? '0' : '1',
    uiScale,
    submitMode,
    hidesInNonHomeFeeds: frontend.hidesInNonHomeFeeds ? '1' : '0',
    translateToLang: frontend.translateToLang,
  };
}

function onSubmit(dispatch) {
  return (values) =>
    doSequence(dispatch)(
      (dispatch) => dispatch(updateActualUserPreferences(prefUpdaters(values))),
      (dispatch) => {
        dispatch(setNSFWVisibility(!values.hideNSFWContent));
        dispatch(setBetaChannel(values.enableBeta));
        dispatch(setOrbit(values.isOrbitDisabledField));
        dispatch(setUIScale(values.uiScale));
        dispatch(setSubmitMode(values.submitMode));
      },
    );
}

function prefUpdaters(values) {
  const hashtagsToHide = findHashTags()(values.hiddenTags).map((t) => t.text);
  const usernamesToHide = values.hiddenUsers.toLowerCase().match(/[\w-]+/g) || [];

  const hideCriteria = uniqWith(
    [
      ...hashtagsToHide.map((value) => ({ type: HASHTAG, value })),
      ...usernamesToHide.map((value) => ({ type: USERNAME, value })),
    ],
    criteriaIsEqual,
  );
  return {
    updateFrontendPrefs(prefs) {
      return {
        displayNames: {
          ...prefs.displayNames,
          useYou: values.useYou,
          displayOption: parseInt(values.displayNames, 10),
        },
        homeFeedMode: values.homeFeedMode,
        homefeed: {
          ...prefs.homefeed,
          ...criteriaToPrefs(hideCriteria),
        },
        hidesInNonHomeFeeds: values.hidesInNonHomeFeeds === '1',
        readMoreStyle: values.readMoreStyle,
        comments: {
          ...prefs.comments,
          omitRepeatedBubbles: values.omitBubbles,
          highlightComments: values.highlightComments,
          showTimestamps: values.commentsTimestamps,
          hideRepliesToBanned: values.hideRepliesToBanned,
        },
        allowLinksPreview: values.allowLinksPreview,
        timeDisplay: {
          ...prefs.timeDisplay,
          amPm: values.timeAmPm === '1',
          absolute: values.timeAbsolute === '1',
        },
        translateToLang: values.translateToLang,
      };
    },

    updateBackendPrefs({ hideCommentsOfTypes }) {
      hideCommentsOfTypes = without(
        hideCommentsOfTypes,
        HIDDEN_AUTHOR_BANNED,
        HIDDEN_VIEWER_BANNED,
      );
      values.hideBannedComments && hideCommentsOfTypes.push(HIDDEN_AUTHOR_BANNED);
      values.hideCommentsBansYou && hideCommentsOfTypes.push(HIDDEN_VIEWER_BANNED);
      return { hideCommentsOfTypes };
    },
  };
}
