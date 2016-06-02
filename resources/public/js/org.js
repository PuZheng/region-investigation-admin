export var newOrgForm = {
    controller: function () {
        this.errors = m.prop();
    },
    view: function (ctrl, page) {
        return (
            m('div', [
                m('.ui.top.attached.red.message', '创建组织'),
                m('.ui.bottom.attached.segment', [
                    m('form.ui.form', [
                        m('.field', [
                            m('label[for="input-name"]', '组织名称'),
                            m('input#input-name[type="text"][name="name"][placeholder="请输入组织名称"]'),
                            m('.ui.pointing.red.basic.label', {
                                class: (ctrl.errors() && ctrl.errors().name)? "": "invisible",
                            }, (ctrl.errors() && ctrl.errors().name) || ""),
                        ]),
                        m('.field', [
                            m('label[for="input-code"]', '组织代码'),
                            m('input#input-name[type="text"][name="code"][placeholder="请输入组织代码"]'),
                            m('.ui.pointing.red.basic.label', {
                                class: (ctrl.errors() && ctrl.errors().code)? "": "invisible",
                            }, (ctrl.errors() && ctrl.errors().code) || ""),
                        ])
                    ]),
                    m('input.ui.button.primary[type=submit][value="提交"]', {})
                ]),
            ])
        );
    }
};
