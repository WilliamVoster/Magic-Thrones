//* Connect UI
const canvasGfx = document.getElementById("canvasGfx");
const ctx = canvasGfx.getContext("2d");
const HUD = document.getElementById("HUD");
const pCountFrames = document.getElementById("countFrames");

//| Globals
const canvW = 1600;
const canvH = 900;
const border = 10; //in pixels
const gravity = 0.5;//0.25;
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
    
    canvasGfx.width  = canvW;
    canvasGfx.height = canvH;

    HUD.style.width = canvW + "px";
    HUD.style.height = canvH + "px";
    HUD.style.visibility = "hidden";
}

//? Functions
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
window.intervalShootHasRun = false;

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

const intervalReload = () => {
    //console.log("reload");
    window.intervalShootHasRun = true; //needed for timeoutfunc in eventhandler
    mainCharacter.reloading = false; //after 1000-ish millisek => ready for new shot (after reloaded)
    mainCharacter.shoot();
    //mainCharacter.reloading = true;
    //console.log("shooting!", "reloading: " + mainCharacter.reloading);
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

        //start reloadinterval
        window.actionIntervalReload = setInterval(intervalReload, mainCharacter.reloadTime); 
        //call player.shoot()
        mainCharacter.shoot();
        //set reload state of player
        mainCharacter.reloading = true;
        setTimeout( 
            () => {
                if(!window.intervalShootHasRun){ //if interval has not run => set reload to false after a time
                    mainCharacter.reloading = !mainCharacter.reloading
                }
            }, mainCharacter.reloadTime
        );
        //stop sending more instructions b4 releasing key
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
        window.intervalShootHasRun = false;
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
    constructor(posArr){
        this.position = {
            row: posArr[0],
            col: posArr[1]
        }

        this.platforms = new Array(8);
        for (let i = 0; i < this.platforms.length; i++) {
            this.platforms[i] = new Platform(
                randIntMinMax(50, 1600 - 100 - 50), //50 padding, 100 width on platform
                randIntMinMax(50, 900 - 20 - 50), 
                100, 
                20,
                "textureURL"
            );
            
        }
    }

}

class Level{

    //numScreens == alltid lik 4
    //postitions in array format. Ex: [1, 2] (row = 1 & col = 2)
    //^^ Ex: [[1, 1], [1, 2], [2, 2], [2, 3]]
    constructor(screenPosArr){
        this.screens = new Array(4);

        for(let i = 0; i < this.screens.length; i++){
            this.screens[i] = new Screen(screenPosArr[i]);
        }
    
    }

    update(screenID){

    }

    draw(screenID){

        for(let i = 0; i < this.screens[screenID].platforms.length; i++){
            ctx.fillRect(
                this.screens[screenID].platforms[i].x,
                this.screens[screenID].platforms[i].y,
                this.screens[screenID].platforms[i].w,
                this.screens[screenID].platforms[i].h
            );
            //console.log(this.screens[screenID].platforms[i].x);
        }
    }

}

class Enemy extends Entity{
    constructor(x, y, w, h, gravityBoolean){
        super(x, y, w, h, gravityBoolean);
    }

    draw(){
        super.draw();
    }
}

class Player extends Entity{
    constructor(x, y, w, h, gravityBoolean, imgObj){
        super(x, y, w, h, gravityBoolean);
        this.imgObj = imgObj;
        //this.w = this.imgObj.img.offsetWidth;

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
        this.reloading = false;
        this.reloadTime = 500; //1000 ==> every 1000th millisek
    }

    shoot(){
        if(!this.reloading){
            window.shots.push(
                new Shot(
                    this.x + this.w / 2 - 25/2,
                    this.y + this.h / 2 - 10/2,
                    25,
                    10,
                    this.faceDirection ? 1 : -1, //direction - if true return 1 (aka x++ aka right) else left
                    10,     //projectile speed
                    "#f0f"  //colour
                )
            );
            //console.log(window.shots);
        }
    }
    
    update(direction){ //moving player - direction from keylistner
        
        // if not pressing "down" while at bottom of screen &&and&& not pressing up while mid-air
        if (
            !(-direction[1] < 0 && this.y + this.h >= canvH - border) && 
            !this.airBool &&  //!(-direction[1] > 0 && this.velY < 0)
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
                ctx.drawImage(
                    this.imgObj.img,  //må være Image object - isje url / src
                    Object.values(spriteInfo)[i][0],
                    Object.values(spriteInfo)[i][1],
                    Object.values(spriteInfo)[i][2],
                    Object.values(spriteInfo)[i][3],
                    this.x, 
                    this.y,
                    Object.values(spriteInfo)[i][2],
                    Object.values(spriteInfo)[i][3]
                );
                this.h = Object.values(spriteInfo)[i][3];
            }
        }
    }
}

class Shot extends Entity{
    constructor(x, y, w, h, dir, speed, col){
        super(x, y, w, h, false);
        this.dir = dir; // -1 eller 1
        this.speed = speed;
        this.col = col;
    }

    update(){
        if(this.x >= canvW || this.x + this.w <= 0){
            window.shots.shift(); //deletes the first (and oldest) element in window.shots
        } else {
            this.x += this.dir * this.speed;
            this.draw();
        }
    }

    draw(){
        super.draw(true);
    }
}

class Boss extends Enemy {
    constructor(x, y, w, h){
        super(x, y, w, h, false);
    }

    draw() {
        
    }
}

function doesIntersect (a, b) {
    if (a.x+a.width>b.x && a.x<b.x+b.width && a.y+a.height>b.y && a.y<b.y+b.height) {
        return true;
    }
    else {
        return false;
    }
}
    
const init = () => {
    
    let dummyLevelPosArr = [[1, 1], [1, 2], [2, 2], [2, 3]];
    window.dummyLevel = new Level(dummyLevelPosArr); //window.xx fordi må være global
    console.log(dummyLevel);
    
    const imgMainChar = new Image();
    imgMainChar.src = "./media/main_character/spritesheet.png";
    const imgMainCharObj = {positons: [/*positions in spritesheet, can be obj*/], img: imgMainChar};
    window.mainCharacter = new Player(100, 900-600, 35, 170, true, imgMainCharObj); //35 x 170  =  dimentions of standing pic
    console.log(mainCharacter);

    entities.push(new Enemy(1300, 100, 100, 100, true));
    console.log(entities[0]);

    
    // for (let i = 0; i < 1; i++) {
    //     window.shots.push(new Shot(100, 100, 25, 5, 1, 5));
    // }
}


//! GameLoop 
const animate = () => {
    countFrames++;
    pCountFrames.innerHTML = countFrames;

    //| clearScreen
    ctx.clearRect(0, 0, 2000, 1000);

    //| drawscreen/level
    dummyLevel.draw(0/* screenID aka. hvor characteren e (+ vinduene foran/rundt) */);

    //| draw mainChar
    mainCharacter.draw();

    //| draw all (other) entities
    entities.forEach(entety => entety.draw()); //mugligens flytte mainchar/player til dette array-et
    for (let i = 0; i < window.shots.length; i++) {
        window.shots[i].update();
        //window.shots[i].draw();
        
    }

    requestAnimationFrame(animate);
}

window.onload = () => {
    init();
    animate();
}
