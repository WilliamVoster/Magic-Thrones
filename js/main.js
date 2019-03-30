//* Connect UI
const canvasGfx = document.getElementById("canvasGfx");
const canvasGfxBackground = document.getElementById("canvasGfxBackground");
const ctx = canvasGfx.getContext("2d");
const ctxBG = canvasGfxBackground.getContext("2d");
const HUD = document.getElementById("HUD");
const pCountFrames = document.getElementById("countFrames");


//| Globals
let loadedOnce = false;

const canvW = 1600;
const canvH = 900;
const marginW = 8; //32/4
const marginH = 8;
const border = 10; //in pixels
const gravity = 0.5;//0.25;
const playerScale = 2/3;
let shopMenu = false;
let numHearts;
let countFrames = 0;
let entities = [];
window.shots = []; 
const spriteInfo = { //sx, sy, swidth, sheight
    stillR: [185,0,35,170],
    stillL: [150,0,35,170],
    jumpR: [75,0,75,108],
    jumpL: [0,0,75,108],
    walk1R: [286,0,66,170],
    walk2R: [425,0,73,170],
    walk1L: [220,0,66,170],
    walk2L: [352,0,73,170],
};

//* Canvas & HUD setup 
{
    let windowW = window.innerWidth;//outerWidth;
    let windowH = window.innerHeight;//outerHeight;
    
    // let canvW = 1600;//canvH * (16/9);//windowW;   //| width = 16/9 of height
    // let canvH = 900;//windowH;
    
    ctx.font = "150px Helvetica";
    
    canvasGfx.width  = canvW;
    canvasGfx.height = canvH;

    canvasGfxBackground.width = canvW ;
    canvasGfxBackground.height = canvH;

    HUD.style.width = canvW + "px";
    HUD.style.height = canvH + "px";
    HUD.style.visibility = "hidden";
}

//? Functions
const doesIntersect = (a,b) => {
    if (a.x+a.w>=b.x && a.x<=b.x+b.w && a.y+a.h>=b.y && a.y<=b.y+b.h) {
        return true;
    }
    else {
        return false;
    }
}

const randIntMinMax = (min, max) => Math.floor(Math.random() * (max - min) + min);

const showHUD = (title, type, [opt1, opt2, opt3, opt4, opt5, opt6]) => {
    //Eks: showHUD("testss", "Start game", "Tutorial & Controlls", "Exit");
    //^^if empty, aka: showHUD(); ==> visibility hidden && reset hud

    if(title == undefined){
        HUD.style.visibility = "hidden";

    }else if(title != undefined){
        const menuTitle = document.getElementById("menuTitle");
        const menu = document.getElementById("menu");
        menu.innerHTML = ""; //clear list b4 filling
        HUD.classList = ""; //clear classlist
        if(type == 0){HUD.classList.add("gameOver")}
        if(type == 1){HUD.classList.add("playerData"), title = ""}
    
        let list = [];
        let options = [opt1, opt2, opt3, opt4, opt5, opt6];
    
        for(i in options){
            if(options[i] != undefined){
                //console.log(options[i]);
                let node = document.createElement("li");
                node.innerHTML = String(options[i]);
                list.push(node);
            }
        }
    
        menuTitle.innerHTML = title;
        list.forEach(opt => menu.appendChild(opt));
        HUD.style.visibility = "visible";
    }
}


