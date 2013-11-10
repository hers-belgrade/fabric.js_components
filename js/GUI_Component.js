function GUI_Component (svgobj,config) {
	if (!svgobj) return;
	if (config.mouse_event_sink) fabric_helpers.find_path(svgobj,config.mouse_event_sink.path).block_mouse_propagation();
}


/**Factory
 *
 */
Create_GUI_Components = function (rootsvgobj,items) {
  for (var i in items) {
    var item = items[i];
    var f = (typeof item.type === 'function') ? item.type : GUI_Component;
    var el = rootsvgobj.getObjectByPath(item.path);
    if (el){
      f(el, item.config);
    }
  }
}
