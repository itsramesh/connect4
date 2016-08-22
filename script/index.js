"use strict";

let autoDetectRenderer = PIXI.autoDetectRenderer,
    Container = PIXI.Container,
    loader = PIXI.loader,
    Texture = PIXI.Texture,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    holderGrid = {
        row: 7,
        col: 6,
        gridPixel: 74,
        pointerLocation: 4
    },
    currentPlayerHasFinished = false,
    firstPlayerInProgress = true,
    renderer = autoDetectRenderer(holderGrid.gridPixel*7, holderGrid.gridPixel*8),
    stage = new Container(),
    gameScene = new Container(),
    gameEndScene =  new Container(),
    gameIntroScene = new Container(),
    totalStrokes = 0,
    style = {
        font : 'bold italic 24px Arial',
        fill : '#F7EDCA',
        stroke : '#4a1850',
        strokeThickness : 5
    };

document.getElementById('game').appendChild(renderer.view);

loader
    .add("images/imageSprite.json")
    .load(gameSetup);

let state, id, background, pointer, exitBtn, gradientOverLay, reloadBtn, matchOver, gameOver, playBtn, matchWin, welcomeText;
function gameSetup() {
    id = resources["images/imageSprite.json"].textures;
    background = new Sprite(id["bg.JPG"]);
    pointer = new Sprite(id["arrow.png"]);
    exitBtn = new Sprite(id["cross.png"]);
    reloadBtn = new Sprite(id["reload.png"]);
    matchOver = new Sprite(id["match-over.png"]);
    playBtn = new Sprite(id["play.png"]);
    gradientOverLay = new Sprite(id["gradient.png"]);
    welcomeText =  new Text('Welcome to Connect 4 Game', style);

    background.width = renderer.width;
    background.height = renderer.height;
    stage.addChild(background);
    gameIntro();

    state = function() {};

    gameLoop();
}

function gameIntro(){
    stage.addChild(gameIntroScene);

    welcomeText.position.set(80,100);
    gameIntroScene.addChild(welcomeText);

    playBtn.position.set(80, 200);
    setupTouchEvents(playBtn, 'play', function(){
        gameIntroScene.removeChildren(0);
        setup();
    });
    gameIntroScene.addChild(playBtn);
}

function gameEnd(gameOver) {
    stage.addChild(gameEndScene);
    
    gradientOverLay.width = renderer.width;
    gradientOverLay.height = renderer.height;
    gameEndScene.addChild(gradientOverLay);

    matchOver.width = renderer.width/1.5;
    matchOver.height = renderer.height/3;
    matchOver.position.set(75, 170);
    gameEndScene.addChild(matchOver);
    let message;
    if(!gameOver) {
        let player = firstPlayerInProgress ? '2nd Player' : '1st Player';
        message = new Text(player + ' Won the Game', style);
    } else {
        message = new Text('No one won the Game', style); 
    }
    
    message.position.set(80, 60);
    gameEndScene.addChild(message);
    
    exitBtn.position.set(240, 400);
    setupTouchEvents(exitBtn, 'cross', function(){
        reset();
        gameIntro();
    });
    gameEndScene.addChild(exitBtn);

    reloadBtn.position.set(160, 400);
    setupTouchEvents(reloadBtn, 'reload', function(){
        reset();
        setup();
    });
    gameEndScene.addChild(reloadBtn);
}

let gridData, firstPlayer, secondPlayer

function setup() {
    gridData = [];
    for(let i=0; i < holderGrid.row; i++){
        gridData.push([]);
        for(let j=2; j <= holderGrid.col+1; j++) {
            gridData[i].push({
                y: holderGrid.gridPixel * j,
                x: holderGrid.gridPixel * i,
                occupied: false,
                colorCode: undefined,
                animate: false
            })
        }
    };
    firstPlayer = new Text('1st Player',style),
    secondPlayer = new Text('2nd Player',style);
    firstPlayer.position.set(200, 20);
    secondPlayer.position.set(200, 20);
    
    stage.addChild(gameScene);

    for(let i = 2; i <= 8; i++){
        for(let j = 0; j <= 7;j++){
            let holder = new Sprite(id["holder.png"]);
            holder.y = holderGrid.gridPixel * i;
            holder.x = holderGrid.gridPixel * j;
            gameScene.addChild(holder);
        }
    }

    gameScene.addChild(firstPlayer);
    gameScene.addChild(secondPlayer);
    secondPlayer.alpha = 0;

    let pointerTouch = {};
    for(let i=0; i< holderGrid.row; i++) {
        pointerTouch.i = new Sprite(id["pointer.png"]);
        pointerTouch.i.x = holderGrid.gridPixel * i;
        pointerTouch.i.y = holderGrid.gridPixel;
        setupTouchEvents(pointerTouch.i, 'pointer', function(){
            holderGrid.pointerLocation = i+1;
            pointer.x = holderGrid.gridPixel * i;
            loadBallToTheGrid(i);
        });
        gameScene.addChild(pointerTouch.i);
    }

    pointer.x = holderGrid.gridPixel * (holderGrid.pointerLocation - 1);
    pointer.y = holderGrid.gridPixel;
    gameScene.addChild(pointer);

    enter.release = function() {
        loadBallToTheGrid(holderGrid.pointerLocation - 1)
    }
    
    state = play;
}