const parseURLParams = url => {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

const playerHitbox = () => {
    let playerY = mainCharacter.y;
    let playerX = mainCharacter.x;
    if(mainCharacter.faceDirection){playerX += mainCharacter.w}
    let playerH = mainCharacter.h;
    let playerW = mainCharacter.w;
    let faceDir = mainCharacter.faceDirection;
    let data = level.screens[mainCharacter.screenID].data;
    let OOB = false; //OutOfBounds
    //let checkNums = [];
    
    playerX /= (level.tileW * 2);
    playerX = Math.floor(playerX);
    playerY /= (level.tileH * 2);
    playerY = Math.floor(playerY);

    if(playerX < 0){playerX = 0}
    if(playerX >= 25){playerX = 24}
    if(playerY < 0){playerY = 0}
    if(playerY >= 14){playerY = 13}

    if(playerY + 2 > 13 || playerY < 0 ){OOB = true}
    
    //* Viser hvilke hitbokser vi skal sjekke
    // for (let i = -1; i <= 3-1; i++) { //5 tiles i høyden (3 + 1 + 1) (playerH + margene)
    //     for (let j = -1; j <= 1; j++) { //3 tiles i bredden (1 + 1 + 1) (playerW + margene)

    //         let pYinData = playerY + i;
    //         let pXinData = playerX + j;
    //         // if(playerY + i >= 14){playerY -= 1} //index [13] e siste ytre array, -1 for å unngå error
    //         // if(playerY + i < 0){playerY = 0 -i}
    //         // if(playerX + j >= 25){playerX -= 1}
    //         // if(playerX + j < 0){playerX = 0 -j}

    //         if(pYinData < 0){pYinData = 0}
    //         if(pYinData > 13){pYinData = 13}
    //         if(pXinData < 0){pXinData = 0}
    //         if(pXinData > 24){pXinData = 24}

    //         //console.log(playerY + i ,playerX + j);
    //         let tileVal = data[pYinData][pXinData];
            
    //         //| Draw tiles to scan
    //         ctx.fillStyle = "#f003";
    //         ctx.fillRect(
    //             (playerX + j) * (level.tileW * 2),
    //             (playerY + i) * (level.tileH * 2),
    //             level.tileW * 2,
    //             level.tileH * 2
    //         );
    //         ctx.fillStyle = "#0f03";
    //         ctx.fillRect(
    //             (playerX) * (level.tileW * 2),
    //             (playerY+2) * (level.tileH * 2),
    //             level.tileW * 2,
    //             level.tileH * 2
    //         );
    //         ctx.fillStyle = "#000";
    //         ctx.font = "30px Georgia";
    //         ctx.fillText(
    //             tileVal,
    //             (playerX + j) * (level.tileW * 2) + 16,
    //             (playerY + i) * (level.tileH * 2) + 32
    //         ); 

    //     }
    // }

    //| Check for hitboxes
    //if turn on spot w face out of platform fall down -- fiX!

    //if face right ==> add playerW to mainchar
    let xPosInTile = mainCharacter.x - (playerX * level.tileW * 2);
    let yPosInTile = mainCharacter.y - (playerY * level.tileH * 2); //px to the current line over player
    if(faceDir){xPosInTile += playerW;}
    //console.log(playerX, xPosInTile, playerY, yPosInTile);
    let returnVal = {x: 0, y: 0, ladder: false, stopJump: false, OOB: OOB}

    //| check if Out Of Bounds
    //if(OOB){return returnVal}

    //*Y-dir
    if(!OOB){
        if( 
            (
                //check tile behind if between 2 tiles (facing right)
                xPosInTile <= playerW && faceDir &&
                data[playerY+2][playerX-1] > 7*4 &&
                data[playerY+2][playerX-1] <= 7*8
            )||(
                //check tile behind if between 2 tiles (facing left)
                level.tileW * 2 - xPosInTile <= playerW && !faceDir &&
                data[playerY+2][playerX+1] > 7*4 &&
                data[playerY+2][playerX+1] <= 7*8
            )||(
                //check tile beneath
                data[playerY+2][playerX] > 7*4 &&
                data[playerY+2][playerX] <= 7*8
            )
        ){
            //console.log(data[playerY + 2][playerX]);
            returnVal.y = playerY * level.tileH * 2;
        }
    }
    if( //hitbox above:::
        (
            //check tile behind if between 2 tiles (facing right) && close to tile above
            playerY > 0 && //fix for error when above map
            yPosInTile <= 2 &&
            xPosInTile <= playerW && faceDir &&
            data[playerY-1][playerX-1] > 7*5 &&
            data[playerY-1][playerX-1] <= 7*8
        )||(
            //check tile behind if between 2 tiles (facing left) && close to tile above
            playerY > 0 && //fix for error when above map
            yPosInTile <= 2 &&
            level.tileW * 2 - xPosInTile <= playerW && !faceDir &&
            data[playerY-1][playerX+1] > 7*5 &&
            data[playerY-1][playerX+1] <= 7*8
        )||(
            //check if close to tile above
            playerY > 0 && //fix for error when above map
            yPosInTile <= 2 &&
            data[playerY-1][playerX] > 7*5 &&
            data[playerY-1][playerX] <= 7*8
        )
    ){
        //hit head
        //console.log("hit ur head!");
        //console.log(playerY, yPosInTile);
        returnVal.y = -1;
    }
    
    //| if tile just above player => stop jumping
    if(
        (
            //check tile behind if between 2 tiles (facing right) && close to tile above
            playerY > 0 && //fix for error when above map
            yPosInTile <= 10 &&
            xPosInTile <= playerW && faceDir &&
            data[playerY-1][playerX-1] > 7*5 &&
            data[playerY-1][playerX-1] <= 7*8
        )||(
            //check tile behind if between 2 tiles (facing left) && close to tile above
            playerY > 0 && //fix for error when above map
            yPosInTile <= 10 &&
            level.tileW * 2 - xPosInTile <= playerW && !faceDir &&
            data[playerY-1][playerX+1] > 7*5 &&
            data[playerY-1][playerX+1] <= 7*8
        )||(
            //check if close to tile above
            playerY > 0 && //fix for error when above map
            yPosInTile <= 10 &&
            data[playerY-1][playerX] > 7*5 &&
            data[playerY-1][playerX] <= 7*8
        )
    ){
        returnVal.stopJump = true;
    }
    
    //*X-dir
    if(
        //if player more left than the tile to the left of player
        ( //check legs height
            xPosInTile <= 0+8 &&
            data[playerY+1][playerX-1] > 7*5 && 
            data[playerY+1][playerX-1] <= 7*8
        )||( //check head height
            xPosInTile <= 0+8 &&
            data[playerY][playerX-1] > 7*5 && 
            data[playerY][playerX-1] <= 7*8
        )||(
            playerX <= 0 &&
            xPosInTile <= 0+5
        )
    ){
        returnVal.x = -1;
        // console.log("left");
    }
    if(
        //if player more right than the tile to the right of player
        ( //check legs height
            xPosInTile >= 63-5 &&
            data[playerY+1][playerX+1] > 7*5 && 
            data[playerY+1][playerX+1] <= 7*8
        )||( //check head height
            xPosInTile >= 63-5 &&
            data[playerY][playerX+1] > 7*5 && 
            data[playerY][playerX+1] <= 7*8
        )||(
            playerX >= 24 &&
            xPosInTile >= 63-5
        )
    ){
        returnVal.x = +1;
        // console.log("right");
    }

    //*ladder-val
    if(
        ( //check leg height
            data[playerY+1][playerX] >  7*4 && 
            data[playerY+1][playerX] <= 7*5
        )||( //check head height
            data[playerY][playerX] >  7*4 && 
            data[playerY][playerX] <= 7*5
        )||( !OOB &&//check under feet
            data[playerY+2][playerX] >  7*4 && 
            data[playerY+2][playerX] <= 7*5
        )
    ){
        //console.log("LADDER!!!");
        returnVal.ladder = true;

        let currFinishPos = toObjURL.screenCompletePos[mainCharacter.screenID];
        // console.log(currFinishPos, playerX, playerY);
        if(playerX >= currFinishPos[0] && playerY <= currFinishPos[1]){
            console.log("Winner!");
            mainCharacter.score += 1000;
            newScreen(mainCharacter.screenID +1);
        }
    }
    //console.log(returnVal);
    return returnVal;


    //console.log(playerX, playerY);
    //console.log(levelX, levelY);
}

const createEnemies = () => {
    entities = [];
    toObjURL.enemyPosArr[mainCharacter.screenID].bat.forEach(arr => {
        entities.push(new batEnemy(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], imgBat));
    });
    toObjURL.enemyPosArr[mainCharacter.screenID].mark.forEach(arr => {
        entities.push(new markusEnemy(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], imgMarkusR));
    });
}

