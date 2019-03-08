//* Connect UI
const canvasGfx = document.getElementById("canvasGfx");
const ctx = canvasGfx.getContext("2d");
const HUD = document.getElementById("HUD");
const pCountFrames = document.getElementById("countFrames");

//| Globals
const canvW = 1600;
const canvH = 900;
const gravity = 1;
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

//! Program
//ctx.fillRect(10, 20, 100, 100);


//? Functions
const randIntMinMax = (min, max) => Math.floor(Math.random() * (max - min) + min);

const showHUD = (title, opt1, opt2, opt3, opt4, opt5, opt6) => {

    const menuTitle = document.getElementById("menuTitle");
    const menu = document.getElementById("menu");

    let list = [];
    let options = [opt1, opt2, opt3, opt4, opt5, opt6];

    for(i in options){
        if(options[i] != undefined){
            console.log(options[i]);
            let node = document.createElement("li");
            node.innerHTML = String(options[i]);
            list.push(node);
        }
    }

    menuTitle.innerHTML = title;
    list.forEach(opt => menu.appendChild(opt));
    HUD.style.visibility = "visible";
}

//showHUD("testss", "Start game", "Tutorial & Controlls", "Exit");

/*
const intersection =  (a, b) => {
    if () {
        return true
    }
    else {
        return false
    }
}

const intersection = (a, b) => condition ? exprTrue : exprFalse;
// ^^ returnerer true eller false etter condition

function example(…) {
    return condition1 ? value1
         : condition2 ? value2
         : condition3 ? value3
         : value4;
}

// Equivalent to:
function example(…) {
    if (condition1) { return value1; }
    else if (condition2) { return value2; }
    else if (condition3) { return value3; }
    else { return value4; }
}

*/

//? keyListener
{
let toggleIntervalR = false;
let toggleIntervalL = false;
let toggleIntervalU = false;
let toggleIntervalD = false;

const intervalRight = () => {
    console.log("Right")
}
const intervalLeft = () => {
    console.log("Left")
}
const intervalUp = () => {
    console.log("Up")
}
const intervalDown = () => {
    console.log("Down")
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
    constructor(x, y, w, h, spriteSheetObject){
        super(x, y, w, h, spriteSheetObject);

        this.health = 3;
        this.score = 0;
        this.level = 0;
        this.speed = 10; //interval - hvert 10-ende millisek
        
        // //Player objekt  LOG sitt player-object
        // var Player = {
        //     x: 0,
        //     y: 0,
        //     health: 3,
        //     score: 0,
        //     level: 0
        // };
    }

    update(){ //moving player - from keylistner
        
    }

    draw(){
        super.draw();
    }
}



const init = () => {
    let dummyLevelPosArr = [[1, 1], [1, 2], [2, 2], [2, 3]];
    window.dummyLevel = new Level(dummyLevelPosArr); //window.xx fordi må være global
    console.log(dummyLevel);

    let spriteSheetObject = {positons: [/*positions in spritesheet, can be obj*/], url: ""};
    window.mainCharacter = new Player(100, 900-300, 150, 200, spriteSheetObject);
    console.log(mainCharacter);

    //| drawscreen/level here?
    dummyLevel.draw(0/* screenID aka. hvor characteren e (+ vinduene foran/rundt) */);
}

//! GameLoop 
const animate = () => {
    countFrames++;
    pCountFrames.innerHTML = countFrames;


    //* Check intersection


    //| draw mainChar
    mainCharacter.draw();

    //| Gameloop func, recursiv
    //requestAnimationFrame(animate);
}

window.onload = () => {
    init();
    animate();
    const animation = setInterval(animate, 1000); //fps 
    // animate();
}