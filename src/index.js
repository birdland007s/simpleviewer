import React from 'react';
import ReactDOM from 'react-dom';
import './scss/App.scss';
import App from './lib/app';
import registerServiceWorker from './registerServiceWorker';
import getConfig from './get-config';
import simperium from './lib/simperium';
import store from './lib/state';
import {
  reset as resetAuth,
  setAuthorized,
  setInvalidCredentials,
  setLoginError,
  setPending as setPendingAuth,
} from './lib/state/auth/actions';
import { setAccountName } from './lib/state/settings/actions';
import analytics from './lib/analytics';
import { Auth } from 'simperium';
import { parse } from 'cookie';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { some } from 'lodash';

import { content as welcomeMessage } from './lib/welcome-message';

import appState from './lib/flux/app-state';
const { newView } = appState.actionCreators;

const config = getConfig();

const cookie = parse(document.cookie);
const auth = new Auth(config.app_id, config.app_key);
const appProvider = 'simpleview.com';

const token = cookie.token || localStorage.access_token;
const appId = config.app_id;

const client = simperium(
    appId,
    token,
    {
      view: {
        beforeIndex: function(view) {
          var systemTags = (view.data && view.data.systemTags) || [];
          var content = (view.data && view.data.content) || '';
  
          return {
            ...view,
            contentKey: content
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 200)
              .toLowerCase(),
            pinned: systemTags.indexOf('pinned') !== -1,
          };
        },
        configure: function(objectStore) {
          objectStore.createIndex('modificationDate', 'data.modificationDate');
          objectStore.createIndex('creationDate', 'data.creationDate');
          objectStore.createIndex('alphabetical', 'contentKey');
        },
      },
      tag: function(objectStore) {
        console.log('Configure tag', objectStore); // eslint-disable-line no-console
      },
    },
    'simpleview',
    40
  );
  
  const l = msg => {
    return function() {
      // if (window.loggingEnabled)
      console.log.apply(console, [msg].concat([].slice.call(arguments))); // eslint-disable-line no-console
    };
  };
  
  client
    .on('connect', l('Connected'))
    .on('disconnect', l('Not connected'))
    // .on( 'message', l('<=') )
    // .on( 'send', l('=>') )
    .on('unauthorized', l('Not authorized'));
  
  client.on('unauthorized', () => {
    // if there is no token, drop data, if there is a token it could potentially just be
    // a password change or something similar so don't kill the data
    if (token) {
      return;
    }
  
    client.reset().then(() => {
      console.log('Reset complete'); // eslint-disable-line no-console
    });
  });

let props = {
    client: client,
    viewerBucket: client.bucket('viewer'),
    tagBucket: client.bucket('tag'),
    onAuthenticate: (username, password) => {
      if (!(username && password)) {
        return;
      }
  
      store.dispatch(setPendingAuth());
      auth
        .authorize(username, password)
        .then(user => {
          if (!user.access_token) {
            return store.dispatch(resetAuth);
          }
  
          store.dispatch(setAccountName(username));
          store.dispatch(setAuthorized());
          localStorage.access_token = user.access_token;
          client.setUser(user);
          analytics.tracks.recordEvent('user_signed_in');
        })
        .catch(({ message }) => {
          if (
            some([
              'invalid password' === message,
              message.startsWith('unknown username:'),
            ])
          ) {
            store.dispatch(setInvalidCredentials());
          } else {
            store.dispatch(setLoginError());
          }
        });
    },
    onCreateUser: (username, password) => {
      if (!(username && password)) {
        return;
      }
  
      store.dispatch(setPendingAuth());
      auth
        .create(username, password, appProvider)
        .then(user => {
          if (!user.access_token) {
            return store.dispatch(resetAuth);
          }
  
          store.dispatch(setAccountName(username));
          store.dispatch(setAuthorized());
          localStorage.access_token = user.access_token;
          client.setUser(user);
          analytics.tracks.recordEvent('user_signed_in');
        })
        .then(() =>
          store.dispatch(
            newView({
              viewerBucket: client.bucket('viewer'),
              content: welcomeMessage,
            })
          )
        )
        .catch(() => {
          store.dispatch(setLoginError());
        });
    },
    onSignOut: () => {
      delete localStorage.access_token;
      store.dispatch(setAccountName(null));
      client.deauthorize();
      if (config.signout) {
        config.signout(function() {
          window.location = '/';
        });
      }
      analytics.tracks.recordEvent('user_signed_out');
    },
  };

ReactDOM.render(
    <Provider store={store}>
    <App />
    </Provider>,
     document.getElementById('root')
);
registerServiceWorker();
