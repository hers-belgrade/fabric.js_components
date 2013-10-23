function Scene (config, canvas) {
	if (!arguments.length) return;
	if (!config.resources) throw "No resources given";

	fabric.util.object.extend(this, fabric.Observable);
	fabric.setWorkingDirectory(config.resources.root);
	var self = this;

	fabric.loadResources(config.resources, function (loaded) {
		console.log('Fabric Resources loaded');
		self.loaded = loaded;

		Create_GUI_Components(self.loaded,canvas, config.components,
			function (elements) {
				self.graphic_components_ready(elements);
				self.canvas.renderAll();
			}
		);
	});
	this.config = config;
	this.canvas = canvas;
	this.element = function (path) {
		return fabric_helpers.find_path(this.loaded, path);
	}
}

Scene.prototype.render = function () { this.canvas.renderAll(); }
Scene.prototype.ready = function () {
	throw "Ready not implemented";
}

function DCP_Aware_Scene (config, canvas) {
	if (!arguments.length) return;
	if (!config.data) throw "No data for DCP_Aware_Scene";

	this.required_data_fields = config.require_data_fields;

	this.data = config.data;
	this.dataListeners = {
		txnEndListener : config.data.txnEnds.attach (function () { canvas.renderAll(); }),
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

/*
DCP_Aware_Scene.prototype.graphic_components_ready = function (resources) {
	console.log('DCP_Aware_Scene', this, 'got graphic_components, should go for some data');
	return;
	var self = this;
	var fl = [];
	for (var i in this.required_data_fields) {
		var fd = this.required_data_fields[i];
		var field_name = fd.name;
		var what = fd.wait_for;

		fl.push ({
			id: field_name,
			f: (function (self, fn, w) {
				return function (done, error) {
					var c = {};
					//once you get what you want, say done ....
					var l = null;
					var got_it = false;
					c[w] = function (val) { 
						done(val); 
						got_it = true;
						l && l.release();
					}

					///forget about hook ....
					if (got_it) l.release();
				}
			})(this, field_name, what)
		});
	}

	var rr = new AsyncWaiterPool('required_data_fields', fl).completed(function (v) {self.required_data_fields_ready(v)});
	rr.load();
}

DCP_Aware_Scene.prototype.required_data_fields_ready = function (data) {
	var remap = {};
	for (var i in data) remap[data[i].id()] = data[i].value();
	var capacity = remap.capacity;
	var dfdc = this.config.data_field_dependent_components.slice();

	for (var i in dfdc) {
		var it = dfdc[i];
		it.config = it.config || {};
		it.config.required = it.config.required || {};

		if (it.config.required.fields) {
			var f = it.config.required.fields.split(',');
			var t = {};
			for (var i in f) t[f[i]] = remap[f[i]];
			it.config.required.fields = t;
		}
		if (it.config.required.resources) {
			var r = it.config.required.resources.split(',');
			var t = {};
			for (var i in r) t[r[i]] = this.loaded[r[i]];
			it.config.required.resources = t;
		} 
		if (it.config.required.execute) {
			var e = it.config.required.execute;
			var t = {};
			for (var i in e) t[i] = ('function' === typeof(e[i])) ? e[i].call(this) : undefined;
			it.config.required.execute = t;
		}
		it.config.data = this.data;
	}

	var rr = GUI_Component_factory(this.loaded, this.canvas, dfdc).completed(function () {
		console.log('======================= is complete as well');
	}).load();
}
*/
