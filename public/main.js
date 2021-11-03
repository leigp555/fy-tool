const demo = document.getElementById("translateContent")
const form = document.getElementById("ts")
const button = document.getElementById("button")
const lastContent = document.querySelector("#lastContent")


form.addEventListener("submit", (e) => {
    e.preventDefault()
})
let content = ''
demo.addEventListener("change", (e) => {
    content = e.target.value
})
button.addEventListener("click", () => {
    lastContent.innerText = content
    ajax("GET", "/translate", content)
        .then((result) => {
                console.log(result)
            },
            (error) => {
                console.log(error)
            }
        )
})


const ajax = (method, url, data) => {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open(method, url)
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status < 400) {
                    resolve(request.response)
                } else if (request.status >= 400) {
                    reject(request)
                }
            }
        }
        request.send(data)
    })
}
