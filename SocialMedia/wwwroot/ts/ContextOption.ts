/*
    This class contains logic for creating context menu options.
    It uses an existing element as it's root element rather than creating it's own, so that icons can be turned into context options.
*/
class ContextOption implements IAppendable {

    public rootElm: HTMLElement;

    public constructor(rootElm: HTMLElement, title: string, onOptionClick: (event: MouseEvent) => void) {
        
        this.rootElm = rootElm;
        
        this.rootElm.classList.add('context-option');
        this.rootElm.title = title;
        this.rootElm.onclick = onOptionClick;
    }
}