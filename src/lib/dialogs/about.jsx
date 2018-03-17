import React from 'react';
import PropTypes from 'prop-types';
import SimpleviewLogo from '../icons/simpleview';
import CrossIcon from '../icons/cross';
import TopRightArrowIcon from '../icons/arrow-top-right';
import Dialog from '../dialog';
var config = require('../../resources/lib/config');

const appVersion = config.version; // eslint-disable-line no-undef

export default React.Component({
  propTypes: {
    actions: PropTypes.object.isRequired,
    dialog: PropTypes.object.isRequired,
  },

  onDone() {
    this.props.actions.closeDialog({ key: this.props.dialog.key });
  },

  render() {
    const dialog = this.props.dialog;
    const thisYear = new Date().getFullYear();

    return (
      <Dialog className="about" {...dialog} onDone={this.onDone}>
        <div className="about-top">
          <SimpleviewLogo />

          <h1>Simpleview</h1>
          <small>Version {appVersion}</small>
        </div>

        <ul className="about-links">
          <li>
            <a
              target="_blank"
              href="http://simpleview.com/blog/"
              rel="noopener noreferrer"
            >
              <span className="about-links-title">Blog</span>
              <br />simpleview.com/blog/
            </a>
            <TopRightArrowIcon />
          </li>
          <li>
            <a
              target="_blank"
              href="https://twitter.com/simpleviewapp"
              rel="noopener noreferrer"
            >
              <span className="about-links-title">Twitter</span>
              <br />@simpleviewapp
            </a>
            <TopRightArrowIcon />
          </li>
          <li>
            <a
              target="_blank"
              href="http://simpleview.com/"
              rel="noopener noreferrer"
            >
              <span className="about-links-title">Apps</span>
              <br />simpleview.com
            </a>
            <TopRightArrowIcon />
          </li>
          <li>
            <a
              target="_blank"
              href="https://github.com/Automattic/simpleview-electron"
              rel="noopener noreferrer"
            >
              <span className="about-links-title">Contribute</span>
              <br />GitHub.com
            </a>
            <TopRightArrowIcon />
          </li>
          <li>
            <a
              target="_blank"
              href="https://automattic.com/work-with-us/"
              rel="noopener noreferrer"
            >
              Made with love by the folks at Automattic.
              <br />Are you a developer? We&rsquo;re hiring.
            </a>
            <TopRightArrowIcon />
          </li>
        </ul>

        <div className="about-bottom">
          <p>
            <a
              target="_blank"
              href="http://simpleview.com/privacy/"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{' '}
            &nbsp;&bull;&nbsp;{' '}
            <a
              target="_blank"
              href="http://simpleview.com/terms/"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>
          </p>
          <p>
            <a
              target="_blank"
              href="https://automattic.com/"
              rel="noopener noreferrer"
            >
              &copy; {thisYear} Automattic, Inc.
            </a>
          </p>
        </div>

        <button
          type="button"
          className="about-done button button-borderless"
          onClick={this.onDone}
        >
          <CrossIcon />
        </button>
      </Dialog>
    );
  },
});
