/*
    This class contains the logic for editing text.
    
    This is meant to be used instead of displaying a plain HTML text element. If the user owns the text, append this enhanced text elm instead.
    (In some cases, it is useful to merely hide the button that starts the edit if the current user is not the owner. ex. bio in profile modal)

    The only thing this doesn't handle is the creation of the start button, imbedding it's logic, or appending this editors tag elm somewhere.
    
    TERM: off-click
    DEFINITION: clicking on anything except the elements listed as parts of the editor.
*/
class Editor {

    // Off-click callback. Toggled between a function that does nothing and a function that invokes cancel().
    // It is a function that does nothing when no edit is happening.
    // Only after an edit begins does it become a function that invokes cancel().
    // A refernce to this is held in the list of window event listeners, so redefining it is like turning it on and off.
    windowClickFunc = () => { };

    // Length limit of text.
    maxLength;

    // A function that handles the edit results.
    callback;

    // The HTML elm that encapsulates all other HTML elms involved in editor.
    // This must be appended somewhere from outside of this class.
    tag;

    // A content box for error messages.
    errorBox;

    // The HTML text elm that display the main text and is edited.
    textBox;

    // A handle on the version of the text at the start of an edit.
    // Used to revert changes if the operation is canceled.
    currentText;

    // A container elm for btnConfirm and btnCancel.
    btnSlot;

    // Invokes send().
    btnConfirm;

    // Invokes revert().
    btnCancel;


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
    constructor(btnStart, text, classList, maxLength, callback) { // XXX the functionality of btnStart(() => editorr.start()) should be given in here.
        // XXX in CommentCard.js the callback could very well be assigned to the context option beforehand, unless it would be overwitten...

        // Get handles on maxLength and callback.
        this.maxLength = maxLength;
        this.callback = callback;

        // Create and get a handle on this editors main HTML tag.
        this.tag = ViewUtil.tag('div', { classList: `editor ${classList}` });

        // Create and get a handle on this editors content box for errors.
        this.errorBox = new ContentBox(null, 'error-box');

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
        this.tag.append(this.errorBox.tag, this.textBox, this.btnSlot);

        // Imbed functionality in the control buttons.
        this.btnConfirm.onclick = () => this.send()
        this.btnCancel.onclick = () => this.revert()
        
        // Add off-click exceptions to an array and get a handle on it.
        // Clicking on these will NOT stop the edit, but clicking on anything else will.
        this.targetHandles = [
            this.tag,       this.errorBox.tag,
            this.btnSlot,   this.btnConfirm,
            this.btnCancel, this.textBox,
            btnStart
        ];

        // Include all child tags of the start button as off-click exceptions.
        // Currently, no other exceptions are compound elms.
        let childNodes = btnStart.childNodes;
        childNodes.forEach(c => this.targetHandles.push(c));

        // At this point, this.windowClickFunc is an empty function, but once it's value is replaced by a real function, it can catch the clicks.
        window.addEventListener('click', e => this.windowClickFunc(e));
    }
    
    /* 
        PRIVATE
        Replaces the empty function in this.windowClickFunc with one that handles window click events.
    */
    turnOnWindowClickFunc() {

        // Replace empty function.
        this.windowClickFunc = e => {

            // Initialize hit flag as down.
            this.hit = false;

            // Loop though off-click exception.
            this.targetHandles.forEach(t => {

                // If a an exception was hit, raise hit flag.
                if (e.target == t) this.hit = true;
            });
            
            // If no exceptions were hit and the hit flag was never raised, it was an off-click, so revert the changes.
            if (!this.hit) this.revert();
        }
    }

    /*
        PUBLIC
        Puts provided text in text box.
    */
    setText(text) {
        this.textBox.innerText = text;
    }

    /*
        PUBLIC
        Begins edit process.
    */
    start() {

        // Get a handle on the current verion of text.
        this.currentText = this.textBox.innerText;

        // Show confirm and cancel control buttons.
        ViewUtil.show(this.btnSlot);

        // Make text box editable.
        this.textBox.contentEditable = true;

        // Put cursor in text box.
        this.textBox.focus();

        // "Turn on" window click function.
        this.turnOnWindowClickFunc();
    }

    /*
        PRIVATE XXX should be renamed to confirm() and send and display errors should be other functions!!!!!!!
        Tests length contraint and either sends the message to the callback and ends the edit, or displays an error message.
    */
    send() {

        // If text does not exceed length,
        if (this.textBox.innerText.length <= this.maxLength) {

            // invoke callback with edited text,
            this.callback(this.textBox.innerText);

            // and end the edit process.
            this.end();
        }

        // else display error message.
        // Add new tag with error message in it to error box.
        else this.errorBox.add({
            tag: ViewUtil.tag('div', {
                classList: 'errorMsg',
                innerText: `- Must be less than ${this.maxLength} characters`
            })
        });
    }

    /*
        PRIVATE
        Ends the editing process.
    */
    end() {

        // Hide control buttons.
        ViewUtil.hide(this.btnSlot);

        // Clear error messages from error box.
        this.errorBox.clear();

        // Make text box non-editable.
        this.textBox.contentEditable = false;

        // "turn off" this.windowClickFunc.
        // Replace it with an empty function.
        this.windowClickFunc = () => { };
    }

    /*
        PRIVATE
        Revert innertext before ending editing process.
    */
    revert() {

        // Revert inner text.
        this.textBox.innerText = this.currentText;

        // End editing process.
        this.end();
    }   
}