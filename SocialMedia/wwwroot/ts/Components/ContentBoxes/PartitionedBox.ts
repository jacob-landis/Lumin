class PartitionedBox extends ContentBox {

    private mainBox: ContentBox;
    private subBoxes: ContentBox[];
    private feedFilter: string;
    private btnToggleFeedFilter: ToggleButton;
    private btnToggleSubBoxes: ToggleButton;
    private btnToggleSearchBar: ToggleButton;
    private btnSearch: HTMLElement;
    private txtSearch: HTMLInputElement;
    private stage: Stage;

    public constructor(rootElm: HTMLElement) {
        super(rootElm);
    }

    public setFeedFilter(feedFilter: string): void {
        this.feedFilter = feedFilter;
        this.btnToggleFeedFilter.toggle();

        this.stage = new Stage([this.mainBox.staged], () => this.display());

        ViewUtil.hide(this.rootElm);

        this.mainBox.clear();
        this.mainBox.request(10);
        this.mainBox.messageElm.innerText = '';

        this.subBoxes.forEach((box: ContentBox) => {
            if (box.content.length > 0) {
                this.stage.flags.push(box.staged);
                box.clear();
                box.request(10);
            }
        });
    }

    public refresh(): void {
        this.stage = new Stage([this.mainBox.staged], () => this.display());
        ViewUtil.hide(this.rootElm);

        this.mainBox.refresh(() => {
            this.subBoxes.forEach((box: ContentBox) => {
                if (box.content.length > 0) this.mainBox.messageElm.innerText = 'All'
            });
            this.stage.updateStaging(this.mainBox.staged);
        });

        this.subBoxes.forEach((box: ContentBox) => {
            if (box.content.length > 0) {
                this.stage.flags.push(box.staged);
                box.refresh(() => this.stage.updateStaging(box.staged));
            }
        });
    }

    public display(): void {
        ViewUtil.show(this.rootElm, 'block');
    }

    public showSubBoxes(): void {
        this.stage = new Stage([], () => this.display());
        ViewUtil.hide(this.rootElm);
        
        this.subBoxes.forEach((box: ContentBox) => {
            this.stage.flags.push(box.staged)
            box.request(10);
        });

        this.mainBox.messageElm.innerText = 'All';
        this.btnToggleSubBoxes.toggle;
    }

    public hideSubBoxes(): void {
        this.subBoxes.forEach((box: ContentBox) => {
            box.clear();
            box.messageElm.innerText = '';
        });

        this.mainBox.messageElm.innerText = ''
        this.btnToggleSubBoxes.toggle();
    }

    public showSearchBar(): void {
        ViewUtil.show(this.txtSearch);
        ViewUtil.show(this.btnSearch);
        this.btnToggleSearchBar.toggle();
        this.txtSearch.focus();
    }

    public hideSearchBar(): void {
        ViewUtil.hide(this.txtSearch);
        ViewUtil.hide(this.btnSearch);
        this.txtSearch.value = '';
        this.btnToggleSearchBar.toggle();
        this.mainBox.clear();
        this.mainBox.request(10);
        this.mainBox.messageElm.innerText = '';
    }
}