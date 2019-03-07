//* Connect UI
const canvasGfx = document.getElementById("canvasGfx");
const ctx = canvasGfx.getContext("2d");
const HUD = document.getElementById("HUD");

//| Globals
const canvW = 1600;
const canvH = 900;

//Player objekt
var Player = {
    x,
    y,
    health: 3,
    score: 0,
    level: 0
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

//! Program
ctx.fillRect(10, 20, 100, 100);


//? Functions

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

//showHUD("testss", "Start game", "tutorial & controlls", "Exit");