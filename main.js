const HTMLboard = document.getElementById('board');
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
const approveTie = document.getElementById('approve_tie');
const denyTie = document.getElementById('deny_tie');
let isWhiteTurn = true;
let isGameEnded = false;
let isInEatingRow = false;
let selectedPiece;
let whitesCount = 12;
let blacksCount = 12;
const board = [];
const Piece = function(isEmpty,isWhite){
    this.isEmpty = isEmpty;
    this.isWhite = isWhite;
    this.isKing = false;
    this.isFocused = false;
    this.isLegalMove = false;
    this.isCanEat = false;
    this.isAte = false;
    this.isCanEatCheck = ()=>{
        const pieceIndex = board.indexOf(this);
        const optionalEatIndexes=[pieceIndex-14,pieceIndex+14,pieceIndex-18,pieceIndex+18]
        for(index of optionalEatIndexes){
            if(index<64 && index>0 && this.isMoveLegal(index)){
                return true;
            }
        }
        return false;
    }
    this.toHTMLclass = ()=>{
        if(this.isEmpty){
            let message = "empty_piece"+this.isLegalMove?' legal_move':'';
            return 'piece empty_piece'+ (this.isLegalMove?' legal_move':'');
        }
        else{
            return 'piece ' + (this.isWhite?'white_piece':'black_piece') + (this.isKing?(this.isWhite?' white_king':' black_king'):'')+(this.isFocused?' focus_piece':'');
        }
    }
    this.move = (moveToIndex)=>{
        if(this.isMoveLegal(moveToIndex)){
            setPiecesCanEat(this.isWhite);
            if(this.isEatLegal(moveToIndex)){
                const eatenPieceIndex = this.getEatenPieceIndex(moveToIndex);
                board[eatenPieceIndex].isEmpty = true;
                isWhiteTurn?blacksCount--:whitesCount--;
                this.isAte = true;
                removeAllCanEat();
            }
            let moveToPiece = board[moveToIndex];
            let thisIndex = board.indexOf(this);
            board[moveToIndex] = this;
            board[thisIndex] = moveToPiece;
            if(moveToIndex < 8||moveToIndex > 55){
                this.isKing = true;
            }
            if(this.isAte && this.isCanEatCheck()){
                isInEatingRow = true;
                removeLegalMoves();
                SetLegalMoves(board.indexOf(this));
                drawBoard();
            }
            else{isInEatingRow = false;}
            this.isAte = false;
            burnPlayerPieces();
            return true;
        }
        return false;
    }
    this.isMoveLegal = (moveToIndex)=>{
        if(!(board[moveToIndex].isEmpty)||isIndexSquareWhite(moveToIndex)){
            return false;
        }
        if(!(this.isKing)){
            if((!this.isWhite && moveToIndex<board.indexOf(this))||(this.isWhite && moveToIndex>board.indexOf(this))){
                return false;
            }
        }
        if(this.isEatLegal(moveToIndex)){
            return true
        }
        if(Math.abs(board.indexOf(this)-moveToIndex) !== 7 && Math.abs(board.indexOf(this)-moveToIndex) !== 9){
            return false;
        }
        if(isInEatingRow&&!this.isEatLegal(moveToIndex)){
            return false;
        }
        return true;
    }
    this.isEatLegal = (moveToIndex) =>{
        let eatenPositionIndex = this.getEatenPieceIndex(moveToIndex);
        if(eatenPositionIndex === -1){
            return false;
        }
        if(board[eatenPositionIndex].isEmpty){
            return false;
        }
        if((board[eatenPositionIndex].isWhite&&this.isWhite)
        ||((!board[eatenPositionIndex].isWhite&&!this.isWhite))){
            return false;
        }
        return true;
    }
    this.getEatenPieceIndex = (moveToIndex)=>{
        let eatenPositionIndex;
        switch(parseInt(moveToIndex)-parseInt(board.indexOf(this))){
            case 14:eatenPositionIndex = board.indexOf(this) + 7;break;
            case -14:eatenPositionIndex = board.indexOf(this) - 7;break;
            case 18:eatenPositionIndex = board.indexOf(this) + 9;break;
            case -18:eatenPositionIndex = board.indexOf(this)  - 9;break;
            default:eatenPositionIndex = -1;break;
        }
        return eatenPositionIndex;
    }
}
let index = 0
for(let i=0;i<3;i++){
    for(let j=0;j<4;j++){
        if (i!==1){
            board[index] = new Piece(true,true);
            index++;
            board[index] = new Piece(false,false);
            index++;
        }
        else{
            board[index] = new Piece(false,false);
            index++;
            board[index] = new Piece(true,true);
            index++;
        }
    }
}
for(let i=0;i<2;i++){
    for(let j=0;j<8;j++){
        board[index] = new Piece(true,true);
        index++;
    }
}
for(let i=0;i<3;i++){
    for(let j=0;j<4;j++){
        if (i!==1){
            board[index] = new Piece(false,true);
            index++;
            board[index] = new Piece(true,true);
            index++;
        }
        else{
            board[index] = new Piece(true,true);
            index++;
            board[index] = new Piece(false,true);
            index++;
        }
    }
}
for(let i = 0; i<8;i++){ // drawing board
    for(let j = 0; j<8;j++){
        const square = document.createElement('div');
        if (i%2 === 0)
            square.className = j%2 === 0?'white_square':'black_square'; 
        else
            square.className = j%2 === 0?'black_square':'white_square';
        HTMLboard.appendChild(square);
    }
}
const HTMLsquares = HTMLboard.children;
for(let i = 0; i<64; i++){
    HTMLsquares[i].id = i;
    newPiece = document.createElement('div');
    HTMLsquares[i].appendChild(newPiece);
}
drawBoard();
document.body.addEventListener('click',()=>{ //cancel focuses
    if(!isInEatingRow){
        cancelFocuses();
        drawBoard();
    }
})
const HTMLpieces = document.querySelectorAll('.piece');
for(piece of HTMLpieces){//select piece listener
    piece.addEventListener("click",(event)=>{
        const pieceIndex = event.target.parentElement.id;
        if (!board[pieceIndex].isEmpty){
            event.stopPropagation();
            if(!isInEatingRow){
                cancelFocuses();
                drawBoard();
            }
            if((isWhiteTurn&&board[pieceIndex].isWhite)||(!isWhiteTurn&&!board[pieceIndex].isWhite)){
                board[pieceIndex].isFocused = true;
                selectedPiece = board[pieceIndex];
                SetLegalMoves(pieceIndex);
                drawBoard();
            }
        } 
    })
}
for(square of HTMLsquares){ // move event listener
    square.addEventListener('click',(event)=>{
        if(selectedPiece !== undefined){
            if(selectedPiece.move(parseInt(event.currentTarget.id))){
                if(!isInEatingRow){
                    isWhiteTurn = !isWhiteTurn;
                    whitesTurnShower.className = isWhiteTurn? "":"other_player_turn";
                    blacksTurnSower.className = !isWhiteTurn? "":"other_player_turn"
                }
                drawBoard();
                if(whitesCount === 0||blacksCount === 0){
                    isGameEnded = true;
                    modalBackground.className = 'modal_background';
                    endGameModal.className = 'modal';
                    endGameMessage.innerHTML = whitesCount === 0?'Black wins!!!':'White wins!!!';
                }
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
function isPieceCanEat(pieceIndex){
    const optionalEatIndexes=[pieceIndex-14,pieceIndex+14,pieceIndex-18,parseIntpieceIndex+18]
    for(index of optionalEatIndexes){
        if(index<64 && index>0 && board[pieceIndex].isMoveLegal(index)){
            return true;
        }
    }
    return false;
}
function isPieceCanMove(piece){
    for(square of HTMLsquares){
        if(isMoveLegal(piece,square)){
            return true;
        }
    }
    return false;
}
function burnPlayerPieces(){
    for(piece of board){
        if(!piece.isEmpty&&piece.isCanEat){
            piece.isEmpty = true;
            isWhiteTurn?whitesCount--:blacksCount--;
        }
    }
}
function setPiecesCanEat(isWhite){
    for(piece of board){
        if(piece.isWhite === isWhite&&piece.isCanEatCheck())
            piece.isCanEat = true;
    }
}
function removeAllCanEat(isWhite){
    for(piece of board){
        piece.isCanEat = false;
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
function SetLegalMoves(movingPieceIndex){
    for(piece of board){
        if(board[movingPieceIndex].isMoveLegal(board.indexOf(piece))){
            piece.isLegalMove = true;
        }
    }
}
function removeLegalMoves(){
    for(piece of board){
        piece.isLegalMove = false;
    }
}
function drawBoard(){
    for(square of HTMLsquares){
        square.firstChild.className = board[square.id].toHTMLclass();
    }
}
function cancelFocuses(){
    for(piece of board){
        if(piece.isFocused){
            piece.isFocused = false;
            removeLegalMoves();
            selectedPiece = undefined;
        }
    }
}
function isIndexSquareWhite(index){
    whitesIndexes = [0,2,4,6,9,11,13,15,16,18,20,22,25,27,29,31,32,34,36,38,41,43,45,47,48,50,52,54,57,59,61,63]
    return whitesIndexes.includes(index);
}