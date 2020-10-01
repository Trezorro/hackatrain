var RequestService = /** @class */ (function () {
    function RequestService(baseUrl) {
        this.baseUrl = baseUrl;
        this.client = new XMLHttpRequest();
    }
    RequestService.prototype.get = function (path, query, resolve, reject) {
        this.sendAsync('get', path, query, undefined, resolve, reject);
    };
    RequestService.prototype.createQueryParams = function (query) {
        var params = new URLSearchParams("");
        for (var key in query) {
            if (Object.prototype.hasOwnProperty.call(query, key)) {
                params.set(key, query[key]);
            }
        }
        return params;
    };
    RequestService.prototype.sendAsync = function (method, path, query, payload, resolve, reject) {
        var self = this;
        var url = self.baseUrl + path;
        if (query) {
            var params = self.createQueryParams(query);
            url += "?" + params.toString();
        }
        self.client.open(method, url);
        self.client.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var data = JSON.parse(this.response);
                resolve && resolve(data);
            }
            else {
                reject && reject('something went boomboom');
            }
        };
        this.client.onerror = function (err) {
            // There was a connection error of some sort
            reject && reject(err);
        };
        if (method === 'POST') {
            this.client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        this.client.send(payload);
    };
    return RequestService;
}());
var HeatMap = /** @class */ (function () {
    function HeatMap() {
    }
    return HeatMap;
}());
var OpenStreetMap = /** @class */ (function () {
    function OpenStreetMap(l) {
        var _this = this;
        this.l = l;
        this.initializeMap = function (lat, long) {
            _this.streetMap = _this.l.map('stationmap').setView([lat, long], 25);
            _this.l.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(_this.streetMap);
            // this.placeMarker(52.089, 5.107, 'A pretty CSS3 popup.<br> Easily customizable.');
        };
        this.placeMarker = function (lat, long, tag) {
            _this.l.marker([lat, long]).addTo(_this.streetMap)
                .bindPopup(tag)
                .openPopup();
        };
        this.drawBox = function (box) {
            var poly = _this.l.polygon([
                [box.start[0], box.start[1]],
                [box.end[0], box.end[1]]
            ]);
            poly.setStyle({ fillColor: '#FF0000' });
            poly.setStyle({ color: '#FF0000' });
            poly.addTo(_this.streetMap);
        };
    }
    return OpenStreetMap;
}());
var MeetingPointApplication = /** @class */ (function () {
    function MeetingPointApplication(l) {
        var _this = this;
        this.init = function () {
            _this.stationMap.initializeMap(52.0883, 5.11);
        };
        this.requestMeetingPoint = function () {
            _this.heatMapService.get("/meet");
        };
        this.requestOccupancy = function (timestamp) {
            _this.heatMapService.get("/map", {
                timestamp: timestamp.toISOString()
            }, function (response) {
                for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
                    var block = response_1[_i];
                    _this.stationMap.drawBox(block);
                }
            });
        };
        this.heatMapService = new RequestService('http://localhost:5555');
        this.stationMap = this.stationMap = new OpenStreetMap(l);
    }
    return MeetingPointApplication;
}());
window.application = new MeetingPointApplication(window.L);
window.onload = window.application.init;
//# sourceMappingURL=application.js.map