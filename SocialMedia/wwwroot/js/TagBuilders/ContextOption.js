class ContextOption {

    constructor(tag, func) {

        this.tag = ViewUtil.tag(
            'div',
            {
                classList: 'context-option',
                onclick: func
            });

        this.tag.append(tag);
    }
}