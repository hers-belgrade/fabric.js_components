function SVGStateRenderer (env, svg_struct, resources) {
	if (!arguments.length) return;
	Immediate_GUI_Component.prototype.constructor.call(this, env, svg_struct);
	this.resources = resources;
}

SVGStateRenderer.prototype = new Immediate_GUI_Component();
SVGStateRenderer.prototype.constructor = SVGStateRenderer;

function SVGStateableRenderer (env,obj, states, do_render) {
	if (!arguments.length) return;
	Immediate_GUI_Component.prototype.constructor.call(this, env, obj, do_render);
	this.states = states;
	this.state = undefined;
}

SVGStateableRenderer.prototype = new Immediate_GUI_Component();
SVGStateableRenderer.prototype.constructor = SVGStateableRenderer;

SVGStateableRenderer.prototype.setState = function (state) {
	if (!state) return;
	if (this.state == state) return false;
	for (var i in this.states) {
		(i == state) ? this.states[i].show() : this.states[i].hide();
	}
	this.state = state;
	return true;
}

