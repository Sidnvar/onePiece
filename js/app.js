

var dataWorm = {
    html: {},
    localStorageData: '',
    localStorageDataName: '',
    idArr: [],
    codeNameArr: [],
    getPriceY: function (){
        var domY = dataWorm.html.find('.dataItem02 .dataNums span');
        var priceY = domY.eq(0).text();
        var perY = domY.eq(1).text();

        var domT = dataWorm.html.find('.dataItem01 .dataNums span');
        var priceT = domT.eq(1).text();
        var perT = domT.eq(2).text();
        
        return {
            priceY: priceY,
            perY: perY,
            priceT: priceT,
            perT: perT
        }
    },
    getName: function (){
        var dom = dataWorm.html.find('.fundDetail-tit');
        var str = dom.find('span').eq(1).text().replace(/[^0-9]/ig,"");
        var id = str.substring(0,6);
        dom.find('span').remove();
        var name = dom.find('div').text()
        
        return {
            id: id,
            name: name
        }
    },
    writeTable: function (name, price){
        var BASE_URL = 'http://fund.eastmoney.com/' + name.id + '.html'
        var perY = price.perY
        var isUpY = perY == 0 || perY == '--' ? '' : ( perY.indexOf('-') == -1 ? 'up' : 'down')
        var perT = price.perT
        var isUpT = perT == 0 || perT == '--' || perT == ' ' ? 'not' : ( perT.indexOf('-') == -1 ? 'up' : 'down')
        var html = '<tr id="' + name.id + '" title="' + name.id  + '">' +
                    '<td>' + name.id + '</td>' +
                    '<td>' + name.name + '</td>' +
                    // '<td>' + priceY.price + '</td>' +
                    '<td class="' + isUpY + '">' + (perY == ' ' ? '--' : perY)  + '<i class="icon"></i></td>' +
                    '<td class="' + isUpT + '">' + (perT == ' ' ? '--' : perT)  + '<i class="icon"></i></td>' +
                    '<td><a href="#" class="checked">[详情]</a>  <a class="del" href="#">[删]</a></td>'
                    '</tr>';
        $('#table > tbody').append($(html));
        dataWorm.bindEvent(name);
    },
    bindEvent: function (name){
        $('#' + name.id).find('.checked').click(function (){
            $('#charts').css('left', '0px');
            // 得到日期
            var idx = dataWorm.idArr.indexOf(name.id);

            var info = {
                dateNum: typeof localStorage.onePieceTime == 'undefined' ? '' : localStorage.onePieceTime.split(',')[idx],
                money: typeof localStorage.onePiecePrice == 'undefined' ? '' : localStorage.onePiecePrice.split(',')[idx]
            }


            isLoading();
            clearChart();
            drwaChart(name, info);
        });

        $('#' + name.id).find('.del').click(function (){
            var idx = dataWorm.idArr.indexOf(name.id)
            dataWorm.idArr.splice(idx, 1);
            localStorage.onePiece = dataWorm.idArr;
            dataWorm.dataInit();
            start();
        });
    },
    dataInit: function(){
        dataWorm.localStorageData = localStorage.onePiece || '';
        dataWorm.localStorageDataName = localStorage.onePieceName || '';
        dataWorm.idArr = dataWorm.idArr == [] ? [] : dataWorm.localStorageData.split(',');
        dataWorm.codeNameArr = dataWorm.codeNameArr == [] ? [] : dataWorm.localStorageDataName.split(',');
    }
}

function getInfo(id){
    var BASE_URL = 'http://fund.eastmoney.com/' + id + '.html'
    $.ajax({
        url: BASE_URL,
        xhrFields: {
            withCredentials: true
         },
        success: function (html){
            dataWorm.html = $(html)
            var name = dataWorm.getName();

            if(dataWorm.codeNameArr.indexOf(name.name) == -1){
                dataWorm.codeNameArr.push(name.name)
            }

            localStorage.onePieceName = dataWorm.codeNameArr

            var priceY = dataWorm.getPriceY();
            dataWorm.writeTable(name, priceY)
        }
    });
}

function start(){
    dataWorm.dataInit();

    if(dataWorm.idArr == ''){
        $('#table > tbody').html('<tr><td colspan="5">暂无数据</td></tr>');
        return
    }

    $('#table > tbody').html('');
    var date = new Date();
    var updateTime = date.toLocaleTimeString();
    $('#update-time').html('数据更新时间: ' + updateTime);
    for(var i = 0; i < dataWorm.idArr.length; i++){
        getInfo(dataWorm.idArr[i]);
    }
    // setTimeout( function() {
    //     start();
    // }, 1000 * 60 * 30)
}

start();

$('#add-btn').click(function (){
    var id = $('#id-code').val();

    if(dataWorm.idArr.indexOf(id) != -1){
        return
    }

    if(typeof localStorage.onePiece == 'undefined'){
        localStorage.onePiece = [];
    }
    dataWorm.idArr.push(id)
    localStorage.onePiece = dataWorm.idArr
    dataWorm.dataInit();
    start()
});

$('#close-chart').click(function (){
    $('#charts').css('left', '600px');
});

