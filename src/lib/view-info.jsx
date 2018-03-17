import React from 'react';
import PropTypes from 'prop-types';
import { includes, isEmpty } from 'lodash';
import ToggleControl from './controls/toggle';
import moment from 'moment';
import CrossIcon from './icons/cross';
import { connect } from 'react-redux';
import appState from './flux/app-state';
import { setMarkdown } from './state/settings/actions';
import filterViews from './utils/filter-views';

// export const ViewInfo = React.Component({
const ViewInfo = () => ({
  propTypes: {
    view: PropTypes.object,
    markdownEnabled: PropTypes.bool,
    onPinView: PropTypes.func.isRequired,
    onMarkdownView: PropTypes.func.isRequired,
    onOutsideClick: PropTypes.func.isRequired,
  },

  mixins: [require('react-onclickoutside')],

  handleClickOutside: function() {
    this.props.onOutsideClick();
  },

  copyPublishURL: function() {
    this.publishUrlElement.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      return;
    }

    this.copyUrlElement.focus();
  },

  getPublishURL: function(url) {
    return isEmpty(url) ? null : `http://simp.ly/p/${url}`;
  },

  render: function() {
    const { isMarkdown, isPinned, view } = this.props;
    const data = (view && view.data) || {};
    const formattedDate =
      data.modificationDate && formatTimestamp(data.modificationDate);
    const isPublished = includes(data.systemTags, 'published');
    const publishURL = this.getPublishURL(data.publishURL);

    return (
      <div className="view-info theme-color-bg theme-color-fg theme-color-border">
        <div className="view-info-panel view-info-stats theme-color-border">
          <div className="view-info-header">
            <h2 className="panel-title theme-color-fg-dim">Info</h2>
            <button
              type="button"
              className="about-done button button-borderless"
              onClick={this.handleClickOutside}
            >
              <CrossIcon />
            </button>
          </div>
          {formattedDate && (
            <p className="view-info-item">
              <span className="view-info-item-text">
                <span className="view-info-name">Modified</span>
                <br />
                <span className="view-info-detail">{formattedDate}</span>
              </span>
            </p>
          )}
          <p className="view-info-item">
            <span className="view-info-item-text">
              <span className="view-info-name">
                {wordCount(data && data.content)} words
              </span>
            </span>
          </p>
          <p className="view-info-item">
            <span className="view-info-item-text">
              <span className="view-info-name">
                {characterCount(data && data.content)} characters
              </span>
            </span>
          </p>
        </div>
        <div className="view-info-panel view-info-pin theme-color-border">
          <label className="view-info-item" htmlFor="view-info-pin-checkbox">
            <span className="view-info-item-text">
              <span className="view-info-name">Pin to top</span>
            </span>
            <span className="view-info-item-control">
              <ToggleControl
                id="view-info-pin-checkbox"
                checked={isPinned}
                onChange={this.onPinChanged}
              />
            </span>
          </label>
        </div>
        <div className="view-info-panel view-info-markdown theme-color-border">
          <label
            className="view-info-item"
            htmlFor="view-info-markdown-checkbox"
          >
            <span className="view-info-item-text">
              <span className="view-info-name">Markdown</span>
              <br />
              <span className="view-info-detail">
                Enable markdown formatting on this view.{' '}
                <a
                  target="_blank"
                  href="http://simpleview.com/help/#markdown"
                  rel="noopener noreferrer"
                >
                  Learn more…
                </a>
              </span>
            </span>
            <span className="view-info-item-control">
              <ToggleControl
                id="view-info-markdown-checkbox"
                checked={isMarkdown}
                onChange={this.onMarkdownChanged}
              />
            </span>
          </label>
        </div>
        {isPublished && (
          <div className="view-info-panel view-info-public-link theme-color-border">
            <span className="view-info-item-text">
              <span className="view-info-name">Public link</span>
              <div className="view-info-form">
                <input
                  ref={e => (this.publishUrlElement = e)}
                  className="view-info-detail view-info-link-text"
                  value={publishURL}
                />
                <button
                  ref={e => (this.copyUrlElement = e)}
                  type="button"
                  className="button button-borderless view-info-copy-button"
                  onClick={this.copyPublishURL}
                >
                  Copy
                </button>
              </div>
            </span>
          </div>
        )}
      </div>
    );
  },

  onPinChanged(event) {
    this.props.onPinView(this.props.view, event.currentTarget.checked);
  },

  onMarkdownChanged(event) {
    this.props.onMarkdownView(this.props.view, event.currentTarget.checked);
  },
});

function formatTimestamp(unixTime) {
  return moment.unix(unixTime).format('MMM D, YYYY h:mm a');
}

// https://github.com/RadLikeWhoa/Countable
function wordCount(content) {
  const matches = (content || '')
    .replace(/[\u200B]+/, '')
    .trim()
    .replace(/['";:,.?¿\-!¡]+/g, '')
    .match(/\S+/g);

  return (matches || []).length;
}

// https://mathiasbynens.be/views/javascript-unicode
const surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
function characterCount(content) {
  return (
    // then get the length
    (content || '')
      // replace every surrogate pair with a BMP symbol
      .replace(surrogatePairs, '_').length
  );
}

const { markdownView, pinView, toggleViewInfo } = appState.actionCreators;

const mapStateToProps = ({ appState: state }) => {
  const filteredViews = filterViews(state);
  const viewIndex = Math.max(state.previousIndex, 0);
  const view = state.view ? state.view : filteredViews[viewIndex];
  return {
    view,
    isMarkdown: view.data.systemTags.includes('markdown'),
    isPinned: view.data.systemTags.includes('pinned'),
  };
};

const mapDispatchToProps = (dispatch, { viewBucket }) => ({
  onMarkdownView: (view, markdown = true) => {
    dispatch(markdownView({ markdown, view, viewBucket }));
    // Update global setting to set markdown flag for new views
    dispatch(setMarkdown(markdown));
  },
  onOutsideClick: () => dispatch(toggleViewInfo()),
  onPinView: (view, pin) => dispatch(pinView({ viewBucket, view, pin })),
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewInfo);
