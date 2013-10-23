/*
function ButtonGroup (struct,config, do_render) {
	var objs = struct._objects;
	this.buttons = {};
	config = config || {};
	for (var i in objs) {
		if (!fabric_helpers.isLayer(objs[i])) continue;
		var b = new Button(objs[i], do_render);
		this.buttons[b.name()] = b;
		var c = config[b.name()];
		(c.initState) && b.setState(c.initState);
		(c.onClicked) && b.onClicked(c.onClicked);
	}
}

ButtonGroup.prototype.button = function (name) {
	if (name && name instanceof Array) {
		var ret = [];
		for (var i in name){
		 	this.buttons[name[i]] && ret.push (this.buttons[name[i]]);
		}
		return ret;
	}
	return this.buttons[name];
}

ButtonGroup.prototype.forEach = function (cb) {
	if ('function' !== typeof(cb)) return;
	for(var i in this.buttons) {
		cb (this.buttons[i],i, this);
	}
}
*/


///TODO: 1. discuss special state requirements ... do we really need FourStateComponentState? Should we propagate mouse control checks down to those specific states ?

function FourStateComponent (env,fs_layer,do_render) {
	if (!arguments.length) return;
	function FourStateComponentState (svg_struct) {
		SVGStateRenderer.prototype.constructor.call(this,env, svg_struct);
	}

	FourStateComponentState.prototype = new SVGStateRenderer();
	FourStateComponentState.prototype.constructor = FourStateComponentState;

	FourStateComponentState.prototype.init = function () {
	}

	var click_cb = null;

	function on_click () {
		console.log('CE GA BIJEMO :D :D :D', self.fire.toString());
		self.fire('clicked', self.id());
	}

	this.name = function () {return fs_layer.id;}

	var states = {'enabled':undefined, 'disabled':undefined, 'hovered':undefined, 'pressed':undefined};
	var layers = Layer.getLayers(fs_layer);

	function get_layer (state) {
		return fs_layer[fs_layer.id+'_'+state];
	}

	for (var i in layers) {
		var state_layer = layers[i];
		state_layer.set({'opacity':0}); ///hide all layers, no matter what ...
		var ln = state_layer.id;
		var sn = ln.split('_').pop();
		if (sn in states) {
			states[sn] = new FourStateComponentState(state_layer);
		}
	}

	if (!states.enabled || !states.disabled || !states.pressed)
		throw "FourStateComponent with no enabled, disabled and pressed state? No way ...";

	if (!states.pressed) {
		states.pressed = states.enabled;
	}

	if (!states.hovered) {
		states.hovered = states.enabled;
	}


	console.log('sta mi to imamo ovde?');
	SVGStateableRenderer.prototype.constructor.call(this,env, fs_layer, states, do_render);
	var self = this;

	var enabled = fabric_helpers.find_event_target(get_layer('enabled'));
	var hovered = fabric_helpers.find_event_target(get_layer('hovered'));
	var pressed = fabric_helpers.find_event_target(get_layer('pressed'));

	var require_hover = !fabric.isTouchSupported;


	enabled.on('object:over', function () {
		/// won't happen if !require_hove
		SVGStateableRenderer.prototype.setState.call(self,'hovered') &&  self.render();//was state change successfull?
	});

	hovered.on('object:out', function () {
		/// won't happen if !require_hover
		self.setState('enabled');
		self.render();
	});

	enabled.on('mouse:down', function () {
		if (require_hover) return;
		SVGStateableRenderer.prototype.setState.call(self,'pressed') &&  self.render();//was state change successfull?
	});

	hovered.on('mouse:down', function () {
		SVGStateableRenderer.prototype.setState.call(self,'pressed') &&  self.render();//was state change successfull?
	});

	pressed.on('mouse:up', function () {
		/// ignore click event handler if state is wrong ... just suite up ...
		var c = self.state;
		if (c == 'disabled') {
			self.setState('disabled');
			return;
		}
		if (self.state === 'pressed') {
			on_click();
		}

		SVGStateableRenderer.prototype.setState.call(self, (require_hover) ? 'hovered' : 'enabled');
		self.render();
	});

}

FourStateComponent.prototype = new SVGStateableRenderer();
FourStateComponent.prototype.constructor = FourStateComponent;

FourStateComponent.prototype.setState = function (state) {
	if (state == 'hovered' || state == 'pressed') return false; ///not allowed from outside world
	var s = SVGStateableRenderer.prototype.setState.call(this, state);
	this.render();
	return s;
}

function Button (env, layer, do_render) {
	if (!arguments.length) return;
	FourStateComponent.prototype.constructor.call(this, env, layer, do_render);
}

Button.prototype = new FourStateComponent();
Button.prototype.constructor = Button;


Button.prototype.process_arguments = function () {
	var args = this.obj.component_arguments;
	args = fabric.util.object.multi_extend({}, {'state':'disabled'}, args);
	this.setState(args.state);
	Layer.prototype.process_arguments.call(this);

}


