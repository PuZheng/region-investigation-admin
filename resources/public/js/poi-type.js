import fileButton from './file-button.js';

var fieldEditor = {
    controller: class {
        constructor (args) {
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
                        if (ctrl.name() in (args.fields() || {})) {
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
            this.args = args;
            this.init();
        }
        init () {
            this.loading = m.prop();
            this.errors = m.prop();
            this.orgs = m.request({
                method: 'GET',
                url: 'org/list',
                deserialize: (data) => JSON.parse(data).data
            });
            this.icDataURL = m.prop('');
            this.icActiveDataURL = m.prop('');
        }
        validate () {
            var applyWith = (o, f) => (
                f(o),
                o
            );
            var o = this.args.object;
            return [
                applyWith(o.name(), (v) => {
                    !v && this.errors({
                        name: '名称不能为空',
                    });
                }),
                applyWith(o.orgCode(), (v) => {
                    !v && this.errors({
                        orgCode: '组织不能为空',
                    });
                }),
                applyWith(o.ic(), (v) => {
                    !v && this.errors({
                        ic: '默认图标不能为空',
                    });
                }),
                applyWith(o.icActive(), (v) => {
                    !v && this.errors({
                        icActive: '激活图标不能为空',
                    });
                }),
                applyWith(!_.isEmpty(o.fields()), (v) => {
                    !v && this.errors({
                        fields: '至少需要一个字段',
                    });
                })
            ].every(x => x);
        }
        save () {
            if (!this.validate()) {
                return false;
            }
            var o = this.args.object;
            let data = new FormData();
            data.append('name', o.name());
            data.append('org_code', o.orgCode());
            data.append('fields', JSON.stringify(_(o.fields()).toPairs().map(f => ({
                name: f[0],
                type: f[1],
            })).value()));
            // for PUT
            if (this.icDataURL()) {
                data.append('ic', o.ic());
            }
            if (this.icActiveDataURL()) {
                data.append('ic_active', o.icActive());
            }
            var transport = m.prop();
            this.loading(true);
            NProgress.start();
            m.request(o.key? {
                method: 'PUT',
                url: `poi-type/object/${o.orgCode()}/${o.name()}`,
                data: data,
                serialize: (v) => v,
                config: transport,
            }: {
                method: 'POST',
                url: 'poi-type/object',
                data: data,
                serialize: (v) => v,
                config: transport,
            }).then(() => {
                toastr.options.positionClass = "toast-bottom-center";
                toastr.options.timeOut = 1000;
                toastr.success(o.key? '修改成功': '创建成功!');
                if (!o.key) {
                    this.args.save({
                        name: o.name(),
                        orgCode: o.orgCode(),
                    });
                    this.init();
                    this.$dropdownOrg.dropdown('clear');
                }
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
            m('.ui.top.attached.red.message', 
              args.object.key? `编辑信息点类型(${args.object.name()})`: "创建信息点类型"),
            m('.ui.bottom.attached.segment', [
                m('form.ui.form', {
                    onsubmit: () => ctrl.save.apply(ctrl),
                    class: ctrl.loading()? 'loading': ''
                }, [
                    m('.field', [
                        m('label[for="input-name"]', '名称'),
                        m('input#input-name[type="text"][placeholder="请输入信息点名称"]', (() => {
                            let ret = {
                                oninput: m.withAttr('value', args.object.name),
                                value: args.object.name(),
                            };
                            if (args.object.key) {
                                ret.readonly = true;
                            }
                            return ret;
                        })()),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().name)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().name) || ""),
                    ]),
                    m('.field', [
                        m('label[for="input-org-code"]', '组织'),
                        m('.ui.selection.dropdown#input-org-code', { 
                            config: poiTypeForm.config(ctrl, args),
                            class: args.object.key? 'disabled': '',
                        }, [
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
                            fields: args.object.fields,
                        }),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().fields)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().fields) || ""),
                    ]),
                    m('.field', [
                        m('label', '默认图标(必须是PNG格式)'),
                        m('div', [
                            m.component(fileButton, {
                                text: '选择图片',
                                file: (file) => {
                                    m.startComputation();
                                    args.object.ic(file);
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
                                src: ctrl.icDataURL() || args.object.ic() || '',
                                class: ctrl.icDataURL() || args.object.ic()? '': 'invisible',
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
                        m('label', '激活状态图标(必须是PNG格式)'),
                        m('div', [
                            m.component(fileButton, {
                                text: '选择图片',
                                file: (file) => {
                                    m.startComputation();
                                    args.object.icActive(file);
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
                                src: ctrl.icActiveDataURL() || args.object.icActive() || '',
                                class: ctrl.icActiveDataURL() || args.object.icActive()? '': 'invisible',
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
                    m('button.ui.red.button', {
                        class: args.object.key? '': 'invisible',
                        onclick: function () {
                            swal({
                                type: 'warning',
                                title: '警告',
                                text: '你确认要删除改信息点类型?',
                                showCancelButton: true,
                                closeOnConfirm: false,
                            }, function (confirmed) {
                                m.request({
                                    method: 'DELETE',
                                    url: `poi-type/object/${args.object.orgCode()}/${args.object.name()}`,
                                }).then(() => {
                                    swal({
                                        type: 'success',
                                        title: '删除成功!',
                                    });
                                    args.remove({
                                        orgCode: args.object.orgCode(), 
                                        name: args.object.name()
                                    });
                                });
                            });
                            return false;
                        }
                    }, "删除"),
                ])
            ])
        ])
    ),
    config: (ctrl, args) => function (element, isInitialized) {
        if (!isInitialized) {
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.dropdown !== 'undefined') {
                ctrl.$dropdownOrg = jQuery(element);
                ctrl.$dropdownOrg.dropdown({
                    onChange: function (value, text, $choice) {
                        args.object.orgCode(value);
                    }
                });
            }
        } else {
            if (args.object.orgCode()) {
                ctrl.$dropdownOrg.dropdown('set selected', args.object.orgCode());
            }
        }
    }
};

export var poiTypeList = {
    controller: function () {
        this.orgsMap = m.prop({});
        m.request({
            method: 'GET',
            url: 'org/list',
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
                                                args.onselect(orgCode, t.name);
                                                return false;
                                          },
                                          style: {
                                              'padding-right': '1em',
                                          }
                                      }, t.name),
                                      m(`a[href="poi-type/${orgCode}/${t.name}.zip"]`, [
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
