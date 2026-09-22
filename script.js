const supabaseUrl = "https://hafcryomtzafbpgjidfu.supabase.co"
const supabaseKey = "sb_publishable__T-h03MVVHjQlUPUBgJrow_iAUvmKYl"
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

const container = document.querySelector(".container")
const tiles = document.querySelectorAll(".tiles")
const blank = document.querySelector(".blank")
const movesDisplay = document.getElementById("moves")
const timeDisplay = document.getElementById("time")
const newGameButton = document.getElementById("newGame")
const dropdown = document.getElementById("dropdown")
const winMessage = document.getElementById("winMessage")
const accountError = document.getElementById("accountError")

let size = 3
let board = []
let blankIndex = 8
let moves = 0
let seconds = 0
let timer = null
let gameStarted = false
let gameOver = false


function createBoard() {
    board = []

    for (let i = 1; i < size * size; i++) {
        board.push(i)
    }

    board.push(0)
    blankIndex = board.length - 1
}


function renderBoard() {
    container.innerHTML = ""

    for (let i = 0; i < board.length; i++) {
        const tile = document.createElement("div")

        if (board[i] === 0) {
            tile.className = "blank"
        } else {
            tile.className = "tiles"
            tile.textContent = board[i]

            tile.addEventListener("click", () => {
                moveTile(i)
            })
        }

        container.appendChild(tile)
    }

    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`
}


function canMove(index) {
    const row = Math.floor(index / size)
    const col = index % size

    const blankRow = Math.floor(blankIndex / size)
    const blankCol = blankIndex % size

    return (
        (row === blankRow && Math.abs(col - blankCol) === 1) ||
        (col === blankCol && Math.abs(row - blankRow) === 1)
    )
}


function moveTile(index) {
    if (gameOver) {
        return
    }

    if (!canMove(index)) {
        return
    }

    if (!gameStarted) {
        gameStarted = true
        startTimer()
    }

    board[blankIndex] = board[index]
    board[index] = 0
    blankIndex = index

    moves++

    movesDisplay.textContent = `Moves: ${moves}`

    renderBoard()
    checkWin()
}


function moveWithKeyboard(direction) {
    if (gameOver) {
        return
    }

    const row = Math.floor(blankIndex / size)
    const col = blankIndex % size

    let targetIndex = -1

    if (direction === "up" && row < size - 1) {
        targetIndex = blankIndex + size
    }

    if (direction === "down" && row > 0) {
        targetIndex = blankIndex - size
    }

    if (direction === "left" && col < size - 1) {
        targetIndex = blankIndex + 1
    }

    if (direction === "right" && col > 0) {
        targetIndex = blankIndex - 1
    }

    if (targetIndex !== -1) {
        moveTile(targetIndex)
    }
}


document.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    }
    if (overlay.style.display === "block") {
        return
    }

    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        moveWithKeyboard("up")
    }

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        moveWithKeyboard("down")
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        moveWithKeyboard("left")
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        moveWithKeyboard("right")
    }
})


function shuffleBoard() {
    const shuffleMoves = 150

    for (let i = 0; i < shuffleMoves; i++) {
        const possibleMoves = []

        const row = Math.floor(blankIndex / size)
        const col = blankIndex % size

        if (row > 0) {
            possibleMoves.push(blankIndex - size)
        }

        if (row < size - 1) {
            possibleMoves.push(blankIndex + size)
        }

        if (col > 0) {
            possibleMoves.push(blankIndex - 1)
        }

        if (col < size - 1) {
            possibleMoves.push(blankIndex + 1)
        }

        const randomIndex =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

        board[blankIndex] = board[randomIndex]
        board[randomIndex] = 0
        blankIndex = randomIndex
    }

    if (checkSolved()) {
        shuffleBoard()
    }
}


function checkSolved() {
    for (let i = 0; i < board.length - 1; i++) {
        if (board[i] !== i + 1) {
            return false
        }
    }

    return board[board.length - 1] === 0
}


async function checkWin() {
    if (!checkSolved()) {
        return
    }

    gameOver = true

    if (timer !== null) {
        clearInterval(timer)
        timer = null
    }

    winMessage.textContent = `You won in ${moves} moves and ${seconds.toFixed(1)} seconds!`

    if (currentUser) {
        await saveScore()
    } else {
        console.log("No user is logged in.")
    }
}


function startTimer() {
    timer = setInterval(() => {
        seconds += 0.1
        timeDisplay.textContent = `Time: ${seconds.toFixed(1)}`
    }, 100)
}


function resetGame() {
    if (timer !== null) {
        clearInterval(timer)
        timer = null
    }

    moves = 0
    seconds = 0
    gameStarted = false
    gameOver = false

    movesDisplay.textContent = "Moves: 0"
    timeDisplay.textContent = "Time: 0"
    winMessage.textContent = ""

    createBoard()
    shuffleBoard()
    renderBoard()
}


newGameButton.addEventListener("click", () => {
    resetGame()
})


dropdown.addEventListener("change", () => {
    size = Number(dropdown.value)

    resetGame()
})


// ====================
// ACCOUNT / SUPABASE
// ====================

const login = document.getElementById("login")
const signup = document.getElementById("signup")
const overlay = document.getElementById("overlay")
const accountPanel = document.getElementById("accountPanel")
const closePanel = document.getElementById("closePanel")

const loginH2 = document.getElementById("loginH2")
const loginButton = document.getElementById("loginButton")
const signupLink = document.getElementById("signupLink")
const accountText = document.getElementById("accountText")

const username = document.getElementById("username")
const email = document.getElementById("email")
const password = document.getElementById("password")

const emailLabel = document.getElementById("emailLabel")
const form = document.querySelector("form")

let isSignupMode = false
let currentUser = null


function openAccountPanel() {
    overlay.style.display = "block"
    accountPanel.style.display = "block"
}


function closeAccountPanel() {
    overlay.style.display = "none"
    accountPanel.style.display = "none"
}


function showSignupMode() {
    isSignupMode = true

    openAccountPanel()

    loginH2.textContent = "Sign up"
    loginButton.textContent = "Sign up"

    signupLink.textContent = "Log in"
    accountText.textContent = "Already have an account? "

    email.style.display = "block"
    emailLabel.style.display = "block"

    accountPanel.style.height = "435px"

    email.required = true

    form.reset()
    accountError.textContent = ""
}


function showLoginMode() {
    isSignupMode = false

    openAccountPanel()

    loginH2.textContent = "Log in"
    loginButton.textContent = "Log in"

    signupLink.textContent = "Sign up"
    accountText.textContent = "Don't have an account? "

    email.style.display = "block"
    emailLabel.style.display = "block"

    accountPanel.style.height = "435px"

    email.required = true

    form.reset()
    accountError.textContent = ""
}


login.addEventListener("click", () => {
    showLoginMode()
})


signup.addEventListener("click", () => {
    showSignupMode()
})


signupLink.addEventListener("click", () => {
    if (isSignupMode) {
        showLoginMode()
    } else {
        showSignupMode()
    }
})


closePanel.addEventListener("click", () => {
    closeAccountPanel()
})


form.addEventListener("submit", async (event) => {
    event.preventDefault()

    const usernameValue = username.value.trim()
    const emailValue = email.value.trim()
    const passwordValue = password.value

    loginButton.disabled = true

    if (isSignupMode) {

        if (usernameValue.length < 2) {
            alert("Username must be at least 2 characters.")
            loginButton.disabled = false
            return
        }

        if (usernameValue.length > 25) {
            alert("Username must be 25 characters or less.")
            loginButton.disabled = false
            return
        }

        if (!emailValue) {
            alert("Please enter an email.")
            loginButton.disabled = false
            return
        }

        if (passwordValue.length < 6) {
            alert("Password must be at least 6 characters.")
            loginButton.disabled = false
            return
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email: emailValue,
            password: passwordValue,
            options: {
                data: {
                    username: usernameValue
                }
            }
        })

        if (error) {
            const message = error.message.toLowerCase()

            if (
                message.includes("duplicate") ||
                message.includes("unique") ||
                message.includes("profiles_username_key")
            ) {
                alert("Username already reserved.")
            } else {
                alert(error.message)
            }

            loginButton.disabled = false
            return
        }

        currentUser = data.user

        if (data.session) {
            alert("Account created successfully!")
        } else {
            alert("Account created! Check your email to confirm your account.")
        }

        form.reset()
        closeAccountPanel()
        resetGame()

    } else {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: emailValue,
                password: passwordValue
            })

        if (error) {
            const message = error.message.toLowerCase()

            if (message.includes("missing email") || message.includes("missing email or phone")) {
                accountError.textContent = "Please enter your email."
            } else if (message.includes("invalid login credentials")) {
                accountError.textContent = "No such account or incorrect password."
            } else {
                accountError.textContent = error.message
            }

            loginButton.disabled = false
            return
        }

        currentUser = data.user

        alert("Logged in successfully!")
        resetGame()

        form.reset()
        closeAccountPanel()
    }

    loginButton.disabled = false
})


// ====================
// LOGIN STATE
// ====================

async function checkLogin() {
    const { data, error } = await supabaseClient.auth.getUser()

    if (error) {
        currentUser = null
        updateAccountButtons()
        resetGame()
        return
    }

    currentUser = data.user

    updateAccountButtons()
}


supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        currentUser = session.user
    } else {
        currentUser = null
    }

    updateAccountButtons()
})


function updateAccountButtons() {
    if (currentUser) {
        login.textContent = "Log out"
        signup.style.display = "none"
    } else {
        login.textContent = "Log in"
        signup.style.display = "block"
    }
}


login.addEventListener("click", async () => {
    if (!currentUser) {
        showLoginMode()
        return
    }

    const { error } = await supabaseClient.auth.signOut()

    if (error) {
        alert(error.message)
        return
    }

    currentUser = null
    updateAccountButtons()
})

async function getUsername() {
    if (!currentUser) {
        return null
    }

    return currentUser.user_metadata?.username || null
}




async function saveScore() {
    if (!currentUser) {
        return
    }

    const username = await getUsername()

    if (!username) {
        return
    }

    const calculatedScore = Math.max(
        100,
        Math.round(
            size * size * 1000 -
            moves * 8 -
            seconds * 3
        )
    )

    const { error } = await supabaseClient
        .from("scores")
        .insert({
            user_id: currentUser.id,
            player: username,
            score: calculatedScore,
            moves: moves,
            time: Math.round(seconds * 10),
            puzzle: size
        })

    if (error) {
        console.error("Failed to save score:", error)
        return
    }

    console.log("Score saved successfully!")
}

async function loadScores() {
    const { data, error } = await supabaseClient
        .from("scores")
        .select("player, score, moves, time, puzzle")
        .order("score", { ascending: false })

    if (error) {
        console.error("Failed to load scores:", error)
        return
    }
    const scoreList = document.getElementById("scoreList")
    const highestScores = {}
    data.forEach((score) => {
        if (!highestScores[score.player] || score.score > highestScores[score.player].score) {
            highestScores[score.player] = score
        }
    })
    scoreList.innerHTML = ""
    const scoreHeader = document.createElement("div")
    scoreHeader.className = "score-header"
    const rankHeader = document.createElement("span")
    rankHeader.textContent = "#"
    scoreHeader.appendChild(rankHeader)
    const playerHeader = document.createElement("span")
    playerHeader.textContent = "Player"
    scoreHeader.appendChild(playerHeader)
    const scoreHeaderText = document.createElement("span")
    scoreHeaderText.textContent = "Score"
    scoreHeader.appendChild(scoreHeaderText)
    const movesHeader = document.createElement("span")
    movesHeader.textContent = "Moves"
    scoreHeader.appendChild(movesHeader)
    const timeHeader = document.createElement("span")
    timeHeader.textContent = "Time"
    scoreHeader.appendChild(timeHeader)
    const sizeHeader = document.createElement("span")
    sizeHeader.textContent = "Size"
    scoreHeader.appendChild(sizeHeader)
    scoreList.appendChild(scoreHeader)
    Object.values(highestScores).sort((a, b) => b.score - a.score).forEach((score, index) => {
        const scoreEntry = document.createElement("div")
        scoreEntry.className = "score-entry"

        const rank = document.createElement("span")
    rank.textContent = index + 1
    scoreEntry.appendChild(rank)

        const player = document.createElement("span")
        player.textContent = score.player
        scoreEntry.appendChild(player)

        const scoreValue = document.createElement("span")
        scoreValue.textContent = score.score
        scoreEntry.appendChild(scoreValue)

        const movesValue = document.createElement("span")
        movesValue.textContent = score.moves
        scoreEntry.appendChild(movesValue)

        const timeValue = document.createElement("span")
        timeValue.textContent = score.time / 10
        scoreEntry.appendChild(timeValue)

        const sizeValue = document.createElement("span")
        sizeValue.textContent = `${score.puzzle}x${score.puzzle}`
        scoreEntry.appendChild(sizeValue)

        scoreList.appendChild(scoreEntry)
    });
    console.log("Scores loaded:", data)
    await loadScores()
}


resetGame()
checkLogin()
loadScores()
