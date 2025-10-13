"use strict";

// Corresponds to subPrintModel in Asset/project_file/canvas_*.json

/**
 * Enum for ink modes.
 * @readonly
 * @enum {number}
 */
const InkModeEnum = {
  white_cmyk: 0,
  cmyk: 1,
  gloss: 2,
  white: 3,
  cmyk_white: 4,
  cmyk_white_cmyk: 5,
  cmyk_gloss: 6,
  white_cmyk_gloss: 7,
  sticker: 111
};

module.exports = InkModeEnum;