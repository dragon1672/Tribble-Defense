var Element, Hazard, Item, Lightning, Placeable, Square;
  var _hasProp = {}.hasOwnProperty;
  var _extends = function(child, parent) { for (var key in parent) { if (_hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

//--------------------------------------------------------------------------


Placeable = (function() {
  function Placeable() {}

  Placeable.prototype.onPlace = function(coordPos) {
    return false;
  };

  Placeable.prototype.onHover = function(coordPos) {
    return false;
  };

  this.graphic = null;

  return Placeable;

})();

//--------------------------------------------------------------------------


Element = (function(_super) {
  _extends(Element, _super);

  function Element() {
    return Element.__super__.constructor.apply(this, arguments);
  }

  Element.prototype.onPlace = function(coordPos) {
    return Element.__super__.onPlace.call(this, false);
  };

  this.type = null;

  this.level = null;

  return Element;

})(Placeable);

//--------------------------------------------------------------------------


Item = (function() {
  function Item() {}

  this.graphic = null;

  Item.prototype.update = function() {};

  return Item;

})();

//--------------------------------------------------------------------------


Square = (function() {
  function Square() {}

  this.graphic = null;

  this.Item = null;

  this.isPlaceable = false;

  return Square;

})();

//--------------------------------------------------------------------------


Hazard = (function() {
  function Hazard() {}

  this.coordPos = null;

  this.coordDir = null;

  this.force = null;

  this.graphic = null;

  return Hazard;

})();

//--------------------------------------------------------------------------


Lightning = (function(_super) {
  _extends(Lightning, _super);

  function Lightning() {
    return Lightning.__super__.constructor.apply(this, arguments);
  }

  Lightning.prototype.onPlace = function(coordPos) {
    return Lightning.__super__.onPlace.call(this, false);
  };

  return Lightning;

})(Placeable);

