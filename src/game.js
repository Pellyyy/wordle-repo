import Modal from "./modal.js"
import { wordlistImport, wordlistValidAnswers } from "./data.js"

const wordlist = wordlistImport.split("\n"),
    delKey = document.querySelector('[data-value="Del"]'),
    enterKey = document.querySelector('[data-value="Enter"]'),
    heading = document.querySelector("h1")

let targetWord = "",
    targetWordArr = [],
    cellId = 1,
    letterCount = 0,
    inputArr = [],
    gameRunning = true,
    win = false

//read out player stats from local storage, set to zero if no key is found
let stats = JSON.parse(localStorage.getItem("gameInfo"))
if (stats === null) {
    stats = {
        totalGames: 0,
        totalWins: 0,
    }
}

const headline = new SplitType("#headline", { types: "chars" }),
    modal = new Modal()

//------------------------------------------ onload animations -----------------------------------------

const firstCell = document.getElementById("1")
const tl = gsap.timeline({
    defaults: { duration: 0.75, ease: "power2.out" },
})

tl.from("header", {
    y: "-100%",
    opacity: 0,
})
tl.from(".char", { y: -25, opacity: 0, stagger: 0.1 }, "<") //headline chars
tl.from(".row1", { y: "200%", opacity: 0 }, "<") //keyboard rows
tl.from(".row2", { y: "200%", opacity: 0 }, "<25%")
tl.from(".row3", { y: "200%", opacity: 0 }, "<25%")

tl.from(
    //field
    ".uneven",
    {
        x: "-500%",
        opacity: 0,
        stagger: { each: 0.1, from: "end" },
    },
    "<"
)
tl.from(".even", { x: "500%", opacity: 0, stagger: 0.1 }, "<") //field

tl.to(
    "header",
    {
        borderBottomColor: "rgb(212, 210, 213)",
        duration: 1.25 * 0.5,
    },
    "<75%"
)
tl.from(".icons-left", { opacity: 0, x: "-200%" }, "<")
tl.from(
    ".icons-right",
    {
        opacity: 0,
        x: "200%",
    },
    "<"
)

tl.set(firstCell, { borderColor: "hsl(37, 59%, 73%)" }) //first cell jumping animation start

tl.to(firstCell, {
    rotate: "10deg",
    y: -10,
    repeat: 1,
    yoyo: true,
    duration: 0.25,
})

tl.set(firstCell, { borderColor: "hsl(140, 47%, 42%)" })

tl.to(firstCell, {
    rotate: "10deg",
    y: -10,
    repeat: 1,
    yoyo: true,
    duration: 0.25,
})

tl.set(firstCell, { borderColor: "hsl(280, 3%, 83%)" })

tl.to(firstCell, {
    rotate: "10deg",
    y: -10,
    duration: 0.25,
})

tl.to(firstCell, {
    rotate: "0deg",
    onComplete: () => {
        updateActiveCell(cellId, "advance")
    },
    y: 0,
    duration: 0.75,
})

tl.set(firstCell, { borderColor: "" })

//------------------------------------------ animation functions ----------------------------------------

function animateInvalid() {
    const tlInvalid = gsap.timeline({
        defaults: { duration: 0.05, ease: "power2.out" },
    })
    tlInvalid.to(".active", {
        x: 5,
    })
    tlInvalid.to(".active", {
        x: -5,
    })
    tlInvalid.to(".active", {
        x: 0,
    })
}

function animateInput() {
    gsap.to(".active", {
        scale: 1.075,
        rotate: "2deg",
        y: -2,
        repeat: 1,
        yoyo: true,
        duration: 0.03,
        ease: "back.out(1)",
    })
}

//-------------------------------------------------------------------------------------------------------

function generateTargetWord(list) {
    targetWord =
        list[Math.floor(Math.random() * (list.length + 1))].toUpperCase()
    targetWordArr = targetWord.split("")
    window.milch = targetWord
}

function updateCell(key) {
    if (!gameRunning || letterCount === 5) return
    const cell = document.getElementById(cellId)
    cell.dataset.letter = key
    cell.dataset.count = letterCount
    animateInput()
    cell.innerText = key
    inputArr.push(key)
    cellId++
    letterCount++
    updateActiveCell(cellId, "advance")
}

function deleteCell() {
    if (!gameRunning) return
    if (
        cellId === 1 ||
        document.getElementById(cellId - 1).classList.contains("evaluated")
    )
        return

    updateActiveCell(cellId, "delete")
    if (cellId > 1) {
        cellId--
    }
    if (letterCount !== 0) {
        letterCount--
    }
    const cell = document.getElementById(cellId)
    delete cell.dataset.letter
    delete cell.dataset.count
    cell.innerText = ""
    inputArr.pop()
}

function submitWord() {
    if (!gameRunning || letterCount !== 5) return
    if (!checkValidWord(inputArr)) {
        animateInvalid()
        return
    }

    compareInput()
    document.querySelectorAll(".active").forEach((cell) => {
        cell.classList.remove("active")
    })

    if (cellId <= 30) {
        document.getElementById(`${cellId}`).classList.add("active")
    }

    //check for win
    if (JSON.stringify(targetWordArr) === JSON.stringify(inputArr)) {
        win = true
        gameRunning = false
        stats.totalGames += 1
        stats.totalWins += 1
        localStorage.setItem("gameInfo", JSON.stringify(stats))
        heading.classList.add("win")
        modal.renderStats(stats.totalGames, stats.totalWins, win, gameRunning)
        modal.open()
    }

    //check for loss
    if (!win && cellId === 31) {
        gameRunning = false
        stats.totalGames += 1
        localStorage.setItem("gameInfo", JSON.stringify(stats))
        modal.renderStats(stats.totalGames, stats.totalWins, win, gameRunning)
        modal.open()
    }

    letterCount = 0
    inputArr = []
}