const newScreen = currId => {

    if(currId > 3 || currId < 0){return}

    mainCharacter.screenID = currId;

    let screenSpawnPos = toObjURL.screenSpawnPos[mainCharacter.screenID];
    mainCharacter.x = screenSpawnPos[0] * level.tileW * 2;
    mainCharacter.y = screenSpawnPos[1] * level.tileH * 2;

    ctxBG.clearRect(0, 0, canvW, canvH);
    //level.draw(currId);
    level.screens[currId].draw()
    createEnemies();
}

//! keyListener
{
let toggleIntervalR = false;
let toggleIntervalL = false;
let toggleIntervalU = false;
let toggleIntervalD = false;
let toggleIntervalSpace = false; //aka is there an interval?
//window.intervalShootHasRun = false;

const intervalRight = () => {
    // console.log("Right");
    mainCharacter.walktime++;
    if (Math.floor(mainCharacter.walktime/60) % 2 == 0) {
        mainCharacter.spriteState = "walk1R";
    } else {
        mainCharacter.spriteState = "walk2R"; 
    }
    mainCharacter.update([1, 0]); // ++ in x-direction
}
const intervalLeft = () => {
    // console.log("Left");
    mainCharacter.walktime++;
    if (Math.floor(mainCharacter.walktime/60) % 2 == 0) {
        mainCharacter.spriteState = "walk1L";
    } else { 
        mainCharacter.spriteState = "walk2L"; 
    }
    mainCharacter.update([-1, 0]); // -- in x-direction
}
const intervalUp = () => {
    // console.log("Up");
    mainCharacter.update([0, -1]); // -- in y-direction
}
const intervalDown = () => {
    // console.log("Down");
    mainCharacter.update([0, 1]); // ++ in y-direction
}

window.reloadInterval = () => {
    if(!mainCharacter.reload && mainCharacter.reloadTimer>0) {
        mainCharacter.reloadTimer--;
    }
    else {
        mainCharacter.reload = true;
        mainCharacter.reloadTimer = mainCharacter.reloadTime;   
    }
}

const intervalShoot = () => {
    if (mainCharacter.reload) {
        mainCharacter.shoot();
        mainCharacter.reload = false;  
    }
}

const keyEventDownHandler = e => {
    //console.log(e.keyCode); // R L U D : 68&39 65&37 87&38 83&40

    if((e.keyCode == 68 || e.keyCode == 39) && !toggleIntervalR){
        mainCharacter.faceDirection = true;
        mainCharacter.walktime = 0;
        window.keyIntervalRight = setInterval(intervalRight, mainCharacter.updateSpeed);
        toggleIntervalR = !toggleIntervalR;

    } else if((e.keyCode == 65 || e.keyCode == 37) && !toggleIntervalL){
        mainCharacter.faceDirection = false;
        mainCharacter.walktime = 0;
        window.keyIntervalLeft = setInterval(intervalLeft, mainCharacter.updateSpeed);
        toggleIntervalL = !toggleIntervalL;
    }
    if((e.keyCode == 32) && !toggleIntervalU){

        //set direction = spriteState
        mainCharacter.faceDirection ? mainCharacter.spriteState = "jumpR" : mainCharacter.spriteState = "jumpL";

        window.keyIntervalUp = setInterval(intervalUp, mainCharacter.updateSpeed);
        toggleIntervalU = !toggleIntervalU;

    } else if((e.keyCode == 83 || e.keyCode == 40) && !toggleIntervalD){
        window.keyIntervalDown = setInterval(intervalDown, mainCharacter.updateSpeed);
        toggleIntervalD = !toggleIntervalD;
    }

    if(e.keyCode == 13){ //enter

        shopMenu = !shopMenu;
        //if already HUD ==> hide else draw dummy-HUD
        if(shopMenu){showHUD("Shop", 0, ["Coming soon...?", "Refill hearts", "Exit"])};

    }

    if(e.keyCode == 16 && !toggleIntervalSpace){ //space
        window.actionIntervalReload = setInterval(intervalShoot, 10); 
        toggleIntervalSpace = !toggleIntervalSpace;
    }
}
const keyEventUpHandler = e => {
    //console.log(e.keyCode);
    if((e.keyCode == 68 || e.keyCode == 39) && toggleIntervalR){
        mainCharacter.walktime = 0;
        clearInterval(window.keyIntervalRight);
        toggleIntervalR = !toggleIntervalR;

    }else if((e.keyCode == 65 || e.keyCode == 37) && toggleIntervalL){
        mainCharacter.walktime = 0;
        clearInterval(window.keyIntervalLeft);
        toggleIntervalL = !toggleIntervalL;
    }
    if((e.keyCode == 32) && toggleIntervalU){
        clearInterval(window.keyIntervalUp);
        toggleIntervalU = !toggleIntervalU;

    } else if((e.keyCode == 83 || e.keyCode == 40) && toggleIntervalD){
        clearInterval(window.keyIntervalDown);
        toggleIntervalD = !toggleIntervalD;
    }

    if(e.keyCode == 16 && toggleIntervalSpace){
        clearInterval(window.actionIntervalReload);
        //  window.intervalShootHasRun = false;
        toggleIntervalSpace = !toggleIntervalSpace;
    }
}
document.addEventListener("keydown", keyEventDownHandler);
document.addEventListener("keyup", keyEventUpHandler);
}

