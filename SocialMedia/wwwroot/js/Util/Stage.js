var Stage = (function () {
    function Stage(stageFlags, onStagingEnd) {
        this.stageFlags = stageFlags;
        this.onStagingEnd = onStagingEnd;
    }
    Stage.prototype.updateStaging = function (stageFlag) {
        stageFlag.raise();
        var hit = false;
        this.stageFlags.forEach(function (flag) { if (!flag.isRaised)
            hit = true; });
        if (!hit && this.onStagingEnd != null)
            this.onStagingEnd();
    };
    return Stage;
}());
//# sourceMappingURL=Stage.js.map