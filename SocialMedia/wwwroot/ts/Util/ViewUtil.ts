class ViewUtil {

//_____ TAG BUILDERS 

    static tag(tagName, x): HTMLElement {
        var tag = document.createElement(tagName);

        if (x) {
            if (x.id) tag.id = x.id;
            if (x.classList) tag.classList = x.classList;
            if (x.name) tag.name = x.name;
            if (x.color) tag.style.color = x.color;
            if (x.innerHTML) tag.innerHTML = x.innerHTML;
            if (x.innerText) tag.innerText = x.innerText;
            if (x.src) tag.src = `data:image/png;base64,${x.src}`;
            if (x.onclick) tag.onclick = x.onclick;
            if (x.type) tag.type = x.type;
            if (x.oncontextmenu) tag.oncontextmenu = x.oncontextmenu;
        }
        return tag;
    }


//_____ TAG MANIPULATORS

    // Return deep copy of the provided element.
    static copy(elm: HTMLElement): HTMLElement { return <HTMLElement> elm.cloneNode(true); }

    // Perform null check before removing the provided element. (Error prevention)
    static remove(elm: HTMLElement): void { if (elm != null) elm.remove(); }

    // Perform null check before iteratively removing child nodes from the provided element.
    static empty(elm: HTMLElement): void { if (elm != null) while (elm.firstChild) elm.removeChild(elm.firstChild); }

    // Set display attribute to 'none' on the provided element.
    static hide(elm: HTMLElement): void { elm.style.display = 'none'; }

    // Set display attribute to 'inline'(default) or the provided string on the provided element.
    static show(elm: HTMLElement, displayType: string = 'inline'): void { elm.style.display = displayType; }

    /*
        If the provided element is being displayed, hide it,
        else show it.
    */
    static toggle(elm, displayType = 'inline'): void {
        if (elm.style.display != 'none') this.hide(elm);
        else this.show(elm, displayType);
    }
}