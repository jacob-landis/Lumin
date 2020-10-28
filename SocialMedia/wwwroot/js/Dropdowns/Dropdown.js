/*
    This is a sudo-base class.
    This class adds methods to obj that are apssed to it and those objs are held in a global list.
    This class also controlls the dropdown space; making sure that no more than one dropdown is open at once.
*/
class Dropdown {

    // Global list of dropdowns.
    static dropdowns = [];

    /*
        Objs sent to this funtion effectively inherit from a base class.
        They inherit open, close, and toggle methods and become iteratable.
        They also inherit the isOpen property.

        dropdown must have a dropdownCon property that is an HTML elm with a 'dropdownBox' class attribute,
        it must have a content property that is an HTML elm with a 'dropdown-content' class attribute,
        it must have a load method that invokes open() at the end of it,
        and it must add invoke Dropdown.add() with itself as the parameter after it has initialized the required properties.
        
        XXX consider redoing this logic!!!!
        
        XXX the logic of open(), close(), toggle() and load() needs to be re-examined!!!

    */
    static add(dropdown) {

        // Add open method to dropdown.
        dropdown.open =

            // When open() is invoked on dropdown,
            () => {

                // invoke the static open() method with dropdown,
                this.open(dropdown.dropdownCon);

                // and raise the dropdown's isOpen flag.
                dropdown.isOpen = true; // XXX why not pass the whole dropdown into Dropdown.open() and let it raise the isOpen flag????
        }

        // Add close method to dropdown
        dropdown.close =

            // When close() is invoked on dropdown,
            () => {

                // invoke the static close() method with dropdown,
                this.close(dropdown.dropdownCon);

                // and lower the dropdown's isOpen flag.
                dropdown.isOpen = false;
        }

        // Add toggle method to dropdown
        dropdown.toggle =

            // When toggle() is invoked on dropdown,
            () => {

                // if the dropdown is open, invoke close() on it,
                if (dropdown.isOpen) dropdown.close();

                // else, invoke load() on dropdown.
                else dropdown.load(); // XXX why is this not dropdown.open()????
        }

        // Add dropdown to global list.
        this.dropdowns.push(dropdown);

        // Constrain hight of dropdown content so it is not underneath the navigation bar.
        dropdown.content.style.height = window.innerHeight - Main.navBar.clientHeight;
    }
    
    /*
        Show the provided dropdown's main tag after invoking close() on all the other dropdowns. 
    */
    static open(dropdownCon) {

        // Iterate over all dropdowns and invoke close() on each.
        this.dropdowns.forEach(d => d.close());

        // Show the provided dropdown's main tag.
        ViewUtil.show(dropdownCon, 'block');
    }

    /*
        Hide the provided dropdown's main tag. 
    */
    static close(dropdownCon) { ViewUtil.hide(dropdownCon); }
}