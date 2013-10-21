var functions = {};
functions.safe_call = function (f) {
	('function' === typeof(f)) && f.apply(this, Array.prototype.slice.call(arguments, 1));
}
var fabric_helpers = {};
fabric_helpers.isLayer = function (obj) {
	return ('group' === obj.type && 'layer' === obj.inkscapeGroupMode);
}

fabric_helpers.find_element_with_attribute = function (root, attr, val) {
	if (!root) return undefined;
	if (root[attr] == val) return root;
	if (!root._objects) return undefined;
	for (var i in root._objects)  {
		var r = fabric_helpers.find_element_with_attribute(root._objects[i], attr, val);
		if (r) return r;
	}
	return undefined;
}

fabric_helpers.find_event_target = function (root) {
	return fabric_helpers.find_element_with_attribute(root, 'inkscape:event_target', 'true');
}

fabric_helpers.find_component_element = function (root, name) {
	return fabric_helpers.find_element_with_attribute(root, 'component_element', name);
}

fabric_helpers.find_component = function (root, name, els) {
	var container = fabric_helpers.find_element_with_attribute(root, 'component', name);
	var ret = { container: container }
	if (els) {
		for (var i in els) {
			var ce = els[i];
			ret[ce] = fabric_helpers.find_element_with_attribute(root, 'component_element', ce);
		}
	}

	return ret;
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

