import React, { Component } from 'react';
import ViewList from './lib/view-list';
import SearchBar from './lib/search-bar';
import NavigationBar from './lib/navigation-bar';
import ViewEditor from './lib/view-editor';
import classNames from 'classnames';
import filterViews from './lib/utils/filter-views';
import './css/App.css';
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

class App extends Component {

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
    // const filteredViews = filterViews(state);
    // const hasViews = filteredViews.length > 0;

    // const viewIndex = Math.max(state.previousIndex, 0);
    // const selectedView =
    //   isSmallScreen || state.view ? state.view : filteredViews[viewIndex];
    const selectedView = false;

    // const appClasses = classNames('app', `theme-${settings.theme}`, {
    //   'touch-enabled': 'ontouchstart' in document.body,
    // });
    const appClasses = classNames('app', 'theme-light', {
      'touch-enabled': 'ontouchstart' in document.body,
    });

    // const mainClasses = classNames('simpleview-app', {
    //   'view-open': selectedView,
    //   'view-info-open': state.showViewInfo,
    //   'navigation-open': state.showNavigation,
    //   'is-electron': isElectron(),
    //   'is-macos': isMacApp,
    // });

    return (
      <div className="App">
        <header className="App-header">
          {/* <h1 className="App-title">simple viewer</h1> */}
        </header>
        <div className={appClasses}>
          <div className='simpleview-app'>
            <NavigationBar />
            <div className="source-list theme-color-bg theme-color-fg">
              <SearchBar viewBucket={viewBucket} />
              <ViewList viewBucket={viewBucket}/>
            </div>
            <ViewEditor />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
