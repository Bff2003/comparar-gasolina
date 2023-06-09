import axios from "axios";
import * as fs from "fs";
import * as xml2js from "xml2js";

interface PostoJsonKomparing {
    num: string;
    lat: string;
    lng: string;
    tipo: string;
    icono: string;
    provincia: string;
    localidad: string;
    direcc: string;
    rotulo: string;
    horario: string;
    gasolina_95: string;
    gasolina_95_especial: string;
    gasolina_95_e10: string;
    gasolina_98: string;
    gasolina_98_especial: string;
    gasoleo_A_normal: string;
    gasoleo_A_especial: string;
    gasoleo_B: string;
    gasoleo_C: string;
    biodiesel: string;
    bioetanol: string;
    gas_licuado_petroleo: string;
    gas_natural_comprimido: string;
    enlace_rotulo: string;
    enlace_localidad: string;
    fecha_precio: string;
    gasolinera_publica: string;
    carburant_order: string;
    gasolinera_telefono: string;
    pais: string;
    css_marker1: string;
    css_marker2: string;
}

interface PostoJson {
    $: PostoJsonKomparing;
}

export class AyamonteWorker {

    public static dataFile = `./data/ayamonte/ayamonte-${new Date().toISOString().split("T")[0]}.json`;

    constructor() {}

    private async getDataRequest() {
        let data = await axios.get(
            "https://www.komparing.com/pt/combustiveis/include/process-xml_maxLat-37.3303795445218_minLat-37.10058359784848_maxLong--7.238768005371095_minLong--7.573548889160157_zoomMapa-11_order-gsA_gsAe"
        );
        if (data.status !== 200)
            throw new Error("Error getting data from API");
        return xml2js.parseStringPromise(data.data);
    }

    private async getJsonFile(filename: string) {
        let json = fs.readFileSync(filename, "utf8");
        return JSON.parse(json);
    }

    public async getData(): Promise<PostoJson[]> {
        let data = null;

        if (fs.existsSync(AyamonteWorker.dataFile)) {
            data = await this.getJsonFile(AyamonteWorker.dataFile);
        } else {
            data = await this.getDataRequest();
            fs.writeFileSync(AyamonteWorker.dataFile, JSON.stringify(data));
        }

        return data.marcas.marker;
    }

    public async getGasolineLowestPrice(): Promise<PostoJsonKomparing> {
        let result: PostoJson[] = await this.getData();

        // remove all the gas stations that don't have gasoline_95 (gasolina_95 = 0.000)
        result = result.filter((posto) => {
            return posto.$.gasolina_95 !== "0.000";
        }); 

        let lowestPrice = result.reduce((prev, current) => {
            let prevPrice = parseFloat(prev.$.gasolina_95);
            let currentPrice = parseFloat(current.$.gasolina_95);

            if (prevPrice < currentPrice) return prev;
            else return current;
        });

        return lowestPrice.$;
    }
}
