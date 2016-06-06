import fileButton from './file-button.js';

var fieldEditor = {
    controller: class {
        constructor () {
            this.name = m.prop('');
            this.type = m.prop('');
            this.errors = m.prop();
            this.typeLabels = {
                string: '字符串',
                images: '图片',
                video: '视频'
            };
        }
    },
    view: (ctrl, args) => (
        m('div', [
            m('.inline.field', [
                m('input[type="text"][placeholder="字段名称"]', {
                    style: {
                        width: 'auto'
                    },
                    oninput: m.withAttr('value', ctrl.name),
                    value: ctrl.name(),
                }),
                m('.ui.selection.dropdown', { config: fieldEditor.config(ctrl) }, [
                    m(`input[type="hidden"][value=${ctrl.type()}]`),
                    m('i.dropdown.icon'),
                    m('.default.text', '选择类型'),
                    m('.menu', ['string', 'images', 'video'].map(
                        (type) => m(`.item[data-value=${type}]`, ctrl.typeLabels[type]))),
                ]),
                m('.ui.icon.button', {
                    onclick: function () {
                        if (ctrl.name() in args.fields()) {
                            ctrl.errors({
                                name: '字段已经存在'
                            });
                        } else {
                            args.fields(Object.assign(args.fields(), {
                               [ctrl.name()]: ctrl.type(),
                            }));
                            ctrl.name('');
                            ctrl.type('');
                            ctrl.$dropdown.dropdown('clear');
                        }
                        return false;
                    }
                }, [
                    m('i.icon.plus.green')
                ]),
                m('.ui.pointing.red.basic.label', {
                    class: (ctrl.errors() && ctrl.errors().name)? "": "invisible",
                }, (ctrl.errors() && ctrl.errors().name) || ""),
            ]),
            m('ul.ui.divided.bulleted.list', _(args.fields()).toPairs().map(
                ([name, type]) => m('li.item', [
                    m('.content', [
                        m('.header', {
                            style: {
                                display: 'inline-block',
                                'padding-left': '1em',
                                'padding-right': '1em',
                            }
                        }, name),
                        m('.content', {
                            style: {
                                'padding-left': '1em',
                                'padding-right': '1em',
                                display: 'inline-block',
                            }
                        }, ctrl.typeLabels[type]),
                        m('.ui.icon.tiny.button', {
                            onclick: function () {
                                args.fields(_.omit(args.fields(), name));
                                return false;
                            }
                        }, [
                            m('i.icon.remove.red')
                        ]),
                    ])
                ])
            ).value()),
        ])
    ),
    config: (ctrl) => function (element, isInitialized) {
        if (!isInitialized) {
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.dropdown !== 'undefined') {
                ctrl.$dropdown = jQuery(element);
                ctrl.$dropdown.dropdown({
                    onChange: function (value, text, $choice) {
                        ctrl.type(value);
                    }
                });
            }
        }
    }
};

