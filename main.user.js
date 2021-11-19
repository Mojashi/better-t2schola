// ==UserScript==
// @name         BETTER_T2SCHOLA
// @version      0.3
// @description  T2SCHOLA is kasu
// @author       mojashi
// @match        https://t2schola.titech.ac.jp/*
// @grant        GM.xmlHttpRequest
// @updateURL	 https://github.com/Mojashi/better-t2schola/blob/master/main.user.js
// ==/UserScript==

function GMfetch(method, url) {
    return new Promise(function (resolve, reject) {
        GM.xmlHttpRequest({
            method, url,
            onload:(response)=>{
                if (response.status >= 200 && response.status < 300) {
                    resolve(response.responseText);
                } else {
                    reject({
                        status: response.status,
                        statusText: response.statusText
                    });
                }
            },
            onerror:(response)=>{
                reject({
                    status: response.status,
                    statusText: response.statusText
                });
            },
        });
    });
}

async function fetchHTML(url) {
    var parser = new DOMParser();
    
    return parser.parseFromString(await GMfetch("GET", url), 'text/html');
}

async function fixMyCourseTitle(){
    const nodes = document.querySelectorAll('a[data-parent-key=mycourses]')
    async function getName(url){
        var parser = new DOMParser();
        const cached = localStorage.getItem("title_" + url)
        if(!cached) {
            const title = await fetchHTML(url).querySelectorAll(".page-header-headings")[0].innerText
            localStorage.setItem("title_" + url, title)
        }
        return localStorage.getItem("title_" + url)
    }
    for(var i = 0; nodes.length > i; i++){
        nodes[i].querySelector(".media-body").innerText = await getName(nodes[i].getAttribute('href'))
    }
}

async function OCWIntegration(){
    if(location.pathname !== '/' && location.pathname !== '/course/index.php') return

    const h = await fetchHTML('https://secure.ocw.titech.ac.jp/ocwi/index.php')
    var nodes = Array(...h.querySelectorAll('#notPresented tr'))
    if(nodes.length > 0){ 
        nodes = nodes.slice(1)
    }
    
    const styleElem = document.createElement("style")
    styleElem.innerHTML = `
    table.ocw-assignments {
        width: 100%;
        border: 1px solid #ccc;
        border-spacing: 0;
        background: white;
    }
    .ocw-assignments td {
        padding: 5px;
        border-right: solid 1px #ccc;
        border-bottom: solid 1px #ccc;
    }
    .ocw-assignments th {
        color: #ffffff;
        background-color: #007cc1;
        padding: 5px;
    }
    `
    const table = document.createElement("table")
    table.setAttribute("class", "ocw-assignments")
    const tbody = document.createElement("tbody")
    tbody.innerHTML = "<tr><th>課題締切日</th><th>講義名</th><th>課題タイトル</th></tr>"
    nodes.forEach(node=>{
        node.querySelectorAll("a").forEach(a=>{
            const url = new URL(a.href)
            a.href = 'https://secure.ocw.titech.ac.jp/ocwi/index.php'+ url.search
        })
        tbody.append(node)
    })
    table.appendChild(tbody)
    const mainDiv = document.querySelector("div[role=main]")
    mainDiv.prepend(table)
    mainDiv.prepend(styleElem)
}

async function smartCalender() {
    if (location.pathname !== '/calendar/view.php') return
    const styleElem = document.createElement('style')
    styleElem.innerHTML = `
    .maincalendar a {
        white-space: normal !important;
    }
    ` 
    document.querySelector('.maincalendar').prepend(styleElem)
    document.querySelectorAll('span.eventname').forEach(node => {
        const found = node.innerText.match(/^「(.*)」の提出期限が近づいています$/)
        if(found)
            node.innerText = found[1]
    })
}

(async function() {
    'use strict';

    await fixMyCourseTitle()
    await OCWIntegration()
    await smartCalender()
})();
