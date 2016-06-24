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
	
	request({}, function (err, data, res){
		if(err){
			console.log("Error with request 1");
			console.error(err);
			return;
		}


		var $ = cheerio.load(res);

		var table = $('table')[0];
		var tr_coll = $(table).children();

		var total_length = tr_coll.length;

		for(var i = 1; i < tr_coll.length; i++){
			var tds = $(tr_coll[i]).children();
			var ii = uvs.push({
				title: $(tds[2]).text().trim("\n"),
				code: $($(tds[1]).children()[0]).text().trim("\n")
			});

			// we set the path of the description
			config.options.path = "/course-offerings/" + $($(tds[1]).children()[0]).attr('href');
			request({}, (function (index){ 
				return function (err, data, res){
					// ERROR: recovering 404

					if(err){
						console.log("Error with request 2");
						console.error(err);
						return;
					}

					var $$ = cheerio.load(res);
					var desc = $$("#descr").text().trim("\n");

					uvs[index].desc = desc;

					total_length--;
					console.log("Total Length:", total_length);
					if(total_length == 1) sendToSQL();

					return;
				};
			})(ii - 1));
		}


	});

}

function sendToSQL() {
	connection.connect();

	for(var i = 0; i < uvs.length; i++){
		var sql = "INSERT INTO `uvs` (UV_university, UV_code, UV_name, UV_description, UV_section) VALUES (5, " + connection.escape(uvs[i].code) + "," + connection.escape(uvs[i].title) 
			+ "," + connection.escape(uvs[i].desc) + ", null);";
		connection.query(sql, (function(index){ 
			return function (err, res){
				if(err){
					console.log("Error with mysql");
					console.error(err);
					return;
				}

				console.log("Inserted in base:", uvs[index].code);
			}
		})(i));
	}
	return;
}


Object.defineProperty(Array.prototype, "extend", {
	enumerable: false,
	value: function(array){
		this.push.apply(this, array);
	}
});

launchScrap();

