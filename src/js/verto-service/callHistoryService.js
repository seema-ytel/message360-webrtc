var callHistory = angular.module("vertoService").factory("callHistory", function(storage) {

    var clear = function() {
        storage.data.callHistory = [];
        return storage.data.callHistory;
    }
    var add = function( data ) {
        var str = data.calltype;
        var calltype = str.substring(0,1).toUpperCase()+str.substring(1,str.length);
        if(calltype.toLowerCase() == "inbound"){
            var info = {
                "num": data.callerIdNumber,
                "calltype":calltype,
                "date": data.date,
                "time": data.time,
                "callsid" : data.callsid
            };
        }else{
            var info = {
                "num": data.num,
                "calltype":calltype,
                "date": data.date,
                "time": data.time,
                "callsid" : data.callsid
            };
        }
        storage.data.callHistory.push(info);
    };

    return {
        "add": add,
        "clear": clear
    }
});

callHistory.$inject = ['storage'];
