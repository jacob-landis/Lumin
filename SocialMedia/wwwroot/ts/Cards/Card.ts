class Card implements IAppendable, IUnloadable {
    
    public imageBoxes: ImageBox[] = [];

    protected constructor(public rootElm: HTMLElement) { }
    public alertVisible(): void { }
}