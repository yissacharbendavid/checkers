const board = document.getElementById('board');
const modalBackground = document.getElementById('modal_background');
const endGameModal = document.getElementById('end_game_modal');
const resignButton = document.getElementById('resign');
const endGameMessage = document.getElementById('end_game_message');
const askTieModal = document.getElementById('ask_tie_modal');
const newGameButton = document.getElementById('new_game_button');
const closeButton = document.getElementById('close_button');
const askTieButton = document.getElementById('ask_tie_button');
const whitesTurnShower = document.getElementById('whites_turn');
const blacksTurnSower = document.getElementById('blacks_turn');
approveTie = document.getElementById('approve_tie');
denyTie = document.getElementById('deny_tie');
let isWhiteTurn = true;
let isGameEnded = false;
let isInEatingRow = false;
let selectedPiece;
for(let i = 0; i<8;i++){ // drawing board
    for(let j = 0; j<8;j++){
        const square = document.createElement('div');
        if (i%2 === 0)
            square.className = j%2 === 0?'white_square':'black_square'; 
        else
            square.className = j%2 === 0?'black_square':'white_square';
        board.appendChild(square);
    }
}
const squares = board.children;
for(let i = 0; i<64; i++){ // filling board
    squares[i].id = i;
    const piece =  document.createElement('div')
    if (squares[i].className === "white_square"){
        piece.className = 'piece empty_piece';
        squares[i].appendChild(piece);
    }
    else{
        if(i<24){
            piece.className = 'piece black_piece';
            squares[i].appendChild(piece); 
        }
        else if(i<40){
            piece.className = 'piece empty_piece';
            squares[i].appendChild(piece); 
        }
        else{
            piece.className = 'piece white_piece';
            squares[i].appendChild(piece); 
        }
    }
}
document.body.addEventListener('click',()=>{ //cancel focuses
    if(!isInEatingRow){
        for(square of squares){
            square.firstChild.classList.remove('focus_piece');
            selectedPiece = undefined;
            removeLegalMoves();
        }
    }
})
const pieces = document.querySelectorAll('.piece');
for(piece of pieces){//select piece listener
    piece.addEventListener("click",(event)=>{
        if (!event.target.classList.contains('empty_piece')&&!event.target.classList.contains('legal_move')){
            event.stopPropagation();
            if(!isInEatingRow){
                for(square of squares){
                    square.firstChild.classList.remove('focus_piece');
                    selectedPiece = undefined;
                    removeLegalMoves();
                }
                if((isWhiteTurn&&event.currentTarget.classList.contains('white_piece'))||
                (!isWhiteTurn&&event.currentTarget.classList.contains('black_piece'))){
                    event.currentTarget.classList.add('focus_piece');
                    selectedPiece = event.currentTarget;
                    ShowLegalMoves();
                }
            }
        }  
    })
}
for(square of squares){ // move event listener
    square.addEventListener('click',(event)=>{
        if(selectedPiece != undefined && isMoveLegal(selectedPiece,event.currentTarget)){
            setIfPieceCanEatbeforeTurn(isWhiteTurn);
            let isEatMade = false;
            let isMovedPieceKing = selectedPiece.classList.contains("white_king")||selectedPiece.classList.contains("black_king");
            selectedPiece.classList.remove(isWhiteTurn?'white_piece':'black_piece');
            selectedPiece.classList.remove(isWhiteTurn?'white_king':'black_king');
            selectedPiece.classList.add('empty_piece');
            event.currentTarget.firstChild.classList.remove('empty_piece');
            event.currentTarget.firstChild.classList.add(isWhiteTurn?'white_piece':'black_piece');
            if(isMovedPieceKing){
                event.currentTarget.firstChild.classList.add(isWhiteTurn?'white_king':'black_king');
            }
            if(selectedPiece.classList.contains('can_eat')){
                selectedPiece.classList.remove('can_eat')
                event.currentTarget.firstChild.classList.add('can_eat');
            }
            if(isEatLegal(selectedPiece,event.currentTarget)){
                const eatenPositionIndex = getEatenPositionIndex(selectedPiece,event.currentTarget);
                squares[eatenPositionIndex].firstChild.classList.remove(isWhiteTurn?'black_piece':'white_piece');
                squares[eatenPositionIndex].firstChild.classList.remove(isWhiteTurn?'white_king':'black_king');
                squares[eatenPositionIndex].firstChild.classList.add('empty_piece');
                isEatMade = true;
            }
            if(event.currentTarget.id < 8||event.currentTarget.id > 55){
                event.currentTarget.firstChild.classList.add(isWhiteTurn?'white_king':'black_king');
            }
            if(isEatMade){
                if(isPieceCanEat(event.currentTarget.firstChild)){
                    isInEatingRow = true;
                    selectedPiece.classList.remove('focus_piece');
                    selectedPiece = event.currentTarget.firstChild;
                    selectedPiece.classList.add('focus_piece');
                    removeLegalMoves();
                    ShowLegalMoves();
                }
                else{
                    isInEatingRow = false;
                }
            }
            burnPlayerPieces(isWhiteTurn,isEatMade);
            if(!isPlayerHaveLegalMoves(isWhiteTurn)){
                isGameEnded = true;
                modalBackground.className = 'modal_background';
                endGameModal.className = 'modal';
                endGameMessage.innerHTML = (isWhiteTurn?'Black':'White') + ' wins!!!';
            }
            if(!isPlayerHaveLegalMoves(!isWhiteTurn)){
                isGameEnded = true;
                modalBackground.className = 'modal_background';
                endGameModal.className = 'modal';
                endGameMessage.innerHTML = (!isWhiteTurn?'Black':'White') + ' wins!!!';
            }
            if(!isInEatingRow){
                    whitesTurnShower.className = isWhiteTurn?'other_player_turn':'';
                    blacksTurnSower.className = isWhiteTurn?'':'other_player_turn';
                isWhiteTurn = !isWhiteTurn;
            }
        }
    })
}
modalBackground.addEventListener('click',()=>{
    modalBackground.className = 'none';
    endGameModal.className = 'none';
    askTieModal.className = 'none';
    if(isGameEnded){ removeAllEvents();}
})
endGameModal.addEventListener('click',(event)=>{event.stopPropagation()})
askTieModal.addEventListener('click',(event)=>{event.stopPropagation()})
askTieButton.addEventListener('click',()=>{
    const askTieMessage = document.getElementById('ask_tie_message');
    modalBackground.className = 'modal_background';
    askTieModal.className = 'modal';
    askTieMessage.innerHTML = (isWhiteTurn?'Black':'White') + ', your opponent asked for tie. What do you say?'
})
approveTie.addEventListener('click',()=>{
    endGameModal.className = 'modal';
    askTieModal.className = 'none';
    endGameMessage.innerHTML = "It's a tie!!";
    isGameEnded = true;
})
denyTie.addEventListener('click',()=>{
    modalBackground.className = 'none';
    askTieModal.className = 'none';
})
resignButton.addEventListener('click',()=>{
    modalBackground.className = 'modal_background';
    endGameModal.className = 'modal';
    endGameMessage.innerHTML = (isWhiteTurn?'Black':'White') + ` wins by resignation!`;
    isGameEnded = true;
})
closeButton.addEventListener('click',()=>{
    modalBackground.className = 'none';
    endGameModal.className = 'none';
    removeAllEvents();
})
newGameButton.addEventListener('click',()=>{
    location.reload()
})
function isMoveLegal(piece, moveToSquare){
    const isPieceKing = piece.classList.contains("white_king")||piece.classList.contains("black_king");
    if(moveToSquare.className !== 'black_square' || !moveToSquare.firstChild.classList.contains('empty_piece')){
        return false;
    }
    if(!isPieceKing){
        if(piece.classList.contains('black_piece') && parseInt(moveToSquare.id)<parseInt(piece.parentElement.id)){
            return false;
        }
        if(piece.classList.contains('white_piece') && parseInt(moveToSquare.id)>parseInt(piece.parentElement.id)){
            return false;
        }
    }
    if(isInEatingRow&&!isEatLegal(selectedPiece,moveToSquare)){
        return false;
    }
    if(isEatLegal(piece, moveToSquare)){
        return true;
    }
    if(Math.abs(parseInt(moveToSquare.id)-parseInt(piece.parentElement.id)) !== 7
     && Math.abs(parseInt(moveToSquare.id)-parseInt(piece.parentElement.id)) !== 9){
        return false;
    }
    return true;
}
function isEatLegal(piece, moveToSquare){
    let eatenPositionIndex = getEatenPositionIndex(piece, moveToSquare);
    if(eatenPositionIndex === -1){
        return false;
    }
    const eatenPiece = squares[eatenPositionIndex].firstChild;
    if(eatenPiece.classList.contains('empty_piece')){
        return false;
    }
    if((eatenPiece.classList.contains('white_piece')&&piece.classList.contains('white_piece'))
    ||(eatenPiece.classList.contains('black_piece')&&piece.classList.contains('black_piece'))){
        return false;
    }
    return true;
}
function getEatenPositionIndex(piece, moveToSquare){
    let eatenPositionIndex;
    switch(parseInt(moveToSquare.id)-parseInt(piece.parentElement.id)){
        case 14:eatenPositionIndex =parseInt(piece.parentElement.id) + 7;break;
        case -14:eatenPositionIndex = parseInt(piece.parentElement.id) - 7;break;
        case 18:eatenPositionIndex = parseInt(piece.parentElement.id) + 9;break;
        case -18:eatenPositionIndex = parseInt(piece.parentElement.id)  - 9;break;
        default:eatenPositionIndex = -1;break;
    }
    return eatenPositionIndex;
}
function isPieceCanEat(piece){
    const optionalEatIndexes=[parseInt(piece.parentElement.id)-14,parseInt(piece.parentElement.id)+14,
                                parseInt(piece.parentElement.id)-18,parseInt(piece.parentElement.id)+18]
    for(index of optionalEatIndexes){

        if(index<64 && index>0 && isMoveLegal(piece,squares[index])){
            return true;
        }
    }
    return false;
}
function isPieceCanMove(piece){
    for(square of squares){
        if(isMoveLegal(piece,square)){
            return true;
        }
    }
    return false;
}
function isPlayerHaveLegalMoves(isWhite){
    allPlayerPieces = document.querySelectorAll(isWhite?'.white_piece':'.black_piece');
    if(allPlayerPieces.length<1){return false;}
    for(piece of allPlayerPieces){
        if(isPieceCanMove(piece)){
            return true;
        }
    }
    return false;
}
function burnPlayerPieces(isWhite,isEatMade){
    const playerPieces = document.querySelectorAll(isWhite?'.white_piece':'.black_piece');
    if(!isEatMade&&!isInEatingRow){
        for(piece of playerPieces){
            if ((piece.classList.contains('can_eat'))){
                piece.className = 'piece empty_piece';
            }
        }
    }
}
function setIfPieceCanEatbeforeTurn(isWhite){
    const playerPieces = document.querySelectorAll(isWhite?'.white_piece':'.black_piece');
    for(piece of pieces){piece.classList.remove('can_eat');}
    for(piece of playerPieces){
        if (isPieceCanEat(piece)){
            piece.classList.add('can_eat');
        }
    }
}
function removeAllCanEat(isWhite){
    const playerPieces = document.querySelectorAll(isWhite?'.white_piece':'.black_piece');
    for(piece of playerPieces){
            piece.classList.remove('can_eat');
        }
}
function removeAllEvents(){
        askTieButton.className = 'on_board_button empty_button';
        clone = document.body.cloneNode(true);
        document.body.parentElement.appendChild(clone);
        document.body.parentElement.removeChild(document.body);
        const newGameButtonOnDeadScreen = document.getElementById('resign');
        newGameButtonOnDeadScreen.innerHTML = '<h3>New game<h3>';
        newGameButtonOnDeadScreen.addEventListener('click',()=>{
            location.reload()
    })
}
function ShowLegalMoves(){
    for(square of squares){
        if(isMoveLegal(selectedPiece,square)){
            square.firstChild.classList.add('legal_move');
        }
    }
}
function removeLegalMoves(){
    for(let i = 0;i<64;i++){
        if(pieces[i].classList.contains('legal_move')){
            pieces[i].classList.remove('legal_move');
        }
    }
}