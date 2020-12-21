var Editor = (function () {
    function Editor(btnStart, text, classList, maxLength, callback) {
        var _this = this;
        this.windowClickFunc = function () { };
        btnStart.onclick = function () { return _this.start(); };
        this.maxLength = maxLength;
        this.callback = callback;
        this.rootElm = ViewUtil.tag('div', { classList: "editor " + classList });
        this.errorBox = new ContentBox(ViewUtil.tag('div', { classList: 'error-box' }));
        this.textBox = ViewUtil.tag('div', { classList: 'editable-text', innerText: text });
        this.currentText = this.textBox.innerText;
        this.btnSlot = ViewUtil.tag('div', { classList: 'editor-btn-slot' });
        this.btnConfirm = Icons.confirm();
        this.btnCancel = Icons.cancel();
        this.btnSlot.append(this.btnConfirm, this.btnCancel);
        this.rootElm.append(this.errorBox.rootElm, this.textBox, this.btnSlot);
        this.btnConfirm.onclick = function () { return _this.send(); };
        this.btnCancel.onclick = function () { return _this.revert(); };
        this.targetHandles = [
            this.rootElm, this.errorBox.rootElm,
            this.btnSlot, this.btnConfirm,
            this.btnCancel, this.textBox,
            btnStart
        ];
        var childNodes = btnStart.childNodes;
        childNodes.forEach(function (c) { return _this.targetHandles.push(c); });
        window.addEventListener('click', function (e) { return _this.windowClickFunc(e); });
    }
    Editor.prototype.turnOnWindowClickFunc = function () {
        var _this = this;
        this.windowClickFunc = function (e) {
            var hit = false;
            _this.targetHandles.forEach(function (t) {
                if (e.target == t)
                    hit = true;
            });
            if (!hit)
                _this.revert();
        };
    };
    Editor.prototype.setText = function (text) {
        this.textBox.innerText = text;
    };
    Editor.prototype.start = function () {
        this.currentText = this.textBox.innerText;
        ViewUtil.show(this.btnSlot);
        this.textBox.contentEditable = "" + true;
        this.textBox.focus();
        this.turnOnWindowClickFunc();
    };
    Editor.prototype.send = function () {
        if (this.textBox.innerText.length <= this.maxLength) {
            this.callback(this.textBox.innerText);
            this.end();
        }
        else
            this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: "- Must be less than " + this.maxLength + " characters"
                })
            });
    };
    Editor.prototype.end = function () {
        ViewUtil.hide(this.btnSlot);
        this.errorBox.clear();
        this.textBox.contentEditable = "" + false;
        this.windowClickFunc = function () { };
    };
    Editor.prototype.revert = function () {
        this.textBox.innerText = this.currentText;
        this.end();
    };
    return Editor;
}());
//# sourceMappingURL=Editor.js.map