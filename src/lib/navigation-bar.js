import React from 'react';
// import { connect } from 'react-redux';
//import TagList from './tag-list';
import ViewsIcon from './icons/views';
import TrashIcon from './icons/trash';
import SettingsIcon from './icons/settings';
//import { viewExternalUrl } from './utils/url-utils';
import classNames from 'classnames';
//import appState from './flux/app-state';

class NavigationBar extends React.Component{
    render(){
        const { viewBucket, tagBucket } = this.props;
        const classes = classNames('button', 'button-borderless', 'theme-color-fg');
        const allViewsClasses = classNames(
        "navigation-folders-item",
        classes
        );
        const trashClasses = classNames("navigation-folders-item-selected", classes);

        return (
            <div className="navigation theme-color-bg theme-color-fg theme-color-border">
                <div className="navigation-folders">
                <button
                    type="button"
                    className={allViewsClasses}
                    onClick={this.props.onSelectAllViews}
                >
                    <span className="navigation-icon">
                    <ViewsIcon />
                    </span>
                    All Views
                </button>
                <button
                    type="button"
                    className={trashClasses}
                    onClick={this.props.onSelectTrash}
                >
                    <span className="navigation-icon">
                    <TrashIcon />
                    </span>
                    Trash
                </button>
                </div>
                {/* <div className="navigation-tags theme-color-border">
                <TagList viewBucket={viewBucket} tagBucket={tagBucket} />
                </div> */}
                <div className="navigation-tools theme-color-border">
                <button
                    type="button"
                    className="navigation-tools-item button button-borderless theme-color-fg"
                    onClick={this.props.onSettings}
                >
                    <span className="navigation-icon">
                    <SettingsIcon />
                    </span>
                    Settings
                </button>
                </div>
                <div className="navigation-footer">
                <button
                    type="button"
                    className="navigation-footer-item theme-color-fg-dim"
                    onClick={this.onHelpClicked}
                >
                    Help &amp; Support
                </button>
                <button
                    type="button"
                    className="navigation-footer-item theme-color-fg-dim"
                    onClick={this.props.onAbout}
                >
                    About
                </button>
                </div>
            </div>            
        );
    }
}

export default NavigationBar;
