(function () {
	var resource_queue = {
		svg : {}
	};


	var resources = {
		svg: {}
	};

	function LoadResources (resource_arr, done_cb) {
		function do_check() {
			for (var type in resources) {
				for (var path in resources[type]) {
					if (resource_queue[type][path]) {
						var q = resource_queue[type][path];
						delete resource_queue[type][path];
						for (var i in q) { 
							(function (type, path, cb) {
								GetResource(type, path, cb); 
							})(type, path, q[i]);
						}
						if (!resources[type][path]) return;
					}
				}

				('function' === typeof(done_cb)) && done_cb();
			}
		}

		for (var i in resource_arr) {
			(function (i) {
				var res = resource_arr[i];

				switch (res.type) {
					case 'svg': {
						(function () {
							var root = res.root;
							fabric.setWorkingDirectory(root);

							for (var j in res.items) { resources.svg[root+'/'+res.items[j]] = false; }

							fabric.loadResources({svg:res.items}, function (loaded) {
								for (var j in loaded) {
									resources.svg[root+'/'+j] = loaded[j];
								}

								do_check();
							})
						})();
						break;
					}
				}
			})(i);
		}
	}

	var getters = {
		'svg': function (path, done_cb) {
			if ('function' !== typeof(done_cb)) return; /// only way to get your resource is via cb ...
			if (!resources.svg[path]) return done_cb(undefined);
			resources.svg[path].clone (done_cb);
		}
	}

	function GetResource (type, path, done_cb) {
		if ('function' !== typeof(getters[type])) return undefined;
		if ('undefined' === typeof(resources[type][path])) return undefined;

		if (!resources[type][path]) { ///loading, please wait ....
			if (!resource_queue[type][path]) resource_queue[type][path] = [];
			resource_queue[type][path].push (done_cb);
			console.log(path, 'pushed to queue');
			return;
		}



		return getters[type](path, done_cb);
	}

	function ResourceExists (type, path) {
		return (resources[type] && resources[type][path] && true);
	}

	function LoadMultuple (type, paths, cb) {
		var r = resources[type];
		var done = {};
		function worker(index) {
			if (index >= paths.length) {
				cb(done);
				return;
			}

			GetResource(type, paths[index], function (got) {
				done[paths[index]] = got;
				console.log('will advance');
				worker(index+1);
			});
		}

		worker(0);
	}

	this.LoadResources = LoadResources;
	this.GetResource = GetResource;
	this.ResourceExists = ResourceExists;
	this.LoadMultuple = LoadMultuple;
})(this);



function Scene (config, canvas) {
	if (!arguments.length) return;
	if (!config.resourceroot) throw "No resourceroot given";
	fabric.util.object.extend(this, fabric.Observable);
	var self = this;

	this.config = config;
	this.canvas = canvas;

	this.element = function (path) {
		return fabric_helpers.find_path(this.loaded, path);
	}

	var resources = this.graphicResources();

	var exists = [];
	var dont_exist = [];

	for (var i in resources.resources.svg) {
		var it = resources.resources.svg[i];
		var a = (ResourceExists('svg', resources.root+'/'+it)) ? exists : dont_exist;
		a.push (it);
	}

	///TODO:
	if (dont_exist.length) {
	}


	LoadMultuple ('svg', [resources.resources.root+'/room'], function (result) {
		self.loaded = {};
		self.loaded.room = result[resources.resources.root+'/room'];
		Create_GUI_Components(self.loaded,canvas, config.components,
			function (elements) {
				self.graphic_components_ready(elements);
				self.canvas.renderAll();
			}
		);

	});
	return;









	if (!resources.reuse || !Scene.GraphicResources)  {
		fabric.setWorkingDirectory(resources.resources.root);
		fabric.loadResources(resources.resources, function (loaded) {
			console.log('Fabric Resources loaded');
			Scene.GraphicResources = loaded;
			///hardcode room ...
			loaded.room.clone (function (inst) {
				self.loaded = loaded;

				Create_GUI_Components(self.loaded,canvas, config.components,
					function (elements) {
						self.graphic_components_ready(elements);
						self.canvas.renderAll();
					}
					);

				});
		});
	}else{
		Scene.GraphicResources.room.clone(function (loaded) {
			self.loaded = {};
			self.loaded.room = loaded;

			Create_GUI_Components(self.loaded,canvas, config.components,
				function (elements) {
					self.graphic_components_ready(elements);
					self.canvas.renderAll();
				}
			);
		});
	}
}

Scene.prototype.graphic_components_ready = function (elements) {
	///Simple scene expects only graphic_components ....
	this.ready();
}

Scene.prototype.render = function () { this.canvas && this.canvas.renderAll(); }
Scene.prototype.ready = function () {
	throw "Ready not implemented";
}

Scene.GraphicResources = null;


function DCP_Aware_Scene (config, canvas) {
	if (!arguments.length) return;
	if (!config.data) throw "No data for DCP_Aware_Scene";

	this.required_data_fields = config.require_data_fields;

	this.data = config.data;
	this.dataListeners = {
		txnEndListener : config.data.txnEnds.attach (function () { 
			canvas.renderAll(); 
		}),
	};
	Scene.prototype.constructor.call(this, config, canvas);
}

DCP_Aware_Scene.prototype = new Scene();
DCP_Aware_Scene.prototype.constructor = DCP_Aware_Scene;

DCP_Aware_Scene.prototype.hookToDCP = function () {
}

DCP_Aware_Scene.prototype.graphic_components_ready = function (elements) {
	console.log('Graphics components ready');
	//OK, start listening for fields
	this.hookToDCP();
}
