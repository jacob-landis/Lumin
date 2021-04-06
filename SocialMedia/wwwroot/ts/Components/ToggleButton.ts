class ToggleButton implements IAppendable {

    public rootElm: HTMLElement;

    private stateIsPrimary: boolean = true;

    private icon: HTMLElement;
    private primaryStateClass: string;
    private secondaryStateClass: string;
    private primaryTitle: string;
    private secondaryTitle: string;
    private primaryOnClick: (event: MouseEvent) => void;
    private secondaryOnClick: (event: MouseEvent) => void;

    public constructor(
        classList: string,
        primaryStateClass?: string,
        secondaryStateClass?: string,
        primaryTitle?: string,
        secondaryTitle?: string,
        icon?: HTMLElement,
        iconContainer?: HTMLElement,
        primaryOnClick?: (event: MouseEvent) => void,
        secondaryOnClick?: (event: MouseEvent) => void
    ) {
        this.primaryStateClass = primaryStateClass;
        this.secondaryStateClass = secondaryStateClass;
        this.primaryTitle = primaryTitle;
        this.secondaryTitle = secondaryTitle;
        this.icon = icon;
        this.primaryOnClick = primaryOnClick;
        this.secondaryOnClick = secondaryOnClick;

        this.rootElm = iconContainer ? iconContainer : ViewUtil.tag('div');
        if (classList) this.rootElm.classList.add(classList);

        this.setBtn(this.primaryStateClass, '', this.primaryTitle, this.primaryOnClick);
    }

    public toggle(): void {

        // Toggle flag.
        this.stateIsPrimary = !this.stateIsPrimary;

        if (this.stateIsPrimary) this.setBtn(this.primaryStateClass, this.secondaryStateClass, this.primaryTitle, this.primaryOnClick);
        else this.setBtn(this.secondaryStateClass, this.primaryStateClass, this.secondaryTitle, this.secondaryOnClick? this.secondaryOnClick:null);
    }

    private setBtn(newClass?: string, oldClass?: string, title?: string, onClick?: (event: MouseEvent) => void): void {

        if (this.icon != null) {
            if (oldClass != '') this.icon.classList.remove(oldClass);
            if (newClass != '') this.icon.classList.add(newClass);
        }
        else {
            if (oldClass != '') this.rootElm.classList.remove(oldClass);
            if (newClass != '') this.rootElm.classList.add(newClass);
        }

        if (title) this.rootElm.title = title;
        if (onClick) this.rootElm.onclick = onClick;
    }
}