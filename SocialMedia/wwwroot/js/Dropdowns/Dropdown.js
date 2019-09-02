class Dropdown {

    static dropdowns = [];

    static add(dropdown) {

        dropdown.open = () => {
            this.open(dropdown.dropdownCon);
            dropdown.isOpen = true;
        }

        dropdown.close = () => {
            this.close(dropdown.dropdownCon);
            dropdown.isOpen = false;
        }

        dropdown.toggle = () => {
            if (dropdown.isOpen) dropdown.close();
            else dropdown.load();
        }

        this.dropdowns.push(dropdown);
        dropdown.content.style.height = window.innerHeight - Main.navBar.clientHeight;
    }

    static open(dropdownCon) { // close all and then open desired one
        this.dropdowns.forEach(d => d.close());
        ViewUtil.show(dropdownCon, 'block');
    }
    
    static close(dropdownCon) { ViewUtil.hide(dropdownCon); }
}