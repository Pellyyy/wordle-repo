export default class Modal {
    constructor() {
        this.container = document.querySelector(".modal-container")
        this.overlay = document.querySelector(".overlay")
        this.totalGames = document.querySelector(".total-games")
        this.totalWins = document.querySelector(".total-wins")
        this.winrate = document.querySelector(".winrate")
        this.resultMsg = document.querySelector(".resultmsg")
    }

    renderStats(totalGames, totalWins, win, gameRunning) {
        //create stats
        const statTotalGames = totalGames,
            statTotalWins = totalWins,
            statWinrate = Math.round((totalWins / totalGames) * 100)
        //render stats
        this.totalGames.innerText = statTotalGames
        this.totalWins.innerText = statTotalWins
        isNaN(statWinrate)
            ? (this.winrate.innerText = 0 + "%")
            : (this.winrate.innerText = `${statWinrate}%`)
        if (gameRunning) return
        win
            ? (this.resultMsg.innerText = "You won! 🥳")
            : (this.resultMsg.innerText = "You lost! 😪")
    }

    clearStats() {
        localStorage.removeItem("gameInfo")
        location.reload()
    }

    open() {
        this.container.classList.add("active")
        this.overlay.classList.add("active")
        gsap.from(this.container, {
            y: -500,
            opacity: 0,
            ease: "elastic.out(1, 0.5)",
            duration: 1,
        })
    }

    close() {
        gsap.to(this.container, {
            y: -500,
            opacity: 0,
            ease: "power2.in",
            duration: 0.5,
            onComplete: () => {
                this.container.classList.remove("active")
                this.overlay.classList.remove("active")
                gsap.set(this.container, { y: 0, opacity: 1 })
            },
        })
    }
}