//check if user input is in the word list
function checkValidWord(arr) {
    const arrayToString = arr.join("").toLowerCase()
    if (wordlistValidAnswers.includes(arrayToString)) {
        return true
    }
}

function compareInput() {
    let targetWordArrCopy = [...targetWordArr]

    for (let i = 0; i < inputArr.length; i++) {
        //handle green/correct cells
        const targetCell = document.querySelector(
            `[data-letter="${inputArr[i]}"][data-count="${i}"]:not(.evaluated)`
        )
        const btn = document.querySelector(`.key[data-value="${inputArr[i]}"]`)
        if (inputArr[i] === targetWordArr[i]) {
            targetCell.dataset.state = "correct"

            btn.classList.remove("contains")
            btn.classList.add("correct")
            targetWordArrCopy[i] = null
        }
    }
    for (let i = 0; i < inputArr.length; i++) {
        //handle yellow/contains cells
        const targetCell = document.querySelector(
            `[data-letter="${inputArr[i]}"][data-count="${i}"]:not(.evaluated)`
        )
        const btn = document.querySelector(`.key[data-value="${inputArr[i]}"]`)
        if (
            targetWordArrCopy.includes(inputArr[i]) &&
            targetCell.dataset.state !== "correct"
        ) {
            targetCell.dataset.state = "contains"

            if (!btn.classList.contains("correct")) {
                btn.classList.add("contains")
            }
        }
        if (
            !btn.classList.contains("contains") &&
            !btn.classList.contains("correct")
        ) {
            btn.classList.add("incorrect")
        }
        targetCell.style.scale = null //overwrites gsap weirdness
        targetCell.classList.add("evaluated")
        const arrayPos = targetWordArrCopy.indexOf(inputArr[i]) //look for matching letter in the target word array and set it to null
        if (arrayPos !== -1) {
            targetWordArrCopy[arrayPos] = null
        }
    }
}

//adds/removes active class from cells --> white border around active cell
function updateActiveCell(cellId, mode) {
    let funcCellId
    cellId === 31 ? (funcCellId = 30) : (funcCellId = cellId)

    if (mode === "advance" && letterCount === 5) {
        if (funcCellId === 30) {
            document.getElementById(funcCellId).classList.add("active")
            document.getElementById(funcCellId - 1).classList.add("active")
            document.getElementById(funcCellId - 2).classList.add("active")
            document.getElementById(funcCellId - 3).classList.add("active")
            document.getElementById(funcCellId - 4).classList.add("active")
            return
        } else {
            document.getElementById(funcCellId - 1).classList.add("active")
            document.getElementById(funcCellId - 2).classList.add("active")
            document.getElementById(funcCellId - 3).classList.add("active")
            document.getElementById(funcCellId - 4).classList.add("active")
            document.getElementById(funcCellId - 5).classList.add("active")
            return
        }
    }
    if (mode === "advance") {
        document.getElementById(funcCellId).classList.add("active")
        if (funcCellId > 1) {
            document.getElementById(funcCellId - 1).classList.remove("active")
        }
    }
    if (mode === "delete" && letterCount === 5) {
        if (funcCellId === 30) {
            document.getElementById(funcCellId - 1).classList.remove("active")
            document.getElementById(funcCellId - 2).classList.remove("active")
            document.getElementById(funcCellId - 3).classList.remove("active")
            document.getElementById(funcCellId - 4).classList.remove("active")
            return
        } else {
            document.getElementById(funcCellId - 1).classList.remove("active")
            document.getElementById(funcCellId - 2).classList.remove("active")
            document.getElementById(funcCellId - 3).classList.remove("active")
            document.getElementById(funcCellId - 4).classList.remove("active")
            document.getElementById(funcCellId - 5).classList.remove("active")
        }
    }
    if (mode === "delete") {
        if (funcCellId > 1) {
            document.getElementById(funcCellId).classList.remove("active")
            document.getElementById(funcCellId - 1).classList.add("active")
        }
    }
}

generateTargetWord(wordlist)

//listen for keyboard inputs
document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase()
    if (key.match(/^[A-Z]$/)) {
        updateCell(key)
    }
    if (key === "ENTER") {
        submitWord()
    }
    if (key === "BACKSPACE") {
        deleteCell()
    }
})

//listen for button clicks
document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("click", () => {
        const pressedKey = key.innerText
        updateCell(pressedKey)
    })
})

//handle modal clicks
document.querySelector(".score-btn").addEventListener("click", () => {
    modal.renderStats(stats.totalGames, stats.totalWins, win, gameRunning)
    modal.open()
})

document.querySelector(".overlay").addEventListener("click", () => {
    modal.close()
})

document.querySelector(".clear-btn").addEventListener("click", () => {
    modal.clearStats()
})

delKey.addEventListener("click", deleteCell)
enterKey.addEventListener("click", submitWord)
