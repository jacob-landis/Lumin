/*

    USAGE:
    - a class must add itself to this class through the "add" method

    REQUIRED PROPERTIES:
    - tag var named "modalCon"

    OPTIONAL PROPERTIES:
    - (advised) a tag with a classList of "modalBox" or "close"
    - "onClose" and "onOpen" methods
        - an "onClose" method must return a bool value to the callback

    "INHERITED" PROPERTIES & METHODS:
    - "open" method
    - "close" method
    - "isOpen" property

*/

class Modal {

    static modalCons = [];
    static modals = [];

    static initialize() {

        this.btnClose = document.getElementById('btnCloseModal');

        this.btnClose.onclick =()=> this.closeHighestModal()

        window.addEventListener('click', e => {
            if (e.target.classList.contains("modalBox")) this.closeHighestModal();
        });
    }

    static add(modal) {
        modal.open =()=> this.open(modal)
        modal.close =()=> this.close(modal)
        modal.isOpen = false;

        this.modals.push(modal);
    }

    static open(modal) {
        if (modal.isOpen) modal.close();
        if (modal.onOpen) modal.onOpen();
        ViewUtil.show(this.btnClose, 'block');
        ViewUtil.show(modal.modalCon, 'block');
        modal.isOpen = true;
        
        modal.modalCon.style.zIndex = this.modalCons.push(modal.modalCon);

        // every modal, except the context modal, locks main body scrolling when opened
        if (!(modal.modalCon.id == 'contextModal' || modal.modalCon.id == 'confirmModal')) // XOR
            document.getElementsByTagName("BODY")[0].classList = 'scrollLocked';
    }

    static closeHighestModal() {
        let lastModalCon = this.modalCons[this.modalCons.length - 1];
        this.modals.forEach(m => { if (m.modalCon == lastModalCon) m.close(); });
    }

    static close(modal) {
        // waits for confirmation from the onClose method of a modal before closing
        // if modal has an onClose method wait for confirmation, or else just close it
        if (modal.onClose) modal.onClose(confirmation => { if (confirmation) confirmClose(); });
        else confirmClose();

        function confirmClose() {
            modal.isOpen = false;
            ViewUtil.hide(modal.modalCon);

            // set the handle of the given modalCon in modalCons to null
            Modal.modalCons[Modal.modalCons.indexOf(modal.modalCon)] = null;
            Modal.modalCons = Util.filterNulls(Modal.modalCons);
            
            // if no modal is open
            if (Modal.modalCons.length == 0) {
                document.getElementsByTagName("BODY")[0].classList = '';
                ViewUtil.hide(Modal.btnClose);
            }
        }
    }
}