var ToggleButton = (function () {
    function ToggleButton(classList, primaryStateClass, secondaryStateClass, primaryTitle, secondaryTitle, icon, iconContainer, primaryOnClick, secondaryOnClick) {
        this.stateIsPrimary = true;
        this.primaryStateClass = primaryStateClass;
        this.secondaryStateClass = secondaryStateClass;
        this.primaryTitle = primaryTitle;
        this.secondaryTitle = secondaryTitle;
        this.icon = icon;
        this.primaryOnClick = primaryOnClick;
        this.secondaryOnClick = secondaryOnClick;
        this.rootElm = iconContainer ? iconContainer : ViewUtil.tag('div');
        if (classList)
            this.rootElm.classList.add(classList);
        this.setBtn(this.primaryStateClass, '', this.primaryTitle, this.primaryOnClick);
    }
    ToggleButton.prototype.toggle = function () {
        this.stateIsPrimary = !this.stateIsPrimary;
        if (this.stateIsPrimary)
            this.setBtn(this.primaryStateClass, this.secondaryStateClass, this.primaryTitle, this.primaryOnClick);
        else
            this.setBtn(this.secondaryStateClass, this.primaryStateClass, this.secondaryTitle, this.secondaryOnClick ? this.secondaryOnClick : null);
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
            this.rootElm.onclick = onClick;
    };
    return ToggleButton;
}());
//# sourceMappingURL=ToggleButton.js.map