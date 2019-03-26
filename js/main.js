//* Connect UI
const canvasGfx = document.getElementById("canvasGfx");
const ctx = canvasGfx.getContext("2d");
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
    
    ctx.font = "100px Helvetica";
    
    canvasGfx.width  = canvW;
    canvasGfx.height = canvH;

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

const showHUD = (title, opt1, opt2, opt3, opt4, opt5, opt6) => {
    //Eks: showHUD("testss", "Start game", "Tutorial & Controlls", "Exit");
    //^^if empty, aka: showHUD(); ==> visibility hidden && reset hud

    if(title == undefined){
        HUD.style.visibility = "hidden";

    }else if(title != undefined){
        const menuTitle = document.getElementById("menuTitle");
        const menu = document.getElementById("menu");
        menu.innerHTML = ""; //clear list b4 filling
    
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

//! keyListener
{
let toggleIntervalR = false;
let toggleIntervalL = false;
let toggleIntervalU = false;
let toggleIntervalD = false;
let toggleHUDOverlay = false;
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
    if((e.keyCode == 87 || e.keyCode == 38) && !toggleIntervalU){

        //set direction = spriteState
        mainCharacter.faceDirection ? mainCharacter.spriteState = "jumpR" : mainCharacter.spriteState = "jumpL";

        window.keyIntervalUp = setInterval(intervalUp, mainCharacter.updateSpeed);
        toggleIntervalU = !toggleIntervalU;

    } else if((e.keyCode == 83 || e.keyCode == 40) && !toggleIntervalD){
        window.keyIntervalDown = setInterval(intervalDown, mainCharacter.updateSpeed);
        toggleIntervalD = !toggleIntervalD;
    }

    if(e.keyCode == 13){ //enter

        //if already HUD ==> hide else draw dummy-HUD
        toggleHUDOverlay ? showHUD() : showHUD("testss", "Start game", "Tutorial & Controlls", "Exit");

        //switch boolean
        toggleHUDOverlay = !toggleHUDOverlay;
    }

    if(e.keyCode == 32 && !toggleIntervalSpace){ //space
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
    if((e.keyCode == 87 || e.keyCode == 38) && toggleIntervalU){
        clearInterval(window.keyIntervalUp);
        toggleIntervalU = !toggleIntervalU;

    } else if((e.keyCode == 83 || e.keyCode == 40) && toggleIntervalD){
        clearInterval(window.keyIntervalDown);
        toggleIntervalD = !toggleIntervalD;
    }

    if(e.keyCode == 32 && toggleIntervalSpace){
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

            if(this.y + this.h > canvH - border){ 
                this.velY = 0, this.airBool = false;
                this.y = canvH - border - this.h;
    
            }else if(this.y + this.h < canvH - border){
                this.velY = Math.floor(this.velY * 100) / 100; //grov avrunding
                //console.log(this.velY);

                this.velY += -gravity;
                //this.gravitySpeed += this.velY;
            }

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
                //console.log(i, j);
                
                ctx.drawImage(
                    imgSpriteSheet,
                    this.tileW * ((this.data[i][j]-1) % 7), 
                    this.tileH * Math.floor((this.data[i][j]-1) / 7),
                    this.tileW,
                    this.tileH,
                    this.tileW * 2 * j,// + (marginW),
                    this.tileH * 2 * i,// + (marginH),
                    this.tileW * 2,
                    this.tileH * 2
                );

                //Border på alle rutene
                ctx.lineWidth = "0.3";
                ctx.strokeRect(
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
    constructor(x, y, w, h, gravityBoolean, imgObj){
        super(x, y, w, h, gravityBoolean);
        this.imgObj = imgObj;
        this.w *= playerScale;
        this.h *= playerScale;

        this.health = 3;
        this.score = 0;
        this.level = 0;
        this.screenID = 0;
        this.updateSpeed = 2; //interval - hvert 2-ende millisek
        this.speed = 7;
        this.jumpHeight = 10; //10 => Y-speed = 10 pixels/frame
        this.faceDirection = true; //true for right, false for left
        this.walktime = 0;
        this.spriteState = "stillR";
        this.reload = true;
        this.reloadTime = 3; //1000 ==> every 1000th millisek
        this.reloadTimer = this.reloadTime;
    }

    shoot(){
        if(!this.reloading){
            window.shots.push(
                new Shot(
                    this.x + this.w / 2 - 25/2,
                    this.y + this.h / 2 - 32,
                    25,
                    10,
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
        
        // if not pressing "down" while at bottom of screen &&and&& not pressing up while mid-air
        if (
            !(-direction[1] < 0 && this.y + this.h >= canvH - border) && 
            !this.airBool &&  //-!(-direction[1] > 0 && this.velY < 0)
            direction[1] != 0
            ){

            this.velY += this.jumpHeight * -direction[1]; // ( * mainCharacter.speed;
            this.airBool = true;
        }
        if(direction[0] != 0){
            this.velX = direction[0] * this.speed;
        }
        
    }

    draw(){
        super.draw(false); //false pga. ikke tegne (fillrect fra super) svart bakgrunn

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

                ctx.strokeStyle = "#000";
                ctx.lineWidth = "3";
                ctx.strokeRect(this.x, this.y, this.w, this.h);
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
        if ((this.y+this.dy+this.h) >= this.ymax || (this.y+this.dy) <= this.ymin){
            this.dy = (-1) * this.dy;
        }

        ctx.drawImage(
            this.imgObj,
            this.x,
            this.y,
            this.w,
            this.h
            );

        this.y = this.y + this.dy;
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
        this.lives = 5;
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
        if (this.lives<3){
            //Angry boss state (harder)
            this.imgObj = imgMadBoss;
            // this.dx *= 2;
            // this.dy *= 2;
            this.reloadtime *= 1/2;
            this.shotSpeed = 2;
            this.shotColour = "#a0a";
            this.lives = 5;
        }
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

const testHitbox = () => {
    let playerX = mainCharacter.x + (mainCharacter.w/2);
    let playerY = mainCharacter.y;
    let data = level.screens[mainCharacter.screenID].data;
    //let checkNums = [];

    if(playerX < 0){playerX = 0}
    if(playerY < 0){playerY = 0}

    playerX /= (level.tileW * 2);
    playerX = Math.floor(playerX);
    playerY /= (level.tileH * 2);
    playerY = Math.floor(playerY);
    
    //* Viser hvilke hitbokser vi skal sjekke
    for (let i = -1; i <= 3-1; i++) { //5 tiles i høyden (3 + 1 + 1) (playerH + margene)
        for (let j = -1; j <= 1; j++) { //3 tiles i bredden (1 + 1 + 1) (playerW + margene)
            
            if(playerY + i >= 14){playerY -= 1} //index [13] e siste ytre array, -1 for å unngå error
            if(playerX + j >= 25){playerX -= 1}
            let tileVal = data[playerY + i][playerX + j];
            
            ctx.fillStyle = "#f003";
            ctx.fillRect(
                (playerX + j) * (level.tileW * 2),
                (playerY + i) * (level.tileH * 2),
                level.tileW * 2,
                level.tileH * 2
            );
            ctx.fillStyle = "#000";
            ctx.font = "30px Georgia";
            ctx.fillText(
                tileVal,
                (playerX + j) * (level.tileW * 2) + 16,
                (playerY + i) * (level.tileH * 2) + 32
            );

            
        }
        
    }
    

    console.log(playerX, playerY);
    //console.log(levelX, levelY);
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
    const imgMainCharObj = {positons: [/*positions in spritesheet, can be obj*/], img: imgMainChar};
    window.mainCharacter = new Player(
        canvW-50, 
        900-275, 
        35, 
        170 /*35*entityScale, 170*entityScale*/, 
        true, 
        imgMainCharObj
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
    entities.push(new batEnemy(450,100,30,17,100,300,imgBat));
    entities.push(new markusEnemy(300, 350, 87, 90, 300, 500, imgMarkusR));

    //entities.push(new Enemy(1300, 100, 100, 100, true));
    //console.log(entities);

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
    level.screens[0].draw(); //midlertidig

    // draw skudd & check for hits
    for (let i = 0; i < window.shots.length; i++) {
        window.shots[i].update();
        //window.shots[i].draw();
        /*if (doesIntersect(Kristian,window.shots[i])) {
            console.log("U DED");
        }*/
    }
    //| draw mainChar
    mainCharacter.draw();

    //| draw all (other) entities
    entities.forEach(entity => entity.draw()); //mugligens flytte mainchar/player til dette array-et

    //midlertidig testing av 
    testHitbox();

    //draw gameGUI
    
    
    if(mainCharacter.screenID == 3 && Kristian.lives != 0) {Kristian.draw()}

    for (let i = 0; i < window.shots.length; i++) {
        window.shots[i].update();
        //window.shots[i].draw();
    }

    requestAnimationFrame(animate);
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

