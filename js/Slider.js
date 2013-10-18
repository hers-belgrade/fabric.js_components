function Slider (struct,do_render) {


	///TODO: 1. position handle to the mouse middle, 2. support vertiacal slider, 3. introduce range,both descrete and continuous
	this.struct = struct;
	GUI_Component.prototype.constructor.call(this, struct,do_render);
	var self = this;

	var working = false;
	var clicking = false;

	var offset = 0;


	var handle = this.elements.handle;
	var area = this.elements.area;

	function stop_moving () {
		if (!working) return;
		console.log('stop');
		working = false;
		handle.set({'opacity':1});
		self.render();
	}

	function update_position (pos) {
		handle.set({'left':pos});
		self.render();
	}

	this.elements.area.on ({
		'mouse:move' : function (obj) {
			if (!working) return;
			update_position(obj.e.x);
		},
		'mouse:down': function () {
			clicking = true;
		},
		'mouse:up': function (obj) {
			if (working) return stop_moving();
			if (clicking) update_position(obj.e.x);
		},
		'object:out':stop_moving
	});



	this.elements.handle.on ({
		'mouse:down': function (obj) {
			working = true;
			offset = obj.e.x - this.x;
			this.set({'opacity': 0.5});
		},
		'mouse:up': function (e) {
			working = false;
			offset = 0;
			this.set({'opacity': 1});
		},
		'object:over': function (e) {
			this.set({'opacity': 0.8});
			self.render();
		},
	});
}

Slider.prototype = new GUI_Component();
Slider.prototype.constructor = Slider;

Slider.prototype.type = function () {return 'slider'}
Slider.prototype.mandatoryElements = function () {return ['handle', 'rail', 'area'];}
