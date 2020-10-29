/*

    This is the modal base class.

    USAGE:
    - a class must add itself to this class through the "add" method

    REQUIRED PROPERTIES:
    - tag var named "modalCon"

    OPTIONAL PROPERTIES:
    - (advised) a tag with a classList of "modalBox" or "close"
    - onOpen(): invoked before modal is opened.
    - onClose(): invoked before modal is closed. Will not close modal until the true is sent back in the callback.

    "INHERITED" PROPERTIES & METHODS:
    - "open" method
    - "close" method
    - "isOpen" property

*/
class Modal {

    // Modal container HTML elements that are currently open.
    static modalCons = [];

    // Collection of all classes that sudo-inherit from this class.
    static modals = [];

    /*
    
    // Used to close the foremost modal.
    // Visible when any modal (besides the context modal) is open
    btnClose;
    
    */

    /*
        Gets handle on btnCloseModal.
        Sets up event listeners.
    */
    static initialize() {

        // Get handle on btnCloseModal.
        this.btnClose = document.getElementById('btnCloseModal');

        // Set event listener on btnCloseModal to invoke closeHighestModal.
        this.btnClose.onclick =()=> this.closeHighestModal()

        // Set the click callback of window to invoke closeHighestModal().
        // Target is checked because clicking an elm above modalBox will still count as a click on modalBox,
        // but modalBox will not be the target.
        window.onclick =e=> { if (e.target.classList.contains("modalBox")) this.closeHighestModal(); };
    }

    /*
        Make a class inherit from this class.
        Add properties and methods to it.
        Add it to the list of modal sub classes.
    */
    static add(modal) {

        // Add open and close methods.
        modal.open =()=> this.open(modal)
        modal.close =()=> this.close(modal)

        // Add isOpen property.
        modal.isOpen = false;

        // Add to list of sub classes.
        this.modals.push(modal);
    }

    /*
        Opens a modal, closing it first if it needs to.
    */
    static open(modal) {

        // Close before re-opening to refresh the modal.
        if (modal.isOpen) modal.close();

        // Invoke opOpen is the sub-class subscribes to it.
        if (modal.onOpen) modal.onOpen();

        // Display btnClose.
        ViewUtil.show(this.btnClose, 'block');

        // Display modal container elm.
        ViewUtil.show(modal.modalCon, 'block');
        
        // Raise isOpen flag.
        modal.isOpen = true;
        
        // Add modal to list of modals being displayed, and restore it's z index.
        modal.modalCon.style.zIndex = this.modalCons.push(modal.modalCon);
        
        // If the modal being opened is not the contextModal or confirmModal,
        if (!(modal.modalCon.id == 'contextModal' || modal.modalCon.id == 'confirmModal')) // XOR

            // give body tag a class that locks page scrolling.
            document.getElementsByTagName("BODY")[0].classList = 'scrollLocked';
    }

    /*
        Invokes close on the last modal in modalCons.
    */
    static closeHighestModal() {

        // Get a handle on the last modal in modal cons.
        let lastModalCon = this.modalCons[this.modalCons.length - 1]; // XXX why not have an array of modal objs?

        // Look through modal objs for matching modalCon and close the match.
        this.modals.forEach(m => { if (m.modalCon == lastModalCon) m.close(); });
    }

    /*
        If closing requires confirmation, it waits for confirmation, otherwise it just closes modal.
    */
    static close(modal) {

        // If modal has an onClose method wait for confirmation,
        if (modal.onClose) modal.onClose(confirmation => { if (confirmation) confirmClose(); });

        // else just close it.
        else confirmClose();

        // Function that actually closes code is seperate so it can be sent with confirmation callback.
        function confirmClose() {

            // Lower isOpen flag.
            modal.isOpen = false;

            // Hide modal's modalCon.
            ViewUtil.hide(modal.modalCon);

            // Set the handle of the given modalCon in modalCons to null.
            Modal.modalCons[Modal.modalCons.indexOf(modal.modalCon)] = null;

            // Filter out the null value from modalCons.
            Modal.modalCons = Util.filterNulls(Modal.modalCons);
            
            // If no modal is open,
            if (Modal.modalCons.length == 0) {

                // remove the class from body that locks scrolling,
                document.getElementsByTagName("BODY")[0].classList = '';

                // and hide btnClose.
                ViewUtil.hide(Modal.btnClose);
            }
        }
    }
}