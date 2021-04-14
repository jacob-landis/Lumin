class Stage {
    
    constructor(
        public flags: StageFlag[],
        public onStagingEnd?: () => void
    ) {
        flags.forEach((stageFlag: StageFlag) => stageFlag.lower())
    }
    
    public updateStaging(stageFlag: StageFlag) {

        stageFlag.raise();

        // Check if all flags are raised.
        let hit: boolean = false;
        this.flags.forEach((flag: StageFlag) => { if (!flag.isRaised) hit = true; });

        // All stage flags were raised.
        if (!hit && this.onStagingEnd != null) this.onStagingEnd();
    }

}