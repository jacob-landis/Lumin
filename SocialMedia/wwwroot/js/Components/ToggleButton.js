var ToggleState = (function () {
    function ToggleState(classList, title, onClick) {
        this.classList = classList;
        this.title = title;
        this.onClick = onClick;
    }
    return ToggleState;
}());
var ToggleButton = (function () {
    function ToggleButton(classList, iconContainer, icon, propertySets) {
        var _this = this;
        this.icon = icon;
        this.propertySets = propertySets;
        this.stateIndex = 0;
        this.rootElm = iconContainer ? iconContainer : ViewUtil.tag('div');
        if (classList)
            this.rootElm.classList.add(classList);
        this.rootElm.onclick = function (event) {
            _this.onClick();
            _this.toggle();
        };
        this.reset();
    }
    ToggleButton.prototype.toggle = function () {
        var oldSet = this.propertySets[this.stateIndex];
        this.stateIndex = ((this.stateIndex + 1) >= this.propertySets.length) ? 0 : this.stateIndex + 1;
        var newSet = this.propertySets[this.stateIndex];
        this.setBtn(newSet.classList, oldSet.classList, newSet.title, newSet.onClick);
    };
    ToggleButton.prototype.setBtn = function (newClass, oldClass, title, onClick) {
        if (this.icon != null) {
            if (oldClass != '')
                this.icon.classList.remove(oldClass);
            if (newClass != '')
                this.icon.classList.add(newClass);
        }
        else {
            if (oldClass != '')
                this.rootElm.classList.remove(oldClass);
            if (newClass != '')
                this.rootElm.classList.add(newClass);
        }
        if (title)
            this.rootElm.title = title;
        if (onClick)
            this.onClick = onClick;
    };
    ToggleButton.prototype.reset = function () {
        this.setBtn(this.propertySets[0].classList, '', this.propertySets[0].title, this.propertySets[0].onClick);
    };
    return ToggleButton;
}());
//# sourceMappingURL=ToggleButton.js.map