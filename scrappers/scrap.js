var http = require('http');
var https = require('https');

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
	hostname: 'www.shanghairanking.com',
	path: '/fr/SubjectCS2015.html',
	method: 'GET',
	port: 80,
	encoding : 'utf8',
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
		if(err){
			throw new Error("Error with request: " + err.error.e);
		}

		var $ = cheerio.load(res);
		
		/*$("tr", "#UniversityRanking").children().each(function(i, el){
			console.log($(this).text());
		});*/

		var tr = $("#UniversityRanking").children();
		
		connection.connect();

		for(var i = 1; i<= 100; i++){
			var td = $(tr[i]).children();
			var reg = $(td[2]).html().match(/flag\/(.*).png/);
			// console.log("Rank: "+ $(td[0]).text() + "\nName:" + $(td[1]).text() + "\nFlag" + reg[1] +"\n");
			var sql = "INSERT INTO `university` (U_id, U_country, U_name) VALUES (null, " + connection.escape(reg[1]) + "," + connection.escape($(td[1]).text())+");";  
			connection.query(sql, (function(td){
				return function(err, rows, fields){
					console.log("Inserted ", $(td[1]).text());
				}
				
			})(td));
		}
	});
}

launchScrap();