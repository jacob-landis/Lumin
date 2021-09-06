var ContextOption = (function () {
    function ContextOption(rootElm, onOptionClick) {
        this.rootElm = rootElm;
        this.rootElm.classList.add(ContextOption.rootElmClassList);
        this.rootElm.onclick = onOptionClick;
    }
    ContextOption.initialize = function (rootElmClassList) {
        this.rootElmClassList = rootElmClassList;
    };
    return ContextOption;
}());
//# sourceMappingURL=ContextOption.js.map