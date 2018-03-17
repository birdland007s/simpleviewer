import { partition } from 'lodash';
import update from 'react-addons-update';
import ActionMap from './action-map';
import isEmailTag from '../utils/is-email-tag';
import throttle from '../utils/throttle';
import analytics from '../analytics';
import { util as simperiumUtil } from 'simperium';

const typingThrottle = 3000;

export const actionMap = new ActionMap({
  namespace: 'App',

  initialState: {
    editorMode: 'edit',
    filter: '',
    selectedViewerId: null,
    previousIndex: -1,
    viewers: [],
    tags: [],
    showTrash: false,
    listTitle: 'All Viewers',
    showNavigation: false,
    showViewerInfo: false,
    editingTags: false,
    dialogs: [],
    nextDialogKey: 0,
    shouldPrint: false,
    searchFocus: false,
  },

  handlers: {
    authChanged(state) {
      return update(state, {
        viewers: { $set: [] },
        tags: { $set: [] },
        dialogs: { $set: [] },
      });
    },

    toggleNavigation(state) {
      if (state.showNavigation) {
        return update(state, {
          showNavigation: { $set: false },
          editingTags: { $set: false },
        });
      }

      return update(state, {
        showNavigation: { $set: true },
        showViewerInfo: { $set: false },
      });
    },

    selectAllViewers(state) {
      return update(state, {
        showNavigation: { $set: false },
        editingTags: { $set: false },
        showTrash: { $set: false },
        listTitle: { $set: 'All Viewers' },
        tag: { $set: null },
        viewer: { $set: null },
        selectedViewerId: { $set: null },
        previousIndex: { $set: -1 },
      });
    },

    selectTrash(state) {
      return update(state, {
        showNavigation: { $set: false },
        editingTags: { $set: false },
        showTrash: { $set: true },
        listTitle: { $set: 'Trash' },
        tag: { $set: null },
        viewer: { $set: null },
        selectedViewerId: { $set: null },
        previousIndex: { $set: -1 },
      });
    },

    selectTag(state, { tag }) {
      return update(state, {
        showNavigation: { $set: false },
        editingTags: { $set: false },
        showTrash: { $set: false },
        listTitle: { $set: tag.data.name },
        tag: { $set: tag },
        viewer: { $set: null },
        selectedViewerId: { $set: null },
        previousIndex: { $set: -1 },
      });
    },

    setEditorMode(state, { mode }) {
      return update(state, {
        editorMode: { $set: mode },
      });
    },

    showDialog(state, { dialog, params }) {
      var dialogs = state.dialogs;
      var { type } = dialog;

      if (dialog.single) {
        for (let i = 0; i < dialogs.length; i++) {
          if (dialogs[i].type === type) {
            return;
          }
        }
      }

      return update(state, {
        dialogs: { $push: [{ ...dialog, params, key: state.nextDialogKey }] },
        nextDialogKey: { $set: state.nextDialogKey + 1 },
      });
    },

    closeDialog(state, { key }) {
      var dialogs = state.dialogs;

      for (let i = 0; i < dialogs.length; i++) {
        if (dialogs[i].key === key) {
          return update(state, {
            dialogs: { $splice: [[i, 1]] },
          });
        }
      }
    },

    editTags(state) {
      return update(state, {
        editingTags: { $set: !state.editingTags },
      });
    },

    newTag: {
      creator({ tagBucket, name }) {
        return () => {
          // tag.id must be the tag name in lower case and percent escaped
          const tagId = encodeURIComponent(name.toLowerCase());
          tagBucket.update(tagId, { name });
        };
      },
    },

    renameTag: {
      creator({ tagBucket, viewerBucket, tag, name }) {
        return (dispatch, getState) => {
          let oldTagName = tag.data.name;
          if (oldTagName === name) {
            return;
          }

          let { viewers } = getState().appState;
          let changedViewerIds = [];

          tag.data.name = name;

          // update the tag bucket but don't fire a sync immediately
          tagBucket.update(tag.id, tag.data, { sync: false });

          // similarly, update the viewer bucket
          for (let i = 0; i < viewers.length; i++) {
            let viewer = viewers[i];
            let viewerTags = viewer.data.tags || [];
            let tagIndex = viewerTags.indexOf(oldTagName);

            if (tagIndex !== -1) {
              viewerTags.splice(tagIndex, 1, name);
              viewer.data.tags = viewerTags.filter(
                viewerTag => viewerTag !== oldTagName
              );
              viewerBucket.update(viewer.id, viewer.data, { sync: false });
              changedViewerIds.push(viewer.id);
            }
          }

          throttle(tag.id, typingThrottle, () => {
            tagBucket.touch(tag.id, () => {
              dispatch(this.action('loadTags', { tagBucket }));

              for (let i = 0; i < changedViewerIds.length; i++) {
                viewerBucket.touch(changedViewerIds[i]);
              }
            });
          });
        };
      },
    },

    trashTag: {
      creator({ tagBucket, viewerBucket, tag }) {
        return (dispatch, getState) => {
          var { viewers } = getState().appState;
          var tagName = tag.data.name;

          for (let i = 0; i < viewers.length; i++) {
            let viewer = viewers[i];
            let viewerTags = viewer.data.tags || [];
            let newTags = viewerTags.filter(viewerTag => viewerTag !== tagName);

            if (newTags.length !== viewerTags.length) {
              viewer.data.tags = newTags;
              viewerBucket.update(viewer.id, viewer.data);
            }
          }

          tagBucket.remove(tag.id, () => {
            dispatch(this.action('loadTags', { tagBucket }));
          });
        };
      },
    },

    reorderTags: {
      creator({ tagBucket, tags }) {
        return () => {
          for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            tag.data.index = i;
            tagBucket.update(tag.id, tag.data);
          }
        };
      },
    },

    search(state, { filter }) {
      return update(state, {
        filter: { $set: filter },
      });
    },

    newViewer: {
      creator({ viewerBucket, content = '' }) {
        return (dispatch, getState) => {
          const state = getState().appState;
          const settings = getState().settings;
          const timestamp = new Date().getTime() / 1000;

          if (state.showTrash) {
            dispatch(this.action('selectAllViewers'));
          }

          if (settings.markdownEnabled) {
            dispatch(this.action('setEditorMode', { mode: 'edit' }));
          }

          // insert a new viewer into the store and select it
          viewerBucket.add(
            {
              content,
              deleted: false,
              systemTags: settings.markdownEnabled ? ['markdown'] : [],
              creationDate: timestamp,
              modificationDate: timestamp,
              shareURL: '',
              publishURL: '',
              tags: [].concat(state.tag ? state.tag.data.name : []),
            },
            (e, viewer) => {
              dispatch(this.action('loadViewers', { viewerBucket }));
              dispatch(
                this.action('loadAndSelectViewer', {
                  viewerBucket,
                  viewerId: viewer.id,
                })
              );
            }
          );
        };
      },
    },

    loadViewers: {
      creator({ viewerBucket }) {
        return (dispatch, getState) => {
          const settings = getState().settings;
          const { sortType, sortReversed } = settings;
          var sortOrder;

          if (sortType === 'alphabetical') {
            sortOrder = sortReversed ? 'prev' : 'next';
          } else {
            sortOrder = sortReversed ? 'next' : 'prev';
          }

          viewerBucket.query(db => {
            var viewers = [];
            db
              .transaction('viewer')
              .objectStore('viewer')
              .index(sortType)
              .openCursor(null, sortOrder).onsuccess = e => {
              var cursor = e.target.result;
              if (cursor) {
                viewers.push(cursor.value);
                cursor.continue();
              } else {
                dispatch(this.action('viewersLoaded', { viewers: viewers }));
              }
            };
          });
        };
      },
    },

    viewersLoaded(state, { viewers }) {
      const [pinned, notPinned] = partition(viewers, viewer => viewer.pinned);

      return update(state, {
        viewers: { $set: [...pinned, ...notPinned] },
      });
    },

    loadAndSelectViewer: {
      creator({ viewerBucket, viewerId }) {
        return dispatch => {
          dispatch(this.action('selectViewer', { viewerId }));

          viewerBucket.get(viewerId, (e, viewer) => {
            dispatch(this.action('viewerLoaded', { viewer }));
          });
        };
      },
    },

    pinViewer: {
      creator({ viewerBucket, viewer, pin }) {
        return dispatch => {
          let systemTags = viewer.data.systemTags || [];
          let pinnedTagIndex = systemTags.indexOf('pinned');

          if (pin && pinnedTagIndex === -1) {
            viewer.data.systemTags.push('pinned');
            viewerBucket.update(viewer.id, viewer.data);
            dispatch(this.action('viewerLoaded', { viewer }));
          } else if (!pin && pinnedTagIndex !== -1) {
            viewer.data.systemTags = systemTags.filter(tag => tag !== 'pinned');
            viewerBucket.update(viewer.id, viewer.data);
            dispatch(this.action('viewerLoaded', { viewer }));
          }
        };
      },
    },

    setShouldPrintViewer(state, { shouldPrint = true }) {
      return update(state, {
        shouldPrint: { $set: shouldPrint },
      });
    },

    setSearchFocus(state, { searchFocus = true }) {
      return update(state, {
        searchFocus: { $set: searchFocus },
      });
    },

    markdownViewer: {
      creator({ viewerBucket, viewer, markdown }) {
        return dispatch => {
          let systemTags = viewer.data.systemTags || [];
          let markdownTagIndex = systemTags.indexOf('markdown');

          if (markdown && markdownTagIndex === -1) {
            viewer.data.systemTags.push('markdown');
            viewerBucket.update(viewer.id, viewer.data);
            dispatch(this.action('viewerLoaded', { viewer }));
          } else if (!markdown && markdownTagIndex !== -1) {
            viewer.data.systemTags = systemTags.filter(tag => tag !== 'markdown');
            viewerBucket.update(viewer.id, viewer.data);
            dispatch(this.action('viewerLoaded', { viewer }));
          }
        };
      },
    },

    publishViewer: {
      creator({ viewerBucket, viewer, publish }) {
        return dispatch => {
          let systemTags = viewer.data.systemTags || [];
          let tagIndex = systemTags.indexOf('published');

          if (publish && tagIndex === -1) {
            viewer.data.systemTags.push('published');
            viewerBucket.update(viewer.id, viewer.data);
            dispatch(this.action('viewerLoaded', { viewer }));
            analytics.tracks.recordEvent('editor_viewer_published');
          } else if (!publish && tagIndex !== -1) {
            viewer.data.systemTags = systemTags.filter(
              tag => tag !== 'published'
            );
            viewerBucket.update(viewer.id, viewer.data);
            dispatch(this.action('viewerLoaded', { viewer }));
            analytics.tracks.recordEvent('editor_viewer_unpublished');
          }
        };
      },
    },

    selectViewer(state, { viewerId }) {
      return update(state, {
        showNavigation: { $set: false },
        editingTags: { $set: false },
        selectedViewerId: { $set: viewerId },
        revisions: { $set: null },
      });
    },

    viewerLoaded(state, { viewer }) {
      return update(state, {
        viewer: { $set: viewer },
        selectedViewerId: { $set: viewer.id },
        revisions: { $set: null },
      });
    },

    closeViewer(state, { previousIndex = -1 }) {
      return update(state, {
        viewer: { $set: null },
        selectedViewerId: { $set: null },
        previousIndex: { $set: previousIndex },
      });
    },

    viewerUpdated: {
      creator({ viewerBucket, viewerId, original, data, patch, isIndexing }) {
        return (dispatch, getState) => {
          var state = getState().appState;

          if (isIndexing) {
            // Increase index counter
            this.indexCtr++;
          } else if (this.indexCtr > 0) {
            // completed indexing, reset counter
            this.indexCtr = 0;
          }

          // Refresh the viewers list. Rate limit if indexing
          if (!isIndexing || (isIndexing && this.indexCtr % 30 === 0)) {
            dispatch(this.action('loadViewers', { viewerBucket }));
          }

          if (state.selectedViewerId !== viewerId || !patch) {
            return;
          }

          // working is the state of the viewer in the editor
          const viewer = state.viewers.find(n => n.id === viewerId);

          if (!viewer) {
            console.error(`Cannot find viewer (id=${viewerId})!`); // eslint-disable-line no-console
            return;
          }

          let working = viewer.data;

          // diff of working and original will produce the modifications the client has currently made
          let working_diff = simperiumUtil.change.diff(original, working);
          // generate a patch that composes both the working changes and upstream changes
          patch = simperiumUtil.change.transform(working_diff, patch, original);
          // apply the new patch to the upstream data
          let rebased = simperiumUtil.change.apply(patch, data);

          // TODO: determine where the cursor is and put it in the correct place
          // when applying the rebased content

          state.viewer.data = rebased;

          // update the bucket and sync
          viewerBucket.update(viewerId, rebased);

          dispatch(
            this.action('selectViewer', {
              viewerId,
            })
          );
        };
      },
    },

    updateViewerContent: {
      creator({ viewerBucket, viewer, content }) {
        return dispatch => {
          if (viewer) {
            viewer.data.content = content;
            viewer.data.modificationDate = Math.floor(Date.now() / 1000);

            // update the bucket and sync
            viewerBucket.update(viewer.id, viewer.data);

            dispatch(
              this.action('selectViewer', {
                viewerId: viewer.id,
              })
            );
          }
        };
      },
    },

    updateViewerTags: {
      creator({ viewerBucket, tagBucket, viewer, tags }) {
        return (dispatch, getState) => {
          if (viewer) {
            let state = getState().appState;

            viewer.data.tags = tags;
            viewerBucket.update(viewer.id, viewer.data);

            dispatch(
              this.action('selectViewer', {
                viewerId: viewer.id,
              })
            );

            let currentTagNames = state.tags.map(tag => tag.data.name);
            for (let i = 0; i < tags.length; i++) {
              let tag = tags[i];

              if (currentTagNames.indexOf(tag) !== -1) {
                continue;
              }

              if (isEmailTag(tag)) {
                continue;
              }

              dispatch(
                this.action('newTag', {
                  tagBucket,
                  name: tag,
                })
              );
            }
          }
        };
      },
    },

    trashViewer: {
      creator({ viewerBucket, viewer, previousIndex }) {
        return dispatch => {
          if (viewer) {
            viewer.data.deleted = true;
            viewerBucket.update(viewer.id, viewer.data);

            dispatch(this.action('closeViewer', { previousIndex }));
          }
        };
      },
    },

    restoreViewer: {
      creator({ viewerBucket, viewer, previousIndex }) {
        return dispatch => {
          if (viewer) {
            viewer.data.deleted = false;
            viewerBucket.update(viewer.id, viewer.data);

            dispatch(this.action('closeViewer', { previousIndex }));
          }
        };
      },
    },

    deleteViewerForever: {
      creator({ viewerBucket, viewer, previousIndex }) {
        return dispatch => {
          viewerBucket.remove(viewer.id);

          dispatch(this.action('closeViewer', { previousIndex }));
          dispatch(this.action('loadViewers', { viewerBucket }));
        };
      },
    },

    viewerRevisions: {
      creator({ viewerBucket, viewer }) {
        return dispatch => {
          viewerBucket.getRevisions(viewer.id, (e, revisions) => {
            if (e) {
              return console.warn('Failed to load revisions', e); // eslint-disable-line no-console
            }

            dispatch(this.action('viewerRevisionsLoaded', { revisions }));
          });
        };
      },
    },

    emptyTrash: {
      creator({ viewerBucket }) {
        return (dispatch, getState) => {
          const state = getState().appState;
          const [deleted, viewers] = partition(
            state.viewers,
            viewer => viewer.data.deleted
          );

          dispatch(this.action('closeViewer'));
          deleted.forEach(viewer => viewerBucket.remove(viewer.id));
          dispatch(this.action('viewersLoaded', { viewers }));
        };
      },
    },

    viewerRevisionsLoaded(state, { revisions }) {
      return update(state, {
        revisions: { $set: revisions },
      });
    },

    toggleViewerInfo(state) {
      if (state.showViewerInfo) {
        return update(state, {
          showViewerInfo: { $set: false },
        });
      }

      return update(state, {
        showViewerInfo: { $set: true },
        showNavigation: { $set: false },
        editingTags: { $set: false },
      });
    },

    loadTags: {
      creator({ tagBucket }) {
        return dispatch => {
          tagBucket.query(db => {
            var tags = [];
            db
              .transaction('tag')
              .objectStore('tag')
              .openCursor(null, 'prev').onsuccess = e => {
              var cursor = e.target.result;
              if (cursor) {
                tags.push(cursor.value);
                cursor.continue();
              } else {
                dispatch(this.action('tagsLoaded', { tags: tags }));
              }
            };
          });
        };
      },
    },

    tagsLoaded(state, { tags }) {
      tags = tags.slice();
      tags.sort((a, b) => (a.data.index | 0) - (b.data.index | 0));

      return update(state, {
        tags: { $set: tags },
      });
    },
  },
});

actionMap.indexCtr = 0;

export default actionMap;
