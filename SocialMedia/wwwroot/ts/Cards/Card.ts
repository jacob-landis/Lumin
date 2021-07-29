class Card implements IAppendable{
    
    public imageBoxes: ImageBox[] = [];

    protected constructor(public rootElm: HTMLElement) { }
    public alertVisible(): void { }
}