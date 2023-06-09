import axios from "axios";
import * as fs from "fs";

interface PostoJsonDGEG {
    Id: number;
    Nome: string;
    TipoPosto: string;
    Municipio: string;
    Preco: string;
    Marca: string;
    Combustivel: string;
    DataAtualizacao: string;
    Distrito: string;
    Morada: string;
    Localidade: string;
    CodPostal: string;
    Latitude: number;
    Longitude: number;
    Quantidade: number;
}

export class FaroWorker {

    public static dataFile = `./data/faro/faro-${new Date().toISOString().split("T")[0]}.json`;

    constructor() {}

    private async getDataRequest() {
        let data = await axios.get(
            "https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb/PesquisarPostos?idsTiposComb=3201&idMarca=&idTipoPosto=&idDistrito=8&idsMunicipios=108%2C113&qtdPorPagina=50&pagina=1"
        );
        if (data.status !== 200 || data.data.status === false)
            throw new Error("Error getting data from API");
        return data.data;
    }

    private async getJsonFile(filename: string) {
        let json = fs.readFileSync(filename, "utf8");
        return JSON.parse(json);
    }

    public async getData(): Promise<PostoJsonDGEG[]> {
        let data = null;

        if (fs.existsSync(FaroWorker.dataFile)) {
            data = await this.getJsonFile(FaroWorker.dataFile);
        } else {
            data = await this.getDataRequest();
            fs.writeFileSync(FaroWorker.dataFile, JSON.stringify(data));
        }

        let result: PostoJsonDGEG[] = data.resultado;
        return result;
    }

    public async getLowestPrice(): Promise<PostoJsonDGEG> {
        let result = await this.getData();
        let lowestPrice = result.reduce(
            (prev: PostoJsonDGEG, curr: PostoJsonDGEG) => {
                let prevPrice = parseFloat(
                    prev.Preco.replace(",", ".").replace(" €", "")
                );
                let currPrice = parseFloat(
                    curr.Preco.replace(",", ".").replace(" €", "")
                );
                return prevPrice < currPrice ? prev : curr;
            }
        );

        return lowestPrice;
    }
}
