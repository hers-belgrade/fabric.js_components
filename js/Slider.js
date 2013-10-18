/*
 * Possible events: 
 * 		slider:changed: triggered once actual value is changed, not when render occures
 */
function Slider (struct,do_render) {

	this.struct = struct;
	GUI_Component.prototype.constructor.call(this, struct,do_render);
}

Slider.prototype = new GUI_Component();
Slider.prototype.constructor = Slider;

Slider.prototype.type = function () {return 'slider'}
Slider.prototype.mandatoryElements = function () {return ['handle', 'rail', 'area'];}

Slider.prototype.uninit= function () {
	if (!this.event_handlers) return;
	this.elements.area.off(this.event_handlers.area);
	this.elements.handle.off(this.event_handlers.handle);
	delete this.elements;
	delete this.range;
}

Slider.prototype.setup = function (range) {
	//TODO: what should I do if range is max - min == 0;

	range = range || {min:0, max:100};
	if (isNaN(range.min) || isNaN(range.max) || range.min > range.max) throw "Invalid range";
	if (!range.step) range.step = 0;

	if (isNaN (range.step) || range.step < 0 || range.step > (range.max - range.min)) throw "Invalid step";
	this.range = range;
	('undefined' !== typeof(this.current)) && this.set(this.current);
}

Slider.prototype._set = function (pos) {
	var handle = this.elements.handle;
	if (handle.get('left') === pos) return;
	handle.set({left: pos});
	this.render();
}

Slider.prototype._notify = function (val) {
	var should_fire = (this.current != val);
	this.current = val;
	should_fire && (true || this.fire('slider:changed', {current: val})) && console.log(this.current);
}

Slider.prototype.set = function (val) {
	if (isNaN(val) || !this.range || val < this.range.min || val > this.range.max) throw "Invalid argument to set";
	var range  = this.range;
	if (range.step) {
		val = Math.floor(val/range.step) * range.step;
		if (val < range.min) val = range.min;
	}

	var area = this.elements.area;
	var handle = this.elements.handle;
	var handle_half = handle.width/2;

	var max = area.left + area.width - handle.width;
	var min = area.left;
	var diff = max - min;

	var x = min + (val / (range.max - range.min)) * diff;
	this._set(x);
	this._notify(val);
}

Slider.prototype.init = function (range, init_val) {
	var self = this;

	this.uninit();
	this.setup(range);
	//helper functions
	function stop_moving () {
		if (!working) return;
		working = false;
		handle.set({'opacity':1});
		self.render();
	}

	function update_position (x) {
		var area = self.elements.area;
		var handle = self.elements.handle;
		var handle_half = handle.width/2;

		var max = area.left + area.width - handle.width;
		var min = area.left;
		var diff = max - min;

		var range = self.range;
		if (x > max) pos = max;
		if (x < min) pos = min;

		var range_diff = range.max - range.min;
		var temp_current = (x - min) * (range_diff) / diff;

		if (range.step) {
			temp_current = Math.floor(temp_current/range.step)*range.step;
			x = min + (temp_current*diff) / range_diff;
		}

		self._set(x) ;
		self._notify(temp_current);
	}


	var working = false;
	var clicking = false;


	var handle_half = this.elements.handle.width/2;

	this.event_handlers = {};
	var area_el = {
		'mouse:move' : function (obj) {
			if (!working) return;
			update_position(obj.e.x - handle_half);
		},
		'mouse:down': function () {
			clicking = true;
		},
		'mouse:up': function (obj) {
			if (working) return stop_moving();
			if (clicking) update_position(obj.e.x - handle_half);
		},
		'object:out':stop_moving
	}
	var handle_el = {
		'mouse:down': function (obj) {
			working = true;
			this.set({'opacity': 0.5});
		},
		'mouse:up': function (e) {
			working = false;
			this.set({'opacity': 1});
		},
		'object:over': function (e) {
			this.set({'opacity': 0.8});
			self.render();
		},
	}
	this.event_handlers.area = area_el;
	this.event_handlers.handle = handle_el;

	this.elements.area.on (area_el);
	this.elements.handle.on (handle_el);

	this.set( ('undefined' !== typeof(init_val)) ? init_val : this.range.min);
}

