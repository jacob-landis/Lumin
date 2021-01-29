/*
    This class contains the logic for editing text.
    
    This is meant to be used instead of displaying a plain HTML text element. If the user owns the text, append this enhanced text elm instead.
    (In some cases, it is useful to merely hide the button that starts the edit if the current user is not the owner. ex. bio in profile modal)

    The only thing this doesn't handle is the creation of the start button, imbedding it's logic, or appending this editors tag elm somewhere.
    
    TERM: off-click
    DEFINITION: clicking on anything except the elements listed as parts of the editor.
*/
class Editor implements IAppendable {

    public rootElm: HTMLElement;

    // XXX Look into event bubbling. That is why elements are being triggered in the background. XXX
    private targetHandles: HTMLElement[];

    // Off-click callback. Toggled between a function that does nothing and a function that invokes cancel().
    // It is a function that does nothing when no edit is happening.
    // Only after an edit begins does it become a function that invokes cancel().
    // A refernce to this is held in the list of window event listeners, so redefining it is like turning it on and off.
    private windowClickFunc: (e: MouseEvent) => void = (e: MouseEvent) => { };

    // Length limit of text.
    private maxLength: number;

    // A function that handles the edit results.
    private callback: (result: string) => void;

    // A content box for error messages.
    private errorBox: ContentBox;

    // The HTML text elm that display the main text and is edited.
    private textBox: HTMLElement;

    // A handle on the version of the text at the start of an edit.
    // Used to revert changes if the operation is canceled.
    private currentText: string;

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
    constructor(btnStart: HTMLElement, text: string, classList: string, maxLength: number, callback: (result: string) => void) {

        btnStart.onclick = () => this.start();
        // XXX the functionality of btnStart(() => editor.start()) should be given in here.

        // XXX in CommentCard.js the callback could very well be assigned to the context option beforehand, unless it would be overwitten...

        // Get handles on maxLength and callback.
        this.maxLength = maxLength;
        this.callback = callback;

        // Create and get a handle on this editors main HTML tag.
        this.rootElm = ViewUtil.tag('div', { classList: `editor ${classList}` });

        // Create and get a handle on this editors content box for errors.
        this.errorBox = new ContentBox(ViewUtil.tag('div', { classList: 'error-box' }));
        // XXX all of the classList attributes added in here should be held in static variables and set in Main.ts. XXX

        // Create and get a handle on this editors text box and fill it with the provided text.
        this.textBox = ViewUtil.tag('div', { classList: 'editable-text', innerText: text });

        // Get a handle on the current version of text. XXX this does not need to be done here!!!
        this.currentText = this.textBox.innerText;

        // Create and get a handle on the container elm for the edit control buttons.
        this.btnSlot = ViewUtil.tag('div', { classList: 'editor-btn-slot' });

        // Create the control buttons using the Icon class and get handles on them.
        this.btnConfirm = Icons.confirm();
        this.btnCancel = Icons.cancel();

        // Append control buttons to control button container.
        this.btnSlot.append(this.btnConfirm, this.btnCancel);

        // Append the error box, text box, and control buttons container to this editors main HTML tag.
        this.rootElm.append(this.errorBox.rootElm, this.textBox, this.btnSlot);

        // Imbed functionality in the control buttons.
        this.btnConfirm.onclick = (e: MouseEvent) => this.send()
        this.btnCancel.onclick = (e: MouseEvent) => this.revert()
        
        // Add off-click exceptions to an array and get a handle on it.
        // Clicking on these will NOT stop the edit, but clicking on anything else will.
        this.targetHandles = [
            this.rootElm,   this.errorBox.rootElm,
            this.btnSlot,   this.btnConfirm,
            this.btnCancel, this.textBox,
            btnStart
        ];

        // Include all child tags of the start button as off-click exceptions.
        // Currently, no other exceptions are compound elms.
        let childNodes: NodeListOf<ChildNode> = btnStart.childNodes;
        childNodes.forEach((c: ChildNode) => this.targetHandles.push(<HTMLElement> c));

        // At this point, this.windowClickFunc is an empty function, but once it's value is replaced by a real function, it can catch the clicks.
        window.addEventListener('click', (e: MouseEvent) => this.windowClickFunc(e));
    }
    
    /* 
        Replaces the empty function in this.windowClickFunc with one that handles window click events.
    */
    private turnOnWindowClickFunc(): void {

        // Replace empty function.
        this.windowClickFunc = (event: MouseEvent) => {

            // Initialize hit flag as down.
            let hit: boolean = false;

            // Loop though off-click exception.
            this.targetHandles.forEach((targetHandle: HTMLElement) => {

                // If an exception was hit, raise the hit flag.
                if (event.target == targetHandle) hit = true;
            });
            
            // If no exceptions were hit, it was an off-click, so revert the changes.
            if (!hit) this.revert();
        }
    }

    /*
        Puts provided text in text box.
    */
    public setText(text: string): void {
        this.textBox.innerText = text;
    }

    /*
        Begins edit process.
    */
    public start(): void {

        // Get a handle on the current verion of text.
        this.currentText = this.textBox.innerText;

        // Show confirm and cancel control buttons.
        ViewUtil.show(this.btnSlot);

        // Make text box editable.
        this.textBox.contentEditable = `${true}`;

        // Put cursor in text box.
        this.textBox.focus();

        // "Turn on" window click function.
        this.turnOnWindowClickFunc();
    }

    /*
        XXX should be renamed to confirm() and send and display errors should be other functions!!!!!!!
        Tests length contraint and either sends the message to the callback and ends the edit, or displays an error message.
    */
    private send(): void {

        // If text does not exceed length,
        if (this.textBox.innerText.length <= this.maxLength) {

            // invoke callback with edited text,
            this.callback(this.textBox.innerText);

            // and end the edit process.
            this.end();
        }

        // else display error message.
        // Add new tag with error message in it to error box.
        // XXX make ErrorCard XXX
        else this.errorBox.add({
            rootElm: ViewUtil.tag('div', {
                classList: 'errorMsg',
                innerText: `- Must be less than ${this.maxLength} characters`
            })
        });
    }

    /*
        Ends the editing process.
    */
    private end(): void {

        // Hide control buttons.
        ViewUtil.hide(this.btnSlot);

        // Clear error messages from error box.
        this.errorBox.clear();

        // Make text box non-editable.
        this.textBox.contentEditable = `${false}`;

        // "turn off" this.windowClickFunc.
        // Replace it with an empty function.
        this.windowClickFunc = (e: MouseEvent) => { };
    }

    /*
        Revert innertext before ending editing process.
    */
    private revert(): void {

        // Revert inner text.
        this.textBox.innerText = this.currentText;

        // End editing process.
        this.end();
    }   
}