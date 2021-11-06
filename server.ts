import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import * as p from "path";
import * as fs from "fs";
import {URL} from "url";
import {baiduTranslate} from "./baiduTranslate";


const pubPath = p.resolve(__dirname, "public")
let server = http.createServer();
server.on("request", (request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url, `https://${request.headers.host}`)
    let {pathname} = path;
    if (pathname === "/translate") {
        let arr = []
        request.on("data", (chunk) => {
            arr.push(chunk)
        })
        request.on("end", () => {
            const requestDate = Buffer.concat(arr).toString()
            baiduTranslate(requestDate).then((data)=>{
                response.end(data)
            })
            console.log(requestDate)

        })

    } else {
        if (pathname === "/") {
            pathname = "/index.html"
        }
        fs.readFile(p.resolve(pubPath, `./${pathname}`), (error, chunk) => {
            if (error) {
                if (error.errno === 4058) {
                    response.statusCode = 404
                    fs.readFile(p.resolve(pubPath, "./error.html"), (error, chunk) => {
                        response.setHeader("Content-Type", "text/html;charset=utf-8")
                        response.end(chunk)
                    })
                } else {
                    response.statusCode = 500
                    response.setHeader("Content-Type", "text/html;charset=utf-8")
                    response.end("服务器繁忙")
                }

            } else {
                // response.setHeader("Content-Type", "text/html;charset=utf-8")
                response.end(chunk.toString())
            }
        })
    }
});
server.listen(8888);