class Entity{
    constructor(x, y, w, h, gravityBoolean){
        this.x = x,
        this.y = y,
        this.w = w,
        this.h = h,
        this.gravityBoolean = gravityBoolean;
        if(this.gravityBoolean){this.velY = 0, this.velX = 0, this.airBool = false;}
    }

    draw(drawRectBoolean){

        //| if gravity is on -> fall every frame
        if(this.gravityBoolean){

            // if(this.y + this.h > canvH - border){ 
            //     this.velY = 0, this.airBool = false;
            //     this.y = canvH - border - this.h;
    
            // }else if(this.y + this.h < canvH - border){
                this.velY = Math.floor(this.velY * 100) / 100; //grov avrunding
                //console.log(this.velY);

                this.velY += -gravity;
                //this.gravitySpeed += this.velY;
            //}

            //this.y += - this.velY; //negative because this.y++ => down on canvas (positive y-axis => downwards)
            this.y += -this.velY//this.gravitySpeed;
            this.x += this.velX; //positive because positive x-axis => to the right on canvas
            this.velX = 0;
        }

        if(drawRectBoolean == undefined || drawRectBoolean){
            ctx.fillRect(
                this.x,
                this.y,
                this.w,
                this.h
            )
        }
        
    }
}

class Platform extends Entity{
    constructor(x, y, w, h, gravityBoolean, texture){
        super(x, y, w, h, gravityBoolean)
        this.texture = texture
    }
    //sjekk hvis overlapp, lag ny hvis
    
}

class Screen{
    constructor(posArr, data, w, h, tileW, tileH){ //posArr: [1, 1] && data: [1, 1, 1, 1, 2, 1, 1, ...]
        this.position = {
            row: posArr[0],
            col: posArr[1]
        }
        this.data = data;
        this.w = w;
        this.h = h;
        this.tileW = tileW;
        this.tileH = tileH;

        //generating and filling 2d-array
        let col = new Array(this.h || 14); //outer array
        for (let i = 0; i < col.length; i++) {
            let row = new Array(this.w || 25); //one of many inner arrays
            for (let j = 0; j < row.length; j++) {
                row[j] = this.data[ i * row.length + j ];
            }
            col[i] = row;
        }
        //console.log(col);
        this.data = col; //overwrite data, previously stored twice at this.data2DArray
    }

