var ContextOption = (function () {
    function ContextOption(rootElm, onOptionClick) {
        this.rootElm = rootElm;
        this.rootElm.classList.add('context-option');
        this.rootElm.onclick = onOptionClick;
    }
    return ContextOption;
}());
//# sourceMappingURL=ContextOption.js.map