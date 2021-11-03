import * as https from "https";
import * as querystring from "querystring";
import md5 = require("md5");
import {id, secret} from "./private";

const appid = id
const password = secret
const salt = Math.random()
let result

export const translate = (word: string) => {
    return new Promise((resolve, reject) => {
        let from, to;
        if (/[a-zA-Z]/.test(word) === true) {
            from = "en"
            to = "zh"
        } else {
            from = "zh"
            to = "en"
        }
        const query = querystring.stringify({
            q: word,
            from,
            to,
            appid,
            salt,
            sign: md5(appid + word + salt + password),
        });

        const options = {
            hostname: 'api.fanyi.baidu.com',
            port: 443,
            path: '/api/trans/vip/translate?' + query,
            method: 'GET'
        };
        const request = https.request(options, (response) => {
            const arr: Buffer[] = []
            response.on('data', (chunk) => {
                arr.push(chunk)
            });
            type translateResult = {
                error_code: string,
                error_msg: string,
                from: string,
                to: string,
                trans_result: { src: string, dst: string }[]
            }
            type errorKind = {
                [key: string]: string
            }
            const errorKind: errorKind = {
                "52001": "请求超时",
                "52002 ": "系统错误",
                "52003": "未授权用户",
                "54000": "必填参数为空",
                "54001": "签名错误",
                "54003": "访问频率受限",
                "54004": "账户余额不足",
                "54005": "长query请求频繁",
                "58000": "客户端IP非法",
                "58001": "译文语言方向不支持",
                "58002": "服务当前已关闭",
                "90107": "认证未通过或未生效"
            };
            response.on("end", () => {
                const string = Buffer.concat(arr).toString()
                const obj: translateResult = JSON.parse(string)
                if (obj.error_code in errorKind) {
                    const err=errorKind[obj.error_msg] || obj.error_msg
                    reject(err)
                } else {
                    result = obj.trans_result[0].dst
                    console.log(result)
                    resolve(result)
                }

            })
        });

        request.on('error', (error) => {
            console.log(error);
        });
        request.end();
    })
};
