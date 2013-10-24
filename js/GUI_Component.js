function GUI_Component (path, canvas, struct,config, ready) {
	if (!struct) return;
	struct.path = function () {return path;}
	struct.notify_ready = function () {ready.call(this)}
}

/*
 * Create component from loaded function immediately...
 */
function Immediate_GUI_Component (path, canvas, struct, config, ready) {
	if (!struct) return;
	GUI_Component(path, canvas, struct,config, ready);


	config = fabric.util.object.extend(
			{}, 
			{ 'init_visible': true, 'auto_add': false}, 
			config
	);

	(config.auto_add) && canvas.add(struct);
	(config.init_visible) ? struct.show() : struct.hide();
	//call ready right away ... 
	('function' === typeof(ready)) && struct.notify_ready();
}

/**Factory
 *
 */
Create_GUI_Components = function (_resources,_canvas, _items, _success_cb, _failed_cb) {

	function Registry (done) {
		var got_it = {};
		this.register = function (items) {
			for (var i in items) got_it[items[i].path] = false;
		}
		this.note = function (path, obj){
			got_it[path] = obj;
			for (var i in got_it) {if (!got_it[i]) return;}
			('function' === typeof(done)) && done.call(_resources,got_it);
		}
	}

	(function (resources,canvas, items, success_cb, failed_cb){
		var reg = new Registry(success_cb);
		reg.register(items);

		var failed = function(r) {
			console.warn(r);
			('function' === typeof(failed_cb)) && failed_cb(r);
			return undefined;
		}

		for (var i in items) {
			(function (item) {
				var f = item.type;
				if ('function' !== typeof(f)) return failed('Invalid constructor for '+item.name);
				var s = fabric_helpers.find_path(resources,item.path);
				if (!s) failed('Invalid path '+item.path);

				var si = f(item.path , canvas, s, item.config, function () {
					reg.note(item.path, this);
				});

			})(items[i]);
		}
	})(_resources,_canvas, _items, _success_cb, _failed_cb);
}
