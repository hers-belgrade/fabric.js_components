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

fabric_helpers.find_path_objs = function (resources, path) {
	var ret = [resources];
	var el = resources;
	var p = path.split('/');
	for (var i in p) {
		el = el[p[i]];
		ret.push(el);
	}
	return ret;
}

fabric_helpers.find_path = function (resources, path) {
	var objs = fabric_helpers.find_path_objs(resources, path);
	return objs.pop();
}

fabric_helpers.get_path_alias_map = function (struct,map) {
	var ret = {};
	for (var i in map) {
		ret[i] = fabric_helpers.find_path(struct, map[i]);
	}
	return ret;
}



//group Layer helpers..
var Layer = {
	hideSubLayers : function (l,me_included, do_render) {

		me_included && Layer.hide(l);
		Layer.getLayers(l).forEach(function(v) {
			Layer.hide(v);
		});
		functions.safe_call(do_render);
	},

	getLayers : function (obj) {
		var ret = [];
		for (var i in obj._objects) {
			var o = obj._objects[i];
			if (o.inkscapeGroupMode !== 'layer') continue;
			ret.push (o);
		}
		return ret;
	}
}

function CallBackable (cb_map) {
	this.invoke = function (what) {
		if (!cb_map) return;
		functions.safe_call.apply(null, [cb_map[what]].concat(Array.prototype.slice.call(arguments, 1)));
	}
}
