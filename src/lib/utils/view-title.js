/**
 * Matches the title and excerpt in a viewer's content
 *
 * Both the title and the excerpt are determined as
 * content starting with something that isn't
 * whitespace and leads up to a newline or line end
 *
 * @type {RegExp} matches a title and excerpt in viewer content
 */
const viewerTitleAndPreviewRegExp = /(\S[^\n]*)\s*(\S[^\n]*)?/;

/**
 * Returns the title and excerpt for a given viewer
 *
 * @param {Object} viewer a viewer object
 * @returns {Object} title and excerpt (if available)
 */
export const viewerTitleAndPreview = viewer => {
  const content = viewer && viewer.data && viewer.data.content;
  const match = viewerTitleAndPreviewRegExp.exec(content || '');

  const title = (match && match[1] && match[1].slice(0, 200)) || 'New viewer...';
  const preview = (match && match[2]) || '';

  return { title, preview };
};

export default viewerTitleAndPreview;
