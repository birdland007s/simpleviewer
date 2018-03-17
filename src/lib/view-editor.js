import React from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import classNames from 'classnames';
// import showdown from 'showdown';
// import xssFilter from 'showdown-xss-filter';
import ViewDetail from './view-detail';
// import TagField from './tag-field';
import ViewToolbar from './view-toolbar';
// import RevisionSelector from './revision-selector';
// import { get, property } from 'lodash';

// const markdownConverter = new showdown.Converter({ extensions: [xssFilter] });
// markdownConverter.setFlavor('github');

class ViewEditor extends React.Component{
//   propTypes: {
//     editorMode: PropTypes.oneOf(['edit', 'markdown']),
//     view: PropTypes.object,
//     revisions: PropTypes.array,
//     fontSize: PropTypes.number,
//     shouldPrint: PropTypes.bool,
//     onSetEditorMode: PropTypes.func.isRequired,
//     onUpdateContent: PropTypes.func.isRequired,
//     onUpdateViewTags: PropTypes.func.isRequired,
//     onTrashView: PropTypes.func.isRequired,
//     onRestoreView: PropTypes.func.isRequired,
//     onShareView: PropTypes.func.isRequired,
//     onDeleteViewForever: PropTypes.func.isRequired,
//     onRevisions: PropTypes.func.isRequired,
//     onCloseView: PropTypes.func.isRequired,
//     onViewInfo: PropTypes.func.isRequired,
//     onPrintView: PropTypes.func,
//   }

//   getDefaultProps: function() {
//     return {
//       editorMode: 'edit',
//       view: {
//         data: {
//           tags: [],
//         },
//       },
//     };
//   },

//   componentDidMount() {
//     this.toggleShortcuts(true);
//   },

//   componentWillReceiveProps: function() {
//     this.setState({ revision: null });
//   },

//   getInitialState: function() {
//     return {
//       revision: null,
//       isViewingRevisions: false,
//     };
//   },

//   componentDidUpdate: function() {
//     // Immediately print once `shouldPrint` has been set
//     if (this.props.shouldPrint) {
//       window.print();
//       this.props.onViewPrinted();
//     }
//   },

//   componentWillUnmount() {
//     this.toggleShortcuts(false);
//   },

//   handleShortcut(event) {
//     const { ctrlKey, key, metaKey } = event;

//     const cmdOrCtrl = ctrlKey || metaKey;

//     // toggle editor mode
//     if (cmdOrCtrl && 'P' === key && this.props.markdownEnabled) {
//       const prevEditorMode = this.props.editorMode;
//       const nextEditorMode = prevEditorMode === 'edit' ? 'markdown' : 'edit';

//       this.props.onSetEditorMode(nextEditorMode);

//       event.stopPropagation();
//       event.preventDefault();
//       return false;
//     }

//     // open view list - shift + n
//     if (cmdOrCtrl && 'N' === key) {
//       this.props.onCloseView();

//       event.stopPropagation();
//       event.preventDefault();
//       return false;
//     }

//     // toggle between tag editor and view editor
//     if (cmdOrCtrl && 't' === key && this.props.isEditorActive) {
//       // prefer focusing the edit field first
//       if (!this.editFieldHasFocus()) {
//         this.focusViewEditor && this.focusViewEditor();

//         event.stopPropagation();
//         event.preventDefault();
//         return false;
//       } else if (!this.tagFieldHasFocus()) {
//         this.focusTagField && this.focusTagField();

//         event.stopPropagation();
//         event.preventDefault();
//         return false;
//       }
//     }

//     return true;
//   },

//   editFieldHasFocus() {
//     return this.editorHasFocus && this.editorHasFocus();
//   },

//   onViewRevision: function(revision) {
//     this.setState({ revision: revision });
//   },

//   onSelectRevision: function(revision) {
//     if (!revision) {
//       return;
//     }

//     const { view, onUpdateContent } = this.props;
//     const { data: { content } } = revision;

//     onUpdateContent(view, content);
//     this.setIsViewingRevisions(false);
//   },

//   onCancelRevision: function() {
//     // clear out the revision
//     this.setState({ revision: null });
//     this.setIsViewingRevisions(false);
//   },

//   setEditorMode(event) {
//     const editorMode = get(event, 'target.dataset.editorMode');

//     if (!editorMode) {
//       return;
//     }

//     this.props.onSetEditorMode(editorMode);
//   },

//   setIsViewingRevisions: function(isViewing) {
//     this.setState({ isViewingRevisions: isViewing });
//   },

//   storeEditorHasFocus(f) {
//     this.editorHasFocus = f;
//   },

//   storeFocusEditor(f) {
//     this.focusViewEditor = f;
//   },

//   storeFocusTagField(f) {
//     this.focusTagField = f;
//   },

//   storeTagFieldHasFocus(f) {
//     this.tagFieldHasFocus = f;
//   },

//   tagFieldHasFocus() {
//     return this.tagFieldHasFocus && this.tagFieldHasFocus();
//   },

//   toggleShortcuts(doEnable) {
//     if (doEnable) {
//       window.addEventListener('keydown', this.handleShortcut, true);
//     } else {
//       window.removeEventListener('keydown', this.handleShortcut, true);
//     }
//   },