function loadBallToTheGrid(pointer) {
    // if(currentPlayerHasFinished) {
    //     return;
    // }
    for(let i=holderGrid.col - 1; i>=0; i--){
        if(!gridData[pointer][i].occupied){
            gridData[pointer][i].animate = true;
            gridData[pointer][i].colorCode = firstPlayerInProgress;
            if(firstPlayerInProgress){
                gridData[pointer][i].ball = new Sprite(id["yellow.png"]);
                firstPlayerInProgress = false;
                secondPlayer.alpha = 1;
                firstPlayer.alpha = 0;
            } else {
                gridData[pointer][i].ball = new Sprite(id["red.png"]);
                firstPlayerInProgress = true;
                secondPlayer.alpha = 0;
                firstPlayer.alpha = 1;
            }
            gridData[pointer][i].ball.position.set(gridData[pointer][i].x, 36);
            gameScene.addChild(gridData[pointer][i].ball);
            currentPlayerHasFinished = true;
            ++totalStrokes;
            return;
        }
    }
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    state();

    renderer.render(stage);
}

function play() {
    for(let i=holderGrid.col - 1; i>=0; i--){
        if(!gridData[holderGrid.pointerLocation - 1][i].occupied && gridData[holderGrid.pointerLocation - 1][i].animate){
            if(gridData[holderGrid.pointerLocation - 1][i].ball.y < (gridData[holderGrid.pointerLocation - 1][i].y-59)) {
                gridData[holderGrid.pointerLocation - 1][i].ball.y+=60;
            } else {
                gridData[holderGrid.pointerLocation - 1][i].ball.y = gridData[holderGrid.pointerLocation - 1][i].y;
                gridData[holderGrid.pointerLocation - 1][i].occupied = true;
                let finalResult = gameResult(holderGrid.pointerLocation-1, i);
                if(finalResult) {
                   showOutPut(finalResult);
                   return;
                }
                
                if(totalStrokes >= (holderGrid.row * holderGrid.col)){
                    for(let i = 0; i < 7; i++){
                        for(let j = 0; j < 6;j++){
                            let gameOver = new Sprite(id["over.png"]);
                            gameOver.y = gridData[i][j].y;
                            gameOver.x = gridData[i][j].x;
                            gameScene.addChild(gameOver);
                        }
                    }
                    gameEnd(true);
                }
            }
        }
    }
}

function showOutPut(res){
    let gamePoints = {};
    if(!res.traverseByCol) {
        for(let i=res.row; i>= res.row+res.traverseByRow; i--){
            mapGamePoints(i, res.col);
        }
    }
    if(!res.traverseByRow) {
        for(let i=res.col; i>= res.col+res.traverseByCol; i--){
            mapGamePoints(res.row, i);
        }
    }
    
    if(res.traverseByRow && res.traverseByCol && (res.traverseByRow < 0)) {
        for(let i=res.row, j=res.col; i>= res.row+res.traverseByRow, j>= res.col+res.traverseByCol; i--, j--){
            mapGamePoints(i, j);
        }
    }
    
    if(res.traverseByRow && res.traverseByCol && (res.traverseByRow > 0)) {
        for(let i=res.row, j=res.col; i>= res.row+res.traverseByRow, j>= res.col+res.traverseByCol; i--, j++){
            mapGamePoints(i, j);
        }
    }

    function mapGamePoints(i, j) {
            gamePoints.i = new Sprite(id["win.png"]);
            gamePoints.i.position.set(gridData[i][j].x, gridData[i][j].y);
            gameScene.addChild(gamePoints.i);
    }

    gameEnd();
}

