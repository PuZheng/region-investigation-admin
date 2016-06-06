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
            }
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
                    m('input[type="hidden"]'),
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
                jQuery(element).dropdown({
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
        constructor () {
            this.errors = m.prop();
            this.orgs = m.request({
                method: 'GET',
                url: '/org/list',
                deserialize: (data) => JSON.parse(data).data
            });
            this.ic = m.prop();
            this.icActive = m.prop();
            this.icDataURL = m.prop();
            this.icActiveDataURL = m.prop();
            this.fields = m.prop({1: 'string'});
        }
    },
    view: (ctrl, args) => (
        m('div', [
            m('.ui.top.attached.red.message', args.object()? "编辑信息点类型" + args.object().name: "创建信息点类型"),
            m('.ui.bottom.attached.segment', [
                m('form.ui.form', [
                    m('.field', [
                        m('label[for="input-name"]', '名称'),
                        m('input#input-name[type="text"][placeholder="请输入信息点名称"]'),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().name)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().name) || ""),
                    ]),
                    m('.field', [
                        m('label[for="input-org-code"]', '组织'),
                        m('.ui.selection.dropdown#input-org-code', { config: poiTypeForm.config() }, [
                            m('input[type="hidden"][name="org_code"]'),
                            m('i.dropdown.icon'),
                            m('.default.text', '选择组织'),
                            m('.menu', ctrl.orgs().map(
                                (org) => m(`.item[data-value="${org.code}"]`, org.name))),
                        ]),
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().code)? "": "invisible",
                        }, (ctrl.errors() && ctrl.errors().code) || ""),
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
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().ic)? '': 'invisible',
                        }, (ctrl.errors() && ctrl.errors().ic) || ""),
                    ]),
                    m('.field', [
                        m('label', '激活状态图标'),
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
                        m('.ui.pointing.red.basic.label', {
                            class: (ctrl.errors() && ctrl.errors().icActive)? '': 'invisible',
                        }, (ctrl.errors() && ctrl.errors().icActive) || ""),
                    ]),
                    m('input.ui.primary.button[type=submit][value="提交"]'),
                ])
            ])
        ])
    ),
    config: () => function (element, isInitialized) {
            if (!isInitialized) {
                if (typeof jQuery !== 'undefined' && typeof jQuery.fn.dropdown !== 'undefined') {
                    jQuery(element).dropdown();
                }
            }
    }
};

export var poiTypeList = {
    view: (ctrl, args) => (
        m('.ui.list',   
          _(args.list()).groupBy((poiType) => poiType.orgCode).toPairs().map(
              ([org, poiTypes]) => (
                  m('.item', [
                      m('i.icon.caret.right'),
                      m('.content', [
                          m('.header', org),
                          m('.list', poiTypes.map((t) => (
                              m('.item', [
                                  m('.content', [
                                      m('a[href="#"]', {
                                          onclick: (e) => {

                                          }
                                      }, t.name)
                                  ])
                              ])
                          )))
                      ])
                  ])
              )).value()
         )
    )
};
