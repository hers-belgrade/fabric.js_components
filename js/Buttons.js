function SVGStateableRenderer (struct, config) {
  if (!struct) return;

  var state_path_map = {};
  var full_state_conf = {};
  for (var i in config.states) {
    var path = config.states[i];
    state_path_map[i] = struct.getObjectById(path);
    full_state_conf[i] = {
      path:path,
      config:{'init_visible':true}
    }
  }

  //// path should be specified relative to this struct
  var local = {
    enable: function () {
      if (this.state === 'disabled') this.setState('enabled');
    },
    disable : function () {
      this.setState('disabled');
    },
    setState : function (state) {
      if (!state) return;
      var self = this;

      function do_show(obj) {
        //console.log('will show: ', obj.id, 'due to state', state, 'on object', self.id);
        obj.show();
      }
      if (this.state == state) return false;

      for (var s in this.state_path_map) {
        var obj = this.state_path_map[s];
        (s === state) ? do_show(obj) : obj.hide();
      }
      this.state = state;
      canvas.renderAll();
      return true;
    },
    state_path_map : state_path_map,
    state: config.init_state,
  }

  fabric.util.object.extend(struct, local);
  GUI_Component(struct, config);
  Create_GUI_Components(struct, full_state_conf);
  struct.setState(config.init_state);
}

function Button(struct, config) {
  var stateable_states = {};
  var target_map = {};
  var structid = struct.id;
  for (var i in config.states) {
    var t = config.states[i];
    var id = structid+'_'+i;
    var el = struct.getObjectById(id);
    if(!el){
      throw "Element "+id+" not found";
    }
    stateable_states[i] = id;
    target_map[i] = el.getObjectByPath(t.target);
  }

  //config.states = stateable_states;
  fabric.util.object.extend(struct, {button_target_map:target_map});
  SVGStateableRenderer( struct, {path:config.path, states:stateable_states});
  var self = struct;
  var require_hover = !fabric.isTouchSupported;
  var sm = struct.button_target_map;

  ///TODO: optimize this one ...
  this.setLabel = function (label) {
    for (var i in config.states) {
      var s = config.states[i];

      var g = fabric_helpers.find_path(this, s.group);
      var label_target = s.label;
      if (!label_target) continue;

      var txt = fabric_helpers.find_path(g, s.label);
      if (txt) txt.setText(label, s.tspan);
    }
  }

  sm.enabled.on ({
    'object:over': function () {
      if (self.state == 'disabled') return;
      self.setState('hovered');
    },
    'mouse:down': function () {
      if (self.state == 'disabled') return;
      if (require_hover) return;
      self.setState('pressed');
    }
  });
  sm.hovered.on ({
    'object:out': function () {
      if (self.state == 'disabled') return;
      self.setState('enabled');
    },
    'mouse:down': function () {
      if (this.state == 'disabled') return;
      self.setState('pressed');
    }
  });

  sm.pressed.on ({
    'mouse:up': function () {
      if (self.state == 'disabled') return;
      //console.log('mouse:up', self.id);
      var c = self.state;
      if (c === 'disabled') return self.setState('disabled');
      //mouse press allowed ==> hovered or enabled ... If anyone has to set any other state, let him set on click event
      self.setState( (require_hover) ? 'hovered' : 'enabled');
      if (c === 'pressed' ) self.fire('button:clicked');
    }
  });
  //console.log('will report ready for ',struct.id);
}


function BatchButtons (config, buttons) {
  var alias_map = {};
  var to_create = [];
  if (!buttons) buttons = Object.keys(config.elements);

  for (var i in buttons) {
    var b = config.elements[buttons[i]];
    if (!b) continue;
    alias_map[buttons[i]] = b.path;
    var ts = {
      type: Button,
      path: b.path,
      config: {
        states: b.states
      }
    }
    to_create.push (ts);
  }

  return {
    alias_map : alias_map,
    to_create : to_create,
  }
}

