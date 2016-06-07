export var accountTree = {
    controller: function (args) {
        this.accounts = m.request({
            method: 'GET',
            url: '/region/accounts',
            deserialize: data => JSON.parse(data).data,
        }) ;
        this.orgCode2Name = m.prop({});
        m.request({
            method: 'GET',
            url: '/org/list',
        }).then((data) => {
            data.data.forEach((org) => {
                this.orgCode2Name[org.code] = org.name;
            });
        });
    },
    view: (ctrl, args) => (
        m('.ui.accordion', 
          {
            config: accountTree.config()
          }, 
          _(ctrl.accounts()).groupBy(a => a.orgCode).toPairs().map(
            ([orgCode, accounts]) => [
                m('.title', [
                    m('i.dropdown.icon'),
                ], (ctrl.orgCode2Name[orgCode] || orgCode) + `(${accounts.length})`),
                m('.content', [
                    m('.ui.list', accounts.map(
                        account => m('.item', [
                            m('a[href=#]', {
                                onclick: e => (
                                    args.select(account),
                                    false
                                ),
                            }, account.username),
                        ])
                    ))
                ])
            ]
        ).flatten().value())
    ),
    config: (ctrl) => function (element, isInitialized) {
        if (!isInitialized) {
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.dropdown !== 'undefined') {
                jQuery(element).accordion();
            }
        }
    },
};

export var regionList = {
    view: (ctrl, args) => (
        m('.ui.bulleted.divided.list', args.regions().map(
            region => m('.item', {
                style: {
                    'padding-top': '0.5em',
                    'padding-bottom': '0.5em',
                }
            }, [
                m(`a.header[href=${region.path}]`, {
                    style: {
                        'padding-left': '1em',
                        'padding-right': '1em',
                        display: 'inline-block',
                    }
                }, '重点区域' + region.name),
                m('i', '(最后上传于' + region.lastModified + ')'),
            ])
        ))
    )
};
