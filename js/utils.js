var functions = {};
functions.safe_call = function (f) {
	('function' === typeof(f)) && f.apply(this, Array.prototype.slice.call(arguments, 1));
}
var fabric_helpers = {};
fabric_helpers.isLayer = function (obj) {
	return ('group' === obj.type && 'layer' === obj.inkscapeGroupMode);
}

fabric_helpers.find_event_target = function (root) {
	if (!root) return undefined;
	if (root['inkscape:event_target'] == 'true') return root;
	if (!root._objects) return undefined;

	for (var i in root._objects)  {
		var r = fabric_helpers.find_event_target(root._objects[i]);
		if (r) return r;
	}
	return undefined;
}

function CanvasAware (canvas) {
	if (!arguments.length) return;
	this.canvas = canvas;
}

CanvasAware.prototype.renderAll = function () {
	this.canvas && this.canvas.renderAll();
}

function CallBackable (cb_map) {
	this.invoke = function (what) {
		if (!cb_map) return;
		functions.safe_call.apply(null, [cb_map[what]].concat(Array.prototype.slice.call(arguments, 1)));
	}
}
