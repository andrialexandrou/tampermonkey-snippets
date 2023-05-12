// ==UserScript==
// @name         Unset Focus
// @namespace    https://github.com/andrialexandrou/tampermonkey-snippets
// @version      1.0
// @description  Unsets focus on a page to enable default page keyboard interactions.
// @author       Andri Alexandrou
// @match        https://**/*
// @grant        none
// ==/UserScript==

document.onkeydown= function(e) {
    'use strict';
    var evtobj = window.event? event : e

    if (!evtobj.metaKey) return
    if (evtobj.code !== 'Escape') return

    const body = document.getElementsByTagName('body')[0]
    body.setAttribute('tabindex', -1)
    body.focus()
};
