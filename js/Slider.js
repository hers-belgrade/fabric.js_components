function Slider(path, canvas, struct, config, ready) {
	if (!struct) return;
	var Slider_elements = {};
	for (var i in config.components) {
		Slider_elements[i] = fabric_helpers.find_path(struct, config.components[i]);
	}
	var local = {
		Slider_elements: Slider_elements,
		setupSlider:function (range) {
			range = range || {min:0, max:100};
			if (isNaN(range.min) || isNaN(range.max) || range.min > range.max) throw "Invalid range";
			if (!range.step) range.step = 0;

			if (isNaN (range.step) || range.step < 0 || range.step > (range.max - range.min)) throw "Invalid step";
			this.Slider_range = range;
			('undefined' !== typeof(this.currentSliderVal)) && this.setSliderValue(this.currentSliderVal);
		},
		_setSlider: function (pos) {
			var handle = this.Slider_elements.handle;
			if (handle.get('left') === pos) return;
			handle.set({left: pos});
			canvas.renderAll();
		},
		_notifySlider: function (val) {
			var should_fire = (this.currentVal != val);
			this.currentSliderVal = val;
			should_fire && (true || this.fire('slider:changed', {current: val})) && false && console.log(this.currentSliderVal);
		},
		setSliderValue: function (val){
			if (isNaN(val) || !this.Slider_range|| val < this.Slider_range.min || val > this.Slider_range.max) throw "Invalid argument to set";
			var range  = this.Slider_range;
			if (range.step) {
				val = Math.floor(val/range.step) * range.step;
				if (val < range.min) val = range.min;
			}

			var area = this.Slider_elements.area;
			var handle = this.Slider_elements.handle;
			var handle_half = handle.width/2;

			var max = area.left + area.width - handle.width;
			var min = area.left;
			var diff = max - min;

			var x = min + (val / (range.max - range.min)) * diff;
			this._setSlider(x);
			this._notifySlider(val);
		},
		uninitSlider: function () {
		},
		initSlider : function (range, init_val) {
			var self = this;

			this.uninitSlider();
			this.setupSlider(range);
			//helper functions
			function stop_moving () {
				if (!working) return;
				var handle = self.Slider_elements.handle;
				working = false;
				handle.set({'opacity':1});
				canvas.renderAll();
			}

			function update_position (x) {
				var area = self.Slider_elements.area;
				var handle = self.Slider_elements.handle;
				var handle_half = handle.width/2;

				var max = area.left + area.width - handle.width;
				var min = area.left;
				var diff = max - min;

				var range = self.Slider_range;
				if (x > max) pos = max;
				if (x < min) pos = min;

				var range_diff = range.max - range.min;
				var temp_current = (x - min) * (range_diff) / diff;

				if (range.step) {
					temp_current = Math.floor(temp_current/range.step)*range.step;
					x = min + (temp_current*diff) / range_diff;
				}

				self._setSlider(x) ;
				self._notifySlider(temp_current);
			}


			var working = false;
			var clicking = false;


			var handle_half = this.Slider_elements.handle.width/2;

			this.Slider_event_handlers = {};
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
					canvas.renderAll();
				},
				'mouse:up': function (e) {
					working = false;
					this.set({'opacity': 1});
					canvas.renderAll();
				},
				'object:over': function (e) {
					this.set({'opacity': 0.8});
					canvas.renderAll();
				},
			}
			this.Slider_event_handlers.area = area_el;
			this.Slider_event_handlers.handle = handle_el;

			this.Slider_elements.area.on (area_el);
			this.Slider_elements.handle.on (handle_el);

			this.setSliderValue( ('undefined' !== typeof(init_val)) ? init_val : this.Slider_range.min);
		}
	}
	fabric.util.object.extend(struct, local);
	Immediate_GUI_Component(path, canvas, struct, {init_visible:true}, ready);
}