function gameResult(row, col) {
    let currentColorCode = gridData[row][col].colorCode,
        i = 3;
    while(i >= 0){
        if(row+i < holderGrid.row){
            let nrow = row+i;
            if(nrow-3 >= 0){
                let failed;
                for(let j=nrow; j>= nrow-3; j--){
                    if(gridData[j][col].colorCode !== currentColorCode){
                        failed = true;
                    }
                }
                if(!failed){
                    return {
                        row: nrow,
                        col: col,
                        traverseByCol: 0,
                        traverseByRow: -3
                    };
                }
            }
        }
        if(col+i < holderGrid.col){
            let ncol = col+i;
            if(ncol-3 >= 0){
                let failed;
                for(let j=ncol; j>= ncol-3; j--){
                    if(gridData[row][j].colorCode !== currentColorCode){
                        failed = true;
                    }
                }
                if(!failed){
                    return {
                        row: row,
                        col: ncol,
                        traverseByCol: -3,
                        traverseByRow: 0
                    };
                }
            }
        }
        if(col+i < holderGrid.col || row+i < holderGrid.row){
            let ncol = col+i, nrow = row+i;
            if(nrow-3 >= 0 || ncol-3 >= 0){
                let failed;
                for(let j=nrow, k=ncol; j>= nrow-3, k>=ncol-3; j--, k--){
                    if(!gridData[j] || !gridData[j][k] || (gridData[j][k].colorCode !== currentColorCode)){
                        failed = true;
                    }
                }
                if(!failed){
                    return {
                        row: nrow,
                        col: ncol,
                        traverseByCol: -3,
                        traverseByRow: -3
                    };
                }
            }
            if(nrow+3 < holderGrid.row || ncol+3 < holderGrid.col){
                let failed;
                for(let j=nrow, k=ncol; j >= nrow-3, k <=ncol+3; j--, k++){
                    if(!gridData[j] || !gridData[j][k] || (gridData[j][k].colorCode !== currentColorCode)){
                        failed = true;
                    }
                }
                if(!failed){
                    return {
                        row: nrow,
                        col: ncol,
                        traverseByCol: -3,
                        traverseByRow: 3
                    };
                }
            }
        }
        i--;
    }
    currentPlayerHasFinished = false;
    return false;
}


// Helper Variables and Functions

let left = keyboardHandler(37),
    right = keyboardHandler(39),
    enter = keyboardHandler(13);

left.release = function(event) {
    event.preventDefault();
    if(pointer.x !== 0){
        pointer.x-=holderGrid.gridPixel;
        holderGrid.pointerLocation-=1;
    }
}

right.release = function(event) {
    event.preventDefault();
    if(pointer.x !== holderGrid.gridPixel*6){
        pointer.x+=holderGrid.gridPixel;
        holderGrid.pointerLocation+=1;
    }
}

function reset() {
    gameScene.removeChildren(0);
    gameEndScene.removeChildren(0);
    currentPlayerHasFinished = false;
    firstPlayerInProgress = true;
    totalStrokes = 0;
}

function keyboardHandler(keyCode){
    let key = {
        code: keyCode,
        isDown: false,
        isUp: true,
        downHandler: (event) => {
            if(event.keyCode === key.code) {
                if(key.isUp && key.press) key.press(event);
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        },
        upHandler: (event) => {
            if(event.keyCode === key.code){
                if(key.isDown && key.release) key.release(event);
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        }
    };
    
    window.addEventListener("keydown", key.downHandler.bind(key), false);

    window.addEventListener("keyup", key.upHandler.bind(key), false);

    return key;
}

function setupTouchEvents(btn, textureName, clickFn) {
    btn.buttonMode = true;
    btn.interactive = true;
    btn
        .on('mousedown', onButtonDown)
        .on('touchstart', onButtonDown)
        .on('mouseup', onButtonUp)
        .on('touchend', onButtonUp)
        .on('mouseupoutside', onButtonUp)
        .on('touchendoutside', onButtonUp)
        .on('mouseover', onButtonOver)
        .on('mouseout', onButtonOut)
        
	btn.tap = clickFn;
	btn.click = clickFn;

    function onButtonDown() {
        this.isdown = true;
        this.texture = Texture.fromFrame(textureName+"-click.png");
        this.alpha = 1;
    }

    function onButtonUp() {
        this.isdown = false;
        if (this.isOver)
        {
            this.texture = Texture.fromFrame(textureName+"-hover.png");
        }
        else
        {
            this.texture = Texture.fromFrame(textureName+".png");
        }
    }

    function onButtonOver() {
        this.isOver = true;
        if (this.isdown)
        {
            return;
        }
        this.texture = Texture.fromFrame(textureName+"-hover.png");;
    }

    function onButtonOut() {
        this.isOver = false;
        if (this.isdown)
        {
            return;
        }
        this.texture = Texture.fromFrame(textureName+".png");;
    }

}