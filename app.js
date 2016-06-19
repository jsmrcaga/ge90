var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors());

app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mustache = require('mustache-express');
app.engine('html', mustache());
app.set('view engine', 'html');

app.set('views', __dirname+"/views");
app.use(express.static(__dirname+"/views/public"));

var maki = require('maki-sushi');
maki.config.setEndpoint('neo4j.jocolina.tk', '');

app.get("/", function(req, res, err){
	res.render("index");
});

app.get("/uvs", function (req, res, err){

	var universities = [];

	maki.query.single('MATCH (n:UNIVERSITY) RETURN n,ID(n)', function(st, unis){
		console.log("Querying", 'MATCH (n)<-[r]-(o) RETURN n,ID(n)');
		try{
			unis = JSON.parse(unis);
			if(!unis.results[0].data[0].row[1]){
				throw new Error('Error with resposne');
			}
		} catch(e) {
			res.json({error:{message:"An error occurred", response:unis}});
			return;
		}

		var rows = unis.results[0].data;
		for(var i = 0; i < rows.length; i++){
			var id = rows[i].row[1];

			// put universities in array
			universities.push({
				name: rows[i].row[0].name,
				id: id,
				uvs: []
			});
		}

		maki.query.single('MATCH (n:UNIVERSITY)<-[r]-(o) RETURN o,ID(o),ID(n)', function(st, uvs){
			console.log("Querying", 'MATCH (n)<-[r]-(o) RETURN o,ID(o),ID(n)');
			try{
				uvs = JSON.parse(uvs);
			} catch(e) {
				res.json({error:{message:"An error occurred", response:uvs}});
			}

			var rows = uvs.results[0].data;
			console.log("\tGot:", rows);
			for(var i = 0;i < rows.length; i++){
				var uv = rows[i].row[0];
				uv.id = rows[i].row[1];
				uv.uni_id = rows[i].row[2]
				addUVtoUNI(uv, universities);
			}

			res.json(universities);

		});
	});
});

app.listen(1234, function(){
	console.log("Server listening!");
});

function addUVtoUNI(uv, universities) {
	for(var i=0; i < universities.length; i++){
		if(universities[i].id === uv.uni_id){
			universities[i].uvs.push(uv);
		}
	}
}