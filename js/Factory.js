(function (global) {
	var components = {
		'screen': function (struct, do_render) {
			console.log('screen: ',struct.id, struct.component_arguments);
			return new Screen(struct, do_render);
		},
		'dialog': function (struct, do_render) {
			console.log('dialog:',struct.id, struct.component_arguments)
		}
	};

	function prepare_arg (arg) {

		///TODO: should be a JSON
		var s = arg.split(',');
		var ret = {};
		for (var i in s) {
			var a = s[i].split(':');
			ret[a[0]] = a[1];
			if (a[1] === 'true') {a[1] = true;}else 
			if (a[1] === 'false'){a[1] = false;}else
			if (!isNaN(a[1])) {a[1] = parseFloat(a[1])}
		}
		return ret;
		/*
		var json = '{'+arg+'}';
		try {
			return (json) ? JSON.parse(json) : undefined;
		}catch (e) {
			console.log(e);
			return;
		}
		*/
	}

	global.register_to_component_factory = function(component_type, factory) {
		components[component_type] = factory;
	}
	global.GUI_Component_factory = function (struct, do_render) {

		var ret = [];
		var all = fabric.Group.findChildGroups(struct);
		for (var i in all) {
			var c = all[i];
			if (!c.component) continue;
			if ('function' !== typeof(components[c.component])) continue;
			c.component_arguments = prepare_arg(c.component_arguments)
			ret.push (components[c.component](c,do_render));
		}
	}
})(window);
