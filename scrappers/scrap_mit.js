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
	hostname: 'student.mit.edu',
	path: "/catalog/m6a.html",
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


function launchScrap () {
	request({}, function (err, data, res){
		var titlesTot = [];
		if(err){
			console.error(err);
			return;
		}


		var $ = cheerio.load(res);

		var table = $('table')[0];
		table = $(table).children()[2]; //3d tr
		table = $(table).children()[0]; //1st td
		table = $(table).children()[3]; //table
		table = $(table).children()[0]; //tr table
		table = $(table).children()[0]; //td table FUCK THIS SHIT

		var titles = $("h3", $(table));
		for(var i = 0; i< titles.length; i++){
			var text = $(titles[i]).text();
			var newText = "";
			
			var code = text.split(" ")[0];
			if(parseInt(code.split(".")[0]) == NaN){
				continue;
			}

			for(var j = 1; j < text.split(" ").length; j++){
				newText += text.split(" ")[j] + " "; 
			}
			console.log("Code: ", code,"Title: ", newText);
			titlesTot.push({
				title: $(titles[i]).text(),
				code: code
			});

		}

		connection.connect();
		for(var i = 0; i < titlesTot.length; i++){
			var sql = "INSERT INTO `uvs` (UV_university, UV_code, UV_name, UV_description, UV_section) VALUES (2," + connection.escape(titlesTot[i].code) + "," 
				+ connection.escape(titlesTot[i].title) + ",null,null);";

			connection.query(sql, (function(index){
				return function(err, res){
					if(err){
						console.error(err);
						return;
					}

					console.log("Inserted into base: ", titlesTot[index].code);
				}
			})(i)); 
		}

	});

}

Object.defineProperty(Array.prototype, "extend", {
	enumerable: false,
	value: function(array){
		this.push.apply(this, array);
	}
});

launchScrap();

