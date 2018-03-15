/**
 * External dependencies
 */
import { difference, escapeRegExp, get, overEvery } from 'lodash';

const tagPattern = () => /(?:\btag:)([\w-]+)(?!\B)/g;

export const withoutTags = s => s.replace(tagPattern(), '').trim();
export const filterHasText = filter => !!withoutTags(filter);

const getTerms = filterText => {
  if (!filterText) {
    return [];
  }

  const literalsPattern = /(?:")((?:"|[^"])+)(?:")/g;
  const boundaryPattern = /[\b\s]/g;

  let match;
  let withoutLiterals = '';

  const filter = withoutTags(filterText);

  const literals = [];
  while ((match = literalsPattern.exec(filter)) !== null) {
    literals.push(match[0].slice(1, -1));

    withoutLiterals += filter.slice(literalsPattern.lastIndex, match.index);
  }

  if (
    (literalsPattern.lastIndex > 0 || literals.length === 0) &&
    literalsPattern.lastIndex < filter.length
  ) {
    withoutLiterals += filter.slice(literalsPattern.lastIndex);
  }

  const terms = withoutLiterals
    .split(boundaryPattern)
    .map(a => a.trim())
    .filter(a => a);

  return [...literals, ...terms];
};

export const searchPattern = filter => {
  const terms = getTerms(withoutTags(filter));

  if (!terms.length) {
    return new RegExp('.+', 'g');
  }

  return new RegExp(
    `(?:${terms.map(word => `(?:${escapeRegExp(word)})`).join('|')})`,
    'gi'
  );
};

const matchesTrashView = isViewingTrash => view =>
  isViewingTrash === !!get(view, 'data.deleted', false);

const matchesTag = (tag, filter = '') => view => {
  let filterTags = [];
  let match;
  const matcher = tagPattern();

  while ((match = matcher.exec(filter)) !== null) {
    filterTags.push(match[1]);

    if (filterTags.length > 100) {
      break;
    }
  }

  const givenTag = tag ? [get(tag, 'data.name', '')] : [];

  const viewTags = get(view, 'data.tags', []);

  const missingTags = difference([...filterTags, ...givenTag], viewTags);

  return missingTags.length === 0;
};

const matchesSearch = (filter = '') => view => {
  if (!filter) {
    return true;
  }

  const content = get(view, 'data.content');

  if (!content) {
    return false;
  }

  return getTerms(filter).every(term =>
    new RegExp(escapeRegExp(term), 'gi').test(content)
  );
};

export default function filterViews(state) {
  const {
    filter, // {string} search query from input
    views, // {[view]} list of all available views
    showTrash, // {bool} whether we are looking at the trashed views
    tag, // {tag|null} whether we are looking at a specific tag
  } = state;

  return views.filter(
    overEvery([
      matchesTrashView(showTrash),
      matchesTag(tag, filter),
      matchesSearch(filter),
    ])
  );
}
