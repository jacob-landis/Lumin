/*
    This class contains the functionality for a context menu.
    It only needs to be provided options and a click event.
*/
class ContextModal extends Modal {

    // An enhanced container for storing the tags of context options.
    optionsBox: ContentBox;
    
    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    constructor(contentElm: HTMLElement) {

        super(contentElm);

        // Create a new content box using a modal HTML component and get a handle on it.
        this.optionsBox = new ContentBox(contentElm);

        // Set up scroll event listener for window. Close on scroll.
        window.addEventListener('scroll', () => {

            // When window is scrolled, if this modal is open, close it.
            if (this.optionsBox.rootElm.style.display != "none") this.close();
        });

        // Set up click event on r-click menu to close when clicked on.
        // (The click event on the button on this modal will also be triggered.)
        this.optionsBox.rootElm.onclick = () => this.close();

    }

    /*
        Open this modal and display the provided options.

        PARAMETERS:
        e must be the click event.
        options can be an array of ContextOptions or a single ContextOption.
    */
    public load(e: MouseEvent, options: ContextOption[]): void {

        // Clear options box.
        this.optionsBox.clear();

        // Fill options box with the provided options.
        this.optionsBox.add(options);

        // Open this modal.
        this.open();

        // Prevent the default r-click action.
        e.preventDefault();

        // Reposition this modal tag to the position of the mouse.
        this.optionsBox.rootElm.style.left = `${e.clientX - this.optionsBox.width}`;
        this.optionsBox.rootElm.style.top = `${e.clientY - this.optionsBox.height}`;
    }
}