  render() {
    let viewContent = '';
    const { editorMode, view, revisions, fontSize, shouldPrint } = this.props;
    // const revision = this.state.revision || view;
    // const isViewingRevisions = this.state.isViewingRevisions;
    // const tags = (revision && revision.data && revision.data.tags) || [];
    const isTrashed = !!(view && view.data.deleted);

    // const markdownEnabled =
    //   revision &&
    //   revision.data &&
    //   revision.data.systemTags &&
    //   revision.data.systemTags.indexOf('markdown') !== -1;

    const classes = classNames(
      'view-editor',
      'theme-color-bg',
      'theme-color-fg',
    //   {
    //     revisions: isViewingRevisions,
    //     markdown: markdownEnabled,
    //   }
    );

    // if (shouldPrint) {
    //   const content = get(revision, 'data.content', '');
    //   viewContent = markdownEnabled
    //     ? markdownConverter.makeHtml(content)
    //     : content;
    // }

    const printStyle = {
      fontSize: fontSize + 'px',
    };

    return (
      <div className={classes}>
        {/* <RevisionSelector
          revisions={revisions || []}
          onViewRevision={this.onViewRevision}
          onSelectRevision={this.onSelectRevision}
          onCancelRevision={this.onCancelRevision}
        /> */}
        <div className="view-editor-controls theme-color-border">
          <ViewToolbar
            view={view}
            onTrashView={this.props.onTrashView}
            onRestoreView={this.props.onRestoreView}
            onShareView={this.props.onShareView}
            onDeleteViewForever={this.props.onDeleteViewForever}
            onRevisions={this.props.onRevisions}
            setIsViewingRevisions={this.setIsViewingRevisions}
            onCloseView={this.props.onCloseView}
            onViewInfo={this.props.onViewInfo}
          />
        </div>
        <div className="view-editor-content theme-color-border">
          {/* {!!markdownEnabled && this.renderModeBar()} */}
          <div className="view-editor-detail">
            <ViewDetail
              storeFocusEditor={this.storeFocusEditor}
              storeHasFocus={this.storeEditorHasFocus}
              filter={this.props.filter}
            //   view={revision}
            //   previewingMarkdown={markdownEnabled && editorMode === 'markdown'}
              onChangeContent={this.props.onUpdateContent}
              fontSize={fontSize}
            />
          </div>
        </div>
        {shouldPrint && (
          <div
            style={printStyle}
            className="view-print view-detail-markdown"
            dangerouslySetInnerHTML={{ __html: viewContent }}
          />
        )}
        {/* {!isTrashed && (
          <TagField
            storeFocusTagField={this.storeFocusTagField}
            storeHasFocus={this.storeTagFieldHasFocus}
            allTags={this.props.allTags.map(property('data.name'))}
            view={this.props.view}
            tags={tags}
            onUpdateViewTags={this.props.onUpdateViewTags.bind(null, view)}
          />
        )} */}
      </div>
    );
  }

  renderModeBar() {
    const { editorMode } = this.props;

    const isPreviewing = editorMode === 'markdown';

    return (
      <div className="view-editor-mode-bar segmented-control">
        <button
          type="button"
          className={classNames(
            'button button-segmented-control button-compact',
            { active: !isPreviewing }
          )}
          data-editor-mode="edit"
          onClick={this.setEditorMode}
        >
          Edit
        </button>
        <button
          type="button"
          className={classNames(
            'button button-segmented-control button-compact',
            { active: isPreviewing }
          )}
          data-editor-mode="markdown"
          onClick={this.setEditorMode}
        >
          Preview
        </button>
      </div>
    );
  }
};

// const mapStateToProps = ({ appState: state, settings }) => ({
//   fontSize: settings.fontSize,
//   isEditorActive: !state.showNavigation,
//   markdownEnabled: settings.markdownEnabled,
// });

// export default connect(mapStateToProps)(ViewEditor);
export default ViewEditor;