    draw(){
        for (let i = 0; i < this.data.length; i++) { //outer arr

            for (let j = 0; j < this.data[i].length; j++) { //inner arr
                
                // ctx.fillStyle = "#f0f";
                // ctx.font = "20px Georgia";
                // ctx.fillText(
                //     this.data[i][j],
                //     this.tileW * 2*j + 10,
                //     this.tileH * 2*i + 30
                // );

                //console.log(this.data[i][j], this.data[i][0]);
                //console.log(i, j, this.tileW, this.tileH);
                //console.log(imgSpriteSheet);
                //| draw screen every frame
                ctxBG.drawImage(
                    imgSpriteSheet,
                    this.tileW * ((this.data[i][j]-1) % 7) -0, 
                    this.tileH * Math.floor((this.data[i][j]-1) / 7) -0,
                    this.tileW,
                    this.tileH,
                    this.tileW * 2 * j,// + (marginW),
                    this.tileH * 2 * i,// + (marginH),
                    this.tileW * 2,
                    this.tileH * 2
                );

                //ctxBG.fillRect(10, 10, 1000, 1000);

                //?legg bare te hvis type=air/move through (fra 7 => 7*3)
                //Border på alle rutene
                ctxBG.strokeStyle = "#000";// "#A0E0FC";//"#0005";
                ctxBG.lineWidth = "0.2";
                ctxBG.strokeRect(
                    this.tileW * 2 * j,// + (marginW),
                    this.tileH * 2 * i,// + (marginH),
                    this.tileW * 2,
                    this.tileH * 2
                );
                
            }
            
        }
    }

}

class gameGUI {
    constructor(x, y, w, h, text, guiVar){
        this.x = x,
        this.y = y,
        this.w = w,
        this.h = h,
        this.text = text,
        this.guiVar = guiVar
    }

    draw(){
        ctx.fillStyle = "white";
        ctx.fillRect(
            this.x,
            this.y,
            this.w,
            this.h
        )
        ctx.fillStyle = "black";
        ctx.fillText(
            this.text,
            this.x + 10,
            this.y + 35,
            this.w,
            this.h
        )
    }
}

class Level{

    //numScreens == alltid lik 4
    //postitions in array format. Ex: [1, 2] (row = 1 & col = 2)
    //positions: [[1, 1], [1, 2], [2, 2], [2, 3]]
    //screenData: [[dataforScreen0], [dataforScreen0], [dataforScreen0], [dataforScreen0]]
    constructor(positions, screenData, w, h, tileW, tileH){
        this.w = w;
        this.h = h;
        this.tileW = tileW;
        this.tileH = tileH;
        this.screens = new Array(4);

        //fill arr with screen objects
        for(let i = 0; i < this.screens.length; i++){
            this.screens[i] = new Screen(
                positions[i], 
                screenData[i],
                this.w,
                this.h,
                this.tileW,
                this.tileH
                )
            }
    
    }

    update(screenID){
    }
    
    draw(screenID){
        this.screens[screenID].draw(); //draw func at right screenID


        // for(let i = 0; i < this.screens[screenID].platforms.length; i++){
        //     ctx.fillRect(
        //         this.screens[screenID].platforms[i].x,
        //         this.screens[screenID].platforms[i].y,
        //         this.screens[screenID].platforms[i].w,
        //         this.screens[screenID].platforms[i].h
        //     );
        //     //console.log(this.screens[screenID].platforms[i].x);
        // }
    }

}

class Enemy extends Entity{
    constructor(x, y, w, h, gravityBoolean){
        super(x, y, w, h, gravityBoolean);
    }

    draw(){
        ctx.fillStyle = "#000";
        super.draw();
    }
}

class Player extends Entity{
    constructor(x, y, w, h, gravityBoolean, imgObj, health, score){
        super(x, y, w, h, gravityBoolean);
        this.imgObj = imgObj;
        this.w *= playerScale;
        this.h *= playerScale;
        this.w = Math.floor(this.w);// * 100 ) / 100;
        this.h = Math.floor(this.h);// * 100 ) / 100;

        this.health = health || 3;
        this.score = score || 0;
        this.level = 0;
        this.screenID = 0
        this.updateSpeed = 2; //interval - hvert 2-ende millisek
        this.speed = 7;
        this.jumpHeight = 10; //10 => Y-speed = 10 pixels/frame
        this.faceDirection = false; //true for right, false for left
        this.walktime = 0;
        this.spriteState = "stillL";
        this.reload = true;
        this.reloadTime = 3; //1000 ==> every 1000th millisek
        this.reloadTimer = this.reloadTime;
        this.xHitBox = 0;
        this.hitLadder = false;
    }

