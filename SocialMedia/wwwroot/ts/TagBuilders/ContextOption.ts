/*
    This class contains logic for creating context menu options.
*/
class ContextOption extends Card {
    
    public constructor(rootElm: HTMLElement, onOptionClick: (event: MouseEvent) => void) {

        rootElm.classList.add('context-option');
        rootElm.onclick = onOptionClick;

        super(rootElm); 
    }
}