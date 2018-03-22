const config = require('../config.json')
const DEFAULT_HOST = config.host

const preGenerate = async (page) => {
  /**
   * Place here any code to run prior to tests running 
   * e.g auth -> place token into localStorage
   */

	
	// Access the host and set an access token
	// e.g
	//
	// await page.goto(DEFAULT_HOST);
	// await page.evaluate((t) => {
	// 	let accessJSON = JSON.stringify(t);
	// 	localStorage.setItem("access", accessJSON);
	// 	return accessJSON
	// }, token);
}

module.exports = preGenerate