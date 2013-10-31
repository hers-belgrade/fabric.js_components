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
Scene.prototype.graphic_components_ready = function (elements) {
	///Simple scene expects only graphic_components ....
	this.ready();
}

Scene.prototype.render = function () { this.canvas && this.canvas.renderAll(); }
Scene.prototype.ready = function () {
	throw "Ready not implemented";
}
Scene.counter = 0;

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
