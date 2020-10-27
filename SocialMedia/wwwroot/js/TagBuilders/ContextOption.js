class ContextOption {

    constructor(tag, func) {

        this.tag = ViewUtil.tag(
            'div',
            {
                classList: 'context-option',
                onclick: func
            });

        this.tag.append(tag);
        // XXX if the provided tag had an on-click as well as this context option's tag, which on-click would invoke? Both?
        // XXX this relates to the editory and whether it can handle imbedding the invoke start() callback.
    }
}