import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import appState from './flux/app-state';
import reduxActions from './state/actions';
import selectors from './state/selectors';
import browserShell from './browser-shell';
import { ContextMenu, MenuItem, Separator } from './context-menu';
import * as Dialogs from './dialogs/index';
import exportViews from './utils/export';
import exportToZip from './utils/export/to-zip';
import SimpleviewCompactLogo from './icons/simpleview-compact';
import ViewInfo from './view-info';
import ViewList from './view-list';
import ViewEditor from './view-editor';
import NavigationBar from './navigation-bar';
import Auth from './auth';
import analytics from './analytics';
import classNames from 'classnames';
import {
  compact,
  concat,
  flowRight,
  noop,
  get,
  has,
  isObject,
  map,
  matchesProperty,
  overEvery,
  pick,
  values,
} from 'lodash';

import * as settingsActions from './state/settings/actions';

import filterViews from './utils/filter-views';
import SearchBar from './search-bar';

const mapStateToProps = state => ({
  ...state,
  authIsPending: selectors.auth.authIsPending(state),
  isAuthorized: selectors.auth.isAuthorized(state),
});

function mapDispatchToProps(dispatch, { viewBucket }) {
  var actionCreators = Object.assign({}, appState.actionCreators);

  const thenReloadViews = action => a => {
    dispatch(action(a));
    dispatch(actionCreators.loadViews({ viewBucket }));
  };

  return {
    actions: bindActionCreators(actionCreators, dispatch),
    ...bindActionCreators(
      pick(settingsActions, [
        'activateTheme',
        'decreaseFontSize',
        'increaseFontSize',
        'resetFontSize',
        'setViewDisplay',
        'setMarkdown',
        'setAccountName',
      ]),
      dispatch
    ),
    setSortType: thenReloadViews(settingsActions.setSortType),
    toggleSortOrder: thenReloadViews(settingsActions.toggleSortOrder),

    openTagList: () => dispatch(actionCreators.toggleNavigation()),
    resetAuth: () => dispatch(reduxActions.auth.reset()),
    setAuthorized: () => dispatch(reduxActions.auth.setAuthorized()),
    setSearchFocus: () =>
      dispatch(actionCreators.setSearchFocus({ searchFocus: true })),
  };
}

class App extends React.Component {

  // constructor(props) {
  //     super(props);
      
  // }

  
  render() {
    const {
      appState: state,
      authIsPending,
      isAuthorized,
      isSmallScreen,
      //viewBucket,
      settings,
      tagBucket,
    } = this.props;

    const viewBucket = [
      'viewitem1',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2',
      'viewitem2'
    ];

    const isElectron = (() => {
      // https://github.com/atom/electron/issues/2288
      const foundElectron = has(window, 'process.type');
    
      if (foundElectron) {
        fs = __non_webpack_require__('fs'); // eslint-disable-line no-undef
      }
    
      return () => foundElectron;
    })();
    
    const isElectronMac = () =>
      matchesProperty('process.platform', 'darwin')(window);

    const electron = get(this.state, 'electron');
    const isMacApp = isElectronMac();
    const filteredViews = filterViews(state);
    const hasViews = filteredViews.length > 0;

    const viewIndex = Math.max(state.previousIndex, 0);
    const selectedView =
      isSmallScreen || state.view ? state.view : filteredViews[viewIndex];
    // const selectedView = false;

    // const appClasses = classNames('app', `theme-${settings.theme}`, {
    //   'touch-enabled': 'ontouchstart' in document.body,
    // });
    const appClasses = classNames('app', 'theme-light', {
      'touch-enabled': 'ontouchstart' in document.body,
    });

    const mainClasses = classNames('simpleview-app', {
      'view-open': selectedView,
      'view-info-open': state.showViewInfo,
      'navigation-open': state.showNavigation,
      'is-electron': isElectron(),
      'is-macos': isMacApp,
    });

    return (
      <div className={appClasses}>
        {isElectron() && (
          <ContextMenu Menu={electron.Menu} window={electron.currentWindow}>
            <MenuItem label="Undo" role="undo" />
            <MenuItem label="Redo" role="redo" />
            <Separator />
            <MenuItem label="Cut" role="cut" />
            <MenuItem label="Copy" role="copy" />
            <MenuItem label="Paste" role="paste" />
            <MenuItem label="Select All" role="selectall" />
          </ContextMenu>
        )}
        {isAuthorized ? (
          <div className={mainClasses}>
            {state.showNavigation && (
              <NavigationBar viewBucket={viewBucket} tagBucket={tagBucket} />
            )}
            <div className="source-list theme-color-bg theme-color-fg">
              <SearchBar viewBucket={viewBucket} />
              {hasViews ? (
                <ViewList viewBucket={viewBucket} />
              ) : (
                <div className="placeholder-view-list">
                  <span>No Views</span>
                </div>
              )}
            </div>
            {selectedView &&
            hasViews && (
              <ViewEditor
                allTags={state.tags}
                editorMode={state.editorMode}
                filter={state.filter}
                view={selectedView}
                revisions={state.revisions}
                onSetEditorMode={this.onSetEditorMode}
                onUpdateContent={this.onUpdateContent}
                onUpdateViewTags={this.onUpdateViewTags}
                onTrashView={this.onTrashView}
                onRestoreView={this.onRestoreView}
                onShareView={this.onShareView}
                onDeleteViewForever={this.onDeleteViewForever}
                onRevisions={this.onRevisions}
                onCloseView={() => this.props.actions.closeView()}
                onViewInfo={() => this.props.actions.toggleViewInfo()}
                shouldPrint={state.shouldPrint}
                onViewPrinted={this.onViewPrinted}
              />
            )}
            {!hasViews && (
              <div className="placeholder-view-detail theme-color-border">
                <div className="placeholder-view-toolbar theme-color-border" />
                <div className="placeholder-view-editor">
                  <SimpleviewCompactLogo />
                </div>
              </div>
            )}
            {state.showViewInfo && <ViewInfo viewBucket={viewBucket} />}
          </div>
        ) : (
          <Auth
            authPending={authIsPending}
            isAuthenticated={isAuthorized}
            onAuthenticate={this.props.onAuthenticate}
            onCreateUser={this.props.onCreateUser}
            isMacApp={isMacApp}
          />
        )}
        {this.props.appState.dialogs.length > 0 && (
          <div className="dialogs">{this.renderDialogs()}</div>
        )}
      </div>
    );
  }
}

export default App;
