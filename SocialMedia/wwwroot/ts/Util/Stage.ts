class Stage {
    
    constructor(
        public stageContainers: HTMLElement[],
        public stageFlags: StageFlag[],
        public onStagingEnd?: () => void
    ) { }
    
    public updateStaging(stageFlag: StageFlag) {

        stageFlag.raise();

        // Check if all flags are raised.
        let hit: boolean = false;
        this.stageFlags.forEach((flag: StageFlag) => { if (!flag.isRaised) hit = true; });

        // All stage flags were raised.
        if (!hit && this.onStagingEnd != null) this.onStagingEnd();
    }

}