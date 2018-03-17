import {
  filter,
  flowRight as compose,
  get,
  partialRight,
  partition,
  property,
  reverse,
  sortBy,
  uniqueId,
} from 'lodash';

import isEmailTag from '../is-email-tag';

export const LF_ONLY_NEWLINES = /(?!\r)\n/g;

const mapView = view => {
  const [collaboratorEmails, tags] = partition(
    sortBy(get(view, 'data.tags', []), a => a.toLocaleLowerCase()),
    isEmailTag
  );

  return Object.assign(
    {
      id: get(view, 'id', uniqueId('unknown_view_')),
      content: get(view, 'data.content', '').replace(LF_ONLY_NEWLINES, '\r\n'),
      creationDate: new Date(view.data.creationDate * 1000).toISOString(),
      lastModified: new Date(view.data.modificationDate * 1000).toISOString(),
    },
    get(view, 'pinned', false) && { pinned: true },
    tags.length && { tags },
    get(view, 'data.systemTags', []).includes('published') &&
    get(view, 'data.publishURL', '').length && {
      publicURL: `http://simp.ly/p/${get(view, 'data.publishURL', '')}`,
    },
    get(view, 'data.systemTags', []).includes('shared') &&
    collaboratorEmails.length && { collaboratorEmails }
  );
};

const nonEmptyByRecentEdits = compose(
  reverse,
  partialRight(sortBy, property('data.modificationDate')),
  partialRight(filter, property('data.content'))
);

const mapViews = views => {
  const [trashedViews, activeViews] = partition(
    nonEmptyByRecentEdits(views),
    view => !!get(view, 'data.deleted', false)
  ).map(list => list.map(mapView));

  return Promise.resolve({
    activeViews,
    trashedViews,
  });
};

const readViews = db =>
  new Promise((resolve, reject) => {
    const request = db
      .transaction('view')
      .objectStore('view')
      .openCursor();

    const views = [];
    request.onsuccess = ({ target: { result: cursor } }) =>
      cursor ? views.push(cursor.value) && cursor.continue() : resolve(views);

    request.onerror = reject;
  });

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const idb = window.indexedDB.open('simpleview');

    idb.onsuccess = ({ target: { result: db } }) => resolve(db);
    idb.onerror = reject;
  });

export const exportViews = () =>
  openDatabase()
    .then(readViews)
    .then(mapViews);

export default exportViews;
