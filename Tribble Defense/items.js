var Element, Hazard, Item, Lightning, Placeable, Square, elementType, hazardType,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Placeable = (function() {
  function Placeable() {}

  Placeable.prototype.onPlace = function(coordPos) {
    return false;
  };

  Placeable.prototype.onHover = function(coordPos) {
    return false;
  };

  Placeable.graphic = null;

  return Placeable;

})();

Item = (function() {
  function Item() {}

  Item.prototype.update = function() {};

  return Item;

})();

Element = (function(_super) {
  __extends(Element, _super);

  function Element() {
    return Element.__super__.constructor.apply(this, arguments);
  }

  Element.prototype.onPlace = function(coordPos) {
    return Element.__super__.onPlace.call(this, false);
  };

  Element.prototype.upgrade = function() {
    this.level++;
    this.graphic = allGraphic[this.type][this.level].clone();
  };

  Element.type = null;

  Element.level = 1;

  return Element;

})(__extends(Placeable, Item));

Square = (function() {
  function Square() {}

  Square.graphic = null;

  Square.Item = null;

  Square.isPlaceable = false;

  return Square;

})();

Hazard = (function() {
  function Hazard() {}

  Hazard.prototype.update = function() {
  this.graphic = allGraphic['Monster'][1].clone();
  };

  Hazard.coordPos = null;

  Hazard.coordDir = null;

  Hazard.graphic = null;

  return Hazard;

})();

Lightning = (function(_super) {
  __extends(Lightning, _super);

  function Lightning() {
    return Lightning.__super__.constructor.apply(this, arguments);
  }

  Lightning.prototype.onPlace = function(coordPos) {
    return Lightning.__super__.onPlace.call(this, false);
  };

  return Lightning;

})(Placeable);

var elementType = {
  wood: 1.1,
  stone: 2.1
};

var hazardType = {
  monster: 1,
  water: 2,
  lava: 3,
  tornado: 4
};

var allGraphic = [[1,2],[3,4],[5,6]];