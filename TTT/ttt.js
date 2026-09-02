// ---------- Tic Tac Toe Sounds (standalone) ----------
const tttSounds = {
  click: new Audio("sounds/click.mp3"),
  win: new Audio("sounds/win.mp3"),
  draw: new Audio("sounds/draw.mp3")
};

tttSounds.click.volume = 0.3;
tttSounds.win.volume = 0.5;
tttSounds.draw.volume = 0.4;

let tttSoundEnabled = false;

const tttSoundBtn = document.getElementById("ttt-sound-btn");

function updateTttSoundButton() {
  if (!tttSoundBtn) return;
  tttSoundBtn.textContent = tttSoundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
}

function playTttSound(name) {
  if (!tttSoundEnabled) return;

  const sound = tttSounds[name];
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
}

if (tttSoundBtn) {
  tttSoundBtn.addEventListener("click", async () => {
    tttSoundEnabled = !tttSoundEnabled;

    // Unlock audio on first user gesture (mobile-friendly)
    if (tttSoundEnabled) {
      try {
        tttSounds.click.muted = true;
        await tttSounds.click.play();
        tttSounds.click.pause();
        tttSounds.click.currentTime = 0;
        tttSounds.click.muted = false;
      } catch {}
    } else {
      tttSounds.click.pause();
      tttSounds.win.pause();
      tttSounds.draw.pause();
    }

    updateTttSoundButton();
  });
}

updateTttSoundButton();
// ------------------------------------------------------

        function ticTacToe() {
    const msg = document.querySelector("#msg");
    // Tic-Tac-Toe code
}

        let boxes = document.querySelectorAll(".box");
        let resetBtn = document.querySelector("#reset-btn");
        let newGameBtn = document.querySelector("#new-btn");
        let msgContainer = document.querySelector(".msg-container2");
        let tttmsg = document.querySelector("#msg");

        let userTurn = true; //playerX, playerY//
        const winPatterns = [
          [0, 1, 2],
          [0, 3, 6],
          [0, 4, 8],
          [1, 4, 7],
          [2, 5, 8],
          [2, 4, 6],
          [3, 4, 5],
          [6, 7, 8],
        ];



// reset button

         const resetGame = () => {
          userTurn = true;
          enableBoxes();

              // Clear the winner message
           tttmsg.innerText = "";
          msgContainer.classList.add("hide");
        };


        
        const enableBoxes = () => {
          boxes.forEach((box) => {
            box.disabled = false;
            box.innerText = "";

            box.classList.remove("x-color");
            box.classList.remove("o-color");

          });
        };

        // User Click
        boxes.forEach((box) => {
          box.addEventListener("click", () => {
            
            if(box.innerText !== "") {
              return;
            }

            //User move
            if (userTurn) {
              box.innerText = "O";
              box.classList.add("o-color");
              box.disabled = true;

            playTttSound("click"); // <-- add this

              let winnerFound = checkWinner();

              if (!winnerFound) {
                userTurn = false;

                // computor move after short delay
                setTimeout(computorMove, 500);
              }
            }
          });
        });

        const hasWinner = (player) => {

    for (let pattern of winPatterns) {

        let pos1 = boxes[pattern[0]].innerText;
        let pos2 = boxes[pattern[1]].innerText;
        let pos3 = boxes[pattern[2]].innerText;

        if (
            pos1 === player &&
            pos2 === player &&
            pos3 === player
        ) {
            return true;
        }
    }

    return false;
};

        // computor move 

        const computorMove = () => {

    console.log("Computer's turn");

    let emptyBoxes = [];

    boxes.forEach((box, index) => {
        if (box.innerText === "") {
            emptyBoxes.push(index);
        }
    });

    // Board is full
    if (emptyBoxes.length === 0) {
        userTurn = true;
        return;
    }

    // ==========================================
    // 1. COMPUTER CAN WIN
    // ==========================================

    for (let index of emptyBoxes) {

        boxes[index].innerText = "X";

        if (hasWinner("X")) {

            boxes[index].classList.add("x-color");
            boxes[index].disabled = true;

             playTttSound("click"); // <-- add here

            checkWinner();

            userTurn = true;
            return;
        }

        boxes[index].innerText = "";
    }


    // ==========================================
    // 2. BLOCK PLAYER FROM WINNING
    // ==========================================

    for (let index of emptyBoxes) {

        boxes[index].innerText = "O";

        if (hasWinner("O")) {

            boxes[index].innerText = "X";
            boxes[index].classList.add("x-color");
            boxes[index].disabled = true;

             playTttSound("click");

            checkWinner();

            userTurn = true;
            return;
        }

        boxes[index].innerText = "";
    }


    // ==========================================
    // 3. TAKE THE CENTRE
    // ==========================================

    if (boxes[4].innerText === "") {

        boxes[4].innerText = "X";
        boxes[4].classList.add("x-color");
        boxes[4].disabled = true;

        playTttSound("click"); 


        checkWinner();

        userTurn = true;
        return;
    }


    // ==========================================
    // 4. TAKE A CORNER
    // ==========================================

    const corners = [0, 2, 6, 8];

    const availableCorners = corners.filter(
        index => boxes[index].innerText === ""
    );

    if (availableCorners.length > 0) {

        const randomCorner =
            availableCorners[
                Math.floor(Math.random() * availableCorners.length)
            ];

        boxes[randomCorner].innerText = "X";
        boxes[randomCorner].classList.add("x-color");
        boxes[randomCorner].disabled = true;

        playTttSound("click"); 

        checkWinner();

        userTurn = true;
        return;
    }


    // ==========================================
    // 5. RANDOM MOVE
    // ==========================================

    const randomIndex =
        emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];

    boxes[randomIndex].innerText = "X";
    boxes[randomIndex].classList.add("x-color");
    boxes[randomIndex].disabled = true;

    playTttSound("click"); 

    checkWinner();

    userTurn = true;
};
// show winner

      const showWinner = (winner) => {

    tttmsg.innerText = `🎉 Congratulations, Winner is ${winner}!`;

    msgContainer.classList.remove("hide");
    playTttSound("win");

    disableBoxes();

    setTimeout(() => {
        resetGame();
    }, 3000);

    console.log("Winner is:", winner);
};

// check winner

        const checkWinner = () => {
          for(let pattern of winPatterns) {
           
            let pos1Val = boxes[pattern[0]].innerText;
            let pos2Val = boxes[pattern[1]].innerText;
            let pos3Val = boxes[pattern[2]].innerText;

            if(pos1Val != "" && 
               pos2Val != "" && 
               pos3Val != "")  {
                
                if (pos1Val === pos2Val && 
                    pos2Val === pos3Val) {

                        playTttSound("draw")

              showWinner(pos1Val);

              return true;
            }
            }
          }
          return false;
        };

       newGameBtn.addEventListener("click", resetGame);
       resetBtn.addEventListener("click", resetGame);

