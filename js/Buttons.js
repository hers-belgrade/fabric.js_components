function SVGStateableRenderer (path, canvas, struct, config, ready ) {
	if (!struct) return;

	var state_path_map = {};
	var full_state_conf = {};
	for (var i in config.states) {
		var path = config.states[i];
		var objs = fabric_helpers.find_path_objs(struct,path);
		objs.forEach(function (v) {v.show()});
		state_path_map[i] = objs.pop();
		full_state_conf[i] = {
			path:path,
			type:Immediate_GUI_Component,
			config:{'init_visible':true}
		}
	}

	//// path should be specified relative to this struct
	var local = {
		setState : function (state) {
			if (!state) return;
			var self = this;

			function do_show(obj) {
				//console.log('will show: ', obj.id, 'due to state', state, 'on object', self.id);
				obj.show();
			}
			if (this.state == state) return false;
			for (var s in this.state_path_map) {
				var obj = this.state_path_map[s];
				(s === state) ? do_show(obj) : obj.hide();
			}
			this.state = state;
			canvas.renderAll();
			return true;
		},
		state_path_map : state_path_map,
		state: config.init_state,
	}

	fabric.util.object.extend(struct, local);
	GUI_Component(path, canvas, struct, config, ready);
	Create_GUI_Components(struct, canvas, full_state_conf, function () {
		struct.forEachObjectRecursive (function (obj) {obj.show()});
		struct.setState(config.init_state);
		struct.notify_ready();
	});
}

function Button(path, canvas, struct, config, ready) {
	//console.log('=====', config);
	var stateable_states = {};
	var target_map = {};
	for (var i in config.states) {
		var t = config.states[i];
		stateable_states[i] = t.group;
		target_map[i] = fabric_helpers.find_path(struct,t.group+'/'+t.target);
	}
	config.states = stateable_states;
	fabric.util.object.extend(struct, {button_target_map:target_map});
	SVGStateableRenderer(path, canvas, struct, config, function () {
		var self = this;
		var require_hover = !fabric.isTouchSupported;
		var sm = this.button_target_map;

		sm.enabled.on ({
			'object:over': function () {
				self.setState('hovered');
			},
			'mouse:down': function () {
				if (require_hover) return;
				self.setState('pressed');
			}
		});
		sm.hovered.on ({
			'object:out': function () {
				self.setState('enabled');
			},
			'mouse:down': function () {
				self.setState('pressed');
			}
		});

		sm.pressed.on ({
			'mouse:up': function () {
				//console.log('mouse:up', self.id);
				var c = self.state;
				if (c === 'disabled') return self.setState('disabled');
				if (c === 'pressed' ) self.fire('button:clicked');
				self.setState( (require_hover) ? 'hovered' : 'enabled');
			}
		});
		//console.log('will report ready for ',struct.id);
		ready.call (struct);
	});
}

