var http = require('http');
var https = require('https');

var fs = require('fs');

var cheerio = require('cheerio');

var mysql = require('mysql');
var connection = mysql.createConnection({
	host:'localhost',
	user: 'root',
	password:"phantomoftheopera",
	database:'ge90'
});


var config = {};

config.options = {
	http: "http://",
	hostname: 'registrar.princeton.edu',
	path: "/course-offerings/search_results.xml?term=1164&coursetitle=&instructor=&distr_area=&level=&cat_number=&subject=COS&sort=SYN_PS_PU_ROXEN_SOC_VW.SUBJECT%2C+SYN_PS_PU_ROXEN_SOC_VW.CATALOG_NBR%2CSYN_PS_PU_ROXEN_SOC_VW.CLASS_SECTION%2CSYN_PS_PU_ROXEN_SOC_VW.CLASS_MTG_NBR&submit=Search",
	method: 'GET',
	// port: 80,
	encoding : 'utf8',
	headers:{
		// "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		// "Accept-Encoding" : "zip, deflate, sdch",
		// "Accept-Language" : "n-US,en;q=0.8,es;q=0.6,fr;q=0.4",
		// "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
		// "Cookie" : "suio-u=7fd60256-ac37-45d6-b78e-5f788bc16a79; _ga=GA1.2.1896692643.1453303165; JSESSIONID=1sb75uck60phxlv3qasfm38jj; __utmt=1; __utma=140917606.1997102835.1453284612.1453284612.1453303182.2; __utmb=140917606.14.10.1453303182; __utmc=140917606; __utmz=140917606.1453284612.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=http%3A%2F%2Fexplorecourses.stanford.edu%2F; suio-o=155"
	}

};


function request (params, callback) {
	//check params etc...
	var response = "";

	var request = https.request(config.options, function (res){
		res.setEncoding(config.options.encoding);
		res.on('data', function (chunk){
			response += chunk;
		});

		res.on('end', function(){
			callback(null, {status: res.statusCode}, response);
		});
	});

	request.on('error', function(e){
		console.log("Error on request");
		console.error(e);
		callback({error:e});
	});

	if(typeof params.data != 'undefined' && params.data != null){
		request.write(JSON.stringify(data));
		request.end();
	}else{
		request.end();
	}
}


var uvs = [];
function launchScrap () {
	


	// var f = fs.readFileSync("./calsta/calsta.html");
	// var $ = cheerio.load(f);



	connection.release();
	// request({}, function (err, data, res){
	// 	if(err){
	// 		console.log("Error with request 1");
	// 		console.error(err);
	// 		return;
	// 	}

	// });

}



Object.defineProperty(Array.prototype, "extend", {
	enumerable: false,
	value: function(array){
		this.push.apply(this, array);
	}
});

launchScrap();

