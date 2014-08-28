class Placeable 
 onPlace: (coordPos) ->
   return false;
 onHover: (coordPos) ->
   return false;
 @graphic = null


class Item
 update: () ->


class Element extends Placeable extends Item
 onPlace:(coordPos) ->
  super false;
 upgrade: () ->
  @level++
  @graphic = allGraphic[this.type][this.level].clone()

 @type : null
 @level : 1


class Square
 @graphic = null
 @Item = null
 @isPlaceable = false;


class Hazard
 update: () -> 
  @graphic = allGraphic["Monster"][1].clone()
 @coordPos : null
 @coordDir : null
 @graphic : null


class Lightning extends Placeable
 onPlace: (coordPos) ->
  super false;
  #destroy Item

elementType = { wood :1.1 , stone :2.1}
hazardType = { monster : 1, water :2, lava :3, tornado :4}

#allGraphic made in .js file