export var poiTypeForm = {
    controller: class {
        constructor (args) {
            this.init();
            this.args = args;
            console.log(args);
        }
        init () {
            this.loading = m.prop();
            this.errors = m.prop();
            this.orgs = m.request({
                method: 'GET',
                url: '/org/list',
                deserialize: (data) => JSON.parse(data).data
            });
            this.name = m.prop('');
            this.orgCode = m.prop('');
            this.ic = m.prop('');
            this.icActive = m.prop('');
            this.icDataURL = m.prop('');
            this.icActiveDataURL = m.prop('');
            this.fields = m.prop({});
        }
        validate () {
            var applyWith = (o, f) => (
                f(o),
                o
            );
            return [
                applyWith(this.name(), (v) => {
                    !v && this.errors({
                        name: '名称不能为空',
                    });
                }),
                applyWith(this.orgCode(), (v) => {
                    !v && this.errors({
                        orgCode: '组织不能为空',
                    });
                }),
                applyWith(this.ic(), (v) => {
                    !v && this.errors({
                        ic: '默认图标不能为空',
                    });
                }),
                applyWith(this.icActive(), (v) => {
                    !v && this.errors({
                        icActive: '激活图标不能为空',
                    });
                }),
                applyWith(this.fields(), (v) => {
                    _.isEmpty(v) && this.errors({
                        fields: '至少需要一个字段',
                    });
                })
            ].every(x => x);
        }
        save () {
            if (!this.validate()) {
                return false;
            }
            let data = new FormData();
            data.append('name', this.name());
            data.append('org_code', this.orgCode());
            data.append('fields', JSON.stringify(_(this.fields()).toPairs().value()));
            data.append('ic', this.ic());
            data.append('ic_active', this.icActive());
            var transport = m.prop();
            this.loading(true);
            NProgress.start();
            m.request({
                method: 'POST',
                url: '/poi-type/object',
                data: data,
                serialize: (v) => v,
                config: transport,
            }).then(() => {
                toastr.options.positionClass = "toast-bottom-center";
                toastr.options.timeOut = 1000;
                toastr.success('创建成功!');
                this.args.save({
                    name: this.name(),
                    orgCode: this.orgCode(),
                });
                this.init();
                this.$dropdownOrg.dropdown('clear');
            }, this.errors).then(() => {
                this.loading(false);
                NProgress.done();
            });
            var xhr = transport();
            xhr.onprogress = function (e) {
                if (e.lengthComputable) {
                    NProgress.set(e.loaded / e.total);
                }
            };
            return false;
        }
    },
    view: (ctrl, args) => (
        m('div', [
            m('.ui.top.attached.red.message', args.object()? "编辑信息点类型" + args.object().name: "创建信息点类型"),
            m('.ui.bottom.attached.segment', [
                m('form.ui.form', {
                    onsubmit: () => ctrl.save.apply(ctrl),
                    class: ctrl.loading()? 'loading': ''
                }, [
                    m('.field', [
                        m('label[for="input-name"]', '名称'),
                        m('input#input-name[type="text"][placeholder="请输入信息点名称"]', {
                            oninput: m.withAttr('value', ctrl.name),
                            value: ctrl.name(),
                        }),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().name)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().name) || ""),
                    ]),
                    m('.field', [
                        m('label[for="input-org-code"]', '组织'),
                        m('.ui.selection.dropdown#input-org-code', { config: poiTypeForm.config(ctrl) }, [
                            m('input[type="hidden"][name="org_code"]'),
                            m('i.dropdown.icon'),
                            m('.default.text', '选择组织'),
                            m('.menu', ctrl.orgs().map(
                                (org) => m(`.item[data-value="${org.code}"]`, org.name))),
                        ]),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().orgCode)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().orgCode) || ""),
                    ]),
                    m('.field', [
                        m('label', '字段'),
                        m.component(fieldEditor, {
                            fields: ctrl.fields
                        }),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().fields)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().fields) || ""),
                    ]),
                    m('.field', [
                        m('label', '默认图标'),
                        m('div', [
                            m.component(fileButton, {
                                file: (file) => {
                                    m.startComputation();
                                    ctrl.ic(file);
                                    let fr = new FileReader();
                                    fr.addEventListener('load', function () {
                                        ctrl.icDataURL(fr.result);
                                        m.endComputation();
                                        return false;
                                    }, false);
                                    fr.readAsDataURL(file);
                                }
                            }),
                            m('img.ui.tiny.bordered.image', {
                                src: ctrl.icDataURL() || '',
                                class: ctrl.icDataURL()? '': 'invisible',
                                style: {
                                    display: 'inline-block',
                                }
                            }),
                        ]),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().ic)? '': 'invisible',
                        }, (ctrl.errors() && ctrl.errors().ic) || ""),
                    ]),
                    m('.field', [
                        m('label', '激活状态图标'),
                        m('div', [
                            m.component(fileButton, {
                                file: (file) => {
                                    m.startComputation();
                                    ctrl.icActive(file);
                                    let fr = new FileReader();
                                    fr.addEventListener('load', function () {
                                        ctrl.icActiveDataURL(fr.result);
                                        m.endComputation();
                                        return false;
                                    }, false);
                                    fr.readAsDataURL(file);
                                }
                            }),
                            m('img.ui.tiny.bordered.image', {
                                src: ctrl.icActiveDataURL() || '',
                                class: ctrl.icActiveDataURL()? '': 'invisible',
                                style: {
                                    display: 'inline-block',
                                }
                            }),
                        ]),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().icActive)? '': 'invisible',
                        }, (ctrl.errors() && ctrl.errors().icActive) || ""),
                    ]),
                    m('input.ui.primary.button[type=submit][value="提交"]'),
                ])
            ])
        ])
    ),
    config: (ctrl) => function (element, isInitialized) {
        if (!isInitialized) {
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.dropdown !== 'undefined') {
                ctrl.$dropdownOrg = jQuery(element);
                ctrl.$dropdownOrg.dropdown({
                    onChange: function (value, text, $choice) {
                        ctrl.orgCode(value);
                    }
                });
            }
        }
    }
};

export var poiTypeList = {
    controller: function () {
        this.orgsMap = m.prop({});
        m.request({
            method: 'GET',
            url: '/org/list',
        }).then((data) => {
            data.data.forEach((org) => {
                this.orgsMap[org.code] = org.name;
            });
        });
    },
    view: (ctrl, args) => (
        m('.ui.list',   
          _(args.list()).groupBy((poiType) => poiType.orgCode).toPairs().map(
              ([orgCode, poiTypes]) => (
                  m('.item', [
                      m('i.icon.caret.right'),
                      m('.content', [
                          m('.header', ctrl.orgsMap[orgCode] || orgCode),
                          m('.list', poiTypes.map((t) => (
                              m('.item', [
                                  m('.content', [
                                      m('a[href="#"]', {
                                          onclick: (e) => {

                                          },
                                          style: {
                                              'padding-right': '1em',
                                          }
                                      }, t.name),
                                      m(`a[href="/poi-type/${orgCode}/${t.name}.zip"]`, [
                                          m('i.icon.download')
                                      ])
                                  ])
                              ])
                          )))
                      ])
                  ])
              )).value()
         )
    )
};
