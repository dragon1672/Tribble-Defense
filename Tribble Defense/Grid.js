function Grid(cells, pos, dim){
    this.dim = new Coord(dim.x,dim.y);
    console.log("dim" + this.dim.x + ", " + this.dim.y);
    this.position = new Coord(pos.x,pos.y);
    console.log("pos" + this.position.x + ", " + this.position.y);
    this.cells = new Coord(cells.y,cells.y);
    console.log("cells" + this.cells.x + ", " + this.cells.y);
    this.squares = [];
    for(var i=0; i<cells.x; i++){
        this.squares[i] = [];
        for(var j=0; j<cells.y; j++){
            this.squares[i][j] = new Square(0);
            this.squares[i][j].graphic.x = i*(dim.x/cells.x)+pos.x;
            this.squares[i][j].graphic.y = j*(dim.y/cells.y)+pos.y;
            this.squares[i][j].graphic.width = dim.x/cells.x;
            this.squares[i][j].graphic.height = dim.y/cells.y;
            this.squares[i][j].isPlaceable = true;
            stage.addChild(this.squares[i][j].graphic);
        }
    }
    
    this.highlight = function(x,y) {
        
    };
    
    this.select = function(x,y){
        
        var xCoord = Math.floor((x-this.position.x)/this.dim.x*10);
        var yCoord = Math.floor((y-this.position.y)/this.dim.y*10);
        console.log(xCoord + ", " + yCoord);
        
        if(this.squares[xCoord][yCoord].isPlaceable&&this.squares[xCoord][yCoord].Item===null){
            this.squares[xCoord][yCoord].Item = new Element();
            this.squares[xCoord][yCoord].Item.type = 0;
            this.squares[xCoord][yCoord].Item.level = 1;
            this.squares[xCoord][yCoord].Item.graphic = allGraphic[0][1].clone();
            this.squares[xCoord][yCoord].Item.graphic.x = xCoord*(this.dim.x/this.cells.x)+this.pos.x;
            this.squares[xCoord][yCoord].Item.graphic.y = yCoord*(this.dim.y/this.cells.y)+this.pos.y;
            this.squares[xCoord][yCoord].Item.graphic.width = this.dim.x/this.cells.x;
            this.squares[xCoord][yCoord].Item.graphic.height = this.dim.y/this.cells.y;
            stage.addChild(this.squares[xCoord][yCoord].Item.graphic);
            console.log("added?");
            
        }
        else{return false;}
        while(this.compare(xCoord,yCoord,1,0,this.squares[xCoord][yCoord].Item.level)){
            this.squares[xCoord][yCoord].Item.upgrade();
        }
        
        return true;
    };
    
    this.compare = function(x,y,depth,direction,val){
        if(depth==3){return false;}
        var match=0;
        if(y>0&&direction!=3&&this.squares[x][y].Item.level==this.squares[x][y-1].Item.level){
            
            if(depth==2||match!==0){
                stage.removeChild(this.squares[x][y-1].Item.graphic);
                this.squares[x][y-1].Item=null;
                if(match===0){
                    stage.removeChild(this.squares[x][y].Item.graphic);
                    this.squares[x][y].Item=null;
                }
                else if(match==2){
                    stage.removeChild(this.squares[x+1][y].Item.graphic);
                    this.squares[x+1][y].Item=null;
                }
                else if(match==3){
                    stage.removeChild(this.squares[x][y+1].Item.graphic);
                    this.squares[x][y+1].Item=null;
                }
                else if(match==4){
                    stage.removeChild(this.squares[x-1][y].Item.graphic);
                    this.squares[x-1][y].Item=null;
                }
                return true;
            }
            match = 1;
            if(depth<3&&this.compare(x,y-1,depth+1,1,val)){
                return true;   
            }
        }
        if(x<this.size&&direction!=4&&this.squares[x][y].Item.level==this.squares[x+1][y].Item.level){
            
            if(depth==2||match!==0){
                stage.removeChild(this.squares[x+1][y].Item.graphic);
                this.squares[x+1][y].Item=null;
                if(match===0){
                    stage.removeChild(this.squares[x][y].Item.graphic);
                    this.squares[x][y].Item=null;
                }
                else if(match==1){
                    stage.removeChild(this.squares[x][y-1].Item.graphic);
                    this.squares[x][y-1].Item=null;
                }
                else if(match==3){
                    stage.removeChild(this.squares[x][y+1].Item.graphic);
                    this.squares[x][y+1].Item=null;
                }
                else if(match==4){
                    stage.removeChild(this.squares[x-1][y].Item.graphic);
                    this.squares[x-1][y].Item=null;
                }
                return true;
            }
            match = 2;
            if(depth<3&&this.compare(x+1,y,depth+1,2,val)){
                return true;   
            }
        }
        if(y<this.size&&direction!=1&&this.squares[x][y].Item.level==this.squares[x][y+1].Item.level){
            
            if(depth==2||match!==0){
                stage.removeChild(this.squares[x][y+1].Item.graphic);
                this.squares[x][y+1].Item=null;
                if(match===0){
                    stage.removeChild(this.squares[x][y].Item.graphic);
                    this.squares[x][y].Item=null;
                }
                else if(match==1){
                    stage.removeChild(this.squares[x][y-1].Item.graphic);
                    this.squares[x][y-1].Item=null;
                }
                else if(match==2){
                    stage.removeChild(this.squares[x+1][y].Item.graphic);
                    this.squares[x+1][y].Item=null;
                }
                else if(match==4){
                    stage.removeChild(this.squares[x-1][y].Item.graphic);
                    this.squares[x-1][y].Item=null;
                }
                return true;
            }
            match = 3;
            if(depth<3&&this.compare(x,y+1,depth+1,3,val)){
                return true;   
            }
        }
        if(x>0&&direction!=2&&this.squares[x][y].Item.level==this.squares[x-1][y].Item.level){
            
            if(depth==2||match!==0){
                stage.removeChild(this.squares[x-1][y].Item.graphic);
                this.squares[x-1][y].Item=null;
                if(match===0){
                    stage.removeChild(this.squares[x][y].Item.graphic);
                    this.squares[x][y].Item=null;
                }
                else if(match==1){
                    stage.removeChild(this.squares[x][y-1].Item.graphic);
                    this.squares[x-1][y].Item=null;
                }
                else if(match==2){
                    stage.removeChild(this.squares[x+1][y].Item.graphic);
                    this.squares[x+1][y].Item=null;
                }
                else if(match==3){
                    stage.removeChild(this.squares[x][y+1].Item.graphic);
                    this.squares[x][y+1].Item=null;
                }
                return true;
            }
            match = 4;
            if(depth<3&&this.compare(x-1,y,depth+1,4,val)){
                return true;   
            }
        }
        return false;
    };
    
}