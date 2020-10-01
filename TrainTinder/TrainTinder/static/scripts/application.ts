class RequestService {
    client: XMLHttpRequest;

    constructor(private baseUrl: string) {

        this.client = new XMLHttpRequest();
    }

    public get<T>(path: string, query?: any, resolve?: (response: T) => any, reject?: (error: any) => any) {
        this.sendAsync('get', path, query,undefined, resolve, reject);
    }


    private createQueryParams(query?: any): URLSearchParams {

        var params = new URLSearchParams("");
        for (var key in query) {
            if (Object.prototype.hasOwnProperty.call(query, key)) {
                params.set(key, query[key]);
            }
        }
        return params;
    }

    private sendAsync<T>(method: string,
        path: string,
        query?: any,
        payload?: any,
        resolve?: (response: T) => any,
        reject?: (error: any) => any): void {
        var self = this;
        var url = self.baseUrl + path;
        if (query) {
            var params = self.createQueryParams(query);
            url += `?${params.toString()}`;
        }

        self.client.open(method, url);

        self.client.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                const data = JSON.parse(this.response) as Response;
                resolve && resolve(data as any as T);
            } else {
                reject && reject('something went boomboom')
            }
        };

        this.client.onerror = err => {
            // There was a connection error of some sort
            reject && reject(err);
        };
        if (method === 'POST') {
            this.client.setRequestHeader(
                'Content-Type',
                'application/x-www-form-urlencoded; charset=UTF-8');
        }
       
        this.client.send(payload);
    }
}

class HeatMap {
    public weight: number;
    public start: number[];
    public end: number[];
}

class OpenStreetMap {

    streetMap: any;

    constructor(private l: any) {
    }

    public initializeMap = (lat: number, long: number): void => {
        this.streetMap = this.l.map('stationmap').setView([lat, long], 25);
        this.l.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.streetMap);
       
    }

    public placeMarker = (lat: number, long: number, tag: string): void => {
        this.l.marker([lat, long]).addTo(this.streetMap)
            .bindPopup(tag)
            .openPopup();
    }

    public drawBox = (box: HeatMap): void => {
        let poly = this.l.polygon([
            [box.start[0], box.start[1]],
            [box.end[0], box.end[1]]
        ])
        poly.setStyle({ fillColor: '#FF0000' });
        poly.setStyle({ color: '#FF0000' });


        poly.addTo(this.streetMap);
    }
}


class MeetingPointApplication {

    public heatMapService: RequestService;
    public stationMap: OpenStreetMap;

    constructor(l: any) {
        this.heatMapService = new RequestService('http://localhost:5555');
        this.stationMap = this.stationMap = new OpenStreetMap(l);
    }

    public init = (): void => {
        this.stationMap.initializeMap(52.0883, 5.11);
    }

    public requestMeetingPoint = (): void => {
        this.heatMapService.get<any>("/meet",undefined, () => {
            this.stationMap.placeMarker();
        });
    }


    public requestOccupancy= (timestamp: Date): void => {
        this.heatMapService.get<HeatMap[]>("/map",
            {
                timestamp: timestamp.toISOString()
            },
            (response) => {
                for (var block of response) {
                    this.stationMap.drawBox(block);
                }
            });
    }
}


(window as any).application = new MeetingPointApplication((window as any).L);
window.onload = (window as any).application.init;