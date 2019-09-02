class Editor {

    windowClickFunc = () => { };

    constructor(btnStart, text, classList, maxLength, callback) {
        this.maxLength = maxLength;
        this.callback = callback;
        
        this.tag = ViewUtil.tag('div', { classList: `editor ${classList}` });
        this.errorBox = new ContentBox(null, 'error-box');
        this.textBox = ViewUtil.tag('div', { classList: 'editable-text', innerText: text });
        this.currentText = this.textBox.innerText;

        this.btnSlot = ViewUtil.tag('div', { classList: 'editor-btn-slot' });
        this.btnConfirm = Icons.confirm();
        this.btnCancel = Icons.cancel();
        
        this.btnSlot.append(this.btnConfirm, this.btnCancel);
        this.tag.append(this.errorBox.tag, this.textBox, this.btnSlot);
        
        this.btnConfirm.onclick = () => this.send()
        this.btnCancel.onclick = () => this.revert()
        
        // click exceptions
        // clicking on these will NOT stop the edit, but anything else will
        this.targetHandles = [
            this.tag, btnStart, this.btnSlot,
            this.btnConfirm, this.btnCancel,
            this.errorBox.tag, this.textBox
        ];
        // includes all child tags of the start button as click exceptions
        let childNodes = btnStart.childNodes;
        childNodes.forEach(c => this.targetHandles.push(c));
        
        window.addEventListener('click', e => this.windowClickFunc(e));
    }

    // event listener can only work if turned on after editing has started
    turnOnWindowClickFunc() {
        this.windowClickFunc = e => {
            this.hit = false;

            this.targetHandles.forEach(t => {
                if (e.target == t) this.hit = true;
            });

            // if the target was not one of the exceptions, stop the edit
            if (!this.hit) this.revert();
        }
    }

    // public use
    setText(text) {
        this.textBox.innerText = text;
    }

    // public use
    start() {
        this.currentText = this.textBox.innerText;
        ViewUtil.show(this.btnSlot);
        this.textBox.contentEditable = true;
        this.textBox.focus();
        this.turnOnWindowClickFunc();
    }

    send() {
        if (this.textBox.innerText.length <= this.maxLength) {
            this.callback(this.textBox.innerText);
            this.end();
        }
        else this.errorBox.add(
            {
                tag: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: `- Must be less than ${this.maxLength} characters`
            })
        });
    }

    end() {
        ViewUtil.hide(this.btnSlot);
        this.errorBox.clear();
        this.textBox.contentEditable = false;
        this.windowClickFunc = () => { }; // "turns off" this.windowClickFunc
    }

    revert() {
        this.textBox.innerText = this.currentText;
        this.end();
    }   
}