function LoadAndCreate(config){
  fabric.loadResources(config.resources,function(loaded){
    for(var i in config.components){
      (function(root){
        root.loaded = loaded;
        root.element = function (path) {
          return fabric_helpers.find_path(root, path);
        };
        root.notify_ready = function () {ready.call(this)}
        Create_GUI_Components(root, this.canvas, config.components[i],
          function (elements) {
            this.notify_ready(elements);
          }
        );
      })(loaded[i]);
    }
  },this);
}
