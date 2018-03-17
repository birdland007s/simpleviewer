import React from 'react';
import PropTypes from 'prop-types';
import BackIcon from './icons/back';
import InfoIcon from './icons/info';
import RevisionsIcon from './icons/revisions';
import TrashIcon from './icons/trash';
import ShareIcon from './icons/share';

class ViewToolbar extends React.Component{
//   propTypes: {
//     view: PropTypes.object,
//     onTrashView: PropTypes.func.isRequired,
//     onRestoreView: PropTypes.func.isRequired,
//     onDeleteViewForever: PropTypes.func.isRequired,
//     onRevisions: PropTypes.func.isRequired,
//     onShareView: PropTypes.func.isRequired,
//     onCloseView: PropTypes.func.isRequired,
//     onViewInfo: PropTypes.func.isRequired,
//     setIsViewingRevisions: PropTypes.func.isRequired,
//   },

//   showRevisions: function() {
//     this.props.setIsViewingRevisions(true);
//     this.props.onRevisions(this.props.view);
//   },

  render() {
    const { view } = this.props;
    const isTrashed = !!(view && view.data.deleted);

    return isTrashed ? this.renderTrashed() : this.renderNormal();
  }

  renderNormal() {
    const { view } = this.props;

    return (
      <div className="view-toolbar">
        <div className="view-toolbar-icon view-toolbar-back">
          <button
            type="button"
            title="Back"
            className="button button-borderless"
            onClick={this.props.onCloseView}
          >
            <BackIcon />
          </button>
        </div>
        <div className="view-toolbar-icon">
          <button
            type="button"
            title="History"
            className="button button-borderless"
            onClick={this.showRevisions}
          >
            <RevisionsIcon />
          </button>
        </div>
        <div className="view-toolbar-icon">
          <button
            type="button"
            title="Share"
            className="button button-borderless"
            // onClick={this.props.onShareView.bind(null, view)}
          >
            <ShareIcon />
          </button>
        </div>
        <div className="view-toolbar-icon">
          <button
            type="button"
            title="Trash"
            className="button button-borderless"
            // onClick={this.props.onTrashView.bind(null, view)}
          >
            <TrashIcon />
          </button>
        </div>
        <div className="view-toolbar-icon">
          <button
            type="button"
            title="Info"
            className="button button-borderless"
            onClick={this.props.onViewInfo}
          >
            <InfoIcon />
          </button>
        </div>
      </div>
    );
  }

  renderTrashed() {
    const { view } = this.props;

    return (
      <div className="view-toolbar-trashed">
        <div className="view-toolbar-text">
          <button
            type="button"
            className="button button-compact button-danger"
            onClick={this.props.onDeleteViewForever.bind(null, view)}
          >
            Delete Forever
          </button>
        </div>
        <div className="view-toolbar-text">
          <button
            type="button"
            className="button button-primary button-compact"
            onClick={this.props.onRestoreView.bind(null, view)}
          >
            Restore View
          </button>
        </div>
      </div>
    );
  }
};

export default ViewToolbar;