    shoot(){
        if(!this.reloading){
            window.shots.push(
                new Shot(
                    this.x + this.w / 2 - 25/2,
                    this.y + this.h / 2 - 20,
                    15,
                    7.5,
                    this.faceDirection ? 1 : -1, //direction - if true return 1 (aka x++ aka right) else left
                    0,
                    10,     //projectile speed
                    "#f90cda",  //colour
                    false
                )
            );
            //console.log(window.shots);
        }
    }
    
    update(direction){ //moving player - direction from keylistner
        
        if(this.hitLadder){
            if(direction[1] < 0){
                //console.log("up!");
                this.y += -2;//this.speed / 2;
            }else if(direction[1] > 0){
                //console.log("down!");
                this.y += 2;//this.speed / 2;
            }
        }else if(
            // if not pressing "down" while at bottom of screen &&and&& not pressing up while mid-air
            !(-direction[1] < 0 && this.y + this.h >= canvH - border) && 
            !this.airBool &&  //-!(-direction[1] > 0 && this.velY < 0)
            direction[1] != 0 &&
            !playerHitbox().stopJump
            ){
            this.velY += this.jumpHeight * -direction[1]; // ( * mainCharacter.speed;
            this.airBool = true;
        }
        if(direction[0] != 0){
            let dir = direction[0] * this.speed;
            if(
                (this.xHitBox < 0 && dir < 0) || 
                (this.xHitBox > 0 && dir > 0)
            ){dir = 0}
            this.velX = dir;
        }
        
    }

    draw(){
        //super.draw(false); //false pga. ikke tegne (fillrect fra super) svart bakgrunn
        if(!this.hitLadder){
            this.velY = Math.floor(this.velY * 100) / 100; 
            this.velY += -gravity;
            this.y += -this.velY;;
        }else{
            this.airBool = false;
        }
        this.x += this.velX;
        this.velX = 0;

        //| check yhitbox
        let playerReturn = playerHitbox();
        if(playerReturn.OOB){
            this.health = 0;
            console.log("U LOOSE! => Out Of Bounds!"); 
        }
        //console.log(playerReturn);
        this.xHitBox = playerReturn.x;
        this.hitLadder = playerReturn.ladder;
        if(playerReturn.y > 0 && !this.hitLadder){ 
            this.velY = 0, this.airBool = false;
            this.y = 
            playerReturn.y + (2 * 2 * 32) //2 + 2*tileH aka: 128
            - this.h//(Object.values(spriteInfo)[0][3] * playerScale) // - playerH
            - 6//border; //does a bug where u cant jump if not moved up 6pixls
        }else if(playerReturn.y == -1 && !this.hitLadder){
            this.velY = 0, this.airBool = true;
        }
        
        
        //| Animations
        if(this.health == 0) {
            ctx.fillText("GAME OVER",canvW/2,canvH/2);
        }

        if(this.airBool && this.faceDirection) {
            this.spriteState = "jumpR";
        } 
        else if(this.airBool && !this.faceDirection) {
            this.spriteState = "jumpL";
        }
        else if(!this.airBool && this.faceDirection && this.walktime == 0) {
            this.spriteState = "stillR";
        }
        else if(!this.airBool && !this.faceDirection && this.walktime == 0) {
            this.spriteState = "stillL";
        }
        //| flyttet gravity til Entity-class
        for (let i = 0; i<Object.keys(spriteInfo).length; i++) {
            if (this.spriteState == Object.keys(spriteInfo)[i]) {
                
                let hitBoxFix = this.x; //flytter bilde litt til høyre hvis går til venstre
                if(!this.faceDirection && this.walktime > 0){hitBoxFix -= this.w;}

                ctx.drawImage(
                    this.imgObj.img,  //må være Image object - isje url / src
                    Object.values(spriteInfo)[i][0],
                    Object.values(spriteInfo)[i][1],
                    Object.values(spriteInfo)[i][2],
                    Object.values(spriteInfo)[i][3],
                    hitBoxFix, //generally = this.x
                    this.y,
                    Object.values(spriteInfo)[i][2] * playerScale,
                    Object.values(spriteInfo)[i][3] * playerScale
                );
                this.h = Object.values(spriteInfo)[i][3] * playerScale;
                this.h = Math.floor(this.h) // * 100 ) / 100;

                // ctx.strokeStyle = "#000";
                // ctx.lineWidth = "3";
                // ctx.strokeRect(this.x, this.y, this.w, this.h);
            }
        }
    }
}

class Shot extends Entity{
    constructor(x, y, w, h, dirx, diry, speed, col, enemy){
        super(x, y, w, h, false);
        this.dirx = dirx; // -1 eller 1 eller 0
        this.diry = diry; // -1 / 1 / 0
        this.speed = speed;
        this.col = col;
        this.enemy = enemy; //Boolean, true if from enemy
    }

