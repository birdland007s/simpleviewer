import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import reduxActions from '../state/actions';
import App from '../app'
import selectors from '../state/selectors';
import appState from '../flux/app-state';
import browserShell from '../browser-shell';
import * as settingsActions from '../state/settings/actions';
import {
    pick
  } from 'lodash';

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

  export const connectApp = connect(mapStateToProps, mapDispatchToProps)(App);