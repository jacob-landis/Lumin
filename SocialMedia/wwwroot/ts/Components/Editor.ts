/*
    This class contains the logic for editing text.
    
    This is meant to be used instead of displaying a plain HTML text element. If the user owns the text, append this enhanced text elm instead.
    (In some cases, it is useful to merely hide the button that starts the edit if the current user is not the owner. ex. bio in profile modal)

    The only thing this doesn't handle is the creation of the start button, imbedding it's logic, or appending this editors tag elm somewhere.
    
    TERM: off-click
    DEFINITION: clicking on anything except the elements listed as parts of the editor.
*/
class Editor implements IAppendable {

    public static activeEditor: Editor = null;

    public rootElm: HTMLElement;
    
    // A content box for error messages.
    protected errorBox: ContentBox;

    private lblCharacterCount: HTMLElement;

    // The HTML text elm that display the main text and is edited.
    protected textBox: HTMLElement;

    // A handle on the version of the text at the start of an edit.
    // Used to revert changes if the operation is canceled.
    protected currentText: string;

    private btnStart: HTMLElement;

    // A container elm for btnConfirm and btnCancel.
    private btnSlot: HTMLElement;

    // Invokes send().
    private btnConfirm: HTMLElement;

    // Invokes revert().
    private btnCancel: HTMLElement;

    /*
        PARAMETERS:
        btnStart must an HTML elm.
        It will be added to the list of off-click exceptions.
        This is usally the button that invokes start().

        text must be at least an empty string.
        The idea is to display it normally.
        However, text doesn't have to be provided right away.
        Instead, an empty string can be provided as a place holder.

        classList can be a string or null but a string is highly advisable.
        This lets style be applied to this editor's tag elm and it's chidren.

        maxLength must be an int and cannot be null.
        This rule is based on the premise that this editor will only be used for persitent text and all text that persists in a database has a limit.
        An length error will be displayed with maxLength in it if the user exceedes the limit.

        callback must be a function with one string parameter.
        The edit result is sent to the callback.
        The result is meant to be sent to the host in an update request.
    */
    constructor(
        btnStart: HTMLElement,
        text: string,
        classList: string,
        protected canBeEmpty: boolean,
        protected maxLength: number,
        public revertDependency: object = null,
        private callback?: (result: string) => void
    ) {
        // Create and get a handle on this editors main HTML tag.
        this.rootElm = ViewUtil.tag('div', { classList: `editor ${classList}` });

        // Create and get a handle on this editors content box for errors.
        this.errorBox = new ContentBox(ViewUtil.tag('div', { classList: 'error-box' }));

        this.lblCharacterCount = ViewUtil.tag('div', { classList: 'lblEditorCharacterCount' });

        // Create and get a handle on this editors text box and fill it with the provided text.
        this.textBox = ViewUtil.tag('div', { classList: 'editable-text', innerText: text });

        // Get a handle on the current version of text.
        this.currentText = this.textBox.innerText;

        this.btnStart = btnStart;

        // Create and get a handle on the container elm for the edit control buttons.
        this.btnSlot = ViewUtil.tag('div', { classList: 'editor-btn-slot' });

        // Create the control buttons using the Icon class and get handles on them.
        this.btnConfirm = Icons.confirm();
        this.btnCancel = Icons.cancel();

        // Append control buttons to control button container.
        this.btnSlot.append(this.btnConfirm, this.btnCancel);

        this.fillRootElm();

        // Imbed functionality in the control buttons.
        this.btnStart.onclick = (e: MouseEvent) => this.start();
        this.btnConfirm.onclick = (e: MouseEvent) => this.send()
        this.btnCancel.onclick = (e: MouseEvent) => this.revert()
    }

    /*
        Accommodates DoubleEditor.
    */
    protected fillRootElm(textBox2?: HTMLElement, lblCharacterCount2?: HTMLElement): void {
        // Append the error box, text box, and control buttons container to this editors main HTML tag.
        if (textBox2 == null)
            this.rootElm.append(this.textBox, this.lblCharacterCount, this.errorBox.rootElm, this.btnSlot);
        else
            this.rootElm.append(this.textBox, textBox2, this.lblCharacterCount, lblCharacterCount2, this.errorBox.rootElm, this.btnSlot);
    }

