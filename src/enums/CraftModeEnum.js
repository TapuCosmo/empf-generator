"use strict";

// Corresponds to subPrintType in Metadata/project_info.json canvas print_param.

/**
 * Enum for eufyMake craft modes.
 * @readonly
 * @enum {number}
 */
const CraftModeEnum = {
  flat: -1,
  reliefTexture: 0,
  texture: 1,
  textureRelief: 2,
  brushStrokes: 3,
  poster: 4,
  sticker: 5,
  gild: 6,
  raised: 7
};

module.exports = CraftModeEnum;
