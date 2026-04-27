import axios from "axios"
import { CompanySearch } from "./company"

interface SearchResponse{
    data: CompanySearch[];
}

export const searchCompanies = async (query: string) => {
    try{
        const data = await axios.get<SearchResponse>(
            `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${process.env.REACT_APP_API_KEY}`
        );
        return data;
    } catch(error) {
          if (error instanceof Error) {
            console.log("error message:", error.message);
            return error.message;
    }

    console.log("unexpected error:", error);
    return "An expected error has occured.";
    }
}