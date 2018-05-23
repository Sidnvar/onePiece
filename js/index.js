var _onePiece = {
    store: function (){
        localStorage.onePiece =  _onePiece.idArr;
        localStorage.onePieceTime = _onePiece.timeArr;
        localStorage.onePiecePrice = _onePiece.priceArr;
        localStorage.onePieceName = _onePiece.codeNameArr;

        _dataStore.code = localStorage.onePiece;
        _dataStore.time = localStorage.onePieceTime;
        _dataStore.price = localStorage.onePiecePrice;
        _dataStore.codeName = localStorage.onePieceName;
    },
    clear: function (){
        localStorage.removeItem('onePiece');
        localStorage.removeItem('onePieceTime');
        localStorage.removeItem('onePiecePrice');
        localStorage.removeItem('onePieceName');
    },
    NaU: function (){
        for(var i in _dataStore){
            if(typeof _dataStore[i] == 'undefined'){
                _dataStore[i] = '';
            }
        }

        _onePiece.idArr = _dataStore.code.split(',');
        _onePiece.timeArr = _dataStore.time.split(',');
        _onePiece.priceArr = _dataStore.price.split(',');
        _onePiece.codeNameArr = _dataStore.codeName.split(',');
    },
    createdTable: function(){
        if(_onePiece.idArr.length == 1){
            $('table > tbody').html('<tr><td colspan="5">暂无数据</td></tr>')
            return;
        }

        var html = '';
        for(var i = 1; i < _onePiece.idArr.length; i++){
            html += '<tr id="' + _onePiece.idArr[i] + '"><td>' + _onePiece.idArr[i] + '</td>' +
            '<td>' + _onePiece.codeNameArr[i] + '</td>' + 
            '<td>' + (_onePiece.timeArr[i] == '' || typeof _onePiece.timeArr[i] == 'undefined' ? '--' : _onePiece.timeArr[i]) + '</td>' + 
            '<td>' + (_onePiece.priceArr[i] == '' || typeof _onePiece.priceArr[i] == 'undefined' ? '--' : _onePiece.priceArr[i]) + '</td>' +
            '<td><a href="#" class="del">[删除]</a></td></tr>'
        }
        $('table > tbody').html(html);
        _onePiece.bindEvent();
    },
    addCode: function(){
        var code = $('#code').val(),
        buyingTime = $('#buyingTime').val(),
        price = $('#price').val();
        if(typeof _onePiece.idArr != 'undefined' && _onePiece.idArr.indexOf(code) != -1){
            return
        }
        var notBuyingDay = _onePiece.getMyDay(new Date(buyingTime));
        if(notBuyingDay){
            return
        }
        var BASE_URL = 'http://fund.eastmoney.com/' + code + '.html'
        $.ajax({
            url: BASE_URL,
            xhrFields: {
                withCredentials: true
             },
            success: function (html){
                var dom = $(html).find('.fundDetail-tit');
                dom.find('span').remove();
                var name = dom.find('div').text()

                _onePiece.idArr.push(code);
                _onePiece.timeArr.push(buyingTime);
                _onePiece.priceArr.push(price);
                _onePiece.codeNameArr.push(name)

                _onePiece.store();
                _onePiece.NaU();
                _onePiece.createdTable();
            }
        });
    },
    bindEvent: function (){
        // 删除基金
        $('.del').unbind('click').click(function (){

            var code = $(this).parent().parent().attr('id');
            var idx = _onePiece.idArr.indexOf(code)
            _onePiece.idArr.splice(idx, 1);
            _onePiece.timeArr.splice(idx, 1);
            _onePiece.priceArr.splice(idx, 1);
            _onePiece.codeNameArr.splice(idx, 1);
            _onePiece.store();
            _onePiece.createdTable();
        })
    },
    getMyDay: function(date){
        if(date.getDay()==0 || date.getDay()==6){
            return true
        }
    }
}

var _dataStore = {
    code: localStorage.onePiece,
    time: localStorage.onePieceTime,
    price: localStorage.onePiecePrice,
    codeName: localStorage.onePieceName,
}

// 添加基金
$('#add').click(function (){
    _onePiece.addCode();
});
// 重置表格
$('#reset').click(function (){
    if(confirm('确定重置表格吗')){
        _onePiece.clear();
        _onePiece.createdTable();
        $('table > tbody').html('<tr><td colspan="5">暂无数据</td></tr>')
    }

});


function start(){
    _onePiece.NaU();
    if(_onePiece.idArr.length < 0){
        return
    }
    _onePiece.createdTable();
}

start()