    update(){
        if(this.x >= canvW || this.x + this.w <= 0){
            for(var x in window.shots){
                if(
                    window.shots[x].x >= canvW || 
                    window.shots[x].x + window.shots[x].w <= 0 || 
                    window.shots[x].y >= canvH || 
                    window.shots[x].y + window.shots[x].h <= 0
                ){
                    window.shots.splice(x, 1); //sjekker alle skuddene om de er inni eller ikke
                }
            }
        } else {
            this.x += this.dirx * this.speed;
            this.y += this.diry * this.speed;
            this.draw();
        }
    }

    draw(){
        ctx.fillStyle = this.col;
        super.draw(true);
    }
}

class batEnemy extends Enemy {
    constructor(x, y, w, h, ymin, ymax, imgObj){
        super(x, y, w, h, false);
        this.imgObj = imgObj;
        this.lives = 1;
        this.dy = 2;
        this.ymin = ymin;
        this.ymax = ymax;
    }

    draw () {
        if (
            (this.y+this.dy+this.h) >= this.ymax || 
            (this.y+this.dy) <= this.ymin
        ){
            this.dy = (-1) * this.dy;
        }

        ctx.drawImage(
            this.imgObj,
            this.x,
            this.y,
            this.w,
            this.h
            );

        this.y += this.dy;
    }
}

class markusEnemy extends Enemy {
    constructor(x, y, w, h, xmin, xmax, imgObj){
        super(x, y, w, h, true);
        this.imgObj = imgObj;
        this.lives = 2;
        this.dx = 2;
        this.xmin = xmin;
        this.xmax = xmax;

    }

    draw () {
        if ((this.x+this.dx+this.w) >= this.xmax || (this.x+this.dx) <= this.xmin){
            this.dx = (-1) * this.dx;
        }
        if ( this.dx>0) {
            this.imgObj = imgMarkusR;
        }
        else {
            this.imgObj = imgMarkusL;
        }

        ctx.drawImage(
            this.imgObj,
            this.x,
            this.y,
            this.w,
            this.h
            );

        this.x = this.x + this.dx;
    }
}

class Boss extends Enemy {
    constructor(x, y, w, h, imgObj){
        super(x, y, w, h, false);
        this.imgObj = imgObj;
        this.lives = 6;
        this.mad = false;
        this.dx = 3;
        this.dy = 3;
        this.reloadtime = 80;
        this.reload = this.reloadtime;
        this.shotSpeed = 1;
        this.shotColour = "#f00";

    }
    
    shoot(){
        for(let i= -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (!(j == 0 && i == 0)) {
                    window.shots.push(
                        new Shot(
                            this.x + this.w / 2 - 25/2, this.y + this.h / 2 - 10/2,
                            10, 10,
                            i, j, 
                            5 * this.shotSpeed,     //projectile speed
                            this.shotColour,//"#f00",  //colour
                            true
                        )
                    );
                        //console.log(window.shots);
                }
            }
        }
    }

    draw () {
        this.reload--;

        if(this.reload == 0) {
            this.shoot();
            this.reload = this.reloadtime;
        }
        if (this.lives <= 3 && this.lives > 0 && !this.mad){
            //Angry boss state (harder)
            this.imgObj = imgMadBoss;
            this.mad = true;
            // this.dx *= 2;
            // this.dy *= 2;
            this.reloadtime *= 1/2;
            this.shotSpeed = 2;
            this.shotColour = "#a0a";
            //this.lives = 5;
        }
        console.log(this.mad, this.lives)
        if ((this.x+this.dx+this.w) >= canvW - border || (this.x+this.dx) <= border) {
            this.dx = (-1) * this.dx;
        }
        if ((this.y+this.dy+this.h) >= canvH - border || (this.y+this.dy) <= border){
            this.dy = (-1) * this.dy;
        }

        ctx.drawImage(
            this.imgObj,
            this.x,
            this.y,
            this.w,
            this.h
            );

        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
        
    }
}


