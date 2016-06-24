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
	hostname: 'explorecourses.stanford.edu',
	path: "",
	method: 'GET',
	port: 80,
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

	var request = http.request(config.options, function (res){
		res.setEncoding(config.options.encoding);
		res.on('data', function (chunk){
			response += chunk;
		});

		res.on('end', function(){
			callback(null, {status: res.statusCode}, response);
		});
	});

	request.on('error', function(e){
		console.log(e);
		callback({error:e});
	});

	if(typeof params.data != 'undefined' && params.data != null){
		request.write(JSON.stringify(data));
		request.end();
	}else{
		request.end();
	}
}

function setPage (page) {
	config.options.path = "/search?filter-term-Winter=off&filter-catalognumber-CS=on&filter-departmentcode-CS=on&q=CS&view=catalog&academicYear=&filter-term-Summer=off&filter-term-Autumn=off&filter-term-Spring=off&page="+page+"&filter-coursestatus-Active=on&collapse=";
	return config.options.path;
}

function launchScrap () {
	// for(var i=0; i<22; i++){
		setPage(0);
		console.log(config.options.path);

		var coursesTot = [];
		// request({}, function (err, data, res){
			// if(err){
			// 	throw new Error("Error with request: " + err.error.e);
			// }

		for(var k = 1; k < 22; k++){
			var courses = [];

			var f = fs.readFileSync("./stanford_pages/"+k+".html");

			var $ = cheerio.load(f);

			var cc = $(".courseNumber");
			for(var i = 0; i < cc.length; i++){
				courses.push({
					code: $(cc[i]).text().substring(0, $(cc[i]).text().length -1)
				});
			}

			var cn = $(".courseTitle");
			for(var i = 0; i<cn.length; i++){
				courses[i].title = $(cn[i]).text(); 
			}

			var cd = $(".courseDescription");
			for (var i =0; i < cd.length; i++) {
				courses[i].desc = $(cd[i]).text().trim("\t");
			};
		
			coursesTot.extend(courses);

		}


			console.log(coursesTot);
			connection.connect();

		for(var i = 0; i < coursesTot.length; i++){

			var sql = "INSERT INTO `uvs` (UV_university, UV_code, UV_name, UV_description, UV_section) VALUES (1,"+connection.escape(coursesTot[i].code) + "," + connection.escape(coursesTot[i].title)
				+ "," + connection.escape(coursesTot[i].desc) + ", null);";
	
			connection.query(sql, (function(index){
				
				return function (err, res) {
					if(err){
						console.error(err);
						return;
					}

					console.log("Inserted UV ", coursesTot[index].code);
				}
			})(i));
		}


			
		// });
	// }
}

Object.defineProperty(Array.prototype, "extend", {
	enumerable: false,
	value: function(array){
		this.push.apply(this, array);
	}
});

launchScrap();

