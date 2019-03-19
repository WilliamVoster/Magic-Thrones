//* Connect UI
const canvasGfx = document.getElementById("canvasGfx");
const ctx = canvasGfx.getContext("2d");
const HUD = document.getElementById("HUD");
const pCountFrames = document.getElementById("countFrames");

//| Globals
const canvW = 1600;
const canvH = 900;
const gravity = 0.2;
let countFrames = 0;

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
//Eks: showHUD("testss", "Start game", "Tutorial & Controlls", "Exit");
//^^if empty, aka: showHUD(); ==> visibility hidden && reset hud

//! keyListener
{
let toggleIntervalR = false;
let toggleIntervalL = false;
let toggleIntervalU = false;
let toggleIntervalD = false;
let toggleHUDOverlay = false;

const intervalRight = () => {
    // console.log("Right");
    mainCharacter.update([1, 0]); // ++ in x-direction
}
const intervalLeft = () => {
    // console.log("Left");
    mainCharacter.update([-1, 0]); // -- in x-direction
}
const intervalUp = () => {
    // console.log("Up");
    mainCharacter.update([0, -1]); // -- in y-direction
}
const intervalDown = () => {
    // console.log("Down");
    if (!(window.mainCharacter.y+window.mainCharacter.h>canvH)) {
        mainCharacter.update([0, 1]); // ++ in y-direction
    }
}

const keyEventDownHandler = e => {
    //console.log(e.keyCode); // R L U D : 68&39 65&37 87&38 83&40

    if((e.keyCode == 68 || e.keyCode == 39) && !toggleIntervalR){
        window.keyIntervalRight = setInterval(intervalRight, mainCharacter.speed);
        toggleIntervalR = !toggleIntervalR;

    } else if((e.keyCode == 65 || e.keyCode == 37) && !toggleIntervalL){
        window.keyIntervalLeft = setInterval(intervalLeft, mainCharacter.speed);
        toggleIntervalL = !toggleIntervalL;
    }
    if((e.keyCode == 87 || e.keyCode == 38) && !toggleIntervalU){
        window.keyIntervalUp = setInterval(intervalUp, mainCharacter.speed);
        toggleIntervalU = !toggleIntervalU;

    } else if((e.keyCode == 83 || e.keyCode == 40) && !toggleIntervalD){
        window.keyIntervalDown = setInterval(intervalDown, mainCharacter.speed);
        toggleIntervalD = !toggleIntervalD;
    }

    if(e.keyCode == 13){

        //if already HUD ==> hide else draw dummy-HUD
        toggleHUDOverlay ? showHUD() : showHUD("testss", "Start game", "Tutorial & Controlls", "Exit");

        //switch boolean val
        toggleHUDOverlay = !toggleHUDOverlay;
    }
}
const keyEventUpHandler = e => {
    if((e.keyCode == 68 || e.keyCode == 39) && toggleIntervalR){
        clearInterval(window.keyIntervalRight);
        toggleIntervalR = !toggleIntervalR;

    }else if((e.keyCode == 65 || e.keyCode == 37) && toggleIntervalL){
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
}
document.addEventListener("keydown", keyEventDownHandler);
document.addEventListener("keyup", keyEventUpHandler);
}

class Entity{
    constructor(x, y, w, h){
        this.x = x,
        this.y = y,
        this.w = w,
        this.h = h
    }

    draw(){
        ctx.fillRect(
            this.x,
            this.y,
            this.w,
            this.h
        )
    }
}

class Platform extends Entity{
    constructor(x, y, w, h, texture){
        super(x, y, w, h, texture)
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
    constructor(x, y, w, h){
        super(x, y, w, h);
    }
}

class Player extends Entity{
    constructor(x, y, w, h, imgObj){
        super(x, y, w, h);
        this.imgObj = imgObj;
        //this.w = this.imgObj.img.offsetWidth;

        this.health = 3;
        this.score = 0;
        this.level = 0;
        this.screenID = 0;
        this.updateSpeed = 10; //interval - hvert 10-ende millisek
        this.speed = 2;
        this.direction = true; //True = Høyre, False = Venstre
        this.gravitySpeed = 0;
        
    }
    
        
    update(direction){ //moving player - from keylistner
        this.x += direction[0] * mainCharacter.speed;
        this.y += direction[1] * mainCharacter.speed;
    }

    draw(){
        //super.draw(); for bare svart firkant

        //| Check intersecting with floor        
        if(this.y + this.h >= canvH){
            this.gravitySpeed = 0;
            
        }else if(this.y + this.h < canvH){
            console.log(this.gravitySpeed);
            this.gravitySpeed += gravity;
            this.gravitySpeed = Math.floor(this.gravitySpeed * 100) / 100; //grov avrunding
            this.y += this.gravitySpeed;
        }

        ctx.drawImage(
            this.imgObj.img,  //må være Image object - isje url / src
            this.x, 
            this.y,
            this.w,
            this.h
        );
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
    imgMainChar.src = "./media/main_character/character_still.png";
    const imgMainCharObj = {positons: [/*positions in spritesheet, can be obj*/], img: imgMainChar};
    window.mainCharacter = new Player(100, 900-600, 35, 170, imgMainCharObj); //35 x 170  =  dimentions of standing pic
    console.log(mainCharacter);
}


//! GameLoop 
const animate = () => {
    countFrames++;
    pCountFrames.innerHTML = countFrames;

    //| clearScreen
    ctx.clearRect(0, 0, 2000, 1000);

    //* Check intersection in update func

    //| drawscreen/level here?
    dummyLevel.draw(0/* screenID aka. hvor characteren e (+ vinduene foran/rundt) */);

    //| draw mainChar
    mainCharacter.draw();

    //| Gameloop func, recursiv
    requestAnimationFrame(animate);
}

window.onload = () => {
    init();
    animate();
    //const animation = setInterval(animate, 1000); //fps 
}

