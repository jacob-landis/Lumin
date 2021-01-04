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
        
        // Set click event for window to close top modal.
        window.onclick = e => {

            // If the event target has modalBox in it's class list.
            // (the "target" could be behind the elm that was actually clicked. I dont know why, but checking the classlist specifically works)
            if ((<HTMLElement>e.target).classList.contains("modalBox"))

                // Invoke closeTopModal.
                this.closeTopModal();
        };
    }

    private static closeTopModal(): void { this.openModals[this.openModals.length - 1].close(); }
    
    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    // Frame template clone.
    public rootElm: HTMLElement;

    /*
        Only usable by derived classes.
    */
    protected constructor(contentElm: HTMLElement) {
        
        // Clone frame template.
        this.rootElm = ViewUtil.copy(Modal.frameTemplate);
        
        // Append contentElm to frame(rootElm).
        this.rootElm.append(contentElm);

        // Append frame(rootElm) to frame container.
        Modal.frameContainer.append(this.rootElm);
    }
    
    /*
        Opens a modal, closing it first if it needs to.
        Can be overridden.
    */
    public open(): void {
        
        // Refresh modal.
        // If open, close.
        if (this.rootElm.style.display == "inline" || this.rootElm.style.display == "block") this.close();

        // Show modal.
        ViewUtil.show(this.rootElm)
        
        // Display close button.
        ViewUtil.show(Modal.btnClose, 'block');

        // Add modal to list of open modals, and give it the highest z index. (push() returns the index number of the new value)
        this.rootElm.style.zIndex = `${Modal.openModals.push(this)}`;
        
        // If modal is not context modal or confirm modal, lock scrolling.
        if (!(this.rootElm.id == 'contextModal' || this.rootElm.id == 'confirmModal')) // XOR

            // Give body elm a class that locks page scrolling.
            document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    }
    
    /*
        If closing requires confirmation, it waits for confirmation, otherwise it just closes modal.
        Can be overridden.
    */
    public close(): void {

        // Hide modal.
        ViewUtil.hide(this.rootElm);
        
        // Remove this from list of modals. Start at the index of this and delete 1 item.
        Modal.openModals.splice(Modal.openModals.indexOf(this), 1);

        // If no modal is open,
        if (Modal.openModals.length == 0) {

            // remove the class from body that locks scrolling,
            document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');

            // and hide btnClose.
            ViewUtil.hide(Modal.btnClose);
        }
    }
}