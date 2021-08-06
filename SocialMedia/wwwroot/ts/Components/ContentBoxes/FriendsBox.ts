class FriendsBox extends ContentBox {
    
    public constructor(
        rootElm: HTMLElement,
        scrollElm: HTMLElement,
        requestCallback: (skip: number, take: number) => void
    ) {
        super(rootElm, scrollElm, 200, 20, requestCallback);
    }
}