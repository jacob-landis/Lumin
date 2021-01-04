/*
    This class creates a prompt, giving the user a chance to back out of an action.
*/
class ConfirmPrompt {
    
    // The callback that the user's answer gets returned through.
    private onUserDecision: (answer: boolean) => void;
    private backgroundElm: HTMLElement;
    private contentElm: HTMLElement;

    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    public constructor(
        backgroundElm: HTMLElement,
        contentElm: HTMLElement,           // Base parameter.

        // Used to show a message to the user (Ex. "Are you sure you want to delete this comment?")
        private lblPrompt: HTMLElement, // XXX consider using this technique in other places or remove this case of it. XXX
        btnYes: HTMLElement,            // Invokes confirm with true.
        btnNo: HTMLElement              // Invokes confirm with false.
    ) {
        this.backgroundElm = backgroundElm;
        this.contentElm = contentElm;

        // Connect yes and no buttons to confirm(), but load a different value into each.
        btnYes.onclick = () => this.respond(true)
        btnNo.onclick = () => this.respond(false)
    }

    /*
        Prompt the user to confirm or cancel.

        PARAMETERS:
        message is displayed to user before they decide.
        callback is used to send the user's decision back.
    */
    public load(message: string, onUserDecision: (answer: boolean) => void): void {

        // Get a handle on the callback.
        this.onUserDecision = onUserDecision;

        // Insert the callers message into the prompt.
        this.lblPrompt.innerText = message;

        // Open this modal.
        this.open();
    }

    /*
        Returns the user's answer and closes this modal.
    */
    private respond(answer: boolean): void {

        // Return the user's answer to the caller through the previously provided callback.
        this.onUserDecision(answer);

        // Close this modal.
        this.close();
    }

    private open() {

        // Show modal.
        ViewUtil.show(this.backgroundElm);
        
        // Give body elm a class that locks page scrolling.
        document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    }

    private close() {

        // Hide modal.
        ViewUtil.hide(this.backgroundElm);
        
        // Remove the class from body that locks page scrolling.
        document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');
        
    }
}