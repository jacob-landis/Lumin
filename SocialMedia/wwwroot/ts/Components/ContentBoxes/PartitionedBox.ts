class PartitionedBox extends ContentBox {

    private mainBox: ContentBox;
    private subBoxes: ContentBox[];
    public constructor(rootElm: HTMLElement) {
        super(rootElm);
    }
}