const init = () => {
    window.reloading = setInterval(reloadInterval,100);
    
    //* Init level
    window.imgSpriteSheet = new Image();
    window.imgSpriteSheet.src = "./maps/tileset1.png";

    let positions = toObjURL.layout;//eks: [[1, 1], [1, 2], [2, 2], [2, 3]];
    let levelData = [
        toObjURL.screen1Data, 
        toObjURL.screen2Data, 
        toObjURL.screen3Data, 
        toObjURL.screen4Data
    ];
    window.level = new Level(           //| når skifte screen - husk å endre bakgrunnsbilde :)
        positions, 
        levelData, 
        toObjURL.width, 
        toObjURL.height, 
        toObjURL.tileWidth, 
        toObjURL.tileHeight
    );
    console.log(window.level);
    

    //* Init player + playerImg
    const imgMainChar = new Image();
    imgMainChar.src = "./media/main_character/spritesheet.png";
    window.imgMainCharObj = {positons: [/*positions in spritesheet, can be obj*/], img: imgMainChar};
    window.mainCharacter = new Player(
        canvW-50, 
        900-275, 
        35, 
        170 /*35*entityScale, 170*entityScale*/, 
        true, 
        imgMainCharObj,
        3
    );
    console.log(mainCharacter);

    //* Make boss
    window.imgBoss = new Image();
    imgBoss.src = "./media/ufo_happy.png";
    window.imgMadBoss = new Image();
    imgMadBoss.src = "./media/ufo_mad.png";
    window.Kristian = new Boss(canvW/2, canvH/2, 150*1.5, 92*1.5, imgBoss);

    //* Markusenemy 
    window.imgMarkusL = new Image();
    imgMarkusL.src = "./media/markus_left.png";
    window.imgMarkusR = new Image();
    imgMarkusR.src = "./media/markus_right.png";

    //* Batenemy example
    window.imgBat = new Image();
    imgBat.src = "./media/bat.PNG";
    //console.log(enemyPosArr[mainCharacter.screenID]);

    //createEnemies(); //| creating enemies moved to newScreen function

    setTimeout(() => {newScreen(mainCharacter.screenID)}, 100);
    //level.screens[mainCharacter.screenID].draw()
    

}

//! GameLoop 
const animate = () => {
    countFrames++;
    pCountFrames.innerHTML = countFrames;

    //| clearScreen
    ctx.clearRect(0, 0, 2000, 1000);

    //| drawscreen/level
    //dummyLevel.draw(mainCharacter.screenID/* screenID aka. hvor characteren e (+ vinduene foran/rundt) */);

    //| levelDraw
    //level.draw(mainCharacter.screenID);
    //level.screens[mainCharacter.screenID].draw(); //midlertidig

    //| draw skudd & check for hits
    //console.log();
    shothitbox: for (let i = 0; i < window.shots.length; i++) {
        //window.shots[i].draw();console.log(entities);
        if (doesIntersect(Kristian,window.shots[i]) && !window.shots[i].enemy && mainCharacter.screenID == 3) {
            mainCharacter.score += 100;
            Kristian.lives--;
            window.shots.splice(i, 1);
            continue shothitbox;
        }

        for (let j = 0; j<entities.length; j++) {
            if (doesIntersect(window.shots[i],entities[j]) && !window.shots[i].enemy) {
                mainCharacter.score += 25;
                window.shots.splice(i, 1);
                entities.splice(j, 1);
                continue shothitbox;
            }
        }

        if (doesIntersect(mainCharacter,window.shots[i]) && window.shots[i].enemy) {
            mainCharacter.health--;
            window.shots.splice(i, 1);  
            console.log("OOF");
            continue shothitbox
        }
        window.shots[i].update();
    }

    for (let i = 0; i < entities.length; i++) {
        if (doesIntersect(mainCharacter,entities[i])) {
            let stats = [mainCharacter.health - 1, mainCharacter.score];
            window.mainCharacter = new Player(
                canvW-50, 
                900-275, 
                35, 
                170 /*35*entityScale, 170*entityScale*/, 
                true, 
                imgMainCharObj,
                stats[0],
                stats[1]
            );
        }
    }
    

    //| draw mainChar
    mainCharacter.draw();

    //| update hud
    if(!shopMenu){
        numHearts = "";
        for (let i = 0; i < mainCharacter.health; i++) {numHearts += "❤"}
        showHUD("playerData", 1, [`Score: ${mainCharacter.score}`, `Health: ${numHearts}`]);
    }

    //| draw all (other) entities
    entities.forEach(entity => entity.draw()); //mugligens flytte mainchar/player til dette array-et

    if(mainCharacter.screenID == 3) {Kristian.draw()} // && Kristian.lives != 0


    if(mainCharacter.health > 0 && Kristian.lives > 0){
        requestAnimationFrame(animate);
    }else if(mainCharacter.health <= 0){
        showHUD(
            "GAME OVER", 
            0, 
            [
                `Score: ${mainCharacter.score}`, 
                "F5 for restart :)", 
                "Alt + F4 for a suprise :-)"
            ]
        );
    }else if(Kristian.lives <= 0){
        showHUD(
            "YOU WIN", 
            0, 
            [
                `Score: ${mainCharacter.score}`, 
                "F5 to play again :)"
            ]
        );
    }
}

window.onload = () => {

    //redirect to map1.html
    window.url = location.href;
    window.parsedURL = parseURLParams(window.url);

    if(window.parsedURL != undefined){
        window.toObjURL = JSON.parse(window.parsedURL.mapData[0]);
        window.loadedOnce = window.toObjURL.loadedOnce;
    }
    
    if(window.loadedOnce != undefined && window.loadedOnce){
        console.log("levelObject: ", window.toObjURL);
        init();
        animate();

    }else if(!window.loadedOnce || window.loadedOnce == undefined){
        window.location.replace("./maps/level1/levelData.html");             //! FILE SOURCE
        console.log("redirecting!");
    }
}
