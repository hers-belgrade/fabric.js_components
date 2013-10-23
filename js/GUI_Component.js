function GUI_Component (path, canvas, struct,config, ready) {
	if (!struct) return;
	struct.path = function () {return path;}
}

/*
 * Create component from loaded function immediately...
 */
function Immediate_GUI_Component (name,canvas, struct,config, ready) {
	if (!struct) return;
	GUI_Component(name, canvas, struct,config, ready);


	config = fabric.util.object.extend(
			{}, 
			{ 'init_visible': true, 'auto_add': false}, 
			config
	);

	(config.auto_add) && canvas.add(struct);
	(config.init_visible) ? struct.show() : struct.hide();
	//call ready right away ... 
	('function' === typeof(ready)) && ready.call(struct);
}

/**Factory
 *
 */
Create_GUI_Components = function (resources,canvas, items, success_cb, failed_cb) {
	var got_it = {};

	var failed = function(r) {
		console.warn(r);
		('function' === typeof(failed_cb)) && failed_cb(r);
		return undefined;
	}

	var done = function (item) {
		got_it[item.path()] = item;
		for (var i in got_it) {
			if (!got_it[i]) return;
		}
		console.log('jel se ovo ikad desilo');
		('function' === typeof(success_cb)) && success_cb(got_it);
	}
	for (var i in items) {
		got_it[items[i].path] = false;
	}


	for (var i in items) {
		(function (item) {
			var f = item.type;
			if ('function' !== typeof(f)) return failed('Invalid constructor for '+item.name);
			var s = fabric_helpers.find_path(resources,item.path);
			if (!s) failed('Invalid path '+item.path);

			var si = f(item.path , canvas, s, item.config, function () {
				done(this);
			});

		})(items[i]);
	}
}
