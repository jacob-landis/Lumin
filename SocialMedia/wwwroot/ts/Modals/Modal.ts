/*
    USAGE: 
    - Invoke Modal.initialize.
    - Construct Modal derived classes.
    
    STATIC PROPERTIES & METHODS:
    - private openModals: Modal[]
    - private btnClose: HTMLElement
    - private frameContainer: HTMLElement
    - private frameTemplate: HTMLElement
    - public initialize(frameTemplate, frameContainer, btnClose): void
    - private closeTopModal(): void

    INHERITED PROPERTIES & METHODS:
    - protected constructor(rootElm: HTMLElement)
    - public open(): void
    - public close(): void

*/

class Modal implements IAppendable {
    
    public static openModals: Modal[] = []; // provided in constructor

    private static frameTemplate: HTMLElement; // provided in initialize

    private static frameContainer: HTMLElement; // provided in initialize

    // Used to close the foremost modal.
    // Visible when any modal (besides the context modal) is open
    protected static btnClose: HTMLElement; // provided in initialize

    public static initialize(frameTemplate: HTMLElement, frameContainer: HTMLElement, btnClose: HTMLElement): void {

        // Get a handle on the frame template.
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
        this.btnClose = btnClose;
        
        // Set event listener on btnCloseModal to invoke closeHighestModal.
        this.btnClose.onclick = () => this.closeTopModal();
        
        // Set click event for window to,
        window.onclick = e => {

            // cast event target and check if it has modalBox in it's class list,
            // (the "target" could be behind the elm that was actually clicked. I dont know why, but checking the classlist specifically work)
            if ((<HTMLElement>e.target).classList.contains("modalBox")) // XXX double check this. XXX

                // and invoke closeTopModal if it does.
                this.closeTopModal();
        };
    }

    private static closeTopModal(): void { this.openModals[this.openModals.length - 1].close(); }
    
    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    public rootElm: HTMLElement;
    private frameElm: HTMLElement;

    // Only usable by derived classes.
    protected constructor(rootElm: HTMLElement) {

        // Get handle 
        this.rootElm = rootElm;
        
        // Clone frame template.
        this.frameElm = ViewUtil.copy(Modal.frameTemplate); // XXX convert Node to HTMLElement.

        // Append rootElm to frame.
        this.frameElm.append(this.rootElm);

        // Append frame to frame container.
        Modal.frameContainer.append(this.frameElm);
    }
    
    /*
        Opens a modal, closing it first if it needs to.
        Can be overridden.
    */
    public open(): void {
        
        // Refresh modal.
        this.close();

        // Show modal.
        ViewUtil.show(this.frameElm)
        
        // Display close button.
        ViewUtil.show(Modal.btnClose, 'block');

        // Add modal to list of open modals, and give it the highest z index. (push() returns the index number of the new value)
        this.rootElm.style.zIndex = `${Modal.openModals.push(this)}`;
        
        // If modal is not context modal or confirm modal, lock scrolling.
        if (!(this.rootElm.id == 'contextModal' || this.rootElm.id == 'confirmModal')) // XOR

            // Give body elm a class that locks page scrolling.
            //document.getElementsByTagName("BODY")[0].classList = 'scrollLocked';
        document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    }
    
    /*
        If closing requires confirmation, it waits for confirmation, otherwise it just closes modal.
        Can be overridden.
    */
    public close(): void {

        // Hide modal.
        ViewUtil.hide(this.frameElm);

        // REMOVE THIS FROM LIST OF MODALS
        // Set the handle of the given modalCon in modalCons to null.
        Modal.openModals[Modal.openModals.indexOf(this)] = null;

        // Filter out the null value from modalCons.
        Modal.openModals = Util.filterNulls(Modal.openModals);

        // IF NO MODALS ARE OPEN, UNLOCK SCROLLING
        // If no modal is open,
        if (Modal.openModals.length == 0) {

            // remove the class from body that locks scrolling,
            //document.getElementsByTagName("BODY")[0].classList = '';
            document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');

            // and hide btnClose.
            ViewUtil.hide(Modal.btnClose);
        }
    }
}