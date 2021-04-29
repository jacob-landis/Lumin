var ContextOption = (function () {
    function ContextOption(rootElm, title, onOptionClick) {
        this.rootElm = rootElm;
        this.rootElm.classList.add('context-option');
        this.rootElm.title = title;
        this.rootElm.onclick = onOptionClick;
    }
    return ContextOption;
}());
//# sourceMappingURL=ContextOption.js.map