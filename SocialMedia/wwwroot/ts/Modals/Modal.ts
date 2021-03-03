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

    // Holds references to all open modals.
    public static openModals: Modal[] = [];

    // The highest zIndex of the last modal in openModals.
    public static get highestZIndex(): number {
        return this.openModals.length == 0 ? 0 : +Modal.openModals[Modal.openModals.length - 1].rootElm.style.zIndex;
    }

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
        this.btnClose.onclick = (e: MouseEvent) => this.closeTopModal();
        
        // Set click event for window to close top modal.
        window.addEventListener('click', (e: MouseEvent) => {

            // If the event target has modalBox in it's class list.
            // (the "target" could be behind the elm that was actually clicked. I dont know why, but checking the classlist specifically works)
            if ((<HTMLElement> e.target).classList.contains("modalBox"))

                // Invoke closeTopModal.
                this.closeTopModal();
        });
    }

    private static closeTopModal(): void {
        this.openModals[this.openModals.length - 1].close();
    }
    
    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    // Frame template clone.
    public rootElm: HTMLElement;

    // Raised at start of transition and lowered at end.
    private isTransitioning: boolean = false;

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
        Opens a modal, or brings it to the foreground if it's already open.
    */
    public open(): void {

        // Close context menu, even if it's already closed.
        contextMenu.close();
        
        // Assign this root element the highest zIndex of all the open modals.
        this.rootElm.style.zIndex = `${Modal.highestZIndex + 1}`;

        // If closed.
        if (!ViewUtil.isDisplayed(this.rootElm)) {

            // Show modal (after fade-in).
            ViewUtil.show(this.rootElm, 'inline', () => {

                // Target opacity. Starts fade-in.
                this.rootElm.style.opacity = '1';

                // Display close button.
                ViewUtil.show(Modal.btnClose, 'block');

                // Add this to the list of open modals.
                Modal.openModals.push(this);

                // Give body elm a class that locks page scrolling.
                document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');

                // Bring any open dropdown to foreground.
                Dropdown.moveToForeground();
            });
        }
        else { // If already open.

            // Move this to the top of list so it's array index matches it's Z index.
            Modal.openModals.splice(Modal.openModals.indexOf(this), 1);
            Modal.openModals.push(this);
        }
    }
    
    /*
        If closing requires confirmation, it waits for confirmation, otherwise it just closes modal.
        Can be overridden.
    */
    public close(): void {

        // Close context menu, even if it's already closed.
        contextMenu.close();

        // If open and not transitioning.
        if (ViewUtil.isDisplayed(this.rootElm)) {

            // Hide modal (after fade-out).
            ViewUtil.hide(this.rootElm, 150);
            
            // Change style to start transition animation.
            this.rootElm.style.opacity = '0';

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
}