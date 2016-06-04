export var newOrgForm = {
    controller: function () {
        this.init = function () {
            this.errors = m.prop();
            this.name = m.prop('');
            this.code = m.prop('');
            this.loading = m.prop();
        }.bind(this);
        this.init();
    },
    view: function (ctrl, args) {
        return (
                m('div', [
                    m('.ui.top.attached.red.message', '创建组织'),
                    m('.ui.bottom.attached.segment', [
                        m('form.ui.form', {
                            class: ctrl.loading()? 'loading': '',
                            onsubmit: function (e) {
                                if (!ctrl.name()) {
                                    ctrl.errors({
                                        name: '名称不能为空'
                                    });
                                    return false;
                                }
                                if (!ctrl.code()) {
                                    ctrl.errors({
                                        code: '代码不能为空'
                                    });
                                    return false;
                                }
                                ctrl.loading(true);
                                m.request({
                                    method: 'POST',
                                    url: '/org/object',
                                    data: {
                                        name: ctrl.name(),
                                        code: ctrl.code(),
                                    }
                                }).then(function (data) {
                                    toastr.options.positionClass = "toast-bottom-center";
                                    toastr.options.timeOut = 1000;
                                    toastr.success('创建成功!');
                                    ctrl.init();
                                    args.onCreate(data);
                                }, ctrl.errors).then(function () {
                                    ctrl.loading(false);
                                });
                                return false; 
                            }
                        }, [
                            m('.field', [
                                m('label[for="input-name"]', '组织名称'),
                                m('input#input-name[type="text"][name="name"][placeholder="请输入组织名称"]', {
                                    oninput: m.withAttr('value', ctrl.name),
                                    value: ctrl.name(),
                                }),
                                m('.ui.pointing.red.basic.label', {
                                    class: (ctrl.errors() && ctrl.errors().name)? "": "invisible",
                                }, (ctrl.errors() && ctrl.errors().name) || ""),
                            ]),
                            m('.field', [
                                m('label[for="input-code"]', '组织代码'),
                                m('input#input-name[type="text"][name="code"][placeholder="请输入组织代码"]', {
                                    oninput: m.withAttr('value', ctrl.code),
                                    value: ctrl.code(),
                                }),
                                m('.ui.pointing.red.basic.label', {
                                    class: (ctrl.errors() && ctrl.errors().code)? "": "invisible",
                                }, (ctrl.errors() && ctrl.errors().code) || ""),
                            ]),
                            m('input.ui.button.primary[type=submit][value="提交"]')
                        ]),
                    ]),
                ])
        );
    }
};

export var orgList = {
    view: (ctrl, args) => (
        m('div', [
            m('.ui.top.attached.info.message', '组织列表'),
            m('.ui.bottom.attached.segment', [
                m('.ui.divided.list', (args.orgs() || []).map(
                    (org) => (
                        m('.item', [
                            m('.content', [
                                m('.header', {
                                    style: {
                                        display: 'inline-block'
                                    }
                                }, org.name),
                                m('.span', {
                                    style: {
                                        display: 'inline-block'
                                    }
                                }, '(' + org.code + ')')
                            ])
                        ])
                    )
                ))
            ])
        ])
    )
};
