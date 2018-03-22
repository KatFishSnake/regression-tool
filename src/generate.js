const { promisify } = require('util');
const puppeteer = require('puppeteer');
const fse = require('fs-extra')

const config = require('../config.json')
const preGenerate = require('./pre-generate.js')

const DIR = process.argv[2]
const DEFAULT_HOST = config.host

const screenPage = async (dirName, page, key, ext = '') => {
	await page.goto(`${DEFAULT_HOST}${ext}`);
	await page.waitFor(1000)
	await page.screenshot({
		type: 'png',
		path: `./${dirName}/${key}.png`,
		fullPage: true,
		waitUntil: 'networkidle'
	}).then(() => {
		console.info(`Generated screenshot for ${key}`)
	})
}

const generate = async () => {
	const dirName = DIR

	await fse.emptyDir(`./${dirName}`)

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 2})

	// Optional
	await preGenerate(page)

	await screenPage(dirName, page, 'root')
	await screenPage(dirName, page, 'health', '/section/health')
	await screenPage(dirName, page, 'sports', '/section/sports')
	await screenPage(dirName, page, 'arts', '/section/arts')

	await browser.close();
}

generate()