    /*
        Puts provided text in text box.
    */
    public setText(text: string): void {
        this.textBox.innerText = text;
    }

    /*
        Attempts to start the edit process, first checking if there is another active editor and giving the user the option to cancel it.
    */
    public start(): void {

        // If another editor is active.
        if (Editor.activeEditor != null) {
            confirmPrompt.load("Another edit is already active. Would you like to revert those changes and start this edit?", (answer: boolean) => {
                if (answer == true) {
                    Editor.activeEditor.undoChanges();
                    this.activate();
                }
            });
        }
        else this.activate();
    }

    /*
        Begin edit process. 
    */
    protected activate(): void {

        // Get a handle on the current verion of text.
        this.currentText = this.textBox.innerText;

        this.btnSlot.classList.add('activeEditor');

        ViewUtil.hide(this.btnStart);

        // Show confirm and cancel control buttons.
        ViewUtil.show(this.btnSlot, 'grid');

        ViewUtil.show(this.lblCharacterCount);

        // Make text box editable.
        this.textBox.contentEditable = `${true}`;

        // Put cursor in text box.
        this.textBox.focus();

        this.lblCharacterCount.innerText = `${this.textBox.innerText.length}/${this.maxLength}`;

        this.textBox.onkeyup = (event: KeyboardEvent) => {
            this.lblCharacterCount.innerText = `${this.textBox.innerText.length}/${this.maxLength}`;

            if (this.textBox.innerText.length > this.maxLength || (!this.canBeEmpty && this.textBox.innerText.length == 0))
                this.lblCharacterCount.classList.add('errorMsg');

            else if (this.lblCharacterCount.classList.contains('errorMsg'))
                this.lblCharacterCount.classList.remove('errorMsg');
        }

        Editor.activeEditor = this;
    }

    /*
        Tests length contraint and either sends the message to the callback and ends the edit, or displays an error message.
    */
    protected send(): void {

        let tooLong: boolean = this.textBox.innerText.length > this.maxLength;
        let incorrectlyEmpty: boolean = !this.canBeEmpty && this.textBox.innerText.length == 0;

        // If text does not exceed length,
        if (!tooLong && !incorrectlyEmpty) {

            // invoke callback with edited text,
            if (this.callback != null) this.callback(this.textBox.innerText);

            // and end the edit process.
            this.end();
        }

        // else display error message.
        // Add new tag with error message in it to error box.
        else {

            this.errorBox.clear();

            if (tooLong) this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: `- Must be less than ${this.maxLength} characters`
                })
            });

            if (incorrectlyEmpty) this.errorBox.add({
                rootElm: ViewUtil.tag('div', {
                    classList: 'errorMsg',
                    innerText: `- Cannot be empty`
                })
            });
        }
    }

    /*
        Ends the editing process.
    */
    protected end(): void {

        this.btnSlot.classList.remove('activeEditor');

        ViewUtil.show(this.btnStart, 'block');

        // Hide control buttons.
        ViewUtil.hide(this.btnSlot);

        ViewUtil.hide(this.lblCharacterCount);

        if (this.lblCharacterCount.classList.contains('errorMsg'))
            this.lblCharacterCount.classList.remove('errorMsg');

        // Clear error messages from error box.
        this.errorBox.clear();

        // Make text box non-editable.
        this.textBox.contentEditable = `${false}`;

        Editor.activeEditor = null;
    }

    /*
        Revert innertext before ending editing process.
    */
    public revert(onEditEnd: () => void = null): void {

        confirmPrompt.load("Are you sure you want to revert changes?", (answer: boolean) => {
            if (answer == true) {

                this.undoChanges();
                if (onEditEnd != null) onEditEnd();
            }
            else {
                // Put cursor back in text box.
                this.textBox.focus();
            }
        });
    }

    public undoChanges(): void {
        // Revert inner text.
        this.textBox.innerText = this.currentText;

        // End editing process.
        this.end();
    }

    public disableEditing(): void {
        ViewUtil.remove(this.btnStart);
    }

    public enableEditing(): void {
        this.rootElm.append(this.btnStart);
        ViewUtil.show(this.btnStart);
    }
}