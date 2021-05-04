var Editor = (function () {
    function Editor(btnStart, text, classList, canBeEmpty, maxLength, callback) {
        var _this = this;
        this.windowClickFunc = function (e) { };
        this.canBeEmpty = canBeEmpty;
        this.maxLength = maxLength;
        this.callback = callback;
        this.rootElm = ViewUtil.tag('div', { classList: "editor " + classList });
        this.errorBox = new ContentBox(ViewUtil.tag('div', { classList: 'error-box' }));
        this.lblCharacterCount = ViewUtil.tag('div', { classList: 'lblEditorCharacterCount' });
        this.textBox = ViewUtil.tag('div', { classList: 'editable-text', innerText: text });
        this.currentText = this.textBox.innerText;
        this.btnStart = btnStart;
        this.btnSlot = ViewUtil.tag('div', { classList: 'editor-btn-slot' });
        this.btnConfirm = Icons.confirm();
        this.btnCancel = Icons.cancel();
        this.btnSlot.append(this.btnConfirm, this.btnCancel);
        this.fillRootElm();
        this.btnStart.onclick = function (e) { return _this.start(); };
        this.btnConfirm.onclick = function (e) { return _this.send(); };
        this.btnCancel.onclick = function (e) { return _this.revert(); };
        this.targetHandles = [
            this.rootElm, this.errorBox.rootElm,
            this.btnSlot, this.btnConfirm,
            this.btnCancel, this.textBox,
            this.lblCharacterCount
        ];
        window.addEventListener('mouseup', function (e) { return _this.windowClickFunc(e); });
    }
    Editor.prototype.fillRootElm = function (textBox2) {
        if (textBox2 === void 0) { textBox2 = null; }
        if (textBox2 == null)
            this.rootElm.append(this.textBox, this.lblCharacterCount, this.errorBox.rootElm, this.btnSlot);
        else
            this.rootElm.append(this.textBox, textBox2, this.lblCharacterCount, this.errorBox.rootElm, this.btnSlot);
    };
    Editor.prototype.turnOnWindowClickFunc = function () {
        var _this = this;
        this.windowClickFunc = function (event) {
            var hit = false;
            _this.targetHandles.forEach(function (targetHandle) {
                if (event.target == targetHandle)
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
        var _this = this;
        this.currentText = this.textBox.innerText;
        this.btnSlot.classList.add('activeEditor');
        ViewUtil.hide(this.btnStart);
        ViewUtil.show(this.btnSlot, 'grid');
        ViewUtil.show(this.lblCharacterCount);
        this.textBox.contentEditable = "" + true;
        this.textBox.focus();
        this.lblCharacterCount.innerText = this.textBox.innerText.length + "/" + this.maxLength;
        this.textBox.onkeyup = function (event) {
            _this.lblCharacterCount.innerText = _this.textBox.innerText.length + "/" + _this.maxLength;
            if (_this.textBox.innerText.length > _this.maxLength || (!_this.canBeEmpty && _this.textBox.innerText.length == 0))
                _this.lblCharacterCount.classList.add('errorMsg');
            else if (_this.lblCharacterCount.classList.contains('errorMsg'))
                _this.lblCharacterCount.classList.remove('errorMsg');
        };
        this.turnOnWindowClickFunc();
    };
    Editor.prototype.send = function () {
        var tooLong = this.textBox.innerText.length > this.maxLength;
        var incorrectlyEmpty = !this.canBeEmpty && this.textBox.innerText.length == 0;
        if (!tooLong && !incorrectlyEmpty) {
            if (this.callback != null)
                this.callback(this.textBox.innerText);
            this.end();
        }
        else {
            this.errorBox.clear();
            if (tooLong)
                this.errorBox.add({
                    rootElm: ViewUtil.tag('div', {
                        classList: 'errorMsg',
                        innerText: "- Must be less than " + this.maxLength + " characters"
                    })
                });
            if (incorrectlyEmpty)
                this.errorBox.add({
                    rootElm: ViewUtil.tag('div', {
                        classList: 'errorMsg',
                        innerText: "- Cannot be empty"
                    })
                });
        }
    };
    Editor.prototype.end = function () {
        this.btnSlot.classList.remove('activeEditor');
        ViewUtil.show(this.btnStart, 'block');
        ViewUtil.hide(this.btnSlot);
        ViewUtil.hide(this.lblCharacterCount);
        if (this.lblCharacterCount.classList.contains('errorMsg'))
            this.lblCharacterCount.classList.remove('errorMsg');
        this.errorBox.clear();
        this.textBox.contentEditable = "" + false;
        this.windowClickFunc = function (e) { };
    };
    Editor.prototype.revert = function () {
        var _this = this;
        this.windowClickFunc = function (e) { };
        confirmPrompt.load("Are you sure you want to revert changes?", function (answer) {
            if (answer == true) {
                _this.textBox.innerText = _this.currentText;
                _this.end();
            }
            else {
                _this.textBox.focus();
                _this.turnOnWindowClickFunc();
            }
        });
    };
    Editor.prototype.disableEditing = function () {
        ViewUtil.remove(this.btnStart);
    };
    Editor.prototype.enableEditing = function () {
        this.rootElm.append(this.btnStart);
        ViewUtil.show(this.btnStart);
    };
    return Editor;
}());
//# sourceMappingURL=Editor.js.map