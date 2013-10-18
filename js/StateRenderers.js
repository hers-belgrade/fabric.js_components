function SVGStateRenderer (svg_struct, resources) {
	if (!arguments.length) return;
	this.obj = svg_struct;
	this.resources = resources;
}

SVGStateRenderer.prototype.hide = function () {
	fabric_helpers.hide_layer(this.obj);
}
SVGStateRenderer.prototype.show = function () {
	fabric_helpers.show_layer(this.obj);
}

SVGStateRenderer.prototype.init = function () {
}

function SVGStateableRenderer (svg_struct, states, do_render) {
	if (!arguments.length) return;
	this.obj = svg_struct;
	this.states = states;
	this.state = undefined;

	this.render = function () { ('function' === typeof(do_render)) && do_render(); }


}

SVGStateableRenderer.prototype.init = function (state) {

	if (!state) throw "No state, I am unable to move on";

	for (var i in this.states) {
		this.states[i].init();
		this.states[i].hide();
	}
	this.setState(state);
}

SVGStateableRenderer.prototype.setState = function (state) {
	if (!state) return;
	if (this.state == state) return false;
	for (var i in this.states) {
		(i == state) ? this.states[i].show() : this.states[i].hide();
	}
	this.state = state;
	return true;
}

