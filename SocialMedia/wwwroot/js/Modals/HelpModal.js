/*
    This class contains just enough to qualify the help modal as a modal.
    There is no unique functionality in the help modal.
*/
class HelpModal {

    /*
    
    // A requirement of being a modal. The base class shows and hides this.
    modalCon;

    */

    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
    */
    static initialize() {

        // Inherit from base class.
        Modal.add(this);

        // Get handles on modal HTML elms.
        this.modalCon = document.getElementById('helpModal');
    }

}