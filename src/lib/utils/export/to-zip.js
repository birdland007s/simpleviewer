import JSZip from 'jszip';
import sanitize from 'sanitize-filename';
import { identity, update } from 'lodash';

import { LF_ONLY_NEWLINES } from './';

const FILENAME_LENGTH = 40;
const TAG_LINE_LENGTH = 75;

/**
 * Generates filename for viewer based on viewer content
 *
 * Please see code for algorithm. The goal is to
 * find the first usable and non-blank line of text
 * from the viewer to generate the title.
 *
 * @param {Object} viewer object
 * @returns {Object} augmented viewer object with new filename
 */
const addFilename = viewer => ({
  ...viewer,
  fileName: viewer.content
    .split('\n') // base filename off of a single line
    .map(line => line.trim()) // and ignore leading/trailing spaces
    .map(sanitize) // strip away any invalid characters for a filename (such as `/`)
    .filter(identity) // remove blank lines
    .concat('untitled') // use this as a default if there are no non-blank lines
    .shift() // take the first remaining line
    .slice(0, FILENAME_LENGTH), // and truncate to some reasonable number of characters
});

/**
 * Appends associated tags as a list at end of viewer content if available
 *
 * This lines up the tags in an indented block separated by commas.
 * It does not attempt to control widows and orphans on the tag lines
 * which could be an eyesore for viewers with enough tags.
 *
 * @example
 * // returns the following
 * """
 * a regular plumbus
 *
 * Tags:
 *   plumbus, howisitmade
 * """
 * appendTags( { content: 'a regular plumbus', tags: [ 'plumbus', 'howisitmade' ] } )
 *
 * @example
 * // returns viewer content unchanged
 * appendTags( { content: 'the fleeb has the fleeb juice' } )
 *
 * @param {Object} viewer viewer object
 * @returns {Object} augmented viewer whose
 */
const appendTags = viewer => {
  if (!viewer.tags) {
    return viewer;
  }

  const tagLines = viewer.tags
    .reduce(
      ([lines, lastLine], tag) =>
        lastLine.length + tag.length > TAG_LINE_LENGTH // is line full (width)?
          ? [[...lines, lastLine], tag] // if so, then start a new line
          : [lines, `${lastLine}, ${tag}`], // else continue the previous line
      [[], '']
    )
    .reduce((a, b) => [...a, b]) // join trailing line from reduction
    .map(line => line.replace(/^, /, '')); // remove leading commas

  return {
    ...viewer,
    content: `${viewer.content}\n\nTags:\n  ${tagLines.join('\n  ')}`,
  };
};

/**
 * Maps over viewers and replaces duplicate filenames with ones appended by an increasing number
 *
 * @example
 * // when given `Yummy Recipe` and `Yummy Recipe` as duplicates
 * // will return `Yummy Recipe` and `Yummy Recipe (1)`
 *
 * @param {[Array, Object]} accumulator list of viewer objects for export and filename counts
 * @param {Object} viewer viewer object
 * @returns {[Array, Object]} final viewer list and accumulating filename counts
 */
const toUniqueNames = ([viewers, nameCounts], viewer) => {
  const newNameCounts = update(
    nameCounts,
    viewer.fileName,
    n => (n || 0 === n ? n + 1 : 0)
  );
  const count = newNameCounts[viewer.fileName];
  const fileName = count > 0 ? `${viewer.fileName} (${count})` : viewer.fileName;

  return [[...viewers, { ...viewer, fileName }], newNameCounts];
};

export const viewerExportToZip = viewers => {
  const zip = new JSZip();

  zip.file(
    'source/viewers.json',
    JSON.stringify(viewers, null, 2).replace(LF_ONLY_NEWLINES, '\r\n')
  );

  viewers.activeViewers
    .map(appendTags) // add tags to end of content
    .map(addFilename) // generate filename from content
    .reduce(toUniqueNames, [[], {}]) // add `(n)` if there are duplicates
    .shift() // the list of viewers is the first item in the pair returned from above
    .forEach(({ content, fileName }) => zip.file(`${fileName}.txt`, content)); // add the viewer as a file in the zip

  viewers.trashedViewers
    .map(appendTags) // add tags to end of content
    .map(addFilename) // generate filename from content
    .reduce(toUniqueNames, [[], {}]) // add `(n)` if there are duplicates
    .shift() // the list of viewers is the first item in the pair returned from above
    .forEach(({ content, fileName }) =>
      zip.file(`trash/${fileName}.txt`, content)
    ); // add the viewer as a file in the zip

  return zip;
};

export default viewerExportToZip;
