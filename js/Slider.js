function Slider(path, canvas, struct, config, ready) {
	if (!struct) return;


	var matmult = fabric.util.multiplyTransformMatrices;
	var Matrix = fabric.util.Matrix;

	var target_path_objs = fabric_helpers.find_path_objs(struct,config.elements.handle_group);
	var handle = target_path_objs[target_path_objs.length-1];

	var area_path_objs = fabric_helpers.find_path_objs(struct, config.elements.area);
	var area = area_path_objs[area_path_objs.length-1];

	var target_scale = Matrix.GetScale (Matrix.CalculateTransformToObject(target_path_objs));
	var area_scale = Matrix.GetScale(Matrix.CalculateTransformToObject(area_path_objs));

	var target = fabric_helpers.find_path(struct, config.elements.handle_group+'/'+config.elements.handle_event_target);

	var handle_width = target.width*target_scale;
	var area_width = area.width*area_scale;

	var handle_half = handle_width/2;

	var initial_offset = (handle.transformMatrix) ? handle.transformMatrix[4] : 0;

	var local = {
		setupSlider:function (range, val) {
			range = range || {min:0, max:100};
			if (isNaN(range.min) || isNaN(range.max) || range.min > range.max) throw "Invalid range";
			if (!range.step) range.step = 0;

			if (isNaN (range.step) || range.step < 0 || range.step > (range.max - range.min)) throw "Invalid step";
			this.Slider_range = range;
			!isNaN(val) && this.setSliderValue(val);
		},
		_setSlider: function (pos) {
			if (!handle.transformMatrix) handle.transformMatrix = [1,0,0,1,0,0];
			handle.transformMatrix[4] = initial_offset + pos/target_scale;
			canvas.renderAll();
		},
		_notifySlider: function (val) {
			var should_fire = (this.currentVal != val);
			this.currentSliderVal = val;
			should_fire && (this.fire('slider:changed', {current: val})||true) && false && console.log(this.currentSliderVal);
		},
		step_up : function () {
			this.setSliderValue(this.currentSliderVal + this.Slider_range.step);
		},
		val: function () {
			return this.currentSliderVal;
		},
		step_down: function () {
			this.setSliderValue(this.currentSliderVal - this.Slider_range.step);
		},
		setMax: function () {
			this.setSliderValue(this.Slider_range.max);
		},
		setMin: function () {
			this.setSliderValue(this.Slider_range.min);
		},
		setSliderValue: function (val){
			if (isNaN(val) || !this.Slider_range|| val < this.Slider_range.min || val > this.Slider_range.max) throw "Invalid argument to set";
			var range  = this.Slider_range;
			if (range.step) {
				val = Math.floor(val/range.step) * range.step;
				if (val < range.min) val = range.min;
			}

			///todo: recalculate this dimensions for skew
			var max = area_width - handle_width;
			var min = 0;
			var diff = max - min;

			var x = min + ((val - range.min) / (range.max - range.min)) * diff;
			this._setSlider(x);
			this._notifySlider(val);
		},
		enable: function () {
			this.slider_enabled = true;
		},
		disable:function () {
			this.slider_enabled = false;
			area.fire('object:out');
		}
	}
	fabric.util.object.extend(struct, local);
	Immediate_GUI_Component(path, canvas, struct, {init_visible:true}, function () {
		var self = this;


		var working = false;
		var clicking = false;


		function stop_moving () {
			if (!working) return;
			working = false;
			handle.set({'opacity':1});
			canvas.renderAll();
		}

		function update_position (x) {
			var max = area_width - handle_width;
			var min = 0;
			var diff = max - min;

			var range = self.Slider_range;
			if (x > max) x = max;
			if (x < min) x = min;

			var range_diff = range.max - range.min;
			var temp_current = (x - min) * (range_diff) / diff;

			if (range.step) {

				var offset = temp_current - range.min;
				offset = Math.floor(offset/range.step)*range.step;
				temp_current = range.min+offset;
				x = min + (temp_current*diff) / range_diff;
			}

			self._notifySlider(range.min+temp_current);
			self._setSlider(x);
		}

		this.Slider_event_handlers = {};
		function doDaHandle(p){
			var lp = area.globalToLocal(p);
			update_position(lp.x*Math.abs(area_scale) - handle_half);
		};
		var area_el = {
			'mouse:move' : function (obj) {
				if (!self.slider_enabled) return;
				if (!working) return;
				doDaHandle(obj.e);
			},
			'mouse:down': function () {
				if (!self.slider_enabled) return;
				clicking = true;
			},
			'mouse:up': function (obj) {
				if (working) return stop_moving();
				if (!self.slider_enabled) return;
				if (clicking) {
					doDaHandle(obj.e);
				}
			},
			'object:out':stop_moving,
		};
		var handle_el = {
			'mouse:down': function (obj) {
				if (!self.slider_enabled) return;
				working = true;
				this.set({'opacity': 0.5});
				canvas.renderAll();
			},
			'mouse:up': function (e) {
				if (!self.slider_enabled) return;
				working = false;
				this.set({'opacity': 1});
				canvas.renderAll();
			},
			'object:over': function (e) {
				if (!self.slider_enabled) return;
				this.set({'opacity': 0.8});
				canvas.renderAll();
			},
		};
		this.Slider_event_handlers.area = area_el;
		this.Slider_event_handlers.handle = handle_el;

		area.on (area_el);
		target.on (handle_el);
		struct.enable();
		ready.call(struct);
	});
}

function SliderWithButtons (path, canvas, struct, config, ready) {
	if (!struct) return;
	var buttons = ['min_button', 'max_button', 'plus_button', 'minus_button'];
	var batch = BatchButtons(config, buttons);
	var to_create = batch.to_create;
	var alias_map = batch.alias_map;

	var se = config.elements.slider;
	var _to_set = fabric.util.object.extend({config:{}},se,{type:Slider});
	_to_set.config.elements = se.elements;

	to_create.push (_to_set);
	alias_map['slider'] = se.path;
	var local = {
		SWB_Elements: fabric_helpers.get_path_alias_map(struct, alias_map),
		setupSlider: function (range, val) {
			return this.SWB_Elements.slider.setupSlider(range, val);
		},
		setSliderValue: function (val) {
			return this.SWB_Elements.slider.setSliderValue(val);
		},
		enable: function () {
			return this.SWB_Elements.slider.enable();
		},
		disable: function () {
			return this.SWB_Elements.slider.disable();
		},
		val : function () {
			return this.SWB_Elements.slider.val();
		}
	}
	GUI_Component(path, canvas, struct,config, ready);
	Create_GUI_Components (struct, canvas, to_create, function (elements) {
		fabric.util.object.extend(this, local);
		var el = this.SWB_Elements;
		var self = this;
		function setValue (val) {
			if (val >= el.slider.Slider_range.max) { 
				el.max_button && el.max_button.disable();
				el.plus_button && el.plus_button.disable();
			}else{
				el.max_button && el.max_button.enable();
				el.plus_button && el.plus_button.enable();
			}
			if (val <= el.slider.Slider_range.min) {
				el.minus_button && el.minus_button.disable();
				el.min_button && el.min_button.disable();
			}else{
				el.minus_button && el.minus_button.enable();
				el.min_button && el.min_button.enable();
			}
			self.fire('slider:changed', {current: val});
		}

		el.slider.on ('slider:changed' , function (v) {
			setValue(Math.floor(v.current));
		});

		el.minus_button && el.minus_button.on('button:clicked', function () { el.slider.step_down(); });
		el.plus_button && el.plus_button.on('button:clicked', function () {el.slider.step_up();});
		el.min_button && el.min_button.on('button:clicked', function () {el.slider.setMin();});
		el.max_button && el.max_button.on('button:clicked', function () {el.slider.setMax();});
		this.notify_ready();
	});
}
