import { FaroWorker } from "./faroWorker";
import { AyamonteWorker } from "./ayamonteWorker";

class Main {
    constructor() {
        this.start();
    }

    private async start() {
        console.log("------ Faro ------");
        let faroWorker = new FaroWorker();
        let lowestPrice = await faroWorker.getLowestPrice();
        console.log({
            Nome: lowestPrice.Nome,
            Municipio: lowestPrice.Municipio,
            Preco: lowestPrice.Preco,
        });

        console.log("------ Ayamonte ------");
        let ayamonteWorker = new AyamonteWorker();
        let lowestPriceAyamonte = await ayamonteWorker.getGasolineLowestPrice();
        console.log({
            rotulo: lowestPriceAyamonte.rotulo,
            enlace_localidad: lowestPriceAyamonte.enlace_localidad,
            gasolina_95: lowestPriceAyamonte.gasolina_95 + "€",
        });

        console.log("------ Compare ------");
        console.log({
            Faro: lowestPrice.Preco,
            Ayamonte: lowestPriceAyamonte.gasolina_95 + "€",
            diff: (Math.abs(parseFloat(lowestPriceAyamonte.gasolina_95) - parseFloat(lowestPrice.Preco.replace(",", ".")))).toFixed(3).replace("-", "") + "€"
        });
    }
}

new Main();

