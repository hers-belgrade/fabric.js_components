//DIALOG IS, actually, a combination of a content and different buttons and can be set onto a layer

function Dialog (layer, do_render) {
	Layer.prototype.constructor.call(this, layer, do_render);
}

Dialog.prototype = new Layer();
Dialog.prototype.constructor = Dialog;

function ModalDialog (layer, modal_one, do_render) {
	Dialog.prototype.constructor.call(this, layer, do_render);
	this.modal_one = (modal_one instanceof Layer) ? modal_one : (new Layer(modal_one));
	this.hide();
}

ModalDialog.prototype = new Dialog();
ModalDialog.prototype.constructor = ModalDialog;

ModalDialog.prototype.show = function () {
	this.modal_one.show();
	Dialog.prototype.show.call(this);
}

ModalDialog.prototype.hide = function () {
	this.modal_one.hide();
	Dialog.prototype.hide.call(this);
}

