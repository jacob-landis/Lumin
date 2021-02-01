/*
    This class contains logic for creating context menu options.
*/
class ContextOption implements IAppendable {

    private static rootElmClassList: string;

    public static initialize(rootElmClassList: string) {
        this.rootElmClassList = rootElmClassList;
    }

    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    public rootElm: HTMLElement;

    public constructor(rootElm: HTMLElement, onOptionClick: (event: MouseEvent) => void) {
        
        this.rootElm = rootElm;
        
        this.rootElm.classList.add(ContextOption.rootElmClassList);
        this.rootElm.onclick = onOptionClick;
    }
}