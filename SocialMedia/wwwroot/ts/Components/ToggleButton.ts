class ToggleState {
    public constructor(
        public classList: string,
        public title: string,
        public onClick?: () => void,
    ) { }
}

class ToggleButton implements IAppendable {

    public rootElm: HTMLElement;
    private stateIndex: number = 0;
    private onClick: () => void;
    
    public constructor(
        classList: string,
        iconContainer?: HTMLElement,
        private icon?: HTMLElement,
        private propertySets?: ToggleState[]
    ) {
        this.rootElm = iconContainer ? iconContainer : ViewUtil.tag('div');
        if (classList) this.rootElm.classList.add(classList);
        this.rootElm.onclick = (event: MouseEvent) => {
            this.onClick();
            this.toggle();
        }

        this.reset();
    }

    private toggle(): void {
        
        let oldSet: ToggleState = this.propertySets[this.stateIndex];
        this.stateIndex = ((this.stateIndex + 1) >= this.propertySets.length) ? 0 : this.stateIndex + 1;
        let newSet: ToggleState = this.propertySets[this.stateIndex];

        this.setBtn(newSet.classList, oldSet.classList, newSet.title, newSet.onClick);
    }

    private setBtn(newClass?: string, oldClass?: string, title?: string, onClick?: () => void): void {

        if (this.icon != null) {
            if (oldClass != '') this.icon.classList.remove(oldClass);
            if (newClass != '') this.icon.classList.add(newClass);
        }
        else {
            if (oldClass != '') this.rootElm.classList.remove(oldClass);
            if (newClass != '') this.rootElm.classList.add(newClass);
        }

        if (title) this.rootElm.title = title;
        if (onClick) this.onClick = onClick;
    }

    public reset() {
        this.setBtn(this.propertySets[0].classList, '', this.propertySets[0].title, this.propertySets[0].onClick);
    }
}