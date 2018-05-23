// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('charts-body'));

var option = {
    title: {
        text: '业绩走势',
    },
    tooltip: {
        trigger: 'axis'
    },
    toolbox: {
        show: false,
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            dataView: {readOnly: false},
            magicType: {type: ['line', 'bar']},
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: ['周一','周二','周三','周四','周五','周六','周日']
    },
    yAxis: {
        type: 'value',
        min: 0.8
    },
    series: [
        {
            name:'白酒',
            type:'line',
            data:[1, -2.1, 2.5, 0.54, 3, 2, 0],
            markPoint: {
                data: [
                    {name: '买入', value: '买入', xAxis: ''}
                ]
            },  
            itemStyle:{
                normal:{
                    color: "#508CE4",
                    lineStyle:{
                        color: '#508CE4'
                    }
                }
            }
        }
    ]
};

var dateArr = [];
var priceArr = [];
var page = 1;
var profitObj = {  
    buy: {
        money: '',
        price: '',
        count: ''
    },
    sale: {
        price: '',
        money: ''
    }
}
function drwaChart(name, info, type,){
    if(typeof type == 'undefined'){
        dateArr = [];
        priceArr = [];
        page = 1;
    }

    var url = "http://fund.cmbchina.com/FundPages/OpenFund/OpenFundDetail.aspx?Channel=NetValue&FundID=" + name.id +"&PageNo=" + page;

    $.ajax({
        url: url,
        success:function (html){

            var items = $(html).find('.content_NoBorder tr');
            var isLastPage = items.length != 31;
            for(var i = 1; i < items.length; i++){
                var date = items.eq(i).find('td').eq(0).text();
                var price = items.eq(i).find('td').eq(1).text();
                dateArr.unshift($.trim(date));
                priceArr.unshift(price);
                // console.log($.trim(date) === $.trim(dateNum))
            }

            var isFind = dateArr.indexOf($.trim(info.dateNum));
            if(isFind == -1 && !isLastPage){
                page++;
                drwaChart(name, info, 'page');
            }else{
 
                option.xAxis.data = dateArr;
                option.series[0].data = priceArr;
                option.series[0].markPoint.data[0].xAxis = $.trim(info.dateNum);
                option.title.text = option.series[0].name = name.name;
                option.series[0].markPoint.data[0].yAxis = profitObj.buy.price = Number(priceArr[isFind]);
                
                option.yAxis.min = Math.min.apply(Math, priceArr)
    
                myChart.setOption(option);
                isFinshed();

                cal(info.money)
            }

        }
    });
}

function cal(money){
    profitObj.buy.money = Number(money);
    profitObj.buy.count = profitObj.buy.money / profitObj.buy.price;
    profitObj.sale.price = Number(priceArr[priceArr.length - 1]);
    profitObj.sale.money = profitObj.buy.count * profitObj.sale.price
    var infoDom = $('#charts-info');
    var par = ((profitObj.sale.price - profitObj.buy.price) / profitObj.buy.price * 100).toFixed(2)
    var profit = (profitObj.sale.money - profitObj.buy.money).toFixed(2)
    infoDom.find('.dataItem01 .dataNums span').html( isNaN(profitObj.buy.price) ? '--' : profitObj.buy.price.toFixed(4));
    infoDom.find('.dataItem02 .dataNums span').eq(0).html(profitObj.sale.price.toFixed(4));
    infoDom.find('.dataItem02 .dataNums span').eq(1).html(isNaN(profitObj.buy.price)  ? '--' : par + '%');
    infoDom.find('.dataItem03 .dataNums span').eq(0).html( isNaN(profit) ? '--' : profit);

    if(Number(profit) > 0){
        $('.dataItem03').removeClass('green');
        $('.dataItem02').removeClass('green');

        $('.dataItem03').addClass('red');
        $('.dataItem02').addClass('red');
    }else if(Number(profit) < 0){
        $('.dataItem03').removeClass('red');
        $('.dataItem02').removeClass('red');

        $('.dataItem03').addClass('green');
        $('.dataItem02').addClass('green');
    }
}

function clearChart(){
    myChart.clear();
}

function isLoading(){
    $('#charts-body').css('display', 'none');
    $('#charts-info').css('display', 'none');
    $('.loading').css('display', 'block');
}

function isFinshed(){
    $('#charts-body').css('display', 'block');
    $('#charts-info').css('display', 'block');
    $('.loading').css('display', 'none');
}
