"use strict";

/*
.empf Generator
Copyright (C) 2025 Vietbao Tran

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const crypto = require("crypto");
const {fileTypeFromBuffer} = require("file-type");
const fs = require("fs").promises;
const {imageSize: getImageSize} = require("image-size");
const JSZip = require("jszip");
const {v4: uuidv4} = require("uuid");

const CanvasObjectEnum = require("../enums/CanvasObjectEnum.js");
const InkModeEnum = require("../enums/InkModeEnum.js");
const PrintBedConstants = require("../constants/PrintBedConstants.js");
const PrintBedEnum = require("../enums/PrintBedEnum.js");

const e1UnitsToMM = require("../util/e1UnitsToMM.js");
const mmToE1Units = require("../util/mmToE1Units.js");

// For ease of development, all units are kept in mm until export, when they are converted to E1 units.

/**
 * Class for generating .empf files
 */
class EmpfGenerator {
  /**
   * Creates a new EmpfGenerator.
   * @constructor
   * @param {Object} [options] - The generator options.
   * @param {PrintBedEnum} [options.printBed=PrintBedEnum.standardFlatbed] - The print bed to use.
   * @param {string} [options.projectName="Untitled Design"] - The name of the project.
   */
  constructor({printBed = PrintBedEnum.standardFlatbed, projectName = "Untitled Design"}) {
    this._printBed = printBed;
    this._projectName = projectName;

    this._version = "5.3.0";
    this._canvasObjects = [];
    this._canvasID = crypto.randomBytes(16).toString("hex");
    this._projectID = crypto.randomBytes(16).toString("hex");
  }

  /**
   * Adds an image to the canvas.
   * @async
   * @param {Buffer} imageBuf - The image Buffer to add.
   * @param {number} x_mm - The x-coordinate to place the bottom right corner of the image, in mm.
   * @param {number} y_mm - The y-coordinate to place the bottom right corner of the image, in mm.
   * @param {number} width_mm - The width of the image, in mm.
   * @param {number} height_mm - The height of the image, in mm.
   * @param {Object} [options] - Additional options.
   * @param {InkModeEnum} [options.inkMode=InkModeEnum.white_cmyk] - The ink mode to use.
   * @param {number} [options.whiteLayers=1] - The number of white layers to use, if applicable for the ink mode.
   * @param {number} [options.cmykLayers=1] - The number of CMYK layers to use, if applicable for the ink mode.
   * @param {number} [options.glossLayers=1] - The number of gloss layers to use, if applicable for the ink mode.
   * @param {number} [options.angle=0] - The rotation angle.
   * @param {boolean} [options.flipX=false] - Whether to flip the image horizontally.
   * @param {boolean} [options.flipY=false] - Whether to flip the image vertically.
   * @param {number} [options.opacity=1] - The opacity of the image.
   */
  async addImage(imageBuf, x_mm, y_mm, width_mm, height_mm, options = {}) {
    if (!(imageBuf instanceof Buffer)) {
      throw new TypeError("Image must be a Buffer");
    }
    const {mime} = await fileTypeFromBuffer(imageBuf);
    if (![
      "image/png",
      "image/jpeg",
      "image/webp"
    ].includes(mime)) {
      throw new TypeError("Unsupported image MIME type");
    }
    options.inkMode ??= InkModeEnum.white_cmyk;
    if ([
      InkModeEnum.white_cmyk,
      InkModeEnum.white,
      InkModeEnum.cmyk_white,
      InkModeEnum.cmyk_white_cmyk,
      InkModeEnum.white_cmyk_gloss
    ].includes(options.inkMode)) {
      options.whiteLayers ??= 1;
    }
    if ([
      InkModeEnum.white_cmyk,
      InkModeEnum.cmyk,
      InkModeEnum.cmyk_white,
      InkModeEnum.cmyk_white_cmyk,
      InkModeEnum.cmyk_gloss,
      InkModeEnum.white_cmyk_gloss
    ].includes(options.inkMode)) {
      options.cmykLayers ??= 1;
    }
    if ([
      InkModeEnum.gloss,
      InkModeEnum.cmyk_gloss,
      InkModeEnum.white_cmyk_gloss
    ].includes(options.inkMode)) {
      options.glossLayers ??= 1;
    }
    options.angle ??= 0;
    options.flipX ??= false;
    options.flipY ??= false;
    options.opacity ??= 1;

    this._canvasObjects.push({
      type: CanvasObjectEnum.image,
      image: imageBuf,
      mimeType: mime,
      x_mm,
      y_mm,
      width_mm,
      height_mm,
      ...options
    });
  }

  /**
   * Exports the canvas to a .empf file.
   * @param {string} outPath - The output path to export to.
   */
  async export(outPath) {
    const zip = new JSZip();
    zip.file("Asset/font/font_mapping.json", "{}");
    zip.file(`Asset/project_file/canvas_${this._canvasID}.json`, JSON.stringify(this._generateCanvasJSON()));
    zip.file("Metadata/project_info.json", JSON.stringify(this._generateProjectInfoJSON()));

    const zipBuf = await zip.generateAsync({type: "nodebuffer"});
    await fs.writeFile(outPath, zipBuf);
  }

  get _printBedData() {
    return PrintBedConstants[this._printBed];
  }

