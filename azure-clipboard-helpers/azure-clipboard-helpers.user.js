// ==UserScript==
// @name         Azure Clipboard Helpers
// @namespace    http://dev.azure.com/
// @version      0.2
// @description  Add clipboard links to Azure
// @author       Thomas Bickley (BJSS)
// @match        https://dev.azure.com/*
// @icon         https://cdn.vsassets.io/content/icons/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function injectCss(css) {
        const styleNode = document.createElement('style');

        styleNode.type = 'text/css';
        styleNode.textContent = css;

        document.head.appendChild(styleNode);
    }

    function createCopyButton(iconName, value, title) {
        const btnNode = document.createElement('a');

        btnNode.classList.add('bolt-button', 'icon-only', 'subtle', 'small');
        btnNode.title = title;

        btnNode.addEventListener(
            "click",
            function () {
                navigator.clipboard.writeText(value);
            }
        );


        const iconNode = document.createElement('span');

        iconNode.classList.add('fabric-icon', 'small', 'ms-Icon--' + iconName);

        btnNode.appendChild(iconNode);

        return btnNode;
    }

    function insertAfter(nodeToInsert, previousNode) {
        previousNode.parentNode.insertBefore(nodeToInsert, previousNode.nextSibling);
    }

    function injectHeaderBranchesHelpers() {
        const linkNode = document.querySelector('.pr-header-branches > a');
        if (!linkNode) {
            return;
        }

        if (linkNode.dataset.hasCopyHelpers) {
            return;
        }

        const branchName = linkNode.text;
        const helperWrapperNode = document.createElement('span');

        helperWrapperNode.classList.add('bolt-button-group');

        helperWrapperNode.appendChild(createCopyButton('Copy', branchName, 'Copy raw branch name'));
        helperWrapperNode.appendChild(createCopyButton('PowerShell', 'git fetch && git checkout origin/' + branchName, 'Copy as checkout command'));

        insertAfter(helperWrapperNode, linkNode);
        insertAfter(document.createTextNode(' '), linkNode);

        linkNode.dataset.hasCopyHelpers = true;
    }

    function addCopyHelperToFilepathNodes(rootQuery, nodeQuery) {
        const changesViewerNode = document.querySelector(rootQuery);
        if (!changesViewerNode) {
            return;
        }

        const filepathNodes = changesViewerNode.querySelectorAll(nodeQuery);
        for (const filepathNode of Array.from(filepathNodes)) {
            if (filepathNode.childNodes.length !== 1) {
                return;
            }

            const filepath = filepathNode.textContent;

            filepathNode.firstChild.textContent += ' ';
            filepathNode.appendChild(createCopyButton('Copy', filepath, 'Copy filepath'));
        }
    }

    function injectChangesViewersHelpers() {
        addCopyHelperToFilepathNodes('.repos-changes-viewer', '.repos-summary-header > :first-child .secondary-text:not(.repos-change-summary-file-icon-container)');
        addCopyHelperToFilepathNodes('.repos-compare-toolbar', '.secondary-text');
        addCopyHelperToFilepathNodes('.activity-feed-list', '.comment-file-header-title .secondary-text');
    }

    const css = `
.bolt-button.icon-only.subtle.small {
    padding: 4px;
}
`;

    injectCss(css);

    var observer = new MutationObserver(function(mutations) {
        injectHeaderBranchesHelpers();
        injectChangesViewersHelpers();
    })

    observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true})
})();
