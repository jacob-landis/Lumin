/*
    This class contains the functionality for a context menu.
    It only needs to be provided options and a click event.
*/
class ContextModal {

    /*
    
    // A requirement of being a modal. The base class shows and hides this.
    modalCon;

    // An enhanced container for storing the tags of context options.
    optionsBox;

    */

    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    static initialize() {

        // Inherit from base class.
        Modal.add(this);

        // Get a handle on modal HTML elm.
        this.modalCon = document.getElementById('contextModal');

        // Create a new content box using a modal HTML component and get a handle on it.
        this.optionsBox = new ContentBox(document.getElementById('contextContent'));

        // Set up scroll event listener for window.
        window.addEventListener('scroll', () => {

            // When window is scrolled, if this modal is open, close it.
            if (this.optionsBox.tag.style.display != "none") this.close();
        });

        // Set up click event on r-click menu to close when clicked on.
        // (The click event on the button on this modal will also be triggered.)
        this.optionsBox.tag.onclick = () => this.close();
    }

    /*
        Open this modal and display the provided options.

        PARAMETERS:
        e must be the click event.
        options can be an array of ContextOptions or a single ContextOption.
    */
    static load(e, options) {

        // Clear options box.
        this.optionsBox.clear();

        // Fill options box with the provided options.
        this.optionsBox.add(options);

        // Open this modal.
        this.open();

        // Prevent the default r-click action.
        e.preventDefault();

        // Reposition this modal tag to the position of the mouse.
        this.optionsBox.tag.style.left = e.clientX - this.optionsBox.width;
        this.optionsBox.tag.style.top = e.clientY - this.optionsBox.height;
    }
}