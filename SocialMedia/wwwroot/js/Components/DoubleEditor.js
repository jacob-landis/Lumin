var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DoubleEditor = (function (_super) {
    __extends(DoubleEditor, _super);
    function DoubleEditor(btnStart, text, text2, classList, maxLength, doubleCallback) {
        var _this = _super.call(this, btnStart, text, classList, maxLength, null) || this;
        _this.doubleCallback = doubleCallback;
        _this.textBox2 = ViewUtil.tag('div', { classList: 'editable-text2', innerText: text2 });
        _this.fillRootElm(_this.textBox2);
        _this.targetHandles.push(_this.textBox2);
        return _this;
    }
    DoubleEditor.prototype.setText2 = function (text, text2) {
        this.textBox.innerText = text;
        this.textBox2.innerText = text2;
    };
    DoubleEditor.prototype.start = function () {
        this.currentText2 = this.textBox2.innerText;
        this.textBox2.contentEditable = "" + true;
        _super.prototype.start.call(this);
    };
    DoubleEditor.prototype.send = function () {
        var tooLong = !(this.textBox.innerText.length <= this.maxLength && this.textBox2.innerText.length <= this.maxLength);
        var isAlphabetic = /^[a-zA-Z]+$/.test(this.textBox.innerText) && /^[a-zA-Z]+$/.test(this.textBox2.innerText);
        if (!tooLong && isAlphabetic) {
            this.doubleCallback(this.textBox.innerText, this.textBox2.innerText);
            this.end();
            return;
        }
        if (tooLong) {
            this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: "- Both fields must be less than " + this.maxLength + " characters"
                })
            });
        }
        if (!isAlphabetic) {
            this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: "- Both fields can only contain letters and spaces"
                })
            });
        }
    };
    DoubleEditor.prototype.end = function () {
        this.textBox2.contentEditable = "" + false;
        _super.prototype.end.call(this);
    };
    DoubleEditor.prototype.revert = function () {
        this.textBox2.innerText = this.currentText2;
        _super.prototype.revert.call(this);
    };
    return DoubleEditor;
}(Editor));
//# sourceMappingURL=DoubleEditor.js.map