class ViewUtil {

//_____ TAG BUILDERS 

    public static tag(tagName: string, propertySetting?: any): HTMLElement {
        let newElement: HTMLElement = document.createElement(tagName);
        
        if (propertySetting) {
            if (propertySetting.id) newElement.id = propertySetting.id;
            if (propertySetting.classList) 
                (<string>propertySetting.classList).split(' ').forEach(
                    (className: string) => {
                        if (className != '' && className != null)
                            newElement.classList.add(className)
                    }
                )
            if (propertySetting.name) newElement.setAttribute('name', propertySetting.name); 
            if (propertySetting.color) newElement.style.color = propertySetting.color;
            if (propertySetting.innerHTML) newElement.innerHTML = propertySetting.innerHTML;
            if (propertySetting.innerText) newElement.innerText = propertySetting.innerText;
            if (propertySetting.src) newElement.setAttribute('src', `data:image/png;base64,${propertySetting.src}`);
            if (propertySetting.onclick) newElement.onclick = propertySetting.onclick;
            if (propertySetting.type) newElement.setAttribute('type', propertySetting.type);
            if (propertySetting.title) newElement.title = propertySetting.title;
            if (propertySetting.oncontextmenu) newElement.oncontextmenu = propertySetting.oncontextmenu;
        }
        return newElement;
    }


//_____ TAG READERS

    public static isDisplayed(element: HTMLElement): boolean {
        return (
            element.style.display == 'inline'       ||
            element.style.display == 'block'        ||
            element.style.display == 'inline-flex'  ||
            element.style.display == 'flex'         ||
            element.style.display == 'grid'
        );
    }

//_____ TAG MANIPULATORS

    // Add the provided classList to the provided element.
    public static addClassList(classList: string, elm: HTMLElement) {
        let classListArray: string[] = classList.split(' ');
        classListArray.forEach((c: string) => elm.classList.add(c));
    }

    // Return deep copy of the provided element.
    public static copy(elm: HTMLElement): HTMLElement {
        return <HTMLElement>elm.cloneNode(true);
    }

    // Perform null check before removing the provided element. (Error prevention)
    public static remove(elm: HTMLElement): void {
        if (elm != null) elm.remove();
    }

    // Perform null check before iteratively removing child nodes from the provided element.
    public static empty(elm: HTMLElement): void {
        if (elm != null) while (elm.firstChild) elm.removeChild(elm.firstChild);
    }

    // Set display attribute to 'none' on the provided element.
    // Delay used to wait for animation to finish.
    public static hide(elm: HTMLElement, delay: number = 0, onHideEnd: () => void = null): void {
        setTimeout(() => {
            elm.style.display = 'none';
            if (onHideEnd != null) onHideEnd();
        }, delay);
    }

    // Set display attribute to 'inline'(default) or the provided string on the provided element.
    // Include argument(s) in onShow that set style properties to begin a transition animation.
    // (Timeout is used because changing the display property without a delay makes the transition instant)
    public static show(elm: HTMLElement, displayType: string = 'inline', onShow?: () => void): void {

        if (onShow == null) elm.style.display = displayType;

        else {
            elm.style.display = displayType;
            setTimeout(() => {
                onShow();
            }, 10);
        }
    }

    /*
        If the provided element is being displayed, hide it,
        else show it.
    */
    public static toggle(elm: HTMLElement, displayType: string = 'inline'): void {
        if (ViewUtil.isDisplayed(elm)) this.hide(elm);
        else this.show(elm, displayType);
    }
}