  _convertCanvasObject(canvasObject) {
    switch (canvasObject.type) {
      case CanvasObjectEnum.image: {
        const imageSize = getImageSize(canvasObject.image);
        const convertedData = {
          type: CanvasObjectEnum.image,
          version: this._version,
          id: uuidv4(),
          src: `data:${canvasObject.mimeType};base64,${canvasObject.image.toString("base64")}`,
          originX: "left",
          originY: "top",
          // Not sure why, but seems like images require an extra unit shift compared to rects?
          left: this._printBedData.zeroPointInternalCoordinates.x - mmToE1Units(canvasObject.x_mm + canvasObject.width_mm) + 1,
          top: this._printBedData.zeroPointInternalCoordinates.y - mmToE1Units(canvasObject.y_mm + canvasObject.height_mm) + 1,
          width: imageSize.width,
          height: imageSize.height,
          pixelWidth: imageSize.width,
          pixelHeight: imageSize.height,
          scaleX: mmToE1Units(canvasObject.width_mm / imageSize.width),
          scaleY: mmToE1Units(canvasObject.height_mm / imageSize.height),
          subPrintModel: canvasObject.inkMode,
          angle: canvasObject.angle,
          flipX: canvasObject.flipX,
          flipY: canvasObject.flipY,
          opacity: canvasObject.opacity,
          // All of these properties are saved by eufyMake Studio, so adding them here for consistency
          fill: "rgb(0,0,0)",
          stroke: null,
          strokeWidth: 0,
          strokeDashArray: null,
          strokeLineCap: "butt",
          strokeDashOffset: 0,
          strokeLineJoin: "miter",
          strokeUniform: false,
          strokeMiterLimit: 4,
          shadow: null,
          visible: true,
          backgroundColor: "",
          fillRule: "nonzero",
          paintFirst: "fill",
          globalCompositeOperation: "source-over",
          skewX: 0,
          skewY: 0,
          cropX: 0,
          cropY: 0,
          selectable: true,
          hasControls: true,
          evented: true,
          _layerNameCus: "Image Layer",
          _customType: "customImage",
          crossOrigin: null,
          filters: []
        };
        if (typeof canvasObject.whiteLayers === "number") {
          convertedData.whiteLayerNum = canvasObject.whiteLayers;
        }
        if (typeof canvasObject.cmykLayers === "number") {
          convertedData.colorLayerNum = canvasObject.cmykLayers;
        }
        if (typeof canvasObject.glossLayers === "number") {
          convertedData.varnishLayerNum = canvasObject.glossLayers;
        }
        return convertedData;
      }
      default: {
        throw new TypeError(`Unsupported canvas object type: ${canvasObject.type}`);
      }
    }
  }

  _generateCanvasJSON() {
    return {
      version: this._version,
      objects: this._canvasObjects.map(co => this._convertCanvasObject(co)),
      id: "canvas",
      selection: true
    };
  }

  _generateProjectInfoJSON() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return {
      canvases: [{
        base_map: this._printBedData.e1Data.base_map,
        base_map_width: this._printBedData.e1Data.base_map_width,
        base_map_height: this._printBedData.e1Data.base_map_height,
        canvas_id: this._canvasID,
        canvas_name: this._projectName,
        category: this._printBedData.e1Data.category,
        sub_category: this._printBedData.e1Data.sub_category,
        is_standard_product: this._printBedData.e1Data.is_standard_product,
        create_time: currentTimestamp,
        update_time: currentTimestamp,
        extra: '{"cutData":"","appCavas":"","pcCavas":"","canvasShape":null,"bleedingLine":null}',
        material_list: [],
        model_link: "",
        project_id: this._projectID,
        print_param: `{"printModel":2,"imgQuality":300,"printLayerData":[],"format_size_w":${Math.round(e1UnitsToMM(this._printBedData.e1Data.base_map_width))},"format_size_h":${Math.round(e1UnitsToMM(this._printBedData.e1Data.base_map_height))},"format_size_w_non":${Math.round(e1UnitsToMM(this._printBedData.e1Data.base_map_width))},"format_size_h_non":${Math.round(e1UnitsToMM(this._printBedData.e1Data.base_map_height))},"cavas_map":"${this._printBedData.e1Data.base_map}","shape_cavas_map":""}`,
        scenes: "[]"
      }],
      project_info: {
        category: this._printBedData.e1Data.category,
        sub_category: this._printBedData.e1Data.sub_category,
        is_standard_product: this._printBedData.e1Data.is_standard_product,
        project_name: this._projectName,
        dir_id: 261, // not sure what this does or if it matters
        project_id: this._projectID,
        create_time: currentTimestamp,
        update_time: currentTimestamp,
        sort_order: [this._canvasID],
        is_edited: 1,
        is_published: 0,
        works_id: "",
        parents_works_id: "",
        root_works_id: "",
        works_status: 0,
        project_desc: "",
        project_type: 1,
        tag_type: 0,
        thumb_file: null // this is inconsistent with eufyMake Studio, hopefully it doesn't break things
      },
      canvasesIndex: 0,
      gildException: false,
      showGildException: false,
      stickerException: false,
      showStickerException: false
    };
  }
}

module.exports = EmpfGenerator;