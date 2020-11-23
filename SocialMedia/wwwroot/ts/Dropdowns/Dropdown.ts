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
    private static openDropdowns: Dropdown[] = [];
    private static frameTemplate: HTMLElement; // provided in initialize
    private static frameContainer: HTMLElement; // provided in initialize

    public static initialize(frameTemplate: HTMLElement, frameContainer: HTMLElement): void {
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
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
        this.frameElm = ViewUtil.copy(Dropdown.frameTemplate); // XXX convert Node to HTMLElement.

        // Append rootElm to frame.
        this.frameElm.append(this.rootElm);

        // Append frame to frame container.
        Dropdown.frameContainer.append(this.frameElm);

        // Constrain hight of dropdown content so it is not underneath the navigation bar.
        this.contentElm.style.height = `${window.innerHeight - Main.navBar.clientHeight}`;
    }

    /*
        Show the provided dropdown's main tag after invoking close() on all the other dropdowns. 
    */
    public open(): void {
        
        // Iterate over all dropdowns and invoke close() on each.
        Dropdown.openDropdowns.forEach(d => d.close());

        // Show the provided dropdown's main tag.
        ViewUtil.show(this.rootElm, 'block');
    }

    /*
        Hide the provided dropdown's main tag. 
    */ 
    public close(): void {
        ViewUtil.hide(this.rootElm);
        
        // REMOVE THIS FROM LIST OF MODALS
        // Set the handle of the given modalCon in modalCons to null.
        Dropdown.openDropdowns[Dropdown.openDropdowns.indexOf(this)] = null;

        // Filter out the null value from modalCons.
        Util.filterNulls(Dropdown.openDropdowns);
    }

    public toggle(): void {

        this.rootElm.style.display != 'none' ? this.open() : this.close();

        // If the dropdown is open, close it,
        if (this.rootElm.style.display != 'none') this.close();

        // else, open it.
        else this.open();
    }
}