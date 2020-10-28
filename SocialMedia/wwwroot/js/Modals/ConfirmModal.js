/*
    This class creates a prompt, giving the user a chance to back out of an action.
*/
class ConfirmModal {
    
    /*
    
    // A requirement of being a modal. The base class shows and hides this.
    modalCon;

    // An HTML element used to show a message to the user (Ex. "Are you sure you want to delete this comment?")
    promptMsg;
    
    // A button whos event listener invokes confirm with true.
    btnYes;
    
    // A button whos event listener invokes confirm with false.
    btnNo;
    
    // The callback that the user's answer gets returned through.
    func;

    */

    /*
        Sudo-inherits from the sudo-base class
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    static initialize() {

        // Inherit from base class.
        Modal.add(this);

        // Get handles on modal HTML elms.
        this.modalCon = document.getElementById('confirmModal');
        this.promptMsg = document.getElementById('promptMessage'); // XXX rename this to just prompt.
        this.btnYes = document.getElementById('btnConfirmYes');
        this.btnNo = document.getElementById('btnConfirmNo');

        // Connect yes and no buttons to confirm(), but load a different value into each.
        this.btnYes.onclick = () => this.confirm(true)
        this.btnNo.onclick = () => this.confirm(false)
    }

    /*
        Prompt the user to confirm or cancel.

        PARAMETERS:
        message should be a string.
        func should be a callback. It is used to send the user's decision back.
    */
    static load(message, func) {

        // Get a handle on the callback.
        this.func = func;

        // Insert the callers message into the prompt.
        this.promptMsg.innerText = message;

        // Open this modal.
        this.open();
    }

    /*
        PRIVATE
        Returns the user's answer and closes this modal.
        
        confirmation should be a bool.
    */
    static confirm(confirmation) {

        // Return the user's answer to the caller through the previously provided callback.
        this.func(confirmation);

        // Close this modal.
        this.close();
    }
}