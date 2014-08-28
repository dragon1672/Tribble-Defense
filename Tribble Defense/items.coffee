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
 @type : null
 @level : 1


class Square
 @graphic = null
 @Item = null
 @isPlaceable = false;


class Hazard
 @coordPos : null
 @coordDir : null
 @graphic : null


class Lightning extends Placeable
 onPlace: (coordPos) ->
  super false;
  #destroy Item
