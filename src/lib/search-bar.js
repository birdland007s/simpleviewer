/**
 * External dependencies
 */
import React from 'react';
// import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
// import appState from './flux/app-state';
// import { tracks } from './analytics';
import NewViewIcon from './icons/new-view';
// import SearchField from './search-field';
import TagsIcon from './icons/tags';
// import { withoutTags } from './utils/filter-views';

// const { newView, search, toggleNavigation } = appState.actionCreators;
// const { recordEvent } = tracks;

export const SearchBar = ({
  onNewView,
  onToggleNavigation,
  query,
  showTrash,
}) => (
  <div className="search-bar theme-color-border">
    <button
      className="button button-borderless"
      onClick={onToggleNavigation}
      title="Tags"
    >
      <TagsIcon />
    </button>
    {/* <SearchField /> */}
    <button
      className="button button-borderless"
      disabled={showTrash}
    //   onClick={() => onNewView(withoutTags(query))}
      title="New View"
    >
      <NewViewIcon />
    </button>
  </div>
);

// const mapStateToProps = ({ appState: state }) => ({
//   query: state.filter,
//   showTrash: state.showTrash,
// });

// const mapDispatchToProps = (dispatch, { viewBucket }) => ({
//   onNewView: content => {
//     dispatch(search({ filter: '' }));
//     dispatch(newView({ viewBucket, content }));
//     recordEvent('list_view_created');
//   },
//   onToggleNavigation: () => dispatch(toggleNavigation()),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
export default SearchBar;