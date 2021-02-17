/*
    USAGE:
    - Invoke Modal.initialize.
    - Construct Modal derived classes.

    STATIC PROPERTIES & METHODS:
    - private openDropdowns: Dropdown[]
    - private frameContainer: HTMLElement
    - private frameTemplate: HTMLElement
    - public initialize(frameTemplate, frameContainer): void
    
    INHERITED PROPERTIES & METHODS:
    - public rootElm: HTMLElement
    - public contentElm: HTMLElement
    - public open(): void
    - public close(): void
    - private toggle(): void
    
    This class adds methods to obj that are apssed to it and those objs are held in a global list.
    This class also controlls the dropdown space; making sure that no more than one dropdown is open at once.
*/
class Dropdown implements IAppendable {
    
    /*
        Objs sent to this funtion effectively inherit from a base class.
        They inherit open, close, and toggle methods and become iteratable.
        They also inherit the isOpen property.

        dropdown must have a dropdownCon property that is an HTML elm with a 'dropdownBox' class attribute,
        dropdown must have a content property that is an HTML elm with a 'dropdown-content' class attribute,
        dropdown must have a load method that invokes open() at the end of it,
        and it must add invoke Dropdown.add() with itself as the parameter after it has initialized the required properties.
        
        XXX consider redoing this logic!!!!
        
        XXX the logic of open(), close(), toggle() and load() needs to be re-examined!!!

    */
    // XXX --------------------------XXX
    public static openDropdown: Dropdown = null;
    private static frameTemplate: HTMLElement; // provided in initialize
    private static frameContainer: HTMLElement; // provided in initialize

    public static initialize(frameTemplate: HTMLElement, frameContainer: HTMLElement): void {
        
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
    }
    
    /*
        Move any open dropdown to the foreground by raising it's zIndex.
    */
    public static moveToForeground(): void {
        if (this.openDropdown != null) this.openDropdown.rootElm.style.zIndex = `${Modal.highestZIndex + 1}`;
    }

    /*
        Move any open dropdown to the background by lowering it's zIndex.
    */
    public static moveToBackground(): void {
        if (this.openDropdown != null) this.openDropdown.rootElm.style.zIndex = `${Modal.highestZIndex - 1}`;
    }

    /*
        Close any open dropdown. 
    */
    public static closeAny(): void {
        imageDropdown.close();
        friendDropdown.close();
    }

    // /STATIC
    // -----------------------------------------------------------------------------------------
    // NON-STATIC

    public rootElm: HTMLElement;
    protected contentElm: HTMLElement;
    private frameElm: HTMLElement;

    protected constructor(rootElm: HTMLElement, contentElm: HTMLElement) {
        this.rootElm = rootElm;
        this.contentElm = contentElm;
        
        // Clone frame template.
        this.frameElm = ViewUtil.copy(Dropdown.frameTemplate);

        // Append rootElm to frame.
        this.frameElm.append(this.rootElm);

        // Append frame to frame container.
        Dropdown.frameContainer.append(this.frameElm);

        // Constrain hight of dropdown content.
        this.contentElm.style.height = `${window.innerHeight}`;
    }

    /*
        Show the dropdown after closing the open one.
    */
    public open(): void {

        // Close context menu, even if it's already closed.
        contextMenu.close();
        
        // If a dropdown is open, close it.
        if (Dropdown.openDropdown != null) Dropdown.openDropdown.close();

        // Put this in openDropdown slot. In effect raising the flag.
        Dropdown.openDropdown = this;
        
        // Put the dropdown in the foreground in case a modal is open.
        // Otherwise it is covered by the modal backdrop and that backdrop will dim the dropdown and intercept any click intended for the dropdown.
        this.rootElm.style.zIndex = `${Modal.highestZIndex + 1}`;

        // Show the dropdown's root element.
        ViewUtil.show(this.rootElm, 'block');
    }

    /*
        Hide the dropdown. 
    */ 
    public close(): void {

        // Close context menu, even if it's already closed.
        contextMenu.close();

        // Hide the dropdown's root element.
        ViewUtil.hide(this.rootElm);
        
        // Clear this from openDropdown slot. In effect lowering the flag.
        Dropdown.openDropdown = null;
    }

    /*
        Either open, close, or move to foreground.
    */
    public toggle(): void {
        
        let closed: boolean = !ViewUtil.isDisplayed(this.rootElm);
        let openAndCovered: boolean = !closed && (+this.rootElm.style.zIndex < Modal.highestZIndex);

        if      (openAndCovered) Dropdown.moveToForeground();
        else if (closed)         this.open();
        else                     this.close();
    }
}