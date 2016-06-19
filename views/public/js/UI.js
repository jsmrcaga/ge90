var UI = {};

UI.elements = {};

UI.showLoader = function () {
	UI.elements.loader.style.display = 'block';
};

UI.hideLoader = function () {
	UI.elements.loader.style.display = 'none';
};

UI.populateMenus = function (categories, technologies, callback_categories, callback_technologies) {
	for(var i =0; i < categories.length; i++){
		var menu = document.createElement('li');
		menu.className = "menu-item";
		menu.innerHTML = categories[i];
		menu.addEventListener('click', (function(category){
			return function(){
				callback_categories(category);
			};
		})(categories[i]));
		UI.elements.categories.appendChild(menu);
	}

	for(var i =0; i < technologies.length; i++){
		var menu = document.createElement('li');
		menu.className = "menu-item";
		menu.innerHTML = technologies[i];
		menu.addEventListener('click', (function(category){
			return function(){
				callback_technologies(category);
			};
		})(technologies[i]));
		UI.elements.technologies.appendChild(menu);
	}
};

function populateElements(){
	var elements = document.querySelectorAll("[id]");
	for(var i = 0; i < elements.length; i++){
		UI.elements[elements[i].id] = elements[i];
	} 
}

function init(){
	populateElements();
}

init();