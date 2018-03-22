const { promisify } = require('util');
const fs = require('fs')
const fse = require('fs-extra')
const compareImages = require('resemblejs/compareImages');
const config = require('../config.json');

const readfile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)
const writefile = promisify(fs.writeFile)

const DIR_ORIGINAL = process.argv[2]
const DIR_UPDATED = process.argv[3]
const DIR_DIFF = config.diff_dir

const getDiff = async (src, dst, out) => {
    const options = {
        output: {
            errorColor: {
                red: 255,
                green: 0,
                blue: 255
            },
            errorType: 'movement',
            transparency: 0.2,
            largeImageThreshold: 1200,
            useCrossOrigin: false,
            outputDiff: true
        },
        scaleToSameSize: false,
        ignore: ['nothing', 'less', 'antialiasing', 'colors', 'alpha'],
    };

    // The parameters can be Node Buffers
    // data is the same as usual with an additional getBuffer() function
    const data = await compareImages(
        await readfile(src),
        await readfile(dst),
        options
    );

    await writefile(out, data.getBuffer());

    return data
}

const compare = async () => {
    const items = await readdir(`./${DIR_ORIGINAL}`)

    await fse.emptyDir(`./${DIR_DIFF}`)

    await Promise.all(items.map(item => {
        return getDiff(
            `./${DIR_ORIGINAL}/${item}`,
            `./${DIR_UPDATED}/${item}`,
            `./${DIR_DIFF}/diff-${item}`,
          ).then((info) => {
            console.info(`Generated diff === ${item} ===`)
            console.info(`Mismatch is ${info.misMatchPercentage}`)
            console.info(`\n`)
          })
    }))
}

compare()