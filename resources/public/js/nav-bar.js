export default {
    view: function (ctrl, args) {
        return (
                m('.ui.top.fixed.inverted.menu', [['/app', '应用'], 
                    ['/org', '组织'], ['/poi-type', '信息点类型'], 
                    ['/region', '上传数据']].map(([link, label]) => 
                        m('.item', [m(`a[href=${link}]`, label)])
                        ))
               );
    }
};

