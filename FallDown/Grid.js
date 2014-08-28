function Grid(size){
    this.size = size;
    this.squares = [];
    for(var i=0; i<size; i++){
        this.squares[i] = [];
        for(var j=0; j<size; j++){
            this.squares[i][j] = new Square();
            this.squares[i][j].graphic.x = i*(780/size);
            this.squares[i][j].graphic.y = j*(540/size);
            stage.addChild(this.squares[i][j]);
        }
    }
    
    this.highlight = function(xCoord,yCoord) {
        
    };
    
    this.select = function(xCoord,yCoord){
        if(this.squares[i][j].isPlaceable&&this.squares[xCoord][yCoord].Item.level===0){
            this.squares[xCoord][yCoord].Item.level++;
        }
        else{return false;}
        while(this.compare(xCoord,yCoord,1,0,this.squares[xCoord][yCoord].Item.level)){
            this.squares[xCoord][yCoord].Item.level++;
        }
        
        return true;
    };
    
    this.compare = function(x,y,depth,direction,val){
        if(depth==3){return false;}
        var match=0;
        if(y>0&&direction!=3&&this.squares[x][y].Item.level==this.squares[x][y-1].Item.level){
            
            if(depth==2||match!==0){
                this.squares[x][y-1].Item.level=0;
                if(match===0){this.squares[x][y].Item.level=0;}
                else if(match==2){this.squares[x+1][y].Item.level=0;}
                else if(match==3){this.squares[x][y+1].Item.level=0;}
                else if(match==4){this.squares[x-1][y].Item.level=0;}
                return true;
            }
            match = 1;
            if(depth<3&&this.compare(x,y-1,depth+1,1,val)){
                return true;   
            }
        }
        if(x<this.size&&direction!=4&&this.squares[x][y].Item.level==this.squares[x+1][y].Item.level){
            
            if(depth==2||match!==0){
                this.squares[x+1][y].Item.level=0;
                if(match===0){this.squares[x][y].Item.level=0;}
                else if(match==1){this.squares[x][y-1].Item.level=0;}
                else if(match==3){this.squares[x][y+1].Item.level=0;}
                else if(match==4){this.squares[x-1][y].Item.level=0;}
                return true;
            }
            match = 2;
            if(depth<3&&this.compare(x+1,y,depth+1,2,val)){
                return true;   
            }
        }
        if(y<this.size&&direction!=1&&this.squares[x][y].Item.level==this.squares[x][y+1].Item.level){
            
            if(depth==2||match!==0){
                this.squares[x][y+1].Item.level=0;
                if(match===0){this.squares[x][y].Item.level=0;}
                else if(match==1){this.squares[x][y-1].Item.level=0;}
                else if(match==2){this.squares[x+1][y].Item.level=0;}
                else if(match==4){this.squares[x-1][y].Item.level=0;}
                return true;
            }
            match = 3;
            if(depth<3&&this.compare(x,y+1,depth+1,3,val)){
                return true;   
            }
        }
        if(x>0&&direction!=2&&this.squares[x][y].Item.level==this.squares[x-1][y].Item.level){
            
            if(depth==2||match!==0){
                this.squares[x-1][y].Item.level=0;
                if(match===0){this.squares[x][y].Item.level=0;}
                else if(match==1){this.squares[x][y-1].Item.level=0;}
                else if(match==2){this.squares[x+1][y].Item.level=0;}
                else if(match==3){this.squares[x][y+1].Item.level=0;}
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