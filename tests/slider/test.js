function TestRenderer (canvas) {
	var self = this;
	Scene.prototype.constructor.call(this, {
		'resources':{
			'svg': ['slider'],
			'root':'./',
		},
		'components': [
			{
				'path':'slider/layer1',
				'type':Slider,
				'config': {
					elements: {
						handle_group: 'g5871',
						handle_event_target: 'rect7812',
						area:'buy_in_slide_area'
					}
				}
			}
		]
	}, canvas);
}

TestRenderer.prototype = new Scene();
TestRenderer.prototype.constructor = TestRenderer;

TestRenderer.prototype.ready = function () {
	console.log('WILL DO SOME RENDERING...');
	var self = this;
	var el = function (name) { return self.element(name);}
	var obj = el('slider/layer1');
	obj.initSlider();
	this.canvas.add(obj);
	this.canvas.renderAll();
}

document.addEventListener('DOMContentLoaded', function () {
	new TestRenderer( new fabric.Canvas('testcanvas',{debug:false}));
	console.log('here we are');
}, false);
