fabric_helpers = {};
fabric_helpers.isLayer = function (obj) {
	return ('group' === obj.type && 'layer' === obj.inkscapeGroupMode);
}

fabric_helpers.getInkscapeLayers = function (obj) {
	var ret = [];
	for (var i in obj._objects) {
		var o = obj._objects[i];
		if (o.inkscapeGroupMode !== 'layer') continue;
		ret.push (o);
	}
	return ret;
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

fabric_helpers.show_layer = function (l, ctx) {
	l && (l.set({'opacity':1, 'display':'inline'}) || true) && ctx && ctx.renderAll();
}

fabric_helpers.hide_layer = function (l,ctx) {
	l && (l.set({'opacity':0, 'display':'none'}) || true) && ctx && ctx.renderAll();
}

