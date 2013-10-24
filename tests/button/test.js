function TestRenderer (canvas) {
	var self = this;
	Scene.prototype.constructor.call(this, {
		'resources':{
			'svg': ['button'],
			'root':'./',
		},
		'components': [
			{
				'path':'button/layer1/buy_in_do_buyin_button',
				'type':Button,
				'config': {
					states: {
						enabled: {group: 'buy_in_do_buyin_button_enabled', target:'rect13300'},
						disabled:{group: 'buy_in_do_buyin_button_disabled',target:'rect13393'},
						hovered: {group: 'buy_in_do_buyin_button_hover', target:'rect13333'},
						pressed: {group: 'buy_in_do_buyin_button_pressed', target:'rect13363'},
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
	var obj = el('button/layer1/buy_in_do_buyin_button');
	this.canvas.add(obj);
	obj.setState('enabled');
	console.log(obj.left);
	this.canvas.renderAll();
}

document.addEventListener('DOMContentLoaded', function () {
	new TestRenderer( new fabric.Canvas('testcanvas',{debug:false}));
	console.log('here we are');
}, false);
