import React from 'react'
import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

/**
 * Delay for preventing row height calculation thrashing
 *
 * this constant was determined experimentally
 * and is open to adjustment if it doesn't find
 * the proper balance between visual updates
 * and performance impacts recomputing row heights
 *
 * @type {Number} minimum number of ms between calls to recomputeRowHeights in virtual/list
 */
//const TYPING_DEBOUNCE_DELAY = 70;

/**
 * Maximum delay when debouncing the row height calculation
 *
 * this is used to make sure that we don't endlessly delay
 * the row height recalculation in situations like when we
 * are constantly typing without pause. by setting this value
 * we can make sure that the updates don't happen
 * less-frequently than the number of ms set here
 *
 * @type {Number} maximum number of ms between calls when debouncing recomputeRowHeights in virtual/list
 */
//const TYPING_DEBOUNCE_MAX = 1000;

/** @type {Number} height of title + vertical padding in list rows */
// const ROW_HEIGHT_BASE = 24 + 18;

/** @type {Number} height of one row of preview text in list rows */
// const ROW_HEIGHT_LINE = 21;

/** @type {Object.<String, Number>} maximum number of lines to display in list rows for display mode */
// const maxPreviewLines = {
//   comfy: 1,
//   condensed: 0,
//   expanded: 4,
// };

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 *
 * @param {String} text The text to be rendered.
 * @param {String} width width of the containing area in which the text is rendered
 * @returns {number} width of rendered text in pixels
 */
// function getTextWidth(text, width) {
//   const canvas =
//     getTextWidth.canvas ||
//     (getTextWidth.canvas = document.createElement('canvas'));
//   canvas.width = width;
//   const context = canvas.getContext('2d');
//   context.font = '16px arial';
//   return context.measureText(text).width;
// }

/**
 * Computes the pixel height of a row for a given preview text in the list
 *
 * @param {Number} width how wide the list renders
 * @param {String} viewDisplay mode of list display: 'comfy', 'condensed', or 'expanded'
 * @param {String} preview preview snippet from view
 * @returns {Number} height of the row in the list
 */
// const computeRowHeight = (width, viewDisplay, preview) => {
//     const lines = Math.ceil(getTextWidth(preview, width - 24) / (width - 24));
//     return (
//       ROW_HEIGHT_BASE +
//       ROW_HEIGHT_LINE * Math.min(maxPreviewLines[viewDisplay], lines)
//     );
//   };
  
  /**
   * Estimates the pixel height of a given row in the view list
   *
   * This function utilizes a cache to prevent rerendering the text into a canvas
   * @see rowHeightCache
   *
   * @function
   */
// const getRowHeight = ROW_HEIGHT_BASE;

class ViewList extends React.Component{

    render(){
        let rowRenderer = ( {key, index, style} ) => {

            console.log({ key, index, style});

            return (
                <div
                key={key}
                style={style}
                >
                {this.props.viewBucket[index]}
                </div>
            ) 
        };

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        height={height}
                        rowCount={this.props.viewBucket.length}
                        rowHeight={20}
                        rowRenderer={rowRenderer}
                        width={width}
                    />
                )}
            </AutoSizer>
        );
    }
}

export default ViewList;