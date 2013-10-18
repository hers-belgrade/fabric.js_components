//help me with layers ... show me, hide me, find layers within given structure ...
function Layer (layer, do_render) {
	if (!arguments.length) return;
	this.layer = layer;
	this.render = function () {
		functions.safe_call(do_render);
	}
}

Layer.prototype.show = function () {
	Layer.show(this.layer, this.render);
}

Layer.prototype.hide = function () {
	Layer.hide(this.layer, this.render);
}

Layer.hideSubLayers = function (l,me_included, do_render) {
	me_included && Layer.hide(l);
	Layer.getLayers(l).forEach(function(v) {
		Layer.hide(v);
	});
	functions.safe_call(do_render);
}

Layer.show = function (l, do_render) {
	l && (l.set({'opacity':1, 'display':'inline'}) || true) && functions.safe_call(do_render);
}

Layer.hide = function (l, do_render) {
	l && (l.set({'opacity':0, 'display':'none'}) || true) && functions.safe_call(do_render);
}

Layer.getLayers = function (obj) {
	var ret = [];
	for (var i in obj._objects) {
		var o = obj._objects[i];
		if (o.inkscapeGroupMode !== 'layer') continue;
		ret.push (o);
	}
	return ret;
}
