export default {
    view: function (ctrl, active) {
        return (
                m('.ui.top.fixed.inverted.menu', [['/app', '应用'], 
                    ['/org', '组织'], ['/poi-type', '信息点类型'], 
                    ['/region', '上传数据']].map(([link, label]) => 
                        m('.item', {
                            class: active == link? 'active': ''
                        }, [m(`a[href=${link}]`, label)])
                        ))
               );
    }
};

