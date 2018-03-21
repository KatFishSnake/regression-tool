const { promisify } = require('util');
const puppeteer = require('puppeteer');
const gBranch = require('git-branch')
const fse = require('fs-extra')
const fs = require('fs')
const compareImages = require('resemblejs/compareImages');

const readfile = promisify(fs.readFile)
const writefile = promisify(fs.writeFile)

const HOST = 'https://www.nytimes.com'
const TEMP_DIR = 'some-git-branch'

const screenPage = async (dirName, page, key, ext = '') => {
	console.info(`Screening ${key}`)
	await page.goto(`${HOST}${ext}`);
	await page.screenshot({
		type: 'png',
		path: `./${dirName}/${key}.png`,
		fullPage: true
	});
}

const generate = async () => {
	const dirName = await gBranch()  
		.then(name => {
			console.info('Branch:', name)
			return TEMP_DIR
		})

	await fse.emptyDir(`./${dirName}`)

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await screenPage(dirName, page, 'technology', '/section/technology')
	await screenPage(dirName, page, 'arts', '/section/arts')

	await browser.close();
}

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

// resemblejs version

generate()
	.then(() => {
		getDiff(
			`./${TEMP_DIR}/technology.png`,
			`./${TEMP_DIR}/arts.png`,
			`./${TEMP_DIR}/diff.png`
		).then((info) => {
			console.log(info)
		})
	})


// pixelmatch version

// const readdir = promisify(fs.readdir)
// const PNG = require('pngjs').PNG
// const pixelmatch = require('pixelmatch')
// .then(() => {
// 	readdir(`./${TEMP_DIR}`).then(items => {
// 		let filesRead = 0;
// 		const doneReading = () => {
// 		    if (++filesRead < 2) return;
// 		    const diff = new PNG({width: img1.width, height: img1.height});

// 		    pixelmatch(
// 		    	img1.data, 
// 		    	img2.data, 
// 		    	diff.data, 
// 		    	img1.width, 
// 		    	img1.height, 
// 		    	{threshold: 0.1}
// 	    	)

// 		    diff
// 		    	.pack()
// 		    	.pipe(fs.createWriteStream(`./${TEMP_DIR}/diff.png`));
// 		}

// 		const img1 = fs.createReadStream(`./${TEMP_DIR}/${items[1]}`)
// 			.pipe(new PNG())
// 			.on('parsed', doneReading)
//     const img2 = fs.createReadStream(`./${TEMP_DIR}/${items[0]}`)
//     	.pipe(new PNG())
//     	.on('parsed', doneReading)
// 	})
// })