function GUI_Component (struct, do_render) {
	if (!arguments.length) return;
	fabric.util.object.extend(this, fabric.Observable);
	this.type = function () {return struct.component;}

	this.elements = fabric_helpers.find_component(struct, this.type(), this.mandatoryElements());
	var me = this.mandatoryElements();
	for (var i in me) {
		if (!this.elements[me[i]]) throw "Missing "+me[i];
	}
	this.render = function ()  { functions.safe_call(do_render); }
	this.obj = struct;

	this.process_arguments();
}

GUI_Component.prototype.mandatoryElements = function () {return undefined;}

GUI_Component.prototype.process_arguments = function () {
	this.component_arguments = fabric.util.object.extend({
		init_visible:true
	}, this.component_arguments)
	var args = this.component_arguments;

	///do actual processing ...
	(args.init_visible) ? this.show() : this.hide();
}

GUI_Component.prototype.show = function () {
	GUI_Component.show(this.layer, this.render);
}

GUI_Component.prototype.hide = function () {
	GUI_Component.hide(this.layer, this.render);
}

GUI_Component.show = function (l, do_render) {
	l && (l.set({'opacity':1, 'display':'inline'}) || true) && functions.safe_call(do_render);
}

GUI_Component.hide = function (l, do_render) {
	l && (l.set({'opacity':0, 'display':'none'}) || true) && functions.safe_call(do_render);
}
//help me with layers ... show me, hide me, find layers within given structure ...
//VERY VERY POSSIBLE THIS WILL BE GONE .... layer is jus a group ....
function Layer (layer, do_render) {
	if (!arguments.length) return;
	GUI_Component.prototype.constructor.call(this, layer, do_render);
}
Layer.prototype = new GUI_Component();
Layer.prototype.constructor = Layer;

Layer.hideSubLayers = function (l,me_included, do_render) {
	me_included && Layer.hide(l);
	Layer.getLayers(l).forEach(function(v) {
		Layer.hide(v);
	});
	functions.safe_call(do_render);
}

Layer.getLayers = function (obj) {
	var ret = [];
	for (var i in obj._objects) {
		var o = obj._objects[i];
		if (o.inkscapeGroupMode !== 'layer') continue;
		ret.push (o);
	}
	return ret;
}

function Screen (layer, do_render) {
	Layer.prototype.constructor.call(this, layer, do_render);
	var args = layer.component_arguments;
	//TODO: how to stop event propagating ?
}

Screen.prototype = new Layer();
Screen.prototype.constructor = Screen;
//DIALOG IS, actually, a combination of a content and different buttons and can be set onto a layer

function Dialog (layer, do_render) {
	if (!arguments.length) return;
	//Dialog is event transparent ==> implementation of a Layer
	Layer.prototype.constructor.call(this, layer, do_render);
}

Dialog.prototype = new Layer();
Dialog.prototype.constructor = Dialog;

function ModalDialog (layer, background_screen, do_render) {
	if (arguments.length === 0) return;
	Dialog.prototype.constructor.call(this, layer, do_render);
	this.background_screen = (background_screen instanceof Screen) ? background_screen: (new Screen(background_screen));
	this.hide();
}

ModalDialog.prototype = new Dialog();
ModalDialog.prototype.constructor = ModalDialog;

ModalDialog.prototype.show = function () {
	this.background_screen.show();
	Dialog.prototype.show.call(this);
}

ModalDialog.prototype.hide = function () {
	this.background_screen.hide();
	Dialog.prototype.hide.call(this);
}

