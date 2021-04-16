var Stage = (function () {
    function Stage(flags, onStagingEnd) {
        this.flags = flags;
        this.onStagingEnd = onStagingEnd;
        flags.forEach(function (stageFlag) { return stageFlag.lower(); });
    }
    Stage.prototype.updateStaging = function (stageFlag) {
        stageFlag.raise();
        var hit = false;
        this.flags.forEach(function (flag) { if (!flag.isRaised)
            hit = true; });
        if (!hit && this.onStagingEnd != null)
            this.onStagingEnd();
    };
    return Stage;
}());
//# sourceMappingURL=Stage.js.map