# .empf Generator

A module to generate .empf files compatible with eufyMake Studio.

Programmatically create print files for your eufyMake E1 UV printer!

# Install

```bash
npm install empf-generator
```

# Example

```js
const {EmpfGenerator, InkModeEnum, PrintBedEnum} = require("empf-generator");
const fs = require("fs");

const imagePath = "./image.png";
const outPath = "./output.empf";

(async () => {
  const image = fs.readFileSync(imagePath);
  const generator = new EmpfGenerator({
    printBed: PrintBedEnum.standardFlatbed,
    projectName: "Test Project"
  });
  await generator.addImage(image, 0, 0, 8.5 * 25.4, 11 * 25.4, {
    inkMode: InkModeEnum.white_cmyk,
    whiteLayers: 2,
    cmykLayers: 1
  });
  await generator.export(outPath);
})();
```

# API

<a name="EmpfGenerator"></a>

## EmpfGenerator
Class for generating .empf files

**Kind**: global class  

* [EmpfGenerator](#EmpfGenerator)
    * [new EmpfGenerator([options])](#new_EmpfGenerator_new)
    * [.addImage(imageBuf, x_mm, y_mm, width_mm, height_mm, [options])](#EmpfGenerator+addImage)
    * [.export(outPath)](#EmpfGenerator+export)

<a name="new_EmpfGenerator_new"></a>

### new EmpfGenerator([options])
Creates a new EmpfGenerator.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  | The generator options. |
| [options.printBed] | <code>PrintBedEnum</code> | <code>PrintBedEnum.standardFlatbed</code> | The print bed to use. |
| [options.projectName] | <code>string</code> | <code>&quot;Untitled Design&quot;</code> | The name of the project. |
| [options.canvasBackground] | <code>string</code> | <code>&quot;#ffffff&quot;</code> | The canvas background color, as a hex code. |

<a name="EmpfGenerator+addImage"></a>

### empfGenerator.addImage(imageBuf, x_mm, y_mm, width_mm, height_mm, [options])
Adds an image to the canvas.

**Kind**: instance method of [<code>EmpfGenerator</code>](#EmpfGenerator)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| imageBuf | <code>Buffer</code> |  | The image Buffer to add. |
| x_mm | <code>number</code> |  | The x-coordinate to place the bottom right corner of the image, in mm. |
| y_mm | <code>number</code> |  | The y-coordinate to place the bottom right corner of the image, in mm. |
| width_mm | <code>number</code> |  | The width of the image, in mm. |
| height_mm | <code>number</code> |  | The height of the image, in mm. |
| [options] | <code>Object</code> |  | Additional options. |
| [options.inkMode] | <code>InkModeEnum</code> | <code>InkModeEnum.white_cmyk</code> | The ink mode to use. |
| [options.whiteLayers] | <code>number</code> | <code>1</code> | The number of white layers to use, if applicable for the ink mode. |
| [options.cmykLayers] | <code>number</code> | <code>1</code> | The number of CMYK layers to use, if applicable for the ink mode. |
| [options.glossLayers] | <code>number</code> | <code>1</code> | The number of gloss layers to use, if applicable for the ink mode. |
| [options.angle] | <code>number</code> | <code>0</code> | The rotation angle. |
| [options.flipX] | <code>boolean</code> | <code>false</code> | Whether to flip the image horizontally. |
| [options.flipY] | <code>boolean</code> | <code>false</code> | Whether to flip the image vertically. |
| [options.opacity] | <code>number</code> | <code>1</code> | The opacity of the image. |
| [options.layerName] | <code>string</code> | <code>&quot;Image Layer&quot;</code> | The name of the image layer. |
| [options.lock] | <code>boolean</code> | <code>false</code> | Whether the image is locked. |
| [options.visible] | <code>boolean</code> | <code>true</code> | Whether the image is visible. |
| [options.skipPrint] | <code>boolean</code> | <code>false</code> | Whether to skip printing the image. |

<a name="EmpfGenerator+export"></a>

### empfGenerator.export(outPath)
Exports the canvas to a .empf file.

**Kind**: instance method of [<code>EmpfGenerator</code>](#EmpfGenerator)  

| Param | Type | Description |
| --- | --- | --- |
| outPath | <code>string</code> | The output path to export to. |

<a name="InkModeEnum"></a>

## InkModeEnum : <code>enum</code>
Enum for ink modes.

**Kind**: global enum  
**Read only**: true  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| white_cmyk | <code>number</code> | <code>0</code> | 
| cmyk | <code>number</code> | <code>1</code> | 
| gloss | <code>number</code> | <code>2</code> | 
| white | <code>number</code> | <code>3</code> | 
| cmyk_white | <code>number</code> | <code>4</code> | 
| cmyk_white_cmyk | <code>number</code> | <code>5</code> | 
| cmyk_gloss | <code>number</code> | <code>6</code> | 
| white_cmyk_gloss | <code>number</code> | <code>7</code> | 
| sticker | <code>number</code> | <code>111</code> |

<a name="PrintBedEnum"></a>

## PrintBedEnum : <code>enum</code>
Enum for print beds.

**Kind**: global enum  
**Read only**: true  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| standardFlatbed | <code>string</code> | <code>&quot;standardFlatbed&quot;</code> | 
| miniFlatbed | <code>string</code> | <code>&quot;miniFlatbed&quot;</code> |