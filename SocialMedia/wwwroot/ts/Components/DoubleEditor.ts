class DoubleEditor extends Editor {

    public currentText2: string;
    public textBox2: HTMLElement;
    public lblCharacterCount2: HTMLElement;
    public doubleCallback: (result1: string, result2: string) => void;

    public constructor(
        btnStart: HTMLElement,
        text: string,
        text2: string,
        classList: string,
        maxLength: number,
        doubleCallback: (result1: string, result2: string) => void
    ) {

        super(btnStart, text, classList, false, maxLength, null);

        this.doubleCallback = doubleCallback;

        this.textBox2 = ViewUtil.tag('div', { classList: 'editable-text2', innerText: text2 });
        this.lblCharacterCount2 = ViewUtil.tag('div', { classList: 'lblEditorCharacterCount' });

        this.fillRootElm(this.textBox2, this.lblCharacterCount2);
        this.targetHandles.push(this.textBox2, this.lblCharacterCount2);
    }

    public setText2(text: string, text2: string): void {
        this.textBox.innerText = text;
        this.textBox2.innerText = text2;
    }

    public start(): void {

        // Get a handle on the current verion of 2nd text.
        this.currentText2 = this.textBox2.innerText;

        // Make text box 2 editable.
        this.textBox2.contentEditable = `${true}`;

        ViewUtil.show(this.lblCharacterCount2);

        this.lblCharacterCount2.innerText = ` - ${this.textBox2.innerText.length}/${this.maxLength}`;

        this.textBox2.onkeyup = (event: KeyboardEvent) => {
            this.lblCharacterCount2.innerText = `${this.textBox2.innerText.length}/${this.maxLength}`;

            if (this.textBox2.innerText.length > this.maxLength || (!this.canBeEmpty && this.textBox2.innerText.length == 0))
                this.lblCharacterCount2.classList.add('errorMsg');

            else if (this.lblCharacterCount2.classList.contains('errorMsg'))
                this.lblCharacterCount2.classList.remove('errorMsg');
        }

        super.start();
    }

    public send(): void {

        let tooLong: boolean = !(this.textBox.innerText.length <= this.maxLength && this.textBox2.innerText.length <= this.maxLength)
        let isAlphabetic: boolean = /^[a-zA-Z]+$/.test(this.textBox.innerText) && /^[a-zA-Z]+$/.test(this.textBox2.innerText);

        // If text does not exceed length,
        if (!tooLong && isAlphabetic) {

            // invoke callback with edited text,
            this.doubleCallback(this.textBox.innerText, this.textBox2.innerText);

            // and end the edit process.
            this.end();

            return;
        }

        // Display error messages.
        // Add new tag with error message in it to error box.
        // XXX make ErrorCard XXX
        if (tooLong) {
            this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: `- Both fields must be less than ${this.maxLength} characters`
                })
            });
        }

        if (!isAlphabetic) {
            this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: `- Both fields can only contain letters and spaces`
                })
            });
        }
    }

    public end(): void {

        // Make text box 2 non-editable.
        this.textBox2.contentEditable = `${false}`;

        ViewUtil.hide(this.lblCharacterCount2);

        if (this.lblCharacterCount2.classList.contains('errorMsg'))
            this.lblCharacterCount2.classList.remove('errorMsg');

        super.end();
    }

    public revert(): void {

        // Revert inner text.
        this.textBox2.innerText = this.currentText2;

        super.revert();
    }
}