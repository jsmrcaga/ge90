var exec = {};

var config = {};
config.categories = [
	'Networking',
	'Graphs',
	'CS',
	'Optimization',
	'Machine Learning',
	'Cryptology',
	'Embedded Systems',
	'Operating Systems',
	'Databases',
	'Security',
	'Research',
	'Game Design',
	'Natural Language Processing',
	'Artificial Intelligence',
	'Statistics',
	'Neural Algorithms',
	'Distributed Applications',
	'Computer Architecture',
	'Object Oriented Programming'
];

config.technologies = [
	'c',
	'javascript',
	'python',
	'matlab',
	'java',
	'php',
];

function init() {
	exec.vis_container = document.getElementById('container');
	getNodes();

	document.getElementById('no_filter').addEventListener('click', function(){
		UI.showLoader();
		var nodes = exec.nodes.get();
		for(var i=0; i < nodes.length; i++){
			if(nodes[i].type == 'UNIVERSITY'){
				nodes[i].color = '#AF5054';
			} else {
				nodes[i].color = '#247BA0';
			}
		}
		UI.hideLoader();
	});
}

function launchGraph(data){
	var options = {
		layout:{
			improvedLayout: false
		},
		physics: {
			solver: 'forceAtlas2Based',
		}
	};

	exec.nodes = new vis.DataSet([]);
	exec.edges = new vis.DataSet([]);

	for(var i=0; i < data.length; i++){
		// universities
		exec.nodes.add([
		{
			name: data[i].name,
			id: data[i].id,
			color: '#AF5054',
			title: data[i].name.slice(0, 17) + "...",
			type: 'UNIVERSITY'
		}]);

		for(var j =0; j < data[i].uvs.length; j++){
			var uv = data[i].uvs[j];
			exec.nodes.add([
			{
				code: uv.code,
				name: uv.name,
				description: uv.description, 
				section: uv.section,
				id: uv.id,
				tech: uv.tech || "",
				type: 'CLASS',
				color: '#247BA0'
			}]);

			exec.edges.add([
			{
				from:  uv.id, 
				to:  data[i].id
			}]);
		}
	}

	exec.graph = new vis.Network(exec.vis_container, {
		nodes: exec.nodes,
		edges: exec.edges
	}, options);

	setTimeout(function(){
		exec.graph.stopSimulation();
		UI.populateMenus(config.categories, config.technologies, 
			function(category){
				setFilter('section', category);
			}, function(technology){
				setFilter('tech', technology);
			});
		UI.hideLoader();
	}, 1000 * 30); //30 seconds

	exec.graph.on('selectNode', function(event){
		console.log("Event:", event);
		var node = event.nodes[0];
		node = exec.nodes.get({
			filter: function(item){
				return item.id == node;
			}
		});

		console.log("Clicked on node:", node[0]);
		displayProperties(node[0]);
	});
}

function getNodes(){
	UI.showLoader();
	Workshop.ajax({
		url:'http://' + window.location.hostname + '/uvs',
		method: 'GET'
	}, function(err, res, xhr){
		if(err){
			throw new Error(err);
		}

		launchGraph(JSON.parse(res));
	});

}

function displayProperties(prop){
	console.log("Showing properties for:", prop);
	var container = document.getElementById('propertiesContainer');
	container.innerHTML = "";

	for(var k in prop){
		if(k === 'color' || k === 'title'){
			continue;
		}
		var lit = document.createElement('li');
		lit.className = 'menu-title';
		lit.innerHTML = k;
		container.appendChild(lit);

		var propli = document.createElement('li');
		propli.className = 'property';
		propli.innerHTML = prop[k];
		container.appendChild(propli);
	}
}

function setFilter(property, filter){
	UI.showLoader();
	var nodes = exec.nodes.get({
		filter: function(item){
			return item[property] != filter;
		}
	});

	for(var i = 0; i<nodes.length; i++){
		if(nodes[i].type == 'UNIVERSITY'){
			continue;
		}
		exec.nodes.update({
			id: nodes[i].id, 
			color: '#ebebeb',
			size: 50
		});
	}

	setTimeout(function(){
		exec.graph.stopSimulation();
		UI.hideLoader();
	}, 15 * 1000);
}

init();