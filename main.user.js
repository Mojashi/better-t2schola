// ==UserScript==
// @name         BETTER_T2SCHOLA
// @version      0.1.1
// @description  T2SCHOLA is kasu
// @author       mojashi
// @match        https://t2schola.titech.ac.jp/*
// @grant        none
// @updateURL	https://github.com/Mojashi/better-t2schola/blob/master/main.js
// ==/UserScript==

(async function() {
    'use strict';
    const nodes = document.querySelectorAll('a[data-parent-key=mycourses]')
    async function getName(url){
        var parser = new DOMParser();
        const cached = localStorage.getItem("title_" + url)
        if(!cached) {
            const title = await fetch(url).then(res=>res.text()).then(t=>{
                const doc = parser.parseFromString(t, 'text/html');
                return doc.querySelectorAll(".page-header-headings")[0].innerText
            })
            localStorage.setItem("title_" + url, title)
        }
        return localStorage.getItem("title_" + url)
    }
    for(var i = 0; nodes.length > i; i++){
        nodes[i].querySelector(".media-body").innerText = await getName(nodes[i].getAttribute('href'))
